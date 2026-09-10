// app/api/webhook/ipaymu/route.ts
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST(req: Request) {
  try {
    // iPaymu mengirim notifikasi dalam bentuk Form Data
    const formData = await req.formData();
    const trx_id = formData.get('trx_id');
    const status = formData.get('status');
    const status_code = formData.get('status_code');
    const reference_id = formData.get('reference_id');

    // Status code iPaymu: 
    // 1 = Berhasil, 0 = Pending, -2 = Gagal/Expired
    if (status_code === '1' || status === 'berhasil') {
      // TODO: Update status pesanan di database Anda (Supabase/Prisma) menjadi 'PAID'
      console.log(`Pesanan ${reference_id} BERHASIL dibayar! TrxID: ${trx_id}`);
    } else if (status_code === '-2' || status === 'expired') {
      // TODO: Batalkan pesanan di database
      console.log(`Pesanan ${reference_id} EXPIRED/GAGAL.`);
    }

    // Selalu balas HTTP 200 agar iPaymu tidak mengirim ulang notifikasi (retry)
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}