import { NextResponse } from 'next/server';

// Wajib untuk Cloudflare Pages
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Ambil variabel environment di dalam fungsi (Praktik terbaik untuk Edge)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const APP_SUPABASE_URL = process.env.RUANG_BOCAH_SUPABASE_URL || '';
    const APP_SUPABASE_KEY = process.env.RUANG_BOCAH_SUPABASE_SERVICE_KEY || '';

    if (!serverKey || !APP_SUPABASE_URL || !APP_SUPABASE_KEY) {
      console.error('Environment variables Ruang Bocah tidak lengkap');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap' }, { status: 500 });
    }

    // 2. Validasi Keamanan (Signature Midtrans menggunakan Web Crypto API)
    const textToHash = `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (data.signature_key !== hashHex) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // 3. Cek apakah transaksi lunas (settlement / capture)
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const uid = data.custom_field1; // ID User Flutter yang diselipkan
      
      if (uid) {
        // Menghitung tanggal expired baru (30 hari dari sekarang)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

        // 4. RPC Call ke Supabase App untuk update langganan & koin
        const rpcResponse = await fetch(`${APP_SUPABASE_URL}/rest/v1/rpc/perpanjang_langganan`, {
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

        // 5. Validasi hasil dari Supabase
        if (!rpcResponse.ok) {
          const errorDetail = await rpcResponse.text();
          console.error('❌ Gagal update ke Supabase Ruang Bocah:', errorDetail);
          // Mengembalikan 500 agar Midtrans mencoba ulang webhook jika terjadi kegagalan jaringan internal
          return NextResponse.json({ error: 'Gagal sinkronisasi database' }, { status: 500 });
        }
      } else {
        console.warn('⚠️ Custom Field 1 (UID) kosong dari Midtrans, mengabaikan proses update Supabase.');
      }
    }

    // Berikan respons 200 OK agar Midtrans tahu webhook sukses diterima
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message);
    return NextResponse.json({ error: 'Webhook failed', detail: error.message }, { status: 500 });
  }
}