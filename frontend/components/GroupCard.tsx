'use client';

import { useState } from 'react';
import { Users, Target, Disc, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Group, MatchStatus } from '@/lib/types';
import { GroupDetailModal } from './GroupDetailModal';

interface GroupCardProps {
  group: Group;
  showTournament?: boolean;
}

function getStatusConfig(status: MatchStatus) {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-darts-green/10',
        border: 'border-l-darts-green',
        text: 'text-darts-green',
        icon: PlayCircle,
        label: 'W TRAKCIE',
      };
    case 'finished':
      return {
        bg: 'bg-gray-100',
        border: 'border-l-gray-400',
        text: 'text-gray-500',
        icon: CheckCircle2,
        label: 'ZAKOŃCZONA',
      };
    default:
      return {
        bg: 'bg-muted/50',
        border: 'border-l-muted-foreground',
        text: 'text-muted-foreground',
        icon: Clock,
        label: 'OCZEKUJE',
      };
  }
}

export function GroupCard({ group, showTournament = false }: GroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = getStatusConfig(group.status);
  const StatusIcon = config.icon;

  const dartType = group.tournament?.dart_type || 'steel';
  const playerNames = group.players.map(p => p.name).join(', ');
  const progress = `${group.completed_matches}/${group.total_matches}`;

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden border-l-4 transition-all hover:shadow-md cursor-pointer',
          config.border,
          config.bg
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Station number (if active) */}
            {group.station_number && group.status === 'active' && (
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-darts-green text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                {group.station_number}
              </div>
            )}

            {/* Group info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {/* Dart type icon */}
                {dartType === 'soft' ? (
                  <Disc className="w-4 h-4 text-darts-soft flex-shrink-0" />
                ) : (
                  <Target className="w-4 h-4 text-darts-steel flex-shrink-0" />
                )}

                {/* Group name */}
                <span className="font-semibold text-sm sm:text-base truncate">
                  {group.group_name}
                </span>

                {/* Status badge */}
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full flex items-center gap-1',
                  config.text,
                  config.bg
                )}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>

              {/* Tournament name */}
              {showTournament && group.tournament && (
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {group.tournament.name}
                </p>
              )}

              {/* Players list */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 flex-shrink-0" />
                <p className="truncate">{playerNames}</p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-darts-green transition-all duration-300"
                    style={{
                      width: `${(group.completed_matches / group.total_matches) * 100}%`
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {progress} meczów
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <GroupDetailModal
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
