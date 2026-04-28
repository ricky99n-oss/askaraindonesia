'use client';
import React from 'react';

const IconCheck = () => (
  <svg className="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
);

export default function PricingSection({ onOpenCheckout, onOpenBeta }: { onOpenCheckout: (plan: any) => void, onOpenBeta: () => void }) {
  const plans = [
    { id: 'BASIC', name: 'BASIC', price: 149000, limit: 2500, desc: 'Cocok untuk usaha kecil / baru mulai', est: '±80 transaksi/hari', recommended: false },
    { id: 'GROWTH', name: 'GROWTH', price: 249000, limit: 5000, desc: 'Cocok untuk usaha menengah / berkembang', est: '±150 transaksi/hari', recommended: true },
    { id: 'PRO', name: 'PRO (Scale Up)', price: 349000, limit: 10000, desc: 'Cocok untuk usaha ramai / multi shift', est: '300+ transaksi/hari', recommended: false }
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Pilih Paket Sesuai Skala Usaha Anda</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Semua paket mendapatkan fitur lengkap tanpa dikunci. Perbedaan hanya pada kuota struk transaksi per bulan.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-3xl p-8 relative transition-all duration-300 ${plan.recommended ? 'border-2 border-purple-500 shadow-2xl md:scale-105 z-10' : 'border border-gray-200 shadow-lg hover:shadow-xl'}`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                  PALING POPULER
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6 h-10">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">Rp {plan.price.toLocaleString('id-ID')}</span>
                <span className="text-gray-500 font-medium">/bln</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><IconCheck /> <span className="font-bold text-purple-700">{plan.limit.toLocaleString('id-ID')} Struk / bulan</span></li>
                <li className="flex items-center gap-3"><IconCheck /> <span className="text-gray-600">Estimasi {plan.est}</span></li>
                <li className="flex items-center gap-3"><IconCheck /> <span className="text-gray-600">Semua Fitur Premium Terbuka</span></li>
                <li className="flex items-center gap-3"><IconCheck /> <span className="text-gray-600">Support Prioritas WhatsApp</span></li>
              </ul>
              <button onClick={() => onOpenCheckout(plan)} className={`w-full py-4 rounded-xl font-bold transition-all ${plan.recommended ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 hover:scale-105' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                Pilih Paket {plan.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Butuh Tambahan Kuota? (Add-On)</h3>
          <p className="text-sm text-gray-500 text-center mb-8">Add-on ini dapat Anda beli kapan saja langsung dari dalam menu Dashboard Aplikasi jika kuota bulanan Anda habis.</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Tambah Kuota Struk</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex justify-between border-b border-blue-100 pb-2"><span>+ 1.000 Struk</span><span className="font-bold">Rp 49.000</span></li>
                <li className="flex justify-between border-b border-blue-100 pb-2"><span>+ 3.000 Struk</span><span className="font-bold">Rp 129.000</span></li>
                <li className="flex justify-between"><span>+ 5.000 Struk</span><span className="font-bold">Rp 199.000</span></li>
              </ul>
            </div>
            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Perpanjang Masa Aktif</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex justify-between border-b border-orange-100 pb-2"><span>+ 7 Hari</span><span className="font-bold">Rp 39.000</span></li>
                <li className="flex justify-between border-b border-orange-100 pb-2"><span>+ 15 Hari</span><span className="font-bold">Rp 69.000</span></li>
                <li className="flex justify-between"><span>+ 30 Hari</span><span className="font-bold">Rp 129.000</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-askara-orange font-black text-xl uppercase tracking-wide mb-2">GRATIS 1 BULAN PERTAMA!</p>
          <p className="text-gray-700 text-sm mb-4">Jadilah bagian dari 3 Beta Tester pertama kami. Kuota terbatas.</p>
          <button onClick={onOpenBeta} className="bg-askara-orange hover:bg-[#e67e00] text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105">Klaim Kuota Beta Tester</button>
        </div>
      </div>
    </section>
  );
}