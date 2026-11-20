import { NextResponse } from 'next/server'
import { createAnmAdmin, requireAnmAdmin, validateLicense } from '@/lib/anm/admin'
export const runtime = 'edge'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function reply(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
function failure(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'UNAUTHORIZED') return reply({ error: 'Silakan login.' }, 401)
  if (message === 'FORBIDDEN') return reply({ error: 'Hanya admin atau owner yang dapat mengelola lisensi.' }, 403)
  if (message === 'INVALID_LICENSE' || error instanceof SyntaxError) return reply({ error: 'Data lisensi tidak valid. Periksa semua kolom.' }, 400)
  console.error('ANM admin request failed', { code: message === 'ANM_CONFIGURATION_MISSING' ? message : 'DATABASE_OPERATION_FAILED' })
  return reply({ error: 'Data belum dapat diproses. Periksa konfigurasi layanan dan migrasi ANM.' }, 503)
}
export async function GET(request: Request) {
  try {
    await requireAnmAdmin()
    const db = createAnmAdmin()
    const page = Math.max(0, Math.min(10000, Number(new URL(request.url).searchParams.get('page')) || 0))
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
    const origin = request.headers.get('origin')
    if (origin !== new URL(request.url).origin || !request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'Permintaan ditolak.' }, 403)
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
    const values = validateLicense(body, creating)
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
