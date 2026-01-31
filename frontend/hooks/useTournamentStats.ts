'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TournamentStat } from '@/lib/types';

interface UseTournamentStatsOptions {
  tournamentId: string | null;
}

interface UseTournamentStatsReturn {
  stats: TournamentStat[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTournamentStats({ tournamentId }: UseTournamentStatsOptions): UseTournamentStatsReturn {
  const [stats, setStats] = useState<TournamentStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!tournamentId) {
      console.log('[useTournamentStats] No tournament ID, skipping fetch');
      setStats([]);
      return;
    }

    console.log('[useTournamentStats] Fetching stats for:', tournamentId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/stats`);
      console.log('[useTournamentStats] Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch tournament stats');
      }

      const data = await response.json();
      console.log('[useTournamentStats] Received stats:', data.stats?.length || 0);
      setStats(data.stats || []);
    } catch (err) {
      console.error('Error fetching tournament stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
