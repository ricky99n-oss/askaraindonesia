'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Reusable Scroll Reveal Component - Sangat Halus
const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function PakdeGriyaPitchPage() {
  // Calculator State
  const [propertyPrice, setPropertyPrice] = useState<number>(1500000000);
  const [commissionRate, setCommissionRate] = useState<number>(3);
  
  // Calculator Logic
  const grossCommission = propertyPrice * (commissionRate / 100);
  const externalSalesCost = 10000000;
  const netCommission = Math.max(0, grossCommission - externalSalesCost);
  const partnerShare = netCommission * 0.30; 
  const pakdeShare = netCommission * 0.70;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    // Warna Background Beige Flat (#F2EFE9) dan Teks Coklat Gelap Espresso (#2A221C)
    <div className="min-h-screen bg-[#F2EFE9] text-[#2A221C] font-sans selection:bg-[#2A221C] selection:text-[#F2EFE9] overflow-hidden">
      
      {/* NAVBAR MINIMALIST */}
      <nav className="fixed w-full top-0 z-50 bg-[#F2EFE9] border-b border-[#D8D3C8]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between uppercase text-[10px] tracking-widest font-semibold">
          <div className="flex gap-8">
            <span className="font-bold">PAKDE GRIYA & CO.</span>
            <span className="hidden md:block text-[#7A6B5D]">Strategic Project By Askara</span>
          </div>
          <button 
            onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-[#7A6B5D] transition-colors flex items-center gap-2"
          >
            DISCUSS PARTNERSHIP <span className="text-lg">›</span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION EDITORIAL STYLE */}
      <section className="pt-24 pb-12 px-6 min-h-screen flex flex-col justify-center max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Big Typography Left */}
          <div className="lg:col-span-8 z-10">
            <FadeUp>
              <div className="text-[10px] tracking-[0.3em] text-[#7A6B5D] uppercase mb-6">Property Marketing Network</div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="text-[12vw] lg:text-[7.5rem] font-bold leading-[0.85] tracking-tighter uppercase text-[#2A221C]">
                WE DESIGN<br/>
                <span className="text-[#8B7C6E]">THE NETWORK</span><br/>
                OF TOMORROW
              </h1>
            </FadeUp>
            <FadeUp delay={0.2} className="mt-10 md:mt-16 max-w-md">
              <p className="text-sm md:text-base leading-relaxed text-[#5A4F44] font-medium">
                Pakde Griya bukan sekadar agensi. Ini adalah ekosistem penjualan yang mengintegrasikan media konten, distribusi digital, dan teknologi CRM dalam satu platform.
              </p>
              <button 
                onClick={() => document.getElementById('editorial-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-8 bg-[#2A221C] text-[#F2EFE9] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4A3D32] transition-colors"
              >
                EXPLORE PROJECT
              </button>
            </FadeUp>
          </div>
          
          {/* Flat Mascot Right */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end mt-12 lg:mt-0 relative">
            <FadeUp delay={0.3} className="w-full max-w-[400px] aspect-square relative bg-[#E6E1D6] rounded-t-full border-x border-t border-[#D8D3C8] overflow-hidden flex items-end justify-center">
               <Image 
                  src="/pakde-logo.png" 
                  alt="Pakde Griya" 
                  fill 
                  className="object-cover object-bottom"
                  priority
                />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* THE EDITORIAL GRID SECTION (Meniru Referensi OURA & CO) */}
      <section id="editorial-grid" className="border-t border-[#D8D3C8]">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Half of Grid */}
          <div className="grid lg:grid-cols-2">
            
            {/* Left Block */}
            <div className="p-10 md:p-20 lg:border-r border-[#D8D3C8]">
              <FadeUp>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 flex items-baseline gap-4">
                  <span className="text-sm tracking-widest font-normal uppercase text-[#7A6B5D]">AT</span> PAKDE GRIYA,
                </h2>
                <p className="text-base md:text-lg text-[#5A4F44] max-w-md leading-relaxed">
                  Kami percaya pemasaran properti adalah lebih dari sekadar <i>listing</i> pasif. Ini tentang membangun persona yang dipercaya, mendistribusikan cerita ke jutaan layar, dan mengubah ketertarikan menjadi transaksi nyata.
                </p>
              </FadeUp>
            </div>
            
            {/* Right Block (Data & Dark Square) */}
            <div className="grid grid-cols-2 grid-rows-2">
              <div className="p-8 md:p-12 border-b border-[#D8D3C8] flex flex-col justify-center">
                <FadeUp delay={0.1}>
                  <div className="text-[10px] tracking-widest uppercase text-[#7A6B5D] mb-2">Capital Phase</div>
                  <div className="text-5xl md:text-6xl font-bold tracking-tighter">150<span className="text-2xl text-[#8B7C6E]">M</span></div>
                </FadeUp>
              </div>
              <div className="p-8 md:p-12 border-b border-l border-[#D8D3C8] flex flex-col justify-center">
                <FadeUp delay={0.2}>
                  <div className="text-[10px] tracking-widest uppercase text-[#7A6B5D] mb-2">Revenue Streams</div>
                  <div className="text-5xl md:text-6xl font-bold tracking-tighter">05</div>
                </FadeUp>
              </div>
              <div className="col-span-2 bg-[#2A221C] text-[#F2EFE9] p-8 md:p-12 flex flex-col justify-center">
                <FadeUp delay={0.3}>
                  <p className="text-lg md:text-xl font-light leading-relaxed max-w-sm">
                    Marketing properti konvensional terlalu bergantung pada individu. <br/><br/>
                    <strong className="font-bold">Sistem kami mengubahnya menjadi mesin yang terstruktur.</strong>
                  </p>
                </FadeUp>
              </div>
            </div>
          </div>
          
          {/* Bottom Half of Grid (Problem vs Solution) */}
          <div className="grid lg:grid-cols-3 border-t border-[#D8D3C8]">
            <div className="p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-[#D8D3C8]">
               <FadeUp>
                 <h3 className="text-xs tracking-widest uppercase font-bold mb-6 text-[#8B7C6E]">The Fragmented Way</h3>
                 <ul className="space-y-4 text-sm text-[#5A4F44]">
                   <li className="flex gap-4 border-b border-[#E6E1D6] pb-4"><span>—</span> Visibilitas rendah, hanya mengandalkan marketplace umum.</li>
                   <li className="flex gap-4 border-b border-[#E6E1D6] pb-4"><span>—</span> Tidak membangun *database* audiens sendiri.</li>
                   <li className="flex gap-4 border-b border-[#E6E1D6] pb-4"><span>—</span> Manajemen calon pembeli (*leads*) berantakan di chat personal.</li>
                 </ul>
               </FadeUp>
            </div>
            
            <div className="col-span-2 p-10 md:p-16 bg-[#E6E1D6]">
               <FadeUp delay={0.1}>
                 <h3 className="text-xs tracking-widest uppercase font-bold mb-6 text-[#2A221C]">The Pakde Ecosystem</h3>
                 <div className="grid sm:grid-cols-3 gap-8">
                   <div>
                     <div className="text-3xl font-bold mb-3">01.</div>
                     <h4 className="font-bold mb-2">Content Engine</h4>
                     <p className="text-xs text-[#5A4F44] leading-relaxed">Properti diubah menjadi konten video & storytelling berkualitas.</p>
                   </div>
                   <div>
                     <div className="text-3xl font-bold mb-3">02.</div>
                     <h4 className="font-bold mb-2">Omnichannel</h4>
                     <p className="text-xs text-[#5A4F44] leading-relaxed">Distribusi masif ke TikTok, IG, FB Ads, dan Google.</p>
                   </div>
                   <div>
                     <div className="text-3xl font-bold mb-3">03.</div>
                     <h4 className="font-bold mb-2">CRM Tech</h4>
                     <p className="text-xs text-[#5A4F44] leading-relaxed">Manajemen data leads & pipeline penjualan terpusat.</p>
                   </div>
                 </div>
               </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR - FLAT & ARCHITECTURAL */}
      <section className="border-t border-[#D8D3C8] bg-[#F2EFE9] py-24 px-6">
        <div className="max-w-[1000px] mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#2A221C] pb-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase">Simulation</h2>
                <div className="text-xs tracking-widest uppercase text-[#7A6B5D] mt-2">Illustrative Business Scenario</div>
              </div>
              <p className="text-xs text-[#5A4F44] max-w-xs text-right mt-4 md:mt-0">
                Simulasi pemodelan komersial pembagian Net Commission. Nilai dapat disesuaikan.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid md:grid-cols-2 gap-px bg-[#D8D3C8] border border-[#D8D3C8]">
              {/* Inputs */}
              <div className="bg-[#F2EFE9] p-8 md:p-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A221C] mb-3">Property Value (Rp)</label>
                    <input 
                      type="number" 
                      value={propertyPrice} 
                      onChange={(e) => setPropertyPrice(Number(e.target.value))}
                      className="w-full bg-transparent text-2xl md:text-3xl border-b border-[#D8D3C8] py-2 focus:outline-none focus:border-[#2A221C] font-light transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A221C] mb-3">Commission Rate (%)</label>
                    <input 
                      type="number" 
                      value={commissionRate}
                      step="0.1" 
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full bg-transparent text-2xl md:text-3xl border-b border-[#D8D3C8] py-2 focus:outline-none focus:border-[#2A221C] font-light transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-[#2A221C] text-[#F2EFE9] p-8 md:p-12 flex flex-col justify-between">
                <div className="space-y-6 text-sm font-light border-b border-[#4A3D32] pb-8">
                  <div className="flex justify-between items-end">
                    <span className="uppercase text-[#8B7C6E] text-xs">Gross Commission</span>
                    <span className="text-lg">{formatRupiah(grossCommission)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="uppercase text-[#8B7C6E] text-xs">Ext. Sales / Co-Broker</span>
                    <span className="text-lg text-[#D4A373]">- {formatRupiah(externalSalesCost)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="uppercase font-bold text-xs tracking-wider">Net Revenue</span>
                    <span className="text-2xl font-bold">{formatRupiah(netCommission)}</span>
                  </div>
                </div>
                
                <div className="pt-8 space-y-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#8B7C6E] mb-1">Partner Pool (30%)</div>
                    <div className="text-3xl font-light">{formatRupiah(partnerShare)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#8B7C6E] mb-1">Pakde Griya Ops (70%)</div>
                    <div className="text-3xl font-light">{formatRupiah(pakdeShare)}</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#8B7C6E] mt-4 uppercase tracking-widest">
              * Hanya untuk ilustrasi. Bukan jaminan keuntungan (*No guaranteed return*).
            </p>
          </FadeUp>
        </div>
      </section>

      {/* WHY ASKARA & RISKS (CLEAN LISTS) */}
      <section className="border-t border-[#D8D3C8] bg-[#E6E1D6]">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2">
          
          <div className="p-10 md:p-20 border-b lg:border-b-0 lg:border-r border-[#D8D3C8]">
            <FadeUp>
              <h2 className="text-3xl font-bold tracking-tighter uppercase mb-8">Built by Askara</h2>
              <p className="text-[#5A4F44] text-sm leading-relaxed mb-8">
                Didukung penuh oleh infrastruktur IT dan Kreatif dari Askara Indonesia. In-house kapabilitas: Website Development, CRM, Digital Ads, dan Creative Production. Fokus modal murni untuk pertumbuhan aset, bukan fee agensi luar.
              </p>
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#2A221C] border border-[#2A221C] inline-block px-4 py-2">
                Initial Market: Malang Raya (Jatim)
              </div>
            </FadeUp>
          </div>
          
          <div className="p-10 md:p-20">
            <FadeUp delay={0.1}>
              <h2 className="text-3xl font-bold tracking-tighter uppercase mb-8">Risk Disclosure</h2>
              <ul className="space-y-4 text-sm text-[#5A4F44] border-t border-[#D8D3C8] pt-8">
                <li className="flex gap-4"><span className="text-[#2A221C]">—</span> Properti membutuhkan waktu untuk terjual (*Illiquid*).</li>
                <li className="flex gap-4"><span className="text-[#2A221C]">—</span> Pendapatan komisi murni bergantung pada *closing* riil.</li>
                <li className="flex gap-4"><span className="text-[#2A221C]">—</span> Model bisnis fase validasi (*early-stage*).</li>
                <li className="flex gap-4"><span className="text-[#2A221C]">—</span> Tidak ada garansi modal/keuntungan pasti.</li>
              </ul>
            </FadeUp>
          </div>

        </div>
      </section>

      {/* FOOTER & CTA */}
      <footer id="contact-section" className="bg-[#2A221C] text-[#F2EFE9] border-t border-[#2A221C]">
        <div className="max-w-[1400px] mx-auto p-10 md:p-20 text-center">
          <FadeUp>
            <div className="text-[10px] tracking-widest text-[#8B7C6E] uppercase mb-6">Founding Phase Discussion</div>
            <h2 className="text-[8vw] md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] mb-12">
              LET'S BUILD<br/> THE NETWORK
            </h2>
            <a 
              href="https://wa.me/6285815999953?text=Halo%20Askara,%20saya%20tertarik%20berdiskusi%20lebih%20lanjut%20mengenai%20Strategic%20Partnership%20Pakde%20Griya." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-[#F2EFE9] text-[#2A221C] px-12 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D8D3C8] transition-colors"
            >
              START CONVERSATION
            </a>
          </FadeUp>
        </div>
        
        {/* Legal Strip */}
        <div className="border-t border-[#3A2F27] p-6">
          <div className="max-w-[1400px] mx-auto text-[9px] text-[#7A6B5D] uppercase tracking-wider text-center md:text-justify leading-relaxed">
            CONFIDENTIALITY & LEGAL DISCLAIMER: Halaman ini menampilkan konsep bisnis tahap awal dan skenario ilustratif. Informasi ini BUKAN penawaran umum efek, sekuritas, penggalangan dana publik (crowdfunding), jaminan investasi, atau rekomendasi keuangan. Tidak ada fitur transaksi. Segala bentuk kerja sama tunduk pada proses due diligence dan perjanjian tertulis.
          </div>
        </div>
      </footer>

    </div>
  );
}