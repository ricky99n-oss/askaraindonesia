'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ isOpen, onClose, onSubmit, isLoading, selectedPlan }: any) {
  const [formData, setFormData] = useState({
    namaPemilik: '', email: '', namaResto: '', outlet: 1,
    restoUsername: '', restoPassword: '', repeatRestoPassword: '',
    ownerUsername: '', ownerPassword: '', repeatOwnerPassword: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'outlet' ? parseInt(value) : value }));
  };

  const isPasswordStrong = (password: string) => {
    if (!password) return false;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`|}{\[\]:;?><,./\-=0-9]).{8,}$/;
    return regex.test(password);
  };

  const restoPassValid = formData.restoPassword === '' || isPasswordStrong(formData.restoPassword);
  const restoRepeatValid = formData.repeatRestoPassword === '' || formData.restoPassword === formData.repeatRestoPassword;
  const ownerPassValid = formData.ownerPassword === '' || isPasswordStrong(formData.ownerPassword);
  const ownerRepeatValid = formData.repeatOwnerPassword === '' || formData.ownerPassword === formData.repeatOwnerPassword;

  const getPassInputClass = (isValid: boolean, value: string) => {
    if (value === '') return "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors";
    return isValid ? "w-full px-4 py-2.5 border-2 border-green-500 rounded-lg outline-none bg-green-50 transition-colors" : "w-full px-4 py-2.5 border-2 border-red-500 rounded-lg outline-none bg-red-50 transition-colors text-red-700";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoPassValid || !restoRepeatValid || formData.restoPassword === '') { alert("⚠️ Cek kembali Password App (Kasir) Anda!"); return; }
    if (formData.outlet > 1 && (!ownerPassValid || !ownerRepeatValid || formData.ownerPassword === '')) { alert("⚠️ Cek kembali Password Owner Anda!"); return; }
    onSubmit(formData);
  };

  if (!selectedPlan) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Checkout {selectedPlan.name}</h3>
                <p className="text-gray-500 text-xs mt-1">Atur detail akun untuk paket pilihan Anda.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik *</label><input type="text" name="namaPemilik" required value={formData.namaPemilik} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif *</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Resto *</label><input type="text" name="namaResto" required value={formData.namaResto} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Outlet *</label><select name="outlet" value={formData.outlet} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">{[1,2,3,4,5].map(num => (<option key={num} value={num}>{num} Outlet</option>))}</select></div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mt-4">
                  <h4 className="font-bold text-purple-800 text-sm mb-3">Kredensial Login App (Kasir)</h4>
                  <div className="mb-3"><label className="block text-xs font-medium text-gray-700 mb-1">Username App *</label><input type="text" name="restoUsername" required value={formData.restoUsername} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" placeholder="Cth: kasir1" /></div>
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

                {formData.outlet > 1 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-orange-50 p-4 rounded-xl border border-orange-100 mt-4">
                    <h4 className="font-bold text-askara-orange text-sm mb-3">Kredensial Dashboard Owner</h4>
                    <div className="mb-3"><label className="block text-xs font-medium text-gray-700 mb-1">Username Owner *</label><input type="text" name="ownerUsername" required value={formData.ownerUsername} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Cth: owner_budi" /></div>
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
                  {isLoading ? 'Memproses...' : `Bayar Paket ${selectedPlan.name} (Rp ${selectedPlan.price.toLocaleString('id-ID')})`}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}