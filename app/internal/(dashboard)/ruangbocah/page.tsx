'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type UserRole = 'parent' | 'doctor'

type RuangBocahUser = {
  id: string
  email?: string
  phone?: string
  full_name?: string
  role?: UserRole
  coin_balance?: number
  is_premium?: boolean
  premium_valid_until?: string | null
  created_at?: string
  last_sign_in_at?: string | null
  auth_missing?: boolean
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
  warnings?: string[]
  capabilities?: { authAdmin: boolean; transactions: boolean }
}

type UserForm = {
  fullName: string
  email: string
  password: string
  role: UserRole
  coinBalance: string
  isPremium: boolean
  premiumValidUntil: string
}

const emptyUserForm: UserForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'parent',
  coinBalance: '0',
  isPremium: false,
  premiumValidUntil: '',
}

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

function dateInputToIso(value: string) {
  return value ? `${value}T23:59:59.999Z` : null
}

function isPremiumActive(user: RuangBocahUser, currentTime: number) {
  if (!user.is_premium) return false
  return !user.premium_valid_until || new Date(user.premium_valid_until).getTime() > currentTime
}

export default function RuangBocahAdminPage() {
  const [data, setData] = useState<DashboardData>({ users: [], transactions: [], warnings: [] })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [createForm, setCreateForm] = useState<UserForm>(emptyUserForm)
  const [editingUser, setEditingUser] = useState<RuangBocahUser | null>(null)
  const [editForm, setEditForm] = useState<UserForm>(emptyUserForm)
  const [currentTime] = useState(() => Date.now())

  const load = useCallback(async (clearMessage = true) => {
    setLoading(true)
    if (clearMessage) setMessage('')
    try {
      const response = await fetch('/api/internal/ruangbocah', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat dashboard')
      setData(payload)
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat dashboard')
      return false
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
      premium: data.users.filter((user) => isPremiumActive(user, currentTime)).length,
      pending,
      approved: approved.length,
      revenue: approved.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    }
  }, [currentTime, data])

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data.users
    return data.users.filter((user) => [user.full_name, user.email, user.role, user.id]
      .some((value) => String(value ?? '').toLowerCase().includes(query)))
  }, [data.users, search])

  async function mutate(method: 'POST' | 'PATCH' | 'DELETE', body: Record<string, unknown>, id: string, successMessage = 'Perubahan berhasil disimpan.') {
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
      await load(false)
      setMessage(successMessage)
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operasi gagal')
      return false
    } finally {
      setBusyId(null)
    }
  }

  function formPayload(form: UserForm) {
    return {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      coinBalance: Number(form.coinBalance),
      isPremium: form.isPremium,
      premiumValidUntil: form.isPremium ? dateInputToIso(form.premiumValidUntil) : null,
    }
  }

  async function createUser(event: FormEvent) {
    event.preventDefault()
    const saved = await mutate('POST', formPayload(createForm), 'create-user', 'Pengguna baru berhasil dibuat.')
    if (saved) setCreateForm(emptyUserForm)
  }

  function openEditor(user: RuangBocahUser) {
    setEditingUser(user)
    setEditForm({
      fullName: user.full_name || '',
      email: user.email || '',
      password: '',
      role: user.role === 'doctor' ? 'doctor' : 'parent',
      coinBalance: String(user.coin_balance ?? 0),
      isPremium: Boolean(user.is_premium),
      premiumValidUntil: user.premium_valid_until?.slice(0, 10) || '',
    })
  }

  async function saveUser(event: FormEvent) {
    event.preventDefault()
    if (!editingUser) return
    const saved = await mutate('PATCH', {
      action: 'update_user',
      userId: editingUser.id,
      ...formPayload(editForm),
    }, editingUser.id, 'Data pengguna berhasil diperbarui.')
    if (saved) setEditingUser(null)
  }

  async function deleteUser(user: RuangBocahUser) {
    if (!window.confirm(`Hapus permanen akun ${user.full_name || user.email || user.id}? Data terkait dapat ikut terhapus.`)) return
    await mutate('DELETE', { userId: user.id }, user.id, 'Pengguna berhasil dihapus.')
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">Ruang Bocah</p>
        <h1 className="text-3xl font-bold text-gray-900">Subscriber, Transaksi & Pengguna</h1>
        <p className="mt-2 text-sm text-gray-500">Kelola penuh akun aplikasi dan setujui transaksi yang langsung tersinkron ke Supabase Ruang Bocah.</p>
      </div>

      {message && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
      {data.warnings?.map((warning) => (
        <div key={warning} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{warning}</div>
      ))}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total akun" value={stats.users} detail={`${stats.parents} orang tua · ${stats.doctors} dokter`} />
        <Stat label="Subscriber aktif" value={stats.premium} detail="Premium aktif dan belum kedaluwarsa" />
        <Stat label="Menunggu approval" value={stats.pending} detail={`${stats.approved} transaksi disetujui`} highlight />
        <Stat label="Omzet disetujui" value={rupiah.format(stats.revenue)} detail="Transaksi Ruang Bocah DONE" />
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
          <div><h2 className="text-xl font-bold text-gray-900">Transaksi manual</h2><p className="text-sm text-gray-500">Verifikasi bukti di WhatsApp 0858-1599-9953 sebelum menekan Setujui.</p></div>
          <button onClick={() => void load()} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">Muat ulang</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Tanggal</th><th className="p-4">Reference</th><th className="p-4">Paket</th><th className="p-4">Pengguna</th><th className="p-4">Nominal</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr></thead>
            <tbody>
              {loading ? <EmptyRow text="Memuat transaksi..." columns={7} /> : data.transactions.length === 0 ? <EmptyRow text="Belum ada transaksi Ruang Bocah." columns={7} /> : data.transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-100 align-top">
                  <td className="p-4">{new Date(transaction.created_at).toLocaleString('id-ID')}</td>
                  <td className="max-w-56 break-all p-4 font-mono text-xs text-gray-500">{transaction.reference_id}</td>
                  <td className="p-4 font-semibold">{transaction.product_name}</td>
                  <td className="p-4">{transaction.buyer_name || '-'}<div className="text-xs text-gray-400">{transaction.buyer_email || transaction.buyer_phone || '-'}</div></td>
                  <td className="p-4 font-semibold">{rupiah.format(Number(transaction.amount))}</td>
                  <td className="p-4"><Status value={transaction.status} /></td>
                  <td className="p-4">{transaction.status === 'PENDING' ? <div className="flex gap-2">
                    <button disabled={busyId === transaction.id} onClick={() => void mutate('PATCH', { action: 'approve_transaction', transactionId: transaction.id }, transaction.id, 'Transaksi disetujui dan manfaat sudah masuk ke akun.')} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Setujui</button>
                    <button disabled={busyId === transaction.id} onClick={() => void mutate('PATCH', { action: 'reject_transaction', transactionId: transaction.id }, transaction.id, 'Transaksi ditolak.')} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">Tolak</button>
                  </div> : <span className="text-xs text-gray-400">Sudah diproses</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div><h2 className="text-xl font-bold text-gray-900">Tambah pengguna</h2><p className="text-sm text-gray-500">Buat akun Auth dan profil Supabase lengkap dalam satu langkah.</p></div>
        <form onSubmit={createUser} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Nama lengkap"><input required value={createForm.fullName} onChange={(event) => setCreateForm({ ...createForm, fullName: event.target.value })} className="form-input" /></Field>
          <Field label="Email"><input required type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} className="form-input" /></Field>
          <Field label="Password awal"><input required minLength={6} type="password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} className="form-input" /></Field>
          <Field label="Role"><select value={createForm.role} onChange={(event) => setCreateForm({ ...createForm, role: event.target.value as UserRole })} className="form-input"><option value="parent">Orang tua</option><option value="doctor">Dokter</option></select></Field>
          <Field label="Saldo koin"><input required min="0" step="1" type="number" value={createForm.coinBalance} onChange={(event) => setCreateForm({ ...createForm, coinBalance: event.target.value })} className="form-input" /></Field>
          <PremiumFields form={createForm} setForm={setCreateForm} />
          <div className="flex items-end"><button disabled={busyId === 'create-user' || data.capabilities?.authAdmin === false} title={data.capabilities?.authAdmin === false ? 'Membutuhkan service-role key Supabase Ruang Bocah' : undefined} className="w-full rounded-lg bg-purple-700 px-4 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busyId === 'create-user' ? 'Membuat...' : 'Buat akun'}</button></div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div><h2 className="text-xl font-bold text-gray-900">CRUD pengguna aplikasi</h2><p className="text-sm text-gray-500">Atur identitas, login, role, koin, status premium, dan masa berlakunya.</p></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, role, atau ID..." className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:w-80" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Nama</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Koin</th><th className="p-4">Premium</th><th className="p-4">Login terakhir</th><th className="p-4">Aksi</th></tr></thead>
            <tbody>
              {loading ? <EmptyRow text="Memuat pengguna..." columns={7} /> : visibleUsers.length === 0 ? <EmptyRow text={search ? 'Pengguna tidak ditemukan.' : 'Belum ada pengguna.'} columns={7} /> : visibleUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="p-4 font-semibold">{user.full_name || '-'}<div className="font-mono text-[10px] font-normal text-gray-400">{user.id}</div></td>
                  <td className="p-4">{user.email || <span className="text-amber-600">Auth tidak ditemukan</span>}</td>
                  <td className="p-4"><span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">{user.role || 'parent'}</span></td>
                  <td className="p-4 font-semibold">{Number(user.coin_balance ?? 0).toLocaleString('id-ID')}</td>
                  <td className="p-4"><PremiumStatus user={user} currentTime={currentTime} /></td>
                  <td className="p-4 text-xs text-gray-500">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('id-ID') : 'Belum pernah'}</td>
                  <td className="p-4"><div className="flex gap-2"><button disabled={busyId === user.id || user.auth_missing} onClick={() => openEditor(user)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 disabled:opacity-50">Kelola</button><button disabled={busyId === user.id || data.capabilities?.authAdmin === false || user.auth_missing} onClick={() => void deleteUser(user)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">Hapus</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-user-title" onMouseDown={(event) => { if (event.currentTarget === event.target && !busyId) setEditingUser(null) }}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-5"><div><h2 id="edit-user-title" className="text-xl font-bold text-gray-900">Kelola pengguna</h2><p className="mt-1 break-all font-mono text-xs text-gray-400">{editingUser.id}</p></div><button type="button" disabled={Boolean(busyId)} onClick={() => setEditingUser(null)} className="rounded-lg px-3 py-1.5 text-xl text-gray-400 hover:bg-gray-100" aria-label="Tutup">×</button></div>
            <form onSubmit={saveUser} className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Nama lengkap"><input required value={editForm.fullName} onChange={(event) => setEditForm({ ...editForm, fullName: event.target.value })} className="form-input" /></Field>
              <Field label="Email login"><input required type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} className="form-input" /></Field>
              <Field label="Password baru (opsional)" hint="Kosongkan jika tidak diubah"><input minLength={6} type="password" value={editForm.password} onChange={(event) => setEditForm({ ...editForm, password: event.target.value })} placeholder="Minimal 6 karakter" className="form-input" /></Field>
              <Field label="Role"><select value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value as UserRole })} className="form-input"><option value="parent">Orang tua</option><option value="doctor">Dokter</option></select></Field>
              <Field label="Saldo koin"><input required min="0" step="1" type="number" value={editForm.coinBalance} onChange={(event) => setEditForm({ ...editForm, coinBalance: event.target.value })} className="form-input" /></Field>
              <PremiumFields form={editForm} setForm={setEditForm} />
              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5 md:col-span-2"><button type="button" disabled={Boolean(busyId)} onClick={() => setEditingUser(null)} className="rounded-lg bg-gray-100 px-5 py-2.5 font-semibold text-gray-700">Batal</button><button disabled={busyId === editingUser.id} className="rounded-lg bg-purple-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">{busyId === editingUser.id ? 'Menyimpan...' : 'Simpan perubahan'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700"><span>{label}</span>{hint && <span className="ml-2 text-xs font-normal text-gray-400">{hint}</span>}<div className="mt-1.5">{children}</div></label>
}

