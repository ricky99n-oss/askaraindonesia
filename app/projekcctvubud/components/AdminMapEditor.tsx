'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { supabase } from '@/lib/supabaseClient';

// === FUNGSI PENGHITUNG JARAK ===
const calculateDistance = (coords: any[]) => {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  const R = 6371e3; // Radius bumi meter
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
// ===============================

// ================= SETUP IKON & WARNA =================
const createCustomIcon = (svgPath: string, bgColor: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg></div>`,
    className: 'custom-leaflet-icon', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
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

const defaultMarkerIcon = getIcon('CAMERA_STD');

// ================= INISIALISASI PETA GLOBAL =================
const GeomanInit = ({ onDrawCreated, onLayerDeleted }: any) => {
  const map = useMap();
  useEffect(() => {
    map.pm.setGlobalOptions({ markerStyle: { icon: defaultMarkerIcon } }); 
    map.pm.addControls({
      position: 'topleft', drawMarker: true, drawPolyline: true, drawPolygon: false, drawCircle: false, drawCircleMarker: false, drawRectangle: false, drawText: false, editMode: true, dragMode: true, cutPolygon: false, removalMode: true,
    });

    map.on('pm:create', (e) => onDrawCreated(e));
    map.on('pm:remove', (e) => onLayerDeleted(e));

    return () => {
      map.pm.removeControls();
      map.off('pm:create'); map.off('pm:remove');
    };
  }, [map]);
  return null;
};

// ================= KOMPONEN UTAMA EDITOR =================
export default function AdminMapEditor({ nodes, routes, onDataChanged, onAddNewNode, onAddNewRoute }: any) {
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const centerUbud: [number, number] = [-8.5050, 115.2630];

  useEffect(() => {
    if (!featureGroupRef.current) return;
    featureGroupRef.current.clearLayers(); 

    nodes.forEach((node: any) => {
      const marker = L.marker([node.latitude, node.longitude], { icon: getIcon(node.device_type) });
      marker.bindPopup(`<b>${node.name}</b><br/>${node.device_type.replace(/_/g, ' ')}`); 
      marker.pm.enable();
      (marker as any).dbId = node.id; 
      (marker as any).dbType = 'NODE';

      marker.on('pm:dragend', async (e: any) => {
        const latLng = e.target.getLatLng();
        await supabase.from('cctv_nodes').update({ 
            latitude: parseFloat(latLng.lat.toFixed(6)), 
            longitude: parseFloat(latLng.lng.toFixed(6)) 
        }).eq('id', node.id);
        
        onDataChanged();
      });

      featureGroupRef.current?.addLayer(marker);
    });

    routes.forEach((route: any) => {
      let color = '#3b82f6'; 
      let dashArray = '';
      if (route.cable_type === 'LAN_UTP') { color = '#22c55e'; dashArray = '5, 10'; } 
      if (route.cable_type === 'POWER_CABLE') { color = '#ef4444'; } 

      const polyline = L.polyline(route.path_coordinates, { color, weight: 5, dashArray });
      
      // MENAMBAHKAN INFO JARAK DI POPUP ADMIN
      const distance = formatDistance(calculateDistance(route.path_coordinates));
      polyline.bindPopup(`<b>${route.cable_type.replace('_', ' ')}</b><br/><span style="color: green; font-weight: bold;">Panjang: ${distance}</span>`);
      
      polyline.pm.enable();
      (polyline as any).dbId = route.id;
      (polyline as any).dbType = 'ROUTE';

      const saveRouteChanges = async (e: any) => {
        const latLngs = e.target.getLatLngs();
        const flatLatLngs = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs; 
        const coordinatesArray = flatLatLngs.map((pos: any) => [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]);
        
        await supabase.from('cctv_routes').update({ path_coordinates: coordinatesArray }).eq('id', route.id);
        onDataChanged();
      };

      polyline.on('pm:edit', saveRouteChanges);
      polyline.on('pm:dragend', saveRouteChanges);

      featureGroupRef.current?.addLayer(polyline);
    });

  }, [nodes, routes]); 

  const handleDrawCreated = (e: any) => {
    e.layer.remove(); 
    if (e.shape === 'Marker') {
      const latLng = e.layer.getLatLng();
      onAddNewNode(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
    }
    if (e.shape === 'Line') {
      const latLngs = e.layer.getLatLngs();
      const flatLatLngs = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
      const coordinatesArray = flatLatLngs.map((pos: any) => [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]);
      onAddNewRoute(coordinatesArray);
    }
  };

  const handleLayerDeleted = async (e: any) => {
    const layer = e.layer;
    if (!layer.dbId) return;

    if (layer.dbType === 'NODE') await supabase.from('cctv_nodes').delete().eq('id', layer.dbId);
    if (layer.dbType === 'ROUTE') await supabase.from('cctv_routes').delete().eq('id', layer.dbId);
    
    onDataChanged(); 
  };

  return (
    <div className="h-[600px] lg:h-full w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0 relative">
      <MapContainer center={centerUbud} zoom={16} maxZoom={24} className="h-full w-full z-0">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" maxZoom={24} maxNativeZoom={19} />
        <FeatureGroup ref={featureGroupRef}></FeatureGroup>
        <GeomanInit onDrawCreated={handleDrawCreated} onLayerDeleted={handleLayerDeleted} />
      </MapContainer>
    </div>
  );
}