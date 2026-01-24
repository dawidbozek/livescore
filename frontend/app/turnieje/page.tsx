'use client';

import { useState } from 'react';
import { Calendar, Target, Disc, Info, ExternalLink, FileText, Trophy, Clock, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TournamentInfoModal } from '@/components/TournamentInfoModal';
import { cn, formatTime } from '@/lib/utils';
import type { Tournament, DartType } from '@/lib/types';

// Hardcoded tournament schedule for MP2026
// In production, this would come from the database
const tournamentSchedule: Record<string, Omit<Tournament, 'id' | 'is_active' | 'n01_url' | 'created_at' | 'updated_at' | 'image_url' | 'tournament_format'>[]> = {
  'czwartek': [
    {
      name: 'Warmup Open Steel',
      tournament_date: '2026-07-16',
      dart_type: 'steel',
      category: 'indywidualny',
      start_time: '09:00',
      entry_fee: '50 zł',
      format: 'Double elimination, 501 DO',
      prizes: '1. 1000 zł\n2. 500 zł\n3. 250 zł',
    },
    {
      name: 'Warmup Open Soft',
      tournament_date: '2026-07-16',
      dart_type: 'soft',
      category: 'indywidualny',
      start_time: '14:00',
      entry_fee: '40 zł',
      format: 'Double elimination, 501 DO',
      prizes: '1. 800 zł\n2. 400 zł\n3. 200 zł',
    },
    {
      name: 'Turniej Nocny',
      tournament_date: '2026-07-16',
      dart_type: 'steel',
      category: 'indywidualny',
      start_time: '20:00',
      entry_fee: '30 zł',
      format: 'Single elimination, 301 DO',
      prizes: '1. 500 zł',
    },
  ],
  'piatek': [
    {
      name: 'MP Steel Indywidualny Mężczyzn',
      tournament_date: '2026-07-17',
      dart_type: 'steel',
      category: 'indywidualny',
      start_time: '09:00',
      entry_fee: '100 zł',
      format: 'Grupy + Double elimination, 501 DO',
      prizes: '1. 5000 zł + tytuł Mistrza Polski\n2. 2500 zł\n3. 1250 zł\n4. 1250 zł',
    },
    {
      name: 'MP Steel Indywidualny Kobiet',
      tournament_date: '2026-07-17',
      dart_type: 'steel',
      category: 'indywidualny',
      start_time: '09:00',
      entry_fee: '80 zł',
      format: 'Double elimination, 501 DO',
      prizes: '1. 2000 zł + tytuł Mistrzyni Polski\n2. 1000 zł\n3. 500 zł',
    },
    {
      name: 'MP Soft Indywidualny',
      tournament_date: '2026-07-17',
      dart_type: 'soft',
      category: 'indywidualny',
      start_time: '10:00',
      entry_fee: '80 zł',
      format: 'Double elimination, 501 DO',
      prizes: '1. 3000 zł + tytuł Mistrza Polski\n2. 1500 zł\n3. 750 zł',
    },
  ],
  'sobota': [
    {
      name: 'MP Steel Deble',
      tournament_date: '2026-07-18',
      dart_type: 'steel',
      category: 'deblowy',
      start_time: '09:00',
      entry_fee: '120 zł/para',
      format: 'Double elimination, 501 DO',
      prizes: '1. 4000 zł + tytuł\n2. 2000 zł\n3. 1000 zł',
    },
    {
      name: 'Turniej Reprezentantów',
      tournament_date: '2026-07-18',
      dart_type: 'steel',
      category: 'druzynowy',
      start_time: '14:00',
      entry_fee: 'Zaproszenie',
      format: '128 zawodników z 36+ organizacji',
      prizes: 'Pula: 12 800 zł',
    },
    {
      name: 'MP Soft Deble',
      tournament_date: '2026-07-18',
      dart_type: 'soft',
      category: 'deblowy',
      start_time: '10:00',
      entry_fee: '100 zł/para',
      format: 'Double elimination, 501 DO',
      prizes: '1. 2000 zł\n2. 1000 zł\n3. 500 zł',
    },
  ],
  'niedziela': [
    {
      name: 'MP Steel Triple Mieszane',
      tournament_date: '2026-07-19',
      dart_type: 'steel',
      category: 'triple_mieszane',
      start_time: '09:00',
      entry_fee: '150 zł/trójka',
      format: 'Double elimination, 501 DO',
      prizes: '1. 3000 zł + tytuł\n2. 1500 zł\n3. 750 zł',
    },
    {
      name: 'Open Steel',
      tournament_date: '2026-07-19',
      dart_type: 'steel',
      category: 'indywidualny',
      start_time: '12:00',
      entry_fee: '50 zł',
      format: 'Double elimination, 501 DO',
      prizes: '1. 1500 zł\n2. 750 zł\n3. 375 zł',
    },
    {
      name: 'Gala Finałowa',
      tournament_date: '2026-07-19',
      dart_type: 'steel',
      category: 'indywidualny',
      start_time: '16:00',
      entry_fee: '-',
      format: 'Finały głównych turniejów',
      prizes: 'Transmisja LIVE na YouTube',
    },
  ],
};

