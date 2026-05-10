import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .order('category', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (error: any) {
    console.error('Inventory error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
