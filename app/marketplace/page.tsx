export const runtime = 'edge';

import { supabase } from '@/lib/supabaseClient'
import MarketplaceStoreClient from './MarketplaceStoreClient'

export const revalidate = 0

export default async function MarketplacePage() {
  const { data: products } = await supabase
    .from('askara_internal_catalog_items')
    .select('*')
    .eq('is_active', true) // <-- FIX: Hanya tampilkan produk yang sudah diaktifkan di Admin
    .gt('base_price', 0) 
    .order('created_at', { ascending: false })

  const { data: settings } = await supabase
    .from('askara_settings')
    .select('profit_margin, bank_name, bank_account, bank_owner')
    .eq('id', 1)
    .single()

  const serverSettings = {
    margin: settings?.profit_margin || 20,
    bankName: settings?.bank_name || 'BCA',
    bankAccount: settings?.bank_account || '0190702197',
    bankOwner: settings?.bank_owner || 'Yohanes Vianey Riki Nugroho'
  }

  return (
    <MarketplaceStoreClient 
      initialProducts={products || []} 
      serverSettings={serverSettings} 
    />
  )
}