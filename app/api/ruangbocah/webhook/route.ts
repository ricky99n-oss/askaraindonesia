import { NextResponse } from 'next/server';

// Wajib untuk Cloudflare Pages
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // iPaymu mengirim data Webhook melalui Form Data (x-www-form-urlencoded / multipart)
    const formData = await req.formData();
    
    const status_code = formData.get('status_code');
    const status = formData.get('status');
    const reference_id = formData.get('reference_id') as string;

    const APP_SUPABASE_URL = process.env.RUANG_BOCAH_SUPABASE_URL || '';
    const APP_SUPABASE_KEY = process.env.RUANG_BOCAH_SUPABASE_SERVICE_KEY || '';

    if (!APP_SUPABASE_URL || !APP_SUPABASE_KEY) {
      console.error('Environment variables Ruang Bocah tidak lengkap');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap' }, { status: 500 });
    }

    // Cek apakah transaksi lunas dari iPaymu (status_code = 1)
    if (status_code === '1' || status?.toString().toLowerCase() === 'berhasil') {
      
      // Validasi apakah ini transaksi Ruang Bocah
      if (reference_id && reference_id.startsWith('RB-PREM-')) {
        
        // Ekstrak UID asli (Menghilangkan prefix RB-PREM-)
        const uid = reference_id.replace('RB-PREM-', '');

        // Menghitung tanggal expired baru (30 hari dari sekarang)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

        // RPC Call ke Supabase App untuk update langganan & koin
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

        // Validasi hasil dari Supabase
        if (!rpcResponse.ok) {
          const errorDetail = await rpcResponse.text();
          console.error('❌ Gagal update ke Supabase Ruang Bocah:', errorDetail);
          // 500 agar Gateway mencoba ulang webhook jika Supabase sedang down
          return NextResponse.json({ error: 'Gagal sinkronisasi database' }, { status: 500 });
        }

        console.log(`✅ Langganan Ruang Bocah berhasil diupdate untuk UID: ${uid}`);
      } else {
        console.warn('⚠️ Reference ID bukan format Ruang Bocah, mengabaikan proses update Supabase.');
      }
    }

    // Berikan respons 200 OK agar iPaymu berhenti mengirim ulang notifikasi (retry)
    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message);
    return NextResponse.json({ error: 'Webhook failed', detail: error.message }, { status: 500 });
  }
}