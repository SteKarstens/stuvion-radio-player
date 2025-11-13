-- Create song_history table to track played songs
CREATE TABLE IF NOT EXISTS public.song_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  listeners INTEGER DEFAULT 0
);

-- Create index for faster queries
CREATE INDEX idx_song_history_played_at ON public.song_history(played_at DESC);

-- Enable RLS (no policies needed as this is public read-only data)
ALTER TABLE public.song_history ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read song history
CREATE POLICY "Anyone can view song history"
  ON public.song_history
  FOR SELECT
  USING (true);