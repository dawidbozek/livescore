-- Migration: Create tournament_stats table for Steel tournament statistics
-- Run this in Supabase SQL Editor

-- Create tournament_stats table
CREATE TABLE IF NOT EXISTS tournament_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    player_id VARCHAR(50),

    -- Match stats
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,

    -- Leg stats
    legs_played INTEGER DEFAULT 0,
    legs_won INTEGER DEFAULT 0,

    -- Score highlights
    scores_100_plus INTEGER DEFAULT 0,
    scores_140_plus INTEGER DEFAULT 0,
    scores_180 INTEGER DEFAULT 0,

    -- Best performances
    high_finish INTEGER,
    best_leg INTEGER,
    worst_leg INTEGER,

    -- Averages
    avg_3_darts DECIMAL(5,2),
    avg_first_9 DECIMAL(5,2),

    -- Totals for calculating averages
    total_score INTEGER DEFAULT 0,
    total_darts INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one stats row per player per tournament
    UNIQUE(tournament_id, player_name)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tournament_stats_tournament ON tournament_stats(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_stats_avg ON tournament_stats(avg_3_darts DESC);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_tournament_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tournament_stats_updated_at ON tournament_stats;
CREATE TRIGGER tournament_stats_updated_at
    BEFORE UPDATE ON tournament_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_tournament_stats_updated_at();

-- Comment for documentation
COMMENT ON TABLE tournament_stats IS 'Player statistics from completed Steel tournaments (scraped from t_stats.html)';
