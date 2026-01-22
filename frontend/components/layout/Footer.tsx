import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const quickLinks = [
  { href: '/turnieje', label: 'Kalendarz turniejów' },
  { href: '/live', label: 'Live Score' },
  { href: '/rezerwacja', label: 'Rezerwacja noclegów' },
  { href: '/jak-dojechac', label: 'Jak dojechać' },
  { href: '/dla-zawodnikow', label: 'Dla zawodników' },
  { href: '/turniej-reprezentantow', label: 'Turniej Reprezentantów' },
];

const socialLinks = [
  { href: 'https://facebook.com/dartspolska', label: 'Facebook', icon: Facebook },
  { href: 'https://instagram.com/dartspolska', label: 'Instagram', icon: Instagram },
  { href: 'https://youtube.com/@dartspolska', label: 'YouTube', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto container-responsive sm:px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/images/logo-darts-polska.png"
                alt="Darts Polska"
                width={48}
                height={48}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              10. Mistrzostwa Polski w Darcie - największy turniej darta w Polsce.
              16-19 lipca 2026, Cukrownia Żnin.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Nawigacja</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Telefon</p>
                  <a href="tel:+48693190020" className="text-white hover:text-primary transition-colors">
                    693 19 00 20
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href="mailto:kontakt@dartspolska.pl" className="text-white hover:text-primary transition-colors">
                    kontakt@dartspolska.pl
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Miejsce wydarzenia</p>
                  <p className="text-white">Cukrownia Żnin</p>
                  <p className="text-sm text-gray-400">88-400 Żnin</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Event Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Wydarzenie</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary mb-1">16-19.07.2026</p>
              <p className="text-sm text-gray-400 mb-3">Cukrownia Żnin</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">Zawodnicy:</span> <span className="text-white">400+</span></p>
                <p><span className="text-gray-400">Turnieje:</span> <span className="text-white">20+</span></p>
                <p><span className="text-gray-400">Stanowiska:</span> <span className="text-white">50</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto container-responsive sm:px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Stowarzyszenie Darts Polska. Wszelkie prawa zastrzeżone.</p>
            <p>10. Mistrzostwa Polski w Darcie</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
