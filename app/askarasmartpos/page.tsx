// app/askarasmartpos/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

// IMPORT KOMPONEN MODULAR
import BetaTesterModal from './components/BetaTesterModal';
import CheckoutModal from './components/CheckoutModal';
import PricingSection from './components/PricingSection';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const HeroSection = ({ onOpenBeta, isBetaFull }: any) => (
  <section className="text-white py-16 md:py-32 px-6 bg-linear-to-br from-[#4A00E0] via-[#6a11cb] to-[#8E2DE2] overflow-hidden">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center text-left">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="z-10">
        <div className="bg-askara-orange text-[10px] md:text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">PRODUK UNGGULAN</div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight uppercase tracking-tight">Askara <span className="text-askara-orange">Smart POS</span>.</h1>
        <p className="text-base md:text-xl text-purple-100 max-w-md mb-8">Solusi sistem kasir pintar paling stabil. Dirancang agar pemilik restoran bisa memantau bisnis dengan tenang dari mana saja.</p>
        
        <div className="flex flex-col sm:flex-row justify-start gap-4 flex-wrap">
          {/* TOMBOL BETA DI HERO SECTION */}
          <button 
            onClick={onOpenBeta} 
            disabled={isBetaFull}
            className={`px-8 py-3.5 rounded-xl font-bold shadow-xl transition-all text-center ${isBetaFull ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed' : 'bg-askara-orange hover:bg-[#e67e00] text-white shadow-orange-500/20 hover:scale-105'}`}
          >
            {isBetaFull ? 'Kuota Beta Habis' : 'Klaim Gratis 1 Bulan'}
          </button>
          
          <a href="/download" className="flex items-center justify-center gap-2 bg-purple-700/50 hover:bg-purple-600 border border-purple-400/50 text-white px-8 py-3.5 rounded-xl font-bold backdrop-blur-sm transition-all hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download App
          </a>

          <a href="#pricing" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold backdrop-blur-sm transition-all text-center">
            Lihat Harga
          </a>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="w-full mt-8 lg:mt-0 flex justify-center">
        <Image src="/hero-pos.png" alt="Tampilan Utama Askara Smart POS" width={800} height={600} className="w-full max-w-2xl h-auto object-contain drop-shadow-2xl" priority />
      </motion.div>
    </div>
  </section>
);

export default function AskaraSmartPOS() {
  const [isBetaOpen, setIsBetaOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, name: string, price: number, limit: number} | null>(null);
  
  // STATE BARU UNTUK CEK KUOTA BETA
  const [isBetaFull, setIsBetaFull] = useState(false);

  useEffect(() => {
    // 1. Script Midtrans
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"; 
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""; 
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    // 2. Cek Kuota Beta Tester
    async function checkBetaQuota() {
      if (!supabase) return;
      try {
        const { count, error } = await supabase
          .from('beta_testers')
          .select('*', { count: 'exact', head: true });
          
        if (!error && count !== null) {
          // JIKA SUDAH 3 ORANG ATAU LEBIH, KUNCI FORM BETA
          if (count >= 3) {
            setIsBetaFull(true);
          }
        }
      } catch (err) {
        console.error("Gagal cek kuota beta", err);
      }
    }
    checkBetaQuota();

    return () => { document.body.removeChild(script); }
  }, []);

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCheckout = async (formData: any) => {
    if (!selectedPlan) return;
    setIsCheckoutLoading(true);
    
    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // KUNCI KEAMANAN: Payload sudah dibersihkan. 
          // Hanya mengirim ID Plan dan data penting untuk Supabase Auth
          planId: selectedPlan.id, 
          customerName: formData.namaPemilik,
          customerEmail: formData.email,
          restoName: formData.namaResto,
          restoPassword: formData.restoPassword
        })
      });
      const data = await response.json();
      
      if (data.token) {
        setIsCheckoutOpen(false);
        (window as any).snap.pay(data.token, {
          onSuccess: function(result: any) {
            alert("✅ Pembayaran Berhasil!\n\nKredensial dan instruksi login telah dikirimkan ke email Anda.");
          },
          onPending: function(result: any) {
            alert("⏳ Menunggu pembayaran diselesaikan.");
          },
          onError: function(result: any) {
            alert("❌ Pembayaran Gagal. Silakan coba lagi.");
          }
        });
      } else {
        alert('Gagal mendapatkan token pembayaran: ' + (data.error || 'Server error'));
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-800 relative">
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Logo Askara Indonesia" width={180} height={50} className="object-contain h-10 w-auto md:h-12" priority onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#4A00E0] to-[#8E2DE2]">ASKARA <span class="font-medium text-askara-orange">INDONESIA</span></span>'; }} />
          </Link>
          
          <div className="flex items-center gap-4">
            <a href="/download" className="hidden md:flex items-center gap-2 text-sm font-bold text-purple-600 bg-purple-50 border border-purple-100 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download App
            </a>
            <Link href="/" className="text-gray-500 hover:text-askara-orange transition font-bold text-sm flex items-center gap-2"><span>&larr;</span> Kembali</Link>
          </div>
        </div>
      </header>

      {/* Passing isBetaFull ke HeroSection */}
      <HeroSection onOpenBeta={() => setIsBetaOpen(true)} isBetaFull={isBetaFull} />
      
      <section className="py-20 md:py-32 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="order-2 md:order-1 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-linear-to-r from-[#4A00E0] to-[#8E2DE2]">Pantau Semua Cabang dari Satu HP.</h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">Berapapun jumlah cabang restoran atau kafe Anda, kini Owner tidak perlu lagi datang satu per satu ke lokasi hanya untuk menanyakan omzet.</p>
          </div>
          <div className="order-1 md:order-2 w-full flex justify-center">
            <Image src="/showcase-multi.png" alt="Laporan Multi-Cabang Askara" width={800} height={600} className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* Passing isBetaFull ke PricingSection */}
      <PricingSection onOpenCheckout={handleOpenCheckout} onOpenBeta={() => setIsBetaOpen(true)} isBetaFull={isBetaFull} />

      <footer className="bg-[#0f172a] text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-500 text-xs tracking-wider uppercase font-medium">© {new Date().getFullYear()} PT Askara Indonesia Perkasa.</p>
        </div>
      </footer>

      {/* Jika isBetaFull true, cegah modal terbuka meskipun ada yg nakal by-pass UI */}
      {!isBetaFull && (
        <BetaTesterModal isOpen={isBetaOpen} onClose={() => setIsBetaOpen(false)} />
      )}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSubmit={handleCheckout} isLoading={isCheckoutLoading} selectedPlan={selectedPlan} />
    </main>
  );
}