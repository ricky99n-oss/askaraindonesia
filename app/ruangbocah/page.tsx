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
    title: 'Konsultasi Telemedis Spesialis Anak',
    description: 'Terhubung dengan Dokter Spesialis Anak, kirim foto, chat real-time, dan simpan riwayat konsultasi dalam satu aplikasi.',
    points: ['Sistem koin untuk sesi konsultasi', 'Chat real-time', 'Rekam medis dan ulasan dokter'],
  },
  {
    icon: '📈',
    tone: 'bg-orange-100',
    title: 'Pantau Tumbuh Kembang Menyeluruh',
    description: 'Catat berat, tinggi, nutrisi, tidur, gejala, dan imunisasi agar perkembangan si Kecil lebih mudah dipantau.',
    points: ['Grafik pertumbuhan interaktif', 'Riwayat nutrisi dan tidur', 'Pengingat vaksin dan imunisasi'],
  },
  {
    icon: '🧩',
    tone: 'bg-blue-100',
    title: 'Aktivitas Edukatif & Poin Anak',
    description: 'Permainan sensorik dan kognitif, sistem poin serta lencana, ditambah audio penenang untuk rutinitas tidur anak.',
    points: ['Game edukasi interaktif', 'Poin dan lencana anak', 'White noise dan lullaby'],
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
          <PhoneScreenshot src="/ruangbocah/app-login.png" alt="Tampilan login aplikasi Ruang Bocah di Android" priority />
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Tampilan aplikasi nyata" title="Dibuat untuk keluarga Indonesia" description="Screenshot berikut diambil langsung dari aplikasi Ruang Bocah yang berjalan di perangkat Android." />
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <ScreenshotCard src="/ruangbocah/app-login.png" alt="Layar masuk Ruang Bocah" title="Masuk dan kelola akun dengan aman" description="Login email, pemulihan kata sandi, serta akses masuk Google tersedia dari satu layar." />
            <ScreenshotCard src="/ruangbocah/app-home-premium.png" alt="Beranda dan status premium Ruang Bocah" title="Beranda keluarga dan langganan premium" description="Akses pertumbuhan, aktivitas, konsultasi, poin anak, dan perpanjangan premium dari akun yang sama." />
            <ScreenshotCard src="/ruangbocah/app-subscription-popup.png" alt="Pilihan aktivasi aplikasi Ruang Bocah" title="Aktivasi langsung setelah login" description="Pengguna baru mendapat petunjuk aktivasi dan dapat memilih paket 6, 8, atau 12 bulan melalui QRIS." />
            <ScreenshotCard src="/ruangbocah/app-games.png" alt="Pusat permainan edukatif Ruang Bocah" title="Permainan edukatif dengan leveling" description="Enam aktivitas ringan dengan visual baru, progres level, audio, dan tingkat kesulitan adaptif." />
            <ScreenshotCard src="/ruangbocah/app-wallet-qris.png" alt="Pembayaran QRIS di aplikasi Ruang Bocah" title="Pembayaran QRIS yang terhubung ke akun" description="Transaksi menyertakan User ID dan Transaction ID, lalu bukti pembayaran dikirim langsung ke admin melalui WhatsApp." />
            <ScreenshotCard src="/ruangbocah/app-onboarding.png" alt="Panduan fitur pertama kali Ruang Bocah" title="Panduan singkat saat pertama masuk" description="Tur modern memperkenalkan pertumbuhan, dokter, Kancil AI, permainan, profil anak, dan pembayaran." />
            <ScreenshotCard src="/ruangbocah/app-flashcards.png" alt="Flashcard hewan Ruang Bocah" title="Flashcard hewan yang lebih jelas" description="Enam belas hewan dengan ilustrasi besar, nama, suara, progres level, dan efek kemenangan." />
            <ScreenshotCard src="/ruangbocah/app-rabbit-run.png" alt="Permainan Kelinci Lari Ruang Bocah" title="Kelinci Lari tanpa overlay pengganggu" description="Arena lapang, instruksi ringkas, ilustrasi kelinci baru, tingkat kecepatan bertahap, suara, dan confetti." />
            <ScreenshotCard src="/ruangbocah/app-articles.png" alt="Artikel pengasuhan Ruang Bocah" title="Artikel terkurasi dari sumber tepercaya" description="Panduan pertumbuhan, MPASI, tidur, imunisasi, perkembangan, aktivitas, dan kesehatan gigi dengan referensi resmi." />
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
            <div className="mt-8 text-5xl font-black">Mulai Rp 99K<span className="text-lg font-normal text-purple-200"> /6 bulan</span></div>
            <p className="mt-3 text-sm text-purple-100">Pilih 6 bulan + 80 koin, 8 bulan + 120 koin, atau promo 12 bulan + 180 koin.</p>
          </div>
          <div className="p-10">
            <h3 className="text-xl font-bold">Yang Anda dapatkan</h3>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              {['6 bulan Rp99K', '8 bulan Rp149K', '12 bulan Rp169K (dari Rp199K)', 'Bonus hingga 180 koin', 'Akses telemedis', 'Metrik pertumbuhan', 'Pusat bermain edukatif'].map((item) => <div key={item} className="flex gap-2"><span className="text-orange-500">★</span>{item}</div>)}
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
