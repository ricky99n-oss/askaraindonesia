'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductCard({ product }: { product: any }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State Modal & Customer Info
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // State Ongkir
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('jne');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Kategori & Deteksi
  const safeCategory = product?.category?.toLowerCase() || 'lainnya';
  const safeName = product?.name || 'Produk Askara';
  const safeDesc = product?.description || 'Tidak ada deskripsi.';
  const safePrice = Number(product?.price || product?.base_price || 0); 
  const formattedPrice = safePrice.toLocaleString('id-ID'); 

  // Deteksi Fisik / Non-Fisik
  const isJasa = safeCategory.includes('jasa');
  const isDigital = safeCategory.includes('digital') || safeCategory.includes('lisensi') || safeCategory.includes('software');
  const isPhysical = !isJasa && !isDigital;

  // Load Kota Hanya Sekali saat Modal Terbuka & Hanya Jika Produk Fisik
  useEffect(() => {
    if (showCheckoutModal && isPhysical && cities.length === 0) {
      fetch('/api/ongkir')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCities(data);
          } else {
            console.error('Data kota gagal dimuat:', data);
          }
        })
        .catch(err => console.error('Gagal memuat kota', err));
    }
  }, [showCheckoutModal, isPhysical]);

  const handleCheckOngkir = async () => {
    if (!selectedCity) return alert('Pilih kota tujuan!');
    setIsCalculating(true);
    setShippingOptions([]);
    setSelectedShippingCost(0);
    
    try {
      const res = await fetch('/api/ongkir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: selectedCity, weight: 1000, courier: selectedCourier })
      });
      const data = await res.json();
      
      if (data.costs && data.costs.length > 0) {
        setShippingOptions(data.costs);
      } else {
        alert(data.error || 'Kurir tidak tersedia untuk kota ini.');
      }
    } catch (error) {
      alert('Gagal mengecek ongkir.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cegah checkout jika barang fisik tapi ongkir belum dipilih
    if (isPhysical && (shippingOptions.length === 0 || selectedShippingCost === 0)) {
      return alert('Silakan cek harga dan pilih layanan ongkos kirim terlebih dahulu.');
    }

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
          shippingCost: isPhysical ? selectedShippingCost : 0, // 0 untuk Jasa & Digital
          buyerName,
          buyerEmail,
          buyerPhone
        }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Gagal memproses pembayaran iPaymu.');
      }
    } catch (error) {
      alert('Gagal terhubung ke server pembayaran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all flex flex-col h-full group">
        <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          {!imgError && product?.image ? (
            <Image src={product.image} alt={safeName} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 50vw, 20vw" onError={() => setImgError(true)} />
          ) : (
            <div className="text-gray-400 text-xs">Visual Kosong</div>
          )}
        </div>
        
        <div className="flex-grow flex flex-col">
          <span className={`text-[10px] font-bold uppercase mb-1 ${isJasa ? 'text-green-500' : isDigital ? 'text-blue-500' : 'text-orange-500'}`}>
            {product?.category || 'Lainnya'}
          </span>
          <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">{safeName}</h3>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{safeDesc}</p>
          
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-gray-900">Rp {formattedPrice}</span>
            {/* SEMUA PRODUK MEMBUKA MODAL CHECKOUT */}
            <button 
              onClick={() => setShowCheckoutModal(true)}
              disabled={safePrice === 0}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
            >
              {safePrice === 0 ? 'Harga Kosong' : 'Beli Sekarang'}
            </button>
          </div>
        </div>
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-6 custom-scrollbar">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Checkout: {safeName}</h3>
            <p className="text-xs text-gray-500 mb-5">Silakan lengkapi data pesanan Anda.</p>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Form Data Diri (Wajib untuk semua) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none text-sm" placeholder="Contoh: Budi Santoso" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Email (Untuk Bukti Bayar)</label>
                <input required type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none text-sm" placeholder="budi@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">No. WhatsApp</label>
                <input required type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none text-sm" placeholder="081234567890" />
              </div>

              {/* KHUSUS PRODUK FISIK - MUNCULKAN ONGKIR */}
              {isPhysical && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Kurir</label>
                      <select value={selectedCourier} onChange={(e) => { setSelectedCourier(e.target.value); setShippingOptions([]); setSelectedShippingCost(0); }} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none">
                        <option value="jne">JNE</option>
                        <option value="jnt">J&T</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Kota Tujuan</label>
                      <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setShippingOptions([]); setSelectedShippingCost(0); }} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none">
                        <option value="">-- Pilih Kota --</option>
                        {cities.map((city: any) => (<option key={city.city_id} value={city.city_id}>{city.type} {city.city_name}</option>))}
                      </select>
                    </div>
                  </div>
                  
                  <button type="button" onClick={handleCheckOngkir} disabled={isCalculating || !selectedCity} className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs disabled:opacity-50 border border-gray-200 hover:bg-gray-200 transition-colors">
                    {isCalculating ? 'Menghitung Ongkir...' : 'Cek Harga Ongkir'}
                  </button>

                  {shippingOptions.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {shippingOptions.map((opt: any) => (
                        <label key={opt.service} className={`flex items-center p-2.5 border rounded-xl cursor-pointer transition-colors ${selectedShippingCost === opt.cost[0].value ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}>
                          <input type="radio" name="shipping" className="mr-3 text-purple-600" onChange={() => setSelectedShippingCost(opt.cost[0].value)} />
                          <div className="flex-grow">
                            <p className="text-xs font-bold">{opt.service}</p>
                            <p className="text-[10px] text-gray-500">{opt.cost[0].etd} Hari</p>
                          </div>
                          <span className="text-xs font-bold text-purple-600">Rp {Number(opt.cost[0].value).toLocaleString('id-ID')}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Aksi Bawah */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowCheckoutModal(false)} className="flex-1 py-3 text-gray-600 font-semibold bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 text-white font-bold bg-purple-600 rounded-xl disabled:opacity-50 text-sm hover:bg-purple-700 transition-colors shadow-md">
                  {isLoading ? 'Wait...' : 'Bayar via iPaymu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}