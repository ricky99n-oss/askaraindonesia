'use client';

import { useState, useMemo } from 'react';
import MarketplaceFilter from '@/components/marketplace/MarketplaceFilter';
import ProductCard from '@/components/marketplace/ProductCard';
import Pagination from '@/components/marketplace/Pagination';
import { storeCategories } from '@/lib/storeData'; // Import kategori (jika kategori masih statis)

// 1. Tambahkan Interface untuk Props dari Server
interface ServerSettings {
  margin: any;
  bankName: any;
  bankAccount: any;
  bankOwner: any;
}

interface MarketplaceProps {
  initialProducts: any[];
  serverSettings: ServerSettings;
}

// 2. Terapkan Props pada Komponen
export default function MarketplaceStoreClient({ initialProducts, serverSettings }: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleCategory = (val: string) => {
    setActiveCategory(val);
    setCurrentPage(1);
  };

  // 3. Gunakan 'initialProducts' dari props, BUKAN dari dummy data
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchCategory = activeCategory === 'Semua' || product.category === activeCategory;
      const matchSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory, initialProducts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Semua Katalog Produk</h1>
      
      <MarketplaceFilter 
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        activeCategory={activeCategory}
        setActiveCategory={handleCategory}
        categories={storeCategories}
      />

      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          Produk tidak ditemukan.
        </div>
      )}

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}