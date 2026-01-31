'use client';

import { User } from 'lucide-react';
import type { Match } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CompactMatchCardProps {
  match: Match;
  showTournament?: boolean;
}

export function CompactMatchCard({ match, showTournament = false }: CompactMatchCardProps) {
  const isActive = match.status === 'active';
  const isFinished = match.status === 'finished';

  // Determine winner for styling
  const player1Winning = match.player1_score > match.player2_score;
  const player2Winning = match.player2_score > match.player1_score;

  return (
    <div
      className={cn(
        'flex rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md',
        isActive && 'ring-2 ring-darts-green/50 bg-darts-green/5'
      )}
    >
      {/* Station number - left side - responsive width */}
      {match.station_number ? (
        <div
          className={cn(
            'flex items-center justify-center font-bold text-white',
            'w-10 min-w-[40px] text-base',        // default (very small)
            'xs:w-11 xs:min-w-[44px] xs:text-lg', // 420px+
            'sm:w-12 sm:min-w-[48px]',            // 640px+
            isActive ? 'bg-darts-green' : 'bg-blue-600'
          )}
        >
          {match.station_number}
        </div>
      ) : (
        <div className="flex items-center justify-center w-10 min-w-[40px] xs:w-11 xs:min-w-[44px] sm:w-12 sm:min-w-[48px] bg-gray-200 text-gray-400 font-bold text-base xs:text-lg">
          -
        </div>
      )}

      {/* Match content - responsive padding */}
      <div className="flex-1 p-1.5 xs:p-2 sm:p-3 min-w-0">
        {/* Line 1: Players and Score */}
        <div className="flex items-center gap-1 xs:gap-2">
          {/* Player names - responsive font size, allow wrapping */}
          <div className="flex-1 min-w-0 leading-tight">
            <span
              className={cn(
                'font-semibold break-words',
                'text-xs xs:text-sm',
                isFinished && player1Winning && 'text-darts-green',
                isActive && player1Winning && 'text-darts-green'
              )}
            >
              {match.player1_name}
            </span>
            <span className="mx-1 xs:mx-1.5 text-muted-foreground text-xs xs:text-sm">vs</span>
            <span
              className={cn(
                'font-semibold break-words',
                'text-xs xs:text-sm',
                isFinished && player2Winning && 'text-darts-green',
                isActive && player2Winning && 'text-darts-green'
              )}
            >
              {match.player2_name}
            </span>
          </div>

          {/* Score - responsive */}
          <div
            className={cn(
              'flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 rounded font-bold tabular-nums flex-shrink-0',
              'text-xs xs:text-sm',
              isActive ? 'bg-darts-green/20 text-darts-green' : 'bg-muted'
            )}
          >
            <span className={cn(player1Winning && 'text-darts-green')}>
              {match.player1_score}
            </span>
            <span className="text-muted-foreground">:</span>
            <span className={cn(player2Winning && 'text-darts-green')}>
              {match.player2_score}
            </span>
          </div>
        </div>

        {/* Line 2: Referee and Tournament - responsive */}
        {(match.referee || (showTournament && match.tournament)) && (
          <div className="flex items-center gap-1 xs:gap-2 mt-0.5 xs:mt-1 text-[10px] xs:text-xs text-muted-foreground">
            {match.referee && (
              <div className="flex items-center gap-0.5 xs:gap-1 min-w-0">
                <User className="w-2.5 h-2.5 xs:w-3 xs:h-3 flex-shrink-0" />
                <span className="truncate">{match.referee}</span>
              </div>
            )}
            {match.referee && showTournament && match.tournament && (
              <span className="text-muted-foreground/50">|</span>
            )}
            {showTournament && match.tournament && (
              <span className="truncate">{match.tournament.name}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
