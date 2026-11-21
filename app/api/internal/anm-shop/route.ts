import { createAnmAdmin, requireAnmAdmin } from '@/lib/anm/admin'
import { commerceReady, configureTelegram, processOrderTasks, reviewOrder, shopSettings, telegramRequest } from '@/lib/anm/commerce'
import { checkOrigin, checked, decrypt, failure, readJson, response, ShopError } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
export async function GET(request: Request) {
  try {
    await requireAnmAdmin()
    const db = createAnmAdmin(), page = Math.max(0, Math.min(10000, Math.floor(Number(new URL(request.url).searchParams.get('page')) || 0)))
    const [settings, products, orders, counts] = await Promise.all([
      shopSettings(), db.from('anm_products').select('*').order('amount_idr'),
      db.from('anm_orders').select('id,order_code,customer_name,customer_email,customer_phone,product_code,kind,amount_idr,duration_days,max_devices,max_monitored,status,license_id,license_expires_at,proof_path,rejection_reason,payment_deadline,created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(page * 50, page * 50 + 49),
      Promise.all(['reviewing', 'approved', 'rejected'].map(status => db.from('anm_orders').select('id', { count: 'exact', head: true }).eq('status', status))),
    ])
    const items = checked(orders) || [], ids = items.map(order => order.id)
    const tasks = ids.length ? checked(await db.from('anm_order_tasks').select('order_id,kind,state,last_error,attempts').in('order_id', ids)) : []
    counts.forEach(checked)
    return response({ products: checked(products), orders: items, tasks, page, total: orders.count, counts: { reviewing: counts[0].count, approved: counts[1].count, rejected: counts[2].count },
      settings: { enabled: settings.enabled, qris_path: settings.qris_path, merchant_name: settings.merchant_name, telegram_chat_id: settings.telegram_chat_id, telegram_admin_ids: settings.telegram_admin_ids, telegram_bot_username: settings.telegram_bot_username, telegram_configured: !!settings.telegram_token_ciphertext, email_configured: !!process.env.ANM_RESEND_API_KEY, encryption_configured: !!process.env.ANM_COMMERCE_ENCRYPTION_KEY, ready: commerceReady(settings) } })
  } catch (error) { return failure(error) }
}
export async function POST(request: Request) {
  try {
    const { user } = await requireAnmAdmin(); checkOrigin(request)
    const body = await readJson(request), db = createAnmAdmin()
    if (body.action === 'product') {
      const code = String(body.code), amount = Number(body.amount_idr), compare = body.compare_at_idr === '' || body.compare_at_idr == null ? null : Number(body.compare_at_idr), days = Number(body.duration_days), devices = Number(body.max_devices), hosts = Number(body.max_monitored)
      if (!['starter', 'professional', 'enterprise'].includes(code) || !Number.isSafeInteger(amount) || amount < 1000 || amount > 100000000 || (compare !== null && (!Number.isSafeInteger(compare) || compare < amount)) || !Number.isSafeInteger(days) || days < 1 || days > 3660 || !Number.isSafeInteger(devices) || devices < 1 || devices > 100 || !Number.isSafeInteger(hosts) || hosts < 1 || hosts > 4096) throw new ShopError(400, 'Harga, masa aktif, atau kuota paket tidak valid.')
      checked(await db.from('anm_products').update({ amount_idr: amount, compare_at_idr: compare, duration_days: days, max_devices: devices, max_monitored: hosts, enabled: body.enabled === true, updated_at: new Date().toISOString() }).eq('code', code))
    } else if (body.action === 'shop') {
      const settings = await shopSettings()
      if (body.enabled === true && !commerceReady({ ...settings, enabled: true })) throw new ShopError(400, 'Hubungkan Telegram dan layanan email terlebih dahulu.')
      checked(await db.from('anm_shop_settings').update({ enabled: body.enabled === true, updated_at: new Date().toISOString() }).eq('id', true))
    } else if (body.action === 'telegram') {
      const settings = await shopSettings()
      const token = String(body.token || '') || (settings.telegram_token_ciphertext ? await decrypt(settings.telegram_token_ciphertext) : '')
      const admins = String(body.admin_ids || '').split(',').map(id => id.trim()).filter(Boolean)
      const bot = await configureTelegram(token, String(body.chat_id || '').trim(), admins, user.id)
      await telegramRequest(token, 'sendMessage', { chat_id: String(body.chat_id).trim(), text: 'Bot pesanan Askara terhubung. Bukti QRIS akan masuk ke chat ini. Balas pesan bukti dengan OK untuk menyetujui atau TOLAK alasan untuk menolak.' })
      checked(await db.from('anm_audit_logs').insert({ actor_id: user.id, action: 'shop.telegram.configure', details: { username: bot.username } }))
      return response({ ok: true, username: bot.username })
    } else if (body.action === 'review' || body.action === 'retry') {
      const id = String(body.id || '')
      if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ShopError(400, 'ID pesanan tidak valid.')
      if (body.action === 'review') return response(await reviewOrder(id, user.id, body.approve === true, String(body.reason || '').slice(0, 300)))
      checked(await db.from('anm_order_tasks').update({ locked_until: null, attempts: 0 }).eq('order_id', id).eq('state', 'pending'))
      await processOrderTasks(id)
    } else throw new ShopError(400, 'Aksi tidak dikenali.')
    checked(await db.from('anm_audit_logs').insert({ actor_id: user.id, action: 'shop.' + String(body.action), details: body.action === 'product' ? { code: body.code } : {} }))
    return response({ ok: true })
  } catch (error) { return failure(error) }
}
