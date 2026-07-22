import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { supabase } from '@/lib/supabaseClient'; 

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();
    
    // Validasi basic
    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan Email wajib diisi' }, { status: 400 });
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
        name: 'Askara AI Extreme EA (Lifetime License)'
      }]
    };

    // Generate Token
    const transaction = await snap.createTransaction(parameters);

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

    if (dbError) throw dbError;

    return NextResponse.json({ token: transaction.token, orderId });

  } catch (error: any) {
    console.error("Midtrans Error:", error.message);
    return NextResponse.json({ error: 'Gagal memproses pembayaran' }, { status: 500 });
  }
}