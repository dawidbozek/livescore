'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Target, Calendar, Hotel, MapPin, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/turnieje', label: 'Turnieje', icon: Calendar },
  { href: '/live', label: 'Live Score', icon: Target },
  { href: '/rezerwacja', label: 'Noclegi', icon: Hotel },
  { href: '/jak-dojechac', label: 'Dojazd', icon: MapPin },
  { href: '/dla-zawodnikow', label: 'Dla zawodników', icon: Users },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto container-responsive sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Image
              src="/images/logo-darts-polska.png"
              alt="Darts Polska"
              width={40}
              height={40}
              className="h-8 w-auto sm:h-10"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-primary text-sm leading-tight block">
                MISTRZOSTWA POLSKI
              </span>
              <span className="text-xs text-muted-foreground leading-tight block">
                16-19 lipca 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/rezerwacja">
              <Button className="ml-2 bg-primary hover:bg-primary/90">
                Zarezerwuj nocleg
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="container mx-auto container-responsive sm:px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px]',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t mt-3">
              <Link href="/rezerwacja" onClick={closeMenu}>
                <Button className="w-full bg-primary hover:bg-primary/90 min-h-[48px]">
                  <Hotel className="w-5 h-5 mr-2" />
                  Zarezerwuj nocleg
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
