'use server'

import { createInternalServerClient } from '@/lib/internal/supabase/server'

export async function getSyncHistory() {
  const supabase = await createInternalServerClient()
  
  const { data } = await supabase
    .from('askara_internal_catalog_versions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10)
    
  return data || []
}

export async function triggerManualSync(baseUrl: string) {
  try {
    // Memanggil API cron yang sudah kita buat sebelumnya menggunakan secret server
    const res = await fetch(`${baseUrl}/api/internal/cron/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_CRON_SECRET}`
      },
      cache: 'no-store'
    })
    
    const data = await res.json()
    return data
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}