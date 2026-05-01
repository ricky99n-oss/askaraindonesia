'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabaseClient'; 

// ================= SETUP IKON KUSTOM =================
// Kita pakai warna/ikon berbeda agar NVR, Panel, dan CCTV mudah dibedakan
const iconConfig = {
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41] as [number, number],
};

const cctvIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' });
const audioIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png' });
const nvrIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' });
const panelIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

// Helper untuk memilih ikon
const getIcon = (type: string) => {
  if (type === 'NVR') return nvrIcon;
  if (type === 'PANEL') return panelIcon;
  if (type === 'CAMERA_AUDIO') return audioIcon;
  return cctvIcon; // Default CAMERA_STD
};
// =======================================================

export default function InteractiveMap() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  
  // STATE UNTUK FILTER
  const [selectedZone, setSelectedZone] = useState('Semua Lokasi');
  const [filters, setFilters] = useState({
    showCCTV: true,
    showNVR: true,
    showPanel: true,
    showFO: true,
    showLAN: true,
    showPower: true,
  });

  const centerUbud: [number, number] = [-8.5069, 115.2625];

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    const { data: nodesData } = await supabase.from('cctv_nodes').select('*');
    if (nodesData) setNodes(nodesData);
    const { data: routesData } = await supabase.from('cctv_routes').select('*');
    if (routesData) setRoutes(routesData);
  };

  // LOGIKA FILTERING DATA
  const filteredNodes = nodes.filter((node) => {
    // Filter Zone (Jalan)
    if (selectedZone !== 'Semua Lokasi' && node.zone !== selectedZone) return false;
    // Filter Tipe Alat
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

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* ================= PANEL FILTER (KIRI) ================= */}
      <div className="w-full md:w-1/4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6 h-fit">
        <div>
          <h3 className="font-bold text-gray-800 mb-2">Pilih Area / Jalan</h3>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm focus:ring-blue-500"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            <option value="Semua Lokasi">Semua Lokasi</option>
            <option value="Jl. Sri Wedari">Jl. Sri Wedari</option>
            <option value="Jl. Raya Ubud">Jl. Raya Ubud</option>
            <option value="Jl. Sandat">Jl. Sandat</option>
          </select>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Filter Perangkat</h3>
          <label className="flex items-center gap-3 mb-2 cursor-pointer text-sm">
            <input type="checkbox" checked={filters.showNVR} onChange={() => handleFilterChange('showNVR')} className="w-4 h-4 text-red-500" />
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> NVR / Server Utama</span>
          </label>
          <label className="flex items-center gap-3 mb-2 cursor-pointer text-sm">
            <input type="checkbox" checked={filters.showPanel} onChange={() => handleFilterChange('showPanel')} className="w-4 h-4 text-green-500" />
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Box Panel / Switch</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer text-sm">
            <input type="checkbox" checked={filters.showCCTV} onChange={() => handleFilterChange('showCCTV')} className="w-4 h-4 text-blue-500" />
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Kamera CCTV (Std/Audio)</span>
          </label>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Filter Jalur Kabel</h3>
          <label className="flex items-center gap-3 mb-2 cursor-pointer text-sm">
            <input type="checkbox" checked={filters.showFO} onChange={() => handleFilterChange('showFO')} className="w-4 h-4 text-blue-500" />
            <span className="flex items-center gap-2"><div className="w-4 h-1 bg-blue-500"></div> Fiber Optic (Backbone)</span>
          </label>
          <label className="flex items-center gap-3 mb-2 cursor-pointer text-sm">
            <input type="checkbox" checked={filters.showLAN} onChange={() => handleFilterChange('showLAN')} className="w-4 h-4 text-green-500" />
            <span className="flex items-center gap-2"><div className="w-4 h-1 border-t-2 border-dashed border-green-500"></div> LAN UTP (Kamera)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer text-sm">
            <input type="checkbox" checked={filters.showPower} onChange={() => handleFilterChange('showPower')} className="w-4 h-4 text-red-500" />
            <span className="flex items-center gap-2"><div className="w-4 h-1 bg-red-500"></div> Kabel Listrik (Power)</span>
          </label>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md mt-auto text-xs text-blue-800 border border-blue-100">
          <b>Info:</b> Peta menggunakan tema Grayscale agar warna infrastruktur kabel lebih menonjol.
        </div>
      </div>

      {/* ================= PETA INTERAKTIF (KANAN) ================= */}
      <div className="w-full md:w-3/4 h-[75vh] rounded-xl overflow-hidden border border-gray-300 shadow-sm z-0">
        <MapContainer center={centerUbud} zoom={16} className="h-full w-full">
          {/* BASEMAP HITAM PUTIH (CartoDB Positron) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* RENDER JALUR KABEL */}
          {filteredRoutes.map((route) => {
            let color = '#3b82f6'; // Biru FO
            let isDash = '';
            if (route.cable_type === 'LAN_UTP') { color = '#22c55e'; isDash = '5, 10'; } // Hijau putus
            if (route.cable_type === 'POWER_CABLE') { color = '#ef4444'; } // Merah Listrik

            return (
              <Polyline key={route.id} positions={route.path_coordinates} color={color} weight={5} dashArray={isDash}>
                <Popup><b>Jalur {route.cable_type.replace('_', ' ')}</b></Popup>
              </Polyline>
            );
          })}

          {/* RENDER TITIK ALAT */}
          {filteredNodes.map((node) => (
            <Marker key={node.id} position={[node.latitude, node.longitude]} icon={getIcon(node.device_type)}>
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-md border-b pb-1 mb-2">{node.name}</h3>
                  <p className="text-sm text-gray-600"><b>Jalan:</b> {node.zone}</p>
                  <p className="text-sm text-gray-600"><b>Tipe:</b> {node.device_type.replace('_', ' ')}</p>
                  <span className="px-2 py-1 mt-2 inline-block text-xs rounded bg-green-100 text-green-700 font-semibold border border-green-200">
                    {node.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}