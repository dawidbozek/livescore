import Link from 'next/link';
import { Calendar, ArrowRight, Target, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';

const days = [
  {
    day: 'Czwartek',
    date: '16.07',
    tournaments: [
      { name: 'Warmup Open', time: '09:00', type: 'steel' },
      { name: 'Soft Open', time: '14:00', type: 'soft' },
    ],
  },
  {
    day: 'Piątek',
    date: '17.07',
    tournaments: [
      { name: 'MP Steel Indywidualny', time: '09:00', type: 'steel' },
      { name: 'MP Soft Indywidualny', time: '09:00', type: 'soft' },
    ],
  },
  {
    day: 'Sobota',
    date: '18.07',
    tournaments: [
      { name: 'MP Deble', time: '09:00', type: 'steel' },
      { name: 'Turniej Reprezentantów', time: '14:00', type: 'steel' },
    ],
  },
  {
    day: 'Niedziela',
    date: '19.07',
    tournaments: [
      { name: 'MP Triple Mieszane', time: '09:00', type: 'steel' },
      { name: 'Finały', time: '14:00', type: 'steel' },
    ],
  },
];

export function CalendarPreview() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Harmonogram turniejów
            </h2>
            <p className="text-muted-foreground">
              4 dni wypełnione turniejami steel i soft
            </p>
          </div>
          <Link href="/turnieje" className="hidden sm:block">
            <Button variant="outline">
              Pełny harmonogram
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {days.map((day) => (
            <div
              key={day.day}
              className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-bold text-gray-900">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
              </div>

              <div className="space-y-3">
                {day.tournaments.map((tournament) => (
                  <div
                    key={tournament.name}
                    className="flex items-start gap-2 text-sm"
                  >
                    {tournament.type === 'soft' ? (
                      <Disc className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Target className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 leading-tight">
                        {tournament.name}
                      </p>
                      <p className="text-muted-foreground">{tournament.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/turnieje">
            <Button variant="outline" className="w-full">
              Zobacz pełny harmonogram
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
