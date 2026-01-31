import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tournament_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('avg_3_darts', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching tournament stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tournament stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stats: data || [] });
  } catch (error) {
    console.error('Error in tournament stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
