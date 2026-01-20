'use client';

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Match } from '@/lib/types';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  matches: Match[];
  onSearchResults: (results: Match[]) => void;
  onClear: () => void;
}

export function SearchBar({ matches, onSearchResults, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Konfiguracja Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(matches, {
      keys: ['player1_name', 'player2_name', 'referee'],
      threshold: 0.3, // Im niższa wartość, tym dokładniejsze dopasowanie
      includeScore: true,
      ignoreLocation: true,
    });
  }, [matches]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        if (!searchQuery.trim()) {
          onClear();
          return;
        }

        const results = fuse.search(searchQuery);
        onSearchResults(results.map((r) => r.item));
      }, 300),
    [fuse, onSearchResults, onClear]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Szukaj zawodnika..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
