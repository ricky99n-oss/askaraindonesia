import { createAnmAdmin } from './admin'
import { checked, decrypt, encrypt, hash, randomToken, ShopError } from './commerce-security'
import type { Order, ShopSettings } from './shop-types'
import { rupiah } from './shop-types'

export async function shopSettings() { return checked(await createAnmAdmin().from('anm_shop_settings').select('*').eq('id', true).single()) as ShopSettings }
export function commerceReady(settings: ShopSettings) { return !!(settings.enabled && settings.telegram_token_ciphertext && settings.telegram_webhook_secret_hash && settings.telegram_chat_id && settings.telegram_admin_ids.length && settings.telegram_reviewer_id && process.env.ANM_COMMERCE_ENCRYPTION_KEY && process.env.ANM_RESEND_API_KEY) }
export async function ownedOrder(request: Request, id: string) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[A-Za-z0-9_-]{40,80}$/.test(token)) throw new ShopError(404, 'Pesanan tidak ditemukan.')
  const order = checked(await createAnmAdmin().from('anm_orders').select('*').eq('id', id).eq('access_hash', await hash(token)).maybeSingle()) as Order | null
  if (!order) throw new ShopError(404, 'Pesanan tidak ditemukan.')
  return order
}
export async function publicOrder(order: Order) {
  const tasks = checked(await createAnmAdmin().from('anm_order_tasks').select('kind,state').eq('order_id', order.id)) || []
  return { id: order.id, order_code: order.order_code, customer_name: order.customer_name, customer_email: order.customer_email, product_code: order.product_code, kind: order.kind,
    amount_idr: order.amount_idr, duration_days: order.duration_days, max_devices: order.max_devices, max_monitored: order.max_monitored, status: order.status,
    proof_uploaded: !!order.proof_path, rejection_reason: order.rejection_reason, license_expires_at: order.license_expires_at, payment_deadline: order.payment_deadline, created_at: order.created_at,
    email_sent: tasks.some(task => task.kind === 'email_decision' && task.state === 'sent'), notification_sent: tasks.some(task => task.kind === 'telegram_review' && task.state === 'sent') }
}
type TelegramEnvelope<T> = { ok: boolean; result: T }
export async function telegramRequest<T>(token: string, method: string, body: Record<string, unknown> | FormData): Promise<T> {
  if (!/^\d{5,15}:[A-Za-z0-9_-]{20,100}$/.test(token)) throw new ShopError(400, 'Format token Telegram belum sesuai.')
  try {
    const multipart = body instanceof FormData
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: multipart ? undefined : { 'Content-Type': 'application/json' }, body: multipart ? body : JSON.stringify(body), signal: AbortSignal.timeout(20000) })
    const result = await response.json() as TelegramEnvelope<T>
    if (!response.ok || !result.ok) throw new Error('TELEGRAM_DELIVERY_FAILED')
    return result.result
  } catch { throw new Error('TELEGRAM_DELIVERY_FAILED') }
}
export async function configureTelegram(token: string, chat: string, admins: string[], actor: string) {
  if (!/^-?\d{4,20}$/.test(chat) || !admins.length || admins.length > 10 || admins.some(id => !/^\d{4,20}$/.test(id))) throw new ShopError(400, 'Chat ID dan ID admin Telegram belum sesuai.')
  const me = await telegramRequest<{ id: number; username: string }>(token, 'getMe', {})
  const secret = randomToken(), encrypted = await encrypt(token)
  await telegramRequest(token, 'setWebhook', { url: 'https://askaraindonesia.com/api/anm/telegram', secret_token: secret, allowed_updates: ['message', 'callback_query'], max_connections: 5 })
  checked(await createAnmAdmin().from('anm_shop_settings').update({ telegram_token_ciphertext: encrypted, telegram_webhook_secret_hash: await hash(secret), telegram_chat_id: chat, telegram_admin_ids: [...new Set(admins)], telegram_bot_id: String(me.id), telegram_bot_username: me.username, telegram_reviewer_id: actor, updated_at: new Date().toISOString() }).eq('id', true))
  return { username: me.username }
}
const html = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const date = (value: string) => new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'long', timeStyle: 'short' }) + ' WIB'
async function emailOrder(order: Order, kind: string) {
  const apiKey = process.env.ANM_RESEND_API_KEY
  if (!apiKey) throw new Error('EMAIL_CONFIGURATION_MISSING')
  const token = await decrypt(order.access_token_ciphertext)
  const orderUrl = `https://askaraindonesia.com/askaranetworkmonitoring/pesanan/${order.id}#token=${encodeURIComponent(token)}`
  let subject = `Pesanan ${order.order_code} - Askara Network Monitoring`
  let body = `Halo ${order.customer_name},\n\nPesanan ${order.order_code}\nPaket: ${order.product_code}\nJenis: ${order.kind === 'new' ? 'Lisensi baru' : 'Perpanjangan'}\nTotal: ${rupiah(order.amount_idr)}\nMasa aktif: ${order.duration_days} hari\nInstalasi: ${order.max_devices}; host: ${order.max_monitored}\n\nBayar melalui QRIS pada halaman pesanan dan unggah bukti. Admin akan memverifikasi pembayaran.\nBatas pembayaran: ${date(order.payment_deadline)}.`
  if (kind === 'email_decision') {
    if (order.status === 'approved') {
      subject = `Pembayaran disetujui - ${order.order_code}`
      body = `Halo ${order.customer_name},\n\nPembayaran ${order.order_code} telah disetujui.\nPaket: ${order.product_code}\nBerlaku sampai: ${date(order.license_expires_at!)}\nInstalasi: ${order.max_devices}; host: ${order.max_monitored}\n`
      body += order.kind === 'new' ? `\nLicense key: ${await decrypt(order.key_ciphertext!)}\n\nDaftar/masuk di aplikasi menggunakan email ${order.customer_email}, verifikasi email, lalu aktifkan key di atas.` : '\nLisensi Anda sudah diperpanjang. Gunakan akun dan license key yang sama, lalu periksa lisensi kembali di aplikasi.'
    } else if (order.status === 'rejected') { subject = `Pembayaran belum terverifikasi - ${order.order_code}`; body = `Halo ${order.customer_name},\n\nPembayaran untuk ${order.order_code} belum dapat disetujui.\nAlasan: ${order.rejection_reason}\n\nLisensi belum diterbitkan/diperpanjang. Hubungi admin Askara bila Anda sudah membayar.` }
    else throw new Error('ORDER_NOT_REVIEWED')
  }
  body += `\n\nStatus pesanan pribadi: ${orderUrl}\nJangan bagikan tautan atau license key kepada orang lain.\n\nAskara Indonesia`
  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `anm-${order.id}-${kind}` }, body: JSON.stringify({ from: `Askara Network Monitoring <${process.env.ANM_EMAIL_FROM || 'noreply@askaraindonesia.my.id'}>`, to: [order.customer_email], subject, text: body, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.7"><h2>Askara Network Monitoring</h2><div style="white-space:pre-wrap">${html(body)}</div><p><a href="${html(orderUrl)}" rel="noreferrer">Buka status pesanan pribadi</a></p></div>` }), signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new Error('EMAIL_DELIVERY_FAILED')
  } catch { throw new Error('EMAIL_DELIVERY_FAILED') }
}
async function telegramOrder(order: Order, settings: ShopSettings) {
  if (!settings.telegram_token_ciphertext || !settings.telegram_chat_id || !order.proof_path) throw new Error('TELEGRAM_CONFIGURATION_MISSING')
  const proof = checked(await createAnmAdmin().storage.from('anm-payment-proofs').download(order.proof_path))
  if (!proof) throw new Error('PAYMENT_PROOF_UNAVAILABLE')
  const payload = new FormData()
  payload.set('chat_id', settings.telegram_chat_id)
  payload.set('document', proof, 'bukti-' + order.order_code + '.' + (order.proof_mime === 'image/png' ? 'png' : order.proof_mime === 'image/webp' ? 'webp' : 'jpg'))
  payload.set('caption', `PESANAN ASKARA\n${order.order_code}\n\nNama: ${order.customer_name}\nEmail: ${order.customer_email}\nKontak: ${order.customer_phone || '-'}\nPaket: ${order.product_code} / ${order.duration_days} hari\nJenis: ${order.kind === 'new' ? 'LISENSI BARU' : 'PERPANJANGAN'}\nTotal QRIS: ${rupiah(order.amount_idr)}\nInstalasi: ${order.max_devices}; host: ${order.max_monitored}\n\nCek dana masuk pada akun merchant. Setelah sesuai, balas pesan ini: OK\nUntuk menolak: TOLAK alasan\nAtau gunakan tombol di bawah.`)
  payload.set('reply_markup', JSON.stringify({ inline_keyboard: [[{ text: 'Setujui pembayaran', callback_data: 'anm:approve:' + order.id }, { text: 'Tolak', callback_data: 'anm:reject:' + order.id }]] }))
  const result = await telegramRequest<{ message_id: number }>(await decrypt(settings.telegram_token_ciphertext), 'sendDocument', payload)
  checked(await createAnmAdmin().from('anm_orders').update({ telegram_message_id: result.message_id }).eq('id', order.id))
}
export async function processOrderTasks(orderId: string) {
  const db = createAnmAdmin()
  for (const kind of ['email_created', 'telegram_review', 'email_decision']) {
    const task = checked(await db.rpc('anm_claim_order_task', { p_order_id: orderId, p_kind: kind })) as { id: number } | null
    if (!task) continue
    try {
      const order = checked(await db.from('anm_orders').select('*').eq('id', orderId).single()) as Order
      if (kind === 'telegram_review') await telegramOrder(order, await shopSettings())
      else await emailOrder(order, kind)
      checked(await db.from('anm_order_tasks').update({ state: 'sent', sent_at: new Date().toISOString(), locked_until: null, last_error: null }).eq('id', task.id))
    } catch {
      checked(await db.from('anm_order_tasks').update({ state: 'pending', locked_until: new Date(Date.now() + 120000).toISOString(), last_error: 'Pengiriman belum berhasil; dapat dicoba ulang oleh admin.' }).eq('id', task.id))
    }
  }
}
export async function reviewOrder(id: string, actor: string, approve: boolean, reason = '') {
  const key = 'ASKARA-' + [...crypto.getRandomValues(new Uint8Array(24))].map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('').match(/.{1,8}/g)!.join('-')
  const result = checked(await createAnmAdmin().rpc('anm_review_order', { p_id: id, p_actor: actor, p_approve: approve, p_reason: reason, p_key_hash: await hash(key.replace(/[^A-Z0-9]/g, '')), p_key_hint: key.slice(-8), p_key_ciphertext: await encrypt(key) })) as { status: string; changed: boolean; order_code: string }
  await processOrderTasks(id)
  return result
}
