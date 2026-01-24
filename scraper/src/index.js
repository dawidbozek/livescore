/**
 * Główny plik scrapera n01darts.com
 * Uruchamia pętlę scrapującą co 30 sekund
 */

import 'dotenv/config';
import {
    getActiveTournaments,
    upsertMatches,
    upsertGroups,
    upsertGroupMatches
} from './database.js';
import { scrapeTournament, initBrowser, closeBrowser } from './scraper.js';
import { log, sleep, formatDate, ScraperStats } from './utils.js';

// Konfiguracja
const SCRAPE_INTERVAL = parseInt(process.env.SCRAPE_INTERVAL_MS, 10) || 30000;
const stats = new ScraperStats();

// Flaga do kontroli pętli
let isRunning = true;

/**
 * Scrapuje wszystkie aktywne turnieje
 * @returns {Promise<void>}
 */
async function scrapeAllTournaments() {
    const today = new Date();
    const dateStr = formatDate(today);

    log(`Starting scrape cycle for date: ${dateStr}`);

    try {
        // Pobierz aktywne turnieje na dzisiaj
        const tournaments = await getActiveTournaments(today);

        if (tournaments.length === 0) {
            log('No active tournaments found for today');
            return;
        }

        log(`Found ${tournaments.length} active tournament(s)`);

        // Scrapuj każdy turniej
        for (const tournament of tournaments) {
            if (!isRunning) break;

            try {
                log(`Scraping: ${tournament.name} (${tournament.n01_url})`);

                // Przekaż opcje scrapera
                const scraperOptions = {
                    isSteelType: tournament.dart_type === 'steel',
                    tournamentFormat: tournament.tournament_format || 'single_ko'
                };

                const { matches, groups } = await scrapeTournament(tournament.n01_url, scraperOptions);

                let totalItems = 0;

                // Zapisz mecze K.O. do bazy
                if (matches.length > 0) {
                    await upsertMatches(tournament.id, matches);
                    log(`Saved ${matches.length} K.O. matches for ${tournament.name}`);
                    totalItems += matches.length;
                }

                // Zapisz grupy i mecze grupowe
                if (groups && groups.length > 0) {
                    const savedGroups = await upsertGroups(tournament.id, groups);
                    log(`Saved ${savedGroups.length} groups for ${tournament.name}`);

                    // Zapisz mecze dla każdej grupy
                    for (let i = 0; i < savedGroups.length; i++) {
                        const savedGroup = savedGroups[i];
                        const originalGroup = groups.find(g => g.groupNumber === savedGroup.group_number);

                        if (originalGroup && originalGroup.matches && originalGroup.matches.length > 0) {
                            await upsertGroupMatches(savedGroup.id, tournament.id, originalGroup.matches);
                            totalItems += originalGroup.matches.length;
                        }
                    }

                    log(`Saved ${groups.reduce((sum, g) => sum + g.matches.length, 0)} group matches for ${tournament.name}`);
                }

                if (totalItems > 0) {
                    stats.recordScrape(tournament.id, true, totalItems);
                } else {
                    log(`No matches found for ${tournament.name}`, 'warn');
                    stats.recordScrape(tournament.id, true, 0);
                }

            } catch (error) {
                log(`Error scraping ${tournament.name}: ${error.message}`, 'error');
                stats.recordScrape(tournament.id, false);
            }

            // Krótka przerwa między turniejami
            await sleep(1000);
        }

    } catch (error) {
        log(`Error in scrape cycle: ${error.message}`, 'error');
    }
}

/**
 * Główna pętla scrapera
 */
async function mainLoop() {
    log('=================================');
    log('N01 Darts Scraper starting...');
    log(`Scrape interval: ${SCRAPE_INTERVAL}ms`);
    log('=================================');

    // Inicjalizuj przeglądarkę
    await initBrowser();

    // Wyświetl statystyki co 5 minut
    const statsInterval = setInterval(() => {
        if (isRunning) {
            stats.printStats();
        }
    }, 300000);

    try {
        while (isRunning) {
            await scrapeAllTournaments();

            if (isRunning) {
                log(`Next scrape in ${SCRAPE_INTERVAL / 1000} seconds...`);
                await sleep(SCRAPE_INTERVAL);
            }
        }
    } finally {
        clearInterval(statsInterval);
        await closeBrowser();
        stats.printStats();
        log('Scraper stopped');
    }
}

/**
 * Obsługa sygnałów zamknięcia
 */
function setupShutdownHandlers() {
    const shutdown = async (signal) => {
        log(`Received ${signal}, shutting down gracefully...`);
        isRunning = false;
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Obsługa nieobsłużonych błędów
    process.on('uncaughtException', async (error) => {
        log(`Uncaught exception: ${error.message}`, 'error');
        console.error(error);
        isRunning = false;
        await closeBrowser();
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
        log(`Unhandled rejection: ${reason}`, 'error');
        console.error(promise);
    });
}

// Uruchomienie
setupShutdownHandlers();
mainLoop().catch(async (error) => {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error);
    await closeBrowser();
    process.exit(1);
});
