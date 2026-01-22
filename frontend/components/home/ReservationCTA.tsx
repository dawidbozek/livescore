import Link from 'next/link';
import { Hotel, MapPin, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'Kilka kroków od sali gier',
  'Własna plaża i molo',
  'Integracja z innymi zawodnikami',
  'Warzone na miejscu',
];

export function ReservationCTA() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary rounded-full px-3 py-1 mb-4">
                  <Hotel className="w-4 h-4" />
                  <span className="text-sm font-medium">Noclegi</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Nocuj w sercu wydarzenia
                </h2>

                <p className="text-gray-300 mb-6 text-base sm:text-lg">
                  Cukrownia Żnin to nie tylko miejsce turnieju - to industrialny kompleks z pokojami, plażą i wyjątkową atmosferą. Zarezerwuj nocleg i bądź częścią wydarzenia 24/7.
                </p>

                <ul className="space-y-2 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/rezerwacja">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 min-h-[48px]">
                      Zarezerwuj nocleg
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/jak-dojechac">
                    <Button
                      size="lg"
                      variant="outline"
                      className="min-h-[48px] border-white/30 text-white hover:bg-white/10"
                    >
                      <MapPin className="w-5 h-5 mr-2" />
                      Jak dojechać
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Price info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold text-lg mb-4">Cennik noclegów</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Pokój 1-osobowy</span>
                    <span className="font-bold">390 zł/noc</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Pokój 2-osobowy</span>
                    <span className="font-bold">520 zł/noc</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Dostawka</span>
                    <span className="font-bold">200 zł/noc</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Dziecko 5-12 lat</span>
                    <span className="font-bold">100 zł/noc</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Dziecko 0-4 lat</span>
                    <span className="font-bold text-primary">GRATIS</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Ceny obejmują śniadanie. Liczba miejsc ograniczona.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
