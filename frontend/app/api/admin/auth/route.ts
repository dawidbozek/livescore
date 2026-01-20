import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Najpierw sprawdź zmienną środowiskową
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword && password === envPassword) {
      return NextResponse.json({ success: true });
    }

    // Jeśli nie ma w env, sprawdź w bazie
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();

      if (error) {
        console.error('Error fetching admin password:', error);
        // Jeśli nie ma w bazie, użyj domyślnego
        if (password === 'DartsMP2026!') {
          return NextResponse.json({ success: true });
        }
        return NextResponse.json(
          { success: false, message: 'Invalid password' },
          { status: 401 }
        );
      }

      if (data?.value === password) {
        return NextResponse.json({ success: true });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fallback do domyślnego hasła
      if (password === 'DartsMP2026!') {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in admin auth:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
