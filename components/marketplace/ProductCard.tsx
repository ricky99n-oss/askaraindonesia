// components/marketplace/ProductCard.tsx
import Image from 'next/image';
import { Product } from '@/lib/storeData';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
      <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden">
        {/* Hapus fallback ini jika Anda sudah punya URL gambar asli */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">Visual Kosong</div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase mb-1">
          {product.category}
        </span>
        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-extrabold text-gray-900">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          <button className="w-6 h-6 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}