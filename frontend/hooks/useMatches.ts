'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Match, MatchesApiResponse } from '@/lib/types';
import { toDateString } from '@/lib/utils';

const POLLING_INTERVAL = 15000; // 15 sekund

interface UseMatchesOptions {
  date?: Date | null;
  tournamentId?: string;
  pollingEnabled?: boolean;
  activeOnly?: boolean;
}

interface UseMatchesReturn {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useMatches(options: UseMatchesOptions = {}): UseMatchesReturn {
  const { date, tournamentId, pollingEnabled = true, activeOnly = false } = options;

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref do przechowywania aktualnej funkcji fetch (stabilny polling)
  const fetchRef = useRef<() => Promise<void>>();

  const fetchMatches = useCallback(async () => {
    // Anuluj poprzednie żądanie
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams();

      // Jeśli activeOnly=true i brak daty, pobierz wszystkie aktywne
      // Jeśli jest data, pobierz dla konkretnego dnia
      if (date) {
        params.set('date', toDateString(date));
      } else if (activeOnly) {
        params.set('active_only', 'true');
      } else {
        // Domyślnie dzisiaj
        params.set('date', toDateString(new Date()));
      }

      if (tournamentId) {
        params.set('tournament_id', tournamentId);
      }

      const response = await fetch(`/api/matches?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data: MatchesApiResponse = await response.json();
      setMatches(data.matches);
      setLastUpdated(new Date(data.lastUpdated));
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Zignoruj anulowane żądania
      }
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [date, tournamentId, activeOnly]);

  // Aktualizuj ref przy każdej zmianie fetchMatches
  useEffect(() => {
    fetchRef.current = fetchMatches;
  }, [fetchMatches]);

  // Początkowe pobranie danych
  useEffect(() => {
    setIsLoading(true);
    fetchMatches();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMatches]);

  // Polling - używa ref więc nie musi się restartować przy zmianie fetchMatches
  useEffect(() => {
    if (!pollingEnabled) return;

    const intervalId = setInterval(() => {
      fetchRef.current?.();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [pollingEnabled]); // Tylko pollingEnabled w dependencies

  return {
    matches,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchMatches,
  };
}
