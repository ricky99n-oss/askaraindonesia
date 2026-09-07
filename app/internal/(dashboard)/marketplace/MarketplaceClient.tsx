'use client'

import { useState, useMemo, useEffect } from 'react'
import { saveProduct, deleteProduct } from './actions'

export default function MarketplaceClient({ initialProducts, margin = 0 }: { initialProducts: any[], margin?: number }) {
  const [editingItem, setEditingItem] = useState<any>(null)
  const [applyMargin, setApplyMargin] = useState(false) 
  const [isLoading, setIsLoading] = useState(false)
  const [currentStock, setCurrentStock] = useState<number | string>(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [sortOption, setSortOption] = useState('terbaru')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 100

  const existingCategories = Array.from(new Set(initialProducts.map(p => p.category).filter(Boolean)))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, sortOption])

  const processedProducts = useMemo(() => {
    let result = [...initialProducts]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.sku && p.sku.toLowerCase().includes(q))
      )
    }

    if (selectedCategory !== 'Semua') {
      result = result.filter(p => p.category === selectedCategory)
    }

    switch (sortOption) {
      case 'harga-asc': result.sort((a, b) => (a.base_price || 0) - (b.base_price || 0)); break
      case 'harga-desc': result.sort((a, b) => (b.base_price || 0) - (a.base_price || 0)); break
      case 'nama-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'nama-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break
    }

    return result
  }, [initialProducts, searchQuery, selectedCategory, sortOption])

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = processedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setApplyMargin(item.apply_margin !== false) 
    setCurrentStock(item.stock_qty ?? 0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingItem(null)
    setApplyMargin(false) 
    setCurrentStock(0)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formElement = e.currentTarget
    const formData = new FormData(formElement)
    
    try {
      await saveProduct(formData)
      handleCancel()
      formElement.reset()
    } catch (error: any) {
      alert(`Gagal menyimpan produk!\n\nDetail: ${error.message || 'Kesalahan Internal Server'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit Item Katalog' : 'Tambah Item Baru'}</h2>
          {editingItem && (
            <button onClick={handleCancel} className="text-sm font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm">
              Batal Edit
            </button>
          )}
        </div>

        <div className="p-6">
          <form key={editingItem?.id || 'new'} onSubmit={onSubmit} className="space-y-6">
            <input type="hidden" name="id" value={editingItem?.id || ''} />
            <input type="hidden" name="existing_image_url" value={editingItem?.image_url || ''} />
            <input type="hidden" name="existing_gallery_urls" value={JSON.stringify(editingItem?.gallery_urls || [])} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU / Kode Item</label>
                  <input type="text" name="sku" defaultValue={editingItem?.sku} required className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk</label>
                  <input type="text" name="name" defaultValue={editingItem?.name} required className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Dasar (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 text-sm font-medium">Rp</span>
                    <input type="number" name="base_price" defaultValue={editingItem?.base_price} required className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                  <input 
                    type="text" 
                    name="category" 
                    list="category-options"
                    defaultValue={editingItem?.category} 
                    placeholder="Pilih dari daftar atau ketik baru..."
                    required 
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <datalist id="category-options">
                    {existingCategories.map((cat: any, idx: number) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Fisik</label>
                  <input 
                    type="number" 
                    name="stock_qty" 
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Gambar</label>
                  <input type="file" name="images" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer border border-gray-200 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Lengkap</label>
              <textarea name="description" rows={4} defaultValue={editingItem?.description || editingItem?.promo_notes} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-y"></textarea>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between pt-4 border-t border-gray-100 gap-6">
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_active" defaultChecked={editingItem ? editingItem.is_active : true} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Aktifkan di Etalase Publik</span>
                  </div>
                </label>

                {/* KONTROL PRODUK TERLARIS DENGAN KONDISI STOK HABIS */}
                <label className={`flex items-center gap-3 ${Number(currentStock) <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input 
                    type="checkbox" 
                    name="is_bestseller" 
                    defaultChecked={editingItem ? editingItem.is_bestseller : false} 
                    disabled={Number(currentStock) <= 0}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 disabled:bg-gray-200" 
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Jadikan Produk Terlaris 🔥</span>
                    <span className="block text-xs text-gray-500">
                      {Number(currentStock) <= 0 
                        ? <span className="text-red-500 font-medium">Otomatis nonaktif karena stok habis.</span> 
                        : "Akan tampil di section atas etalase publik."}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="hidden" name="apply_margin" value={applyMargin ? 'true' : 'false'} />
                  <input type="checkbox" checked={applyMargin} onChange={(e) => setApplyMargin(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Terapkan Markup Margin (+{margin}%)</span>
                    <span className="block text-xs text-gray-500">Centang jika harga di atas adalah Harga Modal.</span>
                  </div>
                </label>
              </div>

              <button disabled={isLoading} type="submit" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-sm">
                {isLoading ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan ke Katalog')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Data Master Katalog <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded-md border ml-2">{processedProducts.length} Item</span></h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Cari SKU atau Nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Semua">Semua Kategori</option>
              {existingCategories.map((cat: any, idx: number) => <option key={idx} value={cat}>{cat}</option>)}
            </select>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="terbaru">Paling Baru</option>
              <option value="nama-asc">Nama: A - Z</option>
              <option value="nama-desc">Nama: Z - A</option>
              <option value="harga-asc">Harga: Rendah ke Tinggi</option>
              <option value="harga-desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Identitas Produk</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Harga & Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status & Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">Tidak ada produk yang sesuai dengan pencarian/filter.</td>
                </tr>
              ) : (
                paginatedProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.image_url ? (
                          <img src={product.image_url} className="w-12 h-12 rounded-lg border object-cover bg-white shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-dashed flex items-center justify-center text-[10px] text-gray-400 shrink-0">No Img</div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{product.sku || 'N/A'}</span>
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{product.category}</span>
                            {product.is_bestseller && <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md">Terlaris 🔥</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.apply_margin !== false ? (
                        <>
                          <div className="text-[11px] text-gray-400 font-medium line-through mb-0.5">Modal: Rp {product.base_price?.toLocaleString('id-ID')}</div>
                          <div className="font-bold text-green-600 text-sm">Jual: Rp {Math.round(product.base_price * (1 + (margin/100))).toLocaleString('id-ID')}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] text-blue-500 font-medium mb-0.5">Harga Bersih (Manual)</div>
                          <div className="font-bold text-gray-900 text-sm">Jual: Rp {product.base_price?.toLocaleString('id-ID')}</div>
                        </>
                      )}
                      <div className={`text-xs font-semibold mt-1 ${product.stock_qty <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        Sisa: {product.stock_qty || '0'} unit
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        {product.is_active ? (
                          <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">Publik Etalase</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">Draft Tersembunyi</span>
                        )}
                        {product.apply_margin !== false ? (
                          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">Estimator Sync</span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Manual Input</span>
                        )}
                        {product.stock_qty <= 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md animate-pulse">
                            Stok Kosong ⚠️
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                      <form action={deleteProduct.bind(null, product.id)} className="inline-block">
                        <button type="submit" className="text-red-500 hover:text-red-700 font-medium text-sm">Hapus</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, processedProducts.length)} dari {processedProducts.length} item
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sebelumnya</button>
              <div className="px-4 py-1.5 text-sm font-bold text-gray-900">{currentPage} / {totalPages}</div>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Selanjutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}