// app/pricelist/page.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Price List Layanan - Askara Indonesia',
  description: 'Daftar harga layanan PT Askara Indonesia Perkasa meliputi Social Media Management, Pembuatan Website, Desain Grafis, dan Instalasi CCTV.',
};

const priceListCategories = [
  {
    title: "Social Media Management",
    description: "Paket pengelolaan konten Instagram dan TikTok untuk memaksimalkan reach bisnis Anda.",
    images: [
      { src: "/pricelist/Sosmed New 1.jpg", alt: "Paket Sosmed Spark & Flame" },
      { src: "/pricelist/Sosmed New 2.jpg", alt: "Paket Sosmed Blaze & Explode" },
      { src: "/pricelist/Sosmed New 3.jpg", alt: "Paket Sosmed Minimum Spend & Add-on" }
    ]
  },
  {
    title: "Jasa Pembuatan Website",
    description: "Company profile, Katalog Produk, hingga E-Commerce yang responsif dan SEO-friendly.",
    images: [
      { src: "/pricelist/Price list website.jpg", alt: "Price List Pembuatan Website" }
    ]
  },
  {
    title: "Desain Grafis & Identitas Visual",
    description: "Perkuat branding Anda melalui desain logo dan material promosi yang profesional.",
    images: [
      { src: "/pricelist/Price List Desain Logo.jpg", alt: "Paket Desain Logo" },
      { src: "/pricelist/Pricelist Material Promo.jpg", alt: "Paket Desain Material Promosi" }
    ]
  },
  {
    title: "Instalasi CCTV",
    description: "Solusi keamanan area bisnis dan rumah menggunakan kamera CCTV terbaik.",
    images: [
      { src: "/pricelist/CCTV Wired.jpg", alt: "Harga Instalasi CCTV Analog/Wired" },
      { src: "/pricelist/CCTV Wireless.jpg", alt: "Harga Instalasi CCTV Wireless" }
    ]
  }
];

export default function PriceListPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#FF8C00] selection:text-white">
      
      {/* HEADER MINIMALIS */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-gray-900 hover:text-[#4A00E0] transition-colors font-medium text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Kembali ke Beranda
          </Link>
          <Image 
            src="/logo.png" 
            alt="Logo Askara Indonesia" 
            width={120} 
            height={30} 
            className="object-contain h-7 w-auto"
          />
        </div>
      </header>

      {/* HERO TITLE */}
      <section className="pt-16 pb-12 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Layanan & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A00E0] to-[#FF8C00]">Price List</span>
        </h1>
        <p className="text-gray-500 font-light text-lg">
          Temukan paket layanan yang paling sesuai dengan kebutuhan akselerasi digital dan keamanan bisnis Anda.
        </p>
      </section>

      {/* PRICELIST CONTENT */}
      <section className="pb-24 px-6 max-w-7xl mx-auto space-y-24">
        {priceListCategories.map((category, idx) => (
          <div key={idx} className="space-y-8">
            <div className="border-l-4 border-[#FF8C00] pl-5">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{category.title}</h2>
              <p className="text-gray-500 mt-2 font-light">{category.description}</p>
            </div>

            <div className={`grid grid-cols-1 gap-8 ${category.images.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
              {category.images.map((img, imgIdx) => (
                <div key={imgIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative w-full aspect-[4/5] bg-gray-50">
                    <Image 
                      src={img.src} 
                      alt={img.alt} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top"
                      quality={85}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#0B0A10] py-20 px-6 text-center text-white">
        <h3 className="text-3xl font-bold mb-6">Siap Memulai Proyek Anda?</h3>
        <p className="text-gray-400 font-light mb-10 max-w-xl mx-auto">
          Hubungi tim konsultan kami sekarang untuk mendapatkan penawaran yang lebih spesifik atau kustomisasi layanan.
        </p>
        <a href="https://wa.me/6285815999953" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#FF8C00] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-500 transition-colors">
          Konsultasi Gratis via WhatsApp
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
      </section>

    </main>
  );
}