import dynamic from 'next/dynamic';

// Dynamic import krusial agar Leaflet tidak crash di SSR Next.js
const InteractiveMap = dynamic(
  () => import('./components/InteractiveMap'),
  { ssr: false, loading: () => <div className="h-[70vh] w-full bg-gray-100 animate-pulse flex items-center justify-center">Memuat Peta CCTV Ubud...</div> }
);

export default function ProjekCCTVUbud() {
  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Topologi Jaringan CCTV Ubud</h1>
        <p className="text-gray-600">Pemetaan interaktif untuk infrastruktur Fiber Optic dan IP Camera</p>
      </div>
      
      {/* Container Peta */}
      <InteractiveMap />
      
      {/* Legend / Keterangan */}
      <div className="mt-4 flex gap-4 text-sm bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span>Kabel Fiber Optic (Backbone)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-t-2 border-dashed border-green-500"></div>
          <span>Kabel LAN UTP</span>
        </div>
      </div>
    </main>
  );
}