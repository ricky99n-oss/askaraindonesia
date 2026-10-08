import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/internal/supabase/admin'
import { requireInternalMember } from '@/lib/internal/authorize'
import {
  createRuangBocahAdminClient,
  parseRuangBocahReference,
  RUANG_BOCAH_PACKAGES,
} from '@/lib/ruangbocah/admin'

// Cloudflare Pages menjalankan seluruh route dinamis melalui Edge Runtime.
export const runtime = 'edge'

class RequestValidationError extends Error {}

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

function parseRole(value: unknown): 'parent' | 'doctor' {
  if (value !== 'parent' && value !== 'doctor') {
    throw new RequestValidationError('Role harus parent atau doctor')
  }
  return value
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
    const askara = createAdminClient()
    const ruangBocah = createRuangBocahAdminClient()

    const [{ data: authData, error: authError }, { data: profiles, error: profileError }, { data: transactions, error: transactionError }] =
      await Promise.all([
        ruangBocah.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ruangBocah
          .from('profiles')
          .select('id, role, full_name, coin_balance, is_premium, premium_valid_until'),
        askara
          .from('transactions')
          .select('id, reference_id, product_name, buyer_name, buyer_email, buyer_phone, amount, status, created_at')
          .like('reference_id', 'RBM|%')
          .order('created_at', { ascending: false }),
      ])

    if (profileError) throw profileError

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
    const users: Array<Record<string, unknown>> = authError
      ? (profiles ?? []).map((profile) => ({ ...profile, email: '', phone: '' }))
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
          users.push({ ...profile, email: '', phone: '', auth_missing: true })
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

    return NextResponse.json({
      users,
      transactions: transactionError ? [] : (transactions ?? []),
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
    const askara = createAdminClient()
    const ruangBocah = createRuangBocahAdminClient()

    if (body.action === 'approve_transaction') {
      const transactionId = String(body.transactionId ?? '')
      const { data: transaction, error: claimError } = await askara
        .from('transactions')
        .update({ status: 'PAID' })
        .eq('id', transactionId)
        .eq('status', 'PENDING')
        .select('id, reference_id, product_name, status')
        .maybeSingle()

      if (claimError) throw claimError
      if (!transaction) {
        return NextResponse.json({ error: 'Transaksi sudah diproses atau tidak ditemukan' }, { status: 409 })
      }
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

      const { error: doneError } = await askara
        .from('transactions')
        .update({ status: 'DONE' })
        .eq('id', transaction.id)
        .eq('status', 'PAID')
      if (doneError) throw doneError

      return NextResponse.json({ success: true, reviewedBy: reviewer.email })
    }

    if (body.action === 'reject_transaction') {
      const { error } = await askara
        .from('transactions')
        .update({ status: 'FAILED' })
        .eq('id', String(body.transactionId ?? ''))
        .eq('status', 'PENDING')
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (body.action === 'update_user') {
      const userId = requiredText(body.userId, 'ID pengguna')
      const fullName = requiredText(body.fullName, 'Nama lengkap')
      const email = parseEmail(body.email)
      const password = String(body.password ?? '')
      const role = parseRole(body.role)
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

      const authUpdate: {
        email: string
        password?: string
        user_metadata: { full_name: string; role: 'parent' | 'doctor' }
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
        await createAdminClient()
          .from('transactions')
          .update({ status: 'PENDING' })
          .eq('id', claimedTransactionId)
          .eq('status', 'PAID')
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
