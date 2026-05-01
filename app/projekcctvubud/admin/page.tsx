'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient'; 

// Import editor peta dengan tipe props baru
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

  // State Form Dinamis (Bisa untuk Tambah Baru ATAU Edit)
  const [nodeForm, setNodeForm] = useState<any>(null);
  const [routeForm, setRouteForm] = useState<any>(null);

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

  // ================= TRIGGER DARI PETA =================
  const triggerNewNodeForm = (lat: string, lng: string) => {
    setActiveTab('NODES');
    setNodeForm({ id: '', name: '', zone: 'Jl. Sri Wedari', device_type: 'CAMERA_STD', latitude: lat, longitude: lng });
  };

  const triggerNewRouteForm = (coords: any[]) => {
    setActiveTab('ROUTES');
    setRouteForm({ id: '', cable_type: 'FIBER_OPTIC', path_coordinates: coords });
  };

  // ================= FUNGSI SIMPAN KE DB =================
  const saveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeForm.id) {
      // Mode Edit
      await supabase.from('cctv_nodes').update({ name: nodeForm.name, zone: nodeForm.zone, device_type: nodeForm.device_type }).eq('id', nodeForm.id);
    } else {
      // Mode Tambah Baru
      await supabase.from('cctv_nodes').insert([{ name: nodeForm.name, zone: nodeForm.zone, device_type: nodeForm.device_type, latitude: parseFloat(nodeForm.latitude), longitude: parseFloat(nodeForm.longitude) }]);
    }
    setNodeForm(null); // Tutup form
    fetchData(); // Refresh Data
  };

  const saveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (routeForm.id) {
      await supabase.from('cctv_routes').update({ cable_type: routeForm.cable_type }).eq('id', routeForm.id);
    } else {
      await supabase.from('cctv_routes').insert([{ cable_type: routeForm.cable_type, path_coordinates: routeForm.path_coordinates }]);
    }
    setRouteForm(null);
    fetchData();
  };

  if (!isMounted) return null;
  if (!isLoggedIn) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
           <h1 className="text-2xl font-extrabold text-emerald-800 tracking-tight mb-8 text-center">Login Admin CCTV</h1>
           {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border">{loginError}</div>}
           <form onSubmit={handleLogin} className="flex flex-col gap-5">
             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 border rounded-xl" placeholder="Username" required />
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border rounded-xl" placeholder="Password" required />
             <button type="submit" className="bg-emerald-700 text-white font-bold py-3.5 rounded-xl">MASUK</button>
           </form>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin Visual Editor</h1>
          <p className="text-xs text-gray-500 font-medium">Infrastruktur CCTV Ubud</p>
        </div>
        <button onClick={() => { sessionStorage.clear(); setIsLoggedIn(false); }} className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-xl text-xs hover:bg-red-100 border border-red-200">Logout</button>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= PANEL KIRI ================= */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-[80vh]">
          {/* Tabs */}
          <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-gray-200 shrink-0">
            <button onClick={() => { setActiveTab('NODES'); setNodeForm(null); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'NODES' ? 'bg-emerald-700 text-white' : 'text-gray-500'}`}>📍 Titik (Nodes)</button>
            <button onClick={() => { setActiveTab('ROUTES'); setRouteForm(null); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'ROUTES' ? 'bg-emerald-700 text-white' : 'text-gray-500'}`}>〰️ Jalur (Routes)</button>
          </div>

          {/* Form Node (Muncul untuk Tambah Baru ATAU Edit) */}
          {nodeForm && activeTab === 'NODES' && (
            <form onSubmit={saveNode} className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shrink-0 shadow-sm">
              <h3 className="font-extrabold text-emerald-900 text-sm mb-3 border-b border-emerald-200 pb-2">
                {nodeForm.id ? '✏️ Edit Label Alat' : '➕ Tambah Titik Baru'}
              </h3>
              <input type="text" value={nodeForm.name} onChange={e=>setNodeForm({...nodeForm, name: e.target.value})} className="w-full p-2.5 text-sm mb-3 rounded-xl border focus:ring-2 focus:ring-emerald-500" placeholder="Nama Kamera / Alat" required />
              <input type="text" value={nodeForm.zone} onChange={e=>setNodeForm({...nodeForm, zone: e.target.value})} className="w-full p-2.5 text-sm mb-3 rounded-xl border focus:ring-2 focus:ring-emerald-500" placeholder="Jalan/Area" required />
              <select value={nodeForm.device_type} onChange={e=>setNodeForm({...nodeForm, device_type: e.target.value})} className="w-full p-2.5 text-sm mb-4 rounded-xl border focus:ring-2 focus:ring-emerald-500">
                <option value="CAMERA_STD">Kamera Standard</option><option value="CAMERA_AUDIO">Kamera Audio</option><option value="NVR">Server / NVR</option><option value="PANEL">Panel Distribusi</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl transition">Simpan Titik</button>
                <button type="button" onClick={()=>setNodeForm(null)} className="px-4 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-300">Batal</button>
              </div>
            </form>
          )}

          {/* Form Route (Muncul untuk Tambah Baru ATAU Edit) */}
          {routeForm && activeTab === 'ROUTES' && (
             <form onSubmit={saveRoute} className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shrink-0 shadow-sm">
               <h3 className="font-extrabold text-emerald-900 text-sm mb-3 border-b border-emerald-200 pb-2">
                 {routeForm.id ? '✏️ Edit Jenis Jalur' : '➕ Tambah Jalur Baru'}
               </h3>
               <select value={routeForm.cable_type} onChange={e=>setRouteForm({...routeForm, cable_type: e.target.value})} className="w-full p-2.5 text-sm mb-4 rounded-xl border focus:ring-2 focus:ring-emerald-500">
                 <option value="FIBER_OPTIC">Fiber Optic</option><option value="LAN_UTP">LAN UTP</option><option value="POWER_CABLE">Kabel Listrik Utama</option>
               </select>
               <div className="flex gap-2">
                 <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl transition">Simpan Jalur</button>
                 <button type="button" onClick={()=>setRouteForm(null)} className="px-4 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-300">Batal</button>
               </div>
             </form>
          )}

          {/* List Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b bg-gray-50 shrink-0 flex justify-between items-center">
               <div>
                 <h3 className="font-bold text-gray-700 text-sm">Daftar {activeTab === 'NODES' ? 'Titik Alat' : 'Jalur Kabel'}</h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">Drag di peta untuk geser. Klik Hapus (Gunting) di peta untuk hapus.</p>
               </div>
            </div>
            <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
              {activeTab === 'NODES' ? nodes.map(n => (
                <div key={n.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{n.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{n.device_type} • {n.zone}</p>
                  </div>
                  <button onClick={() => setNodeForm(n)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition">Edit Info</button>
                </div>
              )) : routes.map(r => (
                <div key={r.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center">
                  <p className="font-bold text-sm text-gray-800">{r.cable_type.replace('_', ' ')}</p>
                  <button onClick={() => setRouteForm(r)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition">Edit Info</button>
                </div>
              ))}
              
              {(activeTab === 'NODES' && nodes.length === 0) || (activeTab === 'ROUTES' && routes.length === 0) ? (
                <div className="text-center p-6 text-gray-400 text-sm font-medium">Belum ada data.<br/>Gunakan alat gambar di peta untuk mulai.</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ================= PANEL KANAN ================= */}
        <div className="lg:col-span-8 bg-white p-2 rounded-3xl shadow-lg border border-gray-200 relative h-[80vh]">
           <AdminMapEditor 
              activeTab={activeTab} 
              nodes={nodes} 
              routes={routes} 
              onDataChanged={fetchData} 
              onAddNewNode={triggerNewNodeForm} 
              onAddNewRoute={triggerNewRouteForm} 
           />
        </div>

      </div>
    </div>
  );
}