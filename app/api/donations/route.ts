import { NextRequest, NextResponse } from 'next/server';
import { parseDonation } from '@/lib/nlp-parser';
import { supabaseAdmin } from '@/lib/supabase';
import { Locale } from '@/lib/i18n';

export async function POST(req: NextRequest) {
  try {
    const { text, locale = 'en' } = await req.json();
    const items = await parseDonation(text, locale as Locale);
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { items, rawInput } = await req.json();

    const records = items.map((item: any) => ({
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || 'item',
      attributes: item.attributes || {},
      raw_input: rawInput,
    }));

    const { data, error } = await supabaseAdmin
      .from('donations')
      .insert(records)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, saved: data });
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('donations')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ donations: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
