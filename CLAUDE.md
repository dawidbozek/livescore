# CLAUDE.md - Darts Live Score v2

## Opis projektu

System wyników na żywo dla Mistrzostw Polski w Darcie. Składa się z:
- **Scraper** - pobiera dane meczów z n01darts.com co 30 sekund
- **Frontend** - wyświetla wyniki na żywo w przeglądarce
- **Baza danych** - Supabase (PostgreSQL)

## Repozytorium

**GitHub:** https://github.com/dawidbozek/livescore

## Wersja 2.0 - Zmiany

### Nowe funkcje
- **Typ darta** - rozróżnienie Steel Tip / Soft Tip z ikonami
- **Kategorie turniejów** - indywidualny, deblowy, triple mieszane, drużynowy
- **Rozszerzone dane turniejów** - godzina startu, wpisowe, nagrody, format
- **Nowy DateSelector** - opcja "Wszystkie aktywne" (pobiera turnieje bez filtra po dacie)
- **Zwijane zakończone mecze** - sekcja z kolapsem
- **Modal szczegółów turnieju** - popup z pełnymi informacjami
- **Header z logo** - sticky header z miejscem na hamburger menu
- **Banner** - miejsce na baner MP2026

### Zmiany w UI
- **Nowy kolor główny** - #C1272D (czerwony)
- **Responsywność 320px+** - minimalna szerokość 320px
- **Touch-friendly** - przyciski min 44px
- **Redesign MatchCard** - numer tarczy jako duże kółko dla aktywnych meczów

## Deployment (Produkcja)

| Komponent | Hosting | URL/Lokalizacja |
|-----------|---------|-----------------|
| **Frontend** | Netlify | (twój-url.netlify.app) |
| **Scraper** | Mikrus (VPS) | ~/livescore/scraper |
| **Baza danych** | Supabase | (twój-projekt.supabase.co) |

### Zmienne środowiskowe (produkcja)

**Netlify** (frontend):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

