// app/api/askara-ea/validate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. TANGKAP SEMUA DATA YANG DIKIRIM OLEH EA
    const { username, license_key, hwid } = body;

    if (!username || !license_key || !hwid) {
      return NextResponse.json({ status: 'gagal', message: 'Data Username, Lisensi, atau HWID tidak lengkap.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: 'gagal', message: 'Konfigurasi Server Kosong' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. CARI LISENSI BERDASARKAN KEY & USERNAME
    const { data: license, error } = await supabase
      .from('ea_licenses')
      .select('id, name, username, hwid, is_active')
      .eq('license_key', license_key)
      .eq('username', username)
      .maybeSingle();

    if (error || !license) {
      return NextResponse.json({ status: 'gagal', message: 'Lisensi atau Username tidak ditemukan/salah.' }, { status: 404 });
    }

    if (!license.is_active) {
      return NextResponse.json({ status: 'gagal', message: 'License Key ini sudah dibekukan/tidak aktif.' }, { status: 403 });
    }

    // 3. LOGIKA HWID LOCK (1 LISENSI = 1 PERANGKAT)
    if (!license.hwid) {
      // Jika HWID di database masih kosong, KUNCI sekarang juga!
      const { error: updateError } = await supabase
        .from('ea_licenses')
        .update({ hwid: hwid })
        .eq('id', license.id);

      if (updateError) {
         return NextResponse.json({ status: 'gagal', message: 'Gagal mengunci HWID ke Database.' }, { status: 500 });
      }
      
      // FORMAT RESPONS WAJIB "status": "success" AGAR DIKENALI EA
      return NextResponse.json({ status: 'success', message: 'Lisensi berhasil diaktivasi dan dikunci pada perangkat ini!' }, { status: 200 });
      
    } else {
      // Jika HWID sudah ada, cocokkan dengan yang dikirim EA
      if (license.hwid === hwid) {
        return NextResponse.json({ status: 'success', message: 'Otorisasi Berhasil.' }, { status: 200 });
      } else {
        return NextResponse.json({ status: 'gagal', message: 'HWID tidak cocok. Lisensi ini sudah digunakan di VPS/Perangkat lain.' }, { status: 403 });
      }
    }

  } catch (error: any) {
    console.error('Validation Error:', error);
    return NextResponse.json({ status: 'gagal', message: 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}