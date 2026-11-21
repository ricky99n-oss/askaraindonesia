import { anmDownloads } from '@/lib/anm/releases'

export default function Downloads() {
  return <section id="unduh" className="scroll-mt-24 border-t border-white/10 bg-white/[.015]">
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.22em] text-purple-300">Pilih perangkat Anda</p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Unduh Askara Network Monitoring</h2>
      <p className="mt-5 max-w-2xl leading-relaxed text-slate-400">Pantau jaringan dari ponsel atau PC. Masuk dengan email pembelian dan aktifkan license key yang sama, sesuai batas instalasi paket Anda.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="flex flex-col rounded-3xl border border-white/10 bg-[#111a26] p-7 sm:p-9">
          <p className="text-sm font-medium text-emerald-300">Android · Versi {anmDownloads.version}</p>
          <h3 className="mt-3 text-2xl font-semibold">Monitoring dalam genggaman</h3>
          <p className="mt-4 grow leading-relaxed text-slate-400">Dashboard ringkas, navigasi bawah, scan LAN, monitoring, topologi, dan berbagi laporan CSV dari ponsel Anda.</p>
          <p className="mt-6 text-sm text-slate-400">Android 7.0 atau lebih baru · ARM64 · APK</p>
          <a href={anmDownloads.android} className="mt-5 rounded-xl border border-purple-300/40 px-5 py-3.5 text-center font-semibold text-purple-200 transition hover:bg-purple-300/10">Unduh Android (APK)</a>
        </article>
        <article className="flex flex-col rounded-3xl border border-purple-300/30 bg-gradient-to-br from-purple-500/10 to-[#111a26] p-7 sm:p-9">
          <p className="text-sm font-medium text-purple-200">Windows · Versi {anmDownloads.version}</p>
          <h3 className="mt-3 text-2xl font-semibold">Ruang lebih luas di desktop</h3>
          <p className="mt-4 grow leading-relaxed text-slate-400">Navigasi samping dan dashboard beberapa kolom untuk bekerja di PC. Gunakan installer, atau ekstrak seluruh ZIP portable lalu jalankan askara_network_monitoring.exe.</p>
          <p className="mt-6 text-sm text-slate-400">Windows 10 (1809+) / Windows 11 · x64</p>
          <a href={anmDownloads.windows} className="mt-5 rounded-xl bg-purple-400 px-5 py-3.5 text-center font-semibold text-slate-950 transition hover:bg-purple-300">Unduh Windows (Installer)</a>
          <a href={anmDownloads.windowsPortable} className="mt-4 self-center text-sm font-medium text-purple-200 underline decoration-purple-300/40 underline-offset-4 hover:text-white">Pilihan ZIP portable Windows</a>
        </article>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
        <p>Internet diperlukan untuk login dan validasi lisensi. Monitoring berjalan saat aplikasi terbuka.</p>
        <a href={anmDownloads.guide} className="font-medium text-purple-200 underline underline-offset-4">Baca panduan PDF</a>
      </div>
    </div>
  </section>
}
