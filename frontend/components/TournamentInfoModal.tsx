'use client';

import { X, Clock, DollarSign, Trophy, Target, Users, Calendar } from 'lucide-react';
import type { Tournament } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TournamentInfoModalProps {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export function TournamentInfoModal({
  tournament,
  isOpen,
  onClose,
}: TournamentInfoModalProps) {
  if (!isOpen) return null;

  const getCategoryLabel = (category: string | null): string => {
    const labels: Record<string, string> = {
      indywidualny: 'Turniej indywidualny',
      deblowy: 'Turniej deblowy',
      triple_mieszane: 'Triple mieszane',
      druzynowy: 'Turniej drużynowy',
    };
    return category ? labels[category] || category : 'Nie określono';
  };

  const getDartTypeLabel = (dartType: string): string => {
    return dartType === 'soft' ? 'Soft Tip' : 'Steel Tip';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate pr-2">{tournament.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{formatDate(tournament.tournament_date)}</p>
            </div>
          </div>

          {/* Start time */}
          {tournament.start_time && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Godzina startu</p>
                <p className="font-medium">{tournament.start_time}</p>
              </div>
            </div>
          )}

          {/* Dart type */}
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Typ darta</p>
              <p className="font-medium">{getDartTypeLabel(tournament.dart_type)}</p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Kategoria</p>
              <p className="font-medium">{getCategoryLabel(tournament.category)}</p>
            </div>
          </div>

          {/* Format */}
          {tournament.format && (
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium">{tournament.format}</p>
              </div>
            </div>
          )}

          {/* Entry fee */}
          {tournament.entry_fee && (
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Wpisowe</p>
                <p className="font-medium">{tournament.entry_fee}</p>
              </div>
            </div>
          )}

          {/* Prizes */}
          {tournament.prizes && (
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Nagrody</p>
                <p className="font-medium whitespace-pre-wrap">{tournament.prizes}</p>
              </div>
            </div>
          )}

          {/* N01 link */}
          <div className="pt-4 border-t border-border">
            <a
              href={tournament.n01_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-darts-primary-hover transition-colors font-medium min-h-[44px]"
            >
              Otwórz w n01darts.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
