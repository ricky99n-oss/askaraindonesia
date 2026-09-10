import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restoId, restoName, itemName, type, value } = body;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Kunci Database belum terpasang!');
    }
    
    const ipaymuVa = process.env.IPAYMU_VA || '';
    const ipaymuApiKey = process.env.IPAYMU_API_KEY || '';
    const ipaymuUrl = process.env.IPAYMU_URL || '';

    if (!ipaymuVa || !ipaymuApiKey || !ipaymuUrl) {
      throw new Error('Konfigurasi iPaymu tidak valid');
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // CEK HARGA ASLI ADD-ON KE DATABASE
    const { data: addon, error: addonError } = await supabaseAdmin
      .from('addons')
      .select('price, name')
      .eq('type', type)
      .eq('value', value)
      .single();

    if (addonError || !addon) {
      return NextResponse.json({ error: 'Data Add-on tidak valid atau tidak ditemukan di sistem' }, { status: 400 });
    }

    const realPrice = addon.price; 
    const realItemName = addon.name || itemName;

    // TITIPKAN CUSTOM FIELDS KE REFERENCE ID IPAYMU (Format: TOPUP_restoId_type_value_timestamp)
    const referenceId = `TOPUP_${restoId}_${type}_${value}_${Date.now()}`;

    // PAYLOAD IPAYMU V2
    const payload = {
      product: [realItemName],
      qty: ['1'],
      price: [realPrice.toString()],
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook/ipaymu`,
      buyerName: restoName || 'Klien Askara POS',
      buyerEmail: 'topup@askaraindonesia.my.id',
      buyerPhone: '080000000000',
      referenceId: referenceId
    };

    // PROSES ENKRIPSI SIGNATURE IPAYMU (Web Crypto API)
    const encoder = new TextEncoder();
    
    const bodyBuffer = encoder.encode(JSON.stringify(payload));
    const bodyHashBuffer = await crypto.subtle.digest('SHA-256', bodyBuffer);
    const bodyHashHex = Array.from(new Uint8Array(bodyHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const stringToSign = `POST:${ipaymuVa}:${bodyHashHex}:${ipaymuApiKey}`;
    const keyBuffer = encoder.encode(ipaymuApiKey);
    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(stringToSign));
    const signatureHex = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
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
      // Endpoint Topup sekarang juga me-return paymentUrl
      return NextResponse.json({ paymentUrl: ipaymuData.Data.Url });
    } else {
      throw new Error(ipaymuData.Message || 'Gagal dari sisi gateway');
    }
    
  } catch (error: any) {
    console.error('Topup API Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat transaksi' }, { status: 500 });
  }
}