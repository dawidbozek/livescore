'use client';

import { useState } from 'react';
import { Trophy, Users, Award, Play, FileText, Send, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const hallOfFame = [
  { year: 2024, winner: 'Krzysztof Janas', club: 'Dart Club Wrocław', average: 74.74 },
  { year: 2023, winner: 'Marcin Kciuk', club: 'Darts Poznań', average: 72.31 },
  { year: 2022, winner: 'Tomasz Kowalski', club: 'Steel Warriors', average: 71.89 },
  { year: 2021, winner: 'Piotr Nowak', club: 'Dart Masters', average: 70.45 },
  { year: 2019, winner: 'Adam Wiśniewski', club: 'Darts Kraków', average: 69.82 },
];

const stats = [
  { value: '12 800 zł', label: 'Pula nagród' },
  { value: '128', label: 'Zawodników' },
  { value: '36+', label: 'Organizacji' },
  { value: '5', label: 'Edycja' },
];

export default function TurniejReprezentantowPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-w-[320px]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container mx-auto container-responsive sm:px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary rounded-full px-4 py-2 mb-6">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Turniej specjalny</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            TURNIEJ
            <br />
            <span className="text-primary">REPREZENTANTÓW</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-2">2026</p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Unikalna formuła - każda organizacja wystawia swoich najlepszych zawodników.
            Walka o prestiż i tytuł najlepszej organizacji dartowej w Polsce.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto container-responsive sm:px-4 py-12 sm:py-16">
        {/* About Section */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">O turnieju</h2>
            <p className="text-muted-foreground text-lg">
              Turniej Reprezentantów to wyjątkowa formuła, gdzie nie liczy się tylko indywidualny
              wynik, ale prestiż całej organizacji. Każda liga, klub czy stowarzyszenie wystawia
              swoich najlepszych zawodników do rywalizacji o tytuł najlepszej organizacji dartowej.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Drużynowy charakter</h3>
                <p className="text-sm text-muted-foreground">
                  Każda organizacja deleguje 2-4 zawodników. Punkty zdobywane przez zawodników
                  sumują się na konto organizacji.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Prestiż i uznanie</h3>
                <p className="text-sm text-muted-foreground">
                  Zwycięzca indywidualny i najlepsza organizacja otrzymują puchary i tytuły
                  do końca roku. Prezentacje organizacji na scenie głównej.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Tylko zaproszeni</h3>
                <p className="text-sm text-muted-foreground">
                  Udział w turnieju jest na zaproszenie. Organizacje zgłaszają chęć udziału,
                  a organizator potwierdza uczestnictwo.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Hall of Fame</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {hallOfFame.map((winner, index) => (
              <Card key={winner.year} className={index === 0 ? 'ring-2 ring-primary' : ''}>
                <CardContent className="p-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Trophy className={`w-8 h-8 ${index === 0 ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{winner.year}</p>
                  <p className="font-bold">{winner.winner}</p>
                  <p className="text-xs text-muted-foreground mb-2">{winner.club}</p>
                  <div className="bg-gray-100 rounded-full px-3 py-1 inline-block">
                    <span className="text-xs font-medium">Avg: {winner.average}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Video Section */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Zobacz jak to wygląda</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-70">Finał Turnieju Reprezentantów 2024</p>
                  <p className="text-xs opacity-50 mt-1">(video placeholder)</p>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-70">Prezentacje organizacji 2024</p>
                  <p className="text-xs opacity-50 mt-1">(video placeholder)</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Application Form */}
        <section className="mb-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 sm:p-8">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-darts-green/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-darts-green" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dziękujemy za zgłoszenie!</h3>
                  <p className="text-muted-foreground mb-4">
                    Skontaktujemy się z Waszą organizacją, żeby omówić szczegóły udziału
                    w Turnieju Reprezentantów 2026.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Zgłoś kolejną organizację
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-bold mb-2">Zostań ambasadorem darta</h2>
                    <p className="text-muted-foreground">
                      Zgłoś swoją organizację do udziału w Turnieju Reprezentantów 2026
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="organizationName" className="block text-sm font-medium mb-1">
                        Nazwa organizacji *
                      </label>
                      <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        required
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="np. Darts Club Warszawa"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contactName" className="block text-sm font-medium mb-1">
                          Osoba kontaktowa *
                        </label>
                        <input
                          type="text"
                          id="contactName"
                          name="contactName"
                          required
                          value={formData.contactName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Imię i nazwisko"
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
                        placeholder="kontakt@organizacja.pl"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Kilka słów o organizacji
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Ile macie członków? Od kiedy działacie? Jakie są Wasze osiągnięcia?"
                      />
                    </div>

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
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Download Section */}
        <section className="text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">Zaproszenie do Turnieju Reprezentantów</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pobierz oficjalne zaproszenie z pełnymi informacjami o turnieju
              </p>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Pobierz PDF
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
