// app/api/topup/route.ts

import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Menerima payload dari Flutter StoreScreen
    const { restoId, restoName, itemName, price, type, value } = body;

    let snap = new midtransClient.Snap({
      isProduction: false, // Ubah ke true jika sudah rilis
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
      transaction_details: {
        // PERHATIKAN: Prefix-nya kita bedakan jadi ASKARA-TOPUP-
        order_id: `ASKARA-TOPUP-${Date.now()}`,
        gross_amount: price,
      },
      customer_details: {
        first_name: restoName,
        email: 'topup@askaraindonesia.my.id', // Bebas, karena ini in-app purchase
      },
      item_details: [{
        id: `ADDON_${type.toUpperCase()}`,
        price: price,
        quantity: 1,
        name: itemName
      }],
      // Kita titipkan data penting di custom_field agar dibaca Webhook nanti
      custom_field1: type,        // Contoh: 'kuota', 'hari', atau 'paket'
      custom_field2: restoId,     // ID Resto di Supabase
      custom_field3: value.toString() // Nilai kuota (1000) atau hari (30)
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error('Topup API Error:', error);
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}