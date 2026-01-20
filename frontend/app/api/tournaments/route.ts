import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    let query = supabase
      .from('tournaments')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (date) {
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
