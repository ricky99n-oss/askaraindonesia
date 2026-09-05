'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchCatalog, getAvailableCategories } from './actions'

type CatalogItem = {
  id: string
  sku: string
  name: string
  category: string
  base_price: number
  stock_status: string
}

type CartItem = CatalogItem & {
  qty: number
  selling_price: number
}

export default function EstimatorPage() {
  const router = useRouter()
  
  const [isMounted, setIsMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<string[]>(['Semua'])
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [results, setResults] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [profitMargin, setProfitMargin] = useState(20)

  // State untuk Form Manual
  const [manualType, setManualType] = useState<'none' | 'general' | 'cable'>('none')
  
  // State Input Manual Biasa
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState<number | ''>('')
  const [manualQty, setManualQty] = useState<number | ''>(1)

  // State Input Khusus Kabel
  const [cableName, setCableName] = useState('Kabel LAN/UTP')
  const [cableLength, setCableLength] = useState<number | ''>('')
  const [cablePrice, setCablePrice] = useState<number | ''>('')

  useEffect(() => {
    setIsMounted(true)
    const savedMargin = localStorage.getItem('askara_profit_margin')
    if (savedMargin) setProfitMargin(Number(savedMargin))

    getAvailableCategories().then(cats => {
      if (cats.length > 0) setCategories(['Semua', ...cats])
    })
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      const data = await searchCatalog(search, activeCategory)
      setResults(data || [])
      setLoading(false)
    }, 400)
    return () => clearTimeout(delayDebounceFn)
  }, [search, activeCategory, isMounted])

  const addToCart = (item: CatalogItem) => {
    const marginMultiplier = 1 + (profitMargin / 100)
    const rawSellingPrice = item.base_price * marginMultiplier
    const defaultSellingPrice = Math.ceil(rawSellingPrice / 1000) * 1000 

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1, selling_price: defaultSellingPrice }]
    })
  }

  // Fungsi Tambah Manual Biasa
  const handleAddGeneral = () => {
    if (!manualName || !manualPrice) return
    const newItem: CartItem = {
      id: `man-${Date.now()}`,
      sku: 'MANUAL',
      name: manualName,
      category: 'Item Bebas',
      base_price: 0, 
      stock_status: 'available',
      qty: Number(manualQty) || 1,
      selling_price: Number(manualPrice)
    }
    setCart(prev => [...prev, newItem])
    setManualType('none')
    setManualName('')
    setManualPrice('')
    setManualQty(1)
  }

  // Fungsi Tambah Khusus Kabel
  const handleAddCable = () => {
    if (!cableName || !cableLength || !cablePrice) return
    const newItem: CartItem = {
      id: `cab-${Date.now()}`,
      sku: 'KABEL',
      name: `${cableName}`,
      category: 'Kabel & Instalasi',
      base_price: 0,
      stock_status: 'available',
      qty: Number(cableLength), // Qty digunakan sebagai Panjang Meter
      selling_price: Number(cablePrice) // Selling Price sebagai Harga per Meter
    }
    setCart(prev => [...prev, newItem])
    setManualType('none')
    setCableName('Kabel LAN/UTP')
    setCableLength('')
    setCablePrice('')
  }

  const updateCartItem = (id: string, field: keyof CartItem, value: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  if (!isMounted) return <div className="p-8 text-center text-gray-500">Memuat antarmuka...</div>

  const totalJual = cart.reduce((sum, item) => sum + (item.selling_price * item.qty), 0)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6">
      
      {/* KIRI: KATALOG */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center p-4 text-gray-500">Mencari...</div>
          ) : results.length === 0 ? (
            <div className="text-center p-4 text-gray-500">Barang tidak ditemukan.</div>
          ) : (
            <div className="space-y-2">
              {results.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item)}
                  className="p-3 border border-gray-100 rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                  </div>
                  {item.stock_status === 'out_of_stock' ? (
                     <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Stok Kosong</span>
                  ) : (
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">+ Keranjang</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KANAN: ESTIMATOR */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* HEADER ESTIMATOR & TOMBOL MANUAL */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Kebutuhan</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setManualType(manualType === 'cable' ? 'none' : 'cable')} 
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${manualType === 'cable' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
            >
              + Kabel
            </button>
            <button 
              onClick={() => setManualType(manualType === 'general' ? 'none' : 'general')} 
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${manualType === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              + Manual
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          
          {/* FORM MANUAL BIASA */}
          {manualType === 'general' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
              <div className="text-sm font-semibold text-blue-800">Tambah Item Manual Biasa</div>
              <input type="text" placeholder="Nama Barang / Jasa..." value={manualName} onChange={(e) => setManualName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none" />
              <div className="flex gap-2">
                <input type="number" placeholder="Harga Jual Satuan" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none" />
                <input type="number" placeholder="Qty" value={manualQty} onChange={(e) => setManualQty(Number(e.target.value))} className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setManualType('none')} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Batal</button>
                <button onClick={handleAddGeneral} className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Tambahkan</button>
              </div>
            </div>
          )}

          {/* FORM KABEL */}
          {manualType === 'cable' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-3">
              <div className="text-sm font-semibold text-amber-800">Custom Panjang Kabel</div>
              <input type="text" placeholder="Jenis Kabel (Misal: UTP Belden Cat6)" value={cableName} onChange={(e) => setCableName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-amber-500 outline-none" />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Panjang / Meter</label>
                  <input type="number" placeholder="Misal: 50" value={cableLength} onChange={(e) => setCableLength(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-amber-500 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Harga Jual per Meter</label>
                  <input type="number" placeholder="Misal: 5000" value={cablePrice} onChange={(e) => setCablePrice(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-amber-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setManualType('none')} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Batal</button>
                <button onClick={handleAddCable} className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 font-medium">Tambahkan</button>
              </div>
            </div>
          )}

          {/* LIST KERANJANG */}
          {cart.length === 0 ? (
            <div className="text-center p-8 text-gray-400">Pilih barang dari katalog atau tambahkan item manual.</div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-sm text-gray-900 line-clamp-2 pr-4">{item.name}</span>
                      {item.sku === 'KABEL' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">Item Kabel</span>}
                      {item.sku === 'MANUAL' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">Item Manual</span>}
                    </div>
                    <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-500 hover:text-red-700 text-xl leading-none">&times;</button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        {item.sku === 'KABEL' ? 'Harga per Meter' : 'Harga Satuan (Rp)'}
                      </label>
                      <input 
                        type="number" 
                        value={item.selling_price}
                        onChange={(e) => updateCartItem(item.id, 'selling_price', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">
                        {item.sku === 'KABEL' ? 'Meter' : 'Jumlah'}
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateCartItem(item.id, 'qty', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-900 text-white rounded-b-xl space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL ESTIMASI</span>
            <span>{formatIDR(totalJual)}</span>
          </div>
          <button 
            onClick={() => {
              localStorage.setItem('askara_draft_invoice', JSON.stringify(cart))
              router.push('/internal/print')
            }}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Lanjut Buat PDF &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}