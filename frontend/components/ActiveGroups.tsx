'use client';

import { GroupCard } from './GroupCard';
import type { Group } from '@/lib/types';

interface ActiveGroupsProps {
  groups: Group[];
  showTournament?: boolean;
}

export function ActiveGroups({ groups, showTournament = true }: ActiveGroupsProps) {
  if (groups.length === 0) {
    return null;
  }

  // Sortuj - aktywne tarczy na górze
  const sortedGroups = [...groups].sort((a, b) => {
    if (a.station_number && !b.station_number) return -1;
    if (!a.station_number && b.station_number) return 1;
    if (a.station_number && b.station_number) {
      return a.station_number - b.station_number;
    }
    return 0;
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg sm:text-xl font-bold text-darts-green">
        Grupy w trakcie ({groups.length})
      </h2>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        {sortedGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            showTournament={showTournament}
          />
        ))}
      </div>
    </section>
  );
}
