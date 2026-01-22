'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Tournament, TournamentsApiResponse } from '@/lib/types';
import { toDateString } from '@/lib/utils';

interface UseTournamentsOptions {
  date?: Date | null;
  includeInactive?: boolean;
  activeOnly?: boolean;
}

interface UseTournamentsReturn {
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTournaments(
  options: UseTournamentsOptions = {}
): UseTournamentsReturn {
  const { date, includeInactive = false, activeOnly = false } = options;

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTournaments = useCallback(async () => {
    // Anuluj poprzednie żądanie
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams();

      // Jeśli activeOnly=true i brak daty, pobierz wszystkie aktywne turnieje
      // Jeśli jest data, pobierz dla konkretnego dnia
      if (date) {
        params.set('date', toDateString(date));
      } else if (activeOnly) {
        params.set('active_only', 'true');
      }

      // Użyj endpointu admin dla wszystkich turniejów lub publicznego dla aktywnych
      const endpoint = includeInactive
        ? '/api/admin/tournaments'
        : '/api/tournaments';

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }

      const data: TournamentsApiResponse = await response.json();
      setTournaments(data.tournaments);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching tournaments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [date, includeInactive, activeOnly]);

  useEffect(() => {
    setIsLoading(true);
    fetchTournaments();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTournaments]);

  return {
    tournaments,
    isLoading,
    error,
    refetch: fetchTournaments,
  };
}
