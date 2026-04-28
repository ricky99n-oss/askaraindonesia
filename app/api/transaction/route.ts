import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, price, customerName, customerEmail, restoName } = body;

    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
      transaction_details: {
        order_id: `ASKARA-SUB-${Date.now()}`,
        gross_amount: price,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      item_details: [{
        id: planName,
        price: price,
        quantity: 1,
        name: `Langganan Askara Smart POS - ${planName}`
      }],
      // TITIPKAN DATA DI SINI UNTUK WEBHOOK
      custom_field1: customerName, 
      custom_field2: customerEmail,
      custom_field3: restoName 
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}