'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error do serwisu monitoringu (np. Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Coś poszło nie tak</h1>

        <p className="text-muted-foreground mb-6">
          Przepraszamy, wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę
          lub wróć na stronę główną.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="min-h-[44px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Spróbuj ponownie
          </Button>

          <Link href="/">
            <Button variant="outline" className="min-h-[44px] w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Strona główna
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
