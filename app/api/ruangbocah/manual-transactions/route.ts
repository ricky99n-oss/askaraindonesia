import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/internal/supabase/admin'
import {
  createRuangBocahAdminClient,
  createRuangBocahReference,
  isRuangBocahPackageCode,
  RUANG_BOCAH_ADMIN_WA,
  RUANG_BOCAH_PACKAGES,
} from '@/lib/ruangbocah/admin'

export const runtime = 'nodejs'

async function authenticatedRuangBocahUser(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!accessToken) throw new Error('UNAUTHORIZED')

  const ruangBocah = createRuangBocahAdminClient()
  const {
    data: { user },
    error,
  } = await ruangBocah.auth.getUser(accessToken)

  if (error || !user) throw new Error('UNAUTHORIZED')
  return { ruangBocah, user }
}

export async function GET(request: Request) {
  try {
    const { user } = await authenticatedRuangBocahUser(request)
    const askara = createAdminClient()
    const { data, error } = await askara
      .from('transactions')
      .select('id, reference_id, product_name, amount, status, created_at')
      .like('reference_id', `RBM|${user.id}|%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return NextResponse.json({ transactions: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memuat transaksi'
    return NextResponse.json(
      { error: message === 'UNAUTHORIZED' ? 'Sesi aplikasi tidak valid' : message },
      { status: message === 'UNAUTHORIZED' ? 401 : 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { ruangBocah, user } = await authenticatedRuangBocahUser(request)
    const body: { packageCode?: unknown } = await request.json()
    const packageCode = body.packageCode
    if (!isRuangBocahPackageCode(packageCode)) {
      return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 })
    }

    const packageInfo = RUANG_BOCAH_PACKAGES[packageCode]
    const askara = createAdminClient()
    const pendingPattern = `RBM|${user.id}|${packageInfo.code}|%`
    const { data: existing } = await askara
      .from('transactions')
      .select('id, reference_id, product_name, amount, status, created_at')
      .like('reference_id', pendingPattern)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: profile } = await ruangBocah
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    let transaction = existing
    if (!transaction) {
      const referenceId = createRuangBocahReference(user.id, packageCode)
      const { data, error } = await askara
        .from('transactions')
        .insert({
          reference_id: referenceId,
          product_name: packageInfo.name,
          buyer_name: profile?.full_name || user.user_metadata?.full_name || 'Pengguna Ruang Bocah',
          buyer_email: user.email ?? null,
          buyer_phone: user.phone ?? null,
          amount: packageInfo.amount,
          shipping_cost: 0,
          status: 'PENDING',
        })
        .select('id, reference_id, product_name, amount, status, created_at')
        .single()

      if (error) throw error
      transaction = data
    }

    const message = [
      'Halo Admin Askara, saya ingin melakukan pembelian manual Ruang Bocah.',
      `Paket: ${packageInfo.name}`,
      `Nominal: Rp ${packageInfo.amount.toLocaleString('id-ID')}`,
      `Reference: ${transaction.reference_id}`,
      `Akun: ${profile?.full_name || user.email || user.id}`,
      'Saya akan mengirim bukti transfer di chat ini. Mohon di-approve setelah pembayaran diverifikasi.',
    ].join('\n')

    return NextResponse.json({
      transaction,
      whatsappUrl: `https://wa.me/${RUANG_BOCAH_ADMIN_WA}?text=${encodeURIComponent(message)}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal membuat transaksi'
    return NextResponse.json(
      { error: message === 'UNAUTHORIZED' ? 'Sesi aplikasi tidak valid' : message },
      { status: message === 'UNAUTHORIZED' ? 401 : 500 },
    )
  }
}
