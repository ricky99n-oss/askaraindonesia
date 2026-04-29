// app/api/transaction/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Kunci Database belum terpasang di Cloudflare!' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await req.json();
    const { planId, customerName, customerEmail, restoName, restoPassword } = body;

    // 1. CEK HARGA ASLI KE DATABASE
    const { data: plan, error: planError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Paket tidak ditemukan di Database' }, { status: 400 });
    }

    // =======================================================================
    // 2. CEK APAKAH EMAIL SUDAH PERNAH MENCOBA MENDAFTAR SEBELUMNYA
    // =======================================================================
    const { data: existingResto } = await supabaseAdmin
      .from('restaurants')
      .select('id, auth_id')
      .eq('email', customerEmail)
      .maybeSingle();

    let restoId;

    if (existingResto) {
      // JIKA SUDAH ADA: Jangan buat user baru! 
      // Update password (jika pelanggan mengetik password baru) dan update paket.
      restoId = existingResto.id;
      
      await supabaseAdmin.auth.admin.updateUserById(existingResto.auth_id, {
        password: restoPassword
      });

      await supabaseAdmin.from('restaurants').update({
        name: restoName,
        subscription_plan: plan.name,
        transaction_limit: plan.limit_tx
      }).eq('id', restoId);

    } else {
      // JIKA BELUM ADA: Buat akun baru dari awal
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: restoPassword, 
        email_confirm: true,     
      });

      if (authError) {
        return NextResponse.json({ error: `Gagal daftar: ${authError.message}` }, { status: 400 });
      }

      const { data: newResto, error: restoError } = await supabaseAdmin.from('restaurants').insert({
        auth_id: authData.user.id,
        email: customerEmail,
        username: customerEmail, 
        password: 'ENCRYPTED_BY_SUPABASE', 
        name: restoName,
        subscription_plan: plan.name,
        transaction_limit: plan.limit_tx,
        is_active: false
      }).select('id').single();

      if (restoError || !newResto) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: `Gagal simpan profil: ${restoError.message}` }, { status: 500 });
      }
      restoId = newResto.id;
    }

    // =======================================================================
    // 3. REQUEST TOKEN MIDTRANS
    // =======================================================================
    // FIX PENTING: Tambahkan Date.now() agar Midtrans menerima percobaan ulang (retry)
    const orderId = `ASKARA-${restoId}-${Date.now()}`; 

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    if (!serverKey) {
      return NextResponse.json({ error: 'Kunci Midtrans belum disetting!' }, { status: 500 });
    }

    const midtransAuth = btoa(serverKey + ':');
    const isSandbox = serverKey.startsWith('SB-');
    const midtransUrl = isSandbox 
      ? 'https://app.sandbox.midtrans.com/snap/v1/transactions' 
      : 'https://app.midtrans.com/snap/v1/transactions';

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

    const midtransRes = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${midtransAuth}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      return NextResponse.json({ error: `Midtrans Error: ${midtransData.error_messages?.[0] || 'Transaksi ditolak'}` }, { status: 500 });
    }

    return NextResponse.json({ token: midtransData.token });

  } catch (error: any) {
    console.error('Transaction API Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi Kesalahan Sistem Internal' }, { status: 500 });
  }
}