// app/page.tsx

'use client'; 

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image'; 

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollyData = [
    { id: 0, title: "Sejarah PT Askara Indonesia", description: "9+ tahun pengalaman. Didirikan oleh innovator IT berbakat, melayani 300+ klien besar, UMKM, hingga korporasi." },
    { id: 1, title: "Jaringan & CCTV Menyeluruh", description: "Instalasi Jaringan & CCTV tingkat enterprise. Jamin keamanan area bisnis Anda secara menyeluruh." },
    { id: 2, title: "Handling Konten Sosmed", description: "Kelola konten media sosial untuk memastikan kualitas tampilan profil Anda estetik dan profesional." },
    { id: 3, title: "Desain Grafis Profesional", description: "Rancang identitas visual, logo, materi promosi, hingga packaging yang memiliki daya jual tajam." },
    { id: 4, title: "Photography & Videography", description: "Dokumentasi komersial, acara perusahaan, hingga company profile dengan kualitas sinematik." },
    { id: 5, title: "Pembuatan Website & Aplikasi", description: "Kembangkan sistem internal (PC/Android/iOS/WebApp) untuk mempermudah operasional." },
    { id: 6, title: "Askara App Product", description: "Berbagai aplikasi inovatif untuk berbagai kebutuhan bisnis Anda. Cek sekarang juga." },
  ];

  const phoneSketches = [
    "/sketches/pose-1.png", "/sketches/pose-2.png", "/sketches/pose-3.png", 
    "/sketches/pose-4.png", "/sketches/pose-5.png", "/sketches/pose-6.png", "/sketches/pose-7.png", 
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const imageOpacityIndex = useTransform(scrollYProgress, [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1], [0, 1, 2, 3, 4, 5, 6]);
  const translateY = useTransform(scrollYProgress, [0, 1], [-20, 80]); 

  const [activeTextIndex, setActiveTextIndex] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      const total = scrollyData.length;
      const index = Math.min(Math.floor(latest * total), total - 1);
      setActiveTextIndex(index);
    });
  }, [scrollYProgress, scrollyData.length]);

  const handleScrollToSection = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const scrollableDistance = rect.height - window.innerHeight;
    const targetProgress = (index + 0.1) / scrollyData.length; 
    const targetY = containerTop + (targetProgress * scrollableDistance);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans">
      
      {/* 1. HEADER */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Logo Askara Indonesia" 
              width={180} 
              height={50} 
              className="object-contain h-10 w-auto md:h-12"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]">ASKARA <span class="font-medium text-[#FF8C00]">INDONESIA</span></span>';
              }}
            />
          </Link>
          <nav className="hidden lg:flex space-x-8 font-medium items-center">
            <Link href="/" className="text-gray-600 hover:text-[#FF8C00] transition">Beranda</Link>
            <div className="relative group py-4 cursor-pointer">
              <span className="text-gray-600 group-hover:text-[#FF8C00] transition flex items-center gap-1 font-bold">
                Layanan
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
              <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100">
                <div className="py-2">
                  <button onClick={() => handleScrollToSection(0)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition border-b border-gray-50 text-sm">1. Sejarah Perusahaan</button>
                  <button onClick={() => handleScrollToSection(1)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition border-b border-gray-50 text-sm">2. Jaringan & CCTV</button>
                  <button onClick={() => handleScrollToSection(2)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition border-b border-gray-50 text-sm">3. Manajemen Sosial Media</button>
                  <button onClick={() => handleScrollToSection(3)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition border-b border-gray-50 text-sm">4. Desain Grafis Profesional</button>
                  <button onClick={() => handleScrollToSection(4)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition border-b border-gray-50 text-sm">5. Photo & Videography</button>
                  <button onClick={() => handleScrollToSection(5)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition border-b border-gray-50 text-sm">6. Website & Aplikasi</button>
                  <button onClick={() => handleScrollToSection(6)} className="w-full text-left block px-5 py-3 hover:bg-purple-50 hover:text-[#4A00E0] transition text-sm font-bold text-purple-600">7. Askara Apps Product</button>
                </div>
              </div>
            </div>
             <Link href="/produk" className="bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition">Katalog Produk</Link>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="text-white py-16 md:py-32 px-6 bg-gradient-to-br from-[#4A00E0] via-[#6a11cb] to-[#8E2DE2] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-10 items-center text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:pr-8 z-10">
            <div className="bg-[#FF8C00] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">IT AGENCY & APPS</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight uppercase tracking-tight">Akselerasi Bisnis Bersama <span className="text-[#FF8C00]">Askara</span>.</h1>
            <p className="text-base md:text-xl text-purple-100 max-w-md mx-auto lg:mx-0">Solusi Teknologi Menyeluruh. Melayani 300+ Perusahaan di seluruh Indonesia.</p>
          </motion.div>
          
          <div className="flex justify-center mt-8 lg:mt-0 relative w-full h-[400px] md:h-[600px] lg:h-[700px] z-0">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 1.2 }} className="relative w-full h-full max-w-3xl mx-auto">
              <div 
                className="w-full h-full relative pointer-events-none"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)',
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)'
                }}
              >
                <Image src="/hero-tech(2).png" alt="Teknologi Askara" fill className="object-cover mix-blend-luminosity opacity-90" priority />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. SCROLLYTELLING */}
      <section ref={containerRef} className="relative bg-gray-50" style={{ height: '600vh' }}>
        <div className="sticky top-[70px] md:top-24 h-[85vh] max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center justify-center lg:justify-between overflow-hidden">
          
          {/* IMAGE TOP (Mobile) */}
          <div className="w-full lg:w-1/2 h-[55%] lg:h-auto flex justify-center items-center relative z-10 pt-4 lg:pt-0">
            <motion.div className="relative w-[220px] h-[440px] md:w-[300px] md:h-[600px] lg:w-[380px] lg:h-[760px]" style={{ y: translateY }}>
              {phoneSketches.map((url, index) => (
                <motion.img key={index} src={url} className="absolute inset-0 w-full h-full object-contain drop-shadow-xl" style={{ opacity: useTransform(imageOpacityIndex, [index - 0.5, index, index + 0.5], [0, 1, 0]) }} />
              ))}
            </motion.div>
            <div className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full blur-3xl opacity-20 bg-[#FF8C00] -z-10"></div>
          </div>

          {/* TEXT BOTTOM (Mobile) */}
          <div className="w-full lg:w-1/2 h-[45%] lg:h-auto flex flex-col justify-start lg:justify-center text-center lg:text-left px-2 md:px-10 z-20 pt-4 md:pt-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTextIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-lg mx-auto lg:ml-0 w-full">
                <div className="w-12 md:w-16 h-1 md:h-1.5 rounded-full mb-3 md:mb-6 bg-[#FF8C00] mx-auto lg:ml-0"></div>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] leading-tight">{scrollyData[activeTextIndex].title}</h2>
                <p className="text-sm md:text-lg lg:text-xl text-gray-600 leading-relaxed line-clamp-3 md:line-clamp-none">{scrollyData[activeTextIndex].description}</p>
                {activeTextIndex === 6 && (
                  <Link href="/produk" className="bg-[#FF8C00] text-white font-bold px-6 py-2.5 md:px-8 md:py-4 rounded-lg mt-4 md:mt-8 inline-block shadow-lg text-sm md:text-lg hover:opacity-90 transition">Lihat Askara Apps</Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. FOOTER (MINIMALIST TYPOGRAPHY) */}
      <footer className="bg-[#0f172a] text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 mb-16">
          
          {/* Kolom 1: Brand & Alamat */}
          <div className="space-y-6 text-center md:text-left">
            <div className="relative w-[160px] h-[40px] mx-auto md:mx-0">
              <Image src="/logo.png" alt="Logo Askara" fill className="object-contain object-center md:object-left brightness-0 invert opacity-100" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed tracking-wide font-light">
              Jl. Patimura, Gg VI, 10H,<br />
              Temas, Kota Batu,<br />
              Jawa Timur, Indonesia.
            </p>
          </div>

          {/* Kolom 2: Akses Cepat */}
          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Akses Cepat</h4>
            <ul className="space-y-3 font-light text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
              <li><button onClick={() => handleScrollToSection(0)} className="hover:text-white transition">Tentang Kami</button></li>
              <li><button onClick={() => handleScrollToSection(1)} className="hover:text-white transition">Layanan IT</button></li>
              <li><Link href="/produk" className="hover:text-white transition">Katalog Produk</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak (Tipografi Bersih) */}
          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Hubungi Kami</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">WhatsApp</p>
                <a href="https://wa.me/6285815999953" className="text-gray-300 text-base font-medium hover:text-white transition tracking-wide">
                  0858 1599 9953
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Telepon</p>
                <a href="tel:085212347382" className="text-gray-300 text-base font-medium hover:text-white transition tracking-wide">
                  0852 1234 7382
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Line */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-500 text-xs tracking-wider uppercase font-medium">
            © {new Date().getFullYear()} PT Askara Indonesia Perkasa.
          </p>
          <div className="flex gap-8 text-xs text-gray-500 uppercase tracking-wider font-medium">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}