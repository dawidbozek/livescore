import Link from 'next/link';
import {
  Users, ClipboardList, Backpack, Shirt, Clock, Phone,
  HelpCircle, ExternalLink, CreditCard, Target, Check, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const whatToBring = [
  { item: 'Własne lotki', required: true },
  { item: 'Dokument tożsamości', required: true },
  { item: 'Gotówka na wpisowe', required: true },
  { item: 'Wygodne buty', required: true },
  { item: 'Powerbank', required: false },
  { item: 'Koszulka klubowa (finały)', required: false },
  { item: 'Przekąski / napoje', required: false },
];

const schedule = [
  { day: 'Czwartek', date: '16.07', hours: '09:00 - 23:00' },
  { day: 'Piątek', date: '17.07', hours: '09:00 - 24:00' },
  { day: 'Sobota', date: '18.07', hours: '09:00 - 24:00' },
  { day: 'Niedziela', date: '19.07', hours: '09:00 - 18:00' },
];

const faqs = [
  {
    question: 'Czy potrzebuję licencji?',
    answer: 'Nie, Mistrzostwa Polski są otwarte dla wszystkich. Nie wymagamy żadnych licencji ani członkostwa w federacji.',
  },
  {
    question: 'Czy mogę przyjść jako kibic?',
    answer: 'Tak! Wstęp dla kibiców jest bezpłatny. Zachęcamy do kibicowania i tworzenia atmosfery.',
  },
  {
    question: 'Czy są nagrody rzeczowe?',
    answer: 'Tak, oprócz nagród pieniężnych są puchary, medale i nagrody rzeczowe od sponsorów.',
  },
  {
    question: 'Czy jest transmisja?',
    answer: 'Tak, finały głównych turniejów są transmitowane na żywo na kanale YouTube Darts Polska.',
  },
  {
    question: 'Jak zapłacić wpisowe?',
    answer: 'Wpisowe przyjmujemy wyłącznie gotówką na miejscu, przed rozpoczęciem turnieju.',
  },
  {
    question: 'Co jeśli nie zdążę na check-in?',
    answer: 'Check-in kończy się 15 minut przed startem. Spóźnienie = walkover w pierwszej rundzie.',
  },
];

export default function DlaZawodnikowPage() {
  return (
    <div className="min-w-[320px]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16">
        <div className="container mx-auto container-responsive sm:px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Dla zawodników</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Informacje dla zawodników
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Wszystko co musisz wiedzieć przed przyjazdem na Mistrzostwa Polski.
            Praktyczne wskazówki, harmonogram i odpowiedzi na najczęstsze pytania.
          </p>
        </div>
      </section>

      <div className="container mx-auto container-responsive sm:px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Registration */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Rejestracja na turnieje
                </h2>
                <p className="text-muted-foreground mb-6">
                  Zapisy odbywają się przez system n01darts.com. Wykonaj poniższe kroki,
                  żeby zapisać się na wybrane turnieje:
                </p>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">1</span>
                    <div>
                      <p className="font-medium">Załóż konto na n01darts.com</p>
                      <p className="text-sm text-muted-foreground">
                        Jeśli nie masz jeszcze konta, zarejestruj się bezpłatnie.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">2</span>
                    <div>
                      <p className="font-medium">Znajdź turniej na liście</p>
                      <p className="text-sm text-muted-foreground">
                        Wyszukaj &quot;Mistrzostwa Polski 2026&quot; lub przejrzyj listę turniejów.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">3</span>
                    <div>
                      <p className="font-medium">Kliknij &quot;Join&quot;</p>
                      <p className="text-sm text-muted-foreground">
                        Potwierdź swój udział i gotowe! Wpisowe płacisz na miejscu.
                      </p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href="https://n01darts.com" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Otwórz n01darts.com
                    </Button>
                  </a>
                  <Link href="/turnieje">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Target className="w-4 h-4 mr-2" />
                      Zobacz turnieje
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* What to bring */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Backpack className="w-5 h-5 text-primary" />
                  Co zabrać
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {whatToBring.map((item) => (
                    <div
                      key={item.item}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      {item.required ? (
                        <Check className="w-5 h-5 text-darts-green flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className={item.required ? 'font-medium' : 'text-muted-foreground'}>
                        {item.item}
                      </span>
                      {item.required && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-auto">
                          Obowiązkowe
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dress code */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" />
                  Dress code
                </h2>
                <p className="text-muted-foreground mb-4">
                  Nie ma obowiązkowego dress code&apos;u. Zalecamy wygodny, sportowy strój.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Finały:</strong> Mile widziana koszulka klubowa lub reprezentacyjna.
                    Finaliści występują na scenie z transmisją TV - warto wyglądać profesjonalnie!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Płatności
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Wpisowe: tylko gotówka</p>
                      <p className="text-sm text-muted-foreground">
                        Wpisowe przyjmujemy wyłącznie gotówką. Pamiętaj o wypłacie przed przyjazdem!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-darts-green flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Bar i gastronomia</p>
                      <p className="text-sm text-muted-foreground">
                        W barze i restauracji Cukrowni akceptowane są karty płatnicze.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Najczęstsze pytania
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <p className="font-medium mb-1">{faq.question}</p>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Godziny otwarcia hali
                </h2>
                <div className="space-y-3">
                  {schedule.map((day) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{day.day}</p>
                        <p className="text-xs text-muted-foreground">{day.date}</p>
                      </div>
                      <span className="text-sm font-mono">{day.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-primary text-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Kontakt w razie problemów
                </h2>
                <p className="text-sm opacity-90 mb-4">
                  Masz pytania? Coś nie działa? Skontaktuj się z organizatorem:
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+48693190020"
                    className="flex items-center gap-2 text-white hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    693 19 00 20
                  </a>
                  <a
                    href="mailto:kontakt@dartspolska.pl"
                    className="flex items-center gap-2 text-white hover:underline text-sm"
                  >
                    kontakt@dartspolska.pl
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Przydatne linki</h2>
                <div className="space-y-2">
                  <Link
                    href="/turnieje"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    → Kalendarz turniejów
                  </Link>
                  <Link
                    href="/rezerwacja"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    → Rezerwacja noclegów
                  </Link>
                  <Link
                    href="/jak-dojechac"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    → Jak dojechać
                  </Link>
                  <Link
                    href="/live"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    → Live Score
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
