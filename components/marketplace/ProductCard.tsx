'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductCard({ product }: { product: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State Cek Ongkir
  const [showOngkirModal, setShowOngkirModal] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fallback Data Aman (Mencegah Crash jika data DB ada yang kosong)
  const safeCategory = product?.category?.toLowerCase() || 'lainnya';
  const safeName = product?.name || 'Produk Tanpa Nama';
  const safeDesc = product?.description || 'Tidak ada deskripsi.';
  const safePrice = Number(product?.price || product?.base_price || 0); 
  const formattedPrice = safePrice.toLocaleString('id-ID'); // Sekarang aman dari crash

  const isJasa = safeCategory.includes('jasa');
  const isDigital = safeCategory.includes('digital');
  const isPhysical = !isJasa && !isDigital;

  const WA_NUMBER = '6285815999953';
  const waMessage = encodeURIComponent(`Halo Tim Askara, saya tertarik untuk menggunakan layanan jasa: *${safeName}*. Boleh minta informasi lebih lanjut?`);

  useEffect(() => {
    if (showOngkirModal && cities.length === 0) {
      fetch('/api/ongkir')
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(err => console.error('Gagal memuat kota', err));
    }
  }, [showOngkirModal]);

  const handleCheckOngkir = async () => {
    if (!selectedCity) return alert('Pilih kota tujuan pengiriman!');
    setIsCalculating(true);
    try {
      const res = await fetch('/api/ongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: selectedCity, weight: 1000 })
      });
      const data = await res.json();
      if (data.costs) {
        setShippingOptions(data.costs);
      } else {
        alert(data.error || 'Gagal mengecek ongkir');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi saat mengecek ongkir');
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
        alert(data.error || 'Terjadi kesalahan saat checkout.');
      }
    } catch (error) {
      alert('Gagal terhubung ke server pembayaran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
        
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
            <div className="text-gray-400 text-xs text-center px-2">
              {product?.icon ? <span className="text-4xl block mb-2">{product.icon}</span> : 'Visual Kosong'}
            </div>
          )}
        </div>
        
        <div className="flex-grow flex flex-col">
          <span className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isJasa ? 'text-green-500' : 'text-[#FF8C00]'}`}>
            {product?.category || 'Lainnya'}
          </span>
          <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#4A00E0] transition-colors">
            {safeName}
          </h3>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
            {safeDesc}
          </p>
          
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-gray-900">
              Rp {formattedPrice}
            </span>
            
            {isJasa ? (
              <a 
                href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Pesan via WhatsApp"
                className="px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shrink-0"
              >
                Pesan (WA)
              </a>
            ) : (
              <button 
                onClick={() => isPhysical ? setShowOngkirModal(true) : handleCheckout(0)}
                disabled={isLoading || safePrice === 0}
                title={safePrice === 0 ? "Harga belum diset" : "Beli Langsung"}
                className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shrink-0 ${safePrice === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-[#4A00E0] hover:bg-[#4A00E0] hover:text-white'}`}
              >
                {isLoading ? 'Memproses...' : 'Beli'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showOngkirModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1">Kirim: {safeName}</h3>
            
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kota Tujuan</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-purple-200 outline-none"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setShippingOptions([]); 
                setSelectedShipping(0);
              }}
            >
              <option value="">-- Pilih Kota / Kabupaten --</option>
              {cities.map((city: any) => (
                <option key={city.city_id} value={city.city_id}>
                  {city.type} {city.city_name}, {city.province}
                </option>
              ))}
            </select>

            <button 
              onClick={handleCheckOngkir}
              disabled={isCalculating || !selectedCity}
              className="w-full py-2 bg-gray-900 text-white rounded-lg font-semibold mb-6 disabled:opacity-50"
            >
              {isCalculating ? 'Menghitung Ongkir...' : 'Cek Ongkir JNE'}
            </button>

            {shippingOptions.length > 0 && (
              <div className="mb-6 space-y-3 max-h-48 overflow-y-auto pr-2">
                <p className="text-sm font-bold text-gray-700">Pilih Layanan JNE:</p>
                {shippingOptions.map((opt: any) => (
                  <label key={opt.service} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="radio" 
                      name="shipping" 
                      className="mr-3 text-purple-600 focus:ring-purple-500" 
                      onChange={() => setSelectedShipping(opt.cost[0].value)}
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-gray-900">JNE {opt.service}</p>
                      <p className="text-xs text-gray-500">Estimasi {opt.cost[0].etd} Hari</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600">
                      Rp {Number(opt.cost[0].value).toLocaleString('id-ID')}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setShowOngkirModal(false)}
                className="flex-1 py-3 text-gray-600 font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => handleCheckout(selectedShipping)}
                disabled={isLoading || (shippingOptions.length > 0 && selectedShipping === 0)}
                className="flex-1 py-3 text-white font-semibold bg-[#4A00E0] rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Checkout (iPaymu)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}