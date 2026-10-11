import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient, sendRuangBocahPush } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

function jakartaDate(value: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(value)
}

function calendarDays(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  return Math.round((end - start) / 86_400_000)
}

export async function GET(request: Request) {
  const expected = process.env.RUANG_BOCAH_CRON_SECRET
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = createRuangBocahAdminClient()
    const today = jakartaDate(new Date())
    const horizon = new Date(`${today}T00:00:00Z`)
    horizon.setUTCDate(horizon.getUTCDate() + 8)
    const { data: profiles, error } = await client
      .from('profiles')
      .select('id, full_name, premium_valid_until')
      .eq('is_premium', true)
      .gte('premium_valid_until', `${today}T00:00:00.000Z`)
      .lt('premium_valid_until', horizon.toISOString())
    if (error) throw error

    let sent = 0
    for (const profile of profiles ?? []) {
      const expiryDate = jakartaDate(new Date(profile.premium_valid_until))
      const remaining = calendarDays(today, expiryDate)
      if (![7, 3, 1, 0].includes(remaining)) continue
      const marker = `premium_expiry_h${remaining}_${expiryDate}`
      const { data: existing, error: lookupError } = await client
        .from('notifications').select('id').eq('user_id', profile.id).eq('type', marker).maybeSingle()
      if (lookupError) throw lookupError
      if (existing) continue

      const displayName = String(profile.full_name || 'Ayah/Bunda')
      const title = remaining === 0 ? 'Masa aktif berakhir hari ini' : `Masa aktif tinggal ${remaining} hari`
      const message = `${displayName}, masa aktif Ruang Bocah ${remaining === 0 ? 'berakhir hari ini' : `akan berakhir pada ${expiryDate}`}. Perpanjang sekarang agar layanan tetap aktif.`
      const { data: reservation, error: insertError } = await client.from('notifications').insert({
        user_id: profile.id, title, message, type: marker, is_read: false,
      }).select('id').single()
      if (insertError) throw insertError
      try {
        await sendRuangBocahPush({ userIds: [profile.id], title, message, type: 'premium_expiry' })
        sent += 1
      } catch (pushError) {
        await client.from('notifications').delete().eq('id', reservation.id)
        throw pushError
      }
    }
    return NextResponse.json({ success: true, sent, date: today })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Pengingat gagal' }, { status: 500 })
  }
}
