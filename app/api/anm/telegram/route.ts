import { createAnmAdmin } from '@/lib/anm/admin'
import { reviewOrder, shopSettings, telegramRequest } from '@/lib/anm/commerce'
import { checked, decrypt, hash, readBody, response } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
type Person = { id: number }
type Message = { message_id: number; text?: string; caption?: string; from?: Person; chat: { id: number }; reply_to_message?: Message }
type Callback = { id: string; data?: string; from: Person; message?: Message }
export async function POST(request: Request) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token') || ''
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(secret)) return response({ error: 'Forbidden' }, 403)
  try {
    const settings = await shopSettings()
    if (!settings.telegram_webhook_secret_hash || await hash(secret) !== settings.telegram_webhook_secret_hash) return response({ error: 'Forbidden' }, 403)
    const update = JSON.parse(new TextDecoder().decode(await readBody(request, 64000))) as { message?: Message; callback_query?: Callback }
    const callback = update.callback_query, message = callback?.message || update.message, sender = callback?.from || update.message?.from
    if (!message || !sender || String(message.chat.id) !== settings.telegram_chat_id || !settings.telegram_admin_ids.includes(String(sender.id))) return response({ ok: true, ignored: true })
    if (!settings.telegram_token_ciphertext || !settings.telegram_reviewer_id) return response({ ok: false }, 503)
    const token = await decrypt(settings.telegram_token_ciphertext)
    let id: string | undefined, approve = false, reason = ''
    if (callback) {
      const match = /^anm:(approve|reject):([0-9a-f-]{36})$/i.exec(callback.data || '')
      if (!match || String(message.from?.id) !== settings.telegram_bot_id) return response({ ok: true, ignored: true })
      approve = match[1] === 'approve'; id = match[2]
      reason = 'Pembayaran belum dapat diverifikasi oleh admin.'
      await telegramRequest(token, 'answerCallbackQuery', { callback_query_id: callback.id, text: 'Memproses keputusan...' })
    } else {
      const text = (message.text || '').trim(), reply = message.reply_to_message
      const decision = /^(OK|TOLAK|BELUM)(?:\s+([\s\S]{1,300}))?$/i.exec(text)
      if (!reply || !decision || String(reply.from?.id) !== settings.telegram_bot_id) {
        await telegramRequest(token, 'sendMessage', { chat_id: settings.telegram_chat_id, text: 'Bot Askara siap. Untuk memverifikasi pesanan, balas pesan bukti pembayaran dengan OK atau TOLAK diikuti alasan.' })
        return response({ ok: true })
      }
      const code = /ANM-\d{8}-[A-F0-9]{10}/.exec(reply.caption || reply.text || '')?.[0]
      const query = createAnmAdmin().from('anm_orders').select('id')
      const row = checked(await (code ? query.eq('order_code', code) : query.eq('telegram_message_id', reply.message_id)).maybeSingle())
      id = row?.id; approve = decision[1].toUpperCase() === 'OK'; reason = decision[2] || 'Pembayaran belum dapat diverifikasi oleh admin.'
    }
    if (!id) return response({ ok: true, ignored: true })
    const decision = await reviewOrder(id, settings.telegram_reviewer_id, approve, reason)
    const task = checked(await createAnmAdmin().from('anm_order_tasks').select('state').eq('order_id', id).eq('kind', 'email_decision').maybeSingle())
    await telegramRequest(token, 'sendMessage', { chat_id: settings.telegram_chat_id, reply_to_message_id: message.message_id, text: `${decision.order_code}: ${decision.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}. ${decision.changed ? 'Keputusan disimpan.' : 'Pesanan ini sudah diproses sebelumnya.'}\n${task?.state === 'sent' ? 'Email hasil pesanan sudah dikirim kepada pembeli.' : 'Pengiriman email tertunda. Gunakan Coba kirim ulang pada dashboard Pesanan ANM.'}` })
    return response({ ok: true })
  } catch { return response({ ok: false, error: 'Processing unavailable' }, 503) }
}
