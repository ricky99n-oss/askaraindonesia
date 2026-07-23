export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { username, license_key, hwid } = await req.json();

    if (!username || !license_key || !hwid) {
      return NextResponse.json({ status: 'error', message: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Cek DB apakah lisensi ada dan aktif
    const { data: license, error } = await supabase
      .from('ea_licenses')
      .select('*')
      .eq('username', username)
      .eq('license_key', license_key)
      .eq('is_active', true)
      .single();

    if (error || !license) {
      return NextResponse.json({ status: 'error', message: 'Username atau License Key tidak valid!' }, { status: 401 });
    }

    // 2. Kunci Hardware ID (HWID Binding)
    if (license.hwid === null) {
      // Jika ini instalasi pertama, kunci HWID ini ke database
      const { error: updateError } = await supabase
        .from('ea_licenses')
        .update({ hwid: hwid })
        .eq('id', license.id);
        
      if (updateError) throw updateError;
        
      return NextResponse.json({ status: 'success', message: 'Lisensi berhasil diaktivasi pada perangkat ini.' });
    } else {
      // 3. Jika sudah pernah diaktivasi, pastikan HWID-nya cocok
      if (license.hwid !== hwid) {
        return NextResponse.json({ status: 'error', message: 'Lisensi ini sudah digunakan di perangkat lain (HWID Mismatch)!' }, { status: 403 });
      }
    }

    // Lolos semua verifikasi
    return NextResponse.json({ status: 'success', message: 'Lisensi Valid.' });

  } catch (error: any) {
    console.error("Validate API Error:", error.message);
    return NextResponse.json({ status: 'error', message: 'Server Error' }, { status: 500 });
  }
}