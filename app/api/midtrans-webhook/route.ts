// app/api/midtrans-webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. AMBIL VARIABEL CLOUDFLARE DI DALAM FUNGSI (Penting untuk Edge Runtime)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const resendKey = process.env.RESEND_API_KEY || '';

    if (!serverKey || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Kunci Cloudflare Kosong', 
        detail: 'Pastikan Server Key Midtrans dan Supabase Role terisi.' 
      }, { status: 500 });
    }

    // 2. VALIDASI KEAMANAN (SIGNATURE MIDTRANS)
    const textToHash = `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (data.signature_key !== hashHex) {
      return NextResponse.json({ 
        error: 'Signature tidak valid', 
        detail: 'Kunci Sandbox vs Production mungkin tertukar' 
      }, { status: 403 });
    }

    // 3. JIKA TRANSAKSI LUNAS
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      const orderId = data.order_id as string;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const resend = new Resend(resendKey);

      // ==========================================
      // SKENARIO 1: TOPUP (ASKARA POS)
      // ==========================================
      if (orderId.startsWith('ASKARA-TOPUP-')) {
        const tipe = data.custom_field1;
        const restoId = data.custom_field2;
        const value = parseInt(data.custom_field3);

        const { data: currentResto, error: fetchError } = await supabase
            .from('restaurants').select('transaction_limit, expired_at').eq('id', restoId).single();
            
        if (fetchError) {
            return NextResponse.json({ error: 'Gagal ambil data resto POS', detail: fetchError.message }, { status: 500 });
        }

        let updatePayload: any = {};
        if (tipe === 'kuota') updatePayload.transaction_limit = currentResto.transaction_limit + value;
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

        const { error: updateError } = await supabase.from('restaurants').update(updatePayload).eq('id', restoId);
        if (updateError) {
             return NextResponse.json({ error: 'Gagal update data resto POS', detail: updateError.message }, { status: 500 });
        }
      } 
      
      // ==========================================
      // SKENARIO 2: DAFTAR BARU (ASKARA POS)
      // ==========================================
      else if (orderId.startsWith('ASK-')) {
        const fullRestoId = data.custom_field1; 

        if (!fullRestoId) {
           return NextResponse.json({ error: 'ID Resto (custom_field1) kosong dari Midtrans' }, { status: 400 });
        }

        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + 30);

        const { data: updatedResto, error: updateError } = await supabase
          .from('restaurants')
          .update({ 
            is_active: true, 
            expired_at: expiredDate.toISOString(),
            current_month_transactions: 0 
          })
          .eq('id', fullRestoId) 
          .select('name, email, transaction_limit')
          .single();

        if (updateError) {
            return NextResponse.json({ error: 'Gagal aktivasi resto baru POS', detail: updateError.message }, { status: 500 });
        }

        if (updatedResto && updatedResto.email && resendKey) {
          await sendWelcomeEmail(resend, updatedResto.email, updatedResto.name, updatedResto.transaction_limit);
        }
      }

      // ==========================================
      // SKENARIO 3: PEMBELIAN EA (ASKARA AI EXTREME)
      // ==========================================
      else if (orderId.startsWith('ASKARA-EA-')) {
        
        const buyerUsername = data.custom_field1 || 'Trader';
        const buyerEmail = data.custom_field2;
        const buyerName = data.custom_field3 || 'Member Askara';

        // Mencegah duplicate insert jika webhook terpanggil 2 kali
        const { data: existingLicense } = await supabase
          .from('ea_licenses')
          .select('id')
          .eq('order_id', orderId)
          .maybeSingle();

        if (existingLicense) {
           return NextResponse.json({ status: 'already_processed' }, { status: 200 });
        }

        // Generate License 12 Digit
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newLicenseKey = '';
        for (let i = 0; i < 12; i++) {
            newLicenseKey += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Gunakan INSERT (bukan Upsert) agar aman dari constraint error
        const { error: insertError } = await supabase
          .from('ea_licenses')
          .insert([{ 
            order_id: orderId,
            name: buyerName,
            username: buyerUsername,
            email: buyerEmail,
            is_active: true, 
            payment_status: 'paid',
            license_key: newLicenseKey 
          }]);

        if (insertError) {
           console.error('Insert EA License Error:', insertError);
           return NextResponse.json({ error: 'Gagal Simpan ke Database', detail: insertError.message }, { status: 500 });
        }

        // Kirim Email
        if (buyerEmail && resendKey) {
          await sendEALicenseEmail(resend, buyerEmail, buyerName, buyerUsername, newLicenseKey);
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fatal Webhook Error', detail: error.message }, { status: 500 });
  }
}

// ==========================================
// FUNGSI EMAIL 1: ASKARA POS
// ==========================================
async function sendWelcomeEmail(resend: Resend, email: string, restoName: string, limit: number) {
  try {
    const { error } = await resend.emails.send({
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

    if (error) {
      console.error('❌ GAGAL MENGIRIM EMAIL POS (Resend API Error):', error);
    }
  } catch (error) {
    console.error('❌ GAGAL MENGIRIM EMAIL POS (Execution Error):', error);
  }
}

// ==========================================
// FUNGSI EMAIL 2: ASKARA AI EXTREME (EA)
// ==========================================
async function sendEALicenseEmail(resend: Resend, email: string, name: string, username: string, licenseKey: string) {
  try {
    const { error } = await resend.emails.send({
      from: 'Askara AI Extreme <admin@askaraindonesia.my.id>', 
      to: email, 
      subject: `🚨 [RAHASIA] License Key Askara AI Extreme Anda`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #0f172a; color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #38bdf8; margin-bottom: 5px;">Lisensi EA Berhasil Dibuat!</h2>
            <p style="color: #94a3b8; margin-top: 0;">Halo ${name}, selamat datang di ekosistem Askara AI.</p>
          </div>
          
          <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin-top: 15px; text-align: center; border: 1px solid #334155;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #94a3b8;">Berikut adalah data login untuk mengaktifkan EA di MetaTrader 5:</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Username:</strong> <span style="color: #38bdf8; font-weight:bold;">${username}</span></p>
            <p style="margin: 15px 0 5px 0; font-size: 14px;"><strong>License Key Anda:</strong></p>
            <div style="background-color: #020617; padding: 15px; border-radius: 6px; border: 1px dashed #38bdf8; font-family: monospace; font-size: 24px; color: #38bdf8; letter-spacing: 2px;">
              ${licenseKey}
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #facc15;">⚠️ PENTING: Simpan key ini baik-baik. Lisensi akan otomatis terkunci pada PC/VPS pertama tempat EA dipasang (HWID Locked).</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://askaraindonesia.my.id/askara-ai-extreme/download" style="background-color: #2563eb; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Buka Halaman Download & Panduan
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Butuh bantuan instalasi? Hubungi tim kami di Telegram: @askara_ai<br>
            <strong>Tim Askara Indonesia</strong>
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ GAGAL MENGIRIM EMAIL EA (Resend API Error):', error);
    }
  } catch (error) {
    console.error('❌ GAGAL MENGIRIM EMAIL EA (Execution Error):', error);
  }
}