import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

const professionalRoles = new Set([
  'doctor',
  'nutritionist',
  'psychologist',
  'consultant',
  'expert',
])

export async function PATCH(request: Request) {
  try {
    const authorization = request.headers.get('authorization') || ''
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : ''
    if (!token) {
      return NextResponse.json({ error: 'Sesi login tidak ditemukan' }, { status: 401 })
    }

    const body = await request.json()
    if (typeof body.isOnline !== 'boolean') {
      return NextResponse.json({ error: 'Status online tidak valid' }, { status: 400 })
    }

    const client = createRuangBocahAdminClient()
    const { data: authData, error: authError } = await client.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sesi login sudah tidak berlaku' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()
    if (profileError || !professionalRoles.has(profile?.role)) {
      return NextResponse.json({ error: 'Akun bukan dokter atau konsultan' }, { status: 403 })
    }

    const { error: updateError } = await client
      .from('doctor_profiles')
      .update({ is_online: body.isOnline, updated_at: new Date().toISOString() })
      .eq('id', authData.user.id)
    if (updateError) throw updateError

    return NextResponse.json({ success: true, isOnline: body.isOnline })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Status praktik gagal diperbarui'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
