import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 });
    }

    const orderId = `RB-PREM-${uid.substring(0, 5)}-${Date.now()}`;

    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 49000,
      },
      item_details: [
        {
          id: 'RB-MONTHLY',
          price: 49000,
          quantity: 1,
          name: 'Ruang Bocah Premium (1 Bulan) + 50 Koin',
        }
      ],
      // Kita selipkan UID di custom_field1 agar bisa dibaca oleh Webhook nanti
      custom_field1: uid, 
    };

    // Panggil API Midtrans (Ganti URL ke production jika sudah live)
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const data = await response.json();
    return NextResponse.json({ token: data.token });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}