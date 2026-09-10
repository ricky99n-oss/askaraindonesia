import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Wajib untuk Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, username, phone } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    // Kredensial iPaymu
    const ipaymuVa = process.env.IPAYMU_VA || '';
    const ipaymuApiKey = process.env.IPAYMU_API_KEY || '';
    const ipaymuUrl = process.env.IPAYMU_URL || '';

    if (!supabaseUrl || !supabaseKey || !ipaymuVa || !ipaymuApiKey || !ipaymuUrl) {
      console.error('Kunci Environment Variables Kosong');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // VALIDASI USERNAME
    const { data: existingUser, error: checkError } = await supabase
      .from('ea_licenses')
      .select('id')
      .eq('username', username)
      .maybeSingle(); 

    if (checkError) {
      return NextResponse.json({ error: 'Gagal memverifikasi database.' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan. Silakan gunakan username lain.' },
        { status: 400 }
      );
    }

    // BUAT REFERENCE ID (Penting: Kita titipkan username di sini agar terbaca di Webhook)
    const referenceId = `EA_${username}_${Date.now()}`;

    // PAYLOAD IPAYMU V2
    const payload = {
      product: ['Askara AI Extreme (EA)'],
      qty: ['1'],
      price: ['129000'], // HARGA DI-HARDCODE DEMI KEAMANAN
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook/ipaymu`,
      buyerName: name || 'Traders Askara',
      buyerEmail: email,
      buyerPhone: phone || '08000000000',
      referenceId: referenceId
    };

    // PROSES ENKRIPSI SIGNATURE IPAYMU (Format Web Crypto API untuk Edge Runtime)
    const encoder = new TextEncoder();
    
    // 1. SHA-256 dari Body JSON
    const bodyBuffer = encoder.encode(JSON.stringify(payload));
    const bodyHashBuffer = await crypto.subtle.digest('SHA-256', bodyBuffer);
    const bodyHashHex = Array.from(new Uint8Array(bodyHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 2. HMAC-SHA256 Signature
    const stringToSign = `POST:${ipaymuVa}:${bodyHashHex}:${ipaymuApiKey}`;
    const keyBuffer = encoder.encode(ipaymuApiKey);
    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(stringToSign));
    const signatureHex = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 3. Format Timestamp
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    // REQUEST KE IPAYMU
    const ipaymuResponse = await fetch(ipaymuUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'va': ipaymuVa,
        'signature': signatureHex,
        'timestamp': timestamp
      },
      body: JSON.stringify(payload)
    });

    const ipaymuData = await ipaymuResponse.json();

    if (ipaymuData.Success) {
      // Mengembalikan paymentUrl (Bukan Token lagi) agar client bisa langsung redirect
      return NextResponse.json({ paymentUrl: ipaymuData.Data.Url, order_id: referenceId });
    } else {
      console.error('iPaymu API Error:', ipaymuData);
      return NextResponse.json({ 
        error: 'Gagal membuat transaksi di Gateway Pembayaran', 
        detail: ipaymuData 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Fatal Error pada Askara EA Buy:', error.message);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server.', detail: error.message }, { status: 500 });
  }
}