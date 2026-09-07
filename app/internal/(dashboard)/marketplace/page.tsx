import { supabase } from '@/lib/supabaseClient'
import MarketplaceClient from './MarketplaceClient'

export const dynamic = 'force-dynamic'

export default async function MarketplaceDashboard() {
  const { data: products } = await supabase
    .from('askara_internal_catalog_items')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: settings } = await supabase
    .from('askara_settings')
    .select('profit_margin')
    .eq('id', 1)
    .single()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Katalog & Marketplace</h1>
      <MarketplaceClient 
        initialProducts={products || []} 
        margin={settings?.profit_margin || 0} 
      />
    </div>
  )
}