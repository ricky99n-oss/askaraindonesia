'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BetaTesterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    const waText = `Halo Tim Askara! Saya ingin mendaftar program Beta Tester Askara Smart POS (Gratis 1 Bulan). Berikut data usaha saya:\n\n*Nama Pemilik:* ${formData.nama}\n*No. HP:* ${formData.noHp}\n*Email:* ${formData.email}\n*Nama Resto/Cafe:* ${formData.namaResto}\n*Alamat:* ${formData.alamatResto}\n*Lama Berdiri:* ${formData.lamaUsaha}\n*Jumlah Outlet:* ${formData.outlet} Outlet\n\n_Saya berkomitmen aktif mengirimkan feedback selama 1 bulan dan menyetujui syarat & ketentuan yang berlaku._`;
    window.open(`https://wa.me/6285815999953?text=${encodeURIComponent(waText)}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registrasi Beta Tester</h3>
                <p className="text-gray-500 text-xs mt-1">Klaim akses gratis 1 Bulan penuh.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleKlaimSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Pemilik *</label><input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp *</label><input type="tel" name="noHp" required value={formData.noHp} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif *</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Cafe / Resto *</label><input type="text" name="namaResto" required value={formData.namaResto} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label><textarea name="alamatResto" required rows={2} value={formData.alamatResto} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"></textarea></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Lama Berdiri *</label><input type="text" name="lamaUsaha" required value={formData.lamaUsaha} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Kebutuhan Outlet *</label><select name="outlet" value={formData.outlet} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">{[1,2,3,4,5,6,7,8,9,10].map(num => (<option key={num} value={num}>{num} Outlet</option>))}</select></div>
                </div>
                <div className="pt-2 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group"><div className="shrink-0 mt-0.5"><input type="checkbox" name="cekFeedback" required checked={formData.cekFeedback} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" /></div><span className="text-sm text-gray-600">Saya bersedia aktif mengirimkan Feedback selama 1 bulan pertama.</span></label>
                  <label className="flex items-start gap-3 cursor-pointer group"><div className="shrink-0 mt-0.5"><input type="checkbox" name="cekTerms" required checked={formData.cekTerms} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" /></div><span className="text-sm text-gray-600">Saya mengerti Syarat Ketentuan yang berlaku.</span></label>
                </div>
                <button type="submit" className="w-full mt-4 bg-askara-orange hover:bg-[#e67e00] text-white py-3.5 rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02]">Kirim Pendaftaran via WhatsApp</button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}