# CLAUDE.md - Mistrzostwa Polski w Darcie 2026

## Opis projektu

Oficjalny serwis internetowy **10. Mistrzostw Polski w Darcie** - największego turnieju darta w Polsce.
Wydarzenie: **16-19 lipca 2026**, **Cukrownia Żnin**, **400+ zawodników**.

Serwis pełni funkcje:
- **Informacyjną** - harmonogram, regulaminy, lokalizacja
- **Operacyjną** - wyniki na żywo (Live Score), rejestracja
- **Sprzedażową** - rezerwacja noclegów w Cukrowni
- **Prestiżową** - Turniej Reprezentantów, Hall of Fame

## Repozytorium i hosting

| Komponent | Hosting | URL |
|-----------|---------|-----|
| **Frontend** | Netlify | (twój-url.netlify.app) |
| **Scraper** | Mikrus (VPS) | ~/livescore/scraper |
| **Baza danych** | Supabase | (twój-projekt.supabase.co) |
| **GitHub** | - | https://github.com/dawidbozek/livescore |

## Struktura stron

| URL | Nazwa | Opis |
|-----|-------|------|
| `/` | Strona główna | Hero, countdown, highlights, FAQ |
| `/live` | Live Score | Wyniki meczów na żywo |
| `/turnieje` | Kalendarz | Harmonogram 4 dni turniejów |
| `/rezerwacja` | Noclegi | Formularz rezerwacji, cennik |
| `/jak-dojechac` | Lokalizacja | Mapa, dojazd, parking |
| `/dla-zawodnikow` | Info | Rejestracja, co zabrać, FAQ |
| `/turniej-reprezentantow` | Landing | Hall of Fame, formularz zgłoszenia |
| `/admin` | Panel admina | Zarządzanie turniejami |

## Struktura projektu

```
mp2026/
├── frontend/                    # Next.js 16 (App Router)
│   ├── app/
│   │   ├── page.tsx             # Strona główna
│   │   ├── layout.tsx           # Wspólny layout (Navbar + Footer)
│   │   ├── globals.css          # Style globalne
│   │   ├── live/page.tsx        # Live Score
│   │   ├── turnieje/page.tsx    # Kalendarz turniejów
│   │   ├── rezerwacja/page.tsx  # Formularz rezerwacji
│   │   ├── jak-dojechac/page.tsx # Lokalizacja
│   │   ├── dla-zawodnikow/page.tsx # Info dla graczy
│   │   ├── turniej-reprezentantow/page.tsx # Landing prestiżowy
│   │   ├── admin/page.tsx       # Panel admina
│   │   └── api/                 # API Routes
│   │       ├── tournaments/
│   │       ├── matches/
│   │       └── admin/
│   │
│   ├── components/
│   │   ├── layout/              # Navbar, Footer
│   │   ├── home/                # Hero, Countdown, Highlights, FAQ
│   │   ├── ui/                  # Button, Card, Input (shadcn-like)
│   │   ├── MatchCard.tsx        # Karta meczu
│   │   ├── TournamentList.tsx   # Lista turniejów
│   │   ├── SearchBar.tsx        # Wyszukiwarka
│   │   ├── DateSelector.tsx     # Wybór daty
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useMatches.ts        # Pobieranie meczów
│   │   ├── useTournaments.ts    # Pobieranie turniejów
│   │   └── useCountdown.ts      # Odliczanie do eventu
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Klient Supabase
│   │   ├── types.ts             # Typy TypeScript
│   │   └── utils.ts             # Funkcje pomocnicze
│   │
│   └── public/images/           # Grafiki (logo, banner)
│
├── scraper/                     # Node.js + Puppeteer
│   └── src/
│       ├── index.js             # Główna pętla
│       ├── scraper.js           # Logika Puppeteer
│       ├── parser.js            # Parsowanie HTML
│       └── database.js          # Operacje Supabase
│
├── supabase/schema.sql          # Schema bazy danych
├── netlify.toml                 # Konfiguracja Netlify
├── CLAUDE.md                    # Ten plik
└── Architektura serwisu.md      # Szczegółowa dokumentacja
```

## Technologie

### Frontend
- **Next.js 16** - React framework (App Router)
- **TypeScript** - typowanie statyczne
- **Tailwind CSS** - stylowanie utility-first
- **Lucide React** - ikony
- **Fuse.js** - wyszukiwanie fuzzy

### Backend / Infrastruktura
- **Supabase** - PostgreSQL + API
- **Puppeteer** - scraping n01darts.com
- **Netlify** - hosting frontend
- **PM2** - zarządzanie procesem scrapera

## Kolory

| Nazwa | Wartość | Użycie |
|-------|---------|--------|
| Primary | #C1272D | Główny kolor (przyciski, akcenty) |
| Primary Hover | #A01F25 | Hover state |
| Success | #15803D | Aktywne mecze, zielony status |
| Soft Tip | #3B82F6 | Ikona Soft darts (niebieski) |
| Steel Tip | #EA580C | Ikona Steel darts (pomarańczowy) |

## Zmienne środowiskowe

### Netlify (frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

### Mikrus (scraper)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SCRAPE_INTERVAL_MS=30000
```

## Uruchomienie lokalne

```bash
# Frontend
cd frontend
npm install
npm run dev
# Otwórz: http://localhost:3000

# Scraper (osobny terminal)
cd scraper
npm install
npm start
```

## Deployment

### Frontend (Netlify)
Automatyczny deploy po pushu do GitHub (`main` branch).

### Scraper (Mikrus)
```bash
ssh user@mikrus
cd ~/livescore/scraper
git pull
npm install  # jeśli zmienił się package.json
pm2 restart darts-scraper
```

### Przydatne komendy PM2
```bash
pm2 status                    # Status procesów
pm2 logs darts-scraper        # Logi live
pm2 restart darts-scraper     # Restart
pm2 monit                     # Monitor CPU/RAM
```

## Baza danych

### Tabela: tournaments
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Nazwa turnieju |
| n01_url | TEXT | URL do n01darts.com |
| tournament_date | DATE | Data turnieju |
| is_active | BOOLEAN | Czy aktywny |
| dart_type | VARCHAR(10) | 'steel' / 'soft' |
| category | VARCHAR(20) | indywidualny/deblowy/triple/druzynowy |
| start_time | TIME | Godzina startu |
| entry_fee | VARCHAR(50) | Wpisowe |
| prizes | TEXT | Nagrody |
| format | VARCHAR(100) | Format turnieju |
| image_url | TEXT | URL grafiki |

### Tabela: matches
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| tournament_id | UUID | FK do tournaments |
| n01_match_id | VARCHAR(100) | Unikalny ID meczu |
| player1_name | VARCHAR(255) | Gracz 1 |
| player2_name | VARCHAR(255) | Gracz 2 |
| player1_score | INTEGER | Wynik gracza 1 |
| player2_score | INTEGER | Wynik gracza 2 |
| station_number | INTEGER | Numer tarczy |
| referee | VARCHAR(255) | Sędzia |
| status | VARCHAR(50) | active/pending/finished/walkover |

## API Endpoints

### Publiczne
- `GET /api/tournaments?date=YYYY-MM-DD` - turnieje dla daty
- `GET /api/tournaments?active_only=true` - aktywne turnieje
- `GET /api/matches?date=YYYY-MM-DD` - mecze dla daty
- `GET /api/matches?active_only=true` - mecze z aktywnych turniejów

### Admin
- `POST /api/admin/auth` - logowanie
- `GET/POST/PUT/DELETE /api/admin/tournaments` - CRUD turniejów

## Przepływ danych (Live Score)

1. **Admin** dodaje turniej z URL n01darts.com
2. **Scraper** co 30s pobiera dane meczów z n01
3. **Frontend** co 15s odpytuje API i wyświetla wyniki

## Integracje (TODO)

- [ ] **Airtable** - formularze rezerwacji i zgłoszeń
- [ ] **Google Maps** - embed mapy na /jak-dojechac
- [ ] **YouTube** - embedy video na /turniej-reprezentantow

## Znane problemy

1. **Hydration SSR/CSR** - komponenty z `Date()` muszą używać `useEffect` dla obliczeń
2. **Netlify build** - wymaga `netlify.toml` z `base = "frontend"`

## Konwencje kodu

- **Komponenty**: PascalCase (`MatchCard.tsx`)
- **Funkcje/zmienne**: camelCase (`fetchMatches`)
- **Tabele DB**: snake_case (`player1_name`)
- **'use client'** dla komponentów interaktywnych
- **min-h-[44px]** dla touch targets (przyciski)
- **min-w-[320px]** minimalna szerokość strony

## Kontakt

**Organizator:** Stowarzyszenie Darts Polska
**Telefon:** 693 19 00 20
**Email:** kontakt@dartspolska.pl
