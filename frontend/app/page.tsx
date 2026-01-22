import {
  Hero,
  LiveScoreWidget,
  Countdown,
  Highlights,
  CalendarPreview,
  ReservationCTA,
  FAQ,
} from '@/components/home';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Live Score Widget - visible only during event (16-19.07.2026) */}
      <LiveScoreWidget />

      {/* Countdown to event */}
      <Countdown />

      {/* Highlights / Stats */}
      <Highlights />

      {/* Calendar Preview */}
      <CalendarPreview />

      {/* Reservation CTA */}
      <ReservationCTA />

      {/* FAQ */}
      <FAQ />
    </>
  );
}
