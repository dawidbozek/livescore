'use client';

import { Clock } from 'lucide-react';
import { CompactMatchCard } from './CompactMatchCard';
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg sm:text-xl font-bold">
          Oczekujące ({matches.length})
        </h2>
      </div>

      <div className="space-y-2">
        {matches.map((match) => (
          <CompactMatchCard
            key={match.id}
            match={match}
            showTournament={showTournament}
          />
        ))}
      </div>
    </section>
  );
}
