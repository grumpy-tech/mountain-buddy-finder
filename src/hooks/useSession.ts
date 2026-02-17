import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId, generateSessionCode } from '@/lib/device';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface SessionMember {
  id: string;
  username: string;
  device_id: string;
  latitude: number | null;
  longitude: number | null;
  last_seen: string | null;
}

export interface Session {
  id: string;
  code: string;
  created_at: string;
  expires_at: string;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<SessionMember[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceId = getDeviceId();

  // Create a new session
  const createSession = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const code = generateSessionCode();

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({ code })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { data: memberData, error: memberError } = await supabase
        .from('session_members')
        .insert({
          session_id: sessionData.id,
          username,
          device_id: deviceId,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      setSession(sessionData);
      setMemberId(memberData.id);
      setMembers([memberData]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Join existing session
  const joinSession = useCallback(async (code: string, username: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select()
        .eq('code', code.toUpperCase())
        .single();

      if (sessionError) throw new Error('Session not found. Check your code.');

      const { data: memberData, error: memberError } = await supabase
        .from('session_members')
        .insert({
          session_id: sessionData.id,
          username,
          device_id: deviceId,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Fetch existing members
      const { data: existingMembers } = await supabase
        .from('session_members')
        .select()
        .eq('session_id', sessionData.id);

      setSession(sessionData);
      setMemberId(memberData.id);
      setMembers(existingMembers || [memberData]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Update own location
  const updateLocation = useCallback(async (lat: number, lng: number) => {
    if (!memberId) return;

    await supabase
      .from('session_members')
      .update({
        latitude: lat,
        longitude: lng,
        last_seen: new Date().toISOString(),
      })
      .eq('id', memberId);
  }, [memberId]);

  // Leave session
  const leaveSession = useCallback(async () => {
    if (memberId) {
      await supabase
        .from('session_members')
        .delete()
        .eq('id', memberId);
    }
    setSession(null);
    setMembers([]);
    setMemberId(null);
  }, [memberId]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_members',
          filter: `session_id=eq.${session.id}`,
        },
        (payload: RealtimePostgresChangesPayload<SessionMember>) => {
          if (payload.eventType === 'INSERT') {
            const newMember = payload.new as SessionMember;
            setMembers(prev => {
              if (prev.find(m => m.id === newMember.id)) return prev;
              return [...prev, newMember];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as SessionMember;
            setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Partial<SessionMember>;
            setMembers(prev => prev.filter(m => m.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return {
    session,
    members,
    memberId,
    loading,
    error,
    createSession,
    joinSession,
    updateLocation,
    leaveSession,
  };
}
