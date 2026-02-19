import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, LogOut, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SkiMap, { type SkiMapHandle } from '@/components/SkiMap';
import MemberList from '@/components/MemberList';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Session, SessionMember } from '@/hooks/useSession';
import { toast } from 'sonner';

interface SessionViewProps {
  session: Session;
  members: SessionMember[];
  memberId: string | null;
  onUpdateLocation: (lat: number, lng: number) => void;
  onLeave: () => void;
}

export default function SessionView({
  session,
  members,
  memberId,
  onUpdateLocation,
  onLeave,
}: SessionViewProps) {
  const geo = useGeolocation(true);
  const mapRef = useRef<SkiMapHandle>(null);

  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      onUpdateLocation(geo.latitude, geo.longitude);
    }
  }, [geo.latitude, geo.longitude, onUpdateLocation]);

  const copyCode = () => {
    navigator.clipboard.writeText(session.code);
    toast.success('Code copied! Share it with your crew.');
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my ski session!',
          text: `Join me on the mountain! Code: ${session.code}`,
        });
      } catch {
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  const handleMemberClick = (id: string) => {
    mapRef.current?.centerOnMember(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[100dvh] bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-sm font-display font-bold text-foreground">Big White</h1>
            <p className="text-xs text-muted-foreground">
              {members.length} rider{members.length !== 1 ? 's' : ''} • {geo.error ? 'GPS error' : geo.loading ? 'Getting location...' : 'Tracking'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={shareCode}
            className="tap-target font-display text-xs gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span className="font-bold tracking-wider">{session.code}</span>
            <Copy className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onLeave}
            className="tap-target text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Member pills */}
      <div className="px-3 py-2 bg-card/50">
        <MemberList members={members} myMemberId={memberId} onMemberClick={handleMemberClick} />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <SkiMap ref={mapRef} members={members} myMemberId={memberId} />
        {geo.error && (
          <div className="absolute bottom-4 left-4 right-4 bg-destructive/90 text-destructive-foreground text-sm p-3 rounded-lg text-center backdrop-blur-sm">
            📍 {geo.error} — Enable location in your browser settings
          </div>
        )}
      </div>
    </motion.div>
  );
}
