import { NextRequest, NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const sessionId = request.nextUrl.searchParams.get('sessionId')?.trim()
    if (!token || !sessionId) return NextResponse.json({ error: 'Permintaan tidak lengkap' }, { status: 400 })

    const admin = createRuangBocahAdminClient()
    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })

    const { data: session, error: sessionError } = await admin
      .from('telemed_sessions').select('id, doctor_id, parent_id, status, created_at').eq('id', sessionId).maybeSingle()
    if (sessionError) throw sessionError
    if (!session || (session.doctor_id !== user.id && session.parent_id !== user.id)) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke sesi ini' }, { status: 403 })
    }

    const { data: contextRow, error: contextError } = await admin
      .from('notifications').select('message').eq('user_id', session.doctor_id)
      .eq('type', 'consultation_context').eq('title', sessionId).maybeSingle()
    if (contextError) throw contextError
    let childId = ''
    try { childId = String((JSON.parse(contextRow?.message || '{}') as { child_id?: string }).child_id || '') } catch { childId = '' }
    if (!childId) return NextResponse.json({ session, child: null, growth: [], vaccines: [], nutrition: [], sleep: [] })

    const [{ data: child, error: childError }, growth, vaccines, nutrition, sleep] = await Promise.all([
      admin.from('children').select('id, parent_id, name, gender, birth_date').eq('id', childId).eq('parent_id', session.parent_id).maybeSingle(),
      admin.from('growth_logs').select('record_date, weight_kg, height_cm, head_cm').eq('child_id', childId).order('record_date', { ascending: false }).limit(12),
      admin.from('vaccine_logs').select('vaccine_name, given_date, location').eq('child_id', childId).order('given_date', { ascending: false }).limit(20),
      admin.from('feeding_logs').select('log_time, feed_type, amount_ml, feed_condition, notes').eq('child_id', childId).order('log_time', { ascending: false }).limit(30),
      admin.from('sleep_logs').select('sleep_date, start_time, end_time, notes').eq('child_id', childId).order('sleep_date', { ascending: false }).limit(14),
    ])
    if (childError) throw childError
    if (!child) return NextResponse.json({ error: 'Profil anak tidak ditemukan' }, { status: 404 })
    const firstError = [growth.error, vaccines.error, nutrition.error, sleep.error].find(Boolean)
    if (firstError) throw firstError
    return NextResponse.json({ session, child, growth: growth.data ?? [], vaccines: vaccines.data ?? [], nutrition: nutrition.data ?? [], sleep: sleep.data ?? [] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ringkasan konsultasi gagal dimuat' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'Sesi login tidak ditemukan' }, { status: 401 })

    const admin = createRuangBocahAdminClient()
    const { data: authData, error: authError } = await admin.auth.getUser(token)
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })
    }

    const body = await request.json() as { doctorId?: string; price?: number; welcomeMessage?: string }
    const doctorId = body.doctorId?.trim()
    if (!doctorId) return NextResponse.json({ error: 'Dokter atau konsultan wajib dipilih' }, { status: 400 })

    const { data: doctor, error: doctorError } = await admin
      .from('doctor_profiles')
      .select('price_in_coins')
      .eq('id', doctorId)
      .single()
    if (doctorError || !doctor) return NextResponse.json({ error: 'Dokter atau konsultan tidak ditemukan' }, { status: 404 })

    const price = Number(doctor.price_in_coins)
    if (!Number.isInteger(price) || price <= 0 || price !== Number(body.price)) {
      return NextResponse.json({ error: 'Biaya konsultasi telah berubah. Silakan muat ulang.' }, { status: 409 })
    }

    const { data: sessionId, error: sessionError } = await admin.rpc('mulai_sesi_konsultasi', {
      p_parent_id: authData.user.id,
      p_doctor_id: doctorId,
      p_cost: price,
      p_welcome_msg: body.welcomeMessage ?? 'Silakan ceritakan keluhan atau pertanyaan Anda terkait kesehatan si Kecil.',
    })
    if (sessionError) throw sessionError

    // RPC lama mengkreditkan 100% biaya. Potong komisi aplikasi 10% sehingga
    // dokter/konsultan menerima tepat 90% (dibulatkan ke bawah dalam koin utuh).
    const doctorShare = Math.floor(price * 0.9)
    const platformFee = price - doctorShare
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('coin_balance')
        .eq('id', doctorId)
        .single()
      if (profileError) throw profileError
      const currentBalance = Number(profile.coin_balance ?? 0)
      const { data: updated, error: updateError } = await admin
        .from('profiles')
        .update({ coin_balance: currentBalance - platformFee })
        .eq('id', doctorId)
        .eq('coin_balance', currentBalance)
        .select('id')
      if (updateError) throw updateError
      if (updated?.length) {
        return NextResponse.json({ sessionId, price, doctorShare, platformFee })
      }
    }
    throw new Error('Pembagian pendapatan konsultasi gagal diproses')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Konsultasi gagal dimulai'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
