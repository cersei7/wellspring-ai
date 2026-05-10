import { NextRequest, NextResponse } from 'next/server';
import { recommendDistribution } from '@/lib/priority-engine';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { donationId, locale = 'en' } = await req.json();
    if (!donationId) {
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    const { data: beneficiaries, error: benError } = await supabase
      .from('beneficiaries')
      .select('*');
    if (benError) throw benError;

    const { data: relations, error: relError } = await supabase
      .from('family_relationships')
      .select('*');
    if (relError) throw relError;

    const { data: donation, error: donError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();
    if (donError) throw donError;

    if (!beneficiaries || beneficiaries.length === 0) {
      return NextResponse.json({ error: 'No beneficiaries found' }, { status: 400 });
    }

    const totalDemand = beneficiaries.length;
    const result = await recommendDistribution(
      beneficiaries,
      relations ?? [],
      donation,
      donation.quantity,
      totalDemand,
      locale
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Distribute error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('id, name, quantity, unit, category')
      .order('received_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ donations: data ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
