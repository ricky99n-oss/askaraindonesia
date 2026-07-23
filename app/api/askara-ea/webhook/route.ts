export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Fungsi pembuat 12 karakter acak (Hanya Huruf Besar & Angka)
function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 12; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${key.slice(0,4)}-${key.slice(4,8)}-${key.slice(8,12)}`; // Format: XXXX-XXXX-XXXX
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Pastikan status pembayaran adalah sukses (settlement / capture)
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      
      const orderId = data.order_id;
      // Dapatkan data username dari custom_field1 yang dikirim saat checkout
      const username = data.custom_field1; 
      const email = data.customer_details ? data.customer_details.email : '';
      const name = data.customer_details ? data.customer_details.first_name : 'Trader';
      
      if (!username) {
        throw new Error("Username tidak ditemukan di payload Midtrans");
      }

      const newLicenseKey = generateLicenseKey();

      // 1. Simpan ke Supabase ea_licenses
      const { error: dbError } = await supabase
        .from('ea_licenses')
        .insert([{
          order_id: orderId,
          name: name,
          username: username,
          email: email,
          license_key: newLicenseKey,
          hwid: null // Masih kosong sampai dipakai di MT5
        }]);

      if (dbError) throw dbError;

      // 2. [TODO] Kirim Email ke User di sini
      console.log(`[SUKSES] Lisensi dibuat untuk ${email}: Username: ${username}, Key: ${newLicenseKey}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}