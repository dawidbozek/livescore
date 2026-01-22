'use client';

import { useState } from 'react';
import { Trophy, Info, Target, Disc } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TournamentInfoModal } from './TournamentInfoModal';
import type { Tournament } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';

interface TournamentListProps {
  tournaments: Tournament[];
  selectedId?: string;
  onSelect: (tournament: Tournament | null) => void;
}

function getDartTypeIcon(dartType: string) {
  if (dartType === 'soft') {
    return <Disc className="w-4 h-4 text-darts-soft" />;
  }
  return <Target className="w-4 h-4 text-darts-steel" />;
}

function getDartTypeLabel(dartType: string) {
  return dartType === 'soft' ? 'Soft' : 'Steel';
}

export function TournamentList({
  tournaments,
  selectedId,
  onSelect,
}: TournamentListProps) {
  const [modalTournament, setModalTournament] = useState<Tournament | null>(null);

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Brak turniejów na wybrany dzień</p>
      </div>
    );
  }

  const handleInfoClick = (e: React.MouseEvent, tournament: Tournament) => {
    e.stopPropagation();
    setModalTournament(tournament);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Opcja "Wszystkie turnieje" */}
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            !selectedId && 'ring-2 ring-primary'
          )}
          onClick={() => onSelect(null)}
        >
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Wszystkie turnieje</p>
              <p className="text-sm text-muted-foreground">
                {tournaments.length} turniej(e)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lista turniejów */}
        {tournaments.map((tournament) => (
          <Card
            key={tournament.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedId === tournament.id && 'ring-2 ring-primary'
            )}
            onClick={() => onSelect(tournament)}
          >
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              {/* Icon with dart type */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                tournament.dart_type === 'soft' ? 'bg-darts-soft/10' : 'bg-darts-steel/10'
              )}>
                {getDartTypeIcon(tournament.dart_type)}
              </div>

              {/* Tournament info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{tournament.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    tournament.dart_type === 'soft'
                      ? 'bg-darts-soft/10 text-darts-soft'
                      : 'bg-darts-steel/10 text-darts-steel'
                  )}>
                    {getDartTypeLabel(tournament.dart_type)}
                  </span>
                  {tournament.start_time && (
                    <span>{formatTime(tournament.start_time)}</span>
                  )}
                </div>
              </div>

              {/* Info button */}
              <button
                onClick={(e) => handleInfoClick(e, tournament)}
                className="p-2 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Szczegóły turnieju"
              >
                <Info className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {modalTournament && (
        <TournamentInfoModal
          tournament={modalTournament}
          isOpen={true}
          onClose={() => setModalTournament(null)}
        />
      )}
    </>
  );
}
