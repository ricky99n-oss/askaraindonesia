'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabaseClient'; 

// === FUNGSI PENGHITUNG JARAK (HAVERSINE FORMULA) ===
const calculateDistance = (coords: any[]) => {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  const R = 6371e3; // Radius bumi dalam meter
  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = coords[i][0] * Math.PI / 180;
    const lat2 = coords[i+1][0] * Math.PI / 180;
    const deltaLat = (coords[i+1][0] - coords[i][0]) * Math.PI / 180;
    const deltaLon = (coords[i+1][1] - coords[i][1]) * Math.PI / 180;
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    total += R * c;
  }
  return total;
};

const formatDistance = (meters: number) => {
  if (meters >= 1000) return (meters / 1000).toFixed(2) + ' km';
  return Math.round(meters) + ' m';
};
// ===================================================

// ================= SETUP CUSTOM SVG ICONS =================
const createCustomIcon = (svgPath: string, bgColor: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34]
  });
};

const cctvSvg = `<path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>`;
const nvrSvg = `<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>`;
const panelSvg = `<rect x="4" y="2" width="16" height="20" rx="2"></rect><circle cx="12" cy="14" r="2"></circle><path d="M12 6v2"></path>`;
const wirelessSvg = `<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>`;

const getIcon = (type: string) => { 
  if (type === 'NVR') return createCustomIcon(nvrSvg, '#dc2626'); 
  if (type === 'PANEL') return createCustomIcon(panelSvg, '#059669'); 
  if (type.includes('WIRELESS')) return createCustomIcon(wirelessSvg, '#8b5cf6'); 
  if (type === 'CAMERA_AUDIO') return createCustomIcon(cctvSvg, '#ea580c'); 
  return createCustomIcon(cctvSvg, '#2563eb'); 
};

// Ikon Titik GPS Teknisi
const liveGpsIcon = L.divIcon({
  html: `<div style="width: 18px; height: 18px; background-color: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.4);"></div>`,
  className: 'live-gps-icon', iconSize: [18, 18], iconAnchor: [9, 9]
});
// ==========================================================

// === HANDLER KLIK PETA (MENDUKUNG MODE MENGUKUR) ===
function MapClickHandler({ isMeasuring, onMapClick }: { isMeasuring: boolean, onMapClick: (latlng: L.LatLng) => void }) {
  const map = useMap();
  useEffect(() => {
    if (isMeasuring) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = ''; 
    }
  }, [isMeasuring, map]);

  useMapEvents({
    click: (e) => {
      if (isMeasuring) {
        onMapClick(e.latlng);
      } else {
        console.log(`[${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}],`);
      }
    }
  });
  return null;
}
// ===================================================

