import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyIpaymuCallback } from '@/lib/ipaymu/callback';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) throw new Error('Konfigurasi Supabase belum tersedia');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const callback = await verifyIpaymuCallback(req);
    if (!callback.valid) return NextResponse.json({ error: 'Invalid callback signature' }, { status: 401 });
    const { reference_id, status_code } = callback.payload;

    if (reference_id && (status_code === '1' || status_code === 1)) {
       // Status 1 artinya Berhasil (PAID)
       await supabase.from('transactions').update({ status: 'PAID' }).eq('reference_id', String(reference_id)).eq('status', 'PENDING');
    } else if (reference_id && (status_code === '-2' || status_code === -2)) {
       // Status -2 artinya Expired / Gagal
       await supabase.from('transactions').update({ status: 'FAILED' }).eq('reference_id', String(reference_id)).eq('status', 'PENDING');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('iPaymu callback processing failed', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
