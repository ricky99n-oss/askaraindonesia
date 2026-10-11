import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'
export const POLICY_VERSION = '2026-10-11-v1'

function bearerToken(request: Request) {
  const value = request.headers.get('authorization') || ''
  return value.toLowerCase().startsWith('bearer ') ? value.slice(7).trim() : ''
}

async function authenticatedUser(request: Request) {
  const client = createRuangBocahAdminClient()
  const token = bearerToken(request)
  if (!token) return null
  const { data: { user }, error } = await client.auth.getUser(token)
  return error || !user ? null : { client, user }
}

export async function GET(request: Request) {
  const auth = await authenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 })
  const { data, error } = await auth.client
    .from('notifications')
    .select('id, title, message, created_at')
    .eq('user_id', auth.user.id)
    .eq('type', 'privacy_consent')
    .eq('title', POLICY_VERSION)
    .limit(1)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ accepted: Boolean(data), policyVersion: POLICY_VERSION, consent: data })
}

export async function POST(request: Request) {
  const auth = await authenticatedUser(request)
  if (!auth) return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 })
  const body = await request.json() as Record<string, unknown>
  if (body.accepted !== true) return NextResponse.json({ error: 'Persetujuan eksplisit diperlukan' }, { status: 400 })
  const now = new Date().toISOString()
  const message = JSON.stringify({
    accepted: true,
    accepted_at: now,
    app_version: String(body.appVersion || '').slice(0, 32),
    policy_version: POLICY_VERSION,
  })
  const { data: existing } = await auth.client
    .from('notifications')
    .select('id')
    .eq('user_id', auth.user.id)
    .eq('type', 'privacy_consent')
    .eq('title', POLICY_VERSION)
    .limit(1)
    .maybeSingle()
  const query = existing
    ? auth.client.from('notifications').update({ message, is_read: true }).eq('id', existing.id)
    : auth.client.from('notifications').insert({ user_id: auth.user.id, title: POLICY_VERSION, message, type: 'privacy_consent', is_read: true })
  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, acceptedAt: now, policyVersion: POLICY_VERSION })
}
