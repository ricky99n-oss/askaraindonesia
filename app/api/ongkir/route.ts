import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const ORIGIN_CITY = '256'; // Malang
const API_URL = 'https://api.rajaongkir.com/starter';

// Helper: Bom Waktu 3 Detik untuk mem-bypass limitasi Cloudflare Edge
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 3000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout_Server')), timeoutMs);
  });
  return Promise.race([fetch(url, options), timeoutPromise]) as Promise<Response>;
}

export async function GET() {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) return NextResponse.json({ error: 'Key Kosong' }, { status: 500 });

  try {
    const res = await fetchWithTimeout(`${API_URL}/city`, { method: 'GET', headers: { key } }, 3000);
    const data = await res.json();
    
    if (data.rajaongkir?.status?.code === 200) {
      return NextResponse.json(data.rajaongkir.results);
    }
    return NextResponse.json({ error: 'Ditolak: ' + (data.rajaongkir?.status?.description || '') }, { status: 400 });
  } catch(e: any) {
    return NextResponse.json({ error: 'Koneksi API Gagal/Timeout' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) return NextResponse.json({ error: 'Key Kosong' }, { status: 500 });

  try {
    const body = await request.json();
    const { destination, weight = 1000, courier = 'jne' } = body;
    
    const res = await fetchWithTimeout(`${API_URL}/cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'key': key },
      body: new URLSearchParams({ origin: ORIGIN_CITY, destination, weight: weight.toString(), courier }).toString()
    }, 4000);
    
    const data = await res.json();
    if (data.rajaongkir?.status?.code === 200) {
      return NextResponse.json({ costs: data.rajaongkir.results[0].costs });
    }
    return NextResponse.json({ error: 'Gagal: ' + (data.rajaongkir?.status?.description || '') }, { status: 400 });
  } catch(error: any) {
    return NextResponse.json({ error: 'Koneksi API Gagal/Timeout' }, { status: 500 });
  }
}