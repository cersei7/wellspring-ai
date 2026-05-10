import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const [donationsRes, distributionsRes] = await Promise.all([
      supabaseAdmin.from('donations').select('*'),
      supabaseAdmin.from('distributions').select('*'),
    ]);

    if (donationsRes.error) throw donationsRes.error;
    if (distributionsRes.error) throw distributionsRes.error;

    const donations = donationsRes.data ?? [];
    const distributions = distributionsRes.data ?? [];

    // 按 (category, name, unit) 分组聚合
    const inventoryMap = new Map();

    donations.forEach((d) => {
      const key = `${d.category}|${d.name}|${d.unit}`;
      const existing = inventoryMap.get(key) ?? {
        category: d.category,
        name: d.name,
        unit: d.unit,
        received: 0,
        distributed: 0,
        donationIds: [],
      };
      existing.received += d.quantity ?? 0;
      existing.donationIds.push(d.id);
      inventoryMap.set(key, existing);
    });

    distributions.forEach((dist) => {
      // 找出对应 donation 的类别
      for (const item of inventoryMap.values()) {
        if (item.donationIds.includes(dist.donation_id)) {
          item.distributed += dist.quantity_allocated ?? 0;
          break;
        }
      }
    });

    const inventory = Array.from(inventoryMap.values())
      .map((item) => ({
        category: item.category,
        name: item.name,
        unit: item.unit,
        received: item.received,
        distributed: item.distributed,
        available: item.received - item.distributed,
      }))
      .filter((item) => item.available > 0)
      .sort((a, b) => b.available - a.available);

    // 按类别汇总
    const byCategory = new Map();
    inventory.forEach((item) => {
      byCategory.set(
        item.category,
        (byCategory.get(item.category) ?? 0) + item.available
      );
    });

    const categorySummary = Array.from(byCategory.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ inventory, categorySummary });
  } catch (error: any) {
    console.error('Inventory error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
