import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { donationId, quantity, beneficiaryId } = await req.json();
    if (!donationId || !quantity) {
      return NextResponse.json({ error: 'Missing donationId or quantity' }, { status: 400 });
    }

    // 1. 查询捐赠记录
    const { data: donation, error: findError } = await supabaseAdmin
      .from('donations')
      .select('id, name, category, unit, quantity')
      .eq('id', donationId)
      .single();

    if (findError || !donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (donation.quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // 2. 扣减 donations 表中的数量
    const newQuantity = donation.quantity - quantity;
    const { error: updateError } = await supabaseAdmin
      .from('donations')
      .update({ quantity: newQuantity })
      .eq('id', donationId);

    if (updateError) throw updateError;

    // 3. 更新 inventory 表（同步扣减）
    const { data: invItem } = await supabaseAdmin
      .from('inventory')
      .select('id, available_quantity')
      .eq('name', donation.name)
      .eq('category', donation.category)
      .eq('unit', donation.unit)
      .maybeSingle();

    if (invItem) {
      const newInvQty = invItem.available_quantity - quantity;
      await supabaseAdmin
        .from('inventory')
        .update({ available_quantity: newInvQty })
        .eq('id', invItem.id);
    }

    // 4. 记录分配历史（可选）
    const { error: histError } = await supabaseAdmin
      .from('distributions')
      .insert([{
        donation_id: donationId,
        beneficiary_id: beneficiaryId || null,
        quantity_allocated: quantity,
        allocated_at: new Date().toISOString(),
        created_by_role: 'volunteer'
      }]);
    if (histError) console.warn('Failed to record distribution:', histError);

    return NextResponse.json({ success: true, remaining: newQuantity });
  } catch (error: any) {
    console.error('Allocation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
