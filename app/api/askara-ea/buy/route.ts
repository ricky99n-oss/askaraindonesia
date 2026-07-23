export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; 

export async function POST(req: Request) {
  try {
    const { name, username, email, phone } = await req.json();
    
    // Validasi basic
    if (!name || !email || !username) {
      return NextResponse.json({ error: 'Nama, Username, dan Email wajib diisi' }, { status: 400 });
    }

    const orderId = `EA-EXTREME-${Date.now()}`;
    const price = 129000;

    // Parameter untuk Midtrans
    const parameters = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price
      },
      customer_details: {
        first_name: name,
        email: email,
        phone: phone || ''
      },
      item_details: [{
        id: 'ASKARA-EA-01',
        price: price,
        quantity: 1,
        name: 'Askara AI Extreme EA (Lifetime)'
      }],
      custom_field1: username // Kita simpan username di custom field untuk dibaca webhook nanti
    };

    // Konfigurasi Native Fetch untuk Midtrans (Edge Compatible)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const encodedKey = btoa(serverKey + ':'); // Base64 Encode untuk Basic Auth
    const isProd = process.env.NODE_ENV === 'production';
    const midtransUrl = isProd 
      ? 'https://app.midtrans.com/snap/v1/transactions' 
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const midtransResponse = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      },
      body: JSON.stringify(parameters)
    });

    const transaction = await midtransResponse.json();

    if (!midtransResponse.ok) {
      console.error("Midtrans API Error:", transaction);
      throw new Error(transaction.error_messages ? transaction.error_messages[0] : 'Gagal membuat transaksi Midtrans');
    }

    // [OPSIONAL] Insert status 'pending' ke tabel transactions di Supabase
    const { error: dbError } = await supabase
      .from('transactions')
      .insert([
        { 
          order_id: orderId, 
          customer_name: name,
          customer_email: email,
          amount: price,
          status: 'pending',
          item_type: 'Askara AI Extreme'
        }
      ]);

    if (dbError) {
      console.error("Supabase Error:", dbError.message);
      // Kita tetap kembalikan token agar user bisa bayar, error log hanya untuk admin
    }

    return NextResponse.json({ token: transaction.token, orderId });

  } catch (error: any) {
    console.error("Internal Server Error:", error.message);
    return NextResponse.json({ error: 'Gagal memproses pembayaran' }, { status: 500 });
  }
}