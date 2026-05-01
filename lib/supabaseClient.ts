import { createClient } from '@supabase/supabase-js';

// Wajib pakai NEXT_PUBLIC_ agar bisa dibaca oleh komponen sisi Client ('use client')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);