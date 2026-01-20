import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Pobiera aktywne turnieje na dany dzień
 * @param {Date} date - Data turnieju
 * @returns {Promise<Array>} Lista turniejów
 */
export async function getActiveTournaments(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('tournament_date', dateStr)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera wszystkie turnieje na dany dzień (także nieaktywne)
 * @param {Date} date - Data turnieju
 * @returns {Promise<Array>} Lista turniejów
 */
export async function getAllTournaments(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('tournament_date', dateStr)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }

    return data || [];
}

/**
 * Dodaje nowy turniej
 * @param {Object} tournament - Dane turnieju
 * @returns {Promise<Object>} Dodany turniej
 */
export async function addTournament(tournament) {
    const { data, error } = await supabase
        .from('tournaments')
        .insert({
            name: tournament.name,
            n01_url: tournament.n01_url,
            tournament_date: tournament.tournament_date,
            is_active: tournament.is_active ?? true
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding tournament:', error);
        throw error;
    }

    return data;
}

/**
 * Aktualizuje turniej
 * @param {string} id - ID turnieju
 * @param {Object} updates - Dane do aktualizacji
 * @returns {Promise<Object>} Zaktualizowany turniej
 */
export async function updateTournament(id, updates) {
    const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating tournament:', error);
        throw error;
    }

    return data;
}

/**
 * Usuwa turniej
 * @param {string} id - ID turnieju
 * @returns {Promise<void>}
 */
export async function deleteTournament(id) {
    const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting tournament:', error);
        throw error;
    }
}

/**
 * Zapisuje lub aktualizuje mecze (upsert)
 * @param {string} tournamentId - ID turnieju
 * @param {Array} matches - Lista meczów do zapisania
 * @returns {Promise<Array>} Zapisane mecze
 */
export async function upsertMatches(tournamentId, matches) {
    if (!matches || matches.length === 0) {
        return [];
    }

    const matchesWithTournamentId = matches.map(match => ({
        tournament_id: tournamentId,
        n01_match_id: match.n01_match_id,
        player1_name: match.player1_name,
        player2_name: match.player2_name,
        player1_score: match.player1_score || 0,
        player2_score: match.player2_score || 0,
        station_number: match.station_number,
        referee: match.referee,
        status: match.status || 'pending',
        raw_html: match.raw_html
    }));

    const { data, error } = await supabase
        .from('matches')
        .upsert(matchesWithTournamentId, {
            onConflict: 'tournament_id,n01_match_id',
            ignoreDuplicates: false
        })
        .select();

    if (error) {
        console.error('Error upserting matches:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera mecze dla turnieju
 * @param {string} tournamentId - ID turnieju
 * @returns {Promise<Array>} Lista meczów
 */
export async function getMatchesByTournament(tournamentId) {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('station_number', { ascending: true, nullsFirst: false })
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera mecze na dany dzień ze wszystkich aktywnych turniejów
 * @param {Date} date - Data
 * @returns {Promise<Array>} Lista meczów z nazwami turniejów
 */
export async function getMatchesByDate(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            tournament:tournaments!inner(
                id,
                name,
                tournament_date,
                is_active
            )
        `)
        .eq('tournament.tournament_date', dateStr)
        .eq('tournament.is_active', true)
        .order('station_number', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('Error fetching matches by date:', error);
        throw error;
    }

    return data || [];
}

/**
 * Usuwa wszystkie mecze dla turnieju
 * @param {string} tournamentId - ID turnieju
 * @returns {Promise<void>}
 */
export async function deleteMatchesByTournament(tournamentId) {
    const { error } = await supabase
        .from('matches')
        .delete()
        .eq('tournament_id', tournamentId);

    if (error) {
        console.error('Error deleting matches:', error);
        throw error;
    }
}

/**
 * Pobiera hasło admina
 * @returns {Promise<string|null>} Hasło lub null
 */
export async function getAdminPassword() {
    const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();

    if (error) {
        console.error('Error fetching admin password:', error);
        return null;
    }

    return data?.value || null;
}

/**
 * Zmienia hasło admina
 * @param {string} newPassword - Nowe hasło
 * @returns {Promise<void>}
 */
export async function setAdminPassword(newPassword) {
    const { error } = await supabase
        .from('admin_settings')
        .upsert({
            key: 'admin_password',
            value: newPassword
        }, {
            onConflict: 'key'
        });

    if (error) {
        console.error('Error setting admin password:', error);
        throw error;
    }
}

/**
 * Oznacza mecze jako zakończone, które nie zostały znalezione w ostatnim scrapie
 * @param {string} tournamentId - ID turnieju
 * @param {Array<string>} activeMatchIds - Lista aktywnych n01_match_id
 * @returns {Promise<void>}
 */
export async function markMissingMatchesAsFinished(tournamentId, activeMatchIds) {
    if (!activeMatchIds || activeMatchIds.length === 0) {
        return;
    }

    const { error } = await supabase
        .from('matches')
        .update({ status: 'finished' })
        .eq('tournament_id', tournamentId)
        .in('status', ['active', 'pending'])
        .not('n01_match_id', 'in', `(${activeMatchIds.map(id => `"${id}"`).join(',')})`);

    if (error) {
        console.error('Error marking missing matches as finished:', error);
    }
}
