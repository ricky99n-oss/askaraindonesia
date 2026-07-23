import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import Midtrans from 'midtrans-client';
export const runtime = 'edge';
const snap = new Midtrans.Snap({
  isProduction: false, // Sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, username, phone, amount } = body;

    // 1. Validasi: Cek apakah username sudah ada di database
    const { data: existingUser } = await supabase
      .from('ea_licenses')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan. Silakan gunakan username lain.' },
        { status: 400 }
      );
    }

    const order_id = `EA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. Buat Transaksi Midtrans
    const parameters = {
      transaction_details: {
        order_id: order_id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
        phone: phone,
      },
      // Titipkan username di sini agar webhook tahu username yang dibeli
      custom_field1: username, 
    };

    const transaction = await snap.createTransaction(parameters);

    return NextResponse.json({ token: transaction.token, order_id });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}