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
 * Pobiera wszystkie aktywne turnieje (bez filtrowania po dacie)
 * @returns {Promise<Array>} Lista turniejów
 */
export async function getActiveTournaments() {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
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

// =============================================
// Funkcje dla grup (Grupy + Single K.O.)
// =============================================

/**
 * Zapisuje lub aktualizuje grupy (upsert)
 * @param {string} tournamentId - ID turnieju
 * @param {Array} groups - Lista grup do zapisania
 * @returns {Promise<Array>} Zapisane grupy z ich ID
 */
export async function upsertGroups(tournamentId, groups) {
    if (!groups || groups.length === 0) {
        return [];
    }

    const groupsToUpsert = groups.map(group => ({
        tournament_id: tournamentId,
        group_number: group.groupNumber,
        group_name: group.groupName,
        station_number: group.stationNumber,
        players: group.players,
        total_matches: group.totalMatches,
        completed_matches: group.completedMatches,
        status: group.status || 'pending',
        referee_scheme: group.memoText || null,
    }));

    const { data, error } = await supabase
        .from('groups')
        .upsert(groupsToUpsert, {
            onConflict: 'tournament_id,group_number',
            ignoreDuplicates: false
        })
        .select();

    if (error) {
        console.error('Error upserting groups:', error);
        throw error;
    }

    return data || [];
}

/**
 * Zapisuje lub aktualizuje mecze grupowe (upsert)
 * @param {string} groupId - ID grupy
 * @param {string} tournamentId - ID turnieju
 * @param {Array} matches - Lista meczów do zapisania
 * @returns {Promise<Array>} Zapisane mecze
 */
export async function upsertGroupMatches(groupId, tournamentId, matches) {
    if (!matches || matches.length === 0) {
        return [];
    }

    // Usuń duplikaty na podstawie matchOrder (mecze są już posortowane)
    const seen = new Set();
    const uniqueMatches = matches.filter(match => {
        // Użyj matchOrder jako klucza jeśli istnieje, inaczej użyj pary graczy
        const key = match.matchOrder
            ? `order_${match.matchOrder}`
            : [match.player1Name, match.player2Name].sort().join('|');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    const matchesToUpsert = uniqueMatches.map((match, index) => ({
        group_id: groupId,
        tournament_id: tournamentId,
        match_order: match.matchOrder || (index + 1), // Użyj matchOrder z n01 jeśli dostępny
        player1_name: match.player1Name,
        player2_name: match.player2Name,
        player1_id: match.player1Id,
        player2_id: match.player2Id,
        player1_score: match.player1Score || 0,
        player2_score: match.player2Score || 0,
        referee: match.referee || null,
        status: match.status || 'pending',
    }));

    const { data, error } = await supabase
        .from('group_matches')
        .upsert(matchesToUpsert, {
            onConflict: 'group_id,match_order',
            ignoreDuplicates: false
        })
        .select();

    if (error) {
        console.error('Error upserting group matches:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera grupy dla turnieju
 * @param {string} tournamentId - ID turnieju
 * @returns {Promise<Array>} Lista grup
 */
export async function getGroupsByTournament(tournamentId) {
    const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('group_number', { ascending: true });

    if (error) {
        console.error('Error fetching groups:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera mecze grupowe dla grupy
 * @param {string} groupId - ID grupy
 * @returns {Promise<Array>} Lista meczów
 */
export async function getGroupMatchesByGroup(groupId) {
    const { data, error } = await supabase
        .from('group_matches')
        .select('*')
        .eq('group_id', groupId)
        .order('match_order', { ascending: true });

    if (error) {
        console.error('Error fetching group matches:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera grupy z meczami dla turnieju
 * @param {string} tournamentId - ID turnieju
 * @returns {Promise<Array>} Lista grup z meczami
 */
export async function getGroupsWithMatchesByTournament(tournamentId) {
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('group_number', { ascending: true });

    if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
    }

    if (!groups || groups.length === 0) {
        return [];
    }

    // Pobierz mecze dla każdej grupy
    const groupIds = groups.map(g => g.id);
    const { data: matches, error: matchesError } = await supabase
        .from('group_matches')
        .select('*')
        .in('group_id', groupIds)
        .order('match_order', { ascending: true });

    if (matchesError) {
        console.error('Error fetching group matches:', matchesError);
        throw matchesError;
    }

    // Przypisz mecze do grup
    return groups.map(group => ({
        ...group,
        matches: (matches || []).filter(m => m.group_id === group.id)
    }));
}

// =============================================
// Funkcje dla statystyk turniejów Steel
// =============================================

/**
 * Zapisuje lub aktualizuje statystyki turnieju (upsert)
 * @param {string} tournamentId - ID turnieju
 * @param {Array} stats - Lista statystyk graczy
 * @returns {Promise<Array>} Zapisane statystyki
 */
export async function upsertTournamentStats(tournamentId, stats) {
    if (!stats || stats.length === 0) {
        return [];
    }

    // Usuń duplikaty po nazwie gracza (zachowaj pierwszy)
    const seenNames = new Set();
    const uniqueStats = stats.filter(stat => {
        if (!stat.playerName || seenNames.has(stat.playerName)) {
            return false;
        }
        seenNames.add(stat.playerName);
        return true;
    });

    console.log(`Upserting ${uniqueStats.length} unique stats (from ${stats.length} total)`);

    const statsToUpsert = uniqueStats.map(stat => ({
        tournament_id: tournamentId,
        player_name: stat.playerName,
        player_id: stat.playerId || null,
        matches_played: stat.matchesPlayed || 0,
        matches_won: stat.matchesWon || 0,
        legs_played: stat.legsPlayed || 0,
        legs_won: stat.legsWon || 0,
        scores_100_plus: stat.scores100Plus || 0,
        scores_140_plus: stat.scores140Plus || 0,
        scores_180: stat.scores180 || 0,
        high_finish: stat.highFinish || null,
        best_leg: stat.bestLeg || null,
        worst_leg: stat.worstLeg || null,
        avg_3_darts: stat.avg3Darts || null,
        avg_first_9: stat.avgFirst9 || null,
        total_score: stat.totalScore || 0,
        total_darts: stat.totalDarts || 0,
    }));

    const { data, error } = await supabase
        .from('tournament_stats')
        .upsert(statsToUpsert, {
            onConflict: 'tournament_id,player_name',
            ignoreDuplicates: false
        })
        .select();

    if (error) {
        console.error('Error upserting tournament stats:', error);
        throw error;
    }

    return data || [];
}

/**
 * Pobiera statystyki turnieju
 * @param {string} tournamentId - ID turnieju
 * @returns {Promise<Array>} Lista statystyk posortowana po średniej
 */
export async function getTournamentStats(tournamentId) {
    const { data, error } = await supabase
        .from('tournament_stats')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('avg_3_darts', { ascending: false, nullsFirst: false });

    if (error) {
        console.error('Error fetching tournament stats:', error);
        throw error;
    }

    return data || [];
}

/**
 * Aktualizuje status turnieju
 * @param {string} tournamentId - ID turnieju
 * @param {string} status - Status turnieju (accepting_entries, making_brackets, in_session, completed, unknown)
 * @param {boolean} autoDeactivate - Czy automatycznie dezaktywować zakończone turnieje
 * @returns {Promise<Object>} Zaktualizowany turniej
 */
export async function updateTournamentStatus(tournamentId, status, autoDeactivate = true) {
    const updates = {
        tournament_status: status
    };

    // Automatycznie dezaktywuj zakończone turnieje
    if (autoDeactivate && status === 'completed') {
        updates.is_active = false;
        console.log(`Tournament ${tournamentId} completed - auto-deactivating`);
    }

    const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', tournamentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating tournament status:', error);
        throw error;
    }

    return data;
}

/**
 * Usuwa wszystkie grupy i mecze grupowe dla turnieju
 * @param {string} tournamentId - ID turnieju
 * @returns {Promise<void>}
 */
export async function deleteGroupsByTournament(tournamentId) {
    // Najpierw usuń mecze grupowe (ze względu na FK)
    const { data: groups } = await supabase
        .from('groups')
        .select('id')
        .eq('tournament_id', tournamentId);

    if (groups && groups.length > 0) {
        const groupIds = groups.map(g => g.id);

        await supabase
            .from('group_matches')
            .delete()
            .in('group_id', groupIds);
    }

    // Teraz usuń grupy
    const { error } = await supabase
        .from('groups')
        .delete()
        .eq('tournament_id', tournamentId);

    if (error) {
        console.error('Error deleting groups:', error);
        throw error;
    }
}
