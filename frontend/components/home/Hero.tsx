'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background - gradient placeholder (video can be added later) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30" />

      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto container-responsive sm:px-4 text-center text-white py-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">10. edycja</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
          MISTRZOSTWA
          <br />
          <span className="text-primary">POLSKI</span>
          <br />
          W DARCIE
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-2">
          16-19 lipca 2026
        </p>
        <p className="text-base sm:text-lg text-gray-400 mb-8">
          Cukrownia Żnin
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/rezerwacja">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 min-h-[56px]">
              <Hotel className="w-5 h-5 mr-2" />
              Zarezerwuj nocleg
            </Button>
          </Link>
          <Link href="/turnieje">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 min-h-[56px] border-white/30 text-white hover:bg-white/10"
            >
              <Play className="w-5 h-5 mr-2" />
              Zobacz turnieje
            </Button>
          </Link>
        </div>

        {/* Stats preview */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-primary">400+</p>
            <p className="text-sm text-gray-400">zawodników</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-primary">4</p>
            <p className="text-sm text-gray-400">dni</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-primary">20+</p>
            <p className="text-sm text-gray-400">turniejów</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold text-primary">50</p>
            <p className="text-sm text-gray-400">stanowisk</p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
