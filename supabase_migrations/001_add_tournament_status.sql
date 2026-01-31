-- Migration: Add tournament_status column to tournaments table
-- Run this in Supabase SQL Editor

-- Add tournament_status column
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS tournament_status VARCHAR(30) DEFAULT 'unknown';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(tournament_status);

-- Comment for documentation
COMMENT ON COLUMN tournaments.tournament_status IS 'Status from n01darts.com: accepting_entries, making_brackets, in_session, completed, unknown';
