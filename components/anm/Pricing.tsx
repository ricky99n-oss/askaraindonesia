'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Product } from '@/lib/anm/shop-types'
import { rupiah } from '@/lib/anm/shop-types'
export default function Pricing() {
  const [products, setProducts] = useState<Product[]>([]), [error, setError] = useState('')
  useEffect(() => { let active = true; fetch('/api/anm/catalog', { cache: 'no-store' }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(); if (active) setProducts(result.products) }).catch(() => { if (active) setError('Harga belum dapat dimuat. Silakan muat ulang halaman atau hubungi Askara.') }); return () => { active = false } }, [])
  return <div id="paket" className="scroll-mt-28">
    <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[.22em] text-purple-300">Paket & harga</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Pilih sesuai kebutuhan jaringan.</h2><p className="mt-4 text-slate-400">Satu akun, masa aktif yang jelas, dan kuota instalasi sesuai paket. Pembelian baru maupun perpanjangan melalui QRIS.</p></div>
    {error && <p role="alert" className="rounded-2xl border border-amber-400/30 p-6 text-center text-amber-200">{error}</p>}
    {!products.length && !error && <p className="py-10 text-center text-slate-400">Memuat paket...</p>}
    <div className="grid gap-5 lg:grid-cols-3">{products.map(product => <article key={product.code} className={'relative flex flex-col rounded-3xl border p-7 sm:p-8 ' + (product.code === 'professional' ? 'border-purple-400/70 bg-purple-400/10' : 'border-white/10 bg-white/[.03]')}>
      <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">{product.label}</h3>{product.compare_at_idr && product.compare_at_idr > product.amount_idr ? <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-950">PROMO</span> : product.code === 'professional' ? <span className="rounded-full bg-purple-300/15 px-3 py-1 text-xs font-semibold text-purple-200">Untuk tim kecil</span> : null}</div>
      <p className="mt-7 h-6 text-sm text-slate-400">{product.compare_at_idr && product.compare_at_idr > product.amount_idr ? <s>{rupiah(product.compare_at_idr)}</s> : 'Lisensi aplikasi'}</p>
      <p className="mt-1 text-4xl font-bold tracking-tight">{rupiah(product.amount_idr)}</p><p className="mt-2 text-sm text-slate-400">per {product.duration_days} hari</p>
      <ul className="my-7 flex-1 space-y-3 text-slate-300">{[product.max_devices + ' instalasi perangkat', product.max_monitored + ' perangkat jaringan dipantau', 'Dashboard, scan LAN & topologi', 'Lokasi, pencarian & ekspor CSV', 'Perpanjangan masa aktif tersedia'].map(text => <li key={text} className="flex gap-3"><span aria-hidden="true" className="text-purple-300">✓</span>{text}</li>)}</ul>
      <Link href={'/askaranetworkmonitoring/beli?paket=' + product.code} className={'rounded-xl px-5 py-3.5 text-center font-semibold transition hover:brightness-110 ' + (product.code === 'professional' ? 'bg-purple-400 text-slate-950' : 'bg-white/10 text-white')}>Pilih {product.label}</Link>
    </article>)}</div><p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-slate-500">Instalasi adalah HP/PC tempat aplikasi diaktifkan. Perangkat jaringan dipantau adalah router, access point, CCTV, komputer, atau printer yang masuk daftar monitoring. Kuota pemantauan dijumlahkan dari semua lokasi dalam satu akun.</p>
  </div>
}
