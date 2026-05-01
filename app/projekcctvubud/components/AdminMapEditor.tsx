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
const cctvIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' });
const audioIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png' });
const nvrIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' });
const panelIcon = L.icon({ ...iconConfig, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

const getIcon = (type: string) => { 
  if (type === 'NVR') return nvrIcon; 
  if (type === 'PANEL') return panelIcon; 
  if (type === 'CAMERA_AUDIO') return audioIcon; 
  return cctvIcon; 
};

// ================= INISIALISASI PETA GLOBAL =================
const GeomanInit = ({ onDrawCreated, onLayerDeleted }: any) => {
  const map = useMap();
  useEffect(() => {
    map.pm.setGlobalOptions({ markerStyle: { icon: cctvIcon } }); 
    map.pm.addControls({
      position: 'topleft', drawMarker: true, drawPolyline: true, drawPolygon: false, drawCircle: false, drawCircleMarker: false, drawRectangle: false, drawText: false, editMode: true, dragMode: true, cutPolygon: false, removalMode: true,
    });

    // Peta hanya memantau DUA event global: Buat Baru & Hapus
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

    // 1. RENDER TITIK PIN
    nodes.forEach((node: any) => {
      const marker = L.marker([node.latitude, node.longitude], { icon: getIcon(node.device_type) });
      marker.bindPopup(`<b>${node.name}</b><br/>${node.device_type}`); 
      marker.pm.enable();
      (marker as any).dbId = node.id; 
      (marker as any).dbType = 'NODE';

      // ✅ SOLUSI DRAG & DROP PIN: Deteksi event "pm:dragend" secara spesifik di tiap pin
      marker.on('pm:dragend', async (e: any) => {
        const latLng = e.target.getLatLng();
        await supabase.from('cctv_nodes').update({ 
            latitude: parseFloat(latLng.lat.toFixed(6)), 
            longitude: parseFloat(latLng.lng.toFixed(6)) 
        }).eq('id', node.id);
        
        onDataChanged(); // Beritahu list di kiri agar me-refresh koordinat
      });

      featureGroupRef.current?.addLayer(marker);
    });

    // 2. RENDER JALUR KABEL
    routes.forEach((route: any) => {
      let color = '#3b82f6'; 
      let dashArray = '';
      if (route.cable_type === 'LAN_UTP') { color = '#22c55e'; dashArray = '5, 10'; } 
      if (route.cable_type === 'POWER_CABLE') { color = '#ef4444'; } 

      const polyline = L.polyline(route.path_coordinates, { color, weight: 5, dashArray });
      polyline.bindPopup(`<b>${route.cable_type.replace('_', ' ')}</b>`);
      polyline.pm.enable();
      (polyline as any).dbId = route.id;
      (polyline as any).dbType = 'ROUTE';

      // ✅ SOLUSI EDIT GARIS: Deteksi event "edit vertex" dan "drag garis"
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

  // ================= HANDLER EVENT MAP =================
  const handleDrawCreated = (e: any) => {
    e.layer.remove(); // Hapus ghost pin karena nanti akan di-render ulang oleh useEffect dari Supabase

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