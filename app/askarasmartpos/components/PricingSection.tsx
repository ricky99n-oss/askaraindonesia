'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi aman dari Build Error
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Kita pastikan Supabase hanya berjalan jika URL dan Key tersedia
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const IconCheck = () => (
  <svg className="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
);

export default function PricingSection({ onOpenCheckout, onOpenBeta, isBetaFull }: { onOpenCheckout: (plan: any) => void, onOpenBeta: () => void, isBetaFull: boolean }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      if (!supabase) {
        console.error('Kredensial Supabase tidak ditemukan. Cek file .env.local');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedPlans = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            limit: item.limit_tx,
            desc: item.description || '',
            est: item.limit_tx >= 10000 ? '300+ transaksi/hari' : `±${Math.round(item.limit_tx / 30)} transaksi/hari`,
            recommended: item.is_recommended
          }));
          setPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPackages();
  }, []);

  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Pilih Paket Sesuai Skala Usaha Anda</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Semua paket mendapatkan fitur lengkap tanpa dikunci. Perbedaan hanya pada kuota struk transaksi per bulan.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-red-500 font-bold bg-red-50 rounded-xl border border-red-200 p-8 max-w-2xl mx-auto">
            Paket belum tersedia. Pastikan .env.local sudah berisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY dengan benar!
          </div>
        ) : (
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
        )}

        <div className="mt-12 bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-askara-orange font-black text-xl uppercase tracking-wide mb-2">GRATIS 3 BULAN !</p>
          <p className="text-gray-700 text-sm mb-4">Jadilah bagian dari Beta Tester pertama kami. Kuota terbatas.</p>
          
          {/* TOMBOL BETA DINAMIS BERDASARKAN KUOTA */}
          <button 
            onClick={onOpenBeta} 
            disabled={isBetaFull}
            className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-transform ${isBetaFull ? 'bg-gray-400 text-gray-100 cursor-not-allowed' : 'bg-askara-orange hover:bg-[#e67e00] text-white hover:scale-105'}`}
          >
            {isBetaFull ? 'TUTUP: Kuota Beta Sudah Habis' : 'Jadilah Beta Tester FREE 3 Bulan'}
          </button>
        </div>
      </div>
    </section>
  );
}