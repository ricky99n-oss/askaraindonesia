import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Validasi Signature Key dari Midtrans
    const hash = crypto.createHash('sha512').update(`${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex');
    
    if (data.signature_key !== hash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // 2. Cek apakah pembayaran berhasil
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const uid = data.custom_field1; // ID User Flutter yang kita selipkan tadi
      
      if (uid) {
        // 3. Menyeberang ke Supabase Aplikasi Ruang Bocah
        const APP_SUPABASE_URL = process.env.RUANG_BOCAH_SUPABASE_URL!;
        const APP_SUPABASE_KEY = process.env.RUANG_BOCAH_SUPABASE_SERVICE_KEY!;

        // Menghitung tanggal expired baru (30 hari dari sekarang)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

        // RPC Call ke Supabase App untuk update langganan & koin
        // (Pastikan Anda membuat fungsi RPC 'perpanjang_langganan' di SQL Editor Supabase App)
        await fetch(`${APP_SUPABASE_URL}/rest/v1/rpc/perpanjang_langganan`, {
          method: 'POST',
          headers: {
            'apikey': APP_SUPABASE_KEY,
            'Authorization': `Bearer ${APP_SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            p_user_id: uid,
            p_valid_until: validUntil.toISOString(),
            p_koin_bonus: 50
          })
        });
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}