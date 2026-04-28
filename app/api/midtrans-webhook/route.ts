import { NextResponse } from 'next/server';
import crypto from 'node:crypto'; // FIX: Gunakan node:crypto agar aman di Cloudflare Pages
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
export const runtime = 'edge';

// Inisialisasi Resend untuk kirim email
const resend = new Resend(process.env.RESEND_API_KEY);

// Setup Supabase dengan Service Role Key untuk bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Verifikasi Keamanan (Wajib agar tidak ditembak hacker)
    const hash = crypto.createHash('sha512')
      .update(`${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    if (data.signature_key !== hash) {
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 });
    }

    // 2. Cek Jika Pembayaran Berhasil (Settlement)
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      
      const ownerName = data.custom_field1;
      const customerEmail = data.custom_field2;
      const restoName = data.custom_field3;

      // 3. Generate Akun (Username & Password Random)
      const cleanRestoName = restoName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedUsername = `${cleanRestoName}${randomSuffix}`;
      const generatedPassword = Math.random().toString(36).slice(-8); // Random 8 karakter

      // 4. Hitung Masa Aktif (Tambah 30 Hari dari sekarang)
      const expiredAt = new Date();
      expiredAt.setMonth(expiredAt.getMonth() + 1);

      // 5. Insert ke Tabel Owners
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert({
          owner_name: ownerName,
          owner_username: `owner_${generatedUsername}`,
          owner_password: generatedPassword
        })
        .select()
        .single();

      if (ownerError) throw ownerError;

      // 6. Insert ke Tabel Restaurants (Relasi ke owner_id)
      const { error: restoError } = await supabase
        .from('restaurants')
        .insert({
          owner_id: ownerData.id,
          name: restoName,
          username: generatedUsername,
          password: generatedPassword, // Password untuk kasir masuk
          subscription_plan: 'Premium',
          transaction_limit: 5000, // Kuota 5000 struk per bulan
          expired_at: expiredAt.toISOString()
        });

      if (restoError) throw restoError;

      // 7. Panggil Fungsi Kirim Email yang sebenarnya
      await sendEmailCredentials(customerEmail, restoName, generatedUsername, generatedPassword);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ============================================================================
// FUNGSI KIRIM EMAIL DENGAN RESEND API (SUDAH FIX)
// ============================================================================
async function sendEmailCredentials(email: string, restoName: string, username: string, pass: string) {
  try {
    await resend.emails.send({
      // CATATAN: Selama testing gratis di Resend, wajib gunakan email 'onboarding@resend.dev'
      // Nanti setelah Bos verifikasi domain sendiri di Resend, ganti dengan 'hello@askara.com'
      from: 'Askara POS <onboarding@resend.dev>', 
      to: email, // Saat testing gratis di Resend, pastikan email ini adalah email yang Bos pakai daftar Resend
      subject: 'Akses Aplikasi Askara Smart POS Anda',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #FF8C00; text-align: center;">Selamat Datang di Askara Smart POS!</h2>
          <p>Halo, terima kasih telah berlangganan. Pembayaran untuk <strong>${restoName}</strong> telah berhasil kami terima.</p>
          <p>Berikut adalah detail akses untuk masuk ke Aplikasi Kasir & Dashboard Manager Anda:</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 5px 0; font-size: 16px;"><strong>Username:</strong> <span style="color: #4A00E0;">${username}</span></p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Password:</strong> <span style="color: #4A00E0;">${pass}</span></p>
          </div>
          
          <p>Masa aktif Anda berlaku selama <strong>30 Hari</strong> ke depan dengan kuota <strong>5.000 Struk Transaksi</strong>.</p>
          <p>Harap simpan informasi ini baik-baik. Download aplikasi kami di perangkat kasir Anda dan login menggunakan kredensial di atas.</p>
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