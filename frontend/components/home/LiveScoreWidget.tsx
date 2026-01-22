'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, ArrowRight, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Event dates - July 16-19, 2026
const EVENT_START = new Date('2026-07-16T08:00:00');
const EVENT_END = new Date('2026-07-19T23:59:59');

export function LiveScoreWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMatchesCount, setActiveMatchesCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const shouldShow = now >= EVENT_START && now <= EVENT_END;
    setIsVisible(shouldShow);

    // Fetch active matches count when visible
    if (shouldShow) {
      fetchActiveMatchesCount();
      const interval = setInterval(fetchActiveMatchesCount, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, []);

  const fetchActiveMatchesCount = async () => {
    try {
      const response = await fetch('/api/matches?status=active');
      const data = await response.json();
      setActiveMatchesCount(data.matches?.length || 0);
    } catch (error) {
      console.error('Failed to fetch active matches:', error);
    }
  };

  // Don't render if not during event
  if (!isVisible) return null;

  return (
    <section className="py-6 sm:py-8 bg-darts-green text-white">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                <Radio className="w-2.5 h-2.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2">
                LIVE SCORE
                <span className="bg-white/20 text-sm px-2 py-0.5 rounded-full">
                  NA ŻYWO
                </span>
              </h3>
              <p className="text-white/80 text-sm">
                {activeMatchesCount > 0
                  ? `${activeMatchesCount} ${activeMatchesCount === 1 ? 'mecz' : activeMatchesCount < 5 ? 'mecze' : 'meczów'} w trakcie`
                  : 'Sprawdź aktualne wyniki'}
              </p>
            </div>
          </div>

          <Link href="/live">
            <Button
              size="lg"
              className="bg-white text-darts-green hover:bg-white/90 min-h-[48px] font-semibold"
            >
              Zobacz kto teraz gra
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
