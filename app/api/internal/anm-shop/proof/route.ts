import { createAnmAdmin, requireAnmAdmin } from '@/lib/anm/admin'
import { checked, failure, response, ShopError } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
export async function GET(request: Request) {
  try {
    await requireAnmAdmin()
    const id = new URL(request.url).searchParams.get('id') || ''
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ShopError(404, 'Bukti tidak ditemukan.')
    const db = createAnmAdmin(), order = checked(await db.from('anm_orders').select('proof_path').eq('id', id).maybeSingle())
    if (!order?.proof_path) throw new ShopError(404, 'Bukti tidak ditemukan.')
    const link = checked(await db.storage.from('anm-payment-proofs').createSignedUrl(order.proof_path, 60))
    if (!link) throw new ShopError(404, 'Bukti tidak ditemukan.')
    if (new URL(request.url).searchParams.get('redirect') === '1') return new Response(null, { status: 303, headers: { Location: link.signedUrl, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
    return response({ url: link.signedUrl })
  } catch (error) { return failure(error) }
}
