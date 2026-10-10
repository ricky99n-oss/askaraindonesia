import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

const MAX_DEVICES = 3

function bearerToken(request: Request) {
  const value = request.headers.get('authorization') || ''
  return value.toLowerCase().startsWith('bearer ') ? value.slice(7).trim() : ''
}

async function authenticatedUser(request: Request) {
  const token = bearerToken(request)
  if (!token) return null
  const client = createRuangBocahAdminClient()
  const { data: { user }, error } = await client.auth.getUser(token)
  if (error || !user) return null
  return { client, user }
}

function requiredDeviceId(value: unknown) {
  const id = String(value ?? '').trim()
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(id)) return null
  return id
}

export async function POST(request: Request) {
  try {
    const auth = await authenticatedUser(request)
    if (!auth) return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })
    const body = await request.json() as Record<string, unknown>
    const deviceId = requiredDeviceId(body.deviceId)
    if (!deviceId) return NextResponse.json({ error: 'Identitas perangkat tidak valid' }, { status: 400 })

    const { data: sessions, error } = await auth.client
      .from('notifications')
      .select('id, title, message, created_at')
      .eq('user_id', auth.user.id)
      .eq('type', 'device_session')
      .order('created_at', { ascending: true })
    if (error) throw error

    const existing = (sessions ?? []).find((session) => session.title === deviceId)
    const now = new Date().toISOString()
    const details = JSON.stringify({
      device_name: String(body.deviceName || 'Perangkat Android').slice(0, 80),
      platform: String(body.platform || 'android').slice(0, 24),
      last_seen_at: now,
    })

    if (existing) {
      const { error: updateError } = await auth.client
        .from('notifications')
        .update({ message: details, is_read: false })
        .eq('id', existing.id)
      if (updateError) throw updateError
      return NextResponse.json({ success: true, activeDevices: sessions?.length ?? 1, maxDevices: MAX_DEVICES })
    }

    if ((sessions?.length ?? 0) >= MAX_DEVICES) {
      return NextResponse.json({
        error: `Akun ini sudah aktif di ${MAX_DEVICES} perangkat. Keluar dari salah satu perangkat atau hubungi admin.`,
        code: 'DEVICE_LIMIT_REACHED',
        activeDevices: sessions?.length ?? MAX_DEVICES,
        maxDevices: MAX_DEVICES,
      }, { status: 409 })
    }

    const { error: insertError } = await auth.client.from('notifications').insert({
      user_id: auth.user.id,
      title: deviceId,
      message: details,
      type: 'device_session',
      is_read: false,
    })
    if (insertError) throw insertError
    return NextResponse.json({ success: true, activeDevices: (sessions?.length ?? 0) + 1, maxDevices: MAX_DEVICES })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Registrasi perangkat gagal' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticatedUser(request)
    if (!auth) return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })
    const body = await request.json() as Record<string, unknown>
    const deviceId = requiredDeviceId(body.deviceId)
    if (!deviceId) return NextResponse.json({ error: 'Identitas perangkat tidak valid' }, { status: 400 })
    const { error } = await auth.client
      .from('notifications')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('type', 'device_session')
      .eq('title', deviceId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Perangkat belum dapat dilepas' }, { status: 500 })
  }
}
