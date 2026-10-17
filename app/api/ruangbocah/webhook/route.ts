import { NextResponse } from 'next/server';
import { verifyIpaymuCallback } from '@/lib/ipaymu/callback';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const callback = await verifyIpaymuCallback(req);
    if (!callback.valid) {
      return NextResponse.json({ error: 'Invalid callback signature' }, { status: 401 });
    }

    const statusCode = callback.payload.status_code;
    const status = callback.payload.status;
    const referenceId = String(callback.payload.reference_id ?? '');
    const appSupabaseUrl = process.env.RUANG_BOCAH_SUPABASE_URL || '';
    const appSupabaseKey = process.env.RUANG_BOCAH_SUPABASE_SERVICE_KEY || '';

    if (!appSupabaseUrl || !appSupabaseKey) {
      console.error('Konfigurasi Supabase Ruang Bocah tidak lengkap');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap' }, { status: 500 });
    }

    if ((statusCode === 1 || statusCode === '1' || String(status).toLowerCase() === 'berhasil') && referenceId.startsWith('RB-PREM-')) {
      const uid = referenceId.replace('RB-PREM-', '');
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const rpcResponse = await fetch(`${appSupabaseUrl}/rest/v1/rpc/perpanjang_langganan`, {
        method: 'POST',
        headers: {
          apikey: appSupabaseKey,
          Authorization: `Bearer ${appSupabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_user_id: uid,
          p_valid_until: validUntil.toISOString(),
          p_koin_bonus: 50,
        }),
      });

      if (!rpcResponse.ok) {
        console.error('Gagal sinkronisasi callback Ruang Bocah', rpcResponse.status);
        return NextResponse.json({ error: 'Gagal sinkronisasi database' }, { status: 500 });
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
