/**
 * Skrypt testowy - scrapuje turniej i ZAPISUJE do bazy
 */

import 'dotenv/config';
import { scrapeTournament, initBrowser, closeBrowser } from './scraper.js';
import { supabase, upsertGroups, upsertGroupMatches, upsertMatches } from './database.js';

const TEST_URL = 'https://n01darts.com/n01/tournament/comp.php?id=t_EyYU_4717';

async function test() {
    console.log('=================================');
    console.log('TEST SCRAPER + SAVE TO DATABASE');
    console.log(`URL: ${TEST_URL}`);
    console.log('=================================\n');

    // 1. Test połączenia z Supabase
    console.log('1. Testowanie połączenia z Supabase...');
    try {
        const { data, error } = await supabase.from('tournaments').select('count').limit(1);
        if (error) throw error;
        console.log('   ✓ Połączenie z Supabase OK\n');
    } catch (e) {
        console.error('   ✗ BŁĄD połączenia z Supabase:', e.message);
        console.error('   Sprawdź .env - SUPABASE_URL i SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    // 2. Sprawdź czy turniej istnieje w bazie
    console.log('2. Szukam turnieju w bazie...');
    const { data: tournaments, error: tError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('n01_url', TEST_URL);

    if (tError) {
        console.error('   ✗ Błąd pobierania turniejów:', tError.message);
        process.exit(1);
    }

    let tournament = tournaments?.[0];

    if (!tournament) {
        console.log('   Turniej nie istnieje - tworzę nowy...');

        const { data: newTournament, error: createError } = await supabase
            .from('tournaments')
            .insert({
                name: 'Test Turniej Grupowy',
                n01_url: TEST_URL,
                tournament_date: new Date().toISOString().split('T')[0],
                is_active: true,
                dart_type: 'steel',
                tournament_format: 'groups_ko'
            })
            .select()
            .single();

        if (createError) {
            console.error('   ✗ Błąd tworzenia turnieju:', createError.message);
            process.exit(1);
        }

        tournament = newTournament;
        console.log('   ✓ Utworzono turniej:', tournament.id);
    } else {
        console.log('   ✓ Znaleziono turniej:', tournament.id);
        console.log('   Nazwa:', tournament.name);
        console.log('   Format:', tournament.tournament_format);
        console.log('   Aktywny:', tournament.is_active);

        // Upewnij się że format jest groups_ko
        if (tournament.tournament_format !== 'groups_ko') {
            console.log('   Aktualizuję format na groups_ko...');
            await supabase
                .from('tournaments')
                .update({ tournament_format: 'groups_ko' })
                .eq('id', tournament.id);
        }
    }

    // 3. Sprawdź czy tabele groups i group_matches istnieją
    console.log('\n3. Sprawdzam tabele w bazie...');

    try {
        const { error: groupsTableError } = await supabase.from('groups').select('count').limit(1);
        if (groupsTableError) {
            console.error('   ✗ Tabela "groups" nie istnieje!');
            console.error('   Musisz dodać ją do Supabase. SQL:');
            console.error(`
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    group_number INTEGER NOT NULL,
    group_name VARCHAR(100),
    station_number INTEGER,
    players JSONB,
    total_matches INTEGER DEFAULT 0,
    completed_matches INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    referee_scheme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, group_number)
);
            `);
            process.exit(1);
        }
        console.log('   ✓ Tabela "groups" istnieje');
    } catch (e) {
        console.error('   ✗ Błąd sprawdzania tabeli groups:', e.message);
    }

    try {
        const { error: gmTableError } = await supabase.from('group_matches').select('count').limit(1);
        if (gmTableError) {
            console.error('   ✗ Tabela "group_matches" nie istnieje!');
            console.error('   Musisz dodać ją do Supabase. SQL:');
            console.error(`
CREATE TABLE group_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    match_order INTEGER NOT NULL,
    player1_name VARCHAR(255),
    player2_name VARCHAR(255),
    player1_id VARCHAR(50),
    player2_id VARCHAR(50),
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    referee VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, match_order)
);
            `);
            process.exit(1);
        }
        console.log('   ✓ Tabela "group_matches" istnieje');
    } catch (e) {
        console.error('   ✗ Błąd sprawdzania tabeli group_matches:', e.message);
    }

    // 4. Scrapuj dane
    console.log('\n4. Scrapuję dane z n01darts.com...');
    try {
        await initBrowser();

        const { matches, groups } = await scrapeTournament(TEST_URL, {
            isSteelType: tournament.dart_type === 'steel',
            tournamentFormat: 'groups_ko'
        });

        console.log(`   Znaleziono ${groups.length} grup`);
        console.log(`   Znaleziono ${matches.length} meczów K.O.`);

        // 5. Zapisz grupy do bazy
        if (groups.length > 0) {
            console.log('\n5. Zapisuję grupy do bazy...');

            const savedGroups = await upsertGroups(tournament.id, groups);
            console.log(`   ✓ Zapisano ${savedGroups.length} grup`);

            // 6. Zapisz mecze grupowe
            console.log('\n6. Zapisuję mecze grupowe...');
            let totalMatches = 0;

            for (const savedGroup of savedGroups) {
                const originalGroup = groups.find(g => g.groupNumber === savedGroup.group_number);

                if (originalGroup && originalGroup.matches.length > 0) {
                    await upsertGroupMatches(savedGroup.id, tournament.id, originalGroup.matches);
                    totalMatches += originalGroup.matches.length;
                    console.log(`   ✓ Grupa ${savedGroup.group_number}: ${originalGroup.matches.length} meczów`);
                }
            }

            console.log(`   ✓ Łącznie zapisano ${totalMatches} meczów grupowych`);
        }

        // 6b. Zapisz mecze K.O. do bazy
        if (matches.length > 0) {
            console.log('\n6b. Zapisuję mecze K.O. do bazy...');
            await upsertMatches(tournament.id, matches);
            console.log(`   ✓ Zapisano ${matches.length} meczów K.O.`);

            const active = matches.filter(m => m.status === 'active');
            const pending = matches.filter(m => m.status === 'pending');
            const finished = matches.filter(m => m.status === 'finished');
            console.log(`     - Aktywne: ${active.length}`);
            console.log(`     - Oczekujące: ${pending.length}`);
            console.log(`     - Zakończone: ${finished.length}`);
        }

        // 7. Sprawdź co jest w bazie
        console.log('\n7. Weryfikacja - dane w bazie:');

        const { data: dbGroups } = await supabase
            .from('groups')
            .select('*')
            .eq('tournament_id', tournament.id);

        console.log(`   Grupy w bazie: ${dbGroups?.length || 0}`);

        if (dbGroups && dbGroups.length > 0) {
            for (const g of dbGroups) {
                const { data: gMatches } = await supabase
                    .from('group_matches')
                    .select('*')
                    .eq('group_id', g.id);

                console.log(`   - ${g.group_name}: ${gMatches?.length || 0} meczów, status: ${g.status}`);
            }
        }

        console.log('\n=================================');
        console.log('✓ SUKCES - Dane zapisane do bazy!');
        console.log('Odśwież stronę /live w przeglądarce');
        console.log('=================================');

    } catch (error) {
        console.error('\n✗ BŁĄD:', error.message);
        console.error(error.stack);
    } finally {
        await closeBrowser();
        process.exit(0);
    }
}

test();
