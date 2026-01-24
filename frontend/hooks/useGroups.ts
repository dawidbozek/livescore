'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchGroups = useCallback(async () => {
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

      const response = await fetch(`/api/groups?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data.groups || []);
      setLastUpdated(new Date(data.lastUpdated));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [date, tournamentId, activeOnly]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchGroups();
  }, [fetchGroups]);

  // Polling
  useEffect(() => {
    if (pollingInterval <= 0) return;

    const interval = setInterval(() => {
      fetchGroups();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchGroups, pollingInterval]);

  return {
    groups,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchGroups,
  };
}