export default function InteractiveMap() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedZone, setSelectedZone] = useState('Semua Lokasi');
  const [filters, setFilters] = useState({ showCCTV: true, showNVR: true, showPanel: true, showFO: true, showLAN: true, showPower: true });
  const centerUbud: [number, number] = [-8.5050, 115.2630];

  // State untuk Fitur Pengukur Jarak
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // State Mode Teknisi
  const [isTechnicianMode, setIsTechnicianMode] = useState(false);
  const [userGpsLocation, setUserGpsLocation] = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // State Editor Info via Popup (Untuk Teknisi)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', notes: '' });

  useEffect(() => { fetchMapData(); }, []);

  const fetchMapData = async () => {
    const { data: nodesData } = await supabase.from('cctv_nodes').select('*');
    const { data: routesData } = await supabase.from('cctv_routes').select('*');
    
    if (nodesData) setNodes(nodesData);
    if (routesData) setRoutes(routesData);

    if (nodesData && nodesData.length > 0) {
       const firstPreset = nodesData[0].preset_group || 'Opsi IPCAM';
       setSelectedPreset(firstPreset);
    }
  };

  const handleMeasureClick = (latlng: L.LatLng) => {
    setMeasurePoints(prev => [...prev, [latlng.lat, latlng.lng]]);
  };

  // --- LOGIKA MENGAKTIFKAN MODE TEKNISI (DENGAN PASSWORD) ---
  const toggleTechnicianMode = () => {
    if (isTechnicianMode) {
      setIsTechnicianMode(false);
      setUserGpsLocation(null);
      setEditingNodeId(null);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      return;
    }

    const pass = prompt('Masukkan Password Teknisi:');
    if (pass === 'admin2026') { 
      setIsTechnicianMode(true);
      alert('Mode Teknisi Aktif! Semua PIN sekarang bisa digeser (Drag & Drop) dan info bisa di-edit. GPS Anda sedang dilacak...');
      
      // Menyalakan Live GPS
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (pos) => setUserGpsLocation([pos.coords.latitude, pos.coords.longitude]),
          (err) => { alert('Gagal membaca GPS HP. Pastikan GPS/Lokasi HP nyala dan browser diizinkan akses lokasi.'); console.error(err); },
          { enableHighAccuracy: true, maximumAge: 0 }
        );
        watchIdRef.current = id;
      }
    } else if (pass !== null) {
      alert('Password salah!');
    }
  };

  // --- LOGIKA SAAT TEKNISI SELESAI MENGGESER PIN ---
  const handleMarkerDragEnd = async (nodeId: string, event: any) => {
    const marker = event.target;
    const newPos = marker.getLatLng();
    const newLat = parseFloat(newPos.lat.toFixed(6));
    const newLng = parseFloat(newPos.lng.toFixed(6));

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, latitude: newLat, longitude: newLng } : n));
    await supabase.from('cctv_nodes').update({ latitude: newLat, longitude: newLng }).eq('id', nodeId);
  };

  // --- LOGIKA SIMPAN EDIT NAMA & NOTE ---
  const handleSaveNodeEdit = async (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, name: editFormData.name, notes: editFormData.notes } : n));
    await supabase.from('cctv_nodes').update({ name: editFormData.name, notes: editFormData.notes }).eq('id', nodeId);
    setEditingNodeId(null);
  };

  const uniquePresets = Array.from(new Set([
    ...nodes.map(n => n.preset_group || 'Opsi IPCAM'), 
    ...routes.map(r => r.preset_group || 'Opsi IPCAM')
  ]));
  
  const currentNodesInPreset = nodes.filter(n => (n.preset_group || 'Opsi IPCAM') === selectedPreset);
  const uniqueZones = Array.from(new Set(currentNodesInPreset.map(node => node.zone).filter(Boolean)));

  const filteredNodes = nodes.filter((node) => {
    if ((node.preset_group || 'Opsi IPCAM') !== selectedPreset) return false;
    if (selectedZone !== 'Semua Lokasi' && node.zone !== selectedZone) return false;
    const isCamera = node.device_type.includes('CAMERA') || node.device_type.includes('WIRELESS');
    if (!filters.showCCTV && isCamera) return false;
    if (!filters.showNVR && node.device_type === 'NVR') return false;
    if (!filters.showPanel && node.device_type === 'PANEL') return false;
    return true;
  });

  const filteredRoutes = routes.filter((route) => {
    if ((route.preset_group || 'Opsi IPCAM') !== selectedPreset) return false;
    if (selectedZone !== 'Semua Lokasi' && route.zone !== selectedZone) return false;
    if (!filters.showFO && route.cable_type === 'FIBER_OPTIC') return false;
    if (!filters.showLAN && route.cable_type === 'LAN_UTP') return false;
    if (!filters.showPower && route.cable_type === 'POWER_CABLE') return false;
    return true;
  });

  const handleFilterChange = (key: keyof typeof filters) => { setFilters({ ...filters, [key]: !filters[key] }); };

  const totalCCTV = filteredNodes.filter(n => n.device_type.includes('CAMERA') || n.device_type.includes('WIRELESS')).length;
  const totalNVR = filteredNodes.filter(n => n.device_type === 'NVR').length;
  const totalPanel = filteredNodes.filter(n => n.device_type === 'PANEL').length;

  const totalFODistance = filteredRoutes.filter(r => r.cable_type === 'FIBER_OPTIC').reduce((acc, curr) => acc + calculateDistance(curr.path_coordinates), 0);
  const totalLANDistance = filteredRoutes.filter(r => r.cable_type === 'LAN_UTP').reduce((acc, curr) => acc + calculateDistance(curr.path_coordinates), 0);
  const totalPowerDistance = filteredRoutes.filter(r => r.cable_type === 'POWER_CABLE').reduce((acc, curr) => acc + calculateDistance(curr.path_coordinates), 0);

  return (
    <div className="relative w-full h-full"> 
      
      {/* ================= PANEL BAWAH TENGAH (PENGUKUR JARAK & MODE TEKNISI) ================= */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col md:flex-row items-center gap-3">
        {isMeasuring && measurePoints.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-orange-200 px-5 py-2.5 rounded-full flex items-center gap-4 animate-fade-in mb-2 md:mb-0">
            <span className="text-sm font-bold text-gray-700">
              Jarak: <span className="text-orange-600 font-extrabold text-base">{formatDistance(calculateDistance(measurePoints))}</span>
            </span>
            <div className="w-px h-5 bg-gray-300"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); setMeasurePoints([]); }} 
              className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 hover:text-gray-900 transition"
            >
              Reset
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMeasuring(!isMeasuring);
              if (isMeasuring) setMeasurePoints([]); 
            }}
            className={`shadow-2xl px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
              isMeasuring 
              ? 'bg-orange-600 text-white ring-4 ring-orange-200' 
              : 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {isMeasuring ? '❌ Tutup Penggaris' : '📏 Ukur Jarak'}
          </button>
          
          <button 
            onClick={toggleTechnicianMode} 
            className={`shadow-2xl px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
              isTechnicianMode 
              ? 'bg-blue-600 text-white animate-pulse ring-4 ring-blue-200' 
              : 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isTechnicianMode ? '🔒 Akhiri Mode Teknisi' : '🛠️ Teknisi'}
          </button>
        </div>
      </div>

      {/* PANEL KIRI (TITLE & SUMMARY) */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-4 w-72 hidden sm:flex">
        
        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Infrastruktur CCTV</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Pemetaan Area Ubud</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-2">
            Ringkasan {selectedPreset || 'Perangkat'}
          </h3>
          
          <div className="flex flex-col gap-2.5 text-sm font-medium text-gray-700">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm border border-blue-600"></div> Total Titik CCTV</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{totalCCTV}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm border border-red-600"></div> Total Server / NVR</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{totalNVR}</span>
            </div>
            
            {totalPanel > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></div> Box Panel</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{totalPanel}</span>
              </div>
            )}
            
            <div className="border-t border-dashed border-gray-200 my-1"></div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><div className="w-4 h-1.5 bg-blue-500 rounded-full shadow-sm"></div> Jalur FO</span>
              <span className="font-bold text-gray-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">{formatDistance(totalFODistance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><div className="w-4 h-1.5 border-t-[3px] border-dashed border-green-500 mt-1"></div> Jalur LAN UTP</span>
              <span className="font-bold text-gray-900 bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100">{formatDistance(totalLANDistance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><div className="w-4 h-1.5 bg-red-500 rounded-full shadow-sm"></div> Listrik Utama</span>
              <span className="font-bold text-gray-900 bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-100">{formatDistance(totalPowerDistance)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* PANEL KANAN (FILTER PENGATURAN) */}
      <div className={`absolute top-4 right-4 z-[1000] bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col border border-gray-100
        ${isFilterOpen ? 'w-[calc(100vw-2rem)] sm:w-80 max-h-[calc(100vh-2rem)] opacity-100' : 'w-12 h-12 opacity-90 overflow-hidden'}
      `}>
        <div 
          className="bg-emerald-800 text-white p-3.5 flex justify-between items-center cursor-pointer hover:bg-emerald-700 transition-colors rounded-t-2xl"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? (
            <>
              <span className="font-bold text-xs tracking-widest uppercase">Pengaturan</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
            </>
          ) : (
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </div>

        <div className={`p-5 overflow-y-auto custom-scrollbar ${!isFilterOpen && 'hidden'}`}>
          <div className="mb-6 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2 block">Pilih Opsi Rancangan</label>
            <select 
              className="w-full p-2.5 border border-emerald-300 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm" 
              value={selectedPreset} 
              onChange={(e) => { 
                setSelectedPreset(e.target.value); 
                setSelectedZone('Semua Lokasi'); 
              }}
            >
              {uniquePresets.map((preset: any) => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Area / Jalan</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
              <option value="Semua Lokasi">Semua Lokasi</option>
              {uniqueZones.map((zone: any) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block border-b pb-2">Perangkat (Nodes)</label>
            <div className="flex flex-col gap-3.5">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showNVR} onChange={() => handleFilterChange('showNVR')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm border border-red-600"></div> Server / NVR</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showPanel} onChange={() => handleFilterChange('showPanel')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></div> Panel Distribusi</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showCCTV} onChange={() => handleFilterChange('showCCTV')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm border border-blue-600"></div> Titik Kamera</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block border-b pb-2">Jalur Kabel (Routes)</label>
            <div className="flex flex-col gap-3.5">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showFO} onChange={() => handleFilterChange('showFO')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-6 h-1.5 bg-blue-500 rounded-full shadow-sm"></div> Fiber Optic</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showLAN} onChange={() => handleFilterChange('showLAN')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-6 h-1.5 border-t-[3px] border-dashed border-green-500 mt-1"></div> LAN UTP</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showPower} onChange={() => handleFilterChange('showPower')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-6 h-1.5 bg-red-500 rounded-full shadow-sm"></div> Listrik Utama</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* MAP LAYER */}
      <MapContainer center={centerUbud} zoom={16} maxZoom={24} className="h-full w-full z-0">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" maxZoom={24} maxNativeZoom={19} />
        
        {/* Event Handler Peta */}
        <MapClickHandler isMeasuring={isMeasuring} onMapClick={handleMeasureClick} />

        {/* RENDER TITIK LOKASI GPS HP TEKNISI */}
        {isTechnicianMode && userGpsLocation && (
          <Marker position={userGpsLocation} icon={liveGpsIcon}>
            <Popup><b>Lokasi Anda (GPS Live)</b></Popup>
          </Marker>
        )}

        {/* LAYER GARIS PENGUKUR MANUAL */}
        {isMeasuring && measurePoints.length > 0 && (
          <>
            <Polyline positions={measurePoints} color="#ea580c" weight={4} dashArray="8, 10" opacity={0.8} />
            {measurePoints.map((pos, idx) => (
              <Marker
                key={`measure-${idx}`}
                position={pos}
                icon={L.divIcon({
                  className: 'bg-transparent',
                  html: `<div style="width: 14px; height: 14px; background: white; border: 4px solid #ea580c; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [14, 14], iconAnchor: [7, 7]
                })}
              />
            ))}
          </>
        )}

        {filteredRoutes.map((route) => {
          let color = '#3b82f6'; let isDash = '';
          if (route.cable_type === 'LAN_UTP') { color = '#22c55e'; isDash = '5, 10'; }
          if (route.cable_type === 'POWER_CABLE') { color = '#ef4444'; }

          const distance = formatDistance(calculateDistance(route.path_coordinates));

          return (
            <Polyline key={route.id} positions={route.path_coordinates} color={color} weight={5} dashArray={isDash} opacity={0.8}>
              <Popup>
                <div className="font-bold text-gray-900 mb-1">Jalur {route.cable_type.replace('_', ' ')}</div>
                <div className="text-xs bg-gray-100 px-2 py-1 inline-block rounded font-bold text-emerald-700">Panjang: {distance}</div>
              </Popup>
            </Polyline>
          );
        })}

        {filteredNodes.map((node) => (
          <Marker 
            key={node.id} 
            position={[node.latitude, node.longitude]} 
            icon={getIcon(node.device_type)}
            draggable={isTechnicianMode}
            eventHandlers={{ dragend: (e) => handleMarkerDragEnd(node.id, e) }}
          >
            <Popup className="min-w-[200px]">
              <div className="p-1 text-center">
                {editingNodeId === node.id && isTechnicianMode ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full text-sm p-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Nama Titik..." />
                    <textarea value={editFormData.notes} onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})} className="w-full text-xs p-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[60px]" placeholder="Catatan teknisi..." />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveNodeEdit(node.id)} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded">Simpan</button>
                      <button onClick={() => setEditingNodeId(null)} className="flex-1 bg-gray-200 text-gray-700 text-[10px] font-bold py-1.5 rounded">Batal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-extrabold tracking-wider rounded px-2 py-1 mb-2 inline-block border border-emerald-200">{node.device_type.replace(/_/g, ' ')}</div>
                    <h3 className="font-extrabold text-gray-900 text-sm mb-1">{node.name}</h3>
                    <p className="text-[10px] text-gray-500 font-medium mb-1">📍 {node.zone}</p>
                    
                    {/* Menampilkan Notes */}
                    {node.notes && (
                      <div className="text-[10px] text-left text-amber-800 bg-amber-50 border border-amber-200 rounded p-1.5 mt-1 leading-tight w-full max-w-[200px]">
                        <span className="font-bold">📝 Note:</span> {node.notes}
                      </div>
                    )}

                    {isTechnicianMode && (
                      <div className="mt-2 flex flex-col gap-1">
                        <button onClick={() => { setEditingNodeId(node.id); setEditFormData({ name: node.name, notes: node.notes || '' }); }} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded p-1 text-[10px] font-bold hover:bg-emerald-100">✏️ Edit Info & Note</button>
                        <div className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 rounded p-1">🔄 Tahan & Geser PIN untuk pindah</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}