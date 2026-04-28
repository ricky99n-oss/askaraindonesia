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

    const textToHash = `${data.order_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (data.signature_key !== hashHex) {
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 });
    }

    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const orderId = data.order_id as String;

      // =========================================================================
      // SKENARIO 1: PEMBELIAN ADD-ON / TOPUP DARI DALAM APLIKASI
      // =========================================================================
      if (orderId.startsWith('ASKARA-TOPUP-')) {
        const tipe = data.custom_field1; // 'kuota', 'hari', atau 'paket'
        const restoId = data.custom_field2;
        const value = parseInt(data.custom_field3); // nilai tambahan (contoh: 1000 struk atau 30 hari)

        // Ambil data resto saat ini
        const { data: currentResto, error: fetchError } = await supabase
            .from('restaurants')
            .select('transaction_limit, expired_at')
            .eq('id', restoId)
            .single();

        if (fetchError) throw fetchError;

        let updatePayload: any = {};

        if (tipe === 'kuota') {
          // TAMBAH KUOTA STRUK
          updatePayload.transaction_limit = currentResto.transaction_limit + value;
        } 
        else if (tipe === 'hari') {
          // TAMBAH MASA AKTIF
          const currentExpiry = new Date(currentResto.expired_at);
          currentExpiry.setDate(currentExpiry.getDate() + value);
          updatePayload.expired_at = currentExpiry.toISOString();
        } 
        else if (tipe === 'paket') {
          // UPGRADE PAKET (Reset limit ke kuota paket baru, tambah masa aktif 30 hari)
          const newExpiry = new Date();
          newExpiry.setMonth(newExpiry.getMonth() + 1);
          
          updatePayload.transaction_limit = value; // contoh value: 5000 / 10000
          updatePayload.expired_at = newExpiry.toISOString();
        }

        // Eksekusi Update ke Supabase
        const { error: updateError } = await supabase
            .from('restaurants')
            .update(updatePayload)
            .eq('id', restoId);

        if (updateError) throw updateError;
        console.log(`TopUp Sukses untuk Resto ID: ${restoId}`);
      } 
      
      // =========================================================================
      // SKENARIO 2: PENDAFTARAN PELANGGAN BARU VIA WEBSITE
      // =========================================================================
      else if (orderId.startsWith('ASKARA-SUB-')) {
        const ownerName = data.custom_field1;
        const customerEmail = data.custom_field2;
        const secretData = JSON.parse(data.custom_field3);
        const { rn, ru, rp, ou, op, out, l } = secretData; 

        const expiredAt = new Date();
        expiredAt.setMonth(expiredAt.getMonth() + 1);

        const { data: ownerData, error: ownerError } = await supabase
          .from('owners')
          .insert({ owner_name: ownerName, owner_username: ou, owner_password: op, email: customerEmail })
          .select().single();

        if (ownerError) throw ownerError;

        const { error: restoError } = await supabase
          .from('restaurants')
          .insert({
            owner_id: ownerData.id, name: rn, username: ru, password: rp, 
            subscription_plan: 'Premium', transaction_limit: l || 5000, 
            expired_at: expiredAt.toISOString()
          });

        if (restoError) throw restoError;

        await sendEmailCredentials(customerEmail, rn, ru, rp, ou, op, out, l || 5000);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ============================================================================
// FUNGSI KIRIM EMAIL DENGAN RESEND API (TETAP SAMA SEPERTI SEBELUMNYA)
// ============================================================================
async function sendEmailCredentials(email: string, restoName: string, ru: string, rp: string, ou: string, op: string, outlet: number, limit: number) {
  try {
    let ownerHtmlBlock = '';
    if (outlet > 1) {
      ownerHtmlBlock = `
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; border: 1px solid #ffd180;">
          <h3 style="color: #FF8C00; margin-top: 0; font-size: 15px;">Dashboard Owner (Akses Web)</h3>
          <p style="margin: 5px 0; font-size: 14px; color: #555;">Gunakan akun ini untuk memantau semua outlet Anda dari Website.</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Username:</strong> <span style="color: #d84315;">${ou}</span></p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <span style="color: #d84315;">${op}</span></p>
        </div>
      `;
    }

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

          <p>Berikut adalah kredensial untuk mengakses sistem kami:</p>
          
          <div style="background-color: #f3e5f5; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; border: 1px solid #e1bee7;">
            <h3 style="color: #6a1b9a; margin-top: 0; font-size: 15px;">Aplikasi Kasir (Outlet)</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #555;">Gunakan akun ini untuk login utama di aplikasi.</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Username:</strong> <span style="color: #4A00E0; font-weight:bold;">${ru}</span></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Password:</strong> <span style="color: #4A00E0; font-weight:bold;">${rp}</span></p>
          </div>
          
          ${ownerHtmlBlock}

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
    console.log(`Email sukses dikirim ke: ${email}`);
  } catch (error) {
    console.error('Gagal mengirim email kredensial:', error);
  }
}