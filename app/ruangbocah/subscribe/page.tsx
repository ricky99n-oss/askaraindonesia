'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

// 1. PISAHKAN KONTEN UTAMA KE DALAM KOMPONEN BARU
function SubscribeContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const [isLoading, setIsLoading] = useState(false);

  if (!uid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Akses tidak valid. Harap buka halaman ini melalui aplikasi Ruang Bocah.</p>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ruangbocah/midtrans-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      const { token } = await response.json();

      if (token) {
        window.snap.pay(token, {
          onSuccess: function (result: any) {
            alert("Pembayaran berhasil! Silakan kembali ke aplikasi Ruang Bocah.");
          },
          onPending: function (result: any) {
            alert("Menunggu pembayaran Anda.");
          },
          onError: function (result: any) {
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function () {
            setIsLoading(false);
          }
        });
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat memproses pembayaran.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
        strategy="lazyOnload"
      />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-purple-700 p-8 text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-orange-500 rounded-b-md"></div>
          <h1 className="text-3xl font-bold text-white mb-2">Ruang Bocah Premium</h1>
          <p className="text-purple-200 text-sm">Berlangganan bulanan untuk akses ekosistem penuh.</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <span className="text-5xl font-extrabold text-gray-900">Rp 49.000</span>
            <span className="text-gray-500 font-medium">/bulan</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-700">
              <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">✓</span>
              Gratis 50 Koin (Bisa untuk 1x Konsultasi)
            </li>
            <li className="flex items-center text-gray-700">
              <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">✓</span>
              Akses Kurva Pertumbuhan Anak
            </li>
            <li className="flex items-center text-gray-700">
              <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">✓</span>
              Akses Pusat Bermain & Aktivitas
            </li>
            <li className="flex items-center text-gray-700">
              <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">✓</span>
              Pengingat Jadwal Imunisasi & Nutrisi
            </li>
          </ul>

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 rounded-xl transition duration-300 shadow-md shadow-purple-200 flex justify-center items-center"
          >
            {isLoading ? (
              <span className="animate-pulse">Memproses...</span>
            ) : (
              'Berlangganan Sekarang'
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Pembayaran aman didukung oleh Midtrans.
          </p>
        </div>
      </div>
    </div>
  );
}

// 2. BUNGKUS DENGAN SUSPENSE DI EXPORT UTAMA
export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Memuat halaman pembayaran...</p>
      </div>
    }>
      <SubscribeContent />
    </Suspense>
  );
}