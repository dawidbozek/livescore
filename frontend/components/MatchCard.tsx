'use client';

import { Target, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Match, MatchStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
  showTournament?: boolean;
}

const statusConfig: Record<
  MatchStatus,
  { label: string; className: string; dotClassName: string }
> = {
  active: {
    label: 'W trakcie',
    className: 'bg-green-500/10 border-green-500/30 text-green-700',
    dotClassName: 'bg-green-500 animate-pulse-slow',
  },
  pending: {
    label: 'Oczekujący',
    className: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700',
    dotClassName: 'bg-yellow-500',
  },
  finished: {
    label: 'Zakończony',
    className: 'bg-gray-500/10 border-gray-500/30 text-gray-600',
    dotClassName: 'bg-gray-500',
  },
  walkover: {
    label: 'Walkover',
    className: 'bg-red-500/10 border-red-500/30 text-red-700',
    dotClassName: 'bg-red-500',
  },
};

export function MatchCard({ match, showTournament = false }: MatchCardProps) {
  const status = statusConfig[match.status];

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        match.status === 'active' && 'ring-2 ring-green-500/50'
      )}
    >
      <CardContent className="p-4">
        {/* Status i numer tarczy */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
              status.className
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', status.dotClassName)} />
            {status.label}
          </div>

          {match.station_number && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs font-medium">
              <Target className="w-3 h-3" />
              Tarcza {match.station_number}
            </div>
          )}
        </div>

        {/* Gracze i wynik */}
        <div className="flex items-center justify-between gap-4">
          {/* Gracz 1 */}
          <div className="flex-1 text-right">
            <p
              className={cn(
                'font-semibold truncate',
                match.player1_score > match.player2_score && 'text-green-600'
              )}
            >
              {match.player1_name}
            </p>
          </div>

          {/* Wynik */}
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
            <span
              className={cn(
                'text-xl font-bold tabular-nums',
                match.player1_score > match.player2_score && 'text-green-600'
              )}
            >
              {match.player1_score}
            </span>
            <span className="text-muted-foreground">:</span>
            <span
              className={cn(
                'text-xl font-bold tabular-nums',
                match.player2_score > match.player1_score && 'text-green-600'
              )}
            >
              {match.player2_score}
            </span>
          </div>

          {/* Gracz 2 */}
          <div className="flex-1">
            <p
              className={cn(
                'font-semibold truncate',
                match.player2_score > match.player1_score && 'text-green-600'
              )}
            >
              {match.player2_name}
            </p>
          </div>
        </div>

        {/* Sędzia i turniej */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          {match.referee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Sędzia: {match.referee}</span>
            </div>
          )}

          {showTournament && match.tournament && (
            <span className="truncate">{match.tournament.name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
