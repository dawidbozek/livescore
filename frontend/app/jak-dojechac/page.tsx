import { MapPin, Car, Train, Plane, ParkingCircle, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const distances = [
  { city: 'Poznań', distance: '~80 km', time: '~1h' },
  { city: 'Bydgoszcz', distance: '~40 km', time: '~40 min' },
  { city: 'Toruń', distance: '~70 km', time: '~1h' },
  { city: 'Gdańsk', distance: '~180 km', time: '~2h' },
  { city: 'Warszawa', distance: '~280 km', time: '~3h' },
  { city: 'Wrocław', distance: '~220 km', time: '~2.5h' },
];

const airports = [
  { name: 'Poznań Ławica (POZ)', distance: '~80 km' },
  { name: 'Bydgoszcz (BZG)', distance: '~50 km' },
  { name: 'Gdańsk (GDN)', distance: '~180 km' },
];

export default function JakDojechacPage() {
  return (
    <div className="min-w-[320px]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16">
        <div className="container mx-auto container-responsive sm:px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Lokalizacja</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Jak dojechać
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Cukrownia Żnin - industrialne serce Wielkopolski.
            Świetna lokalizacja z łatwym dojazdem z całej Polski.
          </p>
        </div>
      </section>

      <div className="container mx-auto container-responsive sm:px-4 py-8 sm:py-12">
        {/* Map Section */}
        <section className="mb-12">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {/* Google Maps iframe */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2415.8!2d17.7!3d52.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDUxJzAwLjAiTiAxN8KwNDInMDAuMCJF!5e0!3m2!1spl!2spl!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </Card>
        </section>

        {/* Address and Navigation */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Adres
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="font-medium text-lg">Cukrownia Żnin</p>
                  <p className="text-muted-foreground">ul. Mickiewicza 26</p>
                  <p className="text-muted-foreground">88-400 Żnin</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    GPS: 52.8515, 17.7219
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Cukrownia+Żnin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full sm:w-auto">
                      <Navigation className="w-4 h-4 mr-2" />
                      Google Maps
                    </Button>
                  </a>
                  <a
                    href="https://maps.apple.com/?daddr=Cukrownia+Żnin"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apple Maps
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ParkingCircle className="w-5 h-5 text-primary" />
                  Parking
                </h2>
                <p className="text-muted-foreground mb-4">
                  Duży, bezpłatny parking przy obiekcie. Około 200 miejsc parkingowych
                  bezpośrednio przy Cukrowni.
                </p>
                <div className="bg-darts-green/10 text-darts-green rounded-lg p-4">
                  <p className="font-medium">Parking gratis</p>
                  <p className="text-sm opacity-80">dla wszystkich uczestników turnieju</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* By Car */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Samochodem
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {distances.map((item) => (
                  <div
                    key={item.city}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.city}</p>
                      <p className="text-sm text-muted-foreground">{item.distance}</p>
                    </div>
                    <span className="text-primary font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Wskazówka:</strong> Jedź drogą krajową nr 5 (Poznań - Bydgoszcz),
                  zjazd w Żninie. Cukrownia znajduje się przy głównej drodze, nie można jej przeoczyć.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* By Train */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Train className="w-5 h-5 text-primary" />
                Pociągiem
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Stacja: Żnin</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Linia kolejowa Poznań - Inowrocław przez Żnin.
                    Ze stacji do Cukrowni około 2 km (10 minut taxi).
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Z Poznania:</strong> ~1.5h, przesiadka w Gnieźnie</p>
                    <p><strong>Z Bydgoszczy:</strong> ~1h, przesiadka w Inowrocławiu</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Taxi ze stacji</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Lokalne taxi dostępne pod stacją. Koszt przejazdu do Cukrowni około 15-20 zł.
                  </p>
                  <a
                    href="https://rozklad-pkp.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Sprawdź rozkład PKP
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* By Plane */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Dla gości zagranicznych
              </h2>
              <p className="text-muted-foreground mb-6">
                Najbliższe lotniska międzynarodowe z dobrymi połączeniami z Europy:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {airports.map((airport) => (
                  <div
                    key={airport.name}
                    className="p-4 bg-gray-50 rounded-lg text-center"
                  >
                    <Plane className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-medium text-sm">{airport.name}</p>
                    <p className="text-xs text-muted-foreground">{airport.distance}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Z lotniska w Poznaniu lub Bydgoszczy można
                  wynająć samochód lub zamówić transfer. Skontaktuj się z nami,
                  pomożemy zorganizować transport.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-primary text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Potrzebujesz pomocy z dojazdem?</h2>
              <p className="opacity-90 mb-6">
                Skontaktuj się z nami, pomożemy zorganizować transport lub podpowiemy najlepszą trasę.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+48693190020">
                  <Button variant="secondary" size="lg" className="min-h-[48px]">
                    Zadzwoń: 693 19 00 20
                  </Button>
                </a>
                <a href="mailto:kontakt@dartspolska.pl">
                  <Button variant="outline" size="lg" className="min-h-[48px] border-white text-white hover:bg-white/10">
                    kontakt@dartspolska.pl
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
