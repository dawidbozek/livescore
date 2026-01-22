'use client';

import { Zap } from 'lucide-react';
import { MatchCard } from './MatchCard';
import type { Match } from '@/lib/types';
import { sortByStation } from '@/lib/utils';

interface ActiveMatchesProps {
  matches: Match[];
  showTournament?: boolean;
}

export function ActiveMatches({
  matches,
  showTournament = false,
}: ActiveMatchesProps) {
  if (matches.length === 0) {
    return null;
  }

  // Sort by station number for active matches
  const sortedMatches = sortByStation(matches);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-darts-green" />
        <h2 className="text-lg sm:text-xl font-bold">
          Mecze w trakcie ({matches.length})
        </h2>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sortedMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            showTournament={showTournament}
          />
        ))}
      </div>
    </section>
  );
}
