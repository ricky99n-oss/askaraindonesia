'use server'

import { createInternalServerClient } from '@/lib/internal/supabase/server'

async function getLatestVersionId(supabase: any) {
  const { data } = await supabase
    .from('askara_internal_catalog_versions')
    .select('id')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()
  return data?.id
}

export async function getAvailableCategories() {
  const supabase = await createInternalServerClient()
  const versionId = await getLatestVersionId(supabase)
  
  if (!versionId) return []

  const { data, error } = await supabase
    .from('askara_internal_catalog_items')
    .select('category')
    .eq('version_id', versionId)

  if (error || !data) return []

  // Hapus duplikat nama kategori menggunakan Set
  const uniqueCategories = Array.from(new Set(data.map(item => item.category)))
  return uniqueCategories.sort() // Urutkan sesuai abjad
}

export async function searchCatalog(searchQuery: string = '', category: string = 'Semua') {
  const supabase = await createInternalServerClient()
  const versionId = await getLatestVersionId(supabase)
  
  if (!versionId) return []

  let query = supabase
    .from('askara_internal_catalog_items')
    .select('*')
    .eq('version_id', versionId)

  if (category !== 'Semua') {
    query = query.eq('category', category)
  }

  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`)
  }

  const { data, error } = await query.limit(50).order('name')
  return error ? [] : data
}