import { NextRequest, NextResponse } from 'next/server';
import { recommendDistribution } from '@/lib/priority-engine';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { donationId, locale = 'en' } = await req.json();
    if (!donationId) {
      return NextResponse.json({ error: 'Missing donationId' }, { status: 400 });
    }

    const { data: donation, error: donError } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .maybeSingle();

    if (donError) {
      console.error('Donation query error:', donError);
      return NextResponse.json({ error: donError.message }, { status: 500 });
    }
    if (!donation) {
      return NextResponse.json({ error: `Donation not found for id ${donationId}` }, { status: 404 });
    }

    const { data: beneficiaries, error: benError } = await supabaseAdmin
      .from('beneficiaries')
      .select('*');
    if (benError) throw benError;

    const { data: relations, error: relError } = await supabaseAdmin
      .from('family_relationships')
      .select('*');
    if (relError) throw relError;

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
    const { data, error } = await supabaseAdmin
      .from('donations')
      .select('id, name, quantity, unit, category')
      .order('received_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ donations: data ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
