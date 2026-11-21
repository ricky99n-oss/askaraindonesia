'use client'
import Link from 'next/link'
import { useEffect, useState, FormEvent } from 'react'
import SecretInput from '@/components/anm/SecretInput'
import type { Product } from '@/lib/anm/shop-types'
import { rupiah } from '@/lib/anm/shop-types'
const field = 'mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-base text-white outline-none focus:border-purple-300'
export default function BuyNetworkMonitoring() {
  const [products, setProducts] = useState<Product[]>([]), [selected, setSelected] = useState('starter'), [kind, setKind] = useState('new')
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [loading, setLoading] = useState(true)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    setSelected(query.get('paket') || 'starter'); if (query.get('jenis') === 'renew') setKind('renew')
    let active = true
    fetch('/api/anm/catalog', { cache: 'no-store' }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); if (active) { setProducts(result.products); setReady(result.checkout_enabled) } }).catch(() => { if (active) setError('Paket belum dapat dimuat. Muat ulang halaman atau hubungi Askara.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const product = products.find(item => item.code === selected) || products[0]
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !ready || !product) return
    const form = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/anm/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(form.entries()), product: product.code, kind }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Pesanan belum berhasil dibuat.')
      try { sessionStorage.setItem('anm.order.' + result.id, result.access_token) } catch { /* The private email link remains available. */ }
      window.location.assign('/askaranetworkmonitoring/pesanan/' + result.id + '#token=' + encodeURIComponent(result.access_token))
    } catch (error) { setError(error instanceof Error ? error.message : 'Koneksi terputus. Coba lagi.'); setBusy(false) }
  }
  return <main className="min-h-screen bg-[#0b1019] px-5 py-8 text-white sm:px-8"><div className="mx-auto max-w-6xl"><Link href="/askaranetworkmonitoring" className="text-sm font-semibold text-purple-300">← Askara Network Monitoring</Link><div className="mb-10 mt-12"><p className="text-sm uppercase tracking-[.2em] text-slate-500">1. Data pesanan <span className="px-3">/</span> 2. Bayar QRIS <span className="px-3">/</span> 3. Verifikasi admin</p><h1 className="mt-5 text-3xl font-bold sm:text-4xl">Mulai pantau jaringan Anda.</h1><p className="mt-4 max-w-2xl leading-relaxed text-slate-400">Pilih paket, isi data pembelian, lalu lanjut ke QRIS. Lisensi diterbitkan atau diperpanjang setelah pembayaran diverifikasi admin.</p></div>
    <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]"><form noValidate onSubmit={submit} className="space-y-7 rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8">
      <fieldset><legend className="font-semibold">Jenis pesanan</legend><div className="mt-3 grid grid-cols-2 gap-3">{[['new', 'Lisensi baru'], ['renew', 'Perpanjangan']].map(([value, label]) => <label key={value} className={'cursor-pointer rounded-xl border p-4 text-sm ' + (kind === value ? 'border-purple-300 bg-purple-300/10 text-purple-100' : 'border-white/15 text-slate-400')}><input type="radio" name="order-kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="mr-2 accent-purple-400" />{label}</label>)}</div></fieldset>
      <label className="block text-sm font-medium">Paket<select aria-label="Paket" value={product?.code || selected} onChange={event => setSelected(event.target.value)} className={field}>{products.map(item => <option key={item.code} value={item.code}>{item.label} · {rupiah(item.amount_idr)} / {item.duration_days} hari</option>)}</select></label>
      <label className="block text-sm font-medium">Nama pembeli<input name="name" autoComplete="name" required maxLength={120} className={field} placeholder="Nama lengkap / nama usaha" /></label>
      <label className="block text-sm font-medium">Email pembelian<input name="email" type="email" autoComplete="email" required maxLength={254} className={field} placeholder="nama@email.com" /><span className="mt-2 block text-sm font-normal leading-relaxed text-slate-400">License key dan hasil pesanan dikirim ke email ini. Gunakan email yang sama saat masuk ke aplikasi.</span></label>
      <label className="block text-sm font-medium">Nomor WhatsApp <span className="font-normal text-slate-500">(opsional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} className={field} placeholder="08... / +62..." /></label>
      {kind === 'renew' && <label className="block text-sm font-medium">License key yang diperpanjang<SecretInput name="license_key" label="license key" autoComplete="off" required maxLength={100} className={field} placeholder="ASKARA-..." /><span className="mt-2 block font-normal leading-relaxed text-slate-400">Pilih paket yang sama dengan lisensi Anda. Sisa masa aktif tetap dipertahankan.</span></label>}
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm leading-relaxed text-red-200">{error}</p>}
      {!ready && !loading && !error && <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Pembelian sedang disiapkan. Silakan <Link href="/contact" className="underline">hubungi Askara</Link> untuk bantuan.</p>}
      <button disabled={busy || !ready || !product} className="w-full rounded-xl bg-purple-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-purple-300 disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'Membuat pesanan...' : loading ? 'Memuat paket...' : 'Buat pesanan & lanjut bayar'}</button>
      <p className="text-xs leading-relaxed text-slate-500">Detail pesanan dan bukti pembayaran diteruskan ke admin Askara melalui Telegram untuk pemeriksaan. Baca <Link href="/privacy" className="text-slate-300 underline">kebijakan privasi</Link> dan <Link href="/terms" className="text-slate-300 underline">ketentuan layanan</Link>.</p>
    </form><aside className="space-y-5 lg:sticky lg:top-8"><div className="rounded-3xl border border-purple-300/25 bg-purple-300/5 p-7"><p className="text-sm text-purple-200">Ringkasan paket</p><h2 className="mt-3 text-2xl font-semibold">{product?.label || 'Memuat...'}</h2>{product?.compare_at_idr && product.compare_at_idr > product.amount_idr ? <s className="mt-5 block text-sm text-slate-500">{rupiah(product.compare_at_idr)}</s> : <div className="mt-5" />}<p className="mt-1 text-4xl font-bold">{product ? rupiah(product.amount_idr) : '—'}</p><p className="mt-2 text-slate-400">Masa aktif {product?.duration_days || '—'} hari</p><ul className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm text-slate-300"><li>✓ {product?.max_devices || '—'} instalasi perangkat</li><li>✓ {product?.max_monitored || '—'} perangkat jaringan dipantau</li><li>✓ Scan LAN, dashboard & topologi</li><li>✓ Lokasi, riwayat & ekspor CSV</li><li>✓ Estimasi kecepatan unduh</li></ul></div><p className="px-2 text-sm leading-relaxed text-slate-500">Rilis Android ARM64 dan Windows x64 tersedia. <Link href="/askaranetworkmonitoring#unduh" className="text-purple-200 underline underline-offset-4">Unduh aplikasi</Link>. Aplikasi memerlukan internet untuk login dan validasi lisensi; monitoring berjalan saat aplikasi terbuka.</p></aside></div>
  </div></main>
}
