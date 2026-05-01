'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { supabase } from '@/lib/supabaseClient';

// ================= SETUP IKON & WARNA =================
const iconConfig = { iconSize: [25, 41] as [number, number], iconAnchor: [12, 41] as [number, number], popupAnchor: [1, -34] as [number, number], shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41] as [number, number] };

// Import ikon berbagai warna
const cctvIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' });
const audioIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png' });
const nvrIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' });
const panelIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

// Fungsi untuk menentukan warna pin berdasarkan tipe alat
const getIcon = (type: string) => { 
  if (type === 'NVR') return nvrIcon; 
  if (type === 'PANEL') return panelIcon; 
  if (type === 'CAMERA_AUDIO') return audioIcon; 
  return cctvIcon; 
};
// ======================================================

const GeomanInit = ({ onDrawCreated, onLayerEdited, onLayerDeleted }: any) => {
  const map = useMap();
  useEffect(() => {
    // Ikon bawaan saat kursor drag-drop pertama kali (default biru)
    map.pm.setGlobalOptions({ markerStyle: { icon: cctvIcon } }); 
    map.pm.addControls({
      position: 'topleft', drawMarker: true, drawPolyline: true, drawPolygon: false, drawCircle: false, drawCircleMarker: false, drawRectangle: false, drawText: false, editMode: true, dragMode: true, cutPolygon: false, removalMode: true,
    });

    map.on('pm:create', (e) => onDrawCreated(e));
    map.on('pm:edit', (e) => onLayerEdited(e));
    map.on('pm:remove', (e) => onLayerDeleted(e));

    return () => {
      map.pm.removeControls();
      map.off('pm:create'); map.off('pm:edit'); map.off('pm:remove');
    };
  }, [map]);
  return null;
};

export default function AdminMapEditor({ nodes, routes, onDataChanged, onAddNewNode, onAddNewRoute }: any) {
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const centerUbud: [number, number] = [-8.5050, 115.2630];

  useEffect(() => {
    if (!featureGroupRef.current) return;
    featureGroupRef.current.clearLayers(); 

    // 1. TAMPILKAN SEMUA TITIK PIN (Setiap saat, warna sesuai tipe)
    nodes.forEach((node: any) => {
      const marker = L.marker([node.latitude, node.longitude], { icon: getIcon(node.device_type) });
      marker.bindPopup(`<b>${node.name}</b><br/>${node.device_type}`); // Tambahkan Popup informasi
      marker.pm.enable();
      (marker as any).dbId = node.id; 
      (marker as any).dbType = 'NODE';
      featureGroupRef.current?.addLayer(marker);
    });

    // 2. TAMPILKAN SEMUA JALUR KABEL (Setiap saat, warna sesuai tipe)
    routes.forEach((route: any) => {
      let color = '#3b82f6'; // Default Fiber Optic (Biru)
      let dashArray = '';
      if (route.cable_type === 'LAN_UTP') { color = '#22c55e'; dashArray = '5, 10'; } // Hijau Putus
      if (route.cable_type === 'POWER_CABLE') { color = '#ef4444'; } // Merah Listrik

      const polyline = L.polyline(route.path_coordinates, { color, weight: 5, dashArray });
      polyline.bindPopup(`<b>${route.cable_type.replace('_', ' ')}</b>`);
      polyline.pm.enable();
      (polyline as any).dbId = route.id;
      (polyline as any).dbType = 'ROUTE';
      featureGroupRef.current?.addLayer(polyline);
    });

    // Hapus dependensi 'activeTab' agar peta TIDAK bersembunyi saat ganti tab!
  }, [nodes, routes]); 

  const handleDrawCreated = (e: any) => {
    e.layer.remove(); // Hapus ghost pin

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

  const handleLayerEdited = async (e: any) => {
    const layer = e.layer;
    if (!layer.dbId) return;

    if (layer.dbType === 'NODE') {
      const latLng = layer.getLatLng();
      await supabase.from('cctv_nodes').update({ latitude: parseFloat(latLng.lat.toFixed(6)), longitude: parseFloat(latLng.lng.toFixed(6)) }).eq('id', layer.dbId);
    }
    if (layer.dbType === 'ROUTE') {
      const latLngs = layer.getLatLngs();
      const flatLatLngs = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs; 
      const coordinatesArray = flatLatLngs.map((pos: any) => [parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6))]);
      await supabase.from('cctv_routes').update({ path_coordinates: coordinatesArray }).eq('id', layer.dbId);
    }
    onDataChanged(); 
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
      <MapContainer center={centerUbud} zoom={16} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <FeatureGroup ref={featureGroupRef}></FeatureGroup>
        <GeomanInit onDrawCreated={handleDrawCreated} onLayerEdited={handleLayerEdited} onLayerDeleted={handleLayerDeleted} />
      </MapContainer>
    </div>
  );
}