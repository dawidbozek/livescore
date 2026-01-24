# ZADANIE: Rozbudowa Live Score o format "Grupy + Single K.O."

## KONTEKST
Rozbudowujemy system Live Score o obsługę nowego formatu turnieju: "Grupy + Single K.O." (faza grupowa, potem drabinka pucharowa). Aktualnie obsługujemy tylko "Single K.O.".

---

## LISTA ZMIAN DO WDROŻENIA

### 1. Przenieść wyszukiwarkę zawodników
**Obecna lokalizacja:** Nad listą turniejów
**Nowa lokalizacja:** POD sekcją z listą turniejów, NAD sekcją "Mecze w trakcie"

Kolejność elementów po zmianie:
1. Header
2. DateSelector
3. Lista turniejów
4. **Wyszukiwarka** ← tutaj
5. Mecze w trakcie
6. Mecze oczekujące
7. Mecze zakończone

---

### 2. Nowy format turnieju: Grupy + Single K.O.

#### 2.1 Baza danych
Dodać kolumnę do tabeli `tournaments`:
- `tournament_format`: VARCHAR z wartościami `'single_ko'` (domyślna) lub `'groups_ko'`

#### 2.2 Panel admina
Przy tworzeniu/edycji turnieju dodać dropdown:
- Label: "Format turnieju"
- Opcje: "Single K.O." / "Grupy + Single K.O."

#### 2.3 Scraper - parsowanie grup

**Wykrywanie grup:**
- Grupy są w kontenerach `.rr_table_container`
- Każda grupa ma tabelę `.rr_table`

**Dane do wyciągnięcia z każdej grupy:**

| Dane | Selektor/Atrybut | Przykład |
|------|------------------|----------|
| Nazwa grupy | `subtitle` na komórce wyniku | "Grupa 1" |
| Lista zawodników | `.rr_player .entry_name` | ["Słowacki", "Chopin", ...] |
| ID zawodników | `.rr_name[tpid]` | "8beu", "D4Kh" |
| Numer tarczy | `.rr_memo` (jeśli zawiera "Tarcza X") | "Tarcza 1" |
| Schemat sędziów | `.rr_memo` (reszta tekstu) | "1-2 liczy 3, ..." |

**Rozpoznawanie statusu meczu w grupie:**

| Status | Jak rozpoznać |
|--------|---------------|
| Zakończony | Komórka zawiera wynik (np. "2 - 1") + klasa `fix_game` |
| Oczekujący | Komórka zawiera `<span class="rr_idx">X</span>` z numerem kolejności |
| Nie dotyczy | Klasa `rr_none` (przekątna tabeli) |
| **Aktywny (Steel)** | Komórka ma **jasnoczerwone tło** (background-color) |

**Różnice Soft vs Steel:**

| Cecha | Soft | Steel |
|-------|------|-------|
| Średnie graczy | Brak | `.t_avg` przy nazwisku, `.r_avg` przy wyniku |
| Numeracja meczów (idx) | TAK | BRAK |
| Mecz aktywny | Brak oznaczenia | Jasnoczerwone tło komórki |
| `.rr_memo` | "Tarcza X" | Schemat sędziów |

**Obliczanie postępu grupy:**
- Mecze zakończone: liczba komórek z klasą `fix_game` / 2 (bo każdy mecz jest w tabeli 2 razy)
- Mecze ogółem: n*(n-1)/2 gdzie n = liczba zawodników

#### 2.4 Schematy sędziów (dla Steel)

Jeśli turniej jest Steel i ma grupy, generujemy sędziów według schematów:

**Grupa 3-osobowa (3 mecze):**
```
Mecz 1: 1 vs 2, sędzia: 3
Mecz 2: 1 vs 3, sędzia: 2
Mecz 3: 2 vs 3, sędzia: 1
```

**Grupa 4-osobowa (6 meczów):**
```
Mecz 1: 1 vs 2, sędzia: 3
Mecz 2: 3 vs 4, sędzia: 2
Mecz 3: 1 vs 3, sędzia: 4
Mecz 4: 2 vs 4, sędzia: 1
Mecz 5: 1 vs 4, sędzia: 3
Mecz 6: 2 vs 3, sędzia: 4
```

**Grupa 5-osobowa (10 meczów):**
```
Mecz 1: 1 vs 2, sędzia: 3
Mecz 2: 3 vs 4, sędzia: 5
Mecz 3: 1 vs 5, sędzia: 2
Mecz 4: 2 vs 3, sędzia: 4
Mecz 5: 4 vs 5, sędzia: 1
Mecz 6: 1 vs 3, sędzia: 5
Mecz 7: 2 vs 4, sędzia: 3
Mecz 8: 3 vs 5, sędzia: 1
Mecz 9: 1 vs 4, sędzia: 2
Mecz 10: 2 vs 5, sędzia: 4
```

