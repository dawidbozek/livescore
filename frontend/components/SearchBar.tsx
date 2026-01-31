'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Match, Group, GroupPlayer } from '@/lib/types';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  matches: Match[];
  groups?: Group[];
  onSearchResults: (results: Match[]) => void;
  onGroupResults?: (results: Group[]) => void;
  onClear: () => void;
}

// Flatten group players for search
interface FlatGroupPlayer {
  name: string;
  groupId: string;
}

function SearchBarComponent({
  matches,
  groups = [],
  onSearchResults,
  onGroupResults,
  onClear,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Konfiguracja Fuse.js dla meczów K.O.
  const matchFuse = useMemo(() => {
    return new Fuse(matches, {
      keys: ['player1_name', 'player2_name', 'referee'],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    });
  }, [matches]);

  // Flatten players from groups for search
  const flatGroupPlayers = useMemo(() => {
    const players: FlatGroupPlayer[] = [];
    groups.forEach(group => {
      const groupPlayers = (group.players || []) as GroupPlayer[];
      groupPlayers.forEach(player => {
        players.push({
          name: player.name,
          groupId: group.id,
        });
      });
    });
    return players;
  }, [groups]);

  // Konfiguracja Fuse.js dla graczy w grupach
  const groupPlayerFuse = useMemo(() => {
    return new Fuse(flatGroupPlayers, {
      keys: ['name'],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    });
  }, [flatGroupPlayers]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        if (!searchQuery.trim()) {
          onClear();
          return;
        }

        // Search in K.O. matches
        const matchResults = matchFuse.search(searchQuery);
        onSearchResults(matchResults.map((r) => r.item));

        // Search in groups
        if (onGroupResults && groups.length > 0) {
          const playerResults = groupPlayerFuse.search(searchQuery);

          // Get unique groups containing found players
          const foundGroupIds = new Set(playerResults.map((r) => r.item.groupId));
          const foundGroups = groups.filter((g) => foundGroupIds.has(g.id));

          onGroupResults(foundGroups);
        }
      }, 300),
    [matchFuse, groupPlayerFuse, groups, onSearchResults, onGroupResults, onClear]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        Wyszukaj zawodnika:
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Szukaj zawodnika..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 min-h-[44px] text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
            onClick={handleClear}
            aria-label="Wyczyść wyszukiwanie"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Memoizowany komponent - re-renderuje się tylko gdy zmienią się dane
export const SearchBar = memo(SearchBarComponent, (prevProps, nextProps) => {
  // Shallow comparison dla funkcji callback (zakładamy że są stabilne)
  if (prevProps.onSearchResults !== nextProps.onSearchResults) return false;
  if (prevProps.onGroupResults !== nextProps.onGroupResults) return false;
  if (prevProps.onClear !== nextProps.onClear) return false;

  // Porównaj długość tablic (szybkie sprawdzenie)
  if (prevProps.matches.length !== nextProps.matches.length) return false;
  if ((prevProps.groups?.length || 0) !== (nextProps.groups?.length || 0)) return false;

  // Porównaj ID pierwszego i ostatniego elementu (heurystyka)
  if (prevProps.matches.length > 0 && nextProps.matches.length > 0) {
    if (prevProps.matches[0].id !== nextProps.matches[0].id) return false;
    const lastPrev = prevProps.matches[prevProps.matches.length - 1];
    const lastNext = nextProps.matches[nextProps.matches.length - 1];
    if (lastPrev.id !== lastNext.id) return false;
  }

  return true;
});
