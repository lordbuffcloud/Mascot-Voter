-- Mascot Voting App Database Schema
-- Run this in your Supabase SQL editor

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL
);

-- Create mascot_suggestions table
CREATE TABLE IF NOT EXISTS mascot_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES mascot_suggestions(id) ON DELETE CASCADE,
  user_session TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, suggestion_id, user_session)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_room_id ON mascot_suggestions(room_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON mascot_suggestions(created_at);
CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_suggestion_id ON votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_session ON votes(user_session);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE mascot_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this is a voting app)
CREATE POLICY "Allow public read access to rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to rooms" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to rooms" ON rooms
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to suggestions" ON mascot_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to suggestions" ON mascot_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to votes" ON votes
  FOR DELETE USING (true);

-- Create a function to get vote counts for a room
CREATE OR REPLACE FUNCTION get_vote_counts(room_id_param TEXT)
RETURNS TABLE(suggestion_id UUID, vote_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.suggestion_id,
    COUNT(v.id) as vote_count
  FROM votes v
  WHERE v.room_id = room_id_param
  GROUP BY v.suggestion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_vote_counts(TEXT) TO anon, authenticated;