'use client';

import { useState, useMemo } from 'react';
import { RefreshCw, Settings, Target } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { DateSelector } from '@/components/DateSelector';
import { SearchBar } from '@/components/SearchBar';
import { TournamentList } from '@/components/TournamentList';
import { ActiveMatches } from '@/components/ActiveMatches';
import { ActiveGroups } from '@/components/ActiveGroups';
import { PendingMatches } from '@/components/PendingMatches';
import { FinishedMatches } from '@/components/FinishedMatches';
import { MatchCard } from '@/components/MatchCard';
import { GroupCard } from '@/components/GroupCard';

import { useMatches } from '@/hooks/useMatches';
import { useTournaments } from '@/hooks/useTournaments';
import { useGroups } from '@/hooks/useGroups';
import { groupMatchesByStatus, groupGroupsByStatus, formatTimeAgo } from '@/lib/utils';
import type { Match, Tournament, Group } from '@/lib/types';

export default function LiveScorePage() {
  // null = wszystkie aktywne turnieje, Date = konkretny dzień
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [searchResults, setSearchResults] = useState<Match[] | null>(null);
  const [searchGroupResults, setSearchGroupResults] = useState<Group[] | null>(null);

  const { tournaments, isLoading: tournamentsLoading } = useTournaments({
    date: selectedDate,
    activeOnly: selectedDate === null,
  });

  const { matches, isLoading: matchesLoading, lastUpdated, refetch: refetchMatches } = useMatches({
    date: selectedDate,
    tournamentId: selectedTournament?.id,
    activeOnly: selectedDate === null,
  });

  const { groups, isLoading: groupsLoading, refetch: refetchGroups } = useGroups({
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

  // Grupuj grupy według statusu
  const groupedGroups = useMemo(
    () => groupGroupsByStatus(groups),
    [groups]
  );

  // Funkcja odświeżająca wszystko
  const refetch = () => {
    refetchMatches();
    refetchGroups();
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTournament(null);
    setSearchResults(null);
    setSearchGroupResults(null);
  };

  const handleTournamentSelect = (tournament: Tournament | null) => {
    setSelectedTournament(tournament);
    setSearchResults(null);
    setSearchGroupResults(null);
  };

  const handleSearchResults = (results: Match[]) => {
    setSearchResults(results.length > 0 ? results : null);
  };

  const handleGroupSearchResults = (results: Group[]) => {
    setSearchGroupResults(results.length > 0 ? results : null);
  };

  const handleSearchClear = () => {
    setSearchResults(null);
    setSearchGroupResults(null);
  };

  const isLoading = tournamentsLoading || matchesLoading || groupsLoading;

  return (
    <div className="min-w-[320px]">
      {/* Live Score Header */}
      <div className="bg-primary text-primary-foreground py-3">
        <div className="container mx-auto container-responsive sm:px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold">LIVE SCORE</h1>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs opacity-80 hidden sm:inline">
                  Aktualizacja: {formatTimeAgo(lastUpdated)}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={refetch}
                disabled={isLoading}
                className="min-h-[44px] min-w-[44px] text-primary-foreground hover:bg-white/10"
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
                  className="min-h-[44px] min-w-[44px] text-primary-foreground hover:bg-white/10"
                  aria-label="Panel administracyjny"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto container-responsive sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[300px,1fr] gap-4 sm:gap-6">
          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-6">
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

            {/* SearchBar - pod listą turniejów */}
            <SearchBar
              matches={matches}
              groups={groups}
              onSearchResults={handleSearchResults}
              onGroupResults={handleGroupSearchResults}
              onClear={handleSearchClear}
            />
          </aside>

          {/* Main content */}
          <div className="space-y-6 sm:space-y-8">

            {/* Search results info */}
            {(searchResults || searchGroupResults) && (
              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-sm sm:text-base">
                  Znaleziono{' '}
                  {searchResults && <><strong>{searchResults.length}</strong> mecz(y/ów)</>}
                  {searchResults && searchGroupResults && ', '}
                  {searchGroupResults && <><strong>{searchGroupResults.length}</strong> grup(y)</>}
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
            {(matchesLoading || groupsLoading) && !matches.length && !groups.length ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Empty state */}
                {displayedMatches.length === 0 && groups.length === 0 && !searchGroupResults ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">
                      Brak meczów do wyświetlenia
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {searchResults || searchGroupResults
                        ? 'Nie znaleziono meczów pasujących do wyszukiwania'
                        : selectedDate === null
                          ? 'Obecnie nie ma żadnych aktywnych meczów'
                          : 'Na wybrany dzień nie ma żadnych meczów'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Searched groups - display when searching */}
                    {searchGroupResults && searchGroupResults.length > 0 && (
                      <section className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-bold">
                          Znalezione grupy ({searchGroupResults.length})
                        </h2>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                          {searchGroupResults.map((group) => (
                            <GroupCard
                              key={group.id}
                              group={group}
                              showTournament={!selectedTournament}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Active groups (from group tournaments) - hide when searching */}
                    {!searchResults && !searchGroupResults && groupedGroups.active.length > 0 && (
                      <ActiveGroups
                        groups={groupedGroups.active}
                        showTournament={!selectedTournament}
                      />
                    )}

                    {/* Active matches (from K.O. tournaments) */}
                    <ActiveMatches
                      matches={groupedMatches.active}
                      showTournament={!selectedTournament}
                    />

                    {/* Pending groups - hide when searching */}
                    {!searchResults && !searchGroupResults && groupedGroups.pending.length > 0 && (
                      <section className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-bold text-muted-foreground">
                          Grupy oczekujące ({groupedGroups.pending.length})
                        </h2>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                          {groupedGroups.pending.map((group) => (
                            <GroupCard
                              key={group.id}
                              group={group}
                              showTournament={!selectedTournament}
                            />
                          ))}
                        </div>
                      </section>
                    )}

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
    </div>
  );
}
