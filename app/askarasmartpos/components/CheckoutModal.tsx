'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ isOpen, onClose, onSubmit, isLoading, selectedPlan }: any) {
  const [formData, setFormData] = useState({
    namaPemilik: '',
    email: '',
    namaResto: '',
    outlet: 1,
    restoPassword: '', 
  });

  const [showPassword, setShowPassword] = useState(false);

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
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    name="restoPassword" 
                    value={formData.restoPassword} 
                    onChange={handleChange} 
                    minLength={6} 
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                    placeholder="••••••••" 
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
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