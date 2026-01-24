'use client';

import { X, Target, Disc, Users, Trophy, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Group, GroupMatch, GroupPlayer, MatchStatus } from '@/lib/types';

interface GroupDetailModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

function getMatchStatusIcon(status: MatchStatus) {
  switch (status) {
    case 'active':
      return <PlayCircle className="w-4 h-4 text-darts-green" />;
    case 'finished':
      return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

function getMatchStatusBg(status: MatchStatus) {
  switch (status) {
    case 'active':
      return 'bg-darts-green/10';
    case 'finished':
      return 'bg-gray-50';
    default:
      return '';
  }
}

export function GroupDetailModal({ group, isOpen, onClose }: GroupDetailModalProps) {
  if (!isOpen) return null;

  const dartType = group.tournament?.dart_type || 'steel';
  const isSteelType = dartType === 'steel';

  // Cast players to proper type
  const players = (group.players || []) as GroupPlayer[];

  // Get matches if available
  const matches = ('matches' in group ? group.matches : []) as GroupMatch[];

  // Sort players by rank
  const sortedPlayers = [...players].sort((a, b) => (a.rank || 99) - (b.rank || 99));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {dartType === 'soft' ? (
              <Disc className="w-5 h-5 text-darts-soft" />
            ) : (
              <Target className="w-5 h-5 text-darts-steel" />
            )}
            <h2 className="text-lg font-bold">{group.group_name}</h2>
            {group.station_number && (
              <span className="px-2 py-0.5 bg-darts-green text-white text-xs rounded-full">
                Tarcza {group.station_number}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Tournament name */}
          {group.tournament && (
            <p className="text-sm text-muted-foreground">
              {group.tournament.name}
            </p>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Postęp grupy</span>
              <span className="font-medium">{group.completed_matches}/{group.total_matches} meczów</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-darts-green transition-all duration-300"
                style={{
                  width: `${(group.completed_matches / group.total_matches) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Standings Table */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Tabela grupy
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-2 font-medium">#</th>
                    <th className="text-left py-2 px-2 font-medium">Zawodnik</th>
                    <th className="text-center py-2 px-2 font-medium">M</th>
                    <th className="text-center py-2 px-2 font-medium">W-L</th>
                    <th className="text-center py-2 px-2 font-medium">Legi</th>
                    {isSteelType && (
                      <th className="text-center py-2 px-2 font-medium">Avg</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr
                      key={player.id || player.name}
                      className={cn(
                        'border-b',
                        index < 2 && 'bg-darts-green/5' // Top 2 advance highlight
                      )}
                    >
                      <td className="py-2 px-2 font-medium">
                        {player.rank || index + 1}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <span>{player.name}</span>
                          {index < 2 && group.status === 'finished' && (
                            <span className="text-xs text-darts-green">✓</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-2 px-2">
                        {(player.wins || 0) + (player.losses || 0)}
                      </td>
                      <td className="text-center py-2 px-2">
                        {player.wins || 0} - {player.losses || 0}
                      </td>
                      <td className="text-center py-2 px-2">
                        {player.legsWon || 0} - {player.legsLost || 0}
                      </td>
                      {isSteelType && (
                        <td className="text-center py-2 px-2">
                          {player.average ? player.average.toFixed(2) : '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matches List */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mecze w grupie
            </h3>
            <div className="space-y-2">
              {matches.length > 0 ? (
                matches.map((match, index) => (
                  <div
                    key={match.id || index}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg border',
                      getMatchStatusBg(match.status)
                    )}
                  >
                    {/* Match number */}
                    <span className="text-xs text-muted-foreground w-6 text-center">
                      {match.match_order || index + 1}
                    </span>

                    {/* Status icon */}
                    {getMatchStatusIcon(match.status)}

                    {/* Players and score */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          'truncate',
                          match.status === 'finished' && match.player1_score > match.player2_score && 'font-semibold'
                        )}>
                          {match.player1_name}
                        </span>
                        <span className="font-mono text-sm">
                          {match.status === 'finished' ? (
                            `${match.player1_score} - ${match.player2_score}`
                          ) : (
                            <span className="text-muted-foreground">vs</span>
                          )}
                        </span>
                        <span className={cn(
                          'truncate text-right',
                          match.status === 'finished' && match.player2_score > match.player1_score && 'font-semibold'
                        )}>
                          {match.player2_name}
                        </span>
                      </div>
                    </div>

                    {/* Referee (Steel only) */}
                    {isSteelType && match.referee && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Sędzia: {match.referee}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak danych o meczach
                </p>
              )}
            </div>
          </div>

          {/* Referee scheme (if available) */}
          {isSteelType && group.referee_scheme && (
            <div>
              <h3 className="font-semibold mb-2">Schemat sędziów</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {group.referee_scheme}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full min-h-[44px]"
          >
            Zamknij
          </Button>
        </div>
      </div>
    </div>
  );
}
