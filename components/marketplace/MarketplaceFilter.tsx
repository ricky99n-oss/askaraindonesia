// components/marketplace/MarketplaceFilter.tsx
'use client';

interface FilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  categories: string[];
}

export default function MarketplaceFilter({ 
  searchQuery, setSearchQuery, activeCategory, setActiveCategory, categories 
}: FilterProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Cari produk atau layanan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
          />
          <svg className="w-4 h-4 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select className="px-4 py-2.5 rounded-full border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600">
          <option>Terbaru</option>
          <option>Harga Terendah</option>
          <option>Harga Tertinggi</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === cat 
                ? "bg-[#A800FF] text-white border-[#A800FF]" 
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}