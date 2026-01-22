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
    className: 'bg-darts-green/10 border-darts-green/30 text-darts-green',
    dotClassName: 'bg-darts-green animate-pulse-slow',
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
  const isActive = match.status === 'active';

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        isActive && 'ring-2 ring-darts-green/50 bg-darts-green/5'
      )}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Header: Station and Status */}
        <div className="flex items-center justify-between mb-3 gap-2">
          {/* Station number - circle design for active (left side) */}
          {match.station_number ? (
            <div className={cn(
              'flex items-center justify-center font-bold',
              isActive
                ? 'w-10 h-10 rounded-full bg-darts-green text-white text-lg'
                : 'gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs'
            )}>
              {isActive ? (
                match.station_number
              ) : (
                <>
                  <Target className="w-3 h-3" />
                  <span>T{match.station_number}</span>
                </>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Status badge (right side) */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
              status.className
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', status.dotClassName)} />
            {status.label}
          </div>
        </div>

        {/* Players and Score */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Player 1 */}
          <div className="flex-1 min-w-0 text-right">
            <p
              className={cn(
                'font-semibold truncate text-sm sm:text-base player-name',
                match.player1_score > match.player2_score && 'text-darts-green'
              )}
            >
              {match.player1_name}
            </p>
          </div>

          {/* Score */}
          <div className={cn(
            'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg flex-shrink-0',
            isActive ? 'bg-darts-green/10' : 'bg-muted'
          )}>
            <span
              className={cn(
                'text-lg sm:text-xl font-bold tabular-nums score-display',
                match.player1_score > match.player2_score && 'text-darts-green'
              )}
            >
              {match.player1_score}
            </span>
            <span className="text-muted-foreground">:</span>
            <span
              className={cn(
                'text-lg sm:text-xl font-bold tabular-nums score-display',
                match.player2_score > match.player1_score && 'text-darts-green'
              )}
            >
              {match.player2_score}
            </span>
          </div>

          {/* Player 2 */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-semibold truncate text-sm sm:text-base player-name',
                match.player2_score > match.player1_score && 'text-darts-green'
              )}
            >
              {match.player2_name}
            </p>
          </div>
        </div>

        {/* Footer: Referee and Tournament */}
        {(match.referee || (showTournament && match.tournament)) && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground gap-2">
            {match.referee && (
              <div className="flex items-center gap-1 min-w-0">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Sędzia: {match.referee}</span>
              </div>
            )}

            {showTournament && match.tournament && (
              <span className="truncate text-right flex-shrink-0 max-w-[50%]">
                {match.tournament.name}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
