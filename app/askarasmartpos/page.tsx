// app/askarasmartpos/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// 1. KOMPONEN MODAL BETA TESTER (WHATSAPP)
// ============================================================================
const BetaTesterModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    nama: '', noHp: '', email: '', alamatResto: '', namaResto: '', lamaUsaha: '', outlet: '1', cekFeedback: false, cekTerms: false,
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleKlaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cekFeedback || !formData.cekTerms) {
      alert("Mohon centang persetujuan Syarat & Ketentuan serta komitmen Feedback.");
      return;
    }
    const waText = `Halo Tim Askara! Saya ingin mendaftar program Beta Tester Askara Smart POS (Gratis 1 Bulan). Berikut data usaha saya:
    
*Nama Pemilik:* ${formData.nama}
*No. HP:* ${formData.noHp}
*Email:* ${formData.email}
*Nama Resto/Cafe:* ${formData.namaResto}
*Alamat:* ${formData.alamatResto}
*Lama Berdiri:* ${formData.lamaUsaha}
*Jumlah Outlet:* ${formData.outlet} Outlet

_Saya berkomitmen aktif mengirimkan feedback selama 1 bulan dan menyetujui syarat & ketentuan yang berlaku._`;

    window.open(`https://wa.me/6285815999953?text=${encodeURIComponent(waText)}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registrasi Beta Tester</h3>
                <p className="text-gray-500 text-xs mt-1">Klaim akses gratis 1 Bulan penuh.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleKlaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Pemilik *</label>
                  <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp *</label>
                    <input type="tel" name="noHp" required value={formData.noHp} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Cafe / Resto *</label>
                  <input type="text" name="namaResto" required value={formData.namaResto} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                  <textarea name="alamatResto" required rows={2} value={formData.alamatResto} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lama Berdiri *</label>
                    <input type="text" name="lamaUsaha" required value={formData.lamaUsaha} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kebutuhan Outlet *</label>
                    <select name="outlet" value={formData.outlet} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (<option key={num} value={num}>{num} Outlet</option>))}
                    </select>
                  </div>
                </div>
                <div className="pt-2 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="shrink-0 mt-0.5"><input type="checkbox" name="cekFeedback" required checked={formData.cekFeedback} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" /></div>
                    <span className="text-sm text-gray-600">Saya bersedia aktif mengirimkan Feedback selama 1 bulan pertama.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="shrink-0 mt-0.5"><input type="checkbox" name="cekTerms" required checked={formData.cekTerms} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" /></div>
                    <span className="text-sm text-gray-600">Saya mengerti Syarat Ketentuan yang berlaku.</span>
                  </label>
                </div>
                <button type="submit" className="w-full mt-4 bg-askara-orange hover:bg-[#e67e00] text-white py-3.5 rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02]">
                  Kirim Pendaftaran via WhatsApp
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
// ============================================================================
// 2. KOMPONEN MODAL CHECKOUT KUSTOM (MIDTRANS) - DENGAN VALIDASI REALTIME
// ============================================================================
const CheckoutModal = ({ isOpen, onClose, onSubmit, isLoading }: any) => {
  const [formData, setFormData] = useState({
    namaPemilik: '', email: '', namaResto: '', outlet: 1,
    restoUsername: '', restoPassword: '', repeatRestoPassword: '',
    ownerUsername: '', ownerPassword: '', repeatOwnerPassword: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'outlet' ? parseInt(value) : value }));
  };

  // Validasi Regex Password Kuat
  const isPasswordStrong = (password: string) => {
    if (!password) return false;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`|}{\[\]:;?><,./\-=0-9]).{8,}$/;
    return regex.test(password);
  };

  // PENGECEKAN STATUS REAL-TIME
  const restoPassValid = formData.restoPassword === '' || isPasswordStrong(formData.restoPassword);
  const restoRepeatValid = formData.repeatRestoPassword === '' || formData.restoPassword === formData.repeatRestoPassword;
  
  const ownerPassValid = formData.ownerPassword === '' || isPasswordStrong(formData.ownerPassword);
  const ownerRepeatValid = formData.repeatOwnerPassword === '' || formData.ownerPassword === formData.repeatOwnerPassword;

  // FUNGSI PEMBERI WARNA KOTAK INPUT OTOMATIS
  const getPassInputClass = (isValid: boolean, value: string) => {
    if (value === '') return "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors";
    return isValid 
      ? "w-full px-4 py-2.5 border-2 border-green-500 rounded-lg outline-none bg-green-50 transition-colors" 
      : "w-full px-4 py-2.5 border-2 border-red-500 rounded-lg outline-none bg-red-50 transition-colors text-red-700";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cegah submit jika masih ada yang merah
    if (!restoPassValid || !restoRepeatValid || formData.restoPassword === '') {
      alert("⚠️ Cek kembali Password App (Kasir) Anda!");
      return;
    }

    if (formData.outlet > 1 && (!ownerPassValid || !ownerRepeatValid || formData.ownerPassword === '')) {
      alert("⚠️ Cek kembali Password Owner Anda!");
      return;
    }

    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Checkout Askara Pro</h3>
                <p className="text-gray-500 text-xs mt-1">Atur detail akun aplikasi Anda.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik *</label>
                    <input type="text" name="namaPemilik" required value={formData.namaPemilik} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Resto *</label>
                    <input type="text" name="namaResto" required value={formData.namaResto} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Outlet *</label>
                    <select name="outlet" value={formData.outlet} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                      {[1,2,3,4,5].map(num => (<option key={num} value={num}>{num} Outlet</option>))}
                    </select>
                  </div>
                </div>

                {/* KREDENSIAL APP (KASIR) DENGAN REALTIME WARNING */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mt-4">
                  <h4 className="font-bold text-purple-800 text-sm mb-3">Kredensial Login App (Kasir)</h4>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Username App *</label>
                    <input type="text" name="restoUsername" required value={formData.restoUsername} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="Cth: kasir1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password App *</label>
                      <input type="password" name="restoPassword" required value={formData.restoPassword} onChange={handleChange} className={getPassInputClass(restoPassValid, formData.restoPassword)} placeholder="Minimal 8 karakter" />
                      {!restoPassValid && <p className="text-red-500 text-[10px] mt-1.5 leading-tight font-medium">Harus kombinasi huruf BESAR, kecil & angka/simbol.</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Ulangi Password *</label>
                      <input type="password" name="repeatRestoPassword" required value={formData.repeatRestoPassword} onChange={handleChange} className={getPassInputClass(restoRepeatValid, formData.repeatRestoPassword)} placeholder="Ulangi password" />
                      {!restoRepeatValid && <p className="text-red-500 text-[10px] mt-1.5 leading-tight font-medium">Password tidak sama!</p>}
                    </div>
                  </div>
                </div>

                {/* KREDENSIAL OWNER DENGAN REALTIME WARNING */}
                {formData.outlet > 1 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-orange-50 p-4 rounded-xl border border-orange-100 mt-4">
                    <h4 className="font-bold text-askara-orange text-sm mb-3">Kredensial Dashboard Owner</h4>
                    <p className="text-xs text-gray-600 mb-3">Akses khusus manager untuk memantau {formData.outlet} outlet.</p>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Username Owner *</label>
                      <input type="text" name="ownerUsername" required value={formData.ownerUsername} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Cth: owner_budi" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password Owner *</label>
                        <input type="password" name="ownerPassword" required value={formData.ownerPassword} onChange={handleChange} className={getPassInputClass(ownerPassValid, formData.ownerPassword)} placeholder="Minimal 8 karakter" />
                        {!ownerPassValid && <p className="text-red-500 text-[10px] mt-1.5 leading-tight font-medium">Harus kombinasi huruf BESAR, kecil & angka/simbol.</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ulangi Password *</label>
                        <input type="password" name="repeatOwnerPassword" required value={formData.repeatOwnerPassword} onChange={handleChange} className={getPassInputClass(ownerRepeatValid, formData.repeatOwnerPassword)} placeholder="Ulangi password" />
                        {!ownerRepeatValid && <p className="text-red-500 text-[10px] mt-1.5 leading-tight font-medium">Password tidak sama!</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading || !restoPassValid || !restoRepeatValid || (formData.outlet > 1 && (!ownerPassValid || !ownerRepeatValid))} 
                  className={`w-full mt-6 py-3.5 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center ${
                    (!restoPassValid || !restoRepeatValid || (formData.outlet > 1 && (!ownerPassValid || !ownerRepeatValid)))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-[1.02]'
                  }`}
                >
                  {isLoading ? 'Memproses...' : 'Lanjutkan Pembayaran (Rp 149.000)'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 3. SECTIONS (HERO, SHOWCASES, PRICING)
// ============================================================================
const HeroSection = ({ onOpenBeta }: any) => (
  <section className="text-white py-16 md:py-32 px-6 bg-linear-to-br from-[#4A00E0] via-[#6a11cb] to-[#8E2DE2] overflow-hidden">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center text-left">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="z-10">
        <div className="bg-askara-orange text-[10px] md:text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">PRODUK UNGGULAN</div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight uppercase tracking-tight">Askara <span className="text-askara-orange">Smart POS</span>.</h1>
        <p className="text-base md:text-xl text-purple-100 max-w-md mb-8">Solusi sistem kasir pintar paling stabil. Dirancang agar pemilik restoran bisa memantau bisnis dengan tenang dari mana saja.</p>
        <div className="flex flex-col sm:flex-row justify-start gap-4">
          <button onClick={onOpenBeta} className="bg-askara-orange hover:bg-[#e67e00] text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-orange-500/20 hover:scale-105 transition-all text-center">
            Klaim Gratis 1 Bulan
          </button>
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

const PricingSection = ({ onOpenCheckout, onOpenBeta }: { onOpenCheckout: () => void, onOpenBeta: () => void }) => (
  <section id="pricing" className="py-24 px-6 bg-white">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">Investasi Terbaik untuk Usaha Anda.</h2>
      <p className="text-lg text-gray-600 mb-12">Tanpa biaya instalasi tersembunyi. Dapatkan fitur setara Enterprise dengan harga terjangkau.</p>
      
      <div className="bg-white border-2 border-purple-100 rounded-4xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-6 right-[-40px] bg-askara-orange text-white font-bold text-sm py-1 px-12 transform rotate-45">
          PROMO EARLY BIRD
        </div>

        <h3 className="text-2xl font-bold text-purple-700 mb-2">Paket Askara Pro</h3>
        <p className="text-gray-500 mb-6">Akses ke semua fitur Cloud & Offline-First</p>
        
        <div className="mb-8">
          <span className="line-through text-gray-400 text-2xl font-medium block mb-1">Rp 599.000 / bulan</span>
          <div className="flex justify-center items-end gap-2">
            <span className="text-xl font-bold text-gray-900 mb-2">Rp</span>
            <span className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter">149<span className="text-3xl">.000</span></span>
            <span className="text-gray-500 mb-2">/ bulan</span>
          </div>
        </div>

        <button onClick={onOpenCheckout} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl text-lg mb-4 shadow-lg hover:scale-[1.02] transition-all">
          Berlangganan Sekarang
        </button>

        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <p className="text-askara-orange font-black text-xl md:text-2xl uppercase tracking-wide mb-3">
            DAPATKAN HARI INI GRATIS 1 BULAN!
          </p>
          <p className="text-gray-700 text-sm">
            Jadilah bagian dari 3 Beta Tester pertama kami. Kuota sangat terbatas dan akan ditutup kapan saja.
          </p>
          <button onClick={onOpenBeta} className="mt-4 bg-askara-orange hover:bg-[#e67e00] text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105">
            Klaim Kuota Beta Tester
          </button>
        </div>
      </div>
    </div>
  </section>
);

// ============================================================================
// 4. MAIN PAGE ASSEMBLER
// ============================================================================
export default function AskaraSmartPOS() {
  const [isBetaOpen, setIsBetaOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"; 
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""; 
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  const handleCheckout = async (formData: any) => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: 'Premium_1_Bulan',
          price: 149000, 
          customerName: formData.namaPemilik,
          customerEmail: formData.email,
          restoName: formData.namaResto,
          outlet: formData.outlet,
          restoUsername: formData.restoUsername,
          restoPassword: formData.restoPassword,
          ownerUsername: formData.outlet > 1 ? formData.ownerUsername : formData.restoUsername,
          ownerPassword: formData.outlet > 1 ? formData.ownerPassword : formData.restoPassword,
        })
      });
      const data = await response.json();
      
      if (data.token) {
        setIsCheckoutOpen(false);
        // FIX 1: Mencegah redirect ke example.com dengan callback
        (window as any).snap.pay(data.token, {
          onSuccess: function(result: any) {
            alert("✅ Pembayaran Berhasil!\n\nKredensial dan instruksi login telah dikirimkan ke email Anda.");
          },
          onPending: function(result: any) {
            alert("⏳ Menunggu pembayaran diselesaikan.");
          },
          onError: function(result: any) {
            alert("❌ Pembayaran Gagal. Silakan coba lagi.");
          },
          onClose: function() {
            // Aksi jika user menutup popup secara manual
          }
        });
      } else {
        alert('Gagal mendapatkan token pembayaran');
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
          <Link href="/" className="text-gray-500 hover:text-askara-orange transition font-bold text-sm flex items-center gap-2"><span>&larr;</span> Kembali</Link>
        </div>
      </header>

      <HeroSection onOpenBeta={() => setIsBetaOpen(true)} />
      
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

      <PricingSection onOpenCheckout={() => setIsCheckoutOpen(true)} onOpenBeta={() => setIsBetaOpen(true)} />

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-gray-500 text-xs tracking-wider uppercase font-medium">© {new Date().getFullYear()} PT Askara Indonesia Perkasa.</p>
        </div>
      </footer>

      {/* PANGGIL KEDUA MODAL */}
      <BetaTesterModal isOpen={isBetaOpen} onClose={() => setIsBetaOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSubmit={handleCheckout} isLoading={isCheckoutLoading} />
    </main>
  );
}