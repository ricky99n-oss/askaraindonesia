import type { NextConfig } from "next";


// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/askarasmartposdownload',
        destination: 'https://github.com/ricky99n-oss/askarasmartpos/releases/download/AppV1.5.0/Askara-Smart-POS-V.1.5.0.apk',
        permanent: false, // Set false agar nanti kalau ada update V1.6.0 gampang diganti linknya
      },
    ]
  },
};

export default nextConfig;
