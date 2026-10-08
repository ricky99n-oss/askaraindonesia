'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL,
  RUANG_BOCAH_ANDROID_DOWNLOAD_URL,
  RUANG_BOCAH_VERSION,
} from '@/lib/ruangbocah/downloads'

function SubscribeContent() {
  const searchParams = useSearchParams()
  const uid = searchParams.get('uid')

  const whatsappUrl = useMemo(() => {
    if (!uid) return null
    const reference = `RB-WEB-${uid}`
    const message = [
      'Halo Admin Askara, saya ingin memperpanjang Ruang Bocah Premium selama 30 hari.',
      'Nominal: Rp 49.000',
      `Reference: ${reference}`,
      `User ID: ${uid}`,
      'Mohon kirim instruksi pembayaran dan approve setelah bukti transfer diverifikasi.',
    ].join('\n')
    return `https://wa.me/6285815999953?text=${encodeURIComponent(message)}`
  }, [uid])

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link href="/ruangbocah" className="text-sm font-semibold text-purple-700 hover:text-purple-900">← Kembali ke Ruang Bocah</Link>

        <div className="mt-8 grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-purple-700 p-8 text-white md:p-12">
            <div className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider">Langkah pertama</div>
            <h1 className="mt-6 text-3xl font-black md:text-4xl">Unduh aplikasi Ruang Bocah</h1>
            <p className="mt-4 leading-relaxed text-purple-100">Pembelian dan perpanjangan harus dimulai dari akun di aplikasi agar premium dan koin masuk ke pengguna yang benar.</p>
            <div className="mt-8 space-y-4">
              <Step number="1" title="Unduh dan instal" detail="Gunakan APK Android resmi dari storage Ruang Bocah." />
              <Step number="2" title="Daftar atau masuk" detail="Gunakan email yang akan menerima status premium." />
              <Step number="3" title="Buka menu Dompet" detail="Pilih Premium 30 Hari lalu lanjutkan instruksi pembayaran." />
            </div>
          </section>

          <section className="p-8 md:p-12">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">✓ Tersedia untuk Android</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">iOS segera hadir</span>
            </div>
            <h2 className="mt-6 text-2xl font-black">Ruang Bocah Android</h2>
            <p className="mt-2 text-sm text-slate-500">Versi {RUANG_BOCAH_VERSION} · Android 64-bit · 38,5 MB</p>

            <a href={RUANG_BOCAH_ANDROID_DOWNLOAD_URL} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-4 font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800">
              <span aria-hidden>↓</span> Download Aplikasi Android
            </a>
            <a href={RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL} className="mt-3 block text-center text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-purple-700">
              Perangkat lama? Unduh versi Android 32-bit
            </a>

            <div className="my-8 border-t border-slate-100" />

            <h3 className="text-xl font-bold">Ruang Bocah Premium</h3>
            <div className="mt-3 flex items-end gap-1"><span className="text-4xl font-black">Rp 49.000</span><span className="pb-1 text-sm text-slate-500">/30 hari</span></div>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {['Bonus 50 koin', 'Akses kurva pertumbuhan', 'Pusat bermain dan aktivitas', 'Pengingat imunisasi dan nutrisi'].map((item) => <li key={item} className="flex gap-3"><span className="font-bold text-emerald-500">✓</span>{item}</li>)}
            </ul>

            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-8 block rounded-xl bg-emerald-600 px-6 py-4 text-center font-bold text-white transition hover:bg-emerald-700">
                Lanjutkan Pembayaran via WhatsApp
              </a>
            ) : (
              <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-relaxed text-orange-900">
                Setelah login di aplikasi, lakukan pembelian dari menu <strong>Dompet</strong>. Admin akan memverifikasi pembayaran sebelum premium dan bonus koin diaktifkan.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function Step({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-black text-purple-700">{number}</span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-purple-200">{detail}</p></div></div>
}

export default function SubscribePage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-purple-50 text-purple-700">Memuat halaman unduhan...</div>}><SubscribeContent /></Suspense>
}
