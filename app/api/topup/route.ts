// app/api/topup/route.ts

import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Kita tetap menerima data dari Flutter, TAPI kita abaikan 'price' dari mereka
    const { restoId, restoName, itemName, type, value } = body;

    // 1. INISIALISASI SUPABASE ADMIN (Untuk menembus database)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Kunci Database belum terpasang!');
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. CEK HARGA ASLI ADD-ON KE DATABASE (Anti-Hacker)
    // Pastikan di Supabase ada tabel 'addons' yang memiliki kolom 'type' dan 'value'
    const { data: addon, error: addonError } = await supabaseAdmin
      .from('addons')
      .select('price, name')
      .eq('type', type)
      .eq('value', value)
      .single();

    if (addonError || !addon) {
      return NextResponse.json({ error: 'Data Add-on tidak valid atau tidak ditemukan di sistem' }, { status: 400 });
    }

    const realPrice = addon.price; // HARGA ASLI DARI DATABASE
    const realItemName = addon.name || itemName;

    // 3. INISIALISASI MIDTRANS (Auto-Deteksi Sandbox / Production)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isSandbox = serverKey.startsWith('SB-'); // Otomatis mendeteksi kunci
    
    let snap = new midtransClient.Snap({
      isProduction: !isSandbox, 
      serverKey: serverKey,
    });

    let parameter = {
      transaction_details: {
        order_id: `ASKARA-TOPUP-${Date.now()}`,
        gross_amount: realPrice, // GUNAKAN HARGA ASLI
      },
      customer_details: {
        first_name: restoName,
        email: 'topup@askaraindonesia.my.id', 
      },
      item_details: [{
        id: `ADDON_${type.toUpperCase()}`,
        price: realPrice, // GUNAKAN HARGA ASLI
        quantity: 1,
        name: realItemName
      }],
      custom_field1: type,        
      custom_field2: restoId,     
      custom_field3: value.toString() 
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
    
  } catch (error: any) {
    console.error('Topup API Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat transaksi' }, { status: 500 });
  }
}