import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

// Pobierz grupy (publiczne)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournament_id');
    const date = searchParams.get('date');
    const activeOnly = searchParams.get('active_only') === 'true';

    const supabase = createPublicClient();

    // Buduj query dla grup
    let groupsQuery = supabase
      .from('groups')
      .select(`
        *,
        tournament:tournaments(
          id,
          name,
          tournament_date,
          is_active,
          dart_type,
          tournament_format
        )
      `)
      .order('group_number', { ascending: true });

    // Filtruj po turnieju
    if (tournamentId) {
      groupsQuery = groupsQuery.eq('tournament_id', tournamentId);
    }

    // Filtruj po dacie
    if (date) {
      groupsQuery = groupsQuery.eq('tournament.tournament_date', date);
    }

    // Filtruj tylko aktywne turnieje
    if (activeOnly) {
      groupsQuery = groupsQuery.eq('tournament.is_active', true);
    }

    const { data: groups, error: groupsError } = await groupsQuery;

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      );
    }

    // Filtruj null tournaments (gdy active_only jest true ale turniej nieaktywny)
    const filteredGroups = (groups || []).filter(g => g.tournament !== null);

    // Pobierz mecze grupowe dla wszystkich grup
    if (filteredGroups.length > 0) {
      const groupIds = filteredGroups.map(g => g.id);

      const { data: matches, error: matchesError } = await supabase
        .from('group_matches')
        .select('*')
        .in('group_id', groupIds)
        .order('match_order', { ascending: true });

      if (matchesError) {
        console.error('Error fetching group matches:', matchesError);
        // Zwróć grupy bez meczów zamiast błędu
      } else {
        // Przypisz mecze do grup
        filteredGroups.forEach(group => {
          (group as Record<string, unknown>).matches = (matches || []).filter(m => m.group_id === group.id);
        });
      }
    }

    return NextResponse.json({
      groups: filteredGroups,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in groups GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
