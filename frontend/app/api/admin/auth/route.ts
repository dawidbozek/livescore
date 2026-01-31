import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase';

// Stały token sesji (w produkcji użyć JWT lub innego bezpiecznego mechanizmu)
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 godziny

function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    let isAuthenticated = false;

    // Sprawdź zmienną środowiskową
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword && password === envPassword) {
      isAuthenticated = true;
    }

    // Jeśli nie ma w env lub nie pasuje, sprawdź w bazie
    if (!isAuthenticated) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'admin_password')
          .single();

        if (!error && data?.value === password) {
          isAuthenticated = true;
        }
      } catch (dbError) {
        console.error('Database error during auth:', dbError);
        // Nie używamy fallback - jeśli baza nie działa, logowanie niemożliwe
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Ustaw HTTP-only cookie z tokenem sesji
    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin auth:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint do sprawdzania czy użytkownik jest zalogowany
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // W przyszłości: walidacja tokenu w bazie/Redis
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

// Endpoint do wylogowania
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
