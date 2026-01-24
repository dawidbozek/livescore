/**
 * Parser dla danych z n01darts.com
 * Parsuje HTML i wyciąga dane meczów
 */

/**
 * Generuje unikalny identyfikator meczu na podstawie graczy
 * @param {string} player1 - Nazwa gracza 1
 * @param {string} player2 - Nazwa gracza 2
 * @returns {string} Unikalny identyfikator meczu
 */
export function generateMatchId(player1, player2) {
    const cleanP1 = (player1 || '').trim().toLowerCase().replace(/\s+/g, '_');
    const cleanP2 = (player2 || '').trim().toLowerCase().replace(/\s+/g, '_');
    // Sortujemy alfabetycznie, żeby ten sam mecz miał zawsze to samo ID
    const sorted = [cleanP1, cleanP2].sort();
    return `${sorted[0]}_vs_${sorted[1]}`;
}

/**
 * Określa status meczu na podstawie danych
 * @param {Object} matchData - Dane meczu
 * @returns {string} Status: 'active', 'pending', 'finished', 'walkover'
 */
export function determineMatchStatus(matchData) {
    const { player1_name, player2_name, player1_score, player2_score, station_number, hasScores } = matchData;

    // Walkover - jeden z graczy ma "wo" lub "w/o" lub brak gracza
    const woPattern = /\b(wo|w\/o|walkover)\b/i;
    if (woPattern.test(player1_name) || woPattern.test(player2_name) || !player1_name || !player2_name) {
        return 'walkover';
    }

    // Aktywny - ma przypisaną tarcze/stanowisko i niezerowy wynik lub w trakcie gry
    if (station_number && station_number > 0) {
        return 'active';
    }

    // Zakończony - ma wyniki i brak przypisanej tarczy
    if (hasScores && (player1_score > 0 || player2_score > 0) && !station_number) {
        return 'finished';
    }

    // Oczekujący - w każdym innym przypadku
    return 'pending';
}

/**
 * Czyści i normalizuje nazwę gracza
 * @param {string} name - Surowa nazwa gracza
 * @returns {string} Oczyszczona nazwa
 */
export function cleanPlayerName(name) {
    if (!name) return '';

    return name
        .trim()
        // Usuń numery w nawiasach (rankingi)
        .replace(/\(\d+\)/g, '')
        // Usuń podwójne spacje
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parsuje wynik z tekstu
 * @param {string} scoreText - Tekst z wynikiem (np. "3" lub "3 - 2")
 * @returns {Object} Obiekt z wynikami {player1: number, player2: number}
 */
export function parseScore(scoreText) {
    if (!scoreText) {
        return { player1: 0, player2: 0 };
    }

    // Format "X - Y" lub "X-Y"
    const dashMatch = scoreText.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (dashMatch) {
        return {
            player1: parseInt(dashMatch[1], 10) || 0,
            player2: parseInt(dashMatch[2], 10) || 0
        };
    }

    // Pojedyncza liczba
    const singleMatch = scoreText.match(/(\d+)/);
    if (singleMatch) {
        return {
            player1: parseInt(singleMatch[1], 10) || 0,
            player2: 0
        };
    }

    return { player1: 0, player2: 0 };
}

/**
 * Parsuje numer stanowiska/tarczy z tekstu
 * @param {string} text - Tekst zawierający numer stanowiska
 * @returns {number|null} Numer stanowiska lub null
 */
export function parseStationNumber(text) {
    if (!text) return null;

    // Szukamy wzorców: "Board 1", "Tarcza 1", "Station 1", "Stanowisko 1", "#1", "1"
    const patterns = [
        /board\s*#?\s*(\d+)/i,
        /tarcza\s*#?\s*(\d+)/i,
        /station\s*#?\s*(\d+)/i,
        /stanowisko\s*#?\s*(\d+)/i,
        /#(\d+)/,
        /^(\d+)$/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseInt(match[1], 10);
        }
    }

    return null;
}

/**
 * Parsuje dane meczu z elementu DOM (wywoływane w kontekście przeglądarki)
 * Ta funkcja jest przekazywana do page.evaluate() w Puppeteer
 * @param {Element} element - Element DOM meczu
 * @returns {Object} Sparsowane dane meczu
 */
