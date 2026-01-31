import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';

// Konfiguracja sesji
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 godziny
const BCRYPT_ROUNDS = 12;

function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
}

/**
 * POST - Logowanie admina
 */
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

    // 1. Sprawdź zmienną środowiskową (plain text - dla dev/fallback)
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword && password === envPassword) {
      isAuthenticated = true;
    }

    // 2. Jeśli nie ma w env, sprawdź hash w bazie
    if (!isAuthenticated) {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'admin_password_hash')
          .single();

        if (!error && data?.value) {
          // Porównaj z hashem bcrypt
          isAuthenticated = await bcrypt.compare(password, data.value);
        }

        // Fallback: sprawdź stare plaintext hasło (do migracji)
        if (!isAuthenticated) {
          const { data: legacyData } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'admin_password')
            .single();

          if (legacyData?.value === password) {
            isAuthenticated = true;
            // Auto-migracja: zapisz hash i usuń plaintext
            const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
            await supabase.from('admin_settings').upsert({
              key: 'admin_password_hash',
              value: hash,
            });
            await supabase.from('admin_settings').delete().eq('key', 'admin_password');
          }
        }
      } catch (dbError) {
        console.error('Database error during auth:', dbError);
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

/**
 * PUT - Zmiana hasła admina (wymaga aktualnej sesji)
 */
export async function PUT(request: NextRequest) {
  // Weryfikuj sesję
  if (!(await verifyAdminSession())) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Both current and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Zweryfikuj aktualne hasło
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single();

    let isCurrentPasswordValid = false;

    if (data?.value) {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, data.value);
    }

    // Sprawdź też env password
    const envPassword = process.env.ADMIN_PASSWORD;
    if (!isCurrentPasswordValid && envPassword && currentPassword === envPassword) {
      isCurrentPasswordValid = true;
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Zapisz nowy hash
    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const { error } = await supabase.from('admin_settings').upsert({
      key: 'admin_password_hash',
      value: newHash,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
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
