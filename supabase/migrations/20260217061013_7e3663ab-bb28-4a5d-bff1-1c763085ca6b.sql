
-- Sessions table: each ski day session
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '18 hours')
);

-- Session members: people in a session with their location
CREATE TABLE public.session_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  device_id TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, device_id)
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_members ENABLE ROW LEVEL SECURITY;

-- Sessions are public (no auth, temporary data)
CREATE POLICY "Anyone can create sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view sessions" ON public.sessions FOR SELECT USING (true);

-- Session members are public (no auth, identified by device_id)
CREATE POLICY "Anyone can join sessions" ON public.session_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view session members" ON public.session_members FOR SELECT USING (true);
CREATE POLICY "Members can update their own location" ON public.session_members FOR UPDATE USING (true);
CREATE POLICY "Members can leave sessions" ON public.session_members FOR DELETE USING (true);

-- Enable realtime for location tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_members;

-- Index for fast session code lookups
CREATE INDEX idx_sessions_code ON public.sessions(code);
CREATE INDEX idx_session_members_session ON public.session_members(session_id);