**Grupa 6-osobowa (15 meczów):**
```
Mecz 1: 1 vs 2, sędzia: 3
Mecz 2: 4 vs 5, sędzia: 6
Mecz 3: 3 vs 6, sędzia: 1
Mecz 4: 1 vs 4, sędzia: 2
Mecz 5: 2 vs 5, sędzia: 3
Mecz 6: 3 vs 4, sędzia: 6
Mecz 7: 1 vs 6, sędzia: 5
Mecz 8: 2 vs 3, sędzia: 4
Mecz 9: 5 vs 6, sędzia: 1
Mecz 10: 1 vs 5, sędzia: 4
Mecz 11: 2 vs 6, sędzia: 3
Mecz 12: 3 vs 5, sędzia: 2
Mecz 13: 1 vs 3, sędzia: 6
Mecz 14: 4 vs 6, sędzia: 5
Mecz 15: 2 vs 4, sędzia: 1
```

---

### 3. Frontend - wyświetlanie grup

#### 3.1 Widok "Wszystkie turnieje" (główna strona /live)

Dla turniejów grupowych wyświetlamy **karty grup** (zamiast pojedynczych meczów):
```
┌─────────────────────────────────────────┐
│ [1] GRUPA 1 • Soft Open                 │
│     Słowacki, Chopin, Kościuszko, JP2   │
│     Postęp: 2/6 meczów                  │
└─────────────────────────────────────────┘
```

**Po kliknięciu w grupę → POPUP ze szczegółami:**
- Tabela grupy (jak w n01)
- Lista meczów z wynikami i sędziami
- Status każdego meczu (✓ zakończony, • oczekujący, 🔴 aktywny)

#### 3.2 Widok konkretnego turnieju grupowego

Wyświetlamy wszystkie elementy:

1. **FAZA GRUPOWA:**
   - Każda grupa jako tabela (macierz wyników)
   - Pod tabelą: lista meczów z wynikami i sędziami
   - Numer tarczy widoczny przy grupie
   - Postęp (X/Y meczów)

2. **FAZA PUCHAROWA (Single K.O.):**
   - Wyświetlana pod grupami
   - Mecze pojawiają się w miarę postępu (generowane przez n01)
   - Format identyczny jak obecny Single K.O.

#### 3.3 Wyszukiwarka

Gdy użytkownik wpisze nazwisko zawodnika który jest w grupie:
- Pokazujemy **całą grupę** (popup z tabelą + meczami)
- Nie pojedynczy mecz

---

## PRZYKŁADY HTML DO REFERENCJI

### Struktura grupy (Soft):
```html
<div class="rr_table_container">
  <table class="rr_table">
    <thead class="rr_head">...</thead>
    <tbody class="rr_body">
      <tr class="rr_player">
        <td class="rr_no">1</td>
        <td class="rr_name" tpid="8beu">
          <span class="entry_name">Juliusz Słowacki</span>
        </td>
        <td class="rr_result rr_none"></td> <!-- przekątna -->
        <td class="rr_result fix_game">2 - 1</td> <!-- zakończony -->
        <td class="rr_result">
          <span class="rr_idx">5</span> <!-- oczekujący, numer kolejności -->
        </td>
        <td class="rr_win">1 - 1</td>
        <td class="rr_leg">2 - 3</td>
        <td class="rr_rank">2</td>
      </tr>
      ...
    </tbody>
  </table>
  <div class="rr_memo">Tarcza 1</div>
</div>
```

### Struktura grupy (Steel) - różnice:
```html
<td class="rr_name" tpid="Sq6W">
  <span class="entry_name">Kuba Kordylewicz</span>
  <span class="t_avg"> (72.60)</span> <!-- średnia gracza -->
</td>
<td class="rr_result fix_game">
  3 - 0<br>
  <span class="r_avg">(63.51)</span> <!-- średnia w meczu -->
</td>
<div class="rr_memo">1-2 liczy 3, 3-4 liczy 2, 1-3 liczy 4...</div>
```

### Mecz aktywny (Steel):
Komórka `.rr_result` ma jasnoczerwone tło (background-color w CSS/inline style)

---

## UWAGI TECHNICZNE

1. Faza K.O. po grupach jest w tym samym HTML pod grupami - scraper powinien ją wykrywać normalnie jak Single K.O.
2. Mecze w grupach mogą być rozgrywane nie po kolei (zawodnicy się dogadują)
3. Numer tarczy w `.rr_memo` może być w formacie "Tarcza X" - wyciągać regex `Tarcza (\d+)`
4. Dla grup nie pokazujemy konkretnego "aktywnego meczu" - pokazujemy całą grupę jako aktywną tarczę