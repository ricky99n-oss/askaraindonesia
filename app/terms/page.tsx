import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-orange-200">
      
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]">
            ASKARA
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-orange-500 transition">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 bg-white shadow-sm min-h-screen">
        
        {/* Language Switcher Anchor */}
        <div className="flex gap-4 mb-12 border-b pb-4">
          <a href="#id" className="text-sm font-bold text-orange-500 hover:text-purple-600 transition">Bahasa Indonesia</a>
          <span className="text-gray-300">|</span>
          <a href="#en" className="text-sm font-bold text-orange-500 hover:text-purple-600 transition">English</a>
        </div>

        {/* ========================================== */}
        {/* SECTION BAHASA INDONESIA                   */}
        {/* ========================================== */}
        <section id="id" className="mb-24">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Syarat & Ketentuan</h1>
          <p className="text-gray-500 mb-10 text-sm">Terakhir diperbarui: 28 April 2026</p>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              Selamat datang di PT Askara Indonesia Perkasa. Dengan mengakses situs web kami atau menggunakan layanan kami (Agensi IT, Pembuatan Aplikasi, Jaringan, CCTV, Desain, dan SaaS Askara Smart POS), Anda setuju untuk terikat oleh Syarat dan Ketentuan berikut.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Penggunaan Layanan</h2>
            <p>
              Anda setuju untuk menggunakan layanan kami hanya untuk tujuan yang sah secara hukum. Anda dilarang menggunakan perangkat lunak kami (seperti Askara Smart POS) untuk memfasilitasi transaksi ilegal, menyebarkan malware, atau merekayasa balik (*reverse engineering*) kode sumber kami.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">2. Langganan dan Pembayaran (Khusus Produk SaaS)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Layanan Askara Smart POS beroperasi pada model berlangganan (Software as a Service).</li>
              <li>Pembayaran harus dilunasi di awal siklus penagihan. Jika terjadi kegagalan pembayaran, akses ke fitur *cloud* dan sinkronisasi data dapat ditangguhkan hingga pembayaran diselesaikan.</li>
              <li>Aplikasi dapat tetap berjalan dalam mode *offline*, namun data tidak akan tersinkronisasi ke server pusat hingga status langganan aktif.</li>
              <li>Semua pembayaran yang telah dilakukan tidak dapat dikembalikan (*non-refundable*), kecuali dinyatakan lain secara tertulis.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">3. Hak Kekayaan Intelektual</h2>
            <p>
              Semua kode sumber sistem, desain antarmuka, logo Askara, dan materi pemasaran yang disediakan oleh kami tetap menjadi hak milik PT Askara Indonesia Perkasa. Anda memegang kepemilikan penuh atas data bisnis Anda sendiri (contoh: data penjualan resto, menu, data pelanggan) yang Anda masukkan ke dalam sistem kami.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">4. Batasan Tanggung Jawab</h2>
            <p>
              Askara berusaha semaksimal mungkin memastikan layanan (seperti server aplikasi dan koneksi jaringan) berjalan stabil (*uptime* tinggi). Namun, kami tidak bertanggung jawab atas kerugian finansial, hilangnya keuntungan, atau gangguan operasional bisnis Anda yang diakibatkan oleh *force majeure*, kerusakan perangkat keras Anda sendiri, atau masalah pada pihak ketiga penyedia internet.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">5. Hukum yang Berlaku</h2>
            <p>
              Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Segala perselisihan yang timbul akan diselesaikan secara musyawarah mufakat, atau melalui yurisdiksi pengadilan di wilayah Jawa Timur.
            </p>
          </div>
        </section>

        {/* Divider */}
        <hr className="my-16 border-gray-200 border-dashed" />

        {/* ========================================== */}
        {/* SECTION ENGLISH                            */}
        {/* ========================================== */}
        <section id="en">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Terms of Service</h1>
          <p className="text-gray-500 mb-10 text-sm">Last updated: April 28, 2026</p>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              Welcome to PT Askara Indonesia Perkasa. By accessing our website or using our services (IT Agency, App Development, Network, CCTV, Design, and Askara Smart POS SaaS), you agree to be bound by the following Terms and Conditions.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Use of Services</h2>
            <p>
              You agree to use our services only for lawful purposes. You are strictly prohibited from using our software (such as Askara Smart POS) to facilitate illegal transactions, distribute malware, or reverse engineer our source code.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">2. Subscriptions and Payments (SaaS Products Only)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Askara Smart POS services operate on a subscription model (Software as a Service).</li>
              <li>Payments must be cleared at the beginning of the billing cycle. In the event of payment failure, access to cloud features and data synchronization may be suspended until payment is resolved.</li>
              <li>The application may continue to run in offline mode, but data will not sync to the central server until the subscription status is active.</li>
              <li>All payments made are non-refundable, unless stated otherwise in writing.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">3. Intellectual Property Rights</h2>
            <p>
              All system source code, interface designs, Askara logos, and marketing materials provided by us remain the property of PT Askara Indonesia Perkasa. You retain full ownership of your own business data (e.g., restaurant sales data, menus, customer data) that you input into our systems.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">4. Limitation of Liability</h2>
            <p>
              Askara makes every effort to ensure that services (such as application servers and network connections) run stably (high uptime). However, we are not liable for any financial loss, loss of profits, or business operational disruptions caused by force majeure, hardware failure on your end, or issues with third-party internet service providers.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">5. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising shall be resolved amicably, or through the jurisdiction of the courts in the East Java region.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}