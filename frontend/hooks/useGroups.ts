'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GroupWithMatches } from '@/lib/types';
import { toDateString } from '@/lib/utils';

interface UseGroupsOptions {
  date?: Date | null;
  tournamentId?: string;
  activeOnly?: boolean;
  pollingInterval?: number;
}

interface UseGroupsReturn {
  groups: GroupWithMatches[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useGroups(options: UseGroupsOptions = {}): UseGroupsReturn {
  const {
    date,
    tournamentId,
    activeOnly = true,
    pollingInterval = 15000,
  } = options;

  const [groups, setGroups] = useState<GroupWithMatches[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // AbortController do anulowania żądań przy unmount
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref do przechowywania aktualnej funkcji fetch (stabilny polling)
  const fetchRef = useRef<() => Promise<void>>();

  const fetchGroups = useCallback(async () => {
    // Anuluj poprzednie żądanie
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Utwórz nowy AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const params = new URLSearchParams();

      if (tournamentId) {
        params.append('tournament_id', tournamentId);
      }

      if (date) {
        params.append('date', toDateString(date));
      }

      if (activeOnly) {
        params.append('active_only', 'true');
      }

      const response = await fetch(`/api/groups?${params.toString()}`, { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();

      // Sprawdź czy żądanie nie zostało anulowane
      if (!signal.aborted) {
        setGroups(data.groups || []);
        setLastUpdated(new Date(data.lastUpdated));
        setError(null);
      }
    } catch (err) {
      // Ignoruj błędy anulowanych żądań
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [date, tournamentId, activeOnly]);

  // Aktualizuj ref przy każdej zmianie fetchGroups
  useEffect(() => {
    fetchRef.current = fetchGroups;
  }, [fetchGroups]);

  // Initial fetch + cleanup
  useEffect(() => {
    setIsLoading(true);
    fetchGroups();

    // Cleanup: anuluj żądanie przy unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchGroups]);

  // Polling - używa ref więc nie musi się restartować przy zmianie fetchGroups
  useEffect(() => {
    if (pollingInterval <= 0) return;

    const interval = setInterval(() => {
      fetchRef.current?.();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval]); // Tylko pollingInterval w dependencies

  return {
    groups,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchGroups,
  };
}
