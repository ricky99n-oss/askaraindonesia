'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini

// Fix default icon Leaflet di Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

export default function InteractiveMap() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const centerUbud: [number, number] = [-8.5069, 115.2625];

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    // Ambil data Nodes
    const { data: nodesData } = await supabase.from('cctv_nodes').select('*');
    if (nodesData) setNodes(nodesData);

    // Ambil data Routes
    const { data: routesData } = await supabase.from('cctv_routes').select('*');
    if (routesData) setRoutes(routesData);
  };

  return (
    <div className="h-[70vh] w-full rounded-xl overflow-hidden border border-gray-300 shadow-md z-0 relative">
      <MapContainer center={centerUbud} zoom={16} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Render Jalur Kabel */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.path_coordinates}
            color={route.cable_type === 'FIBER_OPTIC' ? '#3b82f6' : '#22c55e'} // Biru FO, Hijau LAN
            weight={4}
            dashArray={route.cable_type === 'LAN_UTP' ? '5, 10' : ''}
          >
            <Popup>
              <b>Jalur {route.cable_type}</b>
            </Popup>
          </Polyline>
        ))}

        {/* Render Titik Kamera / NVR */}
        {nodes.map((node) => (
          <Marker key={node.id} position={[node.latitude, node.longitude]}>
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg border-b pb-1 mb-2">{node.name}</h3>
                <p className="text-sm"><b>Tipe:</b> {node.device_type}</p>
                <p className="text-sm"><b>IP:</b> {node.ip_address || 'Belum disetting'}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${node.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {node.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}