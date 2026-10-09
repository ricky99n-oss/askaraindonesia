import { NextResponse } from 'next/server'
import { requireInternalMember } from '@/lib/internal/authorize'
import {
  createRuangBocahAdminClient,
  parseRuangBocahReference,
  RUANG_BOCAH_PACKAGES,
} from '@/lib/ruangbocah/admin'

// Cloudflare Pages menjalankan seluruh route dinamis melalui Edge Runtime.
export const runtime = 'edge'

class RequestValidationError extends Error {}

type UserRole = 'parent' | 'doctor' | 'nutritionist' | 'psychologist' | 'consultant' | 'expert'
const PROFESSIONAL_ROLES = new Set<UserRole>([
  'doctor', 'nutritionist', 'psychologist', 'consultant', 'expert',
])

type PaymentNotification = {
  id: string | number
  user_id: string
  title: string
  message: string
  type: string
  created_at: string
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
    status: notification.type === 'payment_done'
      ? 'DONE'
      : notification.type === 'payment_failed'
        ? 'FAILED'
        : notification.type === 'payment_processing'
          ? 'PAID'
          : 'PENDING',
    created_at: notification.created_at,
  }
}

function requiredText(value: unknown, label: string) {
  const result = String(value ?? '').trim()
  if (!result) throw new RequestValidationError(`${label} wajib diisi`)
  return result
}

function parseEmail(value: unknown) {
  const email = requiredText(value, 'Email').toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RequestValidationError('Format email tidak valid')
  }
  return email
}

function parseRole(value: unknown): UserRole {
  if (!['parent', 'doctor', 'nutritionist', 'psychologist', 'consultant', 'expert'].includes(String(value))) {
    throw new RequestValidationError('Role pengguna tidak valid')
  }
  return value as UserRole
}

function parseProfessional(body: Record<string, unknown>, role: UserRole) {
  if (!PROFESSIONAL_ROLES.has(role)) return null
  const priceInCoins = parseCoinBalance(body.priceInCoins ?? 50)
  return {
    specialty: requiredText(body.specialty || 'Konsultan Anak', 'Bidang keahlian'),
    hospital: String(body.hospital || '').trim(),
    experience: String(body.experience || '').trim(),
    price_in_coins: priceInCoins,
    is_online: body.isOnline === true,
    updated_at: new Date().toISOString(),
  }
}

function parseCoinBalance(value: unknown) {
  const amount = Number(value)
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RequestValidationError('Koin harus berupa bilangan bulat nol atau lebih')
  }
  return amount
}

function parsePremium(isPremiumValue: unknown, premiumValidUntilValue: unknown) {
  const isPremium = isPremiumValue === true
  if (!isPremium) return { isPremium: false, premiumValidUntil: null }

  const rawDate = requiredText(premiumValidUntilValue, 'Masa berlaku premium')
  const premiumValidUntil = new Date(rawDate)
  if (Number.isNaN(premiumValidUntil.getTime())) {
    throw new RequestValidationError('Masa berlaku premium tidak valid')
  }
  return { isPremium: true, premiumValidUntil: premiumValidUntil.toISOString() }
}

function errorResponse(error: unknown) {
  const message = errorMessage(error)
  const status = error instanceof RequestValidationError
    ? 400
    : message === 'UNAUTHORIZED'
      ? 401
      : message === 'FORBIDDEN'
        ? 403
        : 500
  return NextResponse.json({ error: status === 401 || status === 403 ? 'Akses ditolak' : message }, { status })
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Terjadi kesalahan pada server'
}

