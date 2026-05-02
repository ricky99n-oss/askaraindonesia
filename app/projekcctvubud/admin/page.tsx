'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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

const AdminMapEditor = dynamic<{ activeTab: string, nodes: any[], routes: any[], onDataChanged: () => void, onAddNewNode: (lat: string, lng: string) => void, onAddNewRoute: (coords: any[]) => void }>(
  () => import('../components/AdminMapEditor'),
  { ssr: false, loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center font-bold text-gray-400">Memuat Visual Editor...</div> }
);

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('NODES'); 
  const [nodes, setNodes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  const [nodeForm, setNodeForm] = useState<any>(null);
  const [routeForm, setRouteForm] = useState<any>(null);

  const [activePreset, setActivePreset] = useState('Opsi IPCAM');

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && sessionStorage.getItem('cctv_admin_logged_in') === 'true') {
      setIsLoggedIn(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const { data: nData } = await supabase.from('cctv_nodes').select('*').order('created_at', { ascending: false });
    const { data: rData } = await supabase.from('cctv_routes').select('*').order('created_at', { ascending: false });
    if (nData) setNodes(nData);
    if (rData) setRoutes(rData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin2026#') {
      sessionStorage.setItem('cctv_admin_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
      fetchData();
    } else {
      setLoginError('Username atau Password salah!');
    }
  };

  const uniquePresets = Array.from(new Set([
    ...nodes.map(n => n.preset_group || 'Opsi IPCAM'),
    ...routes.map(r => r.preset_group || 'Opsi IPCAM'),
    activePreset 
  ]));

  const handlePresetChange = (e: any) => {
    if (e.target.value === 'NEW_PRESET') {
      const newPreset = prompt('Masukkan nama Opsi / Preset baru (misal: Opsi Wireless):');
      if (newPreset && newPreset.trim() !== '') {
        setActivePreset(newPreset.trim());
      }
    } else {
      setActivePreset(e.target.value);
    }
    setNodeForm(null);
    setRouteForm(null);
  };

  const handleDuplicatePreset = async () => {
    const newPreset = prompt(`Salin semua alat dari "${activePreset}" menjadi Opsi Baru bernama:`);
    if (!newPreset || newPreset.trim() === '') return;
    
    const newName = newPreset.trim();
    const nodesToCopy = displayNodes.map(({ id, created_at, ...rest }) => ({ ...rest, preset_group: newName }));
    const routesToCopy = displayRoutes.map(({ id, created_at, ...rest }) => ({ ...rest, preset_group: newName }));

    if (nodesToCopy.length > 0) await supabase.from('cctv_nodes').insert(nodesToCopy);
    if (routesToCopy.length > 0) await supabase.from('cctv_routes').insert(routesToCopy);

    setActivePreset(newName);
    fetchData();
    alert(`Berhasil diduplikat! Anda sekarang mengedit: ${newName}`);
  };

  const displayNodes = nodes.filter(n => (n.preset_group || 'Opsi IPCAM') === activePreset);
  const displayRoutes = routes.filter(r => (r.preset_group || 'Opsi IPCAM') === activePreset);

  const triggerNewNodeForm = (lat: string, lng: string) => {
    setActiveTab('NODES');
    setNodeForm({ id: '', name: '', zone: 'Pilih Jalan', device_type: 'CAMERA_STD', latitude: lat, longitude: lng });
  };

  const triggerNewRouteForm = (coords: any[]) => {
    setActiveTab('ROUTES');
    setRouteForm({ id: '', cable_type: 'FIBER_OPTIC', zone: 'Pilih Jalan', path_coordinates: coords });
  };

  const saveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeForm.id) {
      await supabase.from('cctv_nodes').update({ name: nodeForm.name, zone: nodeForm.zone, device_type: nodeForm.device_type }).eq('id', nodeForm.id);
    } else {
      await supabase.from('cctv_nodes').insert([{ name: nodeForm.name, zone: nodeForm.zone, device_type: nodeForm.device_type, latitude: parseFloat(nodeForm.latitude), longitude: parseFloat(nodeForm.longitude), preset_group: activePreset }]);
    }
    setNodeForm(null); fetchData(); 
  };

  const saveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (routeForm.id) {
      await supabase.from('cctv_routes').update({ cable_type: routeForm.cable_type, zone: routeForm.zone }).eq('id', routeForm.id);
    } else {
      await supabase.from('cctv_routes').insert([{ cable_type: routeForm.cable_type, zone: routeForm.zone, path_coordinates: routeForm.path_coordinates, preset_group: activePreset }]);
    }
    setRouteForm(null); fetchData();
  };

  if (!isMounted) return null;
  if (!isLoggedIn) { 
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4"><div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"><h1 className="text-2xl font-extrabold text-emerald-800 text-center mb-8">Login Admin CCTV</h1>{loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{loginError}</div>}<form onSubmit={handleLogin} className="flex flex-col gap-5"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 border rounded-xl" placeholder="Username" required /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border rounded-xl" placeholder="Password" required /><button type="submit" className="bg-emerald-700 text-white font-bold py-3.5 rounded-xl">MASUK</button></form></div></div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin Visual Editor</h1>
          <p className="text-xs text-gray-500 font-medium">Infrastruktur CCTV Ubud</p>
        </div>
        <button onClick={() => { sessionStorage.clear(); setIsLoggedIn(false); }} className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-xl text-xs">Logout</button>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 flex flex-col gap-4 h-[80vh]">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-300 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Opsi Rancangan Aktif</label>
              <button onClick={handleDuplicatePreset} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-100 transition cursor-pointer">📋 Duplikat</button>
            </div>
            <select value={activePreset} onChange={handlePresetChange} className="w-full p-2.5 border border-emerald-400 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              {uniquePresets.map((preset: any) => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
              <option disabled>──────────</option>
              <option value="NEW_PRESET">➕ Buat Preset Baru...</option>
            </select>
          </div>

          <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-gray-200 shrink-0">
            <button onClick={() => { setActiveTab('NODES'); setNodeForm(null); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'NODES' ? 'bg-emerald-700 text-white' : 'text-gray-500'}`}>📍 Titik (Nodes)</button>
            <button onClick={() => { setActiveTab('ROUTES'); setRouteForm(null); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'ROUTES' ? 'bg-emerald-700 text-white' : 'text-gray-500'}`}>〰️ Jalur (Routes)</button>
          </div>

          {nodeForm && activeTab === 'NODES' && (
            <form onSubmit={saveNode} className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shrink-0 shadow-sm">
              <h3 className="font-extrabold text-emerald-900 text-sm mb-3 border-b border-emerald-200 pb-2">{nodeForm.id ? '✏️ Edit Label Alat' : '➕ Tambah Titik Baru'}</h3>
              <input type="text" value={nodeForm.name} onChange={e=>setNodeForm({...nodeForm, name: e.target.value})} className="w-full p-2.5 text-sm mb-3 rounded-xl border focus:ring-2 focus:ring-emerald-500" placeholder="Nama Kamera / Alat" required />
              <input type="text" value={nodeForm.zone} onChange={e=>setNodeForm({...nodeForm, zone: e.target.value})} className="w-full p-2.5 text-sm mb-3 rounded-xl border focus:ring-2 focus:ring-emerald-500" placeholder="Jalan/Area" required />
              
              <select 
                value={['CAMERA_STD', 'CAMERA_AUDIO', 'NVR', 'PANEL'].includes(nodeForm.device_type) ? nodeForm.device_type : 'CUSTOM'} 
                onChange={e => {
                  if(e.target.value === 'CUSTOM') setNodeForm({...nodeForm, device_type: 'WIRELESS_CAM'});
                  else setNodeForm({...nodeForm, device_type: e.target.value});
                }} 
                className={`w-full p-2.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-500 ${['CAMERA_STD', 'CAMERA_AUDIO', 'NVR', 'PANEL'].includes(nodeForm.device_type) ? 'mb-4' : 'mb-2'}`}
              >
                <option value="CAMERA_STD">Kamera Standard</option>
                <option value="CAMERA_AUDIO">Kamera Audio</option>
                <option value="NVR">Server / NVR</option>
                <option value="PANEL">Panel Distribusi</option>
                <option value="CUSTOM">➕ Ketik Sendiri (Custom)...</option>
              </select>

              {!['CAMERA_STD', 'CAMERA_AUDIO', 'NVR', 'PANEL'].includes(nodeForm.device_type) && (
                <input 
                  type="text" 
                  value={nodeForm.device_type} 
                  onChange={e => setNodeForm({...nodeForm, device_type: e.target.value.toUpperCase().replace(/\s+/g, '_')})} 
                  className="w-full p-2.5 text-sm mb-4 rounded-xl border-2 border-emerald-400 bg-emerald-100 text-emerald-900 font-bold focus:ring-2 focus:ring-emerald-500" 
                  placeholder="Ketik kategori (Contoh: WIRELESS_CAM)" 
                  required autoFocus
                />
              )}

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl transition">Simpan</button>
                <button type="button" onClick={()=>setNodeForm(null)} className="px-4 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-300">Batal</button>
              </div>
            </form>
          )}

          {routeForm && activeTab === 'ROUTES' && (
             <form onSubmit={saveRoute} className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shrink-0 shadow-sm">
               <h3 className="font-extrabold text-emerald-900 text-sm mb-3 border-b border-emerald-200 pb-2">{routeForm.id ? '✏️ Edit Detail Jalur' : '➕ Tambah Jalur Baru'}</h3>
               <input type="text" value={routeForm.zone || ''} onChange={e=>setRouteForm({...routeForm, zone: e.target.value})} className="w-full p-2.5 text-sm mb-3 rounded-xl border" placeholder="Jalan/Area" required />
               <select value={routeForm.cable_type} onChange={e=>setRouteForm({...routeForm, cable_type: e.target.value})} className="w-full p-2.5 text-sm mb-4 rounded-xl border">
                 <option value="FIBER_OPTIC">Fiber Optic</option><option value="LAN_UTP">LAN UTP</option><option value="POWER_CABLE">Kabel Listrik Utama</option>
               </select>
               <div className="flex gap-2">
                 <button type="submit" className="flex-1 bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl">Simpan</button>
                 <button type="button" onClick={()=>setRouteForm(null)} className="px-4 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl">Batal</button>
               </div>
             </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b bg-gray-50 shrink-0 flex justify-between items-center">
               <div>
                 <h3 className="font-bold text-gray-700 text-sm">Data di {activePreset}</h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">Hanya menampilkan alat pada preset ini.</p>
               </div>
            </div>
            <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
              {activeTab === 'NODES' ? displayNodes.map(n => (
                <div key={n.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{n.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{n.device_type.replace(/_/g, ' ')} • {n.zone}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setNodeForm(n)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Edit</button>
                    <button onClick={async () => { if(confirm('Hapus alat ini?')) { await supabase.from('cctv_nodes').delete().eq('id', n.id); fetchData(); } }} className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1.5 rounded-lg border border-red-100">X</button>
                  </div>
                </div>
              )) : displayRoutes.map(r => (
                <div key={r.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{r.cable_type.replace('_', ' ')}</p>
                    {/* MENAMPILKAN JARAK PADA LIST KABEL */}
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {r.zone || 'Belum ada zona'} • <span className="text-emerald-600 font-bold">{formatDistance(calculateDistance(r.path_coordinates))}</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setRouteForm(r)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Edit</button>
                    <button onClick={async () => { if(confirm('Hapus jalur ini?')) { await supabase.from('cctv_routes').delete().eq('id', r.id); fetchData(); } }} className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1.5 rounded-lg border border-red-100">X</button>
                  </div>
                </div>
              ))}
              
              {(activeTab === 'NODES' && displayNodes.length === 0) || (activeTab === 'ROUTES' && displayRoutes.length === 0) ? (
                <div className="text-center p-6 text-gray-400 text-sm font-medium">Belum ada data di preset ini.</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="lg:col-span-8 bg-white p-2 rounded-3xl shadow-lg border border-gray-200 relative h-[80vh]">
           <AdminMapEditor activeTab={activeTab} nodes={displayNodes} routes={displayRoutes} onDataChanged={fetchData} onAddNewNode={triggerNewNodeForm} onAddNewRoute={triggerNewRouteForm} />
        </div>

      </div>
    </div>
  );
}