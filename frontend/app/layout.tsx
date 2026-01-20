import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Darts Live Score - Mistrzostwa Polski',
  description: 'System wyników na żywo dla Mistrzostw Polski w Darcie',
  keywords: ['darts', 'live score', 'mistrzostwa polski', 'dart'],
  authors: [{ name: 'Darts MP' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
