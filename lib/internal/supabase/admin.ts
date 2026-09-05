import { createClient } from '@supabase/supabase-js'

// Client ini memiliki HAK PENUH (Service Role) dan mengabaikan RLS.
// Hanya digunakan di dalam Route Handler (API) yang diproteksi.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}