'use server'

import { createInternalServerClient } from '@/lib/internal/supabase/server'

export async function saveDocumentRecord(payload: any) {
  const supabase = await createInternalServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Tidak ada akses' }

  const { error } = await supabase.from('askara_internal_documents').insert([{
    ...payload,
    created_by: user.id
  }])

  if (error) return { success: false, error: error.message }
  return { success: true }
}