import { NextResponse } from 'next/server'
import { createAnmAdmin, requireAnmAdmin, validateLicense } from '@/lib/anm/admin'
import { checkOrigin, ShopError } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function reply(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
function failure(error: unknown) {
  if (error instanceof ShopError) return reply({ error: error.message }, error.status)
  if (error && typeof error === 'object' && 'message' in error && error.message === 'REGISTERED_USER_NOT_FOUND') return reply({ error: 'Akun pengguna berubah atau sudah dihapus. Perbarui daftar pendaftar.' }, 404)
  const message = error instanceof Error ? error.message : ''
  if (message === 'UNAUTHORIZED') return reply({ error: 'Silakan login.' }, 401)
  if (message === 'FORBIDDEN') return reply({ error: 'Hanya admin atau owner yang dapat mengelola lisensi.' }, 403)
  if (message === 'INVALID_LICENSE' || error instanceof SyntaxError) return reply({ error: 'Data lisensi tidak valid. Periksa semua kolom.' }, 400)
  console.error('ANM admin request failed', { code: message === 'ANM_CONFIGURATION_MISSING' ? message : 'DATABASE_OPERATION_FAILED' })
  return reply({ error: 'Data belum dapat diproses. Periksa konfigurasi layanan dan migrasi ANM.' }, 503)
}
export async function GET(request: Request) {
  try {
    const { user } = await requireAnmAdmin()
    const db = createAnmAdmin()
    const params = new URL(request.url).searchParams
    const page = Math.floor(Math.max(0, Math.min(10000, Number(params.get('page')) || 0)))
    if (params.get('view') === 'users') {
      const query = (params.get('q') || '').trim()
      if (query.length > 120) return reply({ error: 'Pencarian maksimal 120 karakter.' }, 400)
      const { data, error } = await db.rpc('anm_admin_customers', { p_actor: user.id, p_page: page, p_query: query })
      if (error) throw error
      return reply(data)
    }
    const result = await db.from('anm_licenses')
      .select('id,label,customer_email,user_id,key_hint,plan,status,expires_at,max_devices,max_monitored,created_at,updated_at', { count: 'exact' })
      .order('created_at', { ascending: false }).range(page * 50, page * 50 + 49)
    if (result.error) throw result.error
    const ids = (result.data ?? []).map((l) => l.id)
    const [activations, audit, active, expired, suspended] = await Promise.all([
      ids.length ? db.from('anm_activations').select('id,license_id,user_id,device_name,revoked_at,last_seen_at,created_at').in('license_id', ids).order('last_seen_at', { ascending: false }).limit(5000) : Promise.resolve({ data: [], error: null }),
      db.from('anm_audit_logs').select('id,action,license_id,details,created_at').order('created_at', { ascending: false }).limit(50),
      db.from('anm_licenses').select('id', { head: true, count: 'exact' }).eq('status', 'active').gt('expires_at', new Date().toISOString()),
      db.from('anm_licenses').select('id', { head: true, count: 'exact' }).eq('status', 'active').lte('expires_at', new Date().toISOString()),
      db.from('anm_licenses').select('id', { head: true, count: 'exact' }).in('status', ['suspended', 'revoked']),
    ])
    for (const response of [activations, audit, active, expired, suspended]) if (response.error) throw response.error
    return reply({ licenses: result.data, total: result.count, page, activations: activations.data, audit: audit.data,
      counts: { active: active.count, expired: expired.count, suspended: suspended.count } })
  } catch (error) { return failure(error) }
}
export async function POST(request: Request) {
  try {
    const { user } = await requireAnmAdmin()
    checkOrigin(request)
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'Permintaan ditolak.' }, 403)
    const text = await request.text()
    if (text.length > 10000) return reply({ error: 'Permintaan terlalu besar.' }, 413)
    const body = JSON.parse(text) as Record<string, unknown>
    const db = createAnmAdmin()
    if (body.action === 'revoke_device') {
      if (!uuid.test(String(body.id))) throw new Error('INVALID_LICENSE')
      const { error } = await db.rpc('anm_admin_device', { p_actor: user.id, p_id: body.id })
      if (error) throw error
      return reply({ ok: true })
    }
    if (!['create', 'update'].includes(String(body.action)) || (body.action === 'update' && !uuid.test(String(body.id)))) throw new Error('INVALID_LICENSE')
    const creating = body.action === 'create'
    let recipient: string | null = null
    let canonicalEmail = ''
    if (creating) {
      if (!uuid.test(String(body.customer_id))) return reply({ error: 'Pilih pengguna terdaftar terlebih dahulu.' }, 400)
      const { data, error } = await db.auth.admin.getUserById(String(body.customer_id))
      if (error && error.status !== 404) throw error
      if (!data.user?.email || data.user.is_anonymous) return reply({ error: 'Pengguna sudah tidak tersedia. Perbarui daftar pendaftar.' }, 404)
      recipient = data.user.id
      canonicalEmail = data.user.email.trim().toLowerCase()
    }
    const values = { ...validateLicense({ ...body, customer_email: canonicalEmail }, creating), user_id: recipient }
    let key: string | null = null, hash: string | null = null
    if (creating) {
      const bytes = crypto.getRandomValues(new Uint8Array(24))
      const raw = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
      key = `ASKARA-${raw.match(/.{1,8}/g)!.join('-')}`
      hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key.replace(/[^A-Z0-9]/g, ''))))].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
    const { data, error } = await db.rpc('anm_admin_license', {
      p_actor: user.id, p_id: creating ? null : body.id, p_values: values,
      p_key_hash: hash, p_key_hint: key?.slice(-8) ?? null,
    })
    if (error) throw error
    return reply({ ok: true, id: data, key })
  } catch (error) { return failure(error) }
}
