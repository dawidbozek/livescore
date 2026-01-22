import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const tournamentId = searchParams.get('tournament_id');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('matches')
      .select(`
        *,
        tournament:tournaments!inner(
          id,
          name,
          tournament_date,
          is_active,
          dart_type,
          category,
          start_time,
          entry_fee,
          prizes,
          format,
          image_url
        )
      `)
      .eq('tournament.is_active', true)
      .order('station_number', { ascending: true, nullsFirst: false });

    // Jeśli activeOnly=true, nie filtruj po dacie - pobierz wszystkie aktywne turnieje
    // Jeśli jest data, filtruj po niej
    if (date && !activeOnly) {
      query = query.eq('tournament.tournament_date', date);
    }

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      matches: data || [],
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
