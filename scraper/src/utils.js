/**
 * Funkcje pomocnicze dla scrapera
 */

/**
 * Logowanie z timestampem
 * @param {string} message - Wiadomość do zalogowania
 * @param {string} level - Poziom logowania: 'info', 'warn', 'error'
 */
export function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}]`;

    switch (level) {
        case 'error':
            console.error(`${prefix} ERROR: ${message}`);
            break;
        case 'warn':
            console.warn(`${prefix} WARN: ${message}`);
            break;
        default:
            console.log(`${prefix} INFO: ${message}`);
    }
}

/**
 * Opóźnienie wykonania
 * @param {number} ms - Czas w milisekundach
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formatuje datę do formatu YYYY-MM-DD
 * @param {Date} date - Data do sformatowania
 * @returns {string} Sformatowana data
 */
export function formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

/**
 * Parsuje datę z różnych formatów
 * @param {string|Date} input - Data do sparsowania
 * @returns {Date} Sparsowana data
 */
export function parseDate(input) {
    if (input instanceof Date) {
        return input;
    }

    if (typeof input === 'string') {
        // Format YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
            return new Date(input + 'T00:00:00');
        }

        // Format DD.MM.YYYY
        const euroMatch = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (euroMatch) {
            return new Date(`${euroMatch[3]}-${euroMatch[2]}-${euroMatch[1]}T00:00:00`);
        }

        // Próba standardowego parsowania
        return new Date(input);
    }

    return new Date();
}

/**
 * Retry wrapper dla funkcji asynchronicznych
 * @param {Function} fn - Funkcja do wywołania
 * @param {number} maxRetries - Maksymalna liczba prób
 * @param {number} delay - Opóźnienie między próbami (ms)
 * @returns {Promise<any>} Wynik funkcji
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            log(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`, 'warn');

            if (attempt < maxRetries) {
                await sleep(delay * attempt); // Exponential backoff
            }
        }
    }

    throw lastError;
}

/**
 * Grupuje tablicę według klucza
 * @param {Array} array - Tablica do zgrupowania
 * @param {string|Function} key - Klucz lub funkcja zwracająca klucz
 * @returns {Object} Zgrupowane elementy
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        (result[groupKey] = result[groupKey] || []).push(item);
        return result;
    }, {});
}

/**
 * Usuwa duplikaty z tablicy na podstawie klucza
 * @param {Array} array - Tablica
 * @param {string|Function} key - Klucz do porównania
 * @returns {Array} Tablica bez duplikatów
 */
export function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const keyValue = typeof key === 'function' ? key(item) : item[key];
        if (seen.has(keyValue)) {
            return false;
        }
        seen.add(keyValue);
        return true;
    });
}

/**
 * Bezpieczne parsowanie JSON
 * @param {string} str - String JSON
 * @param {any} defaultValue - Wartość domyślna przy błędzie
 * @returns {any} Sparsowany obiekt lub wartość domyślna
 */
export function safeJsonParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

/**
 * Ogranicza liczbę wywołań funkcji (throttle)
 * @param {Function} fn - Funkcja do ograniczenia
 * @param {number} limit - Minimalny czas między wywołaniami (ms)
 * @returns {Function} Ograniczona funkcja
 */
export function throttle(fn, limit) {
    let lastCall = 0;

    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}

/**
 * Statystyki scrapera
 */
export class ScraperStats {
    constructor() {
        this.reset();
    }

    reset() {
        this.startTime = Date.now();
        this.totalScrapes = 0;
        this.successfulScrapes = 0;
        this.failedScrapes = 0;
        this.totalMatchesFound = 0;
        this.tournaments = new Map();
    }

    recordScrape(tournamentId, success, matchCount = 0) {
        this.totalScrapes++;

        if (success) {
            this.successfulScrapes++;
            this.totalMatchesFound += matchCount;
        } else {
            this.failedScrapes++;
        }

        const tournamentStats = this.tournaments.get(tournamentId) || {
            scrapes: 0,
            matches: 0
        };

        tournamentStats.scrapes++;
        tournamentStats.matches = matchCount;
        this.tournaments.set(tournamentId, tournamentStats);
    }

    getStats() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);

        return {
            uptime: `${hours}h ${minutes}m ${seconds}s`,
            totalScrapes: this.totalScrapes,
            successfulScrapes: this.successfulScrapes,
            failedScrapes: this.failedScrapes,
            successRate: this.totalScrapes > 0
                ? `${((this.successfulScrapes / this.totalScrapes) * 100).toFixed(1)}%`
                : '0%',
            totalMatchesFound: this.totalMatchesFound,
            activeTournaments: this.tournaments.size
        };
    }

    printStats() {
        const stats = this.getStats();
        log('=== Scraper Statistics ===');
        log(`Uptime: ${stats.uptime}`);
        log(`Total scrapes: ${stats.totalScrapes}`);
        log(`Successful: ${stats.successfulScrapes} | Failed: ${stats.failedScrapes}`);
        log(`Success rate: ${stats.successRate}`);
        log(`Total matches found: ${stats.totalMatchesFound}`);
        log(`Active tournaments: ${stats.activeTournaments}`);
        log('========================');
    }
}
