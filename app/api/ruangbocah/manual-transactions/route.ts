import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/internal/supabase/admin'
import {
  createRuangBocahAdminClient,
  createRuangBocahReference,
  isRuangBocahPackageCode,
  RUANG_BOCAH_ADMIN_WA,
  RUANG_BOCAH_PACKAGES,
} from '@/lib/ruangbocah/admin'

// Cloudflare Pages menjalankan seluruh route dinamis melalui Edge Runtime.
export const runtime = 'edge'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }
  return fallback
}

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
    const { ruangBocah, user } = await authenticatedRuangBocahUser(request)
    if (new URL(request.url).searchParams.get('schema') === 'transactions') {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
      const schemaResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: 'application/openapi+json',
        },
      })
      const schema = await schemaResponse.json() as {
        definitions?: Record<string, { properties?: Record<string, unknown> }>
      }
      return NextResponse.json({
        columns: Object.keys(schema.definitions?.transactions?.properties ?? {}),
      })
    }
    const askara = createAdminClient()
    const [{ data, error }, { data: profile, error: profileError }] = await Promise.all([
      askara
        .from('transactions')
        .select('id, reference_id, product_name, amount, status, created_at')
        .like('reference_id', `RBM|${user.id}|%`)
        .order('created_at', { ascending: false })
        .limit(50),
      ruangBocah
        .from('profiles')
        .select('is_premium, premium_valid_until')
        .eq('id', user.id)
        .maybeSingle(),
    ])

    if (error) throw error
    if (profileError) throw profileError

    const transactions = data ?? []
    const hasCompletedAccessTransaction = transactions.some(
      (transaction) =>
        transaction.status === 'DONE' &&
        (transaction.reference_id.includes('|INITIAL_ACCESS|') ||
          transaction.reference_id.includes('|PREMIUM30|')),
    )
    const hasInitialAccess = Boolean(profile?.is_premium) || Boolean(profile?.premium_valid_until) || hasCompletedAccessTransaction
    const premiumValidUntil = profile?.premium_valid_until ?? null
    const isPremiumActive = Boolean(profile?.is_premium) &&
      Boolean(premiumValidUntil) &&
      new Date(premiumValidUntil).getTime() > Date.now()
    const requiredPackageCode = hasInitialAccess ? 'PREMIUM30' : 'INITIAL_ACCESS'
    const hasPendingPayment = transactions.some(
      (transaction) =>
        transaction.status === 'PENDING' &&
        transaction.reference_id.includes(`|${requiredPackageCode}|`),
    )

    return NextResponse.json({
      transactions,
      access: {
        hasInitialAccess,
        isPremiumActive,
        premiumValidUntil,
        requiredPackageCode,
        hasPendingPayment,
      },
    })
  } catch (error) {
    console.error('Ruang Bocah transaction GET failed', error)
    const message = getErrorMessage(error, 'Gagal memuat transaksi')
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
      .select('full_name, is_premium, premium_valid_until')
      .eq('id', user.id)
      .maybeSingle()

    if (packageCode === 'INITIAL_ACCESS' || packageCode === 'PREMIUM30') {
      const { data: completedAccess, error: accessError } = await askara
        .from('transactions')
        .select('reference_id')
        .like('reference_id', `RBM|${user.id}|%`)
        .eq('status', 'DONE')
        .limit(50)
      if (accessError) throw accessError

      const hasInitialAccess = Boolean(profile?.is_premium) || Boolean(profile?.premium_valid_until) || (completedAccess ?? []).some(
        (item) =>
          item.reference_id.includes('|INITIAL_ACCESS|') ||
          item.reference_id.includes('|PREMIUM30|'),
      )
      if (packageCode === 'INITIAL_ACCESS' && hasInitialAccess) {
        return NextResponse.json(
          { error: 'Akses awal sudah pernah dibayar. Gunakan paket perpanjangan Rp 49.000.' },
          { status: 409 },
        )
      }
      if (packageCode === 'PREMIUM30' && !hasInitialAccess) {
        return NextResponse.json(
          { error: 'Selesaikan pembayaran akses awal Rp 99.000 terlebih dahulu.' },
          { status: 409 },
        )
      }
    }

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
      'Halo Admin Askara, saya sudah membayar QRIS Ruang Bocah.',
      `Paket: ${packageInfo.name}`,
      `Nominal: Rp ${packageInfo.amount.toLocaleString('id-ID')}`,
      `Reference: ${transaction.reference_id}`,
      `Transaction ID: ${transaction.id}`,
      `User ID: ${user.id}`,
      `Username: ${profile?.full_name || '-'}`,
      `Email: ${user.email || '-'}`,
      'Saya akan melampirkan screenshot/foto bukti pembayaran pada chat ini.',
      'Mohon di-approve setelah nominal dan bukti pembayaran diverifikasi.',
    ].join('\n')

    return NextResponse.json({
      transaction,
      qrisUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://askaraindonesia.com'}/ruangbocah/qris-askara.jpeg`,
      whatsappUrl: `https://wa.me/${RUANG_BOCAH_ADMIN_WA}?text=${encodeURIComponent(message)}`,
    })
  } catch (error) {
    console.error('Ruang Bocah transaction POST failed', error)
    const message = getErrorMessage(error, 'Gagal membuat transaksi')
    return NextResponse.json(
      { error: message === 'UNAUTHORIZED' ? 'Sesi aplikasi tidak valid' : message },
      { status: message === 'UNAUTHORIZED' ? 401 : 500 },
    )
  }
}
