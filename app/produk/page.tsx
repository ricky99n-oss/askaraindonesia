'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion'; // Tambahkan import Variants

export default function ProdukPage() {
  const products = [
    {
      id: "pos",
      title: "Askara Smart POS",
      status: "Available",
      description: "Sistem kasir pintar (Point of Sales) Cloud dengan teknologi Offline-First. Dirancang khusus untuk kafe, resto, dan ritel agar tetap beroperasi, mencetak struk, dan sinkronisasi otomatis walau tanpa koneksi internet.",
      icon: "🏪",
      gradient: "from-askara-dark to-askara-orange" // Gunakan variabel warna askara
    },
    {
      id: "netmon",
      title: "Askara Network Monitoring",
      status: "Release Soon",
      description: "Sistem pemantauan infrastruktur jaringan real-time. Melacak lalu lintas data, mendeteksi anomali, dan memberikan peringatan dini untuk mencegah downtime pada jaringan bisnis Anda.",
      icon: "📡",
      gradient: "from-gray-700 to-gray-900"
    },
    {
      id: "hotel",
      title: "Askara Hotel Management System",
      status: "Release Soon",
      description: "Solusi perangkat lunak terintegrasi untuk manajemen reservasi, housekeeping, front-desk, hingga laporan keuangan hotel dalam satu dashboard interaktif yang mudah digunakan.",
      icon: "🏨",
      gradient: "from-gray-700 to-gray-900"
    },
    {
      id: "traveler",
      title: "Askara Travelers Connect",
      status: "Release Soon",
      description: "Platform interaktif yang menghubungkan tamu hotel atau villa dengan layanan internal, pemandu wisata lokal, dan rekomendasi destinasi langsung dari genggaman smartphone mereka.",
      icon: "🗺️",
      gradient: "from-gray-700 to-gray-900"
    },
    {
      id: "villa",
      title: "Askara Villa Management System",
      status: "Release Soon",
      description: "Sistem tata kelola eksklusif untuk bisnis villa. Dilengkapi dengan sinkronisasi kalender booking, manajemen properti, dan sistem automasi layanan tamu yang komprehensif.",
      icon: "🏡",
      gradient: "from-gray-700 to-gray-900"
    },
    {
      id: "kids",
      title: "Askara Kids growth and development Monitoring",
      status: "Release Soon",
      description: "Askara Kids Growth and Development Monitoring membantu orang tua memantau, memahami, dan mendukung tumbuh kembang anak secara akurat, jelas, dengan pendampingan Dokter Spesialis Anak.",
      icon: "👶🏻",
      gradient: "from-gray-700 to-gray-900"
    }
  ];

  // Tambahkan tipe Variants di sini untuk menghilangkan Error TS
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100 
      } 
    }
  };

  return (
    <main className="min-h-screen bg-askara-light text-gray-800 font-sans">
      
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-askara-dark to-askara-orange">ASKARA</span>
            <span className="text-2xl font-medium text-askara-orange">INDONESIA</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-askara-dark transition flex items-center gap-2">
            <span>&larr;</span> Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* HERO KATALOG */}
      <section className="bg-white py-20 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <span className="bg-purple-100 text-askara-dark text-xs font-bold px-4 py-1.5 rounded-full inline-block mb-4 tracking-wider uppercase">
              Eksklusif dari Askara
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-linear-to-r from-askara-dark to-askara-orange">
              Ekosistem Perangkat Lunak Askara
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
              Jelajahi jajaran produk inovatif kami yang dirancang untuk mendigitalisasi, mengotomatisasi, dan mempercepat pertumbuhan bisnis Anda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* GRID PRODUK */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {products.map((product) => {
            const isAvailable = product.status === "Available";
            
            return (
              <motion.div 
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`relative rounded-3xl p-[2px] overflow-hidden ${isAvailable ? 'bg-linear-to-br from-askara-dark via-purple-600 to-askara-orange shadow-xl' : 'bg-gray-200 shadow-sm'}`}
              >
                <div className="bg-white h-full w-full rounded-[22px] p-8 flex flex-col relative z-10">
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`text-4xl w-14 h-14 flex items-center justify-center rounded-2xl bg-linear-to-br ${product.gradient} text-white shadow-md`}>
                      {product.icon}
                    </div>
                    {isAvailable ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                        Siap Digunakan
                      </span>
                    ) : (
                      <span className="bg-orange-50 text-askara-orange text-xs font-bold px-3 py-1 rounded-full border border-orange-200 animate-pulse">
                        Release Soon
                      </span>
                    )}
                  </div>

                  <h3 className={`text-2xl font-bold mb-4 ${isAvailable ? 'text-askara-dark' : 'text-gray-800'}`}>
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 grow">
                    {product.description}
                  </p>

                  {isAvailable ? (
                    <a href="/askarasmartpos" target="_blank" className="w-full bg-linear-to-r from-askara-dark to-purple-600 text-white font-bold py-3 px-4 rounded-xl text-center hover:shadow-lg transition">
                      Buka Aplikasi
                    </a>
                  ) : (
                    <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 px-4 rounded-xl text-center border border-gray-200 cursor-not-allowed">
                      Dalam Pengembangan
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

    </main>
  );
}