**Mikrus** (scraper - plik `~/livescore/scraper/.env`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SCRAPE_INTERVAL_MS=30000`

## Struktura projektu

```
Scraper N01/
├── frontend/           # Aplikacja Next.js (TypeScript)
│   ├── app/            # App Router (Next.js 14+)
│   │   ├── api/        # API Routes
│   │   │   ├── tournaments/route.ts
│   │   │   ├── matches/route.ts
│   │   │   └── admin/
│   │   │       ├── auth/route.ts
│   │   │       └── tournaments/route.ts
│   │   ├── admin/page.tsx    # Panel administracyjny
│   │   ├── page.tsx          # Strona główna
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/     # Komponenty React
│   │   ├── ui/         # Shadcn-like komponenty bazowe
│   │   ├── Header.tsx        # NEW: Header z logo
│   │   ├── Banner.tsx        # NEW: Banner MP2026
│   │   ├── ActiveMatches.tsx
│   │   ├── PendingMatches.tsx
│   │   ├── FinishedMatches.tsx   # NEW: Zwijana sekcja
│   │   ├── MatchCard.tsx
│   │   ├── TournamentList.tsx
│   │   ├── TournamentInfoModal.tsx  # NEW: Modal szczegółów
│   │   ├── SearchBar.tsx
│   │   └── DateSelector.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useMatches.ts     # Pobieranie meczów z polling
│   │   └── useTournaments.ts
│   ├── lib/            # Biblioteki i typy
│   │   ├── supabase.ts       # Klient Supabase
│   │   ├── types.ts          # Typy TypeScript
│   │   └── utils.ts          # Funkcje pomocnicze
│   ├── public/
│   │   └── images/           # NEW: Grafiki (logo, banner)
│   ├── .env.local            # Zmienne środowiskowe (nie commitować!)
│   └── package.json
│
├── scraper/            # Scraper Node.js
│   ├── src/
│   │   ├── index.js          # Główna pętla aplikacji
│   │   ├── scraper.js        # Logika Puppeteer
│   │   ├── parser.js         # Parsowanie HTML z n01darts.com
│   │   ├── database.js       # Operacje Supabase
│   │   └── utils.js          # Funkcje pomocnicze
│   ├── .env                  # Zmienne środowiskowe (nie commitować!)
│   └── package.json
│
├── supabase/
│   └── schema.sql      # Schema bazy danych
│
└── CLAUDE.md           # Ten plik
```

## Migracja bazy danych (v2)

**WAŻNE:** Przed deployem wersji 2.0, wykonaj poniższy SQL w Supabase SQL Editor:

```sql
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS dart_type VARCHAR(10) DEFAULT 'steel',
ADD COLUMN IF NOT EXISTS category VARCHAR(20),
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS entry_fee VARCHAR(50),
ADD COLUMN IF NOT EXISTS prizes TEXT,
ADD COLUMN IF NOT EXISTS format VARCHAR(100),
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE tournaments
ADD CONSTRAINT check_dart_type CHECK (dart_type IN ('soft', 'steel'));

ALTER TABLE tournaments
ADD CONSTRAINT check_category CHECK (category IS NULL OR category IN ('indywidualny', 'deblowy', 'triple_mieszane', 'druzynowy'));
```

## Grafiki

Zapisz pliki do `frontend/public/images/`:
- `logo-darts-polska.png` - logo w headerze (wysokość ~40px)
- `banner-mp2026.png` - banner pod headerem (proporcje ~3:1)

## Uruchomienie projektu

### 1. Konfiguracja Supabase
1. Utwórz projekt na https://supabase.com
2. Wykonaj SQL z `supabase/schema.sql` w SQL Editor
3. Skopiuj URL i klucze z Settings > API

### 2. Konfiguracja zmiennych środowiskowych

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

**Scraper** (`scraper/.env`):
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SCRAPE_INTERVAL_MS=30000
```

### 3. Instalacja zależności
```bash
# Frontend
cd frontend
npm install

# Scraper
cd ../scraper
npm install
```

### 4. Uruchomienie (każde w osobnym terminalu)

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Otwórz: http://localhost:3000

**Terminal 2 - Scraper:**
```bash
cd scraper
npm start
```

## Technologie

### Frontend
- **Next.js 16** - React framework z App Router
- **TypeScript** - typowanie statyczne
- **Tailwind CSS** - stylowanie
- **Fuse.js** - wyszukiwanie fuzzy
- **Lucide React** - ikony
- **Supabase JS** - klient bazy danych

### Scraper
- **Node.js 18+** - runtime
- **Puppeteer** - headless browser do scrapowania
- **Supabase JS** - klient bazy danych
- **dotenv** - zmienne środowiskowe

### Baza danych
- **Supabase** (PostgreSQL)
- Row Level Security (RLS) włączone
- Automatyczne `updated_at` przez triggery

## API Endpoints

### Publiczne
- `GET /api/tournaments?date=YYYY-MM-DD` - lista aktywnych turniejów dla daty
- `GET /api/tournaments?active_only=true` - wszystkie aktywne turnieje (bez filtra daty)
- `GET /api/matches?date=YYYY-MM-DD&tournament_id=UUID` - lista meczów dla daty
- `GET /api/matches?active_only=true` - wszystkie mecze z aktywnych turniejów

### Admin (wymagają autoryzacji)
- `POST /api/admin/auth` - logowanie (hasło: `DartsMP2026!`)
- `GET /api/admin/tournaments?date=YYYY-MM-DD` - wszystkie turnieje
- `POST /api/admin/tournaments` - dodaj turniej
- `PUT /api/admin/tournaments` - edytuj turniej
- `DELETE /api/admin/tournaments?id=UUID` - usuń turniej

## Baza danych - Tabele

### tournaments
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Nazwa turnieju |
| n01_url | TEXT | URL do n01darts.com |
| tournament_date | DATE | Data turnieju |
| is_active | BOOLEAN | Czy aktywny |
| dart_type | VARCHAR(10) | 'steel' lub 'soft' |
| category | VARCHAR(20) | Kategoria turnieju |
| start_time | TIME | Godzina startu |
| entry_fee | VARCHAR(50) | Wpisowe |
| prizes | TEXT | Nagrody |
| format | VARCHAR(100) | Format turnieju |
| image_url | TEXT | URL grafiki |
| created_at | TIMESTAMP | Data utworzenia |
| updated_at | TIMESTAMP | Data aktualizacji |

### matches
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| tournament_id | UUID | FK do tournaments |
| n01_match_id | VARCHAR(100) | Unikalny ID meczu |
| player1_name | VARCHAR(255) | Gracz 1 |
| player2_name | VARCHAR(255) | Gracz 2 |
| player1_score | INTEGER | Wynik gracza 1 |
| player2_score | INTEGER | Wynik gracza 2 |
| station_number | INTEGER | Numer tarczy/stanowiska |
| referee | VARCHAR(255) | Sędzia |
| status | VARCHAR(50) | 'active', 'pending', 'finished', 'walkover' |
| raw_html | TEXT | Surowy HTML (debug) |

### admin_settings
| Kolumna | Typ | Opis |
|---------|-----|------|
| key | VARCHAR(100) | Klucz ustawienia |
| value | TEXT | Wartość |

## Statusy meczów

| Status | Opis | Wyświetlanie |
|--------|------|--------------|
| `active` | Mecz w trakcie (ma przypisaną tarcze) | Zielona sekcja na górze |
| `pending` | Mecz oczekujący | Żółta sekcja |
| `finished` | Mecz zakończony | Szara sekcja (zwijana) |
| `walkover` | Walkover | Szara sekcja (opacity 50%) |

## Przepływ danych

1. **Admin** dodaje turniej z URL do n01darts.com w panelu `/admin`
2. **Scraper** co 30s:
   - Pobiera aktywne turnieje z Supabase
   - Otwiera stronę n01darts.com przez Puppeteer
   - Parsuje HTML i wyciąga dane meczów
   - Zapisuje/aktualizuje mecze w Supabase (upsert)
3. **Frontend** co 15s:
   - Pobiera mecze z API
   - Grupuje według statusu
   - Wyświetla w odpowiednich sekcjach

## Konwencje kodu

### TypeScript
- Używaj strict mode
- Definiuj typy w `lib/types.ts`
- Eksportuj typy z `type` keyword

### React
- Komponenty funkcyjne z hooks
- `'use client'` dla komponentów interaktywnych
- Custom hooks dla logiki pobierania danych

### Nazewnictwo
- Komponenty: PascalCase (`MatchCard.tsx`)
- Funkcje/zmienne: camelCase (`fetchMatches`)
- Pliki: kebab-case lub PascalCase dla komponentów
- Tabele DB: snake_case (`player1_name`)

## Kolory (v2)

| Nazwa | Wartość | Użycie |
|-------|---------|--------|
| Primary | #C1272D | Główny kolor (przyciski, akcenty) |
| Primary Hover | #A01F25 | Hover state |
| Success/Green | #15803D | Aktywne mecze, zielony status |
| Soft Tip | #3B82F6 | Ikona Soft darts |
| Steel Tip | #6B7280 | Ikona Steel darts |

## Debugowanie

### Frontend nie ładuje się
1. Sprawdź czy port 3000 jest wolny: `netstat -an | grep 3000`
2. Zabij stary proces: `powershell -Command "Stop-Process -Id PID -Force"`
3. Restart: `npm run dev`

### Scraper nie pobiera meczów
1. Sprawdź logi w terminalu
2. Upewnij się, że URL turnieju jest poprawny
3. Sprawdź czy strona n01darts.com jest dostępna
4. Zweryfikuj klucz Supabase (musi być `service_role`)

### Turniej nie pokazuje się na froncie
1. Sprawdź czy turniej jest oznaczony jako aktywny
2. Użyj "Wszystkie aktywne" w DateSelector
3. Odśwież stronę

## Workflow - praca nad projektem

### 1. Lokalne zmiany
```bash
# Edytuj pliki lokalnie
# Testuj lokalnie (frontend + scraper w osobnych terminalach)
cd frontend && npm run dev
cd scraper && npm start
```

### 2. Commit i push do GitHub
```bash
git add .
git commit -m "Opis zmian"
git push
```

### 3. Deployment

**Frontend (Netlify)** - automatyczny deploy po pushu do GitHub

**Scraper (Mikrus)** - ręczna aktualizacja przez SSH:
```bash
ssh user@mikrus-adres
cd ~/livescore/scraper
git pull
npm install  # tylko jeśli zmienił się package.json
pm2 restart darts-scraper
```

### Przydatne komendy PM2 (Mikrus)
```bash
pm2 status                    # Status wszystkich procesów
pm2 logs darts-scraper        # Logi scrapera (live)
pm2 logs darts-scraper --lines 50  # Ostatnie 50 linii
pm2 restart darts-scraper     # Restart scrapera
pm2 stop darts-scraper        # Zatrzymaj scraper
pm2 start darts-scraper       # Uruchom scraper
pm2 monit                     # Monitor CPU/RAM
```

## Znane problemy

1. **Background jobs w Windows/MINGW** - nie działają poprawnie, serwery trzeba uruchamiać ręcznie w osobnych terminalach
2. **Viewport metadata warning** - ostrzeżenie Next.js, nie wpływa na działanie

## Przyszłe ulepszenia

- [ ] WebSocket zamiast polling dla real-time updates
- [ ] Historia meczów i statystyki graczy
- [ ] Eksport wyników do PDF/Excel
- [ ] Powiadomienia push o zakończonych meczach
- [ ] Dark mode
- [ ] Integracja z główną stroną MP2026 (monorepo)
