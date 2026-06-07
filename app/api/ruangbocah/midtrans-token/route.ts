import { NextResponse } from 'next/server';

// WAJIB ADA UNTUK CLOUDFLARE PAGES
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Verifikasi Signature Key menggunakan Web Crypto API (Kompabilitas Edge/Cloudflare)
    // Pastikan tidak ada "import crypto from 'crypto'" di bagian atas file ini
    const textToHash = `${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
    
    // Proses hashing SHA-512 ala Edge
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const generatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (data.signature_key !== generatedHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // 2. Cek apakah pembayaran berhasil
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const uid = data.custom_field1; 
      
      if (uid) {
        // 3. Menyeberang ke Supabase Aplikasi Ruang Bocah
        const APP_SUPABASE_URL = process.env.RUANG_BOCAH_SUPABASE_URL!;
        const APP_SUPABASE_KEY = process.env.RUANG_BOCAH_SUPABASE_SERVICE_KEY!;

        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

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