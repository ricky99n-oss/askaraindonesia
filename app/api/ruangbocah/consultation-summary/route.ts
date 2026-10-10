import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

function bearerToken(request: Request) {
  const value = request.headers.get('authorization') || ''
  return value.toLowerCase().startsWith('bearer ') ? value.slice(7).trim() : ''
}

export async function GET(request: Request) {
  try {
    const token = bearerToken(request)
    const sessionId = new URL(request.url).searchParams.get('sessionId')?.trim()
    if (!token || !sessionId) return NextResponse.json({ error: 'Permintaan tidak lengkap' }, { status: 400 })

    const client = createRuangBocahAdminClient()
    const { data: { user }, error: authError } = await client.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })

    const { data: session, error: sessionError } = await client
      .from('telemed_sessions')
      .select('id, doctor_id, parent_id, status, created_at')
      .eq('id', sessionId)
      .maybeSingle()
    if (sessionError) throw sessionError
    if (!session || (session.doctor_id !== user.id && session.parent_id !== user.id)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke sesi ini' }, { status: 403 })
    }

    const { data: contextRow, error: contextError } = await client
      .from('notifications')
      .select('message')
      .eq('user_id', session.doctor_id)
      .eq('type', 'consultation_context')
      .eq('title', sessionId)
      .maybeSingle()
    if (contextError) throw contextError
    if (!contextRow) return NextResponse.json({ session, child: null, growth: [], vaccines: [], nutrition: [], sleep: [] })

    let childId = ''
    try {
      childId = String((JSON.parse(contextRow.message) as { child_id?: string }).child_id || '')
    } catch {
      childId = ''
    }
    if (!childId) return NextResponse.json({ session, child: null, growth: [], vaccines: [], nutrition: [], sleep: [] })

    const [{ data: child, error: childError }, growth, vaccines, nutrition, sleep] = await Promise.all([
      client.from('children').select('id, parent_id, name, gender, birth_date').eq('id', childId).eq('parent_id', session.parent_id).maybeSingle(),
      client.from('growth_logs').select('record_date, weight_kg, height_cm, head_cm').eq('child_id', childId).order('record_date', { ascending: false }).limit(12),
      client.from('vaccine_logs').select('vaccine_name, given_date, location').eq('child_id', childId).order('given_date', { ascending: false }).limit(20),
      client.from('feeding_logs').select('log_time, feed_type, amount_ml, feed_condition, notes').eq('child_id', childId).order('log_time', { ascending: false }).limit(30),
      client.from('sleep_logs').select('sleep_date, start_time, end_time, notes').eq('child_id', childId).order('sleep_date', { ascending: false }).limit(14),
    ])
    if (childError) throw childError
    if (!child) return NextResponse.json({ error: 'Profil anak tidak ditemukan' }, { status: 404 })

    const firstError = [growth.error, vaccines.error, nutrition.error, sleep.error].find(Boolean)
    if (firstError) throw firstError
    return NextResponse.json({
      session,
      child,
      growth: growth.data ?? [],
      vaccines: vaccines.data ?? [],
      nutrition: nutrition.data ?? [],
      sleep: sleep.data ?? [],
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ringkasan konsultasi gagal dimuat' }, { status: 500 })
  }
}
