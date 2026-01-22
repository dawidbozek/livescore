import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('tournaments')
      .select('*')
      .eq('is_active', true)
      .order('tournament_date', { ascending: false });

    // Jeśli activeOnly=true, nie filtruj po dacie - pobierz wszystkie aktywne turnieje
    // Jeśli jest data, filtruj po niej
    if (date && !activeOnly) {
      query = query.eq('tournament_date', date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tournaments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tournaments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tournaments: data || [] });
  } catch (error) {
    console.error('Error in tournaments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
