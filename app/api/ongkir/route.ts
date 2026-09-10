import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // WAJIB AGAR CLOUDFLARE TIDAK MENG-CACHE API INI

const ORIGIN_CITY = '256'; // Malang

const ENDPOINTS = [
  'https://api.rajaongkir.com/starter',
  'https://pro.rajaongkir.com/api',
  'https://api.rajaongkir.com/basic'
];

export async function GET() {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) return NextResponse.json({ error: 'API Key Ongkir belum disetting.' }, { status: 500 });

  let lastError = '';
  for (const baseUrl of ENDPOINTS) {
    try {
      const res = await fetch(`${baseUrl}/city`, { method: 'GET', headers: { key } });
      const data = await res.json();
      if (data.rajaongkir?.status?.code === 200) {
        return NextResponse.json(data.rajaongkir.results);
      }
      lastError = data.rajaongkir?.status?.description || 'Ditolak server';
    } catch(e: any) {
      lastError = e.message;
    }
  }
  return NextResponse.json({ error: lastError }, { status: 400 });
}

export async function POST(request: Request) {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) return NextResponse.json({ error: 'API Key Ongkir belum disetting.' }, { status: 500 });

  try {
    const body = await request.json();
    const { destination, weight = 1000, courier = 'jne' } = body;
    let lastError = '';

    for (const baseUrl of ENDPOINTS) {
      try {
        const res = await fetch(`${baseUrl}/cost`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'key': key },
          body: new URLSearchParams({ origin: ORIGIN_CITY, destination, weight: weight.toString(), courier }).toString()
        });
        const data = await res.json();
        
        if (data.rajaongkir?.status?.code === 200) {
          return NextResponse.json({ costs: data.rajaongkir.results[0].costs });
        }
        lastError = data.rajaongkir?.status?.description || 'Ditolak server';
      } catch(e: any) {
        lastError = e.message;
      }
    }
    return NextResponse.json({ error: lastError }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Format error' }, { status: 500 });
  }
}