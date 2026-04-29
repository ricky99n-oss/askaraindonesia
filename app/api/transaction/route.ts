// app/api/transaction/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. TAMBAHKAN INI AGAR CLOUDFLARE TIDAK ERROR (Wajib untuk API di Cloudflare Pages)
export const runtime = 'edge';

// KUNCI MASTER: Hanya boleh dipanggil di backend (server)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, customerName, customerEmail, restoName, restoPassword } = body;

    // 1. CEK HARGA ASLI KE DATABASE (SECURITY PATCH)
    const { data: plan, error: planError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 });
    }

    // 2. BUAT AKUN DI SUPABASE AUTH
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: customerEmail,
      password: restoPassword, 
      email_confirm: true,     
    });

    if (authError) {
      return NextResponse.json({ error: 'Email ini sudah terdaftar. Gunakan email lain.' }, { status: 400 });
    }

    const authId = authData.user.id;

    // 3. SIMPAN KE TABEL RESTO (STATUS: BELUM AKTIF)
    const { data: newResto, error: restoError } = await supabaseAdmin.from('restaurants').insert({
      auth_id: authId,
      email: customerEmail,
      username: customerEmail, 
      password: 'ENCRYPTED_BY_SUPABASE', 
      name: restoName,
      subscription_plan: plan.name,
      transaction_limit: plan.limit_tx,
      is_active: false // PENTING: Jangan aktifkan dulu sebelum dibayar!
    }).select('id').single();

    if (restoError || !newResto) {
      // Rollback Auth jika insert gagal
      await supabaseAdmin.auth.admin.deleteUser(authId);
      return NextResponse.json({ error: 'Gagal membuat profil resto' }, { status: 500 });
    }

    const orderId = `ASKARA-${newResto.id}`;

    // 4. REQUEST TOKEN MIDTRANS (Menggunakan harga asli dari DB)
    // FIX EDGE RUNTIME: Gunakan btoa() pengganti Buffer.from()
    const midtransAuth = btoa(process.env.MIDTRANS_SERVER_KEY + ':');
    
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: plan.price 
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail
      },
      item_details: [{
        id: plan.id,
        price: plan.price,
        quantity: 1,
        name: `Langganan: ${plan.name} Askara POS`
      }]
    };

    const midtransRes = await fetch(
      process.env.NODE_ENV === 'production' 
        ? 'https://app.midtrans.com/snap/v1/transactions' 
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions', 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${midtransAuth}`
        },
        body: JSON.stringify(midtransPayload)
      }
    );

    const midtransData = await midtransRes.json();
    return NextResponse.json({ token: midtransData.token });

  } catch (error) {
    console.error('Transaction API Error:', error);
    return NextResponse.json({ error: 'Terjadi Kesalahan Sistem' }, { status: 500 });
  }
}