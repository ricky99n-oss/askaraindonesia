import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, phone } = body;

    if (!name || !username || !email || !phone) {
      return NextResponse.json({ error: 'Data formulir tidak lengkap!' }, { status: 400 });
    }

    const orderId = `ASKARA-EA-${Date.now()}`;
    const grossAmount = 129000;

    // KITA TITIPKAN DATA PEMBELI KE CUSTOM FIELD MIDTRANS
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
      },
      custom_field1: username, // Titip Username
      custom_field2: email,    // Titip Email
      custom_field3: name      // Titip Nama
    };

    const isProd = process.env.NODE_ENV === 'production';
    const midtransUrl = isProd 
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
      
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
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

    if (!midtransRes.ok) {
      throw new Error(midtransData.error_messages?.[0] || 'Gagal membuat transaksi di Midtrans');
    }

    // Kita lewati proses insert Supabase di sini, biarkan Webhook yang bekerja nanti!
    return NextResponse.json({ token: midtransData.token, orderId: orderId });

  } catch (error: any) {
    console.error('API /buy ERROR:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pembayaran' }, 
      { status: 500 }
    );
  }
}