/**
 * Parser statystyk turniejów Steel z n01darts.com
 * URL: https://n01darts.com/n01/tournament/t_stats.html?id={tournament_id}
 */

import puppeteer from 'puppeteer';
import { initBrowser } from './scraper.js';
import { log, sleep } from './utils.js';

/**
 * Wyciąga ID turnieju z URL n01darts.com
 * @param {string} url - URL turnieju
 * @returns {string|null} ID turnieju lub null
 */
export function extractTournamentId(url) {
    const match = url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
}

/**
 * Generuje URL strony statystyk dla turnieju
 * @param {string} tournamentUrl - URL turnieju
 * @returns {string} URL strony statystyk
 */
export function getStatsUrl(tournamentUrl) {
    const tournamentId = extractTournamentId(tournamentUrl);
    if (!tournamentId) {
        throw new Error(`Cannot extract tournament ID from URL: ${tournamentUrl}`);
    }
    return `https://n01darts.com/n01/tournament/t_stats.html?id=${tournamentId}`;
}

/**
 * Parsuje wiersze tabeli statystyk
 * @param {Page} page - Strona Puppeteer
 * @param {string} tableSelector - Selektor tabeli
 * @param {Object} columnMap - Mapowanie kolumn
 * @returns {Promise<Array>} Lista statystyk
 */
async function parseStatsRows(page, tableSelector, columnMap) {
    const rowSelector = `${tableSelector} tbody tr`;

    const stats = await page.$$eval(rowSelector, (rows, colMap) => {
        return rows.map((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return null;

            const getValue = (index) => {
                if (index < 0 || index >= cells.length) return null;
                return cells[index]?.textContent?.trim() || '';
            };

            const parseNumber = (index) => {
                const val = getValue(index);
                if (!val || val === '-' || val === '') return null;
                const num = parseInt(val.replace(/[^\d-]/g, ''), 10);
                return isNaN(num) ? null : num;
            };

            const parseDecimal = (index) => {
                const val = getValue(index);
                if (!val || val === '-' || val === '') return null;
                const num = parseFloat(val.replace(',', '.'));
                return isNaN(num) ? null : num;
            };

            // Pobierz nazwę gracza
            let playerName = '';
            const nameIndex = colMap.name >= 0 ? colMap.name : 1;
            if (cells[nameIndex]) {
                const nameCell = cells[nameIndex];
                const link = nameCell.querySelector('a');
                playerName = link?.textContent?.trim() || nameCell.textContent?.trim() || '';
            }

            // Pomiń wiersze bez nazwy lub z nieprawidłową nazwą
            if (!playerName || playerName.length < 2 || playerName.includes('(')) return null;

            // Sprawdź czy to nie jest nagłówek
            const firstCellText = getValue(0);
            if (firstCellText && (firstCellText.toLowerCase().includes('name') || firstCellText === '#')) return null;

            return {
                playerName,
                matchesPlayed: parseNumber(colMap.matchesPlayed),
                matchesWon: parseNumber(colMap.matchesWon),
                legsPlayed: parseNumber(colMap.legsPlayed),
                legsWon: parseNumber(colMap.legsWon),
                scores100Plus: parseNumber(colMap.scores100),
                scores140Plus: parseNumber(colMap.scores140),
                scores180: parseNumber(colMap.scores180),
                highFinish: parseNumber(colMap.highFinish),
                bestLeg: parseNumber(colMap.bestLeg),
                worstLeg: parseNumber(colMap.worstLeg),
                avg3Darts: parseDecimal(colMap.avg3Darts),
                avgFirst9: parseDecimal(colMap.avgFirst9),
                totalScore: parseNumber(colMap.totalScore),
                totalDarts: parseNumber(colMap.totalDarts),
            };
        }).filter(s => s !== null && s.playerName && s.playerName.length >= 2);
    }, columnMap);

    return stats;
}

/**
 * Scrapuje statystyki turnieju Steel
 * @param {string} tournamentUrl - URL turnieju na n01darts.com
 * @returns {Promise<Array>} Lista statystyk graczy
 */
