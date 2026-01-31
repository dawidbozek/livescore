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
| **Scraper** | **Railway** | Auto-deploy z GitHub |
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
livescore/
├── frontend/                    # Next.js 16 (App Router)
│   ├── app/
│   │   ├── page.tsx             # Strona główna
│   │   ├── layout.tsx           # Wspólny layout (Navbar + Footer)
│   │   ├── globals.css          # Style globalne
│   │   ├── error.tsx            # Error boundary
│   │   ├── global-error.tsx     # Critical error fallback
│   │   ├── live/page.tsx        # Live Score
│   │   ├── turnieje/page.tsx    # Kalendarz turniejów
│   │   ├── rezerwacja/page.tsx  # Formularz rezerwacji
│   │   ├── jak-dojechac/page.tsx # Lokalizacja
│   │   ├── dla-zawodnikow/page.tsx # Info dla graczy
│   │   ├── turniej-reprezentantow/page.tsx # Landing prestiżowy
│   │   ├── admin/page.tsx       # Panel admina
│   │   └── api/                 # API Routes
│   │
│   ├── components/
│   │   ├── layout/              # Navbar, Footer
│   │   ├── home/                # Hero, Countdown, Highlights, FAQ
│   │   ├── ui/                  # Button, Card, Input (shadcn-like)
│   │   ├── MatchCard.tsx        # Karta meczu
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useMatches.ts        # Hook z polling dla meczów
│   │   └── useGroups.ts         # Hook z polling dla grup
│   ├── lib/
│   │   ├── auth.ts              # Helper weryfikacji sesji admin
│   │   ├── supabase.ts          # Klient Supabase
│   │   ├── types.ts             # Typy TypeScript
│   │   └── utils.ts             # Utility functions
│   └── public/images/           # Grafiki (logo, banner)
│
├── scraper/                     # Node.js + Puppeteer (Railway)
│   ├── Dockerfile               # Debian + Chromium
│   ├── railway.toml             # Konfiguracja Railway (w rootcie repo)
│   └── src/
│       ├── index.js             # Główna pętla
│       ├── scraper.js           # Logika Puppeteer
│       ├── parser.js            # Parsowanie HTML
│       └── database.js          # Operacje Supabase
│
├── railway.toml                 # Railway config (root - wskazuje na scraper/Dockerfile)
├── netlify.toml                 # Konfiguracja Netlify
└── CLAUDE.md                    # Ten plik
```

## Technologie

### Frontend
- **Next.js 16** - React framework (App Router)
- **TypeScript** - typowanie statyczne
- **Tailwind CSS** - stylowanie utility-first
- **Lucide React** - ikony
- **Fuse.js** - wyszukiwanie fuzzy
- **bcryptjs** - hashowanie haseł

### Backend / Infrastruktura
- **Supabase** - PostgreSQL + API
- **Puppeteer** - scraping n01darts.com
- **Railway** - hosting scrapera (Docker)
- **Netlify** - hosting frontend

## Bezpieczeństwo

### Autentykacja admina
- **HTTP-only cookies** - sesja przechowywana w secure cookie (nie sessionStorage)
- **bcrypt** - hasła hashowane z 12 rundami
- **Middleware auth** - wszystkie endpointy admin wymagają weryfikacji sesji
- **Auto-migracja** - stare hasła plaintext automatycznie hashowane przy logowaniu

### Pliki auth:
- `frontend/lib/auth.ts` - helper do weryfikacji sesji
- `frontend/app/api/admin/auth/route.ts` - logowanie, wylogowanie, zmiana hasła

### Tabela: admin_settings
| Kolumna | Typ | Opis |
|---------|-----|------|
| key | VARCHAR | 'admin_password_hash' |
| value | TEXT | Hash bcrypt hasła |

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

### Railway (scraper)
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

### Scraper (Railway)
Automatyczny deploy po pushu do GitHub (`main` branch).

**Konfiguracja Railway:**
- `railway.toml` w rootcie repo wskazuje na `scraper/Dockerfile`
- Dockerfile używa `node:22-bookworm-slim` + Chromium z Debian
- Zmienne środowiskowe ustawione w Railway Dashboard → Variables

**Dockerfile (scraper/Dockerfile):**
```dockerfile
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y chromium ...
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

## Baza danych

### Tabela: tournaments
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Nazwa turnieju |
| n01_url | TEXT | URL do n01darts.com |
| tournament_date | DATE | Data turnieju (informacyjnie) |
| **is_active** | BOOLEAN | **Czy scraper ma pobierać dane** |
| dart_type | VARCHAR(10) | 'steel' / 'soft' |
| category | VARCHAR(20) | indywidualny/deblowy/triple/druzynowy |

**WAŻNE:** Scraper pobiera wszystkie turnieje z `is_active = true` (bez filtrowania po dacie).

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

### Tabele: groups, group_matches
Dla turniejów z fazą grupową (Round Robin).

## Przepływ danych (Live Score)

1. **Admin** dodaje turniej z URL n01darts.com, ustawia `is_active = true`
2. **Scraper** (Railway) co 30s pobiera dane meczów z n01
3. **Frontend** co 15s odpytuje API i wyświetla wyniki
4. Po zakończeniu turnieju admin ustawia `is_active = false`

## Integracje (TODO)

- [ ] **Airtable** - formularze rezerwacji i zgłoszeń
- [ ] **Google Maps** - embed mapy na /jak-dojechac
- [ ] **YouTube** - embedy video na /turniej-reprezentantow

## Znane problemy

1. **Hydration SSR/CSR** - komponenty z `Date()` muszą używać `useEffect`
2. **Netlify build** - wymaga `netlify.toml` z `base = "frontend"`
3. **Scraper działa non-stop** - nawet gdy brak aktywnych turniejów (do optymalizacji)
4. **Parser statystyk Steel** - wyświetla numery zamiast nazw graczy (do naprawy)

## Error handling

- **error.tsx** - error boundary dla błędów w app (z przyciskiem retry)
- **global-error.tsx** - fallback dla krytycznych błędów
- **AbortController** - w hookach useMatches/useGroups (zapobiega memory leaks)

## Konwencje kodu

- **Komponenty**: PascalCase (`MatchCard.tsx`)
- **Funkcje/zmienne**: camelCase (`fetchMatches`)
- **Tabele DB**: snake_case (`player1_name`)
- **'use client'** dla komponentów interaktywnych
- **min-h-[44px]** dla touch targets (przyciski)

## Kontakt

**Organizator:** Stowarzyszenie Darts Polska
**Telefon:** 693 19 00 20
**Email:** kontakt@dartspolska.pl
