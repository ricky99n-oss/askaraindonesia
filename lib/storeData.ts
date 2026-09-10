// lib/storeData.ts

export type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    isBestSeller?: boolean;
    icon?: string; // Khusus untuk tampilan di beranda
  };
  
  export const storeCategories = [
    "Semua", "Jasa", "Digital", "HIKVISION", "DAHUA", "CCTV WIRELESS", "KABEL", "MATERIAL"
  ];
  
  // Data gabungan dari Marketplace dan Beranda
  export const storeProducts: Product[] = [
    // --- PRODUK TERLARIS (Akan ditarik ke Beranda) ---
    {
      id: "bs-1",
      name: "Aplikasi Kasir Smart POS",
      category: "Digital",
      price: 1500000,
      description: "Sistem kasir modern berbasis cloud untuk mempermudah transaksi bisnis Anda.",
      image: "/pos.png",
      isBestSeller: true,
      icon: "💻"
    },
    {
      id: "bs-2",
      name: "Paket Website & E-Course",
      category: "Digital",
      price: 3500000,
      description: "LMS lengkap terintegrasi dengan video hosting (Supabase & Bunny.net).",
      image: "/web.png",
      isBestSeller: true,
      icon: "🌐"
    },
    {
      id: "bs-3",
      name: "Setup Jaringan & MikroTik",
      category: "Jasa",
      price: 500000,
      description: "Konfigurasi VPN, load balancing, failover, dan setup UniFi Access Point.",
      image: "/network.png",
      isBestSeller: true,
      icon: "📡"
    },
    
    // --- PRODUK MARKETPLACE LAINNYA ---
    {
      id: "m-1",
      name: "Jasa Instalasi Akses Point (Router Wifi)",
      category: "Jasa",
      price: 150000,
      description: "Jasa Instalasi Akses Point / Router Wifi dengan konfigurasi dasar.",
      image: "/ap.png",
    },
    {
      id: "m-2",
      name: "Gemini Pro 18 Bulan",
      category: "Digital",
      price: 185000,
      description: "Gemini Pro 18 Bulan + Google Drive 5TB. Bantu pekerjaan digital jadi lebih praktis.",
      image: "/gemini.png",
    },
    {
      id: "m-3",
      name: "HIKVISION DS-2DE4225IW-DE",
      category: "HIKVISION",
      price: 16200000,
      description: "2 MP 25X Powered by DarkFighter IR Network Speed Dome.",
      image: "/hikvision.png",
    },
    // Tambahkan produk lainnya hingga ratusan data...
  ];