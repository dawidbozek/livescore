/**
 * Skrypt testowy - scrapuje pojedynczy turniej i wyświetla wyniki
 */

import 'dotenv/config';
import { scrapeTournament, initBrowser, closeBrowser } from './scraper.js';

const TEST_URL = process.argv[2] || 'https://n01darts.com/n01/tournament/comp.php?id=t_EyYU_4717';

async function test() {
    console.log('=================================');
    console.log('TEST SCRAPER');
    console.log(`URL: ${TEST_URL}`);
    console.log('=================================\n');

    try {
        await initBrowser();

        const options = {
            isSteelType: true,  // Zmień na false dla Soft
            tournamentFormat: 'groups_ko'  // Testujemy format grupowy
        };

        console.log('Scraping with options:', options);
        console.log('');

        const { matches, groups } = await scrapeTournament(TEST_URL, options);

        // Wyświetl wyniki K.O.
        console.log('\n=== MECZE K.O. ===');
        console.log(`Znaleziono: ${matches.length} meczów`);

        if (matches.length > 0) {
            const active = matches.filter(m => m.status === 'active');
            const pending = matches.filter(m => m.status === 'pending');
            const finished = matches.filter(m => m.status === 'finished');

            console.log(`  - Aktywne: ${active.length}`);
            console.log(`  - Oczekujące: ${pending.length}`);
            console.log(`  - Zakończone: ${finished.length}`);

            if (active.length > 0) {
                console.log('\nAktywne mecze:');
                active.forEach(m => {
                    console.log(`  [${m.station_number || '?'}] ${m.player1_name} ${m.player1_score} - ${m.player2_score} ${m.player2_name}`);
                });
            }
        }

        // Wyświetl grupy
        console.log('\n=== GRUPY ===');
        console.log(`Znaleziono: ${groups.length} grup`);

        if (groups.length > 0) {
            groups.forEach((group, i) => {
                console.log(`\n--- ${group.groupName || `Grupa ${i + 1}`} ---`);
                console.log(`  Tarcza: ${group.stationNumber || 'brak'}`);
                console.log(`  Status: ${group.status}`);
                console.log(`  Postęp: ${group.completedMatches}/${group.totalMatches} meczów`);
                console.log(`  Gracze (${group.players.length}):`);

                group.players.forEach((p, j) => {
                    console.log(`    ${j + 1}. ${p.name} (W-L: ${p.wins}-${p.losses}, rank: ${p.rank})`);
                });

                console.log(`  Mecze (${group.matches.length}):`);
                group.matches.forEach((m, j) => {
                    const statusIcon = m.status === 'finished' ? '✓' : m.status === 'active' ? '🔴' : '○';
                    const referee = m.referee ? ` [sędzia: ${m.referee}]` : '';
                    console.log(`    ${statusIcon} ${m.player1Name} ${m.player1Score}-${m.player2Score} ${m.player2Name}${referee}`);
                });
            });
        }

        console.log('\n=================================');
        console.log('TEST ZAKOŃCZONY');
        console.log('=================================');

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error.stack);
    } finally {
        await closeBrowser();
        process.exit(0);
    }
}

test();