const days = [
  { id: 'czwartek', label: 'Czwartek', date: '16.07' },
  { id: 'piatek', label: 'Piątek', date: '17.07' },
  { id: 'sobota', label: 'Sobota', date: '18.07' },
  { id: 'niedziela', label: 'Niedziela', date: '19.07' },
];

function getDartTypeIcon(dartType: DartType) {
  if (dartType === 'soft') {
    return <Disc className="w-5 h-5 text-blue-500" />;
  }
  return <Target className="w-5 h-5 text-orange-600" />;
}

function getCategoryLabel(category: string | undefined) {
  switch (category) {
    case 'indywidualny': return 'Indywidualny';
    case 'deblowy': return 'Deble';
    case 'triple_mieszane': return 'Triple Mieszane';
    case 'druzynowy': return 'Drużynowy';
    default: return category;
  }
}

export default function TurniejePage() {
  const [activeDay, setActiveDay] = useState('czwartek');
  const [modalTournament, setModalTournament] = useState<Tournament | null>(null);

  const tournaments = tournamentSchedule[activeDay] || [];

  const openModal = (tournament: Omit<Tournament, 'id' | 'is_active' | 'n01_url' | 'created_at' | 'updated_at' | 'image_url' | 'tournament_format'>) => {
    // Convert to full Tournament type for modal
    setModalTournament({
      ...tournament,
      id: Math.random().toString(),
      is_active: false,
      n01_url: '',
      image_url: null,
      tournament_format: 'single_ko',
      created_at: '',
      updated_at: '',
    } as Tournament);
  };

  return (
    <div className="min-w-[320px]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16">
        <div className="container mx-auto container-responsive sm:px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">16-19 lipca 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Kalendarz Turniejów
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            20+ turniejów w 4 dni. Steel i Soft. Indywidualne, deble i drużynowe.
            Sprawdź co i kiedy możesz zagrać.
          </p>
        </div>
      </section>

      {/* Day Tabs */}
      <div className="sticky top-14 sm:top-16 z-30 bg-background border-b">
        <div className="container mx-auto container-responsive sm:px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={cn(
                  'flex-1 min-w-[80px] py-4 px-3 text-center font-medium transition-colors border-b-2',
                  activeDay === day.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="block text-sm sm:text-base">{day.label}</span>
                <span className="block text-xs text-muted-foreground">{day.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto container-responsive sm:px-4">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">
              {days.find(d => d.id === activeDay)?.label}, {days.find(d => d.id === activeDay)?.date}
            </h2>
            <p className="text-muted-foreground">
              {tournaments.length} turniej{tournaments.length === 1 ? '' : tournaments.length < 5 ? 'e' : 'ów'}
            </p>
          </div>

          <div className="space-y-4">
            {tournaments.map((tournament, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Time column */}
                    <div className="bg-gray-50 p-4 sm:p-6 sm:w-32 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                      <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold text-lg">
                          {formatTime(tournament.start_time || '')}
                        </span>
                      </div>
                      <div className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        tournament.dart_type === 'soft'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      )}>
                        {tournament.dart_type === 'soft' ? 'SOFT' : 'STEEL'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getDartTypeIcon(tournament.dart_type as DartType)}
                            <h3 className="font-bold text-lg">{tournament.name}</h3>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                            {tournament.category && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {getCategoryLabel(tournament.category)}
                              </span>
                            )}
                            {tournament.entry_fee && (
                              <span className="flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                Wpisowe: {tournament.entry_fee}
                              </span>
                            )}
                          </div>

                          {tournament.format && (
                            <p className="text-sm text-muted-foreground">
                              {tournament.format}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(tournament)}
                            className="min-h-[40px]"
                          >
                            <Info className="w-4 h-4 mr-1" />
                            Szczegóły
                          </Button>
                        </div>
                      </div>

                      {/* Prizes preview */}
                      {tournament.prizes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="font-medium">Nagrody:</span>
                            <span className="text-muted-foreground">
                              {tournament.prizes.split('\n')[0]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto container-responsive sm:px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Registration info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Jak się zapisać?
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <span>Załóż konto na <a href="https://n01darts.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">n01darts.com</a></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <span>Znajdź turniej na liście i kliknij &quot;Join&quot;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <span>Zapłać wpisowe gotówką na miejscu przed startem</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* National team path */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Ścieżka do kadry
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mistrzostwa Polski to oficjalna kwalifikacja do Mistrzostw Europy EDF.
                  10 nominacji do reprezentacji Polski:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mistrz Polski Steel Mężczyzn</li>
                  <li>• Mistrzyni Polski Steel Kobiet</li>
                  <li>• Top 8 turnieju głównego</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Download section */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" className="min-h-[48px]">
              <FileText className="w-5 h-5 mr-2" />
              Pobierz regulamin MP 2026 (PDF)
            </Button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalTournament && (
        <TournamentInfoModal
          tournament={modalTournament}
          isOpen={true}
          onClose={() => setModalTournament(null)}
        />
      )}
    </div>
  );
}
