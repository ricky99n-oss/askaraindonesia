'use client';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(
  () => import('./components/InteractiveMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-screen w-full bg-gray-100 animate-pulse flex items-center justify-center">
        Memuat Visualisasi Infrastruktur CCTV...
      </div>
    ) 
  }
);

export default function ProjekCCTVUbud() {
  return (
    // Menggunakan h-screen w-full agar mengisi 100% layar tanpa batas
    <main className="relative w-full h-screen overflow-hidden bg-gray-50">
      <InteractiveMap />
    </main>
  );
}