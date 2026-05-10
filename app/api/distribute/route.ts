import { NextRequest, NextResponse } from 'next/server';
import { recommendDistribution } from '@/lib/priority-engine';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { donationId } = await req.json();

    const [beneficiariesRes, relationsRes, donationRes] = await Promise.all([
      supabaseAdmin.from('beneficiaries').select('*'),
      supabaseAdmin.from('family_relationships').select('*'),
      supabaseAdmin.from('donations').select('*').eq('id', donationId).single(),
    ]);

    if (beneficiariesRes.error) throw beneficiariesRes.error;
    if (donationRes.error) throw donationRes.error;

    const beneficiaries = beneficiariesRes.data ?? [];
    const relations = relationsRes.data ?? [];
    const donation = donationRes.data;

    const totalDemand = beneficiaries.length;
    const result = await recommendDistribution(
      beneficiaries,
      relations,
      donation,
      donation.quantity,
      totalDemand
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
      .select('*')
      .order('received_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ donations: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
