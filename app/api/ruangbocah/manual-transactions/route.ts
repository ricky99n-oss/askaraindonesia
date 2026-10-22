import { NextResponse } from 'next/server'
import {
  createRuangBocahAdminClient,
  createRuangBocahReference,
  isRuangBocahPackageCode,
  RUANG_BOCAH_ADMIN_WA,
  RUANG_BOCAH_ACCESS_CODES,
  RUANG_BOCAH_PACKAGES,
  RUANG_BOCAH_PURCHASABLE_CODES,
} from '@/lib/ruangbocah/admin'

export const runtime = 'edge'

type PaymentStatus = 'PENDING' | 'DONE' | 'FAILED'
type PaymentNotification = {
  id: string | number
  user_id: string
  title: string
  message: string
  type: string
  created_at: string
}

const FREE_TRIAL_TYPE = 'free_trial_started'
const FREE_TRIAL_TITLE = 'FREE_TRIAL_3_DAYS'
const FREE_TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000
const NEW_USER_ELIGIBILITY_MS = 7 * 24 * 60 * 60 * 1000

function trialDates(notification: PaymentNotification | null) {
  if (!notification) return { trialStartedAt: null, trialEndsAt: null }
  let details: Record<string, unknown> = {}
  try {
    details = JSON.parse(notification.message)
  } catch {
    details = {}
  }
  const trialStartedAt = String(details.started_at ?? notification.created_at)
  const parsedStart = new Date(trialStartedAt)
  if (Number.isNaN(parsedStart.getTime())) return { trialStartedAt: null, trialEndsAt: null }
  const explicitEnd = new Date(String(details.ends_at ?? ''))
  const trialEndsAt = Number.isNaN(explicitEnd.getTime())
    ? new Date(parsedStart.getTime() + FREE_TRIAL_DURATION_MS).toISOString()
    : explicitEnd.toISOString()
  return { trialStartedAt: parsedStart.toISOString(), trialEndsAt }
}

function paymentStatus(type: string): PaymentStatus {
  if (type === 'payment_done') return 'DONE'
  if (type === 'payment_failed') return 'FAILED'
  return 'PENDING'
}

function transactionFromNotification(notification: PaymentNotification) {
  let details: Record<string, unknown> = {}
  try {
    details = JSON.parse(notification.message)
  } catch {
    details = {}
  }
  return {
    id: String(notification.id),
    reference_id: notification.title,
    product_name: String(details.product_name ?? 'Transaksi Ruang Bocah'),
    buyer_name: details.buyer_name ?? null,
    buyer_email: details.buyer_email ?? null,
    buyer_phone: details.buyer_phone ?? null,
    amount: Number(details.amount ?? 0),
    status: paymentStatus(notification.type),
    created_at: notification.created_at,
  }
}

async function authenticatedRuangBocahUser(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!accessToken) throw new Error('UNAUTHORIZED')

  const ruangBocah = createRuangBocahAdminClient()
  const { data: { user }, error } = await ruangBocah.auth.getUser(accessToken)
  if (error || !user) throw new Error('UNAUTHORIZED')
  return { ruangBocah, user }
}

