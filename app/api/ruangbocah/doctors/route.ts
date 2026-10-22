import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

const professionalRoles = new Set(['doctor', 'nutritionist', 'psychologist', 'consultant', 'expert'])

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization') ?? ''
    const token = authorization.replace(/^Bearer\s+/i, '').trim()
    if (!token) return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })

    const admin = createRuangBocahAdminClient()
    const { data: authData, error: authError } = await admin.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })
    }

    const { data: professionalDetails, error: detailsError } = await admin
      .from('doctor_profiles')
      .select('id, specialty, hospital, experience, rating, price_in_coins, is_online')
    if (detailsError) throw detailsError

    const professionalIds = (professionalDetails ?? []).map((item) => item.id)
    if (professionalIds.length === 0) return NextResponse.json({ doctors: [] })

    const [{ data: profiles, error: profilesError }, { data: activeSessions, error: sessionsError }] = await Promise.all([
      admin
        .from('profiles')
        .select('id, full_name, role')
        .in('id', professionalIds),
      admin
        .from('telemed_sessions')
        .select('doctor_id')
        .eq('status', 'active')
        .in('doctor_id', professionalIds),
    ])
    if (profilesError) throw profilesError
    if (sessionsError) throw sessionsError

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
    const activeCountByDoctor = new Map<string, number>()
    for (const session of activeSessions ?? []) {
      activeCountByDoctor.set(session.doctor_id, (activeCountByDoctor.get(session.doctor_id) ?? 0) + 1)
    }

    const doctors = (professionalDetails ?? [])
      .map((detail) => {
        const profile = profileById.get(detail.id)
        if (!profile || !professionalRoles.has(profile.role)) return null
        return {
          ...detail,
          full_name: profile.full_name,
          role: profile.role,
          active_session_count: activeCountByDoctor.get(detail.id) ?? 0,
        }
      })
      .filter((doctor) => doctor !== null)
      .sort((left, right) => Number(right.is_online) - Number(left.is_online))

    return NextResponse.json({ doctors })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Daftar dokter gagal dimuat' },
      { status: 500 },
    )
  }
}