export function parseMatchElement(element) {
    // Wyciąganie graczy
    const playerElements = element.querySelectorAll('.t_player_name, .player-name, .player');
    const players = Array.from(playerElements).map(el => el.textContent?.trim() || '');

    // Wyciąganie wyników
    const scoreElements = element.querySelectorAll('.t_score, .score, .result');
    const scores = Array.from(scoreElements).map(el => el.textContent?.trim() || '');

    // Wyciąganie numeru stanowiska/tarczy
    const boardElement = element.querySelector('.t_board, .board, .station, [class*="board"], [class*="station"]');
    const boardText = boardElement?.textContent?.trim() || '';

    // Wyciąganie sędziego
    const refereeElement = element.querySelector('.t_referee, .referee, [class*="referee"]');
    const referee = refereeElement?.textContent?.trim() || '';

    // HTML elementu do debugowania
    const rawHtml = element.outerHTML;

    return {
        players,
        scores,
        boardText,
        referee,
        rawHtml
    };
}

/**
 * Przetwarza surowe dane meczu na strukturę bazy danych
 * @param {Object} rawData - Surowe dane z parsera
 * @param {number} index - Indeks meczu (używany do ID jeśli brak innych danych)
 * @returns {Object|null} Przetworzony mecz lub null
 */
export function processMatchData(rawData, index = 0) {
    const { players, scores, boardText, referee, rawHtml } = rawData;

    // Potrzebujemy minimum 2 graczy
    if (!players || players.length < 2) {
        return null;
    }

    const player1_name = cleanPlayerName(players[0]);
    const player2_name = cleanPlayerName(players[1]);

    // Pomiń jeśli brak obu graczy
    if (!player1_name && !player2_name) {
        return null;
    }

    // Parsuj wyniki
    let player1_score = 0;
    let player2_score = 0;
    let hasScores = false;

    if (scores && scores.length > 0) {
        const scoreText = scores.join(' ');
        const parsed = parseScore(scoreText);
        player1_score = parsed.player1;
        player2_score = parsed.player2;
        hasScores = player1_score > 0 || player2_score > 0;
    }

    // Parsuj numer stanowiska
    const station_number = parseStationNumber(boardText);

    // Generuj ID meczu
    const n01_match_id = generateMatchId(player1_name, player2_name);

    // Określ status
    const status = determineMatchStatus({
        player1_name,
        player2_name,
        player1_score,
        player2_score,
        station_number,
        hasScores
    });

    return {
        n01_match_id,
        player1_name: player1_name || 'TBD',
        player2_name: player2_name || 'TBD',
        player1_score,
        player2_score,
        station_number,
        referee: referee || null,
        status,
        raw_html: rawHtml?.substring(0, 5000) // Limit HTML do 5000 znaków
    };
}

/**
 * Parsuje całą stronę turnieju i zwraca listę meczów
 * @param {Array} rawMatches - Surowe dane meczów z przeglądarki
 * @returns {Array} Lista przetworzonych meczów
 */
export function parseAllMatches(rawMatches) {
    if (!rawMatches || !Array.isArray(rawMatches)) {
        return [];
    }

    const matches = [];

    for (let i = 0; i < rawMatches.length; i++) {
        const processed = processMatchData(rawMatches[i], i);
        if (processed) {
            matches.push(processed);
        }
    }

    return matches;
}

/**
 * Sprawdza, czy URL jest prawidłowym adresem n01darts.com
 * @param {string} url - URL do sprawdzenia
 * @returns {boolean} Czy URL jest prawidłowy
 */
export function isValidN01Url(url) {
    if (!url) return false;

    try {
        const parsed = new URL(url);
        return parsed.hostname.includes('n01darts.com');
    } catch {
        return false;
    }
}

// =============================================
// Parsowanie grup (Grupy + Single K.O.)
// =============================================

/**
 * Schematy przypisywania sędziów dla grup różnej wielkości (Steel)
 * Klucz: liczba graczy w grupie, Wartość: lista meczów [gracz1, gracz2, sędzia]
 */
export const REFEREE_SCHEMES = {
    3: [
        [1, 2, 3],  // Mecz 1: 1 vs 2, sędzia: 3
        [1, 3, 2],  // Mecz 2: 1 vs 3, sędzia: 2
        [2, 3, 1],  // Mecz 3: 2 vs 3, sędzia: 1
    ],
    4: [
        [1, 2, 3],  // Mecz 1
        [3, 4, 2],  // Mecz 2
        [1, 3, 4],  // Mecz 3
        [2, 4, 1],  // Mecz 4
        [1, 4, 3],  // Mecz 5
        [2, 3, 4],  // Mecz 6
    ],
    5: [
        [1, 2, 3],  // Mecz 1
        [3, 4, 5],  // Mecz 2
        [1, 5, 2],  // Mecz 3
        [2, 3, 4],  // Mecz 4
        [4, 5, 1],  // Mecz 5
        [1, 3, 5],  // Mecz 6
        [2, 4, 3],  // Mecz 7
        [3, 5, 1],  // Mecz 8
        [1, 4, 2],  // Mecz 9
        [2, 5, 4],  // Mecz 10
    ],
    6: [
        [1, 2, 3],  // Mecz 1
        [4, 5, 6],  // Mecz 2
        [3, 6, 1],  // Mecz 3
        [1, 4, 2],  // Mecz 4
        [2, 5, 3],  // Mecz 5
        [3, 4, 6],  // Mecz 6
        [1, 6, 5],  // Mecz 7
        [2, 3, 4],  // Mecz 8
        [5, 6, 1],  // Mecz 9
        [1, 5, 4],  // Mecz 10
        [2, 6, 3],  // Mecz 11
        [3, 5, 2],  // Mecz 12
        [1, 3, 6],  // Mecz 13
        [4, 6, 5],  // Mecz 14
        [2, 4, 1],  // Mecz 15
    ],
};

