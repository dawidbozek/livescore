/**
 * Puppeteer scraper dla n01darts.com
 */

import puppeteer from 'puppeteer';
import {
    parseAllMatches,
    isValidN01Url,
    parseGroupStationNumber,
    parseGroupMatchScore,
    parsePlayerAverage,
    calculateGroupMatches,
    getRefereeForMatch,
    REFEREE_SCHEMES
} from './parser.js';
import { log, sleep } from './utils.js';

let browser = null;

/**
 * Inicjalizuje przeglądarkę Puppeteer
 * @returns {Promise<Browser>}
 */
export async function initBrowser() {
    if (browser) {
        return browser;
    }

    log('Initializing Puppeteer browser...');

    browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080'
        ]
    });

    log('Browser initialized');
    return browser;
}

/**
 * Zamyka przeglądarkę
 * @returns {Promise<void>}
 */
export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        log('Browser closed');
    }
}

/**
 * Scrapuje stronę turnieju i zwraca dane meczów (i grup jeśli są)
 * @param {string} url - URL strony turnieju n01darts.com
 * @param {Object} options - Opcje scrapowania
 * @param {boolean} options.isSteelType - Czy to turniej Steel (dla sędziów)
 * @param {string} options.tournamentFormat - Format turnieju ('single_ko' lub 'groups_ko')
 * @returns {Promise<Object>} Obiekt z meczami i grupami { matches: Array, groups: Array }
 */