export async function scrapeTournamentStats(tournamentUrl) {
    const statsUrl = getStatsUrl(tournamentUrl);
    log(`Scraping tournament stats from: ${statsUrl}`);

    const browserInstance = await initBrowser();
    let page = null;

    try {
        page = await browserInstance.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await page.goto(statsUrl, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Poczekaj dłużej na załadowanie JavaScript
        log('Waiting for JavaScript to render stats table...');
        await sleep(5000);

        // Szukaj tabeli statystyk - próbuj różnych selektorów
        const tableSelectors = [
            '.stats_table',
            '#stats_table',
            'table.stats',
            '.tournament_stats table',
            '#tournament_stats table',
            '.t_stats_table',
            'table[class*="stats"]',
            'table[id*="stats"]',
            // Generyczne - ostatnia deska ratunku
            'table'
        ];

        let tableSelector = null;
        for (const selector of tableSelectors) {
            const hasTable = await page.$(selector);
            if (hasTable) {
                tableSelector = selector;
                log(`Found stats table with selector: ${selector}`);
                break;
            }
        }

        if (!tableSelector) {
            // Debug: wylistuj wszystkie tabele i ich klasy
            const tableInfo = await page.evaluate(() => {
                const tables = document.querySelectorAll('table');
                return Array.from(tables).map(t => ({
                    id: t.id,
                    className: t.className,
                    rows: t.querySelectorAll('tr').length
                }));
            });
            log(`Tables found on page: ${JSON.stringify(tableInfo)}`, 'warn');

            // Jeśli są jakieś tabele, użyj pierwszej z więcej niż 5 wierszami
            const mainTable = tableInfo.find(t => t.rows > 5);
            if (mainTable) {
                tableSelector = mainTable.id ? `#${mainTable.id}` :
                               mainTable.className ? `table.${mainTable.className.split(' ')[0]}` :
                               'table';
                log(`Using fallback table selector: ${tableSelector}`);
            } else {
                log('No suitable stats table found on page', 'warn');
                return [];
            }
        }

        // Pobierz strukturę tabeli - wszystkie nagłówki z widocznością
        const tableStructure = await page.evaluate((selector) => {
            const table = document.querySelector(selector);
            if (!table) return { headers: [], sampleRow: [] };

            // Pobierz wszystkie nagłówki th
            const headerCells = table.querySelectorAll('thead th, tr:first-child th');
            const headers = Array.from(headerCells).map((th, i) => ({
                index: i,
                text: th.textContent?.trim() || '',
                visible: th.offsetParent !== null
            }));

            // Pobierz pierwszy wiersz danych
            const firstDataRow = table.querySelector('tbody tr');
            const sampleRow = firstDataRow
                ? Array.from(firstDataRow.querySelectorAll('td')).map((td, i) => ({
                    index: i,
                    text: td.textContent?.trim()?.substring(0, 30) || ''
                }))
                : [];

            return { headers, sampleRow };
        }, tableSelector);

        log(`Table structure - Headers: ${tableStructure.headers.length}, Sample row cells: ${tableStructure.sampleRow.length}`);
        log(`Headers: ${tableStructure.headers.map(h => h.text).join(' | ')}`);
        if (tableStructure.sampleRow.length > 0) {
            log(`Sample row: ${tableStructure.sampleRow.map(c => c.text).join(' | ')}`);
        }

        // Konwertuj nagłówki do lowercase
        const headers = tableStructure.headers.map(h => h.text.toLowerCase());

        // Inteligentne mapowanie kolumn
        const findColumn = (patterns) => {
            for (const pattern of patterns) {
                const idx = headers.findIndex(h => {
                    if (typeof pattern === 'string') {
                        return h === pattern || h.includes(pattern);
                    }
                    return pattern.test(h);
                });
                if (idx !== -1) return idx;
            }
            return -1;
        };

        // Mapuj nagłówki na indeksy kolumn
        const columnMap = {
            rank: findColumn(['#', 'rank', 'pos']),
            name: findColumn(['name', 'player', 'entry']),
            matchesPlayed: findColumn(['matches played', 'mp']),
            matchesWon: findColumn(['matches won', 'mw']),
            legsPlayed: findColumn(['legs played', 'lp']),
            legsWon: findColumn(['legs won', 'lw']),
            scores100: findColumn(['100+']),
            scores140: findColumn(['140+']),
            scores180: findColumn(["180's", '180']),
            highFinish: findColumn(['high finish', 'hf', 'checkout']),
            bestLeg: findColumn(['best leg', 'best', 'min']),
            worstLeg: findColumn(['worst leg', 'worst', 'max']),
            avg3Darts: findColumn(['3 darts average', '3da', '3 dart']),
            avgFirst9: findColumn(['first 9 average', 'first 9', '9da']),
            totalScore: findColumn(['total score']),
            totalDarts: findColumn(['total darts']),
        };

        log(`Column mapping: name=${columnMap.name}, matchesPlayed=${columnMap.matchesPlayed}, avg3Darts=${columnMap.avg3Darts}, scores180=${columnMap.scores180}`);

        // Jeśli nie znaleziono kolumny name, spróbuj znaleźć ją po zawartości sample row
        if (columnMap.name === -1 && tableStructure.sampleRow.length > 0) {
            // Szukaj pierwszej kolumny z tekstem (nie liczbą)
            for (let i = 0; i < tableStructure.sampleRow.length; i++) {
                const cellText = tableStructure.sampleRow[i].text;
                // Jeśli zawiera litery i nie jest tylko liczbą
                if (cellText && /[a-zA-Z]/.test(cellText) && !/^\d+$/.test(cellText)) {
                    columnMap.name = i;
                    log(`Found name column by content at index ${i}: "${cellText}"`);
                    break;
                }
            }
        }

        // Parsuj wiersze tabeli
        const stats = await parseStatsRows(page, tableSelector, columnMap);

        log(`Parsed ${stats.length} player statistics`);

        // Debug: pokaż pierwsze 2 statystyki
        if (stats.length > 0) {
            log(`Sample stats: ${JSON.stringify(stats.slice(0, 2))}`);
        }

        // Usuń duplikaty po nazwie gracza
        const uniqueStats = [];
        const seenNames = new Set();
        for (const stat of stats) {
            if (!seenNames.has(stat.playerName)) {
                seenNames.add(stat.playerName);
                uniqueStats.push(stat);
            }
        }

        if (uniqueStats.length !== stats.length) {
            log(`Removed ${stats.length - uniqueStats.length} duplicate entries`);
        }

        return uniqueStats;

    } catch (error) {
        log(`Error scraping stats from ${statsUrl}: ${error.message}`, 'error');
        console.error(error);
        return [];
    } finally {
        if (page) {
            await page.close();
        }
    }
}
