-- Add new columns to votes table for better vote tracking
ALTER TABLE votes 
ADD COLUMN user_ip TEXT,
ADD COLUMN user_name TEXT;

-- Create index for better performance on IP-based queries
CREATE INDEX idx_votes_ip_room_suggestion ON votes(room_id, suggestion_id, user_ip);

-- Update existing votes to have placeholder values (optional)
UPDATE votes 
SET user_ip = 'migrated', 
    user_name = 'Anonymous' 
WHERE user_ip IS NULL;