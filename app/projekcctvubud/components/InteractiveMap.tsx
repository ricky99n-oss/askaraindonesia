'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabaseClient'; 

// ================= SETUP IKON =================
const iconConfig = { iconSize: [25, 41] as [number, number], iconAnchor: [12, 41] as [number, number], popupAnchor: [1, -34] as [number, number], shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41] as [number, number] };
const cctvIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' });
const audioIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png' });
const nvrIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' });
const panelIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });
const getIcon = (type: string) => { if (type === 'NVR') return nvrIcon; if (type === 'PANEL') return panelIcon; if (type === 'CAMERA_AUDIO') return audioIcon; return cctvIcon; };
// ===============================================

function MapClickHandler() {
  useMapEvents({
    click: (e) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      console.log(`[${lat}, ${lng}],`);
    }
  });
  return null;
}

export default function InteractiveMap() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  const [selectedZone, setSelectedZone] = useState('Semua Lokasi');
  const [filters, setFilters] = useState({ showCCTV: true, showNVR: true, showPanel: true, showFO: true, showLAN: true, showPower: true });
  const centerUbud: [number, number] = [-8.5050, 115.2630];

  useEffect(() => { fetchMapData(); }, []);

  const fetchMapData = async () => {
    const { data: nodesData } = await supabase.from('cctv_nodes').select('*');
    if (nodesData) setNodes(nodesData);
    const { data: routesData } = await supabase.from('cctv_routes').select('*');
    if (routesData) setRoutes(routesData);
  };

  // ================= EXTRACT ZONA DINAMIS =================
  // Mengambil semua 'zone' dari database, lalu menghapus nama yang duplikat
  const uniqueZones = Array.from(new Set(nodes.map(node => node.zone).filter(Boolean)));
  // ========================================================

  const filteredNodes = nodes.filter((node) => {
    if (selectedZone !== 'Semua Lokasi' && node.zone !== selectedZone) return false;
    if (!filters.showCCTV && node.device_type.includes('CAMERA')) return false;
    if (!filters.showNVR && node.device_type === 'NVR') return false;
    if (!filters.showPanel && node.device_type === 'PANEL') return false;
    return true;
  });

  const filteredRoutes = routes.filter((route) => {
    if (!filters.showFO && route.cable_type === 'FIBER_OPTIC') return false;
    if (!filters.showLAN && route.cable_type === 'LAN_UTP') return false;
    if (!filters.showPower && route.cable_type === 'POWER_CABLE') return false;
    return true;
  });

  const handleFilterChange = (key: keyof typeof filters) => { setFilters({ ...filters, [key]: !filters[key] }); };

  return (
    <div className="relative w-full h-full"> 
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-gray-200 hidden sm:block">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Infrastruktur CCTV</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Pemetaan Area Ubud</p>
          </div>
        </div>
      </div>

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
          <div className="mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Area</label>
            <select className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
              <option value="Semua Lokasi">Semua Lokasi</option>
              
              {/* === RENDER ZONA DINAMIS === */}
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
                <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm border border-green-600"></div> Panel Distribusi</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-emerald-700">
                <input type="checkbox" checked={filters.showCCTV} onChange={() => handleFilterChange('showCCTV')} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm border border-blue-600"></div> Titik CCTV</span>
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

      <MapContainer center={centerUbud} zoom={16} className="h-full w-full z-0">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        
        <MapClickHandler />

        {filteredRoutes.map((route) => {
          let color = '#3b82f6'; let isDash = '';
          if (route.cable_type === 'LAN_UTP') { color = '#22c55e'; isDash = '5, 10'; }
          if (route.cable_type === 'POWER_CABLE') { color = '#ef4444'; }

          return (
            <Polyline key={route.id} positions={route.path_coordinates} color={color} weight={5} dashArray={isDash} opacity={0.8}>
              <Popup><div className="font-bold">Jalur {route.cable_type.replace('_', ' ')}</div></Popup>
            </Polyline>
          );
        })}

        {filteredNodes.map((node) => (
          <Marker key={node.id} position={[node.latitude, node.longitude]} icon={getIcon(node.device_type)}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-gray-800 mb-1">{node.name}</h3>
                <p className="text-xs text-gray-500">Lokasi: {node.zone}</p>
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider bg-gray-100 rounded px-2 py-1 inline-block border border-gray-200">
                  {node.device_type.replace('_', ' ')}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}