# N01 Darts Scraper

Scraper do pobierania danych o meczach z serwisu n01darts.com dla systemu Live Score Mistrzostw Polski w Darcie.

## Wymagania

- Node.js 18+
- Chromium (instalowany automatycznie przez Puppeteer)

## Instalacja

```bash
npm install
```

## Konfiguracja

Skopiuj plik `.env.example` do `.env` i uzupełnij zmienne:

```bash
cp .env.example .env
```

### Zmienne środowiskowe

| Zmienna | Opis | Wartość domyślna |
|---------|------|------------------|
| `SUPABASE_URL` | URL projektu Supabase | - |
| `SUPABASE_SERVICE_KEY` | Klucz service_role Supabase | - |
| `SCRAPE_INTERVAL_MS` | Interwał scrapowania w ms | 30000 |

## Uruchomienie

### Produkcja
```bash
npm start
```

### Development (z auto-reload)
```bash
npm run dev
```

## Struktura plików

```
scraper/
├── src/
│   ├── index.js      # Główna pętla aplikacji
│   ├── scraper.js    # Logika Puppeteer
│   ├── parser.js     # Parsowanie HTML
│   ├── database.js   # Operacje Supabase
│   └── utils.js      # Funkcje pomocnicze
├── package.json
├── .env.example
└── README.md
```

## Jak to działa

1. Co 30 sekund (konfigurowalne) scraper pobiera listę aktywnych turniejów z bazy danych
2. Dla każdego turnieju otwiera stronę n01darts.com
3. Parsuje HTML strony w poszukiwaniu meczów
4. Zapisuje/aktualizuje dane meczów w Supabase

## Statusy meczów

| Status | Opis |
|--------|------|
| `active` | Mecz w trakcie (ma przypisaną tarcze) |
| `pending` | Mecz oczekujący |
| `finished` | Mecz zakończony |
| `walkover` | Walkover |

## Debugowanie

Scraper loguje wszystkie operacje z timestampem. W przypadku problemów:

1. Sprawdź logi pod kątem błędów
2. Upewnij się, że URL turnieju jest poprawny
3. Sprawdź czy strona n01darts.com jest dostępna
4. Zweryfikuj uprawnienia klucza Supabase (musi być `service_role`)

## Statystyki

Scraper wyświetla statystyki co 5 minut:
- Czas działania (uptime)
- Liczba scrapowań (udane/nieudane)
- Success rate
- Łączna liczba znalezionych meczów
- Liczba aktywnych turniejów
