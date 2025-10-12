-- Create tables for multiplayer presence and chat

-- User presence in rooms (hallway or classroom)
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('hallway', 'classroom')),
  room_id TEXT,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  position_z FLOAT NOT NULL DEFAULT 0,
  rotation_y FLOAT NOT NULL DEFAULT 0,
  is_sitting BOOLEAN DEFAULT FALSE,
  seat_index INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, room_type, room_id)
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Everyone can see presence
CREATE POLICY "Anyone can view presence"
  ON public.user_presence
  FOR SELECT
  USING (true);

-- Users can update their own presence
CREATE POLICY "Users can update own presence"
  ON public.user_presence
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own presence data"
  ON public.user_presence
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own presence"
  ON public.user_presence
  FOR DELETE
  USING (true);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('hallway', 'classroom')),
  room_id TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Everyone can view messages in their room
CREATE POLICY "Anyone can view messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- Anyone can send messages
CREATE POLICY "Anyone can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to clean up stale presence (older than 30 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_presence
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$;