export async function scrapeTournament(url, options = {}) {
    const { isSteelType = true, tournamentFormat = 'single_ko' } = options;
    if (!isValidN01Url(url)) {
        log(`Invalid n01darts.com URL: ${url}`, 'error');
        return { matches: [], groups: [] };
    }

    const browserInstance = await initBrowser();
    let page = null;

    try {
        page = await browserInstance.newPage();

        // Ustawienia strony
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        log(`Navigating to: ${url}`);

        // Przejdź do strony
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Poczekaj na załadowanie dynamicznej zawartości JavaScript
        log('Waiting for JavaScript to load...');
        await sleep(5000);

        // Poczekaj na załadowanie elementów meczów LUB grup
        let hasKOMatches = false;
        let hasGroupTables = false;

        try {
            // Sprawdź czy są mecze K.O.
            await page.waitForSelector('.t_item_container', { timeout: 10000 });
            hasKOMatches = true;
            log('Found .t_item_container elements (K.O. matches)');
        } catch (e) {
            log('No .t_item_container found, checking for group tables...');
        }

        // Sprawdź czy są tabele grupowe
        try {
            await page.waitForSelector('.rr_table_container', { timeout: 5000 });
            hasGroupTables = true;
            log('Found .rr_table_container elements (group tables)');
        } catch (e) {
            log('No .rr_table_container found');
        }

        // Jeśli nic nie znaleziono, zaloguj zawartość strony
        if (!hasKOMatches && !hasGroupTables) {
            const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'empty');
            log(`Page content preview: ${bodyText.substring(0, 200)}...`);

            // Sprawdź jakie klasy są na stronie
            const classes = await page.evaluate(() => {
                const allElements = document.querySelectorAll('[class]');
                const classSet = new Set();
                allElements.forEach(el => {
                    el.classList.forEach(c => {
                        if (c.includes('rr_') || c.includes('t_item') || c.includes('table')) {
                            classSet.add(c);
                        }
                    });
                });
                return Array.from(classSet).slice(0, 20);
            });
            log(`Relevant CSS classes found: ${classes.join(', ')}`);
        }

        // Parsuj mecze z n01darts.com
        let rawMatches = await page.$$eval('.t_item_container', (elements) => {
            return elements.map(element => {
                // Gracz 1 (left)
                const player1El = element.querySelector('.t_item.left .entry_name');
                const player1Name = player1El?.textContent?.trim() || '';

                const score1El = element.querySelector('.t_item.left .t_result');
                const player1Score = score1El?.textContent?.trim() || '0';

                // Gracz 2 (right)
                const player2El = element.querySelector('.t_item.right .entry_name');
                const player2Name = player2El?.textContent?.trim() || '';

                const score2El = element.querySelector('.t_item.right .t_result');
                const player2Score = score2El?.textContent?.trim() || '0';

                // Numer tarczy/stanowiska (badge)
                const badgeEl = element.querySelector('.badge-text');
                const boardText = badgeEl?.textContent?.trim() || '';

                // Sędzia (t_memo)
                const memoEl = element.parentElement?.querySelector('.t_memo') ||
                               element.closest('td')?.querySelector('.t_memo');
                const referee = memoEl?.textContent?.trim() || '';

                // Sprawdź czy mecz jest aktywny (ma numer tarczy)
                const hasBoard = boardText && boardText !== '';

                // Sprawdź czy mecz jest zakończony (jeden z graczy ma wynik = legs limit)
                const leftItem = element.querySelector('.t_item.left');
                const legsLimit = leftItem?.getAttribute('legs') || '0';
                const s1 = parseInt(player1Score) || 0;
                const s2 = parseInt(player2Score) || 0;
                const isFinished = s1 >= parseInt(legsLimit) || s2 >= parseInt(legsLimit);

                return {
                    player1Name,
                    player2Name,
                    player1Score: s1,
                    player2Score: s2,
                    boardText,
                    referee,
                    hasBoard,
                    isFinished,
                    legsLimit: parseInt(legsLimit) || 0
                };
            });
        });

        log(`Found ${rawMatches.length} match containers`);

        // Przetwórz surowe mecze na format bazy danych
        const matches = rawMatches
            .filter(m => m.player1Name && m.player2Name) // Tylko mecze z oboma graczami
            .map((m, index) => {
                // Określ status
                let status = 'pending';
                if (m.hasBoard && !m.isFinished) {
                    status = 'active';
                } else if (m.isFinished) {
                    status = 'finished';
                }

                // Generuj unikalne ID meczu
                const p1 = m.player1Name.toLowerCase().replace(/\s+/g, '_');
                const p2 = m.player2Name.toLowerCase().replace(/\s+/g, '_');
                const n01_match_id = `${[p1, p2].sort().join('_vs_')}`;

                return {
                    n01_match_id,
                    player1_name: m.player1Name,
                    player2_name: m.player2Name,
                    player1_score: m.player1Score,
                    player2_score: m.player2Score,
                    station_number: m.boardText ? parseInt(m.boardText) || null : null,
                    referee: m.referee || null,
                    status
                };
            });

        log(`Parsed ${matches.length} valid matches (active: ${matches.filter(m => m.status === 'active').length}, pending: ${matches.filter(m => m.status === 'pending').length}, finished: ${matches.filter(m => m.status === 'finished').length})`);

        // Sprawdź czy są grupy (dla turniejów z formatem groups_ko)
        let groups = [];
        const hasGroups = await checkHasGroupTables(page);

        log(`Tournament format: ${tournamentFormat}, hasGroupTables: ${hasGroups}`);

        if (hasGroups || tournamentFormat === 'groups_ko') {
            log('Attempting to scrape group tables...');
            try {
                groups = await scrapeGroups(page, isSteelType);
                log(`Scraped ${groups.length} groups with ${groups.reduce((sum, g) => sum + g.matches.length, 0)} group matches`);

                // Loguj szczegóły każdej grupy
                groups.forEach((g, i) => {
                    log(`  Group ${i + 1}: "${g.groupName}" - ${g.players.length} players, ${g.matches.length} matches, status: ${g.status}`);
                });
            } catch (groupError) {
                log(`Error scraping groups: ${groupError.message}`, 'error');
            }
        } else {
            log('No group tables detected and tournament format is not groups_ko');
        }

        return { matches, groups };

    } catch (error) {
        log(`Error scraping ${url}: ${error.message}`, 'error');
        return { matches: [], groups: [] };
    } finally {
        if (page) {
            await page.close();
        }
    }
}

/**
 * Scrapuje grupy z turnieju grupowego
 * @param {Page} page - Strona Puppeteer
 * @param {boolean} isSteelType - Czy to turniej Steel (dla sędziów)
 * @returns {Promise<Array>} Lista grup z meczami
 */
async function scrapeGroups(page, isSteelType = true) {
    log('Scraping group tables...');

    // Najpierw policz ile kontenerów jest
    const containerCount = await page.$$eval('.rr_table_container', c => c.length);
    log(`Found ${containerCount} group containers to scrape`);

    if (containerCount === 0) {
        log('No group containers found, returning empty array');
        return [];
    }

    const groups = await page.$$eval('.rr_table_container', (containers, isSteelType) => {
        return containers.map((container, groupIndex) => {
            const table = container.querySelector('.rr_table');
            if (!table) return null;

            // Pobierz nazwę grupy z subtitle (na pierwszej komórce wyniku)
            const firstResultCell = table.querySelector('.rr_result[subtitle]');
            const groupName = firstResultCell?.getAttribute('subtitle') || `Grupa ${groupIndex + 1}`;

            // Pobierz memo (numer tarczy / schemat sędziów)
            const memoEl = container.querySelector('.rr_memo');
            const memoText = memoEl?.textContent?.trim() || '';

            // Parsuj numer tarczy
            const stationMatch = memoText.match(/(?:tarcza|board)\s*(\d+)/i);
            const stationNumber = stationMatch ? parseInt(stationMatch[1], 10) : null;

            // Pobierz listę graczy
            const playerRows = table.querySelectorAll('.rr_body .rr_player');
            const players = [];

            playerRows.forEach((row, rowIndex) => {
                const nameEl = row.querySelector('.rr_name .entry_name');
                const playerName = nameEl?.textContent?.trim() || '';

                // ID gracza z atrybutu tpid
                const nameCell = row.querySelector('.rr_name[tpid]');
                const playerId = nameCell?.getAttribute('tpid') || null;

                // Średnia gracza (dla Steel) - .t_avg
                const avgEl = row.querySelector('.t_avg');
                const avgText = avgEl?.textContent?.trim() || '';
                const avgMatch = avgText.match(/\((\d+\.?\d*)\)/);
                const average = avgMatch ? parseFloat(avgMatch[1]) : null;

                // Pozycja w tabeli (rank)
                const rankEl = row.querySelector('.rr_rank');
                const rank = rankEl ? parseInt(rankEl.textContent?.trim()) || (rowIndex + 1) : (rowIndex + 1);

                // Wyniki W-L (wins-losses)
                const winEl = row.querySelector('.rr_win');
                const winText = winEl?.textContent?.trim() || '0 - 0';
                const winMatch = winText.match(/(\d+)\s*-\s*(\d+)/);
                const wins = winMatch ? parseInt(winMatch[1]) : 0;
                const losses = winMatch ? parseInt(winMatch[2]) : 0;

                // Legs (dla statystyk)
                const legEl = row.querySelector('.rr_leg');
                const legText = legEl?.textContent?.trim() || '0 - 0';
                const legMatch = legText.match(/(\d+)\s*-\s*(\d+)/);
                const legsWon = legMatch ? parseInt(legMatch[1]) : 0;
                const legsLost = legMatch ? parseInt(legMatch[2]) : 0;

                if (playerName) {
                    players.push({
                        id: playerId,
                        name: playerName,
                        position: rowIndex + 1,
                        wins,
                        losses,
                        legsWon,
                        legsLost,
                        rank,
                        average,
                    });
                }
            });

            // Parsuj mecze z tabeli (macierz wyników)
            const matches = [];
            let completedMatches = 0;

            // Iteruj przez każdy wiersz gracza i każdą komórkę wyniku
            playerRows.forEach((row, rowIndex) => {
                const resultCells = row.querySelectorAll('.rr_result');

                resultCells.forEach((cell, colIndex) => {
                    // Pomiń przekątną (rr_none) i już przetworzone mecze (tylko górna połowa macierzy)
                    if (cell.classList.contains('rr_none') || colIndex <= rowIndex) {
                        return;
                    }

                    // Określ status meczu
                    const hasFixGame = cell.classList.contains('fix_game');
                    const hasRrIdx = cell.querySelector('.rr_idx') !== null;

                    // Wykryj aktywny mecz (czerwone tło dla Steel)
                    const style = window.getComputedStyle(cell);
                    const bgColor = style.backgroundColor;
                    // Jasnoczerwone tło - np. rgb(255, 200, 200) lub podobne
                    const hasActiveBackground = bgColor && bgColor.includes('rgb') &&
                        !bgColor.includes('rgba(0, 0, 0, 0)') &&
                        bgColor !== 'rgb(255, 255, 255)' &&
                        bgColor !== 'rgba(0, 0, 0, 0)' &&
                        cell.style.backgroundColor !== '';

                    // Pobierz wynik z komórki
                    const cellText = cell.textContent?.trim() || '';
                    const scoreMatch = cellText.match(/(\d+)\s*[-–]\s*(\d+)/);
                    const player1Score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
                    const player2Score = scoreMatch ? parseInt(scoreMatch[2]) : 0;

                    // Średnia w meczu (dla Steel)
                    const matchAvgEl = cell.querySelector('.r_avg');
                    const matchAvgText = matchAvgEl?.textContent?.trim() || '';
                    const matchAvgMatch = matchAvgText.match(/\((\d+\.?\d*)\)/);
                    const matchAverage = matchAvgMatch ? parseFloat(matchAvgMatch[1]) : null;

                    // Numer kolejności meczu (dla Soft)
                    const idxEl = cell.querySelector('.rr_idx');
                    const matchOrder = idxEl ? parseInt(idxEl.textContent?.trim()) || null : null;

                    // Status meczu
                    let status = 'pending';
                    if (hasFixGame) {
                        status = 'finished';
                        completedMatches++;
                    } else if (hasActiveBackground) {
                        status = 'active';
                    }

                    const player1 = players[rowIndex];
                    const player2 = players[colIndex];

                    if (player1 && player2) {
                        matches.push({
                            player1Name: player1.name,
                            player2Name: player2.name,
                            player1Id: player1.id,
                            player2Id: player2.id,
                            player1Score,
                            player2Score,
                            matchOrder,
                            status,
                            matchAverage,
                            player1Position: rowIndex + 1,
                            player2Position: colIndex + 1,
                        });
                    }
                });
            });

            // Oblicz całkowitą liczbę meczów
            const totalMatches = (players.length * (players.length - 1)) / 2;

            // Status grupy
            let groupStatus = 'pending';
            if (completedMatches === totalMatches && totalMatches > 0) {
                groupStatus = 'finished';
            } else if (matches.some(m => m.status === 'active')) {
                groupStatus = 'active';
            } else if (completedMatches > 0) {
                groupStatus = 'active'; // W trakcie
            }

            return {
                groupNumber: groupIndex + 1,
                groupName,
                stationNumber,
                memoText,
                players,
                matches,
                totalMatches,
                completedMatches,
                status: groupStatus,
            };
        }).filter(g => g !== null);
    }, isSteelType);

    log(`Found ${groups.length} groups`);

    // Przypisz sędziów dla turniejów Steel
    if (isSteelType) {
        groups.forEach(group => {
            const scheme = REFEREE_SCHEMES[group.players.length];
            if (scheme) {
                group.matches.forEach((match, idx) => {
                    // Znajdź odpowiedni mecz w schemacie
                    const schemeMatch = scheme.find(s =>
                        (s[0] === match.player1Position && s[1] === match.player2Position) ||
                        (s[0] === match.player2Position && s[1] === match.player1Position)
                    );

                    if (schemeMatch) {
                        const refereePosition = schemeMatch[2];
                        const referee = group.players.find(p => p.position === refereePosition);
                        match.referee = referee?.name || null;
                        match.refereePosition = refereePosition;
                    }
                });
            }
        });
    }

    return groups;
}

/**
 * Sprawdza czy strona turnieju zawiera grupy
 * @param {Page} page - Strona Puppeteer
 * @returns {Promise<boolean>} Czy są grupy
 */
async function checkHasGroupTables(page) {
    try {
        const count = await page.$$eval('.rr_table_container', containers => containers.length);
        log(`Found ${count} .rr_table_container elements`);
        return count > 0;
    } catch (e) {
        log(`Error checking for group tables: ${e.message}`);
        return false;
    }
}

/**
 * Pobiera screenshot strony (do debugowania)
 * @param {string} url - URL strony
 * @param {string} outputPath - Ścieżka do zapisania screenshota
 * @returns {Promise<void>}
 */
export async function takeScreenshot(url, outputPath) {
    const browserInstance = await initBrowser();
    let page = null;

    try {
        page = await browserInstance.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await sleep(2000);
        await page.screenshot({ path: outputPath, fullPage: true });
        log(`Screenshot saved to: ${outputPath}`);
    } catch (error) {
        log(`Error taking screenshot: ${error.message}`, 'error');
    } finally {
        if (page) {
            await page.close();
        }
    }
}

/**
 * Pobiera HTML strony (do debugowania)
 * @param {string} url - URL strony
 * @returns {Promise<string>} HTML strony
 */
export async function getPageHtml(url) {
    const browserInstance = await initBrowser();
    let page = null;

    try {
        page = await browserInstance.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await sleep(2000);
        return await page.content();
    } catch (error) {
        log(`Error getting page HTML: ${error.message}`, 'error');
        return '';
    } finally {
        if (page) {
            await page.close();
        }
    }
}
