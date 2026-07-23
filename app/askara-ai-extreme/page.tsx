'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AskaraEA() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '' });

  // Load Midtrans Snap Script
  useEffect(() => {
    // Ubah ke URL Production jika sudah siap rilis
    const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
      
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
    
    const script = document.createElement('script');
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); };
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/askara-ea/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.token) {
        // Panggil popup Midtrans
        (window as any).snap.pay(data.token, {
          onSuccess: function (result: any) {
            alert("Pembayaran Berhasil! Mengalihkan ke halaman unduhan...");
            // Redirect ke halaman downloader
            router.push('/askara-ai-extreme/download');
          },
          onPending: function (result: any) {
            alert("Menunggu pembayaran Anda diselesaikan...");
          },
          onError: function (result: any) {
            alert("Pembayaran Gagal atau Dibatalkan. Silakan coba lagi.");
          },
          onClose: function () {
            alert("Anda menutup halaman sebelum menyelesaikan pembayaran.");
          }
        });
      } else {
        alert(data.error || "Gagal mendapatkan token pembayaran dari server.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan pada sistem koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500">
      
      {/* HEADER SECTION */}
      <header className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
        <Link href="/produk" className="inline-block mb-8 text-sm font-bold text-gray-500 hover:text-gray-300 transition flex items-center justify-center gap-2">
          <span>&larr;</span> Kembali ke Katalog Produk
        </Link>
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6 shadow-sm">
          Sistem Trading Otonom Next-Gen
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-200 to-white">
          Askara AI Extreme
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Ubah cara Anda bertrading. Integrasi langsung <span className="text-white font-semibold">Google Gemini AI</span> ke dalam MetaTrader 5. Berikan instruksi menggunakan bahasa manusia, dan biarkan AI mengeksekusi strategi Anda dengan presisi mesin.
        </p>

        {/* GAMBAR 1: TAMPILAN DASHBOARD UTAMA */}
        <div className="relative w-full aspect-video max-w-4xl mx-auto bg-gray-800 rounded-2xl border border-gray-700 shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden flex items-center justify-center group cursor-pointer">
          <img 
            src="/images/dashboard.jpg" // Ganti path ini ke gambar asli Anda
            alt="Askara AI Dashboard di MetaTrader 5" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500" 
          />
          {/* Overlay gradient tipis untuk estetika */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
        </div>
      </header>

      {/* CUSTOM PROMPT SECTION */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Program EA Anda Tanpa Perlu Coding</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Tidak perlu mengerti MQL5 atau algoritma rumit. Fitur <strong className="text-white">Agentic AI Custom Prompt</strong> memungkinkan Anda memberikan "Doktrin" langsung kepada mesin menggunakan bahasa sehari-hari.
            </p>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 font-mono text-sm text-green-400 shadow-inner">
              <span className="text-gray-500">// Contoh Input Strategi Anda:</span><br/>
              "Gunakan Price Action. Jika market sideways, balas HOLD. Fokus pada trend besar. Abaikan sinyal jika RSI di atas 70."
            </div>
            <p className="text-gray-400 mt-6 leading-relaxed">
              Google Gemini akan membaca instruksi tersebut, menganalisis data indikator (RSI, MACD, ATR, Candlestick) secara real-time, dan meracik keputusan matematis tingkat tinggi dalam hitungan milidetik.
            </p>
          </div>
          
          {/* GAMBAR 2: TAMPILAN INPUT/PROMPT */}
          <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex items-center justify-center group cursor-pointer">
            <img 
              src="/images/inputs.jpg" // Ganti path ini ke gambar asli Anda
              alt="Askara AI Menu Input & Prompt" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="px-6 py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Infrastruktur Trading Kelas Enterprise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3">Extreme Compounding</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Mesin Anti-Martingale pintar. Lot trading akan membesar secara eksponensial HANYA saat Anda mengalami rentetan kemenangan (Win Streak). Reset otomatis ke lot awal saat terjadi satu kekalahan.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Dynamic SL & TP</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tinggalkan batasan statis yang kaku. AI akan menghitung Take Profit dan Stop Loss secara dinamis menyesuaikan volatilitas pasar dan target compounding Anda secara otomatis.
              </p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-xl font-bold mb-3">Native News Filter</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Terhubung langsung dengan Kalender Ekonomi MT5. EA mendeteksi berita berdampak tinggi (NFP, Suku Bunga) dan otomatis menunda trading untuk menghindari slippage fatal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GAMBAR 3: NOTIFIKASI TELEGRAM / WIN STREAK */}
      <section className="px-6 py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto relative w-full aspect-[21/9] bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex items-center justify-center group">
          <img 
            src="/images/placeholder-telegram.jpg" // Ganti path ini ke gambar asli Anda
            alt="Laporan Profit Telegram Askara AI" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
          />
        </div>
      </section>

      {/* CHECKOUT SECTION */}
      <section className="py-20 px-6 max-w-xl mx-auto">
        <div className="bg-gradient-to-b from-blue-900/20 to-gray-800 p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Miliki Sekarang</h2>
            <div className="text-5xl font-black text-white mb-2">
              Rp 129.000 <span className="text-lg text-gray-400 font-normal">/ lifetime</span>
            </div>
            <p className="text-sm text-gray-400">1x Bayar. Unduh Instan. Pembaruan Gratis Selamanya.</p>
          </div>

          {/* WARNING BOX (HWID BINDING) */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-1">⚠️</span>
              <div>
                <h4 className="text-yellow-400 font-bold mb-1">Peringatan: HWID Locked System</h4>
                <p className="text-sm text-yellow-200/80 leading-relaxed">
                  Sistem ini menggunakan perlindungan Cloud Database. <strong className="text-yellow-100">1 Lisensi = 1 Perangkat.</strong> 
                  <br className="mb-2"/>
                  Saat EA pertama kali dipasang, ia akan mengunci Hardware ID perangkat tersebut secara permanen. Pastikan Anda menginstalnya langsung di VPS atau PC Trading utama Anda.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
              <input 
                required 
                type="text" 
                placeholder="Misal: Budi Santoso"
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all placeholder:text-gray-600"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username EA <span className="text-gray-500 text-xs font-normal">(Tanpa Spasi)</span>
              </label>
              <input 
                required 
                type="text" 
                pattern="^\S+$"
                title="Username tidak boleh mengandung spasi"
                placeholder="Misal: budi_trader"
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all placeholder:text-gray-600"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Alamat Email (Pengiriman Lisensi)</label>
              <input 
                required 
                type="email" 
                placeholder="budi@email.com"
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all placeholder:text-gray-600"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">No. WhatsApp</label>
              <input 
                required 
                type="tel" 
                placeholder="081234567890"
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all placeholder:text-gray-600"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Memproses Gateway...' : 'Beli Sekarang - Rp 129.000'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Pembayaran diamankan dengan enkripsi standar industri oleh Midtrans</span>
          </div>
        </div>
      </section>

    </div>
  );
}