import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// WAJIB DITAMBAHKAN AGAR KOMPATIBEL DENGAN CLOUDFLARE PAGES
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 1. Ambil data dari Frontend
    const body = await req.json();
    const { name, username, email, phone } = body;

    if (!name || !username || !email || !phone) {
      return NextResponse.json({ error: 'Data formulir tidak lengkap!' }, { status: 400 });
    }

    const orderId = `ASKARA-EA-${Date.now()}`;
    const grossAmount = 129000;

    // 2. Siapkan Payload untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      item_details: [{
        id: 'ASKARA-EA-LIFETIME',
        price: grossAmount,
        quantity: 1,
        name: 'Askara AI Extreme - Lifetime License'
      }],
      customer_details: {
        first_name: name,
        email: email,
        phone: phone
      }
    };

    // 3. PANGGIL MIDTRANS LANGSUNG TANPA LIBRARY (Native Fetch)
    const isProd = false;
    const midtransUrl = isProd 
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
      
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    
    // Midtrans mewajibkan Server Key di-encode ke Base64 dengan tambahan titik dua (:)
    const base64Key = btoa(`${serverKey}:`);

    const midtransRes = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Key}`
      },
      body: JSON.stringify(parameter)
    });

    const midtransData = await midtransRes.json();

    // Jika Midtrans menolak permintaan
    if (!midtransRes.ok) {
      console.error("MIDTRANS ERROR:", midtransData);
      throw new Error(midtransData.error_messages?.[0] || 'Gagal membuat transaksi di Midtrans');
    }

    // 4. Simpan Data Awal ke Supabase (Status: Pending)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: dbError } = await supabase
        .from('ea_licenses')
        .insert([{
          order_id: orderId,
          username: username,
          email: email,
          phone: phone,
          is_active: false,
          payment_status: 'pending'
        }]);

      if (dbError) {
        console.error('SUPABASE INSERT ERROR:', dbError.message);
        // Kita biarkan proses berlanjut meski log database gagal, agar popup tetap muncul
      }
    } else {
      console.warn('SUPABASE KEYS MISSING: Data tidak disimpan ke database.');
    }

    // 5. Kembalikan Token ke Frontend
    return NextResponse.json({ token: midtransData.token, orderId: orderId });

  } catch (error: any) {
    console.error('API /buy ERROR:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pembayaran' }, 
      { status: 500 }
    );
  }
}