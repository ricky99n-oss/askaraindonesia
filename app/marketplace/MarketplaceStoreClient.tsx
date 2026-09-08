'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function MarketplaceStoreClient({ initialProducts, serverSettings }: { initialProducts: any[], serverSettings: any }) {
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutMode, setIsCheckoutMode] = useState(false)
  const [trxId, setTrxId] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [sortOption, setSortOption] = useState('terbaru')

  const ADMIN_WA_NUMBER = "6285815999953"

  const processedProducts = useMemo(() => {
    return initialProducts.map(p => {
      if (p.apply_margin !== false) {
        return { ...p, base_price: Math.round(p.base_price * (1 + (serverSettings.margin / 100))) }
      }
      return p
    })
  }, [initialProducts, serverSettings.margin])

  const bestSellers = useMemo(() => processedProducts.filter(p => p.is_bestseller && p.stock_qty > 0), [processedProducts])
  
  // Ambil semua produk yang kategorinya atau namanya mengandung "JASA"
  const serviceProducts = useMemo(() => processedProducts.filter(p => 
    p.category?.toUpperCase().includes('JASA') || p.name?.toUpperCase().includes('JASA')
  ), [processedProducts])

  const categories = ['Semua', ...Array.from(new Set(processedProducts.map(p => p.category).filter(Boolean)))]
  
  const sortedAndFilteredProducts = useMemo(() => {
    let result = processedProducts.filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchCategory = selectedCategory === 'Semua' || product.category === selectedCategory
      return matchSearch && matchCategory
    })

    result.sort((a, b) => {
      const aReady = a.stock_qty > 0 ? 1 : 0;
      const bReady = b.stock_qty > 0 ? 1 : 0;
      if (aReady !== bReady) { return bReady - aReady; }
      switch (sortOption) {
        case 'harga-asc': return (a.base_price || 0) - (b.base_price || 0);
        case 'harga-desc': return (b.base_price || 0) - (a.base_price || 0);
        case 'nama-asc': return a.name.localeCompare(b.name);
        case 'nama-desc': return b.name.localeCompare(a.name);
        default: return 0; 
      }
    })
    return result
  }, [processedProducts, searchQuery, selectedCategory, sortOption])

  const addToCart = (product: any) => {
    if (product.stock_qty <= 0) {
      alert("Maaf, stok produk ini sedang habis.");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { ...product, qty: 1 }]
    })
    setIsCartOpen(true)
  }

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter((item) => item.qty > 0))
  }

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)
  const totalPrice = cart.reduce((acc, item) => acc + (item.base_price * item.qty), 0)

  const handleProceedToPayment = () => {
    setTrxId(`TRX-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`)
    setIsCheckoutMode(true)
  }

  const confirmAndSendWA = async () => {
    if (!paymentProof) { alert("Harap unggah gambar bukti pembayaran terlebih dahulu."); return; }
    setIsUploading(true)
    let proofUrl = ''
    try {
      const fileExt = paymentProof.name.split('.').pop()
      const fileName = `${trxId}-${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from('payment_proofs').upload(fileName, paymentProof)
      if (error) throw error
      const { data: publicUrlData } = supabase.storage.from('payment_proofs').getPublicUrl(data.path)
      proofUrl = publicUrlData.publicUrl
    } catch (error) {
      alert("Upload bukti gagal, pesanan tetap akan diteruskan. Harap lampirkan foto manual di WA.")
    }

    let msg = `Halo Askara, saya telah melakukan pembayaran pesanan.\n\n*No. Transaksi:* ${trxId}\n\n*Detail Pembelian:*\n`
    cart.forEach((item, index) => { msg += `${index + 1}. ${item.name} (${item.qty}x) = Rp ${(item.qty * item.base_price).toLocaleString('id-ID')}\n` })
    msg += `\n*Total Transfer:* Rp ${totalPrice.toLocaleString('id-ID')}\n\n`
    msg += proofUrl ? `*Bukti Pembayaran:* ${proofUrl}\n\n` : `*(Bukti transfer akan dikirim manual)*\n\n`
    msg += `Mohon segera diproses. Terima kasih!`

    window.location.href = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`
    setIsUploading(false); setCart([]); setPaymentProof(null); setIsCheckoutMode(false); setIsCartOpen(false);
  }

  // Fungsi Share Global (Bisa dipanggil dari Card maupun Modal)
  const handleShareProduct = async (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Mencegah modal terbuka saat tombol share diklik
    
    const shareText = `Cek produk ini di AskaraShop!\n\n*${product.name}*\nHarga: Rp ${product.base_price?.toLocaleString('id-ID')}\nKategori: ${product.category}\n\nPesan sekarang di: https://askaraindonesia.my.id/marketplace`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: 'https://askaraindonesia.my.id/marketplace',
        });
      } catch (error) {
        console.log('User membatalkan share atau error:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Info produk dan link telah disalin ke clipboard! Silakan paste (Ctrl+V) di WA atau Sosmed Anda.');
    }
  }

  // Komponen Kartu Produk
  const ProductCard = ({ product }: { product: any }) => {
    const isOutOfStock = product.stock_qty <= 0;
    
    return (
      <div onClick={() => setSelectedProduct(product)} className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full active:scale-[0.98] cursor-pointer relative group">
        <div className="bg-gray-50 rounded-lg sm:rounded-xl aspect-square mb-3 relative overflow-hidden flex items-center justify-center">
          {product.image_url ? <img src={product.image_url} alt={product.name} className={`object-contain w-full h-full p-2 sm:p-4 transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} /> : <div className="text-gray-400 text-[10px] sm:text-xs opacity-50">Visual Kosong</div>}
          
          {product.is_bestseller && !isOutOfStock && (
             <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">Hot Item 🔥</span>
          )}

          {/* TOMBOL SHARE DI KARTU PRODUK DEPAN */}
          <button 
            onClick={(e) => handleShareProduct(product, e)}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur text-gray-500 hover:text-purple-600 p-1.5 sm:p-2 rounded-full shadow-sm border border-gray-100 transition-all hover:scale-110 active:scale-95 z-20"
            title="Bagikan Produk"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
              <span className="bg-red-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-sm shadow-md transform -rotate-12 tracking-wider">STOK HABIS</span>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1 sm:mb-1.5"><p className={`text-[9px] sm:text-xs font-semibold uppercase truncate pr-2 ${isOutOfStock ? 'text-gray-400' : 'text-orange-500'}`}>{product.category}</p></div>
          <h3 className={`text-xs sm:text-sm font-bold leading-snug mb-1.5 line-clamp-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>{product.name}</h3>
          
          <p className="text-xs text-gray-500 line-clamp-3 mb-3 whitespace-normal break-words">
            {product.description || 'Detail produk tersedia via admin.'}
          </p>

          <div className="mt-auto flex items-center justify-between pt-2 border-t border-dashed border-gray-100 sm:border-none sm:pt-0">
            <span className={`text-sm sm:text-lg font-extrabold ${isOutOfStock ? 'text-gray-400 line-through' : 'text-gray-900'}`}>Rp {product.base_price?.toLocaleString('id-ID')}</span>
            
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(product) }} 
              disabled={isOutOfStock}
              className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center ml-2 transition-colors ${
                isOutOfStock 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white active:bg-purple-700'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 relative overflow-x-hidden">
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 text-white flex items-center justify-center rounded-lg font-bold text-xl shadow-md">A</div>
              <span className="font-bold text-xl hidden sm:block">Askara<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">Shop</span></span>
            </div>
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari hardware, lisensi..." className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                <button className="absolute right-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6 text-sm font-medium">
              <Link href="#" className="text-purple-600 border-b-2 border-purple-600 pb-5 pt-5 hidden md:block">Home</Link>
              <div className="flex items-center sm:space-x-4 sm:border-l sm:pl-4">
                <button onClick={() => setIsCartOpen(true)} className="relative hover:text-purple-600 p-2">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {totalItems > 0 && <span className="absolute top-1 right-0 sm:top-0 sm:-right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">{totalItems}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8 sm:space-y-12">
        
        {/* HERO SECTION FIX LAYOUT PANJANG */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row items-center relative px-6 py-10 md:p-12 lg:p-16">
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[55%] bg-gradient-to-bl from-purple-600 to-orange-500 md:rounded-l-[120px] hidden md:block z-0 opacity-95"></div>
          <div className="relative z-10 md:w-1/2 lg:w-[45%] space-y-4 sm:space-y-6 text-center md:text-left flex flex-col items-center md:items-start py-4">
            <span className="inline-block bg-orange-50 text-orange-500 font-bold tracking-wider text-[10px] sm:text-xs uppercase px-3 py-1 sm:px-4 sm:py-1.5 rounded-full">Askara Indonesia Services</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">Creative, Digital <br className="hidden lg:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">& IT Solutions</span></h1>
            <p className="text-gray-500 max-w-sm md:max-w-md text-sm sm:text-base leading-relaxed">Solusi kreatif dan teknologi untuk mendukung bisnis Anda. Mulai dari penjualan dan instalasi CCTV serta jaringan, desain grafis, manajemen media sosial, hingga pengembangan website & aplikasi.</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 relative z-20 w-full sm:w-auto">
              <button onClick={() => window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=Halo%20Askara,%20saya%20ingin%20berkonsultasi%20mengenai%20kebutuhan%20bisnis%20saya.`, '_blank')} className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-orange-600 transition-all flex justify-center items-center gap-2 shadow-lg w-full sm:w-auto">
                Konsultasikan Kebutuhan Anda <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <button onClick={() => { setSelectedCategory('JASA INSTALASI'); document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="bg-white text-gray-900 px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-50 border border-gray-200 shadow-sm flex justify-center w-full sm:w-auto">
                Lihat Layanan & Harga
              </button>
            </div>
          </div>
          <div className="relative z-10 w-full md:w-1/2 lg:w-[55%] mt-8 md:mt-0 flex justify-center md:justify-end items-center">
             <img src="/hero-market2.png" alt="Creative & IT Solutions" className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[480px] object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700" />
          </div>
        </div>

        {/* SECTION 1: PILIHAN TERLARIS (HORIZONTAL CAROUSEL) */}
        {bestSellers.length > 0 && (
          <div className="pt-4 pb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              Pilihan Terlaris <span className="text-2xl">🔥</span>
            </h2>
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 scrollbar-hide snap-x flex-nowrap">
              {bestSellers.map((product: any) => (
                <div key={product.id} className="snap-start shrink-0 w-[160px] sm:w-[220px] md:w-[250px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: KATEGORI JASA (HORIZONTAL CAROUSEL) */}
        {serviceProducts.length > 0 && (
          <div className="pt-2 pb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              Layanan & Jasa Askara <span className="text-2xl">🛠️</span>
            </h2>
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 scrollbar-hide snap-x flex-nowrap">
              {serviceProducts.map((product: any) => (
                <div key={product.id} className="snap-start shrink-0 w-[160px] sm:w-[220px] md:w-[250px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: SEMUA KATALOG (GRID 4 KOLOM) */}
        <div id="katalog-section" className="pt-4 scroll-mt-24 border-t border-gray-100">
          <div className="mb-5 space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Semua Katalog Produk</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari produk atau layanan..." className="w-full bg-white border border-gray-200 rounded-xl sm:rounded-full py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-purple-500 text-sm outline-none" />
              </div>
              <div className="relative shrink-0">
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl sm:rounded-full py-2.5 pl-4 pr-10 appearance-none focus:ring-2 focus:ring-purple-500 text-sm font-medium outline-none cursor-pointer">
                  <option value="terbaru">Terbaru</option>
                  <option value="harga-asc">Harga: Rendah ke Tinggi</option>
                  <option value="harga-desc">Harga: Tinggi ke Rendah</option>
                  <option value="nama-asc">Nama: A - Z</option>
                  <option value="nama-desc">Nama: Z - A</option>
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`snap-start whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${selectedCategory === cat ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-2">
            {sortedAndFilteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center"><svg className="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>Produk tidak ditemukan.</div>
            ) : (
              sortedAndFilteredProducts.map((product: any) => (
                <div key={product.id} className="w-full">
                   <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Detail Produk</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors bg-gray-50 hover:bg-red-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-8 flex-1">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                <div className="w-full md:w-2/5 shrink-0">
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl aspect-square border border-gray-100 flex items-center justify-center overflow-hidden relative p-4 group">
                    {selectedProduct.image_url ? (
                      <img src={selectedProduct.image_url} alt={selectedProduct.name} className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${selectedProduct.stock_qty <= 0 ? 'opacity-50 grayscale' : ''}`} />
                    ) : (
                      <span className="text-gray-400 text-sm">Visual Kosong</span>
                    )}
                    
                    {/* TOMBOL SHARE DI DALAM GAMBAR MODAL */}
                    <button 
                      onClick={(e) => handleShareProduct(selectedProduct, e)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-700 hover:text-purple-600 p-2.5 rounded-full shadow-md border border-gray-100 transition-all hover:scale-105 active:scale-95 z-20"
                      title="Bagikan Produk"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    </button>

                    {selectedProduct.stock_qty <= 0 && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                        <span className="bg-red-500 text-white text-sm font-black px-4 py-1.5 rounded-sm shadow-md transform -rotate-12 tracking-wider">STOK HABIS</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <span className="inline-block text-[10px] sm:text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 bg-orange-50 px-2.5 py-1 rounded-md">{selectedProduct.category}</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h2>
                    <div className="text-xs font-mono text-gray-500 mt-2 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">SKU: {selectedProduct.sku || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-gray-900">Rp {selectedProduct.base_price?.toLocaleString('id-ID')}</div>
                    
                    {selectedProduct.stock_qty > 0 ? (
                      <div className="text-sm text-green-600 font-medium mt-1">Stok Tersedia: {selectedProduct.stock_qty} unit</div>
                    ) : (
                      <div className="text-sm text-red-600 font-bold mt-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Maaf, Produk Sedang Kosong
                      </div>
                    )}
                  </div>
                  <div className="pt-5 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Deskripsi Produk</h4>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description || 'Detail produk tersedia via admin.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }} 
                disabled={selectedProduct.stock_qty <= 0}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  selectedProduct.stock_qty <= 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 active:scale-95'
                }`}
              >
                {selectedProduct.stock_qty > 0 && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                )}
                {selectedProduct.stock_qty <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">{isCheckoutMode ? 'Pembayaran Manual' : 'Keranjang Belanja'}</h2>
              <button onClick={() => { setIsCartOpen(false); setIsCheckoutMode(false); setPaymentProof(null); }} className="text-gray-400 hover:text-red-500 p-2"><svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {!isCheckoutMode ? (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 text-sm"><p>Keranjang kosong</p></div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 items-center bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-100">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg border flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {item.image_url ? <img src={item.image_url} className="w-full h-full object-contain" /> : <span className="text-[8px] text-gray-300">No Img</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] sm:text-xs text-purple-600 font-semibold mb-2">Rp {item.base_price.toLocaleString('id-ID')}</p>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded bg-white border flex items-center justify-center hover:text-red-500">-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded bg-white border flex items-center justify-center hover:text-blue-500">+</button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="space-y-6 animate-fade-in pb-4">
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
                    <p className="text-[10px] sm:text-xs text-orange-600 font-bold uppercase mb-1">Total Tagihan</p>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] sm:text-xs font-mono text-gray-500 mt-2 bg-white inline-block px-2 py-1 rounded border">Trx: {trxId}</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 border-b pb-2">Metode 1: QRIS</h3>
                    <div className="bg-white border rounded-xl p-4 flex flex-col items-center">
                      <img src="/Qris.jpeg" alt="QRIS Askara" className="w-full max-w-[180px] object-contain rounded-lg shadow-sm mb-3" />
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center">Scan QRIS menggunakan M-Banking atau E-Wallet Anda.</p>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 border-b pb-2 pt-2">Metode 2: Transfer Bank {serverSettings.bankName}</h3>
                    <div className="bg-white border rounded-xl p-4">
                      <p className="text-xl sm:text-2xl font-mono font-bold tracking-wider">{serverSettings.bankAccount}</p>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">a.n {serverSettings.bankOwner}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Upload Bukti Transfer</label>
                    <input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} className="block w-full text-[10px] sm:text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 bg-white border border-gray-200 rounded-lg" />
                  </div>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] space-y-3 pb-safe">
                {!isCheckoutMode ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium text-xs sm:text-sm">Total Estimasi</span>
                      <span className="text-lg sm:text-2xl font-extrabold text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <button onClick={handleProceedToPayment} className="w-full bg-purple-600 text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-purple-700 active:scale-95">Lanjut Pembayaran</button>
                  </>
                ) : (
                  <>
                    <button onClick={confirmAndSendWA} disabled={isUploading || !paymentProof} className="w-full bg-green-500 text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-green-600 disabled:bg-gray-300">
                      {isUploading ? 'Memproses Data...' : 'Konfirmasi & Kirim WA'}
                    </button>
                    <button onClick={() => setIsCheckoutMode(false)} className="w-full text-gray-500 font-medium text-xs sm:text-sm py-2 hover:text-gray-800">Kembali ke Keranjang</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
      `}} />
    </div>
  )
}