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

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server'
  const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 500
  return NextResponse.json({ error: status === 500 ? message : 'Akses ditolak' }, { status })
}

export async function GET() {
  try {
    await requireInternalMember()
    const askara = createAdminClient()
    const ruangBocah = createRuangBocahAdminClient()

    const [{ data: authData, error: authError }, { data: profiles, error: profileError }, { data: transactions, error: transactionError }] =
      await Promise.all([
        ruangBocah.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ruangBocah.from('profiles').select('*'),
        askara
          .from('transactions')
          .select('id, reference_id, product_name, buyer_name, buyer_email, buyer_phone, amount, status, created_at')
          .like('reference_id', 'RBM|%')
          .order('created_at', { ascending: false }),
      ])

    if (authError) throw authError
    if (profileError) throw profileError
    if (transactionError) throw transactionError

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
    const users = authData.users.map((user) => ({
      id: user.id,
      email: user.email ?? '',
      phone: user.phone ?? '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      ...profileById.get(user.id),
    }))

    return NextResponse.json({ users, transactions: transactions ?? [] })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireInternalMember()
    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const fullName = String(body.fullName ?? '').trim()
    const role = body.role === 'doctor' ? 'doctor' : 'parent'

    if (!email || password.length < 6 || !fullName) {
      return NextResponse.json({ error: 'Nama, email, dan password minimal 6 karakter wajib diisi' }, { status: 400 })
    }

    const ruangBocah = createRuangBocahAdminClient()
    const { data, error } = await ruangBocah.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error || !data.user) throw error ?? new Error('Akun gagal dibuat')

    const { error: profileError } = await ruangBocah.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role,
      coin_balance: 0,
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
      const userId = String(body.userId ?? '')
      const fullName = String(body.fullName ?? '').trim()
      const role = body.role === 'doctor' ? 'doctor' : 'parent'
      const coinBalance = Math.max(0, Number(body.coinBalance ?? 0))
      const isPremium = Boolean(body.isPremium) && role === 'parent'
      const premiumValidUntil = isPremium && body.premiumValidUntil
        ? new Date(body.premiumValidUntil).toISOString()
        : null

      const { error } = await ruangBocah
        .from('profiles')
        .update({
          full_name: fullName,
          role,
          coin_balance: coinBalance,
          is_premium: isPremium,
          premium_valid_until: premiumValidUntil,
        })
        .eq('id', userId)
      if (error) throw error

      const authUpdate: { email?: string; password?: string; user_metadata: { full_name: string } } = {
        user_metadata: { full_name: fullName },
      }
      if (body.email) authUpdate.email = String(body.email).trim().toLowerCase()
      if (body.password) authUpdate.password = String(body.password)
      const { error: authError } = await ruangBocah.auth.admin.updateUserById(userId, authUpdate)
      if (authError) throw authError

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
    const { userId } = await request.json()
    const ruangBocah = createRuangBocahAdminClient()
    const { error } = await ruangBocah.auth.admin.deleteUser(String(userId ?? ''))
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
