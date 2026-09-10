'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/marketplace/ProductCard';

export default function MarketplaceStoreClient({ initialProducts, serverSettings }: { initialProducts: any[], serverSettings: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortOption, setSortOption] = useState('terbaru');

  const ADMIN_WA_NUMBER = "6285815999953";

  // 1. PEMETAAN DATA (MEMPERBAIKI HARGA 0 DAN GAMBAR KOSONG)
  const processedProducts = useMemo(() => {
    const margin = Number(serverSettings?.margin) || 0;
    
    return initialProducts.map(p => {
      // Kalkulasi margin
      const calculatedPrice = p.apply_margin !== false
        ? Math.round((p.base_price || 0) * (1 + (margin / 100)))
        : (p.base_price || 0);

      // Mapping properti DB ke properti yang dibutuhkan ProductCard baru
      return {
        ...p,
        id: p.id,
        name: p.name,
        category: p.category || 'Lainnya',
        description: p.description,
        price: calculatedPrice,       // Mapping base_price -> price
        image: p.image_url || '',     // Mapping image_url -> image
        stock: p.stock_qty || 0,
        is_bestseller: p.is_bestseller,
      };
    });
  }, [initialProducts, serverSettings]);

  // 2. FILTERING & SORTING
  const bestSellers = useMemo(() => processedProducts.filter(p => p.is_bestseller && p.stock > 0), [processedProducts]);
  
  const serviceProducts = useMemo(() => processedProducts.filter(p => 
    p.category?.toUpperCase().includes('JASA') || p.name?.toUpperCase().includes('JASA')
  ), [processedProducts]);

  // Membuat daftar kategori dinamis berdasarkan data yang ada
  const categories = ['Semua', ...Array.from(new Set(processedProducts.map(p => p.category).filter(Boolean)))];
  
  const sortedAndFilteredProducts = useMemo(() => {
    let result = processedProducts.filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
      return matchSearch && matchCategory;
    });

    result.sort((a, b) => {
      const aReady = a.stock > 0 ? 1 : 0;
      const bReady = b.stock > 0 ? 1 : 0;
      if (aReady !== bReady) { return bReady - aReady; }
      
      switch (sortOption) {
        case 'harga-asc': return a.price - b.price;
        case 'harga-desc': return b.price - a.price;
        case 'nama-asc': return a.name.localeCompare(b.name);
        case 'nama-desc': return b.name.localeCompare(a.name);
        default: return 0; 
      }
    });
    return result;
  }, [processedProducts, searchQuery, selectedCategory, sortOption]);

  // 3. KOMPONEN CAROUSEL (DIPERTAHANKAN DARI KODE LAMA)
  const DraggableCarousel = ({ items }: { items: any[] }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const isDragging = useRef(false);
    const isHovered = useRef(false);

    const displayItems = items.length > 0 && items.length < 12 
      ? [...items, ...items, ...items, ...items, ...items] 
      : items;

    useEffect(() => {
      const interval = setInterval(() => {
        if (sliderRef.current && !isHovered.current && !isDown.current) {
          sliderRef.current.scrollLeft += 1; 
          if (sliderRef.current.scrollLeft >= sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 5) {
            sliderRef.current.scrollLeft = 0;
          }
        }
      }, 30);
      return () => clearInterval(interval);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
      isDown.current = true;
      isDragging.current = false;
      if (sliderRef.current) {
        startX.current = e.pageX - sliderRef.current.offsetLeft;
        scrollLeft.current = sliderRef.current.scrollLeft;
      }
    };
    
    const handleMouseLeave = () => { isDown.current = false; isHovered.current = false; };
    const handleMouseUp = () => { isDown.current = false; };
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDown.current || !sliderRef.current) return;
      e.preventDefault(); 
      const x = e.pageX - sliderRef.current.offsetLeft;
      if (Math.abs(x - startX.current) > 5) isDragging.current = true;
      const walk = (x - startX.current) * 1.5; 
      sliderRef.current.scrollLeft = scrollLeft.current - walk;
    };
    
    const handleClickCapture = (e: React.MouseEvent) => {
      if (isDragging.current) {
        e.stopPropagation(); e.preventDefault();
        isDragging.current = false;
      }
    };

    const scrollByArrow = (offset: number) => {
      if (sliderRef.current) sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    };

    return (
      <div 
        className="relative group w-full"
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={handleMouseLeave}
      >
        <button 
          onClick={() => scrollByArrow(-280)}
          className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-30 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 p-2.5 sm:p-3 rounded-full text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all opacity-80 hover:opacity-100 hidden md:flex"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <div 
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClickCapture={handleClickCapture}
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 scrollbar-hide flex-nowrap cursor-grab active:cursor-grabbing select-none"
        >
          {displayItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="shrink-0 w-[160px] sm:w-[220px] md:w-[240px] lg:w-[260px] pointer-events-auto">
              <ProductCard product={item} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scrollByArrow(280)}
          className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-30 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 p-2.5 sm:p-3 rounded-full text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all opacity-80 hover:opacity-100 hidden md:flex"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 relative overflow-x-hidden">
      
      {/* HEADER NAVIGATION */}
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 text-white flex items-center justify-center rounded-lg font-bold text-xl shadow-md">A</div>
              <span className="font-bold text-xl hidden sm:block">Askara<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">Shop</span></span>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari hardware, lisensi..." className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                <button className="absolute right-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6 text-sm font-medium">
              <Link href="/" className="text-purple-600 border-b-2 border-purple-600 pb-5 pt-5 hidden md:block">Beranda</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8 sm:space-y-12">
        
        {/* HERO SECTION */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row items-center relative px-6 py-10 md:p-12 lg:p-16">
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[55%] bg-gradient-to-bl from-purple-600 to-orange-500 md:rounded-l-[120px] hidden md:block z-0 opacity-95"></div>
          <div className="relative z-10 md:w-1/2 lg:w-[45%] space-y-4 sm:space-y-6 text-center md:text-left flex flex-col items-center md:items-start py-4">
            <span className="inline-block bg-orange-50 text-orange-500 font-bold tracking-wider text-[10px] sm:text-xs uppercase px-3 py-1 sm:px-4 sm:py-1.5 rounded-full">Askara Indonesia Services</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">Creative, Digital <br className="hidden lg:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">& IT Solutions</span></h1>
            <p className="text-gray-500 max-w-sm md:max-w-md text-sm sm:text-base leading-relaxed">Solusi kreatif dan teknologi untuk mendukung bisnis Anda. Mulai dari penjualan dan instalasi CCTV serta jaringan, desain grafis, manajemen media sosial, hingga pengembangan website & aplikasi.</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 relative z-20 w-full sm:w-auto">
              <button onClick={() => window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Askara,%20saya%20ingin%20berkonsultasi%20mengenai%20kebutuhan%20bisnis%20saya.`, '_blank')} className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-orange-600 transition-all flex justify-center items-center gap-2 shadow-lg w-full sm:w-auto">
                Konsultasikan Kebutuhan Anda <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <button onClick={() => { setSelectedCategory('JASA'); document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="bg-white text-gray-900 px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-50 border border-gray-200 shadow-sm flex justify-center w-full sm:w-auto">
                Lihat Layanan & Harga
              </button>
            </div>
          </div>
          <div className="relative z-10 w-full md:w-1/2 lg:w-[55%] mt-8 md:mt-0 flex justify-center md:justify-end items-center pointer-events-none">
             <img src="/hero-market2.png" alt="Creative & IT Solutions" className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px] object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700" />
          </div>
        </div>

        {/* BEST SELLERS CAROUSEL */}
        {bestSellers.length > 0 && (
          <div className="pt-4 pb-2 relative">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              Pilihan Terlaris <span className="text-2xl">🔥</span>
            </h2>
            <DraggableCarousel items={bestSellers} />
          </div>
        )}

        {/* SERVICES CAROUSEL */}
        {serviceProducts.length > 0 && (
          <div className="pt-2 pb-2 relative">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              Layanan & Jasa Askara <span className="text-2xl">🛠️</span>
            </h2>
            <DraggableCarousel items={serviceProducts} />
          </div>
        )}

        {/* MAIN CATALOG FILTER & GRID */}
        <div id="katalog-section" className="pt-4 scroll-mt-24 border-t border-gray-100">
          <div className="mb-5 space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Semua Katalog Produk</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari produk atau layanan..." className="w-full bg-white border border-gray-200 rounded-xl sm:rounded-full py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-purple-500 text-sm outline-none" />
              </div>
              <div className="relative shrink-0">
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl sm:rounded-full py-2.5 pl-4 pr-10 appearance-none focus:ring-2 focus:ring-purple-500 text-sm font-medium outline-none cursor-pointer">
                  <option value="terbaru">Terbaru</option>
                  <option value="harga-asc">Harga: Rendah ke Tinggi</option>
                  <option value="harga-desc">Harga: Tinggi ke Rendah</option>
                  <option value="nama-asc">Nama: A - Z</option>
                  <option value="nama-desc">Nama: Z - A</option>
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`snap-start whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${selectedCategory === cat ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mt-2">
            {sortedAndFilteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center"><svg className="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>Produk tidak ditemukan.</div>
            ) : (
              sortedAndFilteredProducts.map((product: any) => (
                <div key={product.id} className="w-full">
                   <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}