import { NextRequest, NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

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
