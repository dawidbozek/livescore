/**
 * Puppeteer scraper dla n01darts.com
 */

import puppeteer from 'puppeteer';
import { parseAllMatches, isValidN01Url } from './parser.js';
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
 * Scrapuje stronę turnieju i zwraca dane meczów
 * @param {string} url - URL strony turnieju n01darts.com
 * @returns {Promise<Array>} Lista meczów
 */
export async function scrapeTournament(url) {
    if (!isValidN01Url(url)) {
        log(`Invalid n01darts.com URL: ${url}`, 'error');
        return [];
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

        // Poczekaj na załadowanie elementów meczów
        try {
            await page.waitForSelector('.t_item_container', { timeout: 15000 });
            log('Found .t_item_container elements');
        } catch (e) {
            log('Timeout waiting for .t_item_container, checking page content...');

            // Sprawdź co jest na stronie
            const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'empty');
            log(`Page content preview: ${bodyText.substring(0, 200)}...`);
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

        return matches;

    } catch (error) {
        log(`Error scraping ${url}: ${error.message}`, 'error');
        return [];
    } finally {
        if (page) {
            await page.close();
        }
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
