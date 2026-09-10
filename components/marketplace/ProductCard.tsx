'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/storeData';

export default function ProductCard({ product }: { product: Product }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Integrasi Checkout iPaymu
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Terjadi kesalahan saat membuat link pembayaran.');
      }
    } catch (error) {
      alert('Gagal memproses checkout. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keamanan format harga
  const formattedPrice = typeof product.price === 'number' 
    ? product.price.toLocaleString('id-ID') 
    : parseInt(String(product.price).replace(/\D/g, '') || '0').toLocaleString('id-ID');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      
      {/* Gambar Produk dengan Fallback */}
      <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
        {!imgError && product.image ? (
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 20vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-gray-400 text-xs text-center px-2">
            {product.icon ? <span className="text-4xl block mb-2">{product.icon}</span> : 'Visual Kosong'}
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col">
        <span className="text-[10px] font-bold text-[#FF8C00] tracking-wider uppercase mb-1">
          {product.category}
        </span>
        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#4A00E0] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Area Harga & Tombol Beli */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-gray-900">
            Rp {formattedPrice}
          </span>
          
          <button 
            onClick={handleCheckout}
            disabled={isLoading}
            title="Beli Langsung"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-[#4A00E0] hover:bg-[#4A00E0] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}