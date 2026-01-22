'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Hotel, Check, Send, Phone, Mail, MapPin, Waves, Utensils, Wifi, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const pricing = [
  { type: 'Pokój 1-osobowy', price: '390 zł', per: '/noc' },
  { type: 'Pokój 2-osobowy', price: '520 zł', per: '/noc' },
  { type: 'Dostawka dla dorosłego', price: '200 zł', per: '/noc' },
  { type: 'Dziecko 5-12 lat', price: '100 zł', per: '/noc' },
  { type: 'Dziecko 0-4 lat', price: 'GRATIS', per: '', highlight: true },
];

const amenities = [
  { icon: Utensils, label: 'Śniadanie w cenie' },
  { icon: Waves, label: 'Plaża i molo' },
  { icon: Wifi, label: 'WiFi' },
  { icon: Car, label: 'Parking' },
];

const benefits = [
  'Kilka kroków od sali gier',
  'Niezależność od transportu',
  'Integracja z innymi zawodnikami',
  'Warzone na miejscu',
  'Aquapark z 28m zjeżdżalnią',
  'Klimat industrialny Cukrowni',
];

export default function RezerwacjaPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    arrivalDate: '2026-07-16',
    departureDate: '2026-07-19',
    adults: '2',
    children: '0',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    // In production, this would send to Airtable API
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-w-[320px]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        </div>
        <div className="container mx-auto container-responsive sm:px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary rounded-full px-4 py-2 mb-4">
            <Hotel className="w-4 h-4" />
            <span className="text-sm font-medium">Noclegi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Nocuj w sercu wydarzenia
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Cukrownia Żnin to nie tylko miejsce turnieju - to industrialny kompleks
            z pokojami, plażą i wyjątkową atmosferą.
          </p>
        </div>
      </section>

      <div className="container mx-auto container-responsive sm:px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div>
            <Card>
              <CardContent className="p-6 sm:p-8">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-darts-green/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-darts-green" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Dziękujemy!</h3>
                    <p className="text-muted-foreground mb-4">
                      Twoje zgłoszenie zostało wysłane. Skontaktujemy się z Tobą
                      w ciągu 24 godzin, żeby potwierdzić rezerwację.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Wyślij kolejne zgłoszenie
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-6">Formularz rezerwacji</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Imię i nazwisko *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Jan Kowalski"
                        />
                      </div>

                      {/* Email & Phone */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="jan@example.com"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-1">
                            Telefon *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="693 190 020"
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="arrivalDate" className="block text-sm font-medium mb-1">
                            Data przyjazdu *
                          </label>
                          <input
                            type="date"
                            id="arrivalDate"
                            name="arrivalDate"
                            required
                            value={formData.arrivalDate}
                            onChange={handleChange}
                            min="2026-07-15"
                            max="2026-07-19"
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label htmlFor="departureDate" className="block text-sm font-medium mb-1">
                            Data wyjazdu *
                          </label>
                          <input
                            type="date"
                            id="departureDate"
                            name="departureDate"
                            required
                            value={formData.departureDate}
                            onChange={handleChange}
                            min="2026-07-16"
                            max="2026-07-20"
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="adults" className="block text-sm font-medium mb-1">
                            Liczba dorosłych *
                          </label>
                          <select
                            id="adults"
                            name="adults"
                            required
                            value={formData.adults}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="children" className="block text-sm font-medium mb-1">
                            Liczba dzieci
                          </label>
                          <select
                            id="children"
                            name="children"
                            value={formData.children}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {[0, 1, 2, 3, 4].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-1">
                          Uwagi dodatkowe
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Np. preferencje dotyczące pokoju, szczególne potrzeby..."
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 min-h-[48px] text-base"
                      >
                        {isSubmitting ? (
                          'Wysyłanie...'
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Wyślij zgłoszenie
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Po wysłaniu zgłoszenia skontaktujemy się z Tobą w ciągu 24h.
                        Rezerwacja wymaga wpłaty zaliczki.
                      </p>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Masz pytania?</h3>
                <div className="space-y-3">
                  <a href="tel:+48693190020" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                    693 19 00 20
                  </a>
                  <a href="mailto:kontakt@dartspolska.pl" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                    kontakt@dartspolska.pl
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6">Cennik noclegów</h2>
                <div className="space-y-3">
                  {pricing.map((item) => (
                    <div
                      key={item.type}
                      className={cn(
                        'flex items-center justify-between py-3 border-b last:border-0',
                        item.highlight && 'text-darts-green'
                      )}
                    >
                      <span className={cn(!item.highlight && 'text-muted-foreground')}>
                        {item.type}
                      </span>
                      <span className="font-bold">
                        {item.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          {item.per}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Amenities */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium mb-3">W cenie:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="w-4 h-4 text-primary" />
                          {amenity.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-6">Dlaczego Cukrownia?</h2>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-darts-green flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-4">Lokalizacja</h2>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Cukrownia Żnin</p>
                    <p className="text-sm text-muted-foreground">88-400 Żnin</p>
                  </div>
                </div>
                <a
                  href="/jak-dojechac"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Zobacz jak dojechać →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto container-responsive sm:px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Często zadawane pytania</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-medium mb-2">Czy mogę przyjechać z rodziną?</h3>
                <p className="text-sm text-muted-foreground">
                  Oczywiście! Cukrownia to świetne miejsce na rodzinny wyjazd.
                  Na miejscu jest plaża, aquapark z 28m zjeżdżalnią, i wiele atrakcji dla dzieci.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-medium mb-2">Czy są inne noclegi w okolicy?</h3>
                <p className="text-sm text-muted-foreground">
                  Tak, w Żninie i okolicy są inne hotele i pensjonaty.
                  Jednak nocleg w Cukrowni gwarantuje bycie w centrum wydarzeń.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-medium mb-2">Jak dokonać płatności?</h3>
                <p className="text-sm text-muted-foreground">
                  Po potwierdzeniu rezerwacji wyślemy dane do przelewu.
                  Wymagana jest zaliczka w wysokości 30% wartości rezerwacji.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
