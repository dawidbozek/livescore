-- =============================================
-- Supabase Schema for Live Score System
-- Mistrzostwa Polski w Darcie
-- =============================================

-- Tabela turniejów
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    n01_url TEXT NOT NULL,
    tournament_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    dart_type VARCHAR(10) DEFAULT 'steel',
    category VARCHAR(20),
    start_time TIME,
    entry_fee VARCHAR(50),
    prizes TEXT,
    format VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_dart_type CHECK (dart_type IN ('soft', 'steel')),
    CONSTRAINT check_category CHECK (category IS NULL OR category IN ('indywidualny', 'deblowy', 'triple_mieszane', 'druzynowy'))
);

-- Tabela meczów
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    n01_match_id VARCHAR(100),
    player1_name VARCHAR(255) NOT NULL,
    player2_name VARCHAR(255) NOT NULL,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    station_number INTEGER,
    referee VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'finished', 'walkover')),
    raw_html TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela ustawień admina
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_updated_at ON matches(updated_at);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(tournament_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_active ON tournaments(is_active);

-- Unikalny indeks na n01_match_id w ramach turnieju
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_n01
ON matches(tournament_id, n01_match_id)
WHERE n01_match_id IS NOT NULL;

-- Trigger do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery dla tabel
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Włączenie RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Polityki dla tournaments
DROP POLICY IF EXISTS "Allow public read access to tournaments" ON tournaments;
CREATE POLICY "Allow public read access to tournaments"
ON tournaments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow service role full access to tournaments" ON tournaments;
CREATE POLICY "Allow service role full access to tournaments"
ON tournaments FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Polityki dla matches
DROP POLICY IF EXISTS "Allow public read access to matches" ON matches;
CREATE POLICY "Allow public read access to matches"
ON matches FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow service role full access to matches" ON matches;
CREATE POLICY "Allow service role full access to matches"
ON matches FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Polityki dla admin_settings (tylko service_role)
DROP POLICY IF EXISTS "Allow service role full access to admin_settings" ON admin_settings;
CREATE POLICY "Allow service role full access to admin_settings"
ON admin_settings FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- Dane początkowe
-- =============================================

-- Hasło admina (DartsMP2026!)
INSERT INTO admin_settings (key, value)
VALUES ('admin_password', 'DartsMP2026!')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- Pomocnicze funkcje
-- =============================================

-- Funkcja do pobierania meczów z danego dnia
CREATE OR REPLACE FUNCTION get_matches_by_date(match_date DATE)
RETURNS TABLE (
    id UUID,
    tournament_id UUID,
    tournament_name VARCHAR,
    n01_match_id VARCHAR,
    player1_name VARCHAR,
    player2_name VARCHAR,
    player1_score INTEGER,
    player2_score INTEGER,
    station_number INTEGER,
    referee VARCHAR,
    status VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.tournament_id,
        t.name AS tournament_name,
        m.n01_match_id,
        m.player1_name,
        m.player2_name,
        m.player1_score,
        m.player2_score,
        m.station_number,
        m.referee,
        m.status,
        m.updated_at
    FROM matches m
    JOIN tournaments t ON m.tournament_id = t.id
    WHERE t.tournament_date = match_date
    AND t.is_active = true
    ORDER BY
        CASE m.status
            WHEN 'active' THEN 1
            WHEN 'pending' THEN 2
            WHEN 'finished' THEN 3
            WHEN 'walkover' THEN 4
        END,
        m.station_number NULLS LAST,
        m.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRACJA v2 - Nowe pola turniejów
-- Wykonaj poniższe komendy ręcznie w Supabase SQL Editor
-- jeśli baza danych już istnieje
-- =============================================

-- ALTER TABLE tournaments
-- ADD COLUMN IF NOT EXISTS dart_type VARCHAR(10) DEFAULT 'steel',
-- ADD COLUMN IF NOT EXISTS category VARCHAR(20),
-- ADD COLUMN IF NOT EXISTS start_time TIME,
-- ADD COLUMN IF NOT EXISTS entry_fee VARCHAR(50),
-- ADD COLUMN IF NOT EXISTS prizes TEXT,
-- ADD COLUMN IF NOT EXISTS format VARCHAR(100),
-- ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ALTER TABLE tournaments
-- ADD CONSTRAINT check_dart_type CHECK (dart_type IN ('soft', 'steel'));

-- ALTER TABLE tournaments
-- ADD CONSTRAINT check_category CHECK (category IS NULL OR category IN ('indywidualny', 'deblowy', 'triple_mieszane', 'druzynowy'));
