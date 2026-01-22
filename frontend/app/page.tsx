'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, Settings, Target } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Banner } from '@/components/Banner';
import { DateSelector } from '@/components/DateSelector';
import { SearchBar } from '@/components/SearchBar';
import { TournamentList } from '@/components/TournamentList';
import { ActiveMatches } from '@/components/ActiveMatches';
import { PendingMatches } from '@/components/PendingMatches';
import { FinishedMatches } from '@/components/FinishedMatches';
import { MatchCard } from '@/components/MatchCard';

import { useMatches } from '@/hooks/useMatches';
import { useTournaments } from '@/hooks/useTournaments';
import { groupMatchesByStatus, formatTimeAgo, toDateString } from '@/lib/utils';
import type { Match, Tournament } from '@/lib/types';

export default function HomePage() {
  // null = wszystkie aktywne turnieje, Date = konkretny dzień
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [searchResults, setSearchResults] = useState<Match[] | null>(null);

  const { tournaments, isLoading: tournamentsLoading } = useTournaments({
    date: selectedDate,
    activeOnly: selectedDate === null,
  });

  const { matches, isLoading: matchesLoading, lastUpdated, refetch } = useMatches({
    date: selectedDate,
    tournamentId: selectedTournament?.id,
    activeOnly: selectedDate === null,
  });

  // Filtruj mecze na podstawie wyszukiwania
  const displayedMatches = searchResults || matches;

  // Grupuj mecze według statusu
  const groupedMatches = useMemo(
    () => groupMatchesByStatus(displayedMatches),
    [displayedMatches]
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTournament(null);
    setSearchResults(null);
  };

  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
    setSearchResults(null);
  };

  const handleSearchResults = (results: Match[]) => {
    setSearchResults(results);
  };

  const handleSearchClear = () => {
    setSearchResults(null);
  };

  const isLoading = tournamentsLoading || matchesLoading;

  return (
    <div className="min-h-screen min-w-[320px]">
      {/* Header */}
      <Header />

      {/* Banner */}
      <Banner />

      {/* Top bar with refresh and admin */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Aktualizacja: {formatTimeAgo(lastUpdated)}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={refetch}
                disabled={isLoading}
                className="min-h-[44px] min-w-[44px]"
                aria-label="Odśwież"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Panel administracyjny"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[300px,1fr] gap-4 sm:gap-6">
          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-6">
            {/* SearchBar - mobile */}
            <div className="lg:hidden">
              <SearchBar
                matches={matches}
                onSearchResults={handleSearchResults}
                onClear={handleSearchClear}
              />
            </div>

            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />

            <div>
              <h2 className="text-lg font-semibold mb-3">Turnieje</h2>
              {tournamentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-20 rounded-lg" />
                  ))}
                </div>
              ) : (
                <TournamentList
                  tournaments={tournaments}
                  selectedId={selectedTournament?.id}
                  onSelect={handleTournamentSelect}
                />
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-6 sm:space-y-8">
            {/* SearchBar - desktop */}
            <div className="hidden lg:block">
              <SearchBar
                matches={matches}
                onSearchResults={handleSearchResults}
                onClear={handleSearchClear}
              />
            </div>

            {/* Search results info */}
            {searchResults && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-sm sm:text-base">
                  Znaleziono <strong>{searchResults.length}</strong> mecz(y/ów)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClear}
                  className="min-h-[44px]"
                >
                  Wyczyść
                </Button>
              </div>
            )}

            {/* Loading state */}
            {matchesLoading && !matches.length ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Empty state */}
                {displayedMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">
                      Brak meczów do wyświetlenia
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {searchResults
                        ? 'Nie znaleziono meczów pasujących do wyszukiwania'
                        : selectedDate === null
                          ? 'Obecnie nie ma żadnych aktywnych meczów'
                          : 'Na wybrany dzień nie ma żadnych meczów'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active matches */}
                    <ActiveMatches
                      matches={groupedMatches.active}
                      showTournament={!selectedTournament}
                    />

                    {/* Pending matches */}
                    <PendingMatches
                      matches={groupedMatches.pending}
                      showTournament={!selectedTournament}
                    />

                    {/* Finished matches - collapsible */}
                    <FinishedMatches
                      matches={groupedMatches.finished}
                      showTournament={!selectedTournament}
                    />

                    {/* Walkovers */}
                    {groupedMatches.walkover.length > 0 && (
                      <section className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-bold text-muted-foreground">
                          Walkovery ({groupedMatches.walkover.length})
                        </h2>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 opacity-50">
                          {groupedMatches.walkover.map((match) => (
                            <MatchCard
                              key={match.id}
                              match={match}
                              showTournament={!selectedTournament}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 px-3 sm:px-4 text-center text-sm text-muted-foreground">
        <p>Darts Live Score - System wyników na żywo</p>
        <p className="mt-1">Dane aktualizowane co 15 sekund</p>
      </footer>
    </div>
  );
}
