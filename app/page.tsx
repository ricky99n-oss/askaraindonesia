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
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-[#FF8C00] selection:text-white">
      
      {/* 1. HEADER - Clean & Modern */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Logo Askara Indonesia" 
              width={160} 
              height={40} 
              className="object-contain h-9 w-auto md:h-11"
              priority
              quality={80}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-xl md:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]">ASKARA <span class="font-medium text-[#FF8C00]">INDONESIA</span></span>';
              }}
            />
          </Link>
          
          <nav className="hidden lg:flex space-x-8 font-medium items-center text-sm tracking-wide text-gray-600">
            <Link href="/" className="hover:text-[#4A00E0] transition-colors">Beranda</Link>
            
            <div className="relative group py-4 cursor-pointer">
              <span className="hover:text-[#4A00E0] transition-colors flex items-center gap-1">
                Layanan
              </span>
              <div className="absolute left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100">
                <div className="p-2 flex flex-col gap-1">
                  {scrollyData.map((item, idx) => (
                    <button 
                      key={item.id} 
                      onClick={() => handleScrollToSection(idx)} 
                      className={`text-left block px-4 py-2.5 rounded-xl transition-colors text-xs ${idx === 6 ? 'font-bold text-[#4A00E0] bg-purple-50/50' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <Link href="/produk" className="hover:text-[#4A00E0] transition-colors">Katalog Produk</Link>
            
            {/* NEW: Tombol Price List */}
            <Link href="/pricelist" className="relative overflow-hidden group bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5">
              <span className="relative z-10">Price List</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#4A00E0] to-[#FF8C00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION - Modern Solid Gradient */}
      <section className="relative text-white pt-24 pb-32 px-6 bg-[#0B0A10] overflow-hidden">
        {/* Soft abstract blur in background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A00E0] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF8C00] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="lg:pr-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF8C00] animate-pulse"></span>
              <span className="text-xs font-semibold tracking-widest uppercase text-white/80">IT Agency & Apps</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tighter">
              Akselerasi Bisnis<br/> Bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#FFD700]">Askara.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Solusi Teknologi Menyeluruh. Kami telah dipercaya melayani 300+ Perusahaan di seluruh Indonesia.
            </p>
          </motion.div>
          
          <div className="relative w-full h-[400px] md:h-[550px] lg:h-[650px]">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="absolute inset-0 w-full h-full max-w-2xl mx-auto">
              <div className="w-full h-full relative" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
                {/* Optimized Hero Image */}
                <Image 
                  src="/hero-tech(2).png" 
                  alt="Teknologi Askara" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain opacity-90 drop-shadow-2xl" 
                  priority 
                  quality={85}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. SCROLLYTELLING - Clean Typography Focus */}
      <section ref={containerRef} className="relative bg-white" style={{ height: '600vh' }}>
        <div className="sticky top-20 h-[85vh] max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center lg:justify-between overflow-hidden">
          
          {/* IMAGE TOP (Mobile) / LEFT (Desktop) */}
          <div className="w-full lg:w-1/2 h-[55%] lg:h-full flex justify-center items-center relative z-10 pt-8 lg:pt-0">
            <motion.div className="relative w-[240px] h-[480px] md:w-[320px] md:h-[640px] lg:w-[400px] lg:h-[800px]" style={{ y: translateY }}>
              {phoneSketches.map((url, index) => (
                <motion.div 
                  key={index} 
                  className="absolute inset-0 w-full h-full"
                  style={{ opacity: useTransform(imageOpacityIndex, [index - 0.5, index, index + 0.5], [0, 1, 0]) }}
                >
                  {/* Menggunakan next/image untuk kompresi otomatis */}
                  <Image 
                    src={url} 
                    alt={`Layanan Askara ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 240px, (max-width: 1024px) 320px, 400px"
                    className="object-contain drop-shadow-2xl"
                    quality={75}
                  />
                </motion.div>
              ))}
            </motion.div>
            {/* Modern Subtle Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[100px] opacity-10 bg-gradient-to-r from-[#4A00E0] to-[#FF8C00] pointer-events-none -z-10"></div>
          </div>

          {/* TEXT BOTTOM (Mobile) / RIGHT (Desktop) */}
          <div className="w-full lg:w-1/2 h-[45%] lg:h-full flex flex-col justify-start lg:justify-center text-center lg:text-left z-20 pt-6 md:pt-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTextIndex} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }} 
                transition={{ duration: 0.4, ease: "easeOut" }} 
                className="max-w-lg mx-auto lg:ml-12 w-full"
              >
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#FF8C00] uppercase mb-4 block">
                  0{activeTextIndex + 1} / 0{scrollyData.length}
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-[1.1] tracking-tight">
                  {scrollyData[activeTextIndex].title}
                </h2>
                <p className="text-base md:text-xl text-gray-500 font-light leading-relaxed">
                  {scrollyData[activeTextIndex].description}
                </p>
                
                {activeTextIndex === 6 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link href="/produk" className="mt-8 inline-flex items-center justify-center gap-2 bg-[#4A00E0] text-white px-8 py-4 rounded-full font-medium hover:bg-gray-900 transition-colors duration-300">
                      Lihat Aplikasi Kami
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. FOOTER - Minimalist Clean */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          <div className="space-y-6 text-center md:text-left">
            <Link href="/" className="inline-block relative w-[160px] h-[40px]">
              <Image src="/logo.png" alt="Logo Askara" fill className="object-contain object-center md:object-left" quality={80} />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed font-light max-w-xs mx-auto md:mx-0">
              Jl. Patimura, Gg VI, 10H,<br />
              Temas, Kota Batu,<br />
              Jawa Timur, Indonesia.
            </p>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Akses Cepat</h4>
            <ul className="space-y-3 font-light text-sm text-gray-500">
              <li><Link href="/" className="hover:text-[#FF8C00] transition-colors">Beranda</Link></li>
              <li><button onClick={() => handleScrollToSection(0)} className="hover:text-[#FF8C00] transition-colors">Layanan IT</button></li>
              <li><Link href="/produk" className="hover:text-[#FF8C00] transition-colors">Katalog Produk</Link></li>
              <li><Link href="/pricelist" className="hover:text-[#4A00E0] font-medium transition-colors">Price List Layanan</Link></li>
            </ul>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Hubungi Kami</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">WhatsApp</p>
                <a href="https://wa.me/6285815999953" className="text-gray-700 text-lg hover:text-[#FF8C00] transition-colors">
                  0858 1599 9953
                </a>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Telepon</p>
                <a href="tel:085212347382" className="text-gray-700 text-lg hover:text-[#FF8C00] transition-colors">
                  0852 1234 7382
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-400 text-xs font-light">
            © {new Date().getFullYear()} PT Askara Indonesia Perkasa. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400 font-light">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}