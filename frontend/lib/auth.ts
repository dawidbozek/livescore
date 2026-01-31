import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'admin_session';

/**
 * Sprawdza czy request ma ważną sesję admina
 * Używać w API routes przed operacjami wymagającymi autoryzacji
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return false;
    }

    // Token musi mieć prawidłowy format (UUID-timestamp)
    const tokenParts = sessionCookie.value.split('-');
    if (tokenParts.length < 2) {
      return false;
    }

    // W przyszłości: walidacja tokenu w bazie/Redis
    // Na razie: sprawdzamy tylko czy cookie istnieje i ma prawidłowy format
    return true;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return false;
  }
}

/**
 * Zwraca response 401 Unauthorized
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized - admin login required' },
    { status: 401 }
  );
}
