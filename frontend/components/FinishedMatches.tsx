'use client';

import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { CompactMatchCard } from './CompactMatchCard';
import type { Match } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FinishedMatchesProps {
  matches: Match[];
  showTournament?: boolean;
  defaultExpanded?: boolean;
}

export function FinishedMatches({
  matches,
  showTournament = false,
  defaultExpanded = false,
}: FinishedMatchesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 py-2 hover:bg-muted/50 rounded-md transition-colors -mx-2 px-2"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg sm:text-xl font-bold">
            Zakończone ({matches.length})
          </h2>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{isExpanded ? 'Zwiń' : 'Rozwiń'}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      <div
        className={cn(
          'space-y-2 transition-all duration-300',
          isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
        )}
      >
        {matches.map((match) => (
          <CompactMatchCard
            key={match.id}
            match={match}
            showTournament={showTournament}
          />
        ))}
      </div>

      {/* Preview when collapsed - show first 3 matches in compact form */}
      {!isExpanded && matches.length > 0 && (
        <div className="space-y-2 opacity-60">
          {matches.slice(0, 3).map((match) => (
            <div
              key={match.id}
              className="text-sm text-muted-foreground flex items-center justify-between px-3 py-2 bg-muted/30 rounded"
            >
              <span className="truncate flex-1">{match.player1_name}</span>
              <span className="font-medium mx-2">
                {match.player1_score} : {match.player2_score}
              </span>
              <span className="truncate flex-1 text-right">{match.player2_name}</span>
            </div>
          ))}
          {matches.length > 3 && (
            <p className="text-sm text-muted-foreground text-center">
              ...i {matches.length - 3} więcej
            </p>
          )}
        </div>
      )}
    </section>
  );
}
