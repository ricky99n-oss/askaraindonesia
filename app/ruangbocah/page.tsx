import Image from 'next/image'
import Link from 'next/link'
import {
  RUANG_BOCAH_ANDROID_32_DOWNLOAD_URL,
  RUANG_BOCAH_ANDROID_DOWNLOAD_URL,
  RUANG_BOCAH_VERSION,
} from '@/lib/ruangbocah/downloads'

export const metadata = {
  title: 'Ruang Bocah | Ekosistem Parenting & Tumbuh Kembang Anak',
  description: 'Aplikasi Android untuk memantau tumbuh kembang anak dan menikmati aktivitas edukatif keluarga.',
}

const features = [
  {
    icon: '🩺',
    tone: 'bg-purple-100',
    title: 'Konsultasi — Segera Hadir',
    description: 'Fitur konsultasi sedang dipersiapkan agar Ayah dan Bunda mendapatkan layanan terbaik saat resmi tersedia.',
    points: ['Status segera hadir tampil di aplikasi', 'Menu dinonaktifkan sementara', 'Informasi peluncuran akan diumumkan kemudian'],
  },
  {
    icon: '📈',
    tone: 'bg-orange-100',
    title: 'Pantau Tumbuh Kembang & Milestone',
    description: 'Simpan, edit, dan hapus catatan tinggi, berat, makan, tidur, imunisasi, serta 5 pilar milestone tumbuh kembang.',
    points: ['CRUD lengkap untuk seluruh catatan anak', 'Target 5 pilar milestone & panduan stimulasi', 'Pengingat imunisasi & deteksi red flag'],
  },
  {
    icon: '📖',
    tone: 'bg-emerald-100',
    title: 'Buku Cerita Bergambar Nusantara',
    description: 'Koleksi dongeng dan legenda Nusantara berilustrasi indah dengan animasi buka buku, mode landscape 2-halaman, dan pesan moral.',
    points: ['Animasi slide halaman buku khas nusantara', 'Pesan moral & panduan diskusi orang tua-anak', 'Tersedia mode baca santai & mode gelap'],
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
              Pantau kesehatan dan nikmati aktivitas edukatif keluarga dalam satu aplikasi. Fitur konsultasi sedang dipersiapkan dan akan segera hadir. Pengguna baru mendapat Free Trial 3 hari.
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
              <span className="rounded-full bg-orange-400/30 px-3 py-1.5 text-orange-50">Free Trial 3 Hari</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-purple-100">iOS segera hadir</span>
            </div>
            <p className="mt-3 text-xs text-purple-200">Versi {RUANG_BOCAH_VERSION} · Android 64-bit · 77,3 MB</p>
            <p className="mt-2 text-xs text-purple-100">Versi terbaru dapat diunduh dan dibuka langsung dari menu notifikasi aplikasi.</p>
          </div>
          <PhoneScreenshot src="/ruangbocah/v101-home-features.png" alt="Beranda aplikasi Ruang Bocah dengan fitur tumbuh kembang, aktivitas, dan Kancil AI" priority />
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-purple-100 bg-purple-50 p-7 md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-purple-600">Panduan instalasi Android</p>
          <h2 className="mt-3 text-2xl font-black md:text-3xl">Instal Ruang Bocah dalam beberapa langkah</h2>
          <ol className="mt-7 grid gap-4 text-sm text-slate-700 md:grid-cols-3">
            <li className="rounded-2xl bg-white p-5 shadow-sm"><strong className="mb-2 block text-purple-700">1. Unduh APK</strong>Tekan tombol Unduh untuk Android, lalu buka file APK setelah unduhan selesai.</li>
            <li className="rounded-2xl bg-white p-5 shadow-sm"><strong className="mb-2 block text-purple-700">2. Izinkan instalasi</strong>Jika diminta, izinkan browser memasang aplikasi dari sumber ini, kemudian kembali ke installer.</li>
            <li className="rounded-2xl bg-white p-5 shadow-sm"><strong className="mb-2 block text-purple-700">3. Pindai dan instal</strong>Jika Google Play Protect muncul, pilih <em>Pindai aplikasi</em>. Setelah hasil pemindaian aman, pilih <em>Tetap instal</em> atau <em>Install anyway</em>.</li>
          </ol>
          <p className="mt-5 text-xs leading-relaxed text-slate-500">Jangan menonaktifkan Google Play Protect. Pastikan APK diunduh hanya dari halaman resmi Askara Indonesia ini.</p>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Tampilan aplikasi nyata" title="Dibuat untuk keluarga Indonesia" description="Kenali manfaat setiap fitur Ruang Bocah untuk membantu orang tua mendampingi tumbuh kembang si Kecil." />
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <ScreenshotCard src="/ruangbocah/v101-home-features.png" alt="Beranda fitur utama Ruang Bocah" title="Kebutuhan si Kecil dalam satu beranda simetris" description="Orang tua dapat membuka catatan pertumbuhan, milestone, imunisasi, nutrisi, buku cerita, aktivitas, pola tidur, dan konsultasi dokter langsung dari beranda yang rapi." />
            <ScreenshotCard src="/ruangbocah/v101-storybook.png" alt="Buku Cerita Bergambar Nusantara Ruang Bocah" title="Buku Cerita Bergambar Nusantara" description="Koleksi cerita rakyat dan dongeng budi pekerti dengan ilustrasi memukau, animasi transisi halaman khas buku, mode bentang landscape 2 halaman, dan panduan diskusi moral keluarga." />
            <ScreenshotCard src="/ruangbocah/v101-milestone.png" alt="Milestone Tumbuh Kembang Ruang Bocah" title="Milestone Tumbuh Kembang 5 Pilar" description="Pantau target perkembangan motorik kasar, halus, bahasa, sosial-emosi, dan kognitif si Kecil sesuai rentang usia dengan checklist terstruktur dan ide stimulasi." />
            <ScreenshotCard src="/ruangbocah/v101-profile.png" alt="Profil Anak dan Orang Tua Ruang Bocah" title="Profil Anak & Manajemen Terintegrasi" description="Kelola data multi-anak, cek saldo koin reward, status langganan VIP, catatan aktivitas, dan pengaturan proteksi layar si Kecil dalam satu halaman profil terpadu." />
            <ScreenshotCard src="/ruangbocah/v101-subscription-popup.png" alt="Pilihan aktivasi aplikasi Ruang Bocah" title="Pilih masa akses sesuai kebutuhan" description="Tersedia Paket Hemat 3 bulan, Paket Keluarga 6 bulan, atau Paket Setahun 12 bulan. Setelah pembayaran disetujui, seluruh fitur dapat digunakan sesuai masa aktif yang dipilih." />
            <ScreenshotCard src="/ruangbocah/v101-growth.png" alt="Grafik pertumbuhan tinggi dan berat badan anak" title="Lihat perkembangan tinggi dan berat badan" description="Catatan tinggi dan berat badan disusun menjadi grafik sehingga orang tua lebih mudah melihat perubahan pertumbuhan si Kecil dari waktu ke waktu." />
            <ScreenshotCard src="/ruangbocah/v101-doctors.png" alt="Pratinjau konsultasi Ruang Bocah" title="Konsultasi segera hadir" description="Layanan konsultasi sedang kami persiapkan dan untuk sementara dinonaktifkan di dalam aplikasi." />
            <ScreenshotCard src="/ruangbocah/v101-games.png" alt="Permainan Domba Awan di Ruang Bocah versi 1.0.1" title="Belajar merawat lewat Domba Awan" description="Anak memilih domba, merawatnya tahap demi tahap, mengumpulkan wol, dan membuat aksesori. Setiap level melatih urutan kegiatan, koordinasi tangan, dan tanggung jawab sederhana." />
            <ScreenshotCard src="/ruangbocah/v101-wallet-qris.png" alt="Pembayaran QRIS di aplikasi Ruang Bocah" title="Bayar dengan QRIS secara mudah" description="Pilih paket, pindai QRIS, lalu kirim bukti pembayaran melalui WhatsApp. Pembayaran akan dicatat pada akun yang digunakan." />
            <ScreenshotCard src="/ruangbocah/v101-onboarding.png" alt="Panduan fitur pertama kali Ruang Bocah" title="Dipandu sejak pertama masuk" description="Wizard membantu orang tua membuat profil si Kecil terlebih dahulu, lalu menyorot langsung menu profil, pertumbuhan, pencatatan harian, konsultasi, aktivitas, dan Kancil AI satu per satu." />
            <ScreenshotCard src="/ruangbocah/v101-parent-reward.png" alt="Hadiah permainan anak di Ruang Bocah" title="Apresiasi progres bermain anak" description="Setelah menyelesaikan aktivitas, anak memperoleh hadiah visual. Orang tua dapat melihat progres dan memberi semangat untuk melanjutkan kebiasaan baik." />
            <ScreenshotCard src="/ruangbocah/v101-flashcards.png" alt="Flashcard hewan Ruang Bocah" title="Kenalkan berbagai hewan kepada anak" description="Gambar berukuran besar, nama, dan suara membantu anak mengenali 16 jenis hewan sambil menambah kosakata dengan cara yang menyenangkan." />
            <ScreenshotCard src="/ruangbocah/v101-rabbit-run.png" alt="Permainan Kelinci Lari Ruang Bocah" title="Latih fokus lewat Kelinci Lari" description="Anak membantu kelinci melompati rintangan. Permainan ini melatih perhatian, ketepatan waktu, dan koordinasi tangan secara bertahap." />
            <ScreenshotCard src="/ruangbocah/v101-articles.png" alt="Artikel pengasuhan Ruang Bocah" title="Bacaan praktis untuk mendampingi anak" description="Temukan panduan tentang pertumbuhan, MPASI, tidur, imunisasi, aktivitas, perkembangan anak, dan kesehatan gigi yang dirangkum dari sumber tepercaya." />
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Semua dalam satu aplikasi" title="Fitur lengkap Ruang Bocah" description="Fitur orang tua dan anak tersinkron dengan akun Ruang Bocah. Konsultasi akan segera hadir." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="mt-3 text-sm text-purple-100">Coba gratis 3 hari untuk akun baru, lalu pilih 3 bulan + 50 koin, 6 bulan + 100 koin, atau 12 bulan + 150 koin.</p>
          </div>
          <div className="p-10">
            <h3 className="text-xl font-bold">Yang Anda dapatkan</h3>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              {['3 bulan Rp99K + 50 koin', '6 bulan Rp149K + 100 koin', '12 bulan Rp180K + 150 koin', 'Top up mulai 50 koin', 'Konsultasi segera hadir', 'Metrik pertumbuhan', 'Pusat bermain edukatif'].map((item) => <div key={item} className="flex gap-2"><span className="text-orange-500">★</span>{item}</div>)}
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
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">Unduh aplikasi dan buat akun orang tua untuk menikmati Free Trial 3 hari. Setelahnya, pembelian premium atau koin dari menu Dompet langsung terhubung ke akun.</p>
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
