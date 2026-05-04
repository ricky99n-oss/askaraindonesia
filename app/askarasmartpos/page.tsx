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

// ==========================================
// 1. KOMPONEN HERO SECTION
// ==========================================
const HeroSection = ({ onOpenBeta, isBetaFull }: any) => (
  <section className="text-white py-16 md:py-32 px-6 bg-linear-to-br from-[#4A00E0] via-[#6a11cb] to-[#8E2DE2] overflow-hidden">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center text-left">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="z-10">
        <div className="bg-askara-orange text-[10px] md:text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">PRODUK UNGGULAN</div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight uppercase tracking-tight">Askara <span className="text-askara-orange">Smart POS</span>.</h1>
        <p className="text-base md:text-xl text-purple-100 max-w-md mb-8">Solusi sistem kasir pintar paling stabil. Dirancang agar pemilik restoran bisa memantau bisnis dengan tenang dari mana saja.</p>
        
        <div className="flex flex-col sm:flex-row justify-start gap-4 flex-wrap">
          <button 
            onClick={onOpenBeta} 
            disabled={isBetaFull}
            className={`px-8 py-3.5 rounded-xl font-bold shadow-xl transition-all text-center ${isBetaFull ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed' : 'bg-askara-orange hover:bg-[#e67e00] text-white shadow-orange-500/20 hover:scale-105'}`}
          >
            {isBetaFull ? 'Kuota Beta Habis' : 'Klaim Gratis 2 Bulan Jadi Beta Tester'}
          </button>
          
          <a href="https://powusazheadrnfbdqxpj.supabase.co/storage/v1/object/public/apk-releases/Askara%20Smart%20POS%202.0.apk" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-purple-700/50 hover:bg-purple-600 border border-purple-400/50 text-white px-8 py-3.5 rounded-xl font-bold backdrop-blur-sm transition-all hover:scale-105">
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

// ==========================================
// 2. KOMPONEN FITUR UNGGULAN (YANG KEMBALI)
// ==========================================
const FeatureSection = () => {
  const features = [
    {
      title: "Mode Offline (Anti-Badai)",
      desc: "Internet putus? Kasir tetap bisa berjualan dan mencetak struk. Data otomatis sinkron ke server saat internet menyala.",
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Kitchen Display (KDS)",
      desc: "Pesanan dari kasir otomatis masuk ke layar dapur secara real-time. Tidak perlu lagi teriak-teriak atau pakai kertas order.",
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Multi-Cabang & Laporan",
      desc: "Pantau omzet, stok, dan performa kasir di berbagai cabang berbeda hanya dari satu dashboard di HP Owner.",
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Manajemen Meja & Kiosk",
      desc: "Dukung sistem Dine-in dengan nomor meja, atau mode Kiosk di mana pelanggan bisa memesan dan bayar mandiri (QRIS).",
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
      color: "from-purple-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Fitur Lengkap untuk Segala Jenis F&B</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Dirancang khusus untuk Kafe, Resto, Foodcourt, hingga Kaki Lima. Semua yang Anda butuhkan ada di sini.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-linear-to-br ${feat.color} shadow-lg`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. KOMPONEN HALAMAN UTAMA
// ==========================================
export default function AskaraSmartPOS() {
  const [isBetaOpen, setIsBetaOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, name: string, price: number, limit: number} | null>(null);
  const [isBetaFull, setIsBetaFull] = useState(false);

  useEffect(() => {
    // 🔥 SCRIPT MIDTRANS MODE LIVE / PRODUCTION 🔥
    const snapScript = "https://app.midtrans.com/snap/snap.js"; 
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""; 
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    // Cek Kuota Beta Tester
    async function checkBetaQuota() {
      if (!supabase) return;
      try {
        const { count, error } = await supabase
          .from('beta_testers')
          .select('*', { count: 'exact', head: true });
          
        if (!error && count !== null) {
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
            window.location.href = `/success?transaction_status=${result.transaction_status}&order_id=${result.order_id}`;
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
      alert('Terjadi kesalahan pada sistem');
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
            <a href="https://powusazheadrnfbdqxpj.supabase.co/storage/v1/object/public/apk-releases/Askara%20Smart%20POS%202.0.apk" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm font-bold text-purple-600 bg-purple-50 border border-purple-100 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download App
            </a>
            <Link href="/" className="text-gray-500 hover:text-askara-orange transition font-bold text-sm flex items-center gap-2"><span>&larr;</span> Kembali</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection onOpenBeta={() => setIsBetaOpen(true)} isBetaFull={isBetaFull} />
      
      {/* Fitur Lengkap Section */}
      <FeatureSection />
      
      {/* Multi-Cabang Section */}
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

      {/* Harga & Checkout */}
      <PricingSection onOpenCheckout={handleOpenCheckout} onOpenBeta={() => setIsBetaOpen(true)} isBetaFull={isBetaFull} />

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-500 text-xs tracking-wider uppercase font-medium">© {new Date().getFullYear()} PT Askara Indonesia Perkasa.</p>
        </div>
      </footer>

      {/* Modals */}
      {!isBetaFull && (
        <BetaTesterModal isOpen={isBetaOpen} onClose={() => setIsBetaOpen(false)} />
      )}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSubmit={handleCheckout} isLoading={isCheckoutLoading} selectedPlan={selectedPlan} />
    </main>
  );
}