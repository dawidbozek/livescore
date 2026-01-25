/**
 * Skrypt do czyszczenia pustych grup z bazy
 */

import 'dotenv/config';
import { supabase } from './database.js';

async function cleanup() {
    console.log('Usuwam puste grupy z bazy...');

    // Znajdź grupy z 0 graczy (players jest puste lub null)
    const { data: groups, error } = await supabase
        .from('groups')
        .select('id, group_name, players');

    if (error) {
        console.error('Błąd:', error);
        return;
    }

    const emptyGroups = groups.filter(g => !g.players || g.players.length === 0);

    console.log(`Znaleziono ${emptyGroups.length} pustych grup`);

    for (const group of emptyGroups) {
        console.log(`  Usuwam: ${group.group_name} (${group.id})`);

        // Usuń mecze grupowe
        await supabase
            .from('group_matches')
            .delete()
            .eq('group_id', group.id);

        // Usuń grupę
        await supabase
            .from('groups')
            .delete()
            .eq('id', group.id);
    }

    console.log('Gotowe!');
    process.exit(0);
}

cleanup();
