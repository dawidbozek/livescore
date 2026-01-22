# ARCHITEKTURA SERWISU - Mistrzostwa Polski w Darcie 2026

## 🎯 WIZJA PROJEKTU

Oficjalny serwis internetowy **10. Mistrzostw Polski w Darcie** - największego turnieju darta w Polsce. Wydarzenie odbędzie się **16-19 lipca 2026** w **Cukrowni Żnin** z udziałem **400+ zawodników** z całej Europy.

Serwis ma pełnić funkcje:
- **Informacyjną** - harmonogram, regulaminy, lokalizacja
- **Operacyjną** - wyniki na żywo (Live Score), rejestracja
- **Sprzedażową** - rezerwacja noclegów w Cukrowni
- **Prestiżową** - budowanie marki wydarzenia

---

## 🏗️ ARCHITEKTURA TECHNICZNA

### Stack technologiczny

| Warstwa | Technologia | Uwagi |
|---------|-------------|-------|
| Framework | Next.js 14+ (App Router) | TypeScript, Server Components |
| Styling | Tailwind CSS | + custom design system |
| Baza danych | Supabase (PostgreSQL) | Wspólna dla całego serwisu |
| Integracje | Airtable (rezerwacje), YouTube (embedy) | |
| Scraping | Node.js + Puppeteer | Osobny serwis dla Live Score |
| Hosting | Netlify lub Vercel | CI/CD z GitHub |
| Domena | mp2026.dartspolska.pl (przykład) | |

### Struktura projektu (monorepo)

```
mp2026/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (navbar, footer)
│   ├── page.tsx                  # Strona główna
│   │
│   ├── live/                     # 🎯 LIVE SCORE
│   │   └── page.tsx
│   │
│   ├── turnieje/                 # 📅 KALENDARZ TURNIEJÓW
│   │   └── page.tsx
│   │
│   ├── turniej-reprezentantow/   # 🏆 LANDING PRESTIŻOWY
│   │   └── page.tsx
│   │
│   ├── rezerwacja/               # 🏨 NOCLEGI
│   │   └── page.tsx
│   │
│   ├── jak-dojechac/             # 📍 LOKALIZACJA
│   │   └── page.tsx
│   │
│   ├── dla-zawodnikow/           # 📋 HUB INFORMACYJNY
│   │   └── page.tsx
│   │
│   ├── wyniki/                   # 🏅 ARCHIWUM (później)
│   │   └── page.tsx
│   │
│   ├── galeria/                  # 📸 ZDJĘCIA/VIDEO (później)
│   │   └── page.tsx
│   │
│   ├── kontakt/                  # 📞 KONTAKT (później)
│   │   └── page.tsx
│   │
│   ├── admin/                    # 👨‍💼 PANEL ADMINA
│   │   ├── page.tsx
│   │   ├── tournaments/
│   │   └── reservations/
│   │
│   └── api/                      # API ROUTES
│       ├── tournaments/
│       ├── matches/
│       ├── reservations/
│       └── admin/
│
├── components/
│   ├── layout/                   # Navbar, Footer, MobileMenu
│   ├── home/                     # Hero, Countdown, Highlights
│   ├── live/                     # MatchCard, SearchBar, DateSelector
│   ├── tournaments/              # TournamentCard, TournamentModal
│   ├── reservation/              # ReservationForm, PriceTable
│   └── ui/                       # Button, Input, Modal, Card (shared)
│
├── lib/
│   ├── supabase.ts               # Klient Supabase
│   ├── airtable.ts               # Klient Airtable
│   ├── types.ts                  # Typy TypeScript
│   └── utils.ts                  # Funkcje pomocnicze
│
├── hooks/
│   ├── useMatches.ts
│   ├── useTournaments.ts
│   └── useCountdown.ts
│
├── public/
│   ├── images/
│   │   ├── logo-darts-polska.png
│   │   ├── banner-mp2026.png
│   │   ├── hero-video.mp4         # Aftermovie
│   │   ├── cukrownia/             # Zdjęcia obiektu
│   │   └── winners/               # Zdjęcia zwycięzców
│   └── documents/
│       ├── regulamin-mp2026.pdf
│       └── zaproszenie-tr.pdf
│
├── scraper/                      # Osobny serwis
│   ├── src/
│   └── package.json
│
├── styles/
│   └── globals.css
│
├── CLAUDE.md                     # Kontekst dla Claude Code
└── package.json
```

---

## 🗄️ BAZA DANYCH (Supabase)

### Diagram relacji

```
┌─────────────────┐     ┌─────────────────┐
│   tournaments   │────<│     matches     │
└─────────────────┘     └─────────────────┘
        │
        │ (wspólna tabela dla Live Score i Kalendarza)
        │
┌─────────────────┐     ┌─────────────────┐
│  reservations   │     │  admin_settings │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    gallery      │     │   hall_of_fame  │
└─────────────────┘     └─────────────────┘
   (przyszłość)            (przyszłość)
```

### Tabela: `tournaments`

```sql
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Podstawowe
    name VARCHAR(255) NOT NULL,
    tournament_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    
    -- Typ i kategoria
    dart_type VARCHAR(10) DEFAULT 'steel',  -- 'soft' | 'steel'
    category VARCHAR(20),                    -- 'indywidualny' | 'deblowy' | 'triple_mieszane' | 'druzynowy'
    
    -- Szczegóły
    start_time TIME,
    entry_fee VARCHAR(50),
    prizes TEXT,
    format VARCHAR(100),
    description TEXT,
    
    -- Media
    image_url TEXT,
    n01_url TEXT,
    challonge_url TEXT,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `matches`

```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    
    -- Identyfikator z n01
    n01_match_id VARCHAR(100) NOT NULL,
    
    -- Gracze
    player1_name VARCHAR(255),
    player2_name VARCHAR(255),
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    
    -- Lokalizacja i sędzia
    station_number INTEGER,
    referee VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- 'active' | 'pending' | 'finished' | 'walkover'
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(tournament_id, n01_match_id)
);
```

### Tabela: `reservations` (integracja z Airtable)

```sql
-- Opcja A: Dane w Supabase (backup)
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dane osobowe
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Rezerwacja
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    guests_count INTEGER DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    
    -- Dodatkowe
    notes TEXT,
    airtable_id VARCHAR(50),  -- ID z Airtable
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'cancelled'
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opcja B: Tylko Airtable (bez Supabase)
-- Formularz → Airtable API → potwierdzenie email
```

### Tabela: `hall_of_fame` (przyszłość)

```sql
CREATE TABLE hall_of_fame (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    tournament_name VARCHAR(255) NOT NULL,
    
    -- Zwycięzca
    winner_name VARCHAR(255) NOT NULL,
    winner_club VARCHAR(255),
    winner_photo_url TEXT,
    
    -- Statystyki
    average DECIMAL(5,2),
    highest_checkout INTEGER,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📄 MAPA PODSTRON

### 🏠 Strona Główna (`/`)

**Cel:** Pierwsze wrażenie, kluczowe CTA, nawigacja do sekcji.

**Sekcje:**
1. **Hero** - video aftermovie w tle, nagłówek "MISTRZOSTWA POLSKI 2026 • 10 LAT PASJI", CTA "ZAREZERWUJ POKÓJ"
2. **Live Score Widget** - WARUNKOWY! Pojawia się 16.07.2026 o 08:00, przycisk "ZOBACZ KTO TERAZ GRA"
3. **Countdown** - odliczanie do wydarzenia
4. **Highlights** - liczby: 400+ zawodników, 4 dni, 10 edycja, 50 stanowisk
5. **Kalendarz mini** - podział na 4 dni, karty turniejów
6. **Sekcja rezerwacji** - krótki opis + CTA "ZAREZERWUJ NOCLEG"
7. **Turniej Reprezentantów** - boks prestiżowy, CTA "ZOSTAŃ AMBASADOREM"
8. **Galeria mini** - siatka 3x3 ze zdjęciami
9. **FAQ** - akordeon z najczęstszymi pytaniami
10. **Footer** - kontakt, social media, partnerzy

**Komponenty:**
- `Hero.tsx` - z video background
- `LiveScoreWidget.tsx` - warunkowy (date-fns sprawdza datę)
- `Countdown.tsx` - hook useCountdown
- `Highlights.tsx` - statyczne liczby
- `CalendarPreview.tsx` - mini wersja kalendarza
- `FAQ.tsx` - akordeon UI

**Logika warunkowa Live Score:**
```typescript
const EVENT_START = new Date('2026-07-16T08:00:00');
const showLiveScore = new Date() >= EVENT_START;
```

---

### 🎯 Live Score (`/live`)

**Cel:** Wyniki na żywo podczas turnieju. Główny moduł operacyjny.

**Status:** ✅ Zbudowane (v1), w trakcie poprawek (v2)

**Szczegóły:** Zobacz `livescore-v2-prompt.md`

---

### 📅 Kalendarz Turniejów (`/turnieje`)

**Cel:** Pełny harmonogram wszystkich turniejów z szczegółami.

**Layout:**
```
┌─────────────────────────────────────────┐
│           KALENDARZ TURNIEJÓW           │
│      Sprawdź co i kiedy możesz zagrać   │
├─────────────────────────────────────────┤
│  [CZWARTEK]  [PIĄTEK]  [SOBOTA]  [NIEDZIELA]  │  ← Tabs
├─────────────────────────────────────────┤
│                                         │
│  CZWARTEK, 16 LIPCA                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎯 09:00 - Warmup Open          │   │
│  │ Steel • Indywidualny • 50 zł   │   │
│  │ [Szczegóły] [Drabinka n01]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏆 14:00 - Soft Open            │   │
│  │ Soft • Indywidualny • 40 zł    │   │
│  │ [Szczegóły] [Drabinka n01]     │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  📋 ŚCIEŻKA DO KADRY                    │
│  MP to oficjalna kwalifikacja do ME EDF │
│  w Słowenii. 10 nominacji: ...          │
├─────────────────────────────────────────┤
│  📄 [POBIERZ REGULAMIN PDF]             │
└─────────────────────────────────────────┘
```

**Funkcjonalności:**
- Tabs dla 4 dni (czw-ndz)
- Karty turniejów z kluczowymi info
- Popup ze szczegółami (ten sam co w Live Score)
- Linki do n01/Challonge
- Sekcja o nominacjach do kadry
- Download regulaminu PDF

**Dane:** Współdzielona tabela `tournaments` z Supabase

---

### 🏆 Turniej Reprezentantów (`/turniej-reprezentantow`)

**Cel:** Landing page prestiżowy dla specjalnego turnieju organizacji.

**Layout:**
```
┌─────────────────────────────────────────┐
│              HERO TURNIEJU              │
│    "TURNIEJ REPREZENTANTÓW 2026"        │
│    Pula nagród: 12 800 zł               │
│    128 zawodników • 36+ organizacji     │
├─────────────────────────────────────────┤
│  O TURNIEJU                             │
│  Opis unikalnej formuły - każda         │
│  organizacja wystawia swoich najlepszych│
│  zawodników...                          │
├─────────────────────────────────────────┤
│  HALL OF FAME                           │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ 📷  │ │ 📷  │ │ 📷  │              │
│  │2024 │ │2023 │ │2022 │              │
│  │Janas│ │Kciuk│ │...  │              │
│  │74.74│ │72.31│ │     │              │
│  └─────┘ └─────┘ └─────┘              │
├─────────────────────────────────────────┤
│  VIDEO GALLERY                          │
│  [YT embed] Finał 2024                  │
│  [YT embed] Prezentacje organizacji     │
├─────────────────────────────────────────┤
│  ZOSTAŃ AMBASADOREM DARTA               │
│  Formularz zgłoszenia organizacji       │
│  [Nazwa] [Email] [Opis] [WYŚLIJ]        │
├─────────────────────────────────────────┤
│  📄 [POBIERZ ZAPROSZENIE PDF]           │
└─────────────────────────────────────────┘
```

**Funkcjonalności:**
- Hero z kluczowymi liczbami
- Hall of Fame - tabela `hall_of_fame` lub statyczny JSON
- YouTube embedy
- Formularz zgłoszenia → Airtable lub email
- Download PDF z zaproszeniem

---

### 🏨 Rezerwacja Noclegów (`/rezerwacja`)

**Cel:** Sprzedaż noclegów w Cukrowni Żnin - "serce wydarzenia".

**Layout:**
```
┌─────────────────────────────────────────┐
│       NOCLEG W SERCU WYDARZENIA         │
│  Kilka kroków od sali • Własna plaża    │
├─────────────────────────────────────────┤
│  CENNIK                                 │
│  ┌─────────────────────────────────┐   │
│  │ Pokój 1-os.     │ 390 zł/noc   │   │
│  │ Pokój 2-os.     │ 520 zł/noc   │   │
│  │ Dostawka        │ 200 zł/noc   │   │
│  │ Dziecko 0-4 lat │ GRATIS       │   │
│  │ Dziecko 5-12 lat│ 100 zł/noc   │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  FORMULARZ REZERWACJI                   │
│  Imię i nazwisko: [_______________]     │
│  Email:           [_______________]     │
│  Telefon:         [_______________]     │
│  Data przyjazdu:  [_______________]     │
│  Data wyjazdu:    [_______________]     │
│  Liczba osób:     [_______________]     │
│  Uwagi:           [_______________]     │
│                                         │
│           [WYŚLIJ REZERWACJĘ]           │
├─────────────────────────────────────────┤
│  GALERIA CUKROWNI                       │
│  [img] [img] [img] [img]                │
│  Industrialne pokoje • Molo • Plaża    │
│  Aquapark • 28m zjeżdżalnia            │
├─────────────────────────────────────────┤
│  DLACZEGO CUKROWNIA?                    │
│  ✅ Kilka kroków do sali gier           │
│  ✅ Niezależność od zewnętrznego transportu│
│  ✅ Warzone na miejscu                  │
│  ✅ Integracja z innymi zawodnikami     │
├─────────────────────────────────────────┤
│  FAQ NOCLEGOWE                          │
│  • Czy mogę przyjechać z rodziną? TAK   │
│  • Czy są inne noclegi w okolicy? TAK   │
│  • Jak zarezerwować? Wypełnij formularz │
└─────────────────────────────────────────┘
```

**Integracja z Airtable:**
```typescript
// lib/airtable.ts
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

export async function createReservation(data: ReservationData) {
  const record = await base('Reservations').create({
    'Name': data.name,
    'Email': data.email,
    'Phone': data.phone,
    'Arrival': data.arrivalDate,
    'Departure': data.departureDate,
    'Guests': data.guestsCount,
    'Notes': data.notes,
    'Status': 'Pending',
  });
  return record.id;
}
```

---

### 📍 Jak Dojechać (`/jak-dojechac`)

**Cel:** Wszystkie informacje logistyczne o dojeździe.

**Layout:**
```
┌─────────────────────────────────────────┐
│            JAK DOJECHAĆ                 │
│          Cukrownia Żnin                 │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [GOOGLE MAPS EMBED]        │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  📍 ADRES                               │
│  Cukrownia Żnin                         │
│  ul. [Adres]                            │
│  88-400 Żnin                            │
│                                         │
│  GPS: 52.XXXX, 17.XXXX                  │
│                                         │
│  [Otwórz w Google Maps]                 │
│  [Otwórz w Apple Maps]                  │
├─────────────────────────────────────────┤
│  🚗 SAMOCHODEM                          │
│  • Z Poznania: ~80 km (1h)              │
│  • Z Bydgoszczy: ~40 km (40min)         │
│  • Z Warszawy: ~280 km (3h)             │
│  • Z Gdańska: ~180 km (2h)              │
│                                         │
│  🅿️ Parking przy obiekcie (200 miejsc) │
├─────────────────────────────────────────┤
│  🚂 POCIĄGIEM                           │
│  Stacja: Żnin                           │
│  Linia: Poznań - Inowrocław             │
│  Od stacji: 2 km (taxi ~15 zł)          │
├─────────────────────────────────────────┤
│  ✈️ DLA GOŚCI ZAGRANICZNYCH             │
│  Najbliższe lotniska:                   │
│  • Poznań Ławica (POZ) - 80 km          │
│  • Bydgoszcz (BZG) - 50 km              │
└─────────────────────────────────────────┘
```

**Funkcjonalności:**
- Google Maps embed
- Linki do nawigacji (Google Maps, Apple Maps)
- Informacje o parkingu
- Trasy z głównych miast

---

### 📋 Dla Zawodników (`/dla-zawodnikow`)

**Cel:** Hub z praktycznymi informacjami - odpowiedzi na "głupie pytania".

**Layout:**
```
┌─────────────────────────────────────────┐
│         INFORMACJE DLA ZAWODNIKÓW       │
│      Wszystko co musisz wiedzieć        │
├─────────────────────────────────────────┤
│  📝 REJESTRACJA NA TURNIEJE             │
│  Zapisy odbywają się przez system n01.  │
│  Krok 1: Załóż konto na n01darts.com    │
│  Krok 2: Znajdź turniej i kliknij JOIN  │
│  [Zobacz turnieje →]                    │
├─────────────────────────────────────────┤
│  🎒 CO ZABRAĆ                           │
│  ✅ Własne lotki (oczywiście!)          │
│  ✅ Dokument tożsamości                 │
│  ✅ Gotówkę na wpisowe                  │
│  ✅ Wygodne buty                        │
│  ✅ Powerbank (długie dni!)             │
├─────────────────────────────────────────┤
│  👔 DRESS CODE                          │
│  Brak obowiązkowego dress code'u.       │
│  Zalecamy wygodny sportowy strój.       │
│  Finały: mile widziana koszulka klubowa.│
├─────────────────────────────────────────┤
│  ⏰ HARMONOGRAM SKRÓCONY                │
│  Czwartek: 09:00 - 23:00                │
│  Piątek:   09:00 - 24:00                │
│  Sobota:   09:00 - 24:00                │
│  Niedziela:09:00 - 18:00                │
│  [Pełny harmonogram →]                  │
├─────────────────────────────────────────┤
│  📞 KONTAKT W RAZIE PROBLEMÓW           │
│  Telefon organizatora: 693 19 00 20     │
│  Email: kontakt@dartspolska.pl          │
├─────────────────────────────────────────┤
│  ❓ FAQ                                 │
│  • Czy potrzebuję licencji? NIE         │
│  • Czy mogę przyjść jako kibic? TAK     │
│  • Czy są nagrody rzeczowe? TAK         │
│  • Czy jest transmisja? TAK (YT)        │
└─────────────────────────────────────────┘
```

---

## 🎨 DESIGN SYSTEM (Brand Book)

### Kolory

```css
:root {
  /* Primary */
  --color-primary: #C1272D;        /* Czerwony Darts Polska */
  --color-primary-hover: #A01F25;
  --color-primary-light: #E8535A;
  
  /* Neutrals */
  --color-black: #1A1A1A;          /* Tekst główny */
  --color-gray-dark: #4B5563;
  --color-gray: #6B7280;
  --color-gray-light: #9CA3AF;
  --color-gray-100: #F3F4F6;
  --color-white: #FFFFFF;
  
  /* Accents */
  --color-success: #15803D;        /* Zielony - mecze aktywne */
  --color-warning: #F59E0B;        /* Żółty - oczekujące */
  --color-info: #3B82F6;           /* Niebieski - Soft */
  
  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-dark: #1A1A1A;
}
```

### Typografia

```css
/* Nagłówki - Bebas Neue (uppercase) */
.font-bebas {
  font-family: 'Bebas Neue', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tytuły sekcji - Montserrat Bold */
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
}

/* Body text - Open Sans */
.font-opensans {
  font-family: 'Open Sans', sans-serif;
}
```

### Komponenty UI (wspólne)

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// components/ui/Card.tsx
// components/ui/Modal.tsx
// components/ui/Input.tsx
// components/ui/Select.tsx
// components/ui/Tabs.tsx
// components/ui/Accordion.tsx
```

### Breakpoints

```css
/* Mobile first */
--breakpoint-sm: 375px;   /* Telefony */
--breakpoint-md: 768px;   /* Tablety */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Duże ekrany */
```

---

## 🔄 PRZEPŁYW UŻYTKOWNIKÓW (User Journeys)

### 1. Nowy zawodnik (przed wydarzeniem)

```
Strona główna
    ↓
"Co mogę zagrać?" → /turnieje
    ↓
"Jak się zapisać?" → /dla-zawodnikow
    ↓
"Gdzie spać?" → /rezerwacja
    ↓
"Jak dojechać?" → /jak-dojechac
    ↓
[REZERWACJA WYSŁANA]
```

### 2. Powracający zawodnik (przed wydarzeniem)

```
Strona główna
    ↓
"Sprawdzę harmonogram" → /turnieje
    ↓
"Rezerwuję nocleg" → /rezerwacja
    ↓
[REZERWACJA WYSŁANA]
```

### 3. Zawodnik podczas turnieju (16-19.07)

```
Strona główna (lub bezpośrednio /live)
    ↓
[LIVE SCORE WIDGET] → /live
    ↓
Wyszukaj nazwisko
    ↓
"Tarcza 7, idę grać!"
```

### 4. Organizacja (Turniej Reprezentantów)

```
Strona główna
    ↓
Boks "Turniej Reprezentantów" → /turniej-reprezentantow
    ↓
"Chcemy wystąpić" → Formularz zgłoszenia
    ↓
[ZGŁOSZENIE WYSŁANE]
```

### 5. Sponsor / Media

```
Strona główna
    ↓
Footer → Kontakt
    ↓
/kontakt lub /galeria (materiały)
```

---

## 📅 ROADMAP IMPLEMENTACJI

### Faza 1: Live Score (✅ DONE + v2 w trakcie)
- [x] Scraper n01
- [x] Frontend wyników
- [x] Panel admina
- [ ] Poprawki v2 (responsywność, design)

### Faza 2: Fundament serwisu
- [ ] Navbar i Footer (wspólne)
- [ ] Strona główna (bez Live Score widget)
- [ ] Routing i struktura podstron
- [ ] Design system (komponenty UI)

### Faza 3: Podstrony kluczowe
- [ ] /turnieje (kalendarz)
- [ ] /rezerwacja (formularz + Airtable)
- [ ] /jak-dojechac
- [ ] /dla-zawodnikow

### Faza 4: Podstrony prestiżowe
- [ ] /turniej-reprezentantow
- [ ] Hall of Fame

### Faza 5: Integracja Live Score
- [ ] Widget warunkowy na stronie głównej
- [ ] Wspólna nawigacja

### Faza 6: Rozszerzenia (po wydarzeniu)
- [ ] /wyniki (archiwum)
- [ ] /galeria
- [ ] /blog
- [ ] /historia

---

## 🔐 BEZPIECZEŃSTWO I ZMIENNE ŚRODOWISKOWE

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...

# Admin
ADMIN_PASSWORD=...

# Opcjonalne
GOOGLE_MAPS_API_KEY=...
YOUTUBE_API_KEY=...
```

---

## 📞 KONTAKT I DANE ORGANIZATORA

**Organizator:** Stowarzyszenie Darts Polska
**Prezes:** Dawid
**Telefon:** 693 19 00 20
**Email:** kontakt@dartspolska.pl
**Wydarzenie:** 10. Mistrzostwa Polski w Darcie
**Termin:** 16-19 lipca 2026
**Miejsce:** Cukrownia Żnin

---

*Dokument architektury - Mistrzostwa Polski w Darcie 2026*
*Ostatnia aktualizacja: Styczeń 2025*