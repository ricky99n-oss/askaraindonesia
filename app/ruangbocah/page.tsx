import Link from 'next/link';

export const metadata = {
  title: 'Ruang Bocah | Ekosistem Parenting & Tumbuh Kembang Anak',
  description: 'Aplikasi terpadu untuk memantau tumbuh kembang anak, konsultasi dokter spesialis, dan aktivitas edukatif.',
};

export default function RuangBocahLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HERO SECTION */}
      <section className="bg-purple-700 text-white pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
            <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-6 tracking-wider uppercase">
              PRODUK UNGGULAN ASKARA
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Teman Terbaik Tumbuh Kembang si Kecil
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-lg mx-auto md:mx-0">
              Ruang Bocah adalah ekosistem aplikasi parenting yang menghubungkan Anda dengan Dokter Spesialis Anak, memantau kesehatan, hingga menyediakan permainan edukatif dalam satu genggaman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href="/ruangbocah/subscribe" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg"
              >
                Berlangganan Sekarang
              </Link>
              <button className="bg-white text-purple-700 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg">
                Download Aplikasi
              </button>
            </div>
          </div>
          <div className="md:w-1/2 w-full px-4">
            {/* PLACEHOLDER: MOCKUP HERO */}
            <div className="w-full aspect-[4/3] bg-purple-800/50 rounded-3xl border-2 border-dashed border-purple-400 flex items-center justify-center shadow-2xl relative">
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-purple-300 font-medium text-center px-4">
                [Placeholder Gambar: Mockup Layar Utama Aplikasi Ruang Bocah]
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR UTAMA SECTION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fitur Lengkap Ruang Bocah</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-24">
            {/* Fitur 1: Telemed */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 w-full order-2 md:order-1">
                {/* PLACEHOLDER: TELEMED */}
                <div className="w-full aspect-square md:aspect-[4/3] bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-center px-4">
                    [Placeholder Gambar: Layar Chat Dokter Sp.A dengan Bubble Notifikasi Merah]
                  </span>
                </div>
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🩺</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Konsultasi Telemedis Spesialis Anak</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Tidak perlu antre ke klinik. Konsultasikan keluhan si Kecil langsung dengan Dokter Spesialis Anak (Sp.A) terpercaya. Dilengkapi fitur kirim foto, indikator mengetik secara <i>real-time</i>, dan notifikasi pesan pintar.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span> Sistem Koin (50 Koin / Sesi Konsultasi)
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span> Chat Real-time Bebas Batas Waktu
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span> Rekam Medis Digital & Ulasan Dokter
                  </li>
                </ul>
              </div>
            </div>

            {/* Fitur 2: Tumbuh Kembang */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Pantau Tumbuh Kembang Menyeluruh</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Catat setiap fase berharga anak Anda. Dari tinggi badan, berat badan, hingga jadwal imunisasi, semuanya direkam dalam visualisasi kurva standar medis agar perkembangan anak selalu terpantau optimal.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span> Grafik Kurva Pertumbuhan Interaktif
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span> Pengingat Jadwal Vaksin & Imunisasi
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">✓</span> Pencatatan Pola Tidur & Riwayat Nutrisi
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 w-full">
                {/* PLACEHOLDER: GROWTH */}
                <div className="w-full aspect-square md:aspect-[4/3] bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-center px-4">
                    [Placeholder Gambar: Layar Grafik Pertumbuhan Anak & Pengingat Vaksin]
                  </span>
                </div>
              </div>
            </div>

            {/* Fitur 3: Aktivitas & Game */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 w-full order-2 md:order-1">
                {/* PLACEHOLDER: GAMES */}
                <div className="w-full aspect-square md:aspect-[4/3] bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
                  <span className="text-gray-500 font-medium text-center px-4 relative z-10">
                    [Placeholder Gambar: Pusat Bermain Edukatif & Lullaby]
                  </span>
                </div>
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🧩</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Aktivitas Edukatif & Poin Anak</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Ruang Bocah tidak hanya untuk orang tua, tetapi juga ramah untuk anak. Kami menyediakan berbagai permainan yang melatih sensorik dan kognitif, serta dukungan suara penenang tidur (*Lullaby*).
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Akses Game Edukasi Interaktif
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> Sistem Lencana (Poin Reward) Anak
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> White Noise & Audio Pengantar Tidur
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION SECTION */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          <div className="md:w-5/12 bg-purple-700 p-10 text-white flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Premium Membership</h3>
            <p className="text-purple-200 mb-8">
              Buka potensi penuh ekosistem Ruang Bocah untuk memastikan tumbuh kembang si Kecil terawasi dengan sempurna.
            </p>
            <div className="text-5xl font-extrabold mb-2">Rp 49K<span className="text-xl font-normal text-purple-300">/bln</span></div>
          </div>
          <div className="md:w-7/12 p-10 flex flex-col justify-center">
            <h4 className="text-xl font-bold text-gray-900 mb-6">Yang Anda dapatkan:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">🌟</span>
                <span className="text-gray-600 text-sm">Gratis 50 Koin setiap bulan</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">🌟</span>
                <span className="text-gray-600 text-sm">Akses penuh Telemedis</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">🌟</span>
                <span className="text-gray-600 text-sm">Semua metrik pertumbuhan</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">🌟</span>
                <span className="text-gray-600 text-sm">Bebas iklan di Pusat Bermain</span>
              </div>
            </div>
            <Link 
              href="/ruangbocah/subscribe" 
              className="block w-full bg-purple-700 hover:bg-purple-800 text-white text-center font-bold py-4 rounded-xl transition duration-300"
            >
              Berlangganan Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 text-center">
        <p>© 2026 PT Askara Indonesia - Ruang Bocah. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}