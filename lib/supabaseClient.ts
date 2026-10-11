import { createClient } from '@supabase/supabase-js';

// Wajib pakai NEXT_PUBLIC_ agar bisa dibaca oleh komponen sisi Client ('use client')
// Placeholder hanya mencegah proses prerender/build gagal. Pada browser produksi,
// Cloudflare memasukkan nilai NEXT_PUBLIC_* yang sebenarnya saat build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
