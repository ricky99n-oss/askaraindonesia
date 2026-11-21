import { createAnmAdmin } from '@/lib/anm/admin'
import { ownedOrder, processOrderTasks } from '@/lib/anm/commerce'
import { checkOrigin, checked, failure, hash, proofType, readBody, response, ShopError } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  let uploaded: string | null = null
  try {
    checkOrigin(request)
    const order = await ownedOrder(request, (await context.params).id)
    if (order.status !== 'waiting_payment' || new Date(order.payment_deadline).getTime() < Date.now()) throw new ShopError(409, 'Bukti sudah dikirim atau batas pembayaran berakhir.')
    const bytes = await readBody(request, 5 * 1024 * 1024 + 16000)
    const form = await new Request(request.url, { method: 'POST', headers: { 'Content-Type': request.headers.get('content-type') || '' }, body: bytes as BodyInit }).formData()
    const file = form.get('proof')
    if (!(file instanceof Blob) || file.size < 32 || file.size > 5 * 1024 * 1024) throw new ShopError(400, 'Unggah gambar bukti pembayaran maksimal 5 MB.')
    const content = new Uint8Array(await file.arrayBuffer()), type = proofType(content)
    uploaded = order.id + '/' + crypto.randomUUID() + '.' + type.ext
    checked(await createAnmAdmin().storage.from('anm-payment-proofs').upload(uploaded, content, { contentType: type.mime, upsert: false, cacheControl: '0' }))
    checked(await createAnmAdmin().rpc('anm_submit_order_proof', { p_id: order.id, p_access_hash: order.access_hash, p_path: uploaded, p_mime: type.mime, p_proof_hash: await hash(content) }))
    uploaded = null
    await processOrderTasks(order.id)
    return response({ ok: true, status: 'reviewing' })
  } catch (error) {
    if (uploaded) await createAnmAdmin().storage.from('anm-payment-proofs').remove([uploaded])
    return failure(error)
  }
}
