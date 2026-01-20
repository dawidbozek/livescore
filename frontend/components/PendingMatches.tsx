'use client';

import { Clock } from 'lucide-react';
import { MatchCard } from './MatchCard';
import type { Match } from '@/lib/types';

interface PendingMatchesProps {
  matches: Match[];
  showTournament?: boolean;
}

export function PendingMatches({
  matches,
  showTournament = false,
}: PendingMatchesProps) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold">Oczekujące ({matches.length})</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
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
