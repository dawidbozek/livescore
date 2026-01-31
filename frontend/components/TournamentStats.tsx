'use client';

import { useState, useMemo } from 'react';
import { Trophy, Target, Zap, Award, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TournamentStat } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TournamentStatsProps {
  stats: TournamentStat[];
  tournamentName?: string;
}

type SortKey = 'avg_3_darts' | 'matches_won' | 'scores_180' | 'high_finish' | 'best_leg';
type SortDirection = 'asc' | 'desc';

export function TournamentStats({ stats, tournamentName }: TournamentStatsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_3_darts');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Podium (TOP 3) - sorted by average
  const podium = useMemo(() => {
    return [...stats]
      .filter(s => s.avg_3_darts !== null)
      .sort((a, b) => (b.avg_3_darts || 0) - (a.avg_3_darts || 0))
      .slice(0, 3);
  }, [stats]);

  // Records
  const records = useMemo(() => {
    const validStats = stats.filter(s => s.avg_3_darts !== null);

    // Highest average
    const highestAvg = validStats.length > 0
      ? validStats.reduce((max, s) => (s.avg_3_darts || 0) > (max.avg_3_darts || 0) ? s : max)
      : null;

    // Best leg (lowest darts)
    const bestLeg = validStats.filter(s => s.best_leg !== null).length > 0
      ? validStats.filter(s => s.best_leg !== null).reduce((min, s) => (s.best_leg || 999) < (min.best_leg || 999) ? s : min)
      : null;

    // Highest finish
    const highFinish = validStats.filter(s => s.high_finish !== null).length > 0
      ? validStats.filter(s => s.high_finish !== null).reduce((max, s) => (s.high_finish || 0) > (max.high_finish || 0) ? s : max)
      : null;

    // Most 180s
    const most180s = validStats.filter(s => s.scores_180 > 0).length > 0
      ? validStats.filter(s => s.scores_180 > 0).reduce((max, s) => s.scores_180 > max.scores_180 ? s : max)
      : null;

    return { highestAvg, bestLeg, highFinish, most180s };
  }, [stats]);

  // Sorted stats for table
  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
      const aVal = a[sortKey] ?? (sortDirection === 'desc' ? -Infinity : Infinity);
      const bVal = b[sortKey] ?? (sortDirection === 'desc' ? -Infinity : Infinity);

      // For best_leg, lower is better
      if (sortKey === 'best_leg') {
        return sortDirection === 'desc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      return sortDirection === 'desc'
        ? (bVal as number) - (aVal as number)
        : (aVal as number) - (bVal as number);
    });
  }, [stats, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDirection(key === 'best_leg' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === 'desc'
      ? <ChevronDown className="w-3 h-3 inline ml-0.5" />
      : <ChevronUp className="w-3 h-3 inline ml-0.5" />;
  };

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Brak statystyk dla tego turnieju
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {tournamentName && (
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-darts-gold" />
          <h2 className="text-xl font-bold">Statystyki: {tournamentName}</h2>
        </div>
      )}

      {/* Podium - TOP 3 */}
      {podium.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {/* 2nd place */}
          {podium[1] && (
            <Card className="order-1 sm:order-1 border-gray-400 bg-gradient-to-b from-gray-100 to-white">
              <CardContent className="pt-4 text-center">
                <div className="text-3xl mb-2">🥈</div>
                <div className="font-bold truncate">{podium[1].player_name}</div>
                <div className="text-2xl font-bold text-gray-600">{podium[1].avg_3_darts?.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">średnia</div>
              </CardContent>
            </Card>
          )}

          {/* 1st place */}
          {podium[0] && (
            <Card className="order-0 sm:order-2 border-darts-gold bg-gradient-to-b from-yellow-50 to-white ring-2 ring-darts-gold/50">
              <CardContent className="pt-4 text-center">
                <div className="text-4xl mb-2">🥇</div>
                <div className="font-bold text-lg truncate">{podium[0].player_name}</div>
                <div className="text-3xl font-bold text-darts-gold">{podium[0].avg_3_darts?.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">średnia</div>
              </CardContent>
            </Card>
          )}

          {/* 3rd place */}
          {podium[2] && (
            <Card className="order-2 sm:order-3 border-orange-400 bg-gradient-to-b from-orange-50 to-white">
              <CardContent className="pt-4 text-center">
                <div className="text-3xl mb-2">🥉</div>
                <div className="font-bold truncate">{podium[2].player_name}</div>
                <div className="text-2xl font-bold text-orange-600">{podium[2].avg_3_darts?.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">średnia</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Records */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Highest Average */}
        {records.highestAvg && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <div className="text-xs text-muted-foreground">Najwyższa średnia</div>
              <div className="font-bold text-blue-700">{records.highestAvg.avg_3_darts?.toFixed(2)}</div>
              <div className="text-xs truncate">{records.highestAvg.player_name}</div>
            </CardContent>
          </Card>
        )}

        {/* Best Leg */}
        {records.bestLeg && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <Zap className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <div className="text-xs text-muted-foreground">Best Leg</div>
              <div className="font-bold text-green-700">{records.bestLeg.best_leg} rzutów</div>
              <div className="text-xs truncate">{records.bestLeg.player_name}</div>
            </CardContent>
          </Card>
        )}

        {/* High Finish */}
        {records.highFinish && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 text-center">
              <Award className="w-5 h-5 mx-auto text-purple-600 mb-1" />
              <div className="text-xs text-muted-foreground">High Finish</div>
              <div className="font-bold text-purple-700">{records.highFinish.high_finish}</div>
              <div className="text-xs truncate">{records.highFinish.player_name}</div>
            </CardContent>
          </Card>
        )}

        {/* Most 180s */}
        {records.most180s && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto text-red-600 mb-1" />
              <div className="text-xs text-muted-foreground">180s</div>
              <div className="font-bold text-red-700">{records.most180s.scores_180}</div>
              <div className="text-xs truncate">{records.most180s.player_name}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Stats Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pełne statystyki</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Zawodnik</th>
                <th className="text-center py-2 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('avg_3_darts')}
                  >
                    Śr.
                    <SortIcon columnKey="avg_3_darts" />
                  </Button>
                </th>
                <th className="text-center py-2 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('matches_won')}
                  >
                    W
                    <SortIcon columnKey="matches_won" />
                  </Button>
                </th>
                <th className="text-center py-2 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('scores_180')}
                  >
                    180
                    <SortIcon columnKey="scores_180" />
                  </Button>
                </th>
                <th className="text-center py-2 px-2 hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('high_finish')}
                  >
                    HF
                    <SortIcon columnKey="high_finish" />
                  </Button>
                </th>
                <th className="text-center py-2 px-2 hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold"
                    onClick={() => handleSort('best_leg')}
                  >
                    BL
                    <SortIcon columnKey="best_leg" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat, index) => (
                <tr
                  key={stat.id}
                  className={cn(
                    'border-b last:border-b-0',
                    index < 3 && sortKey === 'avg_3_darts' && 'bg-yellow-50/50'
                  )}
                >
                  <td className="py-2 px-2 text-muted-foreground">{index + 1}</td>
                  <td className="py-2 px-2 font-medium truncate max-w-[150px]">{stat.player_name}</td>
                  <td className="py-2 px-2 text-center font-bold">
                    {stat.avg_3_darts?.toFixed(2) || '-'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {stat.matches_won}/{stat.matches_played}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {stat.scores_180 > 0 ? stat.scores_180 : '-'}
                  </td>
                  <td className="py-2 px-2 text-center hidden sm:table-cell">
                    {stat.high_finish || '-'}
                  </td>
                  <td className="py-2 px-2 text-center hidden sm:table-cell">
                    {stat.best_leg || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
