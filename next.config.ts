import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Izin Domain Gambar untuk next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'powusazheadrnfbdqxpj.supabase.co',
        port: '',
        pathname: '/**', // Mengizinkan semua gambar di dalam domain ini
      },
    ],
  },

  // 2. Pengaturan Redirect URL
  async redirects() {
    return [
      {
        source: '/askarasmartposdownload',
        destination: 'https://github.com/ricky99n-oss/askarasmartpos/releases/download/AppV1.5.0/Askara-Smart-POS-V.1.5.0.apk',
        permanent: false, // Set false agar nanti kalau ada update V1.6.0 gampang diganti link-nya
      },
    ];
  },
};

export default nextConfig;