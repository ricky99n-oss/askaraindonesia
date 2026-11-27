'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnmLicense, RegisteredUser, RegisteredUsersData, RegistrationCounts } from '@/lib/anm/admin-types'

const inputClass = 'w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-purple-500'
const buttonClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-40'
function date(value: string) { return new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }) + ' WIB' }

function useRegisteredUsers(refreshKey: number) {
  const [query, setQuery] = useState(''), [page, setPage] = useState(0)
  const [data, setData] = useState<RegisteredUsersData | null>(null)
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  const load = useCallback(async (quiet = false) => {
    active.current?.abort()
    const controller = new AbortController(); active.current = controller
    if (!quiet) setLoading(true)
    try {
      const params = new URLSearchParams({ view: 'users', page: String(page), q: query })
      const response = await fetch(`/api/internal/anm?${params}`, { cache: 'no-store', signal: controller.signal })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Daftar pendaftar belum dapat dimuat.')
      if (!controller.signal.aborted) { setData(result); setError('') }
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Koneksi terputus.')
    } finally { if (active.current === controller) setLoading(false) }
  }, [page, query])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250)
    const refresh = () => { if (!document.hidden) void load(true) }
    const interval = window.setInterval(refresh, 5000)
    window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh)
    return () => { clearTimeout(timer); clearInterval(interval); active.current?.abort(); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [load, refreshKey])
  return { query, search: (value: string) => { setQuery(value); setPage(0) }, page, setPage, data, loading, error, load }
}

export default function RegisteredCustomers({ onCreate, onEdit, onCounts, refreshKey }: {
  onCreate: (user: RegisteredUser) => void; onEdit: (license: AnmLicense) => void; onCounts: (counts: RegistrationCounts) => void; refreshKey: number
}) {
  const state = useRegisteredUsers(refreshKey)
  useEffect(() => { if (state.data) onCounts(state.data.counts) }, [state.data, onCounts])
  return <section className="min-w-0 space-y-4 p-4 sm:p-5" aria-label="Pengguna terdaftar">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">Pendaftar aplikasi</h2><p className="mt-1 text-sm text-slate-600">Semua akun muncul sejak mendaftar, termasuk yang belum verifikasi email. Diperbarui otomatis setiap 5 detik saat halaman terlihat.</p></div><button type="button" onClick={() => void state.load()} disabled={state.loading} className={buttonClass}>Perbarui pendaftar</button></div>
    <input aria-label="Cari pendaftar" value={state.query} maxLength={120} onChange={(e) => state.search(e.target.value)} placeholder="Cari nama atau email di semua pendaftar" className={inputClass} />
    {state.data && <p className="text-sm text-slate-600">{state.data.counts.registered} akun terdaftar · {state.data.counts.without_license} belum punya lisensi · {state.data.counts.unverified} belum verifikasi email</p>}
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
    {state.loading && <p role="status" className="text-sm text-slate-500">Memuat pendaftar…</p>}
    <div className="space-y-3">{state.data?.users.map((user) => <article key={user.id} data-customer-id={user.id} className="min-w-0 rounded-xl border border-slate-200 p-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><h3 className="break-words text-base font-bold">{user.display_name}</h3><p className="mt-1 break-all text-sm text-slate-600">{user.email}</p><p className="mt-2 text-xs text-slate-500">Daftar: {date(user.created_at)}{user.last_sign_in_at ? ` · Login terakhir: ${date(user.last_sign_in_at)}` : ' · Belum pernah login'}</p></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${user.email_confirmed_at ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{user.email_confirmed_at ? 'Email terverifikasi' : 'Menunggu verifikasi'}</span></div>
      {!user.licenses.length ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Belum memiliki lisensi</p><button type="button" onClick={() => onCreate(user)} className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white">Buat lisensi</button></div> : <div className="mt-4 space-y-2">
        {user.licenses.map((license) => <div key={license.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><div className="min-w-0 text-sm"><p className="break-words font-semibold">{license.label} · {license.plan}</p><p className="mt-1 text-slate-600">{license.status === 'active' && new Date(license.expires_at).getTime() <= Date.now() ? 'Kedaluwarsa' : license.status} · {license.max_devices} instalasi · {license.max_monitored} host</p><p className="mt-1 text-xs text-slate-500">Berlaku sampai {date(license.expires_at)}</p></div><button type="button" onClick={() => onEdit(license)} className={buttonClass}>Atur lisensi</button></div>)}
        <button type="button" onClick={() => onCreate(user)} className="px-1 py-2 text-sm font-semibold text-purple-700">Buat lisensi tambahan</button>
      </div>}
    </article>)}</div>
    {!state.loading && state.data && !state.data.users.length && <p className="py-8 text-center text-sm text-slate-500">Tidak ada pendaftar yang sesuai pencarian.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"><span>Halaman {state.page + 1} · {state.data?.total ?? 0} pendaftar ditemukan</span><div className="flex gap-2"><button type="button" onClick={() => state.setPage((p) => p - 1)} disabled={state.page === 0 || state.loading} className={buttonClass}>Pendaftar sebelumnya</button><button type="button" onClick={() => state.setPage((p) => p + 1)} disabled={!state.data || (state.page + 1) * state.data.perPage >= state.data.total || state.loading} className={buttonClass}>Pendaftar berikutnya</button></div></div>
  </section>
}

export function RegisteredUserPicker({ onSelect }: { onSelect: (user: RegisteredUser) => void }) {
  const state = useRegisteredUsers(0)
  return <fieldset className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4"><legend className="px-1 text-sm font-bold">Pilih pengguna terdaftar</legend>
    <input aria-label="Cari pengguna untuk lisensi" maxLength={120} value={state.query} onChange={(e) => state.search(e.target.value)} placeholder="Cari nama atau email pengguna" className={inputClass} />
    {state.error && <p role="alert" className="text-sm text-red-800">{state.error}</p>}
    <select aria-label="Pilih pengguna terdaftar" value="" disabled={state.loading} onChange={(e) => { const user = state.data?.users.find((u) => u.id === e.target.value); if (user) onSelect(user) }} className={inputClass}><option value="">{state.loading ? 'Memuat pengguna…' : 'Pilih akun dari hasil pencarian'}</option>{state.data?.users.map((u) => <option key={u.id} value={u.id}>{u.display_name} — {u.email}</option>)}</select>
    <p className="text-xs text-slate-600">Mencari di seluruh akun. Persempit pencarian bila pengguna belum ada pada 25 hasil pertama.</p>
    {!state.loading && state.data && !state.data.users.length && <p className="text-sm text-slate-600">Tidak ada akun yang sesuai. Pengguna perlu mendaftar di aplikasi terlebih dahulu.</p>}
  </fieldset>
}