export async function GET(request: Request) {
  try {
    const { ruangBocah, user } = await authenticatedRuangBocahUser(request)
    const [
      { data, error },
      { data: profile, error: profileError },
      { data: existingTrial, error: trialError },
    ] = await Promise.all([
      ruangBocah
        .from('notifications')
        .select('id, user_id, title, message, type, created_at')
        .eq('user_id', user.id)
        .in('type', ['payment_pending', 'payment_processing', 'payment_done', 'payment_failed'])
        .order('created_at', { ascending: false })
        .limit(50),
      ruangBocah
        .from('profiles')
        .select('role, is_premium, premium_valid_until')
        .eq('id', user.id)
        .maybeSingle(),
      ruangBocah
        .from('notifications')
        .select('id, user_id, title, message, type, created_at')
        .eq('user_id', user.id)
        .eq('type', FREE_TRIAL_TYPE)
        .eq('title', FREE_TRIAL_TITLE)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ])
    if (error) throw error
    if (profileError) throw profileError
    if (trialError) throw trialError

    const transactions = (data ?? []).map((item) => transactionFromNotification(item as PaymentNotification))
    const hasCompletedAccessTransaction = transactions.some((transaction) =>
      transaction.status === 'DONE' && RUANG_BOCAH_ACCESS_CODES.some((code) => transaction.reference_id.includes(`|${code}|`)),
    )
    let trialNotification = existingTrial as PaymentNotification | null
    let trialJustStarted = false
    let effectiveProfile = profile
    const createdAt = new Date(user.created_at).getTime()
    const isNewUser = Number.isFinite(createdAt) && Date.now() - createdAt <= NEW_USER_ELIGIBILITY_MS
    const shouldStartTrial = Boolean(
      profile?.role === 'parent' &&
      !profile.is_premium &&
      !profile.premium_valid_until &&
      !hasCompletedAccessTransaction &&
      !trialNotification &&
      isNewUser,
    )

    if (shouldStartTrial) {
      const startedAt = new Date()
      const endsAt = new Date(startedAt.getTime() + FREE_TRIAL_DURATION_MS)
      const { data: insertedTrial, error: insertTrialError } = await ruangBocah
        .from('notifications')
        .insert({
          user_id: user.id,
          title: FREE_TRIAL_TITLE,
          message: JSON.stringify({ started_at: startedAt.toISOString(), ends_at: endsAt.toISOString() }),
          type: FREE_TRIAL_TYPE,
          is_read: false,
        })
        .select('id, user_id, title, message, type, created_at')
        .single()
      if (insertTrialError) throw insertTrialError

      const { error: activateTrialError } = await ruangBocah
        .from('profiles')
        .update({ is_premium: true, premium_valid_until: endsAt.toISOString() })
        .eq('id', user.id)
      if (activateTrialError) throw activateTrialError

      trialNotification = insertedTrial as PaymentNotification
      effectiveProfile = {
        role: profile?.role ?? 'parent',
        is_premium: true,
        premium_valid_until: endsAt.toISOString(),
      }
      trialJustStarted = true
    }

    const { trialStartedAt, trialEndsAt } = trialDates(trialNotification)
    const premiumValidUntil = effectiveProfile?.premium_valid_until ?? null
    const isPremiumActive = Boolean(effectiveProfile?.is_premium) && Boolean(premiumValidUntil) && new Date(premiumValidUntil).getTime() > Date.now()
    const premiumExpiryTime = premiumValidUntil ? new Date(premiumValidUntil).getTime() : 0
    const trialExpiryTime = trialEndsAt ? new Date(trialEndsAt).getTime() : 0
    const isTrialActive = Boolean(
      isPremiumActive &&
      trialExpiryTime > Date.now() &&
      premiumExpiryTime <= trialExpiryTime + 60_000,
    )
    const hasInitialAccess = Boolean(effectiveProfile?.is_premium) || Boolean(effectiveProfile?.premium_valid_until) || hasCompletedAccessTransaction
    const requiredPackageCode = 'ACCESS6'
    const hasPendingPayment = transactions.some(
      (transaction) => transaction.status === 'PENDING' && RUANG_BOCAH_ACCESS_CODES.some((code) => transaction.reference_id.includes(`|${code}|`)),
    )

    return NextResponse.json({
      transactions,
      access: {
        hasInitialAccess,
        isPremiumActive,
        premiumValidUntil,
        requiredPackageCode,
        hasPendingPayment,
        isTrialActive,
        trialJustStarted,
        trialStartedAt,
        trialEndsAt,
      },
    })
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
    if (!(RUANG_BOCAH_PURCHASABLE_CODES as readonly string[]).includes(packageCode)) {
      return NextResponse.json({ error: 'Paket ini sudah tidak tersedia' }, { status: 400 })
    }

    const packageInfo = RUANG_BOCAH_PACKAGES[packageCode]
    const pendingPattern = `RBM|${user.id}|${packageInfo.code}|%`
    const [{ data: existing, error: existingError }, { data: profile, error: profileError }] = await Promise.all([
      ruangBocah
        .from('notifications')
        .select('id, user_id, title, message, type, created_at')
        .eq('user_id', user.id)
        .in('type', ['payment_pending', 'payment_processing'])
        .like('title', pendingPattern)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      ruangBocah
        .from('profiles')
        .select('full_name, is_premium, premium_valid_until')
        .eq('id', user.id)
        .maybeSingle(),
    ])
    if (existingError) throw existingError
    if (profileError) throw profileError

    // Paket akses baru dapat dipilih saat aktivasi pertama maupun perpanjangan.

    let notification = existing as PaymentNotification | null
    if (!notification) {
      const referenceId = createRuangBocahReference(user.id, packageCode)
      const message = JSON.stringify({
        product_name: packageInfo.name,
        buyer_name: profile?.full_name || user.user_metadata?.full_name || 'Pengguna Ruang Bocah',
        buyer_email: user.email ?? null,
        buyer_phone: user.phone ?? null,
        amount: packageInfo.amount,
      })
      const { data, error } = await ruangBocah
        .from('notifications')
        .insert({ user_id: user.id, title: referenceId, message, type: 'payment_pending', is_read: false })
        .select('id, user_id, title, message, type, created_at')
        .single()
      if (error) throw error
      notification = data as PaymentNotification
    }

    const transaction = transactionFromNotification(notification)
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
    const message = error instanceof Error
      ? error.message
      : error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Gagal membuat transaksi'
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHORIZED' ? 401 : 500 })
  }
}
