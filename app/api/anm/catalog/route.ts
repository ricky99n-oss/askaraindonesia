import { createAnmAdmin } from '@/lib/anm/admin'
import { commerceReady, shopSettings } from '@/lib/anm/commerce'
import { checked, failure, response } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
export async function GET() {
  try {
    const [settings, products] = await Promise.all([shopSettings(), createAnmAdmin().from('anm_products').select('code,label,amount_idr,compare_at_idr,duration_days,max_devices,max_monitored,enabled').eq('enabled', true).order('amount_idr')])
    return response({ products: checked(products), checkout_enabled: commerceReady(settings), merchant_name: settings.merchant_name, qris_path: settings.qris_path })
  } catch (error) { return failure(error) }
}
