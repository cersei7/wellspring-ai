import { NextRequest, NextResponse } from 'next/server';
import { parseDonation } from '@/lib/nlp-parser';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { text, locale = 'en' } = await req.json();
    const items = await parseDonation(text, locale);
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { items, rawInput } = await req.json();
    const results = [];
    for (const item of items) {
      // 1. 检查是否已存在相同 name, category, unit 的记录
      const { data: existing, error: findError } = await supabaseAdmin
        .from('donations')
        .select('id, quantity')
        .eq('name', item.name)
        .eq('category', item.category)
        .eq('unit', item.unit)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') throw findError;

      if (existing) {
        // 已存在 → 增加数量
        const newQuantity = existing.quantity + item.quantity;
        const { error: updateError } = await supabaseAdmin
          .from('donations')
          .update({ quantity: newQuantity, raw_input: rawInput })
          .eq('id', existing.id);
        if (updateError) throw updateError;
        results.push({ ...item, action: 'updated', newQuantity });
      } else {
        // 不存在 → 插入新记录
        const { error: insertError } = await supabaseAdmin
          .from('donations')
          .insert([{ ...item, raw_input: rawInput }]);
        if (insertError) throw insertError;
        results.push({ ...item, action: 'inserted' });
      }
    }
    return NextResponse.json({ success: true, saved: results });
  } catch (error: any) {
    console.error('Save error:', error);
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
    console.error('GET donations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
