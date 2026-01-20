'use client';

import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Tournament } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TournamentListProps {
  tournaments: Tournament[];
  selectedId?: string;
  onSelect: (tournament: Tournament | null) => void;
}

export function TournamentList({
  tournaments,
  selectedId,
  onSelect,
}: TournamentListProps) {
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Brak turniejów na wybrany dzień</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Opcja "Wszystkie turnieje" */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          !selectedId && 'ring-2 ring-primary'
        )}
        onClick={() => onSelect(null)}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
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
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{tournament.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {tournament.n01_url}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
