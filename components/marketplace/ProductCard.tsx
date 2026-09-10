'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductCard({ product }: { product: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State Ongkir
  const [showOngkirModal, setShowOngkirModal] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fallback Data Aman (Menghindari error jika properti DB kosong)
  const safeCategory = product?.category?.toLowerCase() || 'lainnya';
  const safeName = product?.name || 'Produk Askara';
  const safeDesc = product?.description || 'Tidak ada deskripsi.';
  const safePrice = Number(product?.price || product?.base_price || 0); 
  const formattedPrice = safePrice.toLocaleString('id-ID'); 

  // DETEKSI JENIS PRODUK
  const isJasa = safeCategory.includes('jasa');
  const isDigital = safeCategory.includes('digital') || safeCategory.includes('lisensi') || safeCategory.includes('software');
  const isPhysical = !isJasa && !isDigital;

  const WA_NUMBER = '6285815999953';
  const waMessage = encodeURIComponent(`Halo Askara, saya tertarik dengan layanan: *${safeName}*. Bisa minta informasi lebih lanjut?`);

  // Load daftar kota otomatis saat modal terbuka
  useEffect(() => {
    if (showOngkirModal && cities.length === 0) {
      fetch('/api/ongkir')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setCities(data);
        })
        .catch(err => console.error('Gagal memuat kota', err));
    }
  }, [showOngkirModal]);

  const handleCheckOngkir = async () => {
    if (!selectedCity) return alert('Pilih kota tujuan terlebih dahulu!');
    setIsCalculating(true);
    setShippingOptions([]);
    setSelectedShippingCost(0);
    
    try {
      const res = await fetch('/api/ongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destination: selectedCity, 
          weight: 1000, // Default 1kg, sesuaikan jika DB Anda punya kolom berat
          courier: selectedCourier 
        })
      });
      const data = await res.json();
      
      if (data.costs && data.costs.length > 0) {
        setShippingOptions(data.costs);
      } else {
        alert(data.error || 'Kurir ini tidak tersedia untuk kota tujuan Anda.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi saat mengecek harga kurir.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCheckout = async (ongkirCost = 0) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id || `PROD-${Date.now()}`,
          name: safeName,
          price: safePrice,
          quantity: 1,
          shippingCost: ongkirCost
        }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Terjadi kesalahan saat membuat link pembayaran.');
      }
    } catch (error) {
      alert('Gagal terhubung ke server pembayaran iPaymu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
        
        {/* Gambar Produk */}
        <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          {!imgError && product?.image ? (
            <Image 
              src={product.image} 
              alt={safeName} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 20vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-gray-400 text-xs text-center px-2">Visual Kosong</div>
          )}
        </div>
        
        {/* Detail Produk */}
        <div className="flex-grow flex flex-col">
          <span className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isJasa ? 'text-green-500' : isDigital ? 'text-blue-500' : 'text-[#FF8C00]'}`}>
            {product?.category || 'Lainnya'}
          </span>
          <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
            {safeName}
          </h3>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
            {safeDesc}
          </p>
          
          {/* Tombol Aksi */}
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-gray-900">
              Rp {formattedPrice}
            </span>
            
            {isJasa ? (
              // Tombol Untuk Jasa (Langsung WA, Tanpa iPaymu)
              <a 
                href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shrink-0"
              >
                Pesan (WA)
              </a>
            ) : isDigital ? (
              // Tombol Untuk Digital (Langsung iPaymu, Tanpa Ongkir)
              <button 
                onClick={() => handleCheckout(0)}
                disabled={isLoading || safePrice === 0}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shrink-0 disabled:opacity-50"
              >
                {isLoading ? 'Wait...' : 'Beli'}
              </button>
            ) : (
              // Tombol Untuk Barang Fisik (Pop Up Ongkir)
              <button 
                onClick={() => setShowOngkirModal(true)}
                disabled={isLoading || safePrice === 0}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shrink-0 disabled:opacity-50"
              >
                Beli
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ONGKIR (HANYA MUNCUL UNTUK BARANG FISIK) */}
      {showOngkirModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">Kirim: {safeName}</h3>
            <p className="text-xs text-gray-500 mb-5">Asal Pengiriman: Malang, Jawa Timur</p>
            
            <div className="space-y-4 mb-6">
              {/* Pilihan Kurir */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kurir</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                  value={selectedCourier}
                  onChange={(e) => {
                    setSelectedCourier(e.target.value);
                    setShippingOptions([]); 
                    setSelectedShippingCost(0);
                  }}
                >
                  <option value="jne">JNE (Reguler/YES)</option>
                  <option value="jnt">J&T Express</option>
                  <option value="pos">Pos Indonesia</option>
                </select>
              </div>

              {/* Pilihan Kota */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kota / Kabupaten Tujuan</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setShippingOptions([]); 
                    setSelectedShippingCost(0);
                  }}
                >
                  <option value="">-- Ketik / Pilih Kota --</option>
                  {cities.map((city: any) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.type} {city.city_name}, {city.province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleCheckOngkir}
              disabled={isCalculating || !selectedCity}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm mb-4 disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
              {isCalculating ? 'Menghitung Ongkos Kirim...' : 'Cek Harga Kurir'}
            </button>

            {/* Hasil Harga Ongkir */}
            {shippingOptions.length > 0 && (
              <div className="mb-6 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Layanan Tersedia:</p>
                {shippingOptions.map((opt: any) => (
                  <label key={opt.service} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedShippingCost === opt.cost[0].value ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="shipping_service" 
                      className="mr-3 text-purple-600 focus:ring-purple-500" 
                      onChange={() => setSelectedShippingCost(opt.cost[0].value)}
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-gray-900">{opt.service}</p>
                      <p className="text-xs text-gray-500">Estimasi {opt.cost[0].etd} Hari</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600">
                      Rp {Number(opt.cost[0].value).toLocaleString('id-ID')}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Aksi Bawah */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setShowOngkirModal(false)}
                className="flex-1 py-3 text-gray-600 font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={() => handleCheckout(selectedShippingCost)}
                disabled={isLoading || (shippingOptions.length > 0 && selectedShippingCost === 0)}
                className="flex-1 py-3 text-white font-bold bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm shadow-md"
              >
                {isLoading ? 'Wait...' : 'Bayar via iPaymu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}