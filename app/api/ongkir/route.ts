// app/api/ongkir/route.ts
import { NextResponse } from 'next/server';

// Wajib untuk Cloudflare Pages
export const runtime = 'edge';

// API Key RajaOngkir diambil dari .env.local
const RAJAONGKIR_KEY = process.env.RAJAONGKIR_API_KEY || '';
// Asumsi origin pengiriman dari Kota Malang (ID RajaOngkir: 256)
const ORIGIN_CITY = '256'; 
// Gunakan 'starter' untuk akun gratis, ubah ke 'pro' atau 'basic' jika Anda upgrade
const API_URL = 'https://api.rajaongkir.com/starter';

// GET: Mengambil daftar Provinsi & Kota untuk Dropdown
export async function GET() {
  if (!RAJAONGKIR_KEY) {
    return NextResponse.json({ error: 'RajaOngkir API Key belum disetting di .env.local' }, { status: 500 });
  }

  try {
    const response = await fetch(`${API_URL}/city`, {
      method: 'GET',
      headers: { key: RAJAONGKIR_KEY },
    });
    
    const data = await response.json();
    
    if (data.rajaongkir.status.code === 200) {
      return NextResponse.json(data.rajaongkir.results);
    } else {
      return NextResponse.json({ error: data.rajaongkir.status.description }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data kota', detail: error.message }, { status: 500 });
  }
}

// POST: Menghitung Biaya Ongkir
export async function POST(request: Request) {
  if (!RAJAONGKIR_KEY) {
    return NextResponse.json({ error: 'RajaOngkir API Key belum disetting' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { destination, weight = 1000, courier = 'jne' } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Kota tujuan harus diisi' }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'key': RAJAONGKIR_KEY
      },
      // API RajaOngkir membutuhkan format URL Encoded, bukan JSON murni
      body: new URLSearchParams({
        origin: ORIGIN_CITY,
        destination: destination,
        weight: weight.toString(),
        courier: courier
      }).toString()
    });

    const data = await response.json();

    if (data.rajaongkir.status.code === 200) {
      return NextResponse.json({ costs: data.rajaongkir.results[0].costs });
    } else {
      return NextResponse.json({ error: data.rajaongkir.status.description }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghitung ongkir', detail: error.message }, { status: 500 });
  }
}