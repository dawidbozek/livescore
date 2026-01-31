'use client';

import { AlertTriangle } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="pl">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              Krytyczny błąd aplikacji
            </h1>

            <p className="text-gray-600 mb-6">
              Przepraszamy, wystąpił poważny błąd. Prosimy o odświeżenie strony.
            </p>

            <button
              onClick={reset}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
