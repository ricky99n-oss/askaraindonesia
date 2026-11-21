import { createAnmAdmin } from '@/lib/anm/admin'
import { commerceReady, processOrderTasks, shopSettings } from '@/lib/anm/commerce'
import { checkOrigin, checked, encrypt, failure, hash, randomToken, readJson, response, ShopError } from '@/lib/anm/commerce-security'
import type { Order } from '@/lib/anm/shop-types'
export const runtime = 'edge'
export async function POST(request: Request) {
  try {
    checkOrigin(request)
    if (!commerceReady(await shopSettings())) throw new ShopError(503, 'Pembelian sedang disiapkan. Silakan hubungi admin Askara.')
    const body = await readJson(request)
    const name = String(body.name || '').trim(), email = String(body.email || '').trim().toLowerCase(), phone = String(body.phone || '').trim()
    if (!name || name.length > 120 || /[\x00-\x1f\x7f]/.test(name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^[+0-9 ()-]{0,30}$/.test(phone) || !['new', 'renew'].includes(String(body.kind))) throw new ShopError(400, 'Periksa nama, email, dan nomor kontak pesanan.')
    if (body.website) throw new ShopError(400, 'Permintaan tidak diizinkan.')
    const values: Record<string, string> = { name, email, phone, kind: String(body.kind), product: String(body.product || '') }
    if (body.kind === 'renew') {
      const key = String(body.license_key || '').trim().toUpperCase()
      if (key.length < 12 || key.length > 100) throw new ShopError(400, 'Masukkan license key yang ingin diperpanjang.')
      values.license_hash = await hash(key.replace(/[^A-Z0-9]/g, ''))
    }
    const access = randomToken()
    const ip = request.headers.get('cf-connecting-ip') || 'unknown'
    const order = checked(await createAnmAdmin().rpc('anm_checkout_order', { p_values: values, p_access_hash: await hash(access), p_access_ciphertext: await encrypt(access), p_ip_hash: await hash(process.env.ANM_COMMERCE_ENCRYPTION_KEY + ':' + ip) })) as Order
    await processOrderTasks(order.id)
    return response({ id: order.id, access_token: access, order_code: order.order_code }, 201)
  } catch (error) { return failure(error) }
}
