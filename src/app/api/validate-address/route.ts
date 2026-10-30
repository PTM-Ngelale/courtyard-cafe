import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

type RequestBody =
  | { type: 'streets' }
  | { type: 'houses'; street_id: number }
  | { type: 'verify'; street_id: number; house_number: string };

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = (await req.json().catch(() => null)) as RequestBody | null;

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    // Get all streets
    if (body.type === 'streets' || !('type' in body)) {
      const { data, error } = await supabase
        .from('estate_streets')
        .select('id, street_name')
        .order('street_name', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch streets' }, { status: 500 });
      }

      return NextResponse.json({ streets: data || [] });
    }

    // Get available houses for a street
    if (body.type === 'houses') {
      const { street_id } = body;

      if (!street_id || typeof street_id !== 'number') {
        return NextResponse.json({ error: 'street_id is required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('reef_court_addresses')
        .select('house_number')
        .eq('street_id', street_id);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
      }

      // House numbers are text, so sort them as numbers here ("2" before "10").
      const houses = (data || []).sort((a, b) =>
        a.house_number.localeCompare(b.house_number, 'en', { numeric: true })
      );
      return NextResponse.json({ houses });
    }

    // Verify specific address (street_id + house_number)
    if (body.type === 'verify') {
      const { street_id, house_number } = body;

      if (!street_id || !house_number) {
        return NextResponse.json(
          { error: 'street_id and house_number required' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('reef_court_addresses')
        .select('id')
        .eq('street_id', street_id)
        .eq('house_number', house_number.trim())
        .single();

      if (error && error.code === 'PGRST116') {
        return NextResponse.json({
          valid: false,
          message: 'This house number is not registered on this street',
        });
      }

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      return NextResponse.json({ valid: true, message: 'Address validated' });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (err) {
    console.error('Validation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
