import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: {
    default: 'Mistrzostwa Polski w Darcie 2026 | 16-19 lipca | Cukrownia Żnin',
    template: '%s | MP Darts 2026',
  },
  description:
    '10. Mistrzostwa Polski w Darcie - największy turniej darta w Polsce. 400+ zawodników, 20+ turniejów, 4 dni emocji. 16-19 lipca 2026, Cukrownia Żnin.',
  keywords: [
    'mistrzostwa polski',
    'dart',
    'darts',
    'turniej',
    'Żnin',
    'Cukrownia',
    '2026',
    'live score',
    'wyniki na żywo',
  ],
  authors: [{ name: 'Stowarzyszenie Darts Polska' }],
  openGraph: {
    title: 'Mistrzostwa Polski w Darcie 2026',
    description: '10. Mistrzostwa Polski w Darcie - największy turniej darta w Polsce. 16-19 lipca 2026, Cukrownia Żnin.',
    type: 'website',
    locale: 'pl_PL',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
