'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL,
  RUANG_BOCAH_ANDROID_DOWNLOAD_URL,
  RUANG_BOCAH_VERSION,
} from '@/lib/ruangbocah/downloads'

function SubscribeContent() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState(searchParams.get('uid') ?? '')
  const [username, setUsername] = useState('')
  const [transactionId, setTransactionId] = useState(searchParams.get('transaction') ?? '')

  const whatsappUrl = useMemo(() => {
    const message = [
      'Halo Admin Askara, saya sudah membayar Akses Awal Ruang Bocah melalui QRIS.',
      'Nominal: Rp 99.000',
      `Username/Email: ${username || '[isi username atau email]'}`,
      `User ID: ${userId || '[isi User ID]'}`,
      `Transaction ID: ${transactionId || '[isi Transaction ID dari menu Dompet]'}`,
      'Saya akan melampirkan screenshot/foto bukti pembayaran pada chat ini.',
      'Mohon verifikasi dan aktifkan akses akun saya.',
    ].join('\n')
    return `https://wa.me/6285815999953?text=${encodeURIComponent(message)}`
  }, [transactionId, userId, username])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/ruangbocah" className="text-sm font-semibold text-purple-700 hover:text-purple-900">← Kembali ke Ruang Bocah</Link>

        <div className="mt-8 grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-purple-700 p-8 text-white md:p-12">
            <div className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider">Langkah pertama</div>
            <h1 className="mt-6 text-3xl font-black md:text-4xl">Unduh aplikasi Ruang Bocah</h1>
            <p className="mt-4 leading-relaxed text-purple-100">Buat transaksi dari menu Dompet di aplikasi agar pembayaran otomatis terhubung dengan akun yang benar.</p>
            <div className="mt-7 space-y-4">
              <Step number="1" title="Unduh dan instal" detail="Gunakan APK Android resmi Ruang Bocah." />
              <Step number="2" title="Daftar atau masuk" detail="Popup aktivasi Rp99.000 muncul saat akses pertama." />
              <Step number="3" title="Bayar QRIS" detail="Scan QRIS, lalu tekan konfirmasi WhatsApp dan lampirkan bukti." />
            </div>
            <a href={RUANG_BOCAH_ANDROID_DOWNLOAD_URL} className="mt-8 flex w-full items-center justify-center rounded-xl bg-white px-6 py-4 font-bold text-purple-700 shadow-lg hover:bg-purple-50">Download Aplikasi Android</a>
            <a href={RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL} className="mt-3 block text-center text-xs font-semibold text-purple-100 underline underline-offset-4">Versi Android lama 32-bit</a>
            <p className="mt-4 text-center text-xs text-purple-200">Versi {RUANG_BOCAH_VERSION} · Tersedia untuk Android · iOS segera hadir</p>
          </section>

          <section className="p-7 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-purple-600">Akses awal aplikasi</p>
                <div className="mt-1 flex items-end gap-1"><span className="text-4xl font-black">Rp 99.000</span><span className="pb-1 text-sm text-slate-500">/akses awal</span></div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">QRIS resmi Askara</span>
            </div>

            <div className="mx-auto mt-6 max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <Image src="/ruangbocah/qris-askara.jpeg" alt="QRIS pembayaran Askara Indonesia" width={1136} height={1600} priority className="h-auto w-full rounded-xl" />
            </div>

            <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm leading-relaxed text-orange-950">
              Setelah membayar, isi identitas berikut. WhatsApp akan terbuka dengan data akun dan transaksi; <strong>lampirkan screenshot atau foto bukti pembayaran</strong> sebelum mengirim pesan.
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Username atau email" value={username} onChange={setUsername} placeholder="nama@email.com" />
              <Field label="User ID" value={userId} onChange={setUserId} placeholder="UUID dari aplikasi" />
              <div className="sm:col-span-2"><Field label="Transaction ID" value={transactionId} onChange={setTransactionId} placeholder="ID transaksi dari menu Dompet" /></div>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl bg-emerald-600 px-6 py-4 text-center font-bold text-white transition hover:bg-emerald-700">Konfirmasi & Lampirkan Bukti via WhatsApp</a>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">Akses awal Rp99.000 mencakup 30 hari premium dan 50 koin. Setelah akses awal aktif, perpanjangan 30 hari dan top up 50 koin masing-masing tetap Rp49.000.</p>
          </section>
        </div>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
}

function Step({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-black text-purple-700">{number}</span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-purple-200">{detail}</p></div></div>
}

export default function SubscribePage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-purple-50 text-purple-700">Memuat halaman pembayaran...</div>}><SubscribeContent /></Suspense>
}
