import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-purple-200">
      
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]">
            ASKARA
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-purple-600 transition">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 bg-white shadow-sm min-h-screen">
        
        {/* Language Switcher Anchor */}
        <div className="flex gap-4 mb-12 border-b pb-4">
          <a href="#id" className="text-sm font-bold text-purple-600 hover:text-orange-500 transition">Bahasa Indonesia</a>
          <span className="text-gray-300">|</span>
          <a href="#en" className="text-sm font-bold text-purple-600 hover:text-orange-500 transition">English</a>
        </div>

        {/* ========================================== */}
        {/* SECTION BAHASA INDONESIA                   */}
        {/* ========================================== */}
        <section id="id" className="mb-24">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Kebijakan Privasi</h1>
          <p className="text-gray-500 mb-10 text-sm">Terakhir diperbarui: 28 April 2026</p>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              PT Askara Indonesia Perkasa ("kami", "milik kami", atau "Askara") menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi Anda saat Anda mengunjungi situs web kami, menggunakan layanan agensi IT kami, atau menggunakan produk SaaS kami seperti Askara Smart POS.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami dapat mengumpulkan jenis informasi berikut:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Data Identitas:</strong> Nama depan, nama belakang, nama perusahaan atau restoran Anda.</li>
              <li><strong>Data Kontak:</strong> Alamat email, nomor telepon, dan alamat fisik (contoh: untuk keperluan tagihan atau instalasi jaringan).</li>
              <li><strong>Data Teknis & Penggunaan:</strong> Alamat IP, jenis browser, data log perangkat POS, dan bagaimana Anda berinteraksi dengan aplikasi kami.</li>
              <li><strong>Data Transaksi (Khusus Pengguna POS):</strong> Data terkait langganan sistem kasir Anda, namun <strong>kami tidak menyimpan detail kartu kredit/debit secara langsung</strong> (diproses oleh Payment Gateway pihak ketiga yang aman).</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p>Kami menggunakan data Anda untuk tujuan berikut:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Menyediakan, mengoperasikan, dan memelihara layanan serta produk kami (termasuk fitur *offline-first* pada Askara Smart POS).</li>
              <li>Merespons pertanyaan, permintaan dukungan pelanggan, dan keluhan jaringan/CCTV.</li>
              <li>Mengirimkan pemberitahuan administratif, pembaruan sistem, dan faktur tagihan.</li>
              <li>Meningkatkan kualitas antarmuka aplikasi, keamanan sistem, dan strategi pemasaran kami.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">3. Berbagi Data Anda</h2>
            <p>
              Kami <strong>tidak akan pernah menjual</strong> data pribadi Anda kepada pihak ketiga. Kami hanya membagikan data kepada penyedia layanan tepercaya (seperti penyedia *cloud hosting* Supabase, server email, dan *payment gateway*) semata-mata untuk tujuan pengoperasian layanan kami.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">4. Keamanan Data</h2>
            <p>
              Kami menerapkan langkah-langkah keamanan teknis yang wajar untuk melindungi data Anda dari akses yang tidak sah, kehilangan, atau kerusakan. Namun, tidak ada transmisi data melalui internet yang 100% aman, sehingga kami tidak dapat menjamin keamanan absolut.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">5. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin menghapus/memperbarui data Anda, silakan hubungi kami di:</p>
            <ul className="pl-0 space-y-1 mt-2">
              <li><strong>PT Askara Indonesia Perkasa</strong></li>
              <li>Jl. Patimura, Gg VI, 10H, Temas, Kota Batu, Jawa Timur</li>
              <li>Telepon: 0852 1234 7382</li>
              <li>WhatsApp: 0858 1599 9953</li>
            </ul>
          </div>
        </section>

        {/* Divider */}
        <hr className="my-16 border-gray-200 border-dashed" />

        {/* ========================================== */}
        {/* SECTION ENGLISH                            */}
        {/* ========================================== */}
        <section id="en">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 mb-10 text-sm">Last updated: April 28, 2026</p>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              PT Askara Indonesia Perkasa ("we", "our", or "Askara") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, engage our IT agency services, or use our SaaS products like Askara Smart POS.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> First name, last name, your company or restaurant name.</li>
              <li><strong>Contact Data:</strong> Email address, phone number, and physical address (e.g., for billing or network installation purposes).</li>
              <li><strong>Technical & Usage Data:</strong> IP address, browser type, POS device log data, and how you interact with our applications.</li>
              <li><strong>Transaction Data (For POS Users):</strong> Data related to your cashier system subscription, however, <strong>we do not store full credit/debit card details directly</strong> (processed by secure third-party Payment Gateways).</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use your data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our services and products (including the offline-first features of Askara Smart POS).</li>
              <li>To respond to inquiries, customer support requests, and network/CCTV troubleshooting.</li>
              <li>To send administrative notices, system updates, and billing invoices.</li>
              <li>To improve application interfaces, system security, and our marketing strategies.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">3. Sharing Your Data</h2>
            <p>
              We <strong>will never sell</strong> your personal data to third parties. We only share data with trusted service providers (such as cloud hosting providers like Supabase, email servers, and payment gateways) solely for the purpose of operating our services.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement reasonable technical security measures to protect your data from unauthorized access, loss, or alteration. However, no data transmission over the internet is 100% secure, so we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or wish to delete/update your data, please contact us at:</p>
            <ul className="pl-0 space-y-1 mt-2">
              <li><strong>PT Askara Indonesia Perkasa</strong></li>
              <li>Jl. Patimura, Gg VI, 10H, Temas, Kota Batu, East Java, Indonesia</li>
              <li>Phone: +62 852 1234 7382</li>
              <li>WhatsApp: +62 858 1599 9953</li>
            </ul>
          </div>
        </section>

      </div>
    </main>
  );
}