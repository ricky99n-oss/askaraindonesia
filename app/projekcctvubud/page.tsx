'use client';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(
  () => import('./components/InteractiveMap'),
  { ssr: false, loading: () => <div className="h-[75vh] w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-xl border">Memuat Visualisasi Infrastruktur CCTV...</div> }
);

export default function ProjekCCTVUbud() {
  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Infrastruktur CCTV</h1>
        <p className="text-gray-500 mt-1">Sistem Pemetaan Jaringan Fiber Optic, Power, dan Node Kamera area Ubud</p>
      </div>
      
      <InteractiveMap />
    </main>
  );
}