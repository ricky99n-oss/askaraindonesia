import Image from 'next/image'
import Link from 'next/link'
import {
  RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL,
  RUANG_BOCAH_ANDROID_DOWNLOAD_URL,
  RUANG_BOCAH_VERSION,
} from '@/lib/ruangbocah/downloads'

export const metadata = {
  title: 'Ruang Bocah | Ekosistem Parenting & Tumbuh Kembang Anak',
  description: 'Aplikasi Android untuk memantau tumbuh kembang anak, konsultasi dokter spesialis, dan aktivitas edukatif.',
}

const features = [
  {
    icon: '🩺',
    tone: 'bg-purple-100',
    title: 'Tanya Dokter Spesialis Anak',
    description: 'Saat khawatir dengan kondisi si Kecil, orang tua dapat berkonsultasi dengan dokter anak langsung melalui aplikasi.',
    points: ['Ceritakan keluhan melalui chat', 'Kirim foto agar kondisi lebih mudah dijelaskan', 'Baca kembali riwayat konsultasi'],
  },
  {
    icon: '📈',
    tone: 'bg-orange-100',
    title: 'Pantau Tumbuh Kembang si Kecil',
    description: 'Simpan catatan tinggi, berat, makan, tidur, keluhan kesehatan, dan imunisasi agar perkembangan anak lebih mudah dipahami.',
    points: ['Lihat perubahan tinggi dan berat badan', 'Catat pola makan dan waktu tidur', 'Ingat jadwal imunisasi anak'],
  },
  {
    icon: '🧩',
    tone: 'bg-blue-100',
    title: 'Belajar dan Bermain Bersama',
    description: 'Pilihan permainan sederhana membantu anak belajar mengenal bentuk, warna, hewan, serta melatih fokus dan gerak tangan.',
    points: ['Permainan sesuai kemampuan anak', 'Hadiah poin sebagai penyemangat', 'Suara pengantar tidur untuk waktu istirahat'],
  },
]

export default function RuangBocahLandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-800 via-purple-700 to-fuchsia-600 px-6 pb-24 pt-16 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="mb-6 inline-flex rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              Produk unggulan Askara
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">Teman terbaik tumbuh kembang si Kecil</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-purple-100 md:mx-0">
              Pantau kesehatan, konsultasi dengan dokter anak, dan nikmati aktivitas edukatif keluarga dalam satu aplikasi.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <a href={RUANG_BOCAH_ANDROID_DOWNLOAD_URL} className="rounded-xl bg-orange-500 px-7 py-4 text-center font-bold text-white shadow-lg transition hover:bg-orange-600">
                Unduh untuk Android
              </a>
              <Link href="/ruangbocah/subscribe" className="rounded-xl bg-white px-7 py-4 text-center font-bold text-purple-700 shadow-lg transition hover:bg-purple-50">
                Lihat Premium
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm md:justify-start">
              <span className="rounded-full bg-white/15 px-3 py-1.5">✓ Tersedia untuk Android</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-purple-100">iOS segera hadir</span>
            </div>
            <p className="mt-3 text-xs text-purple-200">Versi {RUANG_BOCAH_VERSION} · Android 64-bit · 39,4 MB</p>
          </div>
          <PhoneScreenshot src="/ruangbocah/app-home-features.png" alt="Beranda aplikasi Ruang Bocah dengan fitur tumbuh kembang, aktivitas, konsultasi, dan Kancil AI" priority />
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Tampilan aplikasi nyata" title="Dibuat untuk keluarga Indonesia" description="Kenali manfaat setiap fitur Ruang Bocah untuk membantu orang tua mendampingi tumbuh kembang si Kecil." />
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <ScreenshotCard src="/ruangbocah/app-home-features.png" alt="Beranda fitur utama Ruang Bocah" title="Kebutuhan si Kecil dalam satu beranda" description="Orang tua dapat membuka catatan pertumbuhan, imunisasi, makan, tidur, permainan, dan konsultasi dokter dengan mudah dari halaman utama." />
            <ScreenshotCard src="/ruangbocah/app-subscription-popup.png" alt="Pilihan aktivasi aplikasi Ruang Bocah" title="Pilih masa akses sesuai kebutuhan" description="Tersedia pilihan akses 6, 8, atau 12 bulan. Setelah pembayaran disetujui, seluruh fitur dapat digunakan sesuai masa aktif yang dipilih." />
            <ScreenshotCard src="/ruangbocah/app-growth.png" alt="Grafik pertumbuhan tinggi dan berat badan anak" title="Lihat perkembangan tinggi dan berat badan" description="Catatan tinggi dan berat badan disusun menjadi grafik sehingga orang tua lebih mudah melihat perubahan pertumbuhan si Kecil dari waktu ke waktu." />
            <ScreenshotCard src="/ruangbocah/app-doctors.png" alt="Daftar dokter spesialis anak Ruang Bocah" title="Tanya langsung kepada dokter anak" description="Pilih dokter yang tersedia, ceritakan keluhan si Kecil, dan simpan percakapan agar dapat dibaca kembali saat dibutuhkan." />
            <ScreenshotCard src="/ruangbocah/app-games.png" alt="Permainan Domba Awan di Ruang Bocah" title="Belajar merawat lewat Domba Awan" description="Anak memilih domba, merawatnya tahap demi tahap, mengumpulkan wol, dan membuat aksesori. Setiap level melatih urutan kegiatan, koordinasi tangan, dan tanggung jawab sederhana." />
            <ScreenshotCard src="/ruangbocah/app-wallet-qris.png" alt="Pembayaran QRIS di aplikasi Ruang Bocah" title="Bayar dengan QRIS secara mudah" description="Pilih paket, pindai QRIS, lalu kirim bukti pembayaran melalui WhatsApp. Pembayaran akan dicatat pada akun yang digunakan." />
            <ScreenshotCard src="/ruangbocah/app-onboarding.png" alt="Panduan fitur pertama kali Ruang Bocah" title="Dipandu sejak pertama masuk" description="Wizard membantu orang tua membuat profil si Kecil terlebih dahulu, lalu menyorot langsung menu profil, pertumbuhan, pencatatan harian, konsultasi, aktivitas, dan Kancil AI satu per satu." />
            <ScreenshotCard src="/ruangbocah/app-parent-reward.png" alt="Hadiah permainan anak di Ruang Bocah" title="Apresiasi progres bermain anak" description="Setelah menyelesaikan aktivitas, anak memperoleh hadiah visual. Orang tua dapat melihat progres dan memberi semangat untuk melanjutkan kebiasaan baik." />
            <ScreenshotCard src="/ruangbocah/app-flashcards.png" alt="Flashcard hewan Ruang Bocah" title="Kenalkan berbagai hewan kepada anak" description="Gambar berukuran besar, nama, dan suara membantu anak mengenali 16 jenis hewan sambil menambah kosakata dengan cara yang menyenangkan." />
            <ScreenshotCard src="/ruangbocah/app-rabbit-run.png" alt="Permainan Kelinci Lari Ruang Bocah" title="Latih fokus lewat Kelinci Lari" description="Anak membantu kelinci melompati rintangan. Permainan ini melatih perhatian, ketepatan waktu, dan koordinasi tangan secara bertahap." />
            <ScreenshotCard src="/ruangbocah/app-articles.png" alt="Artikel pengasuhan Ruang Bocah" title="Bacaan praktis untuk mendampingi anak" description="Temukan panduan tentang pertumbuhan, MPASI, tidur, imunisasi, aktivitas, perkembangan anak, dan kesehatan gigi yang dirangkum dari sumber tepercaya." />
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Semua dalam satu aplikasi" title="Fitur lengkap Ruang Bocah" description="Fitur orang tua, anak, dan dokter tersinkron dengan akun Ruang Bocah." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-200/60">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${feature.tone}`}>{feature.icon}</div>
                <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {feature.points.map((point) => <li key={point} className="flex gap-2"><span className="font-bold text-emerald-500">✓</span>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-purple-50 px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-purple-700 p-10 text-white">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-200">Premium Membership</p>
            <h2 className="mt-4 text-3xl font-black">Lebih lengkap bersama si Kecil</h2>
            <div className="mt-8 text-5xl font-black">Mulai Rp 99K<span className="text-lg font-normal text-purple-200"> /3 bulan</span></div>
            <p className="mt-3 text-sm text-purple-100">Pilih 3 bulan + 50 koin, 6 bulan + 100 koin, atau 12 bulan + 150 koin.</p>
          </div>
          <div className="p-10">
            <h3 className="text-xl font-bold">Yang Anda dapatkan</h3>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              {['3 bulan Rp99K + 50 koin', '6 bulan Rp149K + 100 koin', '12 bulan Rp180K + 150 koin', 'Top up mulai 50 koin', 'Akses telemedis', 'Metrik pertumbuhan', 'Pusat bermain edukatif'].map((item) => <div key={item} className="flex gap-2"><span className="text-orange-500">★</span>{item}</div>)}
            </div>
            <Link href="/ruangbocah/subscribe" className="mt-8 block rounded-xl bg-purple-700 px-6 py-4 text-center font-bold text-white transition hover:bg-purple-800">
              Pilih Paket & Bayar via QRIS
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-400">Unduh Ruang Bocah</p>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">Mulai perjalanan tumbuh kembang hari ini</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Unduh aplikasi, buat akun orang tua, lalu lakukan pembelian premium atau koin dari menu Dompet agar transaksi langsung terhubung ke akun.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={RUANG_BOCAH_ANDROID_DOWNLOAD_URL} className="rounded-xl bg-orange-500 px-7 py-4 font-bold text-white hover:bg-orange-600">Unduh Android 64-bit</a>
            <a href={RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL} className="rounded-xl border border-slate-600 px-7 py-4 font-bold text-slate-200 hover:bg-slate-800">Android lama 32-bit</a>
          </div>
          <p className="mt-5 text-sm text-slate-400">Tersedia untuk Android · iOS segera hadir</p>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 pb-10 text-center text-sm text-slate-500">© 2026 PT Askara Indonesia · Ruang Bocah. Seluruh hak cipta dilindungi.</footer>
    </main>
  )
}

function PhoneScreenshot({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return <div className="mx-auto w-full max-w-[310px] rounded-[2.7rem] border-[9px] border-slate-900 bg-slate-900 p-1 shadow-2xl"><div className="relative overflow-hidden rounded-[2.1rem] bg-white"><Image src={src} alt={alt} width={1080} height={2181} priority={priority} unoptimized className="h-auto w-full" /></div></div>
}

function ScreenshotCard({ src, alt, title, description }: { src: string; alt: string; title: string; description: string }) {
  return <article className="grid items-center gap-7 rounded-3xl bg-white p-7 shadow-lg shadow-slate-200/70 sm:grid-cols-[180px_1fr]"><PhoneScreenshot src={src} alt={alt} /><div><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p></div></article>
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-purple-600">{eyebrow}</p><h2 className="mt-3 text-3xl font-black md:text-4xl">{title}</h2><p className="mt-4 text-slate-600">{description}</p></div>
}
