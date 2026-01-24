import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Match, GroupedMatches, Group, GroupedGroups } from './types';

/**
 * Łączy klasy CSS z obsługą Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatuje datę do wyświetlenia (dd.mm)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

/**
 * Formatuje czas (HH:MM bez sekund)
 */
export function formatTime(time: string | null): string {
  if (!time) return '';
  // Usuń sekundy jeśli są (19:00:00 -> 19:00)
  return time.substring(0, 5);
}

/**
 * Formatuje datę do formatu YYYY-MM-DD
 */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parsuje datę z stringa YYYY-MM-DD
 */
export function parseDateString(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Grupuje mecze według statusu
 */
export function groupMatchesByStatus(matches: Match[]): GroupedMatches {
  return {
    active: matches.filter((m) => m.status === 'active'),
    pending: matches.filter((m) => m.status === 'pending'),
    finished: matches.filter((m) => m.status === 'finished'),
    walkover: matches.filter((m) => m.status === 'walkover'),
  };
}

/**
 * Formatuje czas od ostatniej aktualizacji
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return `${diffSec}s temu`;
  }
  if (diffMin < 60) {
    return `${diffMin}min temu`;
  }
  if (diffHour < 24) {
    return `${diffHour}h temu`;
  }
  return formatDate(d);
}

/**
 * Sprawdza czy data to dzisiaj
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Pobiera datę wczoraj
 */
export function getYesterday(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

/**
 * Pobiera datę jutro
 */
export function getTomorrow(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

/**
 * Generuje tablicę dat wokół podanej daty
 */
export function getDateRange(centerDate: Date, range: number = 3): Date[] {
  const dates: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Debounce dla funkcji
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sprawdza czy tekst zawiera frazę (case-insensitive)
 */
export function containsText(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}

/**
 * Sortuje mecze według numeru tarczy
 */
export function sortByStation(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    if (a.station_number === null && b.station_number === null) return 0;
    if (a.station_number === null) return 1;
    if (b.station_number === null) return -1;
    return a.station_number - b.station_number;
  });
}

/**
 * Grupuje grupy według statusu
 */
export function groupGroupsByStatus(groups: Group[]): GroupedGroups {
  return {
    active: groups.filter((g) => g.status === 'active'),
    pending: groups.filter((g) => g.status === 'pending'),
    finished: groups.filter((g) => g.status === 'finished'),
  };
}

/**
 * Sortuje grupy według numeru tarczy (aktywne pierwsze)
 */
export function sortGroupsByStation(groups: Group[]): Group[] {
  return [...groups].sort((a, b) => {
    // Najpierw aktywne
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;

    // Potem po numerze tarczy
    if (a.station_number === null && b.station_number === null) return 0;
    if (a.station_number === null) return 1;
    if (b.station_number === null) return -1;
    return a.station_number - b.station_number;
  });
}
