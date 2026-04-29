'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ isOpen, onClose, onSubmit, isLoading, selectedPlan }: any) {
  const [formData, setFormData] = useState({
    namaPemilik: '',
    email: '',
    namaResto: '',
    outlet: 1,
    restoPassword: '', // Ini akan jadi password Supabase Auth
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.restoPassword.length < 6) {
      alert("Password minimal harus 6 karakter demi keamanan.");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Checkout {selectedPlan?.name}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-100 flex justify-between items-center">
              <div>
                <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">Total Pembayaran</p>
                <p className="text-2xl font-black text-gray-900">Rp {selectedPlan?.price?.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Kuota: {selectedPlan?.limit?.toLocaleString('id-ID')} Struk</p>
                <p className="text-sm font-bold text-green-600">Aktif 30 Hari</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Pemilik</label>
                  <input required type="text" name="namaPemilik" value={formData.namaPemilik} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" placeholder="Cth: Budi Santoso" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Resto/Toko</label>
                  <input required type="text" name="namaResto" value={formData.namaResto} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" placeholder="Cth: Kopi Senja" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email (Untuk Login)</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" placeholder="Cth: budi@gmail.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Buat Password App (Min. 6 Karakter)</label>
                <input required type="password" name="restoPassword" value={formData.restoPassword} onChange={handleChange} minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" placeholder="••••••••" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4A00E0] hover:bg-purple-700 shadow-purple-500/30 hover:scale-[1.02]'}`}>
                  {isLoading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}