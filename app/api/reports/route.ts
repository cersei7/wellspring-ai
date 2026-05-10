import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/report-generator';
import { supabaseAdmin } from '@/lib/supabase';
import { Locale } from '@/lib/i18n';

export async function POST(req: NextRequest) {
  try {
    const { locale = 'en' } = await req.json();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [donationsRes, distributionsRes, beneficiariesRes] = await Promise.all([
      supabaseAdmin.from('donations').select('*').gte('received_at', sevenDaysAgo),
      supabaseAdmin.from('distributions').select('*').gte('allocated_at', sevenDaysAgo),
      supabaseAdmin.from('beneficiaries').select('id'),
    ]);

    if (donationsRes.error) throw donationsRes.error;
    if (distributionsRes.error) throw distributionsRes.error;
    if (beneficiariesRes.error) throw beneficiariesRes.error;

    const donations = donationsRes.data ?? [];
    const distributions = distributionsRes.data ?? [];

    const totalDonations = donations.reduce((sum, d) => sum + (d.quantity ?? 0), 0);
    const totalDistributed = distributions.reduce((sum, d) => sum + (d.quantity_allocated ?? 0), 0);

    const categoryCounts = new Map();
    donations.forEach((d) => {
      categoryCounts.set(d.category, (categoryCounts.get(d.category) ?? 0) + d.quantity);
    });
    const topCategories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const shortages: string[] = [];
    categoryCounts.forEach((received, category) => {
      const distributedInCat = distributions
        .filter((d) => {
          const matched = donations.find((don) => don.id === d.donation_id);
          return matched?.category === category;
        })
        .reduce((sum, d) => sum + (d.quantity_allocated ?? 0), 0);
      if (distributedInCat > received * 0.7) shortages.push(category);
    });

    const servedSet = new Set(distributions.map((d) => d.beneficiary_id).filter(Boolean));

    const stats = {
      period: locale === 'zh' ? '过去 7 天' : locale === 'es' ? 'Últimos 7 días' : 'Past 7 Days',
      totalDonations,
      totalDistributed,
      topCategories,
      beneficiariesServed: servedSet.size,
      shortages,
    };

    const report = await generateReport(stats, locale as Locale);
    return NextResponse.json({ stats, report });
  } catch (error: any) {
    console.error('Report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Please use POST with { locale }' }, { status: 405 });
}