function PremiumFields({ form, setForm }: { form: UserForm; setForm: (form: UserForm) => void }) {
  return <><label className="flex min-h-[42px] items-center gap-3 self-end rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.isPremium} onChange={(event) => setForm({ ...form, isPremium: event.target.checked, premiumValidUntil: event.target.checked ? form.premiumValidUntil : '' })} className="h-4 w-4 accent-purple-700" /><span>Premium aktif</span></label><Field label="Berlaku sampai"><input required={form.isPremium} disabled={!form.isPremium} type="date" value={form.premiumValidUntil} onChange={(event) => setForm({ ...form, premiumValidUntil: event.target.value })} className="form-input disabled:bg-gray-100 disabled:text-gray-400" /></Field></>
}

function PremiumStatus({ user, currentTime }: { user: RuangBocahUser; currentTime: number }) {
  if (!user.is_premium) return <span className="text-gray-500">Tidak aktif</span>
  const expiry = user.premium_valid_until ? new Date(user.premium_valid_until) : null
  const active = !expiry || expiry.getTime() > currentTime
  return <div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{active ? 'Aktif' : 'Kedaluwarsa'}</span><div className="mt-1.5 text-xs text-gray-500">{expiry ? `s.d. ${expiry.toLocaleDateString('id-ID')}` : 'Tanpa batas waktu'}</div></div>
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