/**
 * Oblicza liczbę meczów w grupie na podstawie liczby graczy
 * Wzór: n * (n-1) / 2
 * @param {number} playerCount - Liczba graczy
 * @returns {number} Liczba meczów
 */
export function calculateGroupMatches(playerCount) {
    return (playerCount * (playerCount - 1)) / 2;
}

/**
 * Generuje sędziego dla meczu w grupie na podstawie schematu
 * @param {number} matchOrder - Numer meczu w grupie (1-based)
 * @param {Array} players - Lista graczy w grupie
 * @param {boolean} isSteelType - Czy to turniej Steel
 * @returns {Object|null} Obiekt z danymi sędziego lub null
 */
export function getRefereeForMatch(matchOrder, players, isSteelType) {
    if (!isSteelType || !players || players.length < 3) {
        return null;
    }

    const playerCount = players.length;
    const scheme = REFEREE_SCHEMES[playerCount];

    if (!scheme || matchOrder < 1 || matchOrder > scheme.length) {
        return null;
    }

    const [p1Idx, p2Idx, refIdx] = scheme[matchOrder - 1];

    return {
        player1Position: p1Idx,
        player2Position: p2Idx,
        refereePosition: refIdx,
        refereeName: players[refIdx - 1]?.name || null,
    };
}

/**
 * Parsuje numer tarczy z tekstu memo grupy
 * @param {string} memoText - Tekst z .rr_memo
 * @returns {number|null} Numer tarczy lub null
 */
export function parseGroupStationNumber(memoText) {
    if (!memoText) return null;

    // Szukaj wzorca "Tarcza X" lub "Board X"
    const match = memoText.match(/(?:tarcza|board)\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Parsuje wynik meczu grupowego z komórki tabeli
 * @param {string} cellText - Tekst komórki (np. "2 - 1" lub "2 - 1\n(63.51)")
 * @returns {Object} Obiekt z wynikami {player1: number, player2: number}
 */
export function parseGroupMatchScore(cellText) {
    if (!cellText) {
        return { player1: 0, player2: 0 };
    }

    // Usuń średnią jeśli jest
    const textWithoutAvg = cellText.replace(/\([^)]+\)/g, '').trim();

    // Format "X - Y"
    const match = textWithoutAvg.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (match) {
        return {
            player1: parseInt(match[1], 10) || 0,
            player2: parseInt(match[2], 10) || 0
        };
    }

    return { player1: 0, player2: 0 };
}

/**
 * Określa status meczu grupowego na podstawie klasy komórki i zawartości
 * @param {Object} cellData - Dane komórki
 * @returns {string} Status: 'active', 'pending', 'finished'
 */
export function determineGroupMatchStatus(cellData) {
    const { hasFixGame, hasActiveBackground, hasRrIdx, scoreText } = cellData;

    // Zakończony - ma klasę fix_game
    if (hasFixGame) {
        return 'finished';
    }

    // Aktywny - ma czerwone tło (Steel)
    if (hasActiveBackground) {
        return 'active';
    }

    // Oczekujący - ma numer kolejności (rr_idx) lub brak wyniku
    if (hasRrIdx || !scoreText) {
        return 'pending';
    }

    return 'pending';
}

/**
 * Generuje listę meczów grupowych na podstawie liczby graczy
 * Każdy mecz między parą graczy występuje raz
 * @param {Array} players - Lista graczy
 * @returns {Array} Lista par graczy
 */
export function generateGroupMatchPairs(players) {
    const pairs = [];

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            pairs.push({
                player1Index: i,
                player2Index: j,
                player1: players[i],
                player2: players[j],
            });
        }
    }

    return pairs;
}

/**
 * Parsuje średnią gracza z tekstu
 * @param {string} text - Tekst zawierający średnią (np. "(72.60)")
 * @returns {number|null} Średnia lub null
 */
export function parsePlayerAverage(text) {
    if (!text) return null;

    const match = text.match(/\((\d+\.?\d*)\)/);
    return match ? parseFloat(match[1]) : null;
}
