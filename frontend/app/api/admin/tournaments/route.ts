import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Pobierz wszystkie turnieje (także nieaktywne)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    const supabase = createServiceClient();

    let query = supabase
      .from('tournaments')
      .select('*')
      .order('tournament_date', { ascending: false })
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
    console.error('Error in admin tournaments GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Dodaj nowy turniej
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      n01_url,
      tournament_date,
      is_active,
      dart_type,
      category,
      start_time,
      entry_fee,
      prizes,
      format,
      image_url,
    } = body;

    if (!name || !n01_url || !tournament_date) {
      return NextResponse.json(
        { error: 'Name, URL, and date are required' },
        { status: 400 }
      );
    }

    // Walidacja URL
    try {
      const url = new URL(n01_url);
      if (!url.hostname.includes('n01darts.com')) {
        return NextResponse.json(
          { error: 'URL must be from n01darts.com' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        n01_url,
        tournament_date,
        is_active: is_active ?? true,
        dart_type: dart_type || 'steel',
        category: category || null,
        start_time: start_time || null,
        entry_fee: entry_fee || null,
        prizes: prizes || null,
        format: format || null,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament:', error);
      return NextResponse.json(
        { error: 'Failed to create tournament' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tournament: data }, { status: 201 });
  } catch (error) {
    console.error('Error in admin tournaments POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Aktualizuj turniej
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      n01_url,
      tournament_date,
      is_active,
      dart_type,
      category,
      start_time,
      entry_fee,
      prizes,
      format,
      image_url,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (n01_url !== undefined) {
      // Walidacja URL
      try {
        const url = new URL(n01_url);
        if (!url.hostname.includes('n01darts.com')) {
          return NextResponse.json(
            { error: 'URL must be from n01darts.com' },
            { status: 400 }
          );
        }
        updates.n01_url = n01_url;
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }
    if (tournament_date !== undefined) updates.tournament_date = tournament_date;
    if (is_active !== undefined) updates.is_active = is_active;
    if (dart_type !== undefined) updates.dart_type = dart_type;
    if (category !== undefined) updates.category = category || null;
    if (start_time !== undefined) updates.start_time = start_time || null;
    if (entry_fee !== undefined) updates.entry_fee = entry_fee || null;
    if (prizes !== undefined) updates.prizes = prizes || null;
    if (format !== undefined) updates.format = format || null;
    if (image_url !== undefined) updates.image_url = image_url || null;

    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tournament:', error);
      return NextResponse.json(
        { error: 'Failed to update tournament' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tournament: data });
  } catch (error) {
    console.error('Error in admin tournaments PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Usuń turniej
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from('tournaments').delete().eq('id', id);

    if (error) {
      console.error('Error deleting tournament:', error);
      return NextResponse.json(
        { error: 'Failed to delete tournament' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin tournaments DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
