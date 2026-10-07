'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type RuangBocahUser = {
  id: string
  email?: string
  phone?: string
  full_name?: string
  role?: string
  coin_balance?: number
  is_premium?: boolean
  premium_valid_until?: string | null
  created_at?: string
  last_sign_in_at?: string | null
}

type RuangBocahTransaction = {
  id: string
  reference_id: string
  product_name: string
  buyer_name?: string
  buyer_email?: string
  buyer_phone?: string
  amount: number
  status: string
  created_at: string
}

type DashboardData = {
  users: RuangBocahUser[]
  transactions: RuangBocahTransaction[]
}

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export default function RuangBocahAdminPage() {
  const [data, setData] = useState<DashboardData>({ users: [], transactions: [] })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', role: 'parent' })

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/internal/ruangbocah', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat dashboard')
      setData(payload)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const stats = useMemo(() => {
    const pending = data.transactions.filter((transaction) => transaction.status === 'PENDING').length
    const approved = data.transactions.filter((transaction) => transaction.status === 'DONE')
    return {
      users: data.users.length,
      parents: data.users.filter((user) => user.role !== 'doctor').length,
      doctors: data.users.filter((user) => user.role === 'doctor').length,
      premium: data.users.filter((user) => user.is_premium).length,
      pending,
      approved: approved.length,
      revenue: approved.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    }
  }, [data])

  async function mutate(method: 'POST' | 'PATCH' | 'DELETE', body: Record<string, unknown>, id: string) {
    setBusyId(id)
    setMessage('')
    try {
      const response = await fetch('/api/internal/ruangbocah', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Operasi gagal')
      setMessage('Perubahan berhasil disimpan.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operasi gagal')
    } finally {
      setBusyId(null)
    }
  }

  async function createUser(event: FormEvent) {
    event.preventDefault()
    await mutate('POST', createForm, 'create-user')
    setCreateForm({ fullName: '', email: '', password: '', role: 'parent' })
  }

  async function editUser(user: RuangBocahUser) {
    const fullName = window.prompt('Nama lengkap', user.full_name || '')
    if (fullName === null || !fullName.trim()) return
    const email = window.prompt('Email', user.email || '')
    if (email === null || !email.trim()) return
    const role = window.prompt('Role: parent atau doctor', user.role || 'parent')
    if (role === null || !['parent', 'doctor'].includes(role)) return
    const coinBalanceText = window.prompt('Saldo koin', String(user.coin_balance ?? 0))
    if (coinBalanceText === null || Number.isNaN(Number(coinBalanceText))) return
    const premiumUntil = role === 'parent'
      ? window.prompt('Premium sampai (YYYY-MM-DD), kosongkan untuk nonaktif', user.premium_valid_until?.slice(0, 10) || '')
      : ''
    if (premiumUntil === null) return

    await mutate('PATCH', {
      action: 'update_user',
      userId: user.id,
      fullName,
      email,
      role,
      coinBalance: Number(coinBalanceText),
      isPremium: Boolean(premiumUntil),
      premiumValidUntil: premiumUntil ? `${premiumUntil}T23:59:59.999Z` : null,
    }, user.id)
  }

  async function deleteUser(user: RuangBocahUser) {
    if (!window.confirm(`Hapus permanen akun ${user.full_name || user.email}? Data terkait dapat ikut terhapus.`)) return
    await mutate('DELETE', { userId: user.id }, user.id)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">Ruang Bocah</p>
        <h1 className="text-3xl font-bold text-gray-900">Subscriber, Transaksi & Pengguna</h1>
        <p className="mt-2 text-sm text-gray-500">Approval di halaman ini langsung mengaktifkan premium atau menambah koin pada akun aplikasi.</p>
      </div>

      {message && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total akun" value={stats.users} detail={`${stats.parents} orang tua · ${stats.doctors} dokter`} />
        <Stat label="Subscriber aktif" value={stats.premium} detail="Akun premium saat ini" />
        <Stat label="Menunggu approval" value={stats.pending} detail={`${stats.approved} transaksi disetujui`} highlight />
        <Stat label="Omzet disetujui" value={rupiah.format(stats.revenue)} detail="Transaksi Ruang Bocah DONE" />
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaksi manual</h2>
            <p className="text-sm text-gray-500">Verifikasi bukti di WhatsApp 0858-1599-9953 sebelum menekan Setujui.</p>
          </div>
          <button onClick={() => void load()} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">Muat ulang</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="p-4">Tanggal</th><th className="p-4">Reference</th><th className="p-4">Paket</th><th className="p-4">Pengguna</th><th className="p-4">Nominal</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? <EmptyRow text="Memuat transaksi..." columns={7} /> : data.transactions.length === 0 ? <EmptyRow text="Belum ada transaksi Ruang Bocah." columns={7} /> : data.transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-100 align-top">
                  <td className="p-4">{new Date(transaction.created_at).toLocaleString('id-ID')}</td>
                  <td className="max-w-56 break-all p-4 font-mono text-xs text-gray-500">{transaction.reference_id}</td>
                  <td className="p-4 font-semibold">{transaction.product_name}</td>
                  <td className="p-4">{transaction.buyer_name || '-'}<div className="text-xs text-gray-400">{transaction.buyer_email || transaction.buyer_phone || '-'}</div></td>
                  <td className="p-4 font-semibold">{rupiah.format(Number(transaction.amount))}</td>
                  <td className="p-4"><Status value={transaction.status} /></td>
                  <td className="p-4">
                    {transaction.status === 'PENDING' ? <div className="flex gap-2">
                      <button disabled={busyId === transaction.id} onClick={() => void mutate('PATCH', { action: 'approve_transaction', transactionId: transaction.id }, transaction.id)} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Setujui</button>
                      <button disabled={busyId === transaction.id} onClick={() => void mutate('PATCH', { action: 'reject_transaction', transactionId: transaction.id }, transaction.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">Tolak</button>
                    </div> : <span className="text-xs text-gray-400">Sudah diproses</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Tambah pengguna</h2>
        <form onSubmit={createUser} className="mt-4 grid gap-3 md:grid-cols-5">
          <input required value={createForm.fullName} onChange={(event) => setCreateForm({ ...createForm, fullName: event.target.value })} placeholder="Nama lengkap" className="rounded-lg border border-gray-200 px-3 py-2" />
          <input required type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} placeholder="Email" className="rounded-lg border border-gray-200 px-3 py-2" />
          <input required minLength={6} type="password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} placeholder="Password awal" className="rounded-lg border border-gray-200 px-3 py-2" />
          <select value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })} className="rounded-lg border border-gray-200 px-3 py-2"><option value="parent">Orang tua</option><option value="doctor">Dokter</option></select>
          <button disabled={busyId === 'create-user'} className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white disabled:opacity-50">Buat akun</button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5"><h2 className="text-xl font-bold text-gray-900">CRUD pengguna aplikasi</h2><p className="text-sm text-gray-500">Edit mengelola nama, email, role, koin, dan masa premium.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Nama</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Koin</th><th className="p-4">Premium</th><th className="p-4">Login terakhir</th><th className="p-4">Aksi</th></tr></thead>
            <tbody>
              {loading ? <EmptyRow text="Memuat pengguna..." columns={7} /> : data.users.length === 0 ? <EmptyRow text="Belum ada pengguna." columns={7} /> : data.users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="p-4 font-semibold">{user.full_name || '-'}<div className="font-mono text-[10px] font-normal text-gray-400">{user.id}</div></td>
                  <td className="p-4">{user.email || '-'}</td>
                  <td className="p-4"><span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">{user.role || 'parent'}</span></td>
                  <td className="p-4 font-semibold">{user.coin_balance ?? 0}</td>
                  <td className="p-4">{user.is_premium ? `Aktif s.d. ${user.premium_valid_until ? new Date(user.premium_valid_until).toLocaleDateString('id-ID') : '-'}` : 'Tidak aktif'}</td>
                  <td className="p-4 text-xs text-gray-500">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('id-ID') : 'Belum pernah'}</td>
                  <td className="p-4"><div className="flex gap-2"><button disabled={busyId === user.id} onClick={() => void editUser(user)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Edit</button><button disabled={busyId === user.id} onClick={() => void deleteUser(user)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Hapus</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, detail, highlight = false }: { label: string; value: string | number; detail: string; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-white'}`}><div className="text-sm text-gray-500">{label}</div><div className="mt-1 text-3xl font-bold text-gray-900">{value}</div><div className="mt-1 text-xs text-gray-400">{detail}</div></div>
}

function Status({ value }: { value: string }) {
  const color = value === 'DONE' ? 'bg-green-100 text-green-700' : value === 'FAILED' ? 'bg-red-100 text-red-700' : value === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{value}</span>
}

function EmptyRow({ text, columns }: { text: string; columns: number }) {
  return <tr><td colSpan={columns} className="p-10 text-center text-gray-500">{text}</td></tr>
}
