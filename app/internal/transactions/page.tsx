'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (!error && data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
    if (!error) {
      alert('Status berhasil diubah!');
      fetchTransactions(); // Refresh data
    } else {
      alert('Gagal merubah status');
    }
  };

  // Menghitung Summary
  const totalOmset = transactions.filter(t => t.status === 'PAID' || t.status === 'DONE').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPending = transactions.filter(t => t.status === 'PENDING').length;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Data Transaksi (Marketplace)</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Transaksi Masuk</div>
          <div className="text-3xl font-bold">{transactions.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Omset (Paid & Done)</div>
          <div className="text-3xl font-bold text-green-600">Rp {totalOmset.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Menunggu Pembayaran (Pending)</div>
          <div className="text-3xl font-bold text-orange-500">{totalPending} Pesanan</div>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="p-4">TANGGAL</th>
                <th className="p-4">REF ID</th>
                <th className="p-4">PRODUK</th>
                <th className="p-4">PELANGGAN</th>
                <th className="p-4">NILAI (RP)</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Belum ada transaksi.</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 text-xs font-mono text-gray-500">{t.reference_id}</td>
                    <td className="p-4 font-semibold">{t.product_name}</td>
                    <td className="p-4">
                      {t.buyer_name}<br/>
                      <span className="text-xs text-gray-400">{t.buyer_phone}</span>
                    </td>
                    <td className="p-4 font-bold">{(Number(t.amount)).toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.status === 'PAID' ? 'bg-green-100 text-green-600' : t.status === 'DONE' ? 'bg-blue-100 text-blue-600' : t.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={t.status} 
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded p-1"
                      >
                        <option value="PENDING">Pending (Belum Bayar)</option>
                        <option value="PAID">Paid (Sudah Dibayar)</option>
                        <option value="DONE">Done (Selesai Diproses)</option>
                        <option value="FAILED">Failed / Batal</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}