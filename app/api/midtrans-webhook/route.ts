// app/api/midtrans-webhook/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. VALIDASI SIGNATURE MIDTRANS DENGAN WEB CRYPTO API
    const textToHash = `${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (data.signature_key !== hashHex) {
      console.warn('HACK ATTEMPT: Signature Key tidak cocok!');
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 });
    }

    // 2. CEK STATUS TRANSAKSI JIKA LUNAS
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const orderId = data.order_id as string;

      // =========================================================================
      // SKENARIO 1: PEMBELIAN ADD-ON / TOPUP DARI DALAM APLIKASI
      // =========================================================================
      if (orderId.startsWith('ASKARA-TOPUP-')) {
        const tipe = data.custom_field1; // 'kuota', 'hari', atau 'paket'
        const restoId = data.custom_field2;
        const value = parseInt(data.custom_field3);

        const { data: currentResto, error: fetchError } = await supabase
            .from('restaurants')
            .select('transaction_limit, expired_at')
            .eq('id', restoId)
            .single();

        if (fetchError) throw fetchError;

        let updatePayload: any = {};

        if (tipe === 'kuota') {
          updatePayload.transaction_limit = currentResto.transaction_limit + value;
        } 
        else if (tipe === 'hari') {
          const currentExpiry = new Date(currentResto.expired_at);
          currentExpiry.setDate(currentExpiry.getDate() + value);
          updatePayload.expired_at = currentExpiry.toISOString();
        } 
        else if (tipe === 'paket') {
          const newExpiry = new Date();
          newExpiry.setMonth(newExpiry.getMonth() + 1);
          updatePayload.transaction_limit = value;
          updatePayload.expired_at = newExpiry.toISOString();
        }

        const { error: updateError } = await supabase
            .from('restaurants')
            .update(updatePayload)
            .eq('id', restoId);

        if (updateError) throw updateError;
        console.log(`✅ TopUp Sukses untuk Resto ID: ${restoId}`);
      } 
      
      // =========================================================================
      // SKENARIO 2: PENDAFTARAN PELANGGAN BARU VIA WEBSITE (SUPABASE AUTH)
      // =========================================================================
      // FIX SAKTI: Sinkronisasi dengan format orderId baru ('ASK-1234abcd-1714000000')
      else if (orderId.startsWith('ASK-')) {
        
        // Memecah order_id untuk mengambil 8 karakter ID resto di bagian tengah
        const orderParts = orderId.split('-');
        const shortRestoId = orderParts[1]; // Menangkap '1234abcd'

        // Hitung Masa Aktif 30 Hari
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 30);

        // FIX SAKTI: Gunakan .ilike karena kita hanya mencocokkan 8 karakter depan UUID
        const { data: updatedResto, error: updateError } = await supabase
          .from('restaurants')
          .update({ 
            is_active: true, 
            expired_at: expiredDate.toISOString(),
            current_month_transactions: 0 
          })
          .ilike('id', `${shortRestoId}%`) // <--- INI KUNCI UTAMANYA!
          .select('name, email, transaction_limit')
          .single();

        if (updateError) throw updateError;

        console.log(`✅ Pendaftaran Baru Resto (Short ID: ${shortRestoId}) berhasil diaktifkan!`);

        // Kirim Email Kredensial & Tautan Download
        if (updatedResto && updatedResto.email) {
          await sendWelcomeEmail(updatedResto.email, updatedResto.name, updatedResto.transaction_limit);
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ============================================================================
// FUNGSI KIRIM EMAIL (TIDAK ADA PERUBAHAN, SUDAH SEMPURNA)
// ============================================================================
async function sendWelcomeEmail(email: string, restoName: string, limit: number) {
  try {
    await resend.emails.send({
      from: 'Askara POS <admin@askaraindonesia.my.id>', 
      to: email, 
      subject: `Akses Aplikasi Askara Smart POS - ${restoName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4A00E0; margin-bottom: 5px;">Selamat Datang di Askara Smart POS!</h2>
            <p style="color: #555; margin-top: 0;">Pembayaran untuk <strong>${restoName}</strong> berhasil kami terima.</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://askaraindonesia.my.id/download" style="background-color: #FF8C00; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(255,140,0,0.3);">
              ↓ Download Aplikasi Sekarang
            </a>
            <p style="font-size: 12px; color: #888; margin-top: 8px;">Hanya untuk perangkat Android / Tablet POS</p>
          </div>

          <p>Sistem kami telah mengaktifkan akun Anda. Karena kami menggunakan enkripsi keamanan tingkat tinggi, password Anda dirahasiakan oleh sistem.</p>
          
          <div style="background-color: #f3e5f5; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; border: 1px solid #e1bee7;">
            <h3 style="color: #6a1b9a; margin-top: 0; font-size: 15px;">Aplikasi Kasir (Login Utama)</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #555;">Gunakan email yang Anda daftarkan untuk login ke aplikasi.</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> <span style="color: #4A00E0; font-weight:bold;">${email}</span></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <span style="color: #4A00E0; font-weight:bold;">(Gunakan Password yang Anda buat di Website)</span></p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; border: 1px solid #90caf9;">
            <h3 style="color: #0277bd; margin-top: 0; font-size: 15px;">Akun Karyawan / Manager (Dalam App)</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #555;">Gunakan akun default ini untuk mengakses menu Manager di dalam Aplikasi Kasir (Password dapat diubah nanti):</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Username:</strong> <span style="color: #0277bd; font-weight:bold;">admin</span></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <span style="color: #0277bd; font-weight:bold;">admin</span></p>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px;">Masa aktif Anda berlaku selama <strong>30 Hari</strong> ke depan dengan Kuota <strong>${limit.toLocaleString('id-ID')} Struk Transaksi</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">
            Salam hangat,<br><strong>Tim Askara Indonesia</strong><br>
            Jl. Patimura, Gg VI, 10H, Temas, Kota Batu.
          </p>
        </div>
      `
    });
    console.log(`✅ Email Kredensial sukses dikirim ke: ${email}`);
  } catch (error) {
    console.error('❌ Gagal mengirim email kredensial:', error);
  }
}