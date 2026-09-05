'use client'

import { useState, useEffect } from 'react'
import { getSyncHistory, triggerManualSync } from './actions'

export default function SyncPage() {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const loadHistory = async () => {
    const data = await getSyncHistory()
    setHistory(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleManualSync = async () => {
    setIsSyncing(true)
    setMessage(null)
    
    // Mengambil origin domain saat ini (berfungsi baik di localhost maupun Vercel)
    const baseUrl = window.location.origin
    const result = await triggerManualSync(baseUrl)

    if (result.success) {
      setMessage({ text: result.message, type: 'success' })
    } else {
      setMessage({ text: result.error || 'Terjadi kesalahan saat sync.', type: 'error' })
    }

    await loadHistory() // Refresh tabel riwayat
    setIsSyncing(false)
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Data Supplier</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistem otomatis terhubung ke Google Sheets setiap jam 12:00 siang.
          </p>
        </div>
        
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Menarik Data...
            </>
          ) : (
            'Sync Manual Sekarang'
          )}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <th className="py-3 px-4 font-medium">Waktu Sinkronisasi</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-center">Total Item Ditarik</th>
              <th className="py-3 px-4 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Memuat riwayat...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Belum ada riwayat sinkronisasi.</td></tr>
            ) : (
              history.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {new Date(record.started_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4">
                    {record.status === 'completed' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Berhasil</span>
                    ) : record.status === 'syncing' ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Proses</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Gagal</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-700">{record.total_items || 0}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{record.error_log || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}