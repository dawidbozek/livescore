'use client';

import { useCountdown } from '@/hooks/useCountdown';

// Event start date - July 16, 2026 at 8:00 AM
const EVENT_DATE = new Date('2026-07-16T08:00:00');

interface TimeBlockProps {
  value: number;
  label: string;
}

function TimeBlock({ value, label }: TimeBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 text-white rounded-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center shadow-lg">
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(EVENT_DATE);

  if (isExpired) {
    return (
      <section className="py-12 sm:py-16 bg-primary text-white">
        <div className="container mx-auto container-responsive sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            TURNIEJ TRWA!
          </h2>
          <p className="text-lg opacity-90">
            Śledź wyniki na żywo w sekcji Live Score
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Do rozpoczęcia zostało
          </h2>
          <p className="text-muted-foreground">16 lipca 2026, godzina 8:00</p>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
          <TimeBlock value={days} label="dni" />
          <div className="text-2xl sm:text-3xl font-bold text-gray-400 self-start mt-5 sm:mt-6 md:mt-7">:</div>
          <TimeBlock value={hours} label="godzin" />
          <div className="text-2xl sm:text-3xl font-bold text-gray-400 self-start mt-5 sm:mt-6 md:mt-7">:</div>
          <TimeBlock value={minutes} label="minut" />
          <div className="text-2xl sm:text-3xl font-bold text-gray-400 self-start mt-5 sm:mt-6 md:mt-7 hidden sm:block">:</div>
          <div className="hidden sm:block">
            <TimeBlock value={seconds} label="sekund" />
          </div>
        </div>
      </div>
    </section>
  );
}