export async function GET() {
  try {
    await requireInternalMember()
    const ruangBocah = createRuangBocahAdminClient()

    const [{ data: authData, error: authError }, { data: profiles, error: profileError }, { data: professionalRows, error: professionalError }, { data: paymentRows, error: transactionError }] =
      await Promise.all([
        ruangBocah.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ruangBocah
          .from('profiles')
          .select('id, role, full_name, coin_balance, is_premium, premium_valid_until'),
        ruangBocah
          .from('doctor_profiles')
          .select('id, specialty, hospital, experience, rating, price_in_coins, is_online'),
        ruangBocah
          .from('notifications')
          .select('id, user_id, title, message, type, created_at')
          .in('type', ['payment_pending', 'payment_processing', 'payment_done', 'payment_failed'])
          .order('created_at', { ascending: false }),
      ])

    if (profileError) throw profileError

    const professionalById = new Map((professionalRows ?? []).map((profile) => [profile.id, profile]))
    const profileById = new Map((profiles ?? []).map((profile) => [
      profile.id,
      { ...profile, ...professionalById.get(profile.id) },
    ]))
    const users: Array<Record<string, unknown>> = authError
      ? (profiles ?? []).map((profile) => ({
          ...profile,
          ...professionalById.get(profile.id),
          email: '',
          phone: '',
        }))
      : authData.users.map((user) => ({
          id: user.id,
          email: user.email ?? '',
          phone: user.phone ?? '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          ...profileById.get(user.id),
        }))

    if (!authError) {
      const authIds = new Set(authData.users.map((user) => user.id))
      for (const profile of profiles ?? []) {
        if (!authIds.has(profile.id)) {
          users.push({ ...profile, ...professionalById.get(profile.id), email: '', phone: '', auth_missing: true })
        }
      }
    }

    const warnings: string[] = []
    if (authError) {
      warnings.push(
        'Daftar profil berhasil dimuat, tetapi Admin Auth Supabase tidak tersedia. Periksa RUANG_BOCAH_SUPABASE_SERVICE_KEY agar email, pembuatan, dan penghapusan akun aktif.',
      )
    }
    if (transactionError) {
      warnings.push(`Riwayat transaksi belum dapat dimuat: ${errorMessage(transactionError)}`)
    }
    if (professionalError) warnings.push(`Profil dokter/konsultan belum dapat dimuat: ${errorMessage(professionalError)}`)

    return NextResponse.json({
      users,
      transactions: transactionError
        ? []
        : (paymentRows ?? []).map((item) => transactionFromNotification(item as PaymentNotification)),
      warnings,
      capabilities: {
        authAdmin: !authError,
        transactions: !transactionError,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireInternalMember()
    const body = await request.json()
    const email = parseEmail(body.email)
    const password = String(body.password ?? '')
    const fullName = requiredText(body.fullName, 'Nama lengkap')
    const role = parseRole(body.role)
    const professional = parseProfessional(body, role)
    const coinBalance = parseCoinBalance(body.coinBalance ?? 0)
    const { isPremium, premiumValidUntil } = parsePremium(body.isPremium, body.premiumValidUntil)

    if (password.length < 6) throw new RequestValidationError('Password minimal 6 karakter')

    const ruangBocah = createRuangBocahAdminClient()
    const { data, error } = await ruangBocah.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    })
    if (error || !data.user) throw error ?? new Error('Akun gagal dibuat')

    const { error: profileError } = await ruangBocah.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role,
      coin_balance: coinBalance,
      is_premium: isPremium,
      premium_valid_until: premiumValidUntil,
    })

    if (profileError) {
      await ruangBocah.auth.admin.deleteUser(data.user.id)
      throw profileError
    }

    if (professional) {
      const { error: professionalError } = await ruangBocah
        .from('doctor_profiles')
        .upsert({ id: data.user.id, ...professional })
      if (professionalError) {
        await ruangBocah.auth.admin.deleteUser(data.user.id)
        throw professionalError
      }
    }

    return NextResponse.json({ success: true, id: data.user.id })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: Request) {
  let claimedTransactionId: string | null = null
  let canRollbackClaim = true
  try {
    const { user: reviewer } = await requireInternalMember()
    const body = await request.json()
    const ruangBocah = createRuangBocahAdminClient()

    if (body.action === 'approve_transaction') {
      const transactionId = String(body.transactionId ?? '')
      const { data: paymentRow, error: claimError } = await ruangBocah
        .from('notifications')
        .update({ type: 'payment_processing' })
        .eq('id', transactionId)
        .eq('type', 'payment_pending')
        .select('id, user_id, title, message, type, created_at')
        .maybeSingle()

      if (claimError) throw claimError
      if (!paymentRow) {
        return NextResponse.json({ error: 'Transaksi sudah diproses atau tidak ditemukan' }, { status: 409 })
      }
      const transaction = transactionFromNotification(paymentRow as PaymentNotification)
      claimedTransactionId = transaction.id

      const { userId, packageCode } = parseRuangBocahReference(transaction.reference_id)
      const packageInfo = RUANG_BOCAH_PACKAGES[packageCode]
      const { data: profile, error: profileError } = await ruangBocah
        .from('profiles')
        .select('coin_balance, premium_valid_until')
        .eq('id', userId)
        .single()
      if (profileError) throw profileError

      const update: Record<string, unknown> = {
        coin_balance: Number(profile.coin_balance ?? 0) + packageInfo.coinBonus,
      }
      if (packageInfo.premiumDays > 0) {
        const now = new Date()
        const currentExpiry = profile.premium_valid_until ? new Date(profile.premium_valid_until) : now
        const base = currentExpiry > now ? currentExpiry : now
        base.setUTCDate(base.getUTCDate() + packageInfo.premiumDays)
        update.is_premium = true
        update.premium_valid_until = base.toISOString()
      }

      const { error: updateError } = await ruangBocah.from('profiles').update(update).eq('id', userId)
      if (updateError) throw updateError
      // Setelah saldo/premium masuk ke akun, jangan pernah kembalikan ledger ke
      // PENDING. Jika finalisasi website gagal, status PAID mencegah kredit ganda
      // dan dapat direkonsiliasi admin secara manual.
      canRollbackClaim = false

      await ruangBocah.from('notifications').insert({
        user_id: userId,
        title: 'Transaksi disetujui',
        message: `${packageInfo.name} telah aktif. Bonus/saldo ${packageInfo.coinBonus} koin sudah masuk.`,
        type: 'system',
      })

      const { error: doneError } = await ruangBocah
        .from('notifications')
        .update({ type: 'payment_done', is_read: true })
        .eq('id', transaction.id)
        .eq('type', 'payment_processing')
      if (doneError) throw doneError

      return NextResponse.json({ success: true, reviewedBy: reviewer.email })
    }

    if (body.action === 'reject_transaction') {
      const { error } = await ruangBocah
        .from('notifications')
        .update({ type: 'payment_failed', is_read: true })
        .eq('id', String(body.transactionId ?? ''))
        .eq('type', 'payment_pending')
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (body.action === 'update_user') {
      const userId = requiredText(body.userId, 'ID pengguna')
      const fullName = requiredText(body.fullName, 'Nama lengkap')
      const email = parseEmail(body.email)
      const password = String(body.password ?? '')
      const role = parseRole(body.role)
      const professional = parseProfessional(body, role)
      const coinBalance = parseCoinBalance(body.coinBalance)
      const { isPremium, premiumValidUntil } = parsePremium(body.isPremium, body.premiumValidUntil)
      if (password && password.length < 6) {
        throw new RequestValidationError('Password baru minimal 6 karakter')
      }

      const { data: previousProfile, error: currentProfileError } = await ruangBocah
        .from('profiles')
        .select('id, full_name, role, coin_balance, is_premium, premium_valid_until')
        .eq('id', userId)
        .maybeSingle()
      if (currentProfileError) throw currentProfileError

      const profileValues = {
        id: userId,
        full_name: fullName,
        role,
        coin_balance: coinBalance,
        is_premium: isPremium,
        premium_valid_until: premiumValidUntil,
      }
      const { error: profileError } = await ruangBocah
        .from('profiles')
        .upsert(profileValues)
      if (profileError) throw profileError

      if (professional) {
        const { error: professionalError } = await ruangBocah
          .from('doctor_profiles')
          .upsert({ id: userId, ...professional })
        if (professionalError) throw professionalError
      } else {
        const { error: professionalError } = await ruangBocah
          .from('doctor_profiles')
          .delete()
          .eq('id', userId)
        if (professionalError) throw professionalError
      }

      const authUpdate: {
        email: string
        password?: string
        user_metadata: { full_name: string; role: UserRole }
      } = { email, user_metadata: { full_name: fullName, role } }
      if (password) authUpdate.password = password
      const { error: authError } = await ruangBocah.auth.admin.updateUserById(userId, authUpdate)
      if (authError) {
        if (previousProfile) {
          await ruangBocah.from('profiles').upsert(previousProfile)
        } else {
          await ruangBocah.from('profiles').delete().eq('id', userId)
        }
        throw authError
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (error) {
    if (claimedTransactionId && canRollbackClaim) {
      try {
        await createRuangBocahAdminClient()
          .from('notifications')
          .update({ type: 'payment_pending' })
          .eq('id', claimedTransactionId)
          .eq('type', 'payment_processing')
      } catch {
        // Status PAID sengaja dipertahankan bila rollback juga gagal agar tidak terjadi approval ganda.
      }
    }
    return errorResponse(error)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireInternalMember()
    const { userId: rawUserId } = await request.json()
    const userId = requiredText(rawUserId, 'ID pengguna')
    const ruangBocah = createRuangBocahAdminClient()
    const { error } = await ruangBocah.auth.admin.deleteUser(userId)
    if (error) throw error
    const { error: profileError } = await ruangBocah.from('profiles').delete().eq('id', userId)
    if (profileError) throw profileError
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
