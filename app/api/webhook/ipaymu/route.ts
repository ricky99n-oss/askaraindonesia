import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // iPaymu mengirimkan status transaksi, reference_id, dll ke webhook ini
    const { reference_id, status_code } = body;

    if (reference_id && (status_code === '1' || status_code === 1)) {
       // Status 1 artinya Berhasil (PAID)
       await supabase.from('transactions').update({ status: 'PAID' }).eq('reference_id', reference_id);
    } else if (reference_id && (status_code === '-2' || status_code === -2)) {
       // Status -2 artinya Expired / Gagal
       await supabase.from('transactions').update({ status: 'FAILED' }).eq('reference_id', reference_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}