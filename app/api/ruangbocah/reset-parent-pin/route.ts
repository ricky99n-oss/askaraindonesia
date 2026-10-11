import { NextResponse } from 'next/server'
import { createRuangBocahAdminClient } from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization') || ''
    const token = authorization.toLowerCase().startsWith('bearer ')
      ? authorization.slice(7).trim()
      : ''
    if (!token) return NextResponse.json({ error: 'Sesi login tidak valid' }, { status: 401 })
    const client = createRuangBocahAdminClient()
    const { data: { user }, error } = await client.auth.getUser(token)
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Email akun tidak ditemukan' }, { status: 401 })
    }
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) throw new Error('Layanan email belum dikonfigurasi')
    const bytes = new Uint32Array(1)
    crypto.getRandomValues(bytes)
    const pin = String(1000 + (bytes[0] % 9000))
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Ruang Bocah <noreply@askaraindonesia.com>',
        to: [user.email],
        subject: 'PIN Orang Tua Ruang Bocah yang baru',
        html: `<p>PIN Orang Tua Anda telah direset.</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${pin}</p><p>Gunakan PIN ini untuk membuka pengaturan Poin Anak dan Lock & Timer. Jangan berikan kepada anak.</p>`,
      }),
    })
    if (!emailResponse.ok) throw new Error(`Email PIN gagal dikirim (${emailResponse.status})`)
    return NextResponse.json({ success: true, pin })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PIN belum dapat direset' },
      { status: 500 },
    )
  }
}
