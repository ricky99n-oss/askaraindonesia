'use client'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import RegisteredCustomers, { RegisteredUserPicker } from '@/components/anm/RegisteredCustomers'
import type { RegisteredUser, RegistrationCounts } from '@/lib/anm/admin-types'
type License = { id: string; label: string; customer_email: string; user_id: string | null; key_hint: string; plan: string; status: string; expires_at: string; max_devices: number; max_monitored: number }
type Activation = { id: string; license_id: string; device_name: string; revoked_at: string | null; last_seen_at: string }
type Audit = { id: number; action: string; license_id: string | null; created_at: string }
type Data = { licenses: License[]; activations: Activation[]; audit: Audit[]; total: number; counts: { active: number; expired: number; suspended: number } }
const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-purple-500'
function date(value: string) { return new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }) + ' WIB' }
function localDate(value: Date) { return new Date(value.getTime() + 7 * 3600000).toISOString().slice(0, 16) }
export default function NetworkMonitoringAdmin() {
  const [data, setData] = useState<Data | null>(null)
  const [page, setPage] = useState(0)
  const [tab, setTab] = useState('Pendaftar')
  const [recipient, setRecipient] = useState<RegisteredUser | null>(null)
  const [registrationCounts, setRegistrationCounts] = useState<RegistrationCounts | null>(null)
  const [customerRefresh, setCustomerRefresh] = useState(0)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<License | 'new' | null>(null)
  const [newKey, setNewKey] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/internal/anm?page=${page}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal memuat data.')
      setData(result); setError('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Koneksi terputus.') }
    finally { setLoading(false) }
  }, [page])
  useEffect(() => { void load() }, [load])
  function openCreate(user: RegisteredUser | null = null) { setRecipient(user); setEditing('new'); setError('') }
  function openEdit(license: License) { setRecipient(null); setEditing(license); setError('') }
  async function mutate(body: Record<string, unknown>) {
    const response = await fetch('/api/internal/anm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Perubahan gagal.')
    return result
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return
    setBusy(true); setError('')
    const fields = new FormData(event.currentTarget)
    try {
      const body: Record<string, unknown> = Object.fromEntries(fields.entries())
      if (editing === 'new') {
        if (!recipient) throw new Error('Pilih pengguna terdaftar terlebih dahulu.')
        body.customer_id = recipient.id
      }
      body.expires_at = new Date(String(body.expires_at) + ':00+07:00').toISOString()
      const result = await mutate({ ...body, action: editing === 'new' ? 'create' : 'update', id: editing && editing !== 'new' ? editing.id : undefined })
      setEditing(null); setRecipient(null); setCustomerRefresh((v) => v + 1); if (result.key) setNewKey(result.key); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Perubahan gagal.') }
    finally { setBusy(false) }
  }
  async function revoke(activation: Activation) {
    if (!window.confirm(`Cabut akses ${activation.device_name}? Instalasi ini akan diblokir dan satu slot perangkat dilepas.`)) return
    setBusy(true)
    try { await mutate({ action: 'revoke_device', id: activation.id }); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Perubahan gagal.') }
    finally { setBusy(false) }
  }
  const licenses = data?.licenses.filter((l) => `${l.label} ${l.customer_email} ${l.key_hint}`.toLowerCase().includes(search.toLowerCase())) ?? []
  const current = editing && editing !== 'new' ? editing : null
  return <div className="mx-auto max-w-7xl space-y-6 text-slate-900">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-purple-600">Askara · Software licensing</p><h1 className="mt-2 text-3xl font-bold">Network Monitoring</h1><p className="mt-2 text-base text-slate-600">Kelola pelanggan, masa aktif, dan akses aplikasi Android / Windows.</p></div>
      <button onClick={() => openCreate()} className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800">Buat lisensi</button></div>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">{[['Pengguna terdaftar', registrationCounts?.registered], ['Total lisensi', data?.total], ['Aktif', data?.counts.active], ['Kedaluwarsa', data?.counts.expired], ['Ditangguhkan / dicabut', data?.counts.suspended]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold">{value ?? '—'}</p></div>)}</div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
    {newKey && <div className="space-y-3 rounded-2xl border border-purple-300 bg-purple-50 p-5"><h2 className="font-bold">Lisensi dibuat. Salin kunci sekarang.</h2><p className="text-sm">Kunci lengkap hanya ditampilkan sekali. Berikan kepada pelanggan melalui saluran pribadi.</p><code className="block break-all rounded-lg bg-white p-4 text-base">{newKey}</code><div className="flex gap-4"><button className="font-semibold text-purple-800" onClick={async () => { try { await navigator.clipboard.writeText(newKey) } catch { setError('Salin kunci secara manual dari kotak di atas.') } }}>Salin kunci</button><button onClick={() => setNewKey('')} className="text-slate-700">Tutup setelah disimpan</button></div></div>}
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2">{['Pendaftar', 'Lisensi', 'Perangkat', 'Audit'].map((name) => <button key={name} onClick={() => setTab(name)} className={`rounded-xl px-4 py-2.5 font-medium ${tab === name ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>{name}</button>)}</div><button onClick={() => void load()} disabled={loading} className="rounded-xl border bg-white px-4 py-2.5 disabled:opacity-50">{loading ? 'Memuat…' : 'Perbarui data'}</button></div>
    {tab !== 'Pendaftar' && <input aria-label="Cari lisensi pada halaman ini" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama pelanggan, email, atau akhir kunci pada halaman ini" className={inputClass} />}
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      {tab === 'Lisensi' && <table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Pelanggan / kunci', 'Paket', 'Status', 'Masa aktif (WIB)', 'Kuota', 'Kelola'].map((v) => <th key={v} className="whitespace-nowrap px-5 py-4 font-semibold">{v}</th>)}</tr></thead><tbody>{licenses.map((l) => <tr key={l.id} className="border-t border-slate-100"><td className="px-5 py-4"><p className="text-base font-semibold">{l.label}</p><p className="mt-1 text-slate-600">{l.customer_email}</p><code className="text-xs text-slate-500">•••• {l.key_hint}</code></td><td className="px-5 py-4 capitalize">{l.plan}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 ${l.status === 'active' && new Date(l.expires_at).getTime() > Date.now() ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{l.status === 'active' && new Date(l.expires_at).getTime() <= Date.now() ? 'expired' : l.status}</span></td><td className="whitespace-nowrap px-5 py-4">{date(l.expires_at)}</td><td className="whitespace-nowrap px-5 py-4">{data?.activations.filter((a) => a.license_id === l.id && !a.revoked_at).length}/{l.max_devices} instalasi<br />{l.max_monitored} host</td><td className="px-5 py-4"><button onClick={() => openEdit(l)} className="font-semibold text-purple-700">Atur lisensi</button></td></tr>)}</tbody></table>}
      {tab === 'Pendaftar' && <RegisteredCustomers onCreate={openCreate} onEdit={openEdit} onCounts={setRegistrationCounts} refreshKey={customerRefresh} />}
      {tab === 'Perangkat' && <div className="divide-y">{data?.activations.filter((a) => licenses.some((l) => l.id === a.license_id)).map((a) => <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="font-bold">{a.device_name}</h2><p className="text-sm text-slate-600">{licenses.find((l) => l.id === a.license_id)?.customer_email} · Terakhir: {date(a.last_seen_at)}</p></div>{a.revoked_at ? <span className="text-sm text-red-700">Akses dicabut</span> : <button onClick={() => void revoke(a)} disabled={busy} className="rounded-lg border border-red-200 px-4 py-2 text-red-700 disabled:opacity-50">Cabut akses</button>}</div>)}</div>}
      {tab === 'Audit' && <div className="divide-y">{data?.audit.map((a) => <div key={a.id} className="p-5"><p className="font-semibold">{a.action}</p><p className="mt-1 text-sm text-slate-600">{date(a.created_at)} · Lisensi {a.license_id?.slice(0,8) ?? '—'}</p></div>)}</div>}
      {!loading && data && ((tab === 'Lisensi' && !licenses.length) || (tab === 'Perangkat' && !data.activations.length) || (tab === 'Audit' && !data.audit.length)) && <p className="p-10 text-center text-slate-500">Belum ada data. Buat lisensi pertama untuk pelanggan Anda.</p>}
    </div>
    {tab !== 'Pendaftar' && <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"><span>Halaman {page+1} · 50 lisensi per halaman · Audit menampilkan 50 aktivitas terbaru</span><div className="flex gap-3"><button disabled={page === 0 || loading} onClick={() => setPage((p) => p-1)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Sebelumnya</button><button disabled={!data || (page+1)*50 >= data.total || loading} onClick={() => setPage((p) => p+1)} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Berikutnya</button></div></div>}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"><form key={current?.id ?? recipient?.id ?? 'choose-user'} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="license-title" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><h2 id="license-title" className="text-2xl font-bold">{current ? 'Pengaturan lisensi' : 'Buat lisensi pengguna'}</h2>
      {!current && !recipient && <RegisteredUserPicker onSelect={setRecipient} />}
      {!current && recipient && <div className="rounded-xl bg-purple-50 p-4 text-sm"><p className="font-semibold">Pengguna dipilih: {recipient.display_name}</p><p className="mt-1 break-all">{recipient.email}</p><button type="button" disabled={busy} onClick={() => setRecipient(null)} className="mt-2 font-semibold text-purple-700">Ganti pengguna</button></div>}
      <label className="block space-y-2 text-sm font-semibold">Nama pelanggan<input name="label" required maxLength={120} defaultValue={current?.label ?? recipient?.display_name} className={inputClass} /></label>
      <label className="block space-y-2 text-sm font-semibold">Email akun<input name="customer_email" type="email" required maxLength={254} readOnly value={current?.customer_email ?? recipient?.email ?? ''} className={inputClass} /></label>
      <div className="grid grid-cols-2 gap-4"><label className="space-y-2 text-sm font-semibold">Paket<select name="plan" defaultValue={current?.plan ?? 'professional'} className={inputClass}>{['starter','professional','enterprise'].map((v) => <option key={v}>{v}</option>)}</select></label><label className="space-y-2 text-sm font-semibold">Status<select name="status" defaultValue={current?.status ?? 'active'} className={inputClass}>{['active','suspended','revoked'].map((v) => <option key={v}>{v}</option>)}</select></label></div>
      <label className="block space-y-2 text-sm font-semibold">Berlaku sampai (WIB)<input type="datetime-local" name="expires_at" required defaultValue={localDate(current ? new Date(current.expires_at) : new Date(Date.now()+30*86400000))} className={inputClass} /></label>
      <div className="grid grid-cols-2 gap-4"><label className="space-y-2 text-sm font-semibold">Batas instalasi<input name="max_devices" type="number" min={1} max={100} required defaultValue={current?.max_devices ?? 1} className={inputClass} /></label><label className="space-y-2 text-sm font-semibold">Kuota host dipantau<input name="max_monitored" type="number" min={1} max={4096} required defaultValue={current?.max_monitored ?? 50} className={inputClass} /></label></div>
      <p className="text-sm text-slate-600">Email diambil otomatis dari akun terpilih. Akun yang belum verifikasi tetap wajib memverifikasi email sebelum masuk dan aktivasi. Masa aktif mengikuti waktu server. Perubahan status dapat menghentikan akses aplikasi dalam 60 detik.</p>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} disabled={busy} className="rounded-xl border px-4 py-3">Batal</button><button disabled={busy || (!current && !recipient)} className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Menyimpan…' : 'Simpan lisensi'}</button></div></form></div>}
  </div>
}
