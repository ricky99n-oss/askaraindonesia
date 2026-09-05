import { createInternalServerClient } from '@/lib/internal/supabase/server'

export default async function HistoryPage() {
  const supabase = await createInternalServerClient()
  
  const { data: documents } = await supabase
    .from('askara_internal_documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Riwayat Dokumen (Arsip)</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b-2 border-gray-200">
              <th className="py-3 px-4 font-medium">Tanggal</th>
              <th className="py-3 px-4 font-medium">Jenis</th>
              <th className="py-3 px-4 font-medium">No. Dokumen</th>
              <th className="py-3 px-4 font-medium">Klien</th>
              <th className="py-3 px-4 font-medium text-right">Total Nilai</th>
            </tr>
          </thead>
          <tbody>
            {!documents || documents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Belum ada dokumen yang dicetak.</td></tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(doc.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${doc.document_type === 'invoice' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {doc.document_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{doc.document_number}</td>
                  <td className="py-3 px-4 text-gray-800">{doc.client_name} <br/><span className="text-xs text-gray-500">{doc.project_name}</span></td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">{formatIDR(doc.total_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}