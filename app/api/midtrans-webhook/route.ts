// app/api/midtrans-webhook/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// WAJIB UNTUK CLOUDFLARE PAGES
export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Verifikasi Web Crypto API (Aman untuk Edge Runtime)
    const textToHash = `${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (data.signature_key !== hashHex) {
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 });
    }

    // 2. Cek Jika Pembayaran Berhasil (Settlement)
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      
      const ownerName = data.custom_field1;
      const customerEmail = data.custom_field2;
      
      // 3. Ekstrak Kredensial dari JSON
      const secretData = JSON.parse(data.custom_field3);
      const { rn, ru, rp, ou, op, out } = secretData; // rn = restoName, ru = restoUsername, dll

      const expiredAt = new Date();
      expiredAt.setMonth(expiredAt.getMonth() + 1); // Masa aktif 1 bulan

      // 4. Insert ke Tabel Owners (Tambahan: Simpan Email Pelanggan)
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert({
          owner_name: ownerName,
          owner_username: ou,
          owner_password: op,
          email: customerEmail // <--- DISIMPAN KE SUPABASE AGAR BISA RESET PASSWORD NANTINYA
        })
        .select()
        .single();

      if (ownerError) throw ownerError;

      // 5. Insert ke Tabel Restaurants
      const { error: restoError } = await supabase
        .from('restaurants')
        .insert({
          owner_id: ownerData.id,
          name: rn, // Menggunakan Nama Resto dari JSON
          username: ru,
          password: rp, 
          subscription_plan: 'Premium',
          transaction_limit: 5000, 
          expired_at: expiredAt.toISOString()
        });

      if (restoError) throw restoError;

      // 6. Kirim Email Pemberitahuan (Pisahkan Info Owner jika > 1 Outlet)
      await sendEmailCredentials(customerEmail, rn, ru, rp, ou, op, out);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ============================================================================
// FUNGSI KIRIM EMAIL DENGAN RESEND API
// ============================================================================
async function sendEmailCredentials(email: string, restoName: string, ru: string, rp: string, ou: string, op: string, outlet: number) {
  try {
    let ownerHtmlBlock = '';
    // Jika jumlah outlet lebih dari 1, tampilkan juga data login khusus Owner
    if (outlet > 1) {
      ownerHtmlBlock = `
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; border: 1px solid #ffd180;">
          <h3 style="color: #FF8C00; margin-top: 0; font-size: 15px;">Dashboard Owner (Manager)</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #555;">Gunakan akun ini untuk memantau semua outlet Anda.</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Username:</strong> <span style="color: #d84315;">${ou}</span></p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <span style="color: #d84315;">${op}</span></p>
        </div>
      `;
    }

    await resend.emails.send({
      // CATATAN: Jika status domain di Resend sudah Verified (Hijau), 
      // ganti tulisan 'onboarding@resend.dev' di bawah ini menjadi email resmi Bos.
      // Contoh: 'admin@askaraindonesia.my.id'
      from: 'Askara POS <hello@askaraindonesia.my.id>',
      to: email, 
      subject: 'Akses Aplikasi Askara Smart POS Anda',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4A00E0; text-align: center;">Selamat Datang di Askara Smart POS!</h2>
          <p>Terima kasih telah berlangganan. Pembayaran untuk <strong>${restoName}</strong> telah kami terima.</p>
          <p>Berikut adalah kredensial yang telah Anda atur untuk mengakses sistem kami:</p>
          
          <div style="background-color: #f3e5f5; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: left; border: 1px solid #e1bee7;">
            <h3 style="color: #6a1b9a; margin-top: 0; font-size: 15px;">Aplikasi Kasir (Outlet)</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #555;">Gunakan akun ini untuk login di tablet kasir.</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Username:</strong> <span style="color: #4A00E0;">${ru}</span></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <span style="color: #4A00E0;">${rp}</span></p>
          </div>
          
          ${ownerHtmlBlock}
          
          <p style="margin-top: 20px; font-size: 14px;">Masa aktif Anda berlaku selama <strong>30 Hari</strong> ke depan dengan kuota <strong>5.000 Struk Transaksi</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">
            Salam hangat,<br><strong>Tim Askara Indonesia</strong><br>
            Jl. Patimura, Gg VI, 10H, Temas, Kota Batu.
          </p>
        </div>
      `
    });
    console.log(`Email sukses dikirim ke: ${email}`);
  } catch (error) {
    console.error('Gagal mengirim email kredensial:', error);
  }
}