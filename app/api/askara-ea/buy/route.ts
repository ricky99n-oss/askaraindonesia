import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Wajib untuk Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Hapus 'amount' dari sini karena frontend memang tidak mengirimkannya
    const { name, email, username, phone } = body;

    // 1. AMBIL VARIABEL CLOUDFLARE DI DALAM FUNGSI
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    if (!supabaseUrl || !supabaseKey || !serverKey) {
      console.error('Kunci Environment Variables Kosong');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap' }, { status: 500 });
    }

    // Inisialisasi Supabase menggunakan Service Role agar aman menembus RLS
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. VALIDASI USERNAME
    const { data: existingUser, error: checkError } = await supabase
      .from('ea_licenses')
      .select('id')
      .eq('username', username)
      .maybeSingle(); 

    if (checkError) {
      console.error('Database Check Error:', checkError);
      return NextResponse.json({ error: 'Gagal memverifikasi database.' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan. Silakan gunakan username lain.' },
        { status: 400 }
      );
    }

    const order_id = `ASKARA-EA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. BUAT TRANSAKSI MIDTRANS
    const authString = btoa(`${serverKey}:`);

    const midtransPayload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: 129000, // HARGA DI-HARDCODE DI SINI DEMI KEAMANAN
      },
      customer_details: {
        first_name: name,
        email: email,
        phone: phone,
      },
      // Titipkan username di sini agar webhook tahu username yang dibeli
      custom_field1: username, 
      custom_field2: email,
      custom_field3: name
    };

    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      console.error('Midtrans API Error:', midtransData);
      return NextResponse.json({ 
        error: 'Gagal membuat transaksi di Gateway Pembayaran', 
        detail: midtransData 
      }, { status: 500 });
    }

    // 4. KEMBALIKAN TOKEN KE FRONTEND
    return NextResponse.json({ token: midtransData.token, order_id });

  } catch (error: any) {
    console.error('Fatal Error pada Askara EA Buy:', error.message);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server.', detail: error.message }, { status: 500 });
  }
}