# PROMPT: Live Score v2 - Poprawki i rozbudowa

## 🎯 CEL

Wprowadź poniższe zmiany do projektu Live Score. Wszystkie zmiany mają być w JEDNYM SPÓJNYM COMMICIE. Przeczytaj cały prompt przed rozpoczęciem pracy.

---

## 📁 STRUKTURA PROJEKTU (przypomnienie)

```
Scraper N01/
├── frontend/           # Next.js
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── public/images/  # ← Tu dodaj grafiki
├── scraper/
└── supabase/
```

---

## 🗄️ ZMIANA 1: Rozbudowa bazy danych

### Wykonaj w Supabase SQL Editor:

```sql
-- Dodaj nowe kolumny do tabeli tournaments
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS dart_type VARCHAR(10) DEFAULT 'steel',
ADD COLUMN IF NOT EXISTS category VARCHAR(20),
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS entry_fee VARCHAR(50),
ADD COLUMN IF NOT EXISTS prizes TEXT,
ADD COLUMN IF NOT EXISTS format VARCHAR(100),
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Dodaj constraint dla dart_type
ALTER TABLE tournaments 
ADD CONSTRAINT check_dart_type CHECK (dart_type IN ('soft', 'steel'));

-- Dodaj constraint dla category
ALTER TABLE tournaments 
ADD CONSTRAINT check_category CHECK (category IN ('indywidualny', 'deblowy', 'triple_mieszane', 'druzynowy'));
```

### Zaktualizuj typy TypeScript w `frontend/lib/types.ts`:

```typescript
export interface Tournament {
  id: string;
  name: string;
  n01_url: string;
  tournament_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Nowe pola:
  dart_type: 'soft' | 'steel';
  category: 'indywidualny' | 'deblowy' | 'triple_mieszane' | 'druzynowy' | null;
  start_time: string | null;  // format "HH:MM"
  entry_fee: string | null;
  prizes: string | null;
  format: string | null;
  image_url: string | null;
}
```

---

## 🎨 ZMIANA 2: Kolory globalne

### Zmień primary color z niebieskiego na czerwony `#C1272D`

Znajdź wszystkie wystąpienia niebieskiego koloru (np. `blue-500`, `blue-600`, `#3B82F6`) i zamień na:

```css
/* Nowy primary color */
--primary: #C1272D;
--primary-hover: #A01F25;  /* ciemniejszy dla hover */
--primary-light: #E8535A;  /* jaśniejszy dla akcentów */
```

W Tailwind zamień klasy:
- `bg-blue-*` → użyj `bg-[#C1272D]`
- `text-blue-*` → użyj `text-[#C1272D]`
- `border-blue-*` → użyj `border-[#C1272D]`

---

## 📱 ZMIANA 3: Responsywność 320px+

### Wszystkie komponenty muszą działać od 320px szerokości.

**Kluczowe zasady:**
- Minimalna szerokość: `min-w-[320px]`
- Padding boczny: `px-3` (12px) zamiast `px-4` (16px) na mobile
- Font-size: minimum `text-sm` (14px) dla czytelności
- Przyciski: minimum `min-h-[44px]` dla touch targets

**Komponenty do sprawdzenia i naprawienia:**
1. `MatchCard.tsx` - karty meczów muszą się zmieścić na 320px
2. `SearchBar.tsx` - input musi być responsywny
3. `DateSelector.tsx` - przyciski nawigacji muszą się mieścić
4. `TournamentList.tsx` - lista turniejów
5. Header i footer

**Testuj na szerokościach:** 320px, 375px, 414px, 540px, 768px, 1024px

---

## 🏗️ ZMIANA 4: Nowy layout strony głównej (mobile)

### Nowa kolejność sekcji w `frontend/app/page.tsx`:

```
1. Header (sticky)
   - Logo Darts Polska (lewa strona)
   - Menu hamburger placeholder (prawa strona, nieklikalne)

2. Banner MP 2026
   - Obrazek: /public/images/banner-mp2026.png
   - Pełna szerokość

3. SearchBar
   - Wyszukiwarka zawodników (Fuse.js)

4. DateSelector (NOWA LOGIKA!)
   - Domyślnie: "Wszystkie aktywne"
   - Strzałka lewa: -1 dzień
   - Strzałka prawa: +1 dzień (pierwsze kliknięcie = dziś)
   - Reset do "Wszystkie aktywne" przy odświeżeniu (useState, nie localStorage)

5. TournamentList
   - Lista turniejów z nowym designem (ikony, popup)

6. ActiveMatches
   - Mecze w trakcie (nowy design MatchCard)

7. PendingMatches
   - Mecze oczekujące

8. FinishedMatches
   - Zakończone (zwinięte domyślnie, 4 widoczne, przycisk "Pokaż więcej")

9. Footer
   - Grafika: /public/images/footer.png
```

---

## 🖼️ ZMIANA 5: Header z logo

### Stwórz/zaktualizuj komponent Header:

```tsx
// frontend/components/Header.tsx

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 min-w-[320px]">
        {/* Logo po lewej */}
        <img 
          src="/images/logo-darts-polska.png" 
          alt="Darts Polska" 
          className="h-10 w-auto"
        />
        
        {/* Menu hamburger po prawej (placeholder, nieklikalne) */}
        <button 
          className="p-2 text-gray-400 cursor-not-allowed"
          disabled
          aria-label="Menu (wkrótce)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
```

**UWAGA:** Pliki graficzne (`logo-darts-polska.png`, `banner-mp2026.png`, `footer.png`) zostaną dostarczone przez użytkownika. Na razie użyj placeholderów lub komentarzy gdzie mają być.

---

## 📅 ZMIANA 6: DateSelector - nowa logika

### Zaktualizuj `frontend/components/DateSelector.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  onDateChange: (date: Date | null) => void;  // null = wszystkie aktywne
}

export function DateSelector({ onDateChange }: DateSelectorProps) {
  // null oznacza "Wszystkie aktywne"
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const handlePrev = () => {
    if (selectedDate === null) {
      // Z "Wszystkie aktywne" idziemy na wczoraj
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(yesterday);
      onDateChange(yesterday);
    } else {
      // -1 dzień
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
      onDateChange(newDate);
    }
  };
  
  const handleNext = () => {
    if (selectedDate === null) {
      // Z "Wszystkie aktywne" idziemy na dziś
      const today = new Date();
      setSelectedDate(today);
      onDateChange(today);
    } else {
      // +1 dzień
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
      onDateChange(newDate);
    }
  };
  
  const formatDate = (date: Date | null): string => {
    if (date === null) return 'Wszystkie aktywne';
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Dziś';
    if (isYesterday) return 'Wczoraj';
    if (isTomorrow) return 'Jutro';
    
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };
  
  return (
    <div className="flex items-center justify-center gap-4 py-3 bg-gray-50 rounded-lg">
      <button 
        onClick={handlePrev}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Poprzedni dzień"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="font-semibold text-center min-w-[150px]">
        {formatDate(selectedDate)}
      </span>
      
      <button 
        onClick={handleNext}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Następny dzień"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
```

### Zaktualizuj logikę pobierania w `page.tsx`:

Gdy `selectedDate === null`, pobieraj wszystkie turnieje gdzie `is_active = true` (bez filtrowania po dacie).

---

## 🎴 ZMIANA 7: MatchCard redesign (mecze aktywne)

### Nowy design dla meczów W TRAKCIE:

```tsx
// frontend/components/MatchCard.tsx

interface MatchCardProps {
  match: Match;
  tournament: Tournament;
  status: 'active' | 'pending' | 'finished';
}

export function MatchCard({ match, tournament, status }: MatchCardProps) {
  if (status === 'active') {
    return (
      <div className="bg-white rounded-lg shadow-md border-l-4 border-green-600 overflow-hidden">
        <div className="flex">
          {/* Numer tarczy - ciemnozielone koło */}
          <div className="flex items-center justify-center w-16 bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-[#15803D] flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {match.station_number || '?'}
              </span>
            </div>
          </div>
          
          {/* Zawartość */}
          <div className="flex-1 p-3">
            {/* Górny rząd - badge SOFT/STEEL */}
            <div className="flex justify-end mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                tournament.dart_type === 'steel' 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                [{tournament.dart_type?.toUpperCase() || 'STEEL'}]
              </span>
            </div>
            
            {/* Gracze i wyniki */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[70%]">
                  {match.player1_name}
                </span>
                <span className="font-bold text-lg text-[#C1272D]">
                  {match.player1_score}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[70%]">
                  {match.player2_name}
                </span>
                <span className="font-bold text-lg text-[#C1272D]">
                  {match.player2_score}
                </span>
              </div>
            </div>
            
            {/* Dolny pasek - sędzia i turniej */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>Sędzia: {match.referee || '-'}</span>
              <span className="truncate max-w-[50%]">{tournament.name}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Dla pending i finished - dotychczasowy design (bez zmian lub minimalne)
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-3 ${
      status === 'finished' ? 'opacity-70' : ''
    }`}>
      {/* ... dotychczasowy kod dla pending/finished ... */}
    </div>
  );
}
```

---

## 📋 ZMIANA 8: Lista turniejów - nowy design

### Zaktualizuj `frontend/components/TournamentList.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { Tournament } from '@/lib/types';
import { TournamentInfoModal } from './TournamentInfoModal';

interface TournamentListProps {
  tournaments: Tournament[];
}

export function TournamentList({ tournaments }: TournamentListProps) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Brak turniejów
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-2">
        {tournaments.map((tournament) => (
          <div 
            key={tournament.id}
            className="bg-white rounded-lg shadow-sm border p-3"
          >
            <div className="flex items-start gap-3">
              {/* Ikona Soft/Steel */}
              <div className="text-2xl">
                {tournament.dart_type === 'steel' ? '🎯' : '🏆'}
              </div>
              
              {/* Nazwa i badge */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {tournament.name}
                </h3>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mt-1 ${
                  tournament.dart_type === 'steel'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {tournament.dart_type?.toUpperCase() || 'STEEL'}
                </span>
              </div>
              
              {/* Akcje */}
              <div className="flex gap-1">
                {/* Link do n01 */}
                {tournament.n01_url && (
                  <a
                    href={tournament.n01_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#C1272D] hover:bg-gray-100 rounded-full transition-colors"
                    title="Zobacz drabinkę"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                {/* Info popup */}
                <button
                  onClick={() => setSelectedTournament(tournament)}
                  className="p-2 text-gray-500 hover:text-[#C1272D] hover:bg-gray-100 rounded-full transition-colors"
                  title="Informacje o turnieju"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal z info */}
      {selectedTournament && (
        <TournamentInfoModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </>
  );
}
```

---

## 💬 ZMIANA 9: Modal info o turnieju

### Stwórz nowy komponent `frontend/components/TournamentInfoModal.tsx`:

```tsx
'use client';

import { X, ExternalLink, Clock, Users, Trophy, FileText, DollarSign } from 'lucide-react';
import { Tournament } from '@/lib/types';

interface TournamentInfoModalProps {
  tournament: Tournament;
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  'indywidualny': 'Indywidualny',
  'deblowy': 'Deblowy',
  'triple_mieszane': 'Triple mieszane',
  'druzynowy': 'Drużynowy',
};

export function TournamentInfoModal({ tournament, onClose }: TournamentInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg pr-4">{tournament.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Grafika turnieju (jeśli jest) */}
          {tournament.image_url && (
            <img 
              src={tournament.image_url} 
              alt={tournament.name}
              className="w-full h-32 object-cover rounded-lg"
            />
          )}
          
          {/* Data */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">📅</span>
            <span>
              {new Date(tournament.tournament_date).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          
          {/* Godzina startu */}
          {tournament.start_time && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Start: {tournament.start_time}</span>
            </div>
          )}
          
          {/* Typ i kategoria */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">
              {tournament.dart_type === 'steel' ? '🎯' : '🏆'}
            </span>
            <span>
              {tournament.dart_type?.toUpperCase() || 'STEEL'}
              {tournament.category && ` - ${categoryLabels[tournament.category] || tournament.category}`}
            </span>
          </div>
          
          {/* Wpisowe */}
          {tournament.entry_fee && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span>Wpisowe: {tournament.entry_fee}</span>
            </div>
          )}
          
          {/* Nagrody */}
          {tournament.prizes && (
            <div className="flex items-start gap-3 text-sm">
              <Trophy className="w-4 h-4 text-gray-500 mt-0.5" />
              <span>{tournament.prizes}</span>
            </div>
          )}
          
          {/* Format */}
          {tournament.format && (
            <div className="flex items-center gap-3 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Format: {tournament.format}</span>
            </div>
          )}
        </div>
        
        {/* Footer - link do n01 */}
        {tournament.n01_url && (
          <div className="p-4 border-t">
            <a
              href={tournament.n01_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#C1272D] text-white rounded-lg hover:bg-[#A01F25] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Zobacz drabinkę
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 👨‍💼 ZMIANA 10: Panel admina - rozbudowa formularza

### Zaktualizuj formularz dodawania/edycji turnieju w `frontend/app/admin/page.tsx`:

Dodaj nowe pola do formularza:

```tsx
{/* Typ darta - Dropdown */}
<div>
  <label className="block text-sm font-medium mb-1">Typ darta *</label>
  <select
    value={formData.dart_type || 'steel'}
    onChange={(e) => setFormData({...formData, dart_type: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
    required
  >
    <option value="steel">Steel</option>
    <option value="soft">Soft</option>
  </select>
</div>

{/* Kategoria - Dropdown */}
<div>
  <label className="block text-sm font-medium mb-1">Kategoria</label>
  <select
    value={formData.category || ''}
    onChange={(e) => setFormData({...formData, category: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
  >
    <option value="">-- Wybierz --</option>
    <option value="indywidualny">Indywidualny</option>
    <option value="deblowy">Deblowy</option>
    <option value="triple_mieszane">Triple mieszane</option>
    <option value="druzynowy">Drużynowy</option>
  </select>
</div>

{/* Godzina startu */}
<div>
  <label className="block text-sm font-medium mb-1">Godzina startu</label>
  <input
    type="time"
    value={formData.start_time || ''}
    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
  />
</div>

{/* Wpisowe */}
<div>
  <label className="block text-sm font-medium mb-1">Wpisowe</label>
  <input
    type="text"
    placeholder="np. 50 zł/os"
    value={formData.entry_fee || ''}
    onChange={(e) => setFormData({...formData, entry_fee: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
  />
</div>

{/* Nagrody */}
<div>
  <label className="block text-sm font-medium mb-1">Nagrody</label>
  <textarea
    placeholder="np. Pula 5000 zł, puchary dla TOP 3"
    value={formData.prizes || ''}
    onChange={(e) => setFormData({...formData, prizes: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
    rows={2}
  />
</div>

{/* Format */}
<div>
  <label className="block text-sm font-medium mb-1">Format gry</label>
  <input
    type="text"
    placeholder="np. 501 D.O., Best of 5"
    value={formData.format || ''}
    onChange={(e) => setFormData({...formData, format: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
  />
</div>

{/* Grafika turnieju - URL */}
<div>
  <label className="block text-sm font-medium mb-1">URL grafiki turnieju</label>
  <input
    type="url"
    placeholder="https://..."
    value={formData.image_url || ''}
    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
    className="w-full px-3 py-2 border rounded-lg"
  />
</div>
```

### Zaktualizuj API route do zapisywania nowych pól.

---

## 🔄 ZMIANA 11: Zakończone mecze - zwijanie

### W sekcji zakończonych meczów:

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FinishedMatchesProps {
  matches: Match[];
  tournaments: Tournament[];
}

export function FinishedMatches({ matches, tournaments }: FinishedMatchesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const visibleMatches = isExpanded ? matches : matches.slice(0, 4);
  const hasMore = matches.length > 4;
  
  return (
    <section>
      <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
        <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
        Zakończone ({matches.length})
      </h2>
      
      <div className="space-y-2">
        {visibleMatches.map((match) => {
          const tournament = tournaments.find(t => t.id === match.tournament_id);
          return (
            <MatchCard 
              key={match.id} 
              match={match} 
              tournament={tournament!}
              status="finished"
            />
          );
        })}
      </div>
      
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-[#C1272D] flex items-center justify-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Zwiń
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Pokaż więcej ({matches.length - 4})
            </>
          )}
        </button>
      )}
    </section>
  );
}
```

### Wyszukiwarka - pokaż wszystkie mecze zawodnika (też zakończone):

W logice wyszukiwania upewnij się, że gdy użytkownik wpisze nazwisko:
- Przeszukujesz WSZYSTKIE mecze (active, pending, finished)
- Wyświetlasz je w odpowiednich sekcjach
- Sekcja "Zakończone" rozwijana automatycznie jeśli są wyniki

---

## 📦 ZMIANA 12: Pliki graficzne (placeholdery)

### Utwórz folder i dodaj komentarze gdzie mają być grafiki:

```
frontend/public/images/
├── logo-darts-polska.png    # Logo - dostarczy użytkownik
├── banner-mp2026.png        # Banner - dostarczy użytkownik  
└── footer.png               # Footer - dostarczy użytkownik
```

Na razie możesz użyć placeholderów lub komentarzy:

```tsx
{/* TODO: Zamień na prawdziwe logo po dostarczeniu przez użytkownika */}
<img src="/images/logo-darts-polska.png" alt="Darts Polska" className="h-10" />
```

---

## ✅ CHECKLIST PRZED COMMITEM

- [ ] Wykonano migrację SQL w Supabase
- [ ] Zaktualizowano typy TypeScript
- [ ] Zmieniono primary color na #C1272D
- [ ] Sprawdzono responsywność na 320px
- [ ] Nowy layout strony głównej
- [ ] Header z logo i menu placeholder
- [ ] DateSelector z nową logiką
- [ ] MatchCard redesign dla aktywnych
- [ ] TournamentList z ikonami i akcjami
- [ ] TournamentInfoModal
- [ ] Panel admina z nowymi polami
- [ ] Sekcja zakończonych ze zwijaniem
- [ ] Wyszukiwarka pokazuje wszystkie mecze

---

## 📝 COMMIT MESSAGE

```
feat(v2): Major UI/UX update

- Add responsive design support (320px+)
- Change primary color to #C1272D
- Redesign active MatchCard with station number circle
- Add tournament type (soft/steel) with icons
- Expand tournament data (category, start_time, prizes, etc.)
- New DateSelector logic (all active / specific date)
- Add tournament info modal
- Collapsible finished matches section
- Update admin panel with new tournament fields
- Prepare layout for logo, banner, footer images
```

---

*Prompt dla Claude Code - Live Score v2 - Stowarzyszenie Darts Polska*