import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Setup Supabase (Ambil dari Env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, name, price, quantity = 1, buyerName, buyerEmail, buyerPhone, shippingCost = 0 } = body;

    const ipaymuVa = process.env.IPAYMU_VA || '';
    const ipaymuApiKey = process.env.IPAYMU_API_KEY || '';
    let ipaymuUrl = process.env.IPAYMU_URL || '';

    if (!ipaymuUrl.includes('/api/v2/payment')) {
      ipaymuUrl = `${ipaymuUrl.replace(/\/$/, '')}/api/v2/payment`;
    }

    const referenceId = `ORD-${Date.now()}-${productId}`;
    const safePrice = Number(price) || 0;
    const safeShipping = Number(shippingCost) || 0;
    const totalAmount = safePrice + safeShipping;

    // 1. Simpan Transaksi ke Supabase Database dengan status PENDING
    const { error: dbError } = await supabase.from('transactions').insert([{
      reference_id: referenceId,
      product_name: name,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      amount: totalAmount,
      shipping_cost: safeShipping,
      status: 'PENDING'
    }]);

    if (dbError) console.error("Database Insert Error:", dbError);

    // 2. Siapkan Data untuk iPaymu
    const productNames = [name];
    const productQtys = ['1'];
    const productPrices = [safePrice.toString()];

    if (safeShipping > 0) {
      productNames.push('Ongkos Kirim');
      productQtys.push('1');
      productPrices.push(safeShipping.toString());
    }

    const payload = {
      product: productNames,
      qty: productQtys,
      price: productPrices,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?ref=${referenceId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/marketplace`,
      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://askaraindonesia.com'}/api/webhook/ipaymu`,
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      buyerPhone: buyerPhone,
      referenceId: referenceId,
    };

    // 3. Eksekusi Enkripsi iPaymu
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

    const ipaymuResponse = await fetch(ipaymuUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'va': ipaymuVa, 'signature': signatureHex, 'timestamp': timestamp },
      body: JSON.stringify(payload)
    });

    const ipaymuData = await ipaymuResponse.json();

    if (ipaymuData.Success) {
      return NextResponse.json({ paymentUrl: ipaymuData.Data.Url, order_id: referenceId });
    } else {
      return NextResponse.json({ error: ipaymuData.Message || 'Gagal Gateway' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}