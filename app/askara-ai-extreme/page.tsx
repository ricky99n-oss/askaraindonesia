'use client';

import { useState, useEffect } from 'react';

export default function AskaraEA() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '' });

  // Load Midtrans Snap Script
  useEffect(() => {
    const snapUrl = process.env.NODE_ENV === 'production' 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
      
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
            alert("Pembayaran Berhasil! License Key EA akan dikirim ke Email Anda.");
          },
          onPending: function (result: any) {
            alert("Menunggu pembayaran Anda...");
          },
          onError: function (result: any) {
            alert("Pembayaran Gagal.");
          },
          onClose: function () {
            alert("Anda menutup halaman sebelum menyelesaikan pembayaran.");
          }
        });
      } else {
        alert(data.error || "Gagal mendapatkan token pembayaran");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan pada sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500">
      
      {/* HERO SECTION */}
      <header className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-200">
          Askara AI Extreme
        </h1>
        <p className="text-xl text-gray-400 mb-10">
          Robot Trading Otonom Pertama dengan integrasi <span className="text-white font-semibold">Google Gemini 2.5 Flash & 3.1 Lite</span>. 
          Gunakan bahasa manusia untuk memerintah strategi trading Anda.
        </p>
      </header>

      {/* FEATURE CARDS */}
      <section className="px-6 py-12 bg-gray-800/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-3">Agentic AI Custom Prompt</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ketik strategi Anda langsung di menu MT5 (cth: "Trading saat RSI Oversold"). AI akan meracik algoritmanya secara realtime.
            </p>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Extreme Compounding</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sistem Anti-Martingale pintar. Melipatgandakan lot secara eksponensial hanya saat Anda Win Streak. Reset otomatis saat kalah.
            </p>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-lg">
            <div className="text-3xl mb-4">📰</div>
            <h3 className="text-xl font-bold mb-3">Native News Filter</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kebal terhadap High Impact News (NFP, CPI). EA membaca kalender internal MT5 dan mem-pause mesin secara otomatis.
            </p>
          </div>

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
            <p className="text-sm text-gray-400">1x Bayar. Pembaruan Gratis Selamanya.</p>
          </div>

          {/* WARNING BOX (HWID BINDING) */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="text-yellow-400 font-bold mb-1">Peringatan Instalasi (HWID Locked)</h4>
                <p className="text-sm text-yellow-200/80 leading-relaxed">
                  EA ini menggunakan sistem keamanan tingkat tinggi. <strong className="text-yellow-100">1 Lisensi hanya berlaku untuk 1 Perangkat (Device).</strong> 
                  <br className="mb-2"/>
                  Saat EA pertama kali dipasang, lisensi akan otomatis terkunci pada perangkat tersebut. Pastikan Anda menginstalnya di perangkat yang terpercaya (VPS Pribadi atau PC Pribadi yang menyala 24/7). Lisensi tidak dapat dipindah-tangankan!
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
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all"
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
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all"
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
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all"
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
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all"
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