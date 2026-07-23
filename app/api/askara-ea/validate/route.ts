import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { license_key } = await request.json();

    if (!license_key) {
      return NextResponse.json({ error: 'License Key wajib diisi.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Konfigurasi Server Kosong' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cari lisensi di database
    const { data, error } = await supabase
      .from('ea_licenses')
      .select('id, name, username, is_active')
      .eq('license_key', license_key)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'License Key tidak ditemukan atau salah.' }, { status: 404 });
    }

    if (!data.is_active) {
      return NextResponse.json({ error: 'License Key ini sudah dibekukan/tidak aktif.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, user: data }, { status: 200 });

  } catch (error: any) {
    console.error('Validation Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}