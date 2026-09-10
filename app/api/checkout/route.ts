import { NextResponse } from 'next/server';

// Wajib untuk Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json({ error: 'Data request kosong' }, { status: 400 });
    }
    
    const body = JSON.parse(bodyText);
    const { 
      productId = 'PROD-000', 
      name = 'Produk Askara', 
      price = 0, 
      quantity = 1, 
      buyerName = 'Pelanggan Askara', 
      buyerEmail = 'admin@askaraindonesia.my.id', 
      buyerPhone = '080000000000', 
      shippingCost = 0 
    } = body;

    const ipaymuVa = process.env.IPAYMU_VA || '';
    const ipaymuApiKey = process.env.IPAYMU_API_KEY || '';
    let ipaymuUrl = process.env.IPAYMU_URL || '';

    if (!ipaymuVa || !ipaymuApiKey || !ipaymuUrl) {
      console.error('❌ ERROR API: Konfigurasi iPaymu di .env.local kosong/hilang!');
      return NextResponse.json({ error: 'Konfigurasi server belum lengkap' }, { status: 500 });
    }

    // AUTO-KOREKSI URL: Jika user hanya memasukkan "https://sandbox.ipaymu.com", otomatis tambahkan path API
    if (!ipaymuUrl.includes('/api/v2/payment')) {
      ipaymuUrl = `${ipaymuUrl.replace(/\/$/, '')}/api/v2/payment`;
    }

    const referenceId = `ORD-${Date.now()}-${productId}`;

    const safePrice = Number(price) || 0;
    const safeQty = Number(quantity) || 1;
    const safeShipping = Number(shippingCost) || 0;

    const productNames = [name];
    const productQtys = [safeQty.toString()];
    const productPrices = [safePrice.toString()];

    if (safeShipping > 0) {
      productNames.push('Ongkos Kirim (JNE)');
      productQtys.push('1');
      productPrices.push(safeShipping.toString());
    }

    const payload = {
      product: productNames,
      qty: productQtys,
      price: productPrices,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook/ipaymu`,
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      buyerPhone: buyerPhone,
      referenceId: referenceId,
    };

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
      headers: {
        'Content-Type': 'application/json',
        'va': ipaymuVa,
        'signature': signatureHex,
        'timestamp': timestamp
      },
      body: JSON.stringify(payload)
    });

    const responseText = await ipaymuResponse.text();
    let ipaymuData;
    
    try {
      ipaymuData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ ERROR API: Respon iPaymu bukan JSON!', responseText);
      return NextResponse.json({ error: 'Gateway pembayaran error (Invalid JSON). Cek URL iPaymu.' }, { status: 502 });
    }

    if (ipaymuData.Success) {
      return NextResponse.json({ paymentUrl: ipaymuData.Data.Url, order_id: referenceId });
    } else {
      console.error('❌ iPaymu Menolak Transaksi:', ipaymuData);
      return NextResponse.json({ 
        error: ipaymuData.Message || 'Gagal memproses transaksi di Gateway', 
        detail: ipaymuData 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Fatal Error Checkout:', error.message, error.stack);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server.', detail: error.message }, { status: 500 });
  }
}