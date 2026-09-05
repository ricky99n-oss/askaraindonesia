'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveDocumentRecord } from './actions'

type CartItem = { id: string; sku: string; name: string; category: string; qty: number; selling_price: number }
type CompanyProfile = { address: string; phone: string; email: string; bankName: string; bankAccount: string; bankOwner: string; signatureName: string }

export default function PrintInvoicePage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  // Konfigurasi Dokumen
  const [docType, setDocType] = useState<'penawaran' | 'invoice'>('penawaran')
  const [clientName, setClientName] = useState('Bpk/Ibu ...')
  const [clientLocation, setClientLocation] = useState('Malang, Jawa Timur')
  const [projectName, setProjectName] = useState('Instalasi ...')
  const [date, setDate] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('INV/2026/0102')

  // Profil Default (Akan ditimpa oleh localStorage jika ada)
  const [profile, setProfile] = useState<CompanyProfile>({
    address: 'Jl. Sukarno Hatta No.83 Ruko Kav.e Malang',
    phone: '089 6810 11 618',
    email: 'askaraindonesiacompany@gmail.com',
    bankName: 'BCA',
    bankAccount: '0190702197',
    bankOwner: 'Yohanes Vianey Riki Nugroho',
    signatureName: 'I Gusti Ngurah'
  })

  useEffect(() => {
    setIsMounted(true)
    const draft = localStorage.getItem('askara_draft_invoice')
    if (draft) setItems(JSON.parse(draft))
    
    const savedProfile = localStorage.getItem('askara_company_profile')
    if (savedProfile) setProfile(JSON.parse(savedProfile))
    
    setDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  if (!isMounted) return null
  const total = items.reduce((sum, item) => sum + (item.selling_price * item.qty), 0)

  return (
    <div className="max-w-[210mm] mx-auto bg-gray-100 print:bg-white pb-10 print:pb-0">
      
      {/* KONTROL CETAK (Sembunyi saat diprint) */}
      <div className="print:hidden mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-300 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Persiapan Dokumen</h2>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">&larr; Kembali</button>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <button onClick={() => setDocType('penawaran')} className={`flex-1 py-2 rounded border ${docType === 'penawaran' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600'}`}>Format Penawaran</button>
          <button onClick={() => setDocType('invoice')} className={`flex-1 py-2 rounded border ${docType === 'invoice' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600'}`}>Format Invoice</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kepada (Nama Klien)</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-2 border rounded outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lokasi / Instansi</label>
            <input type="text" value={clientLocation} onChange={e => setClientLocation(e.target.value)} className="w-full p-2 border rounded outline-none" />
          </div>
          {docType === 'penawaran' ? (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nama Proyek</label>
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full p-2 border rounded outline-none" />
            </div>
          ) : (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nomor Invoice</label>
              <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full p-2 border rounded outline-none" />
            </div>
          )}
        </div>
        <button 
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true)
            await saveDocumentRecord({
              document_number: docType === 'invoice' ? invoiceNumber : `PNW-${new Date().getTime()}`,
              document_type: docType,
              client_name: clientName,
              project_name: docType === 'penawaran' ? projectName : '-',
              total_amount: total,
              items: items
            })
            setIsSaving(false)
            window.print()
          }} 
          className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
        >
          {isSaving ? 'Menyimpan Arsip...' : 'Simpan & Cetak PDF (Gunakan Kertas A4 & Hilangkan Margin)'}
        </button>
      </div>

      {/* =====================================================================================
          KERTAS A4 DOKUMEN 
      ===================================================================================== */}
      <div className="bg-white p-[15mm] print:p-0 shadow-sm print:shadow-none min-h-[297mm] text-gray-900 text-sm font-sans relative">
        
        {/* HEADER BERSAMA */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tighter mb-1">ASKARA</h1>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tighter mb-2">INDONESIA</h1>
          </div>
          {docType === 'invoice' && (
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-300 tracking-widest uppercase">Invoice</h1>
              <p className="font-semibold text-gray-800 mt-1">{invoiceNumber}</p>
              <p className="text-gray-600">Batu, {date}</p>
            </div>
          )}
        </div>

        {/* PEMBUKA DOKUMEN */}
        {docType === 'penawaran' ? (
          <div className="mb-6">
            <p>Kepada Yth.<br/><strong>{clientName}</strong><br/>{clientLocation}<br/>Di Tempat</p>
            <p className="mt-4">Dengan Hormat,<br/>Berdasarkan pembicaraan sebelumnya, berikut terlampir penawaran sebagai berikut untuk proyek <strong>{projectName}</strong>:</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-600">Kepada Yth.</p>
            <p className="font-bold text-lg">{clientName}</p>
            <p>{clientLocation}</p>
          </div>
        )}

        {/* TABEL ITEM */}
        <table className="w-full text-left text-sm mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 text-gray-900">
              <th className="py-2 px-1 w-1/2">Nama / Deskripsi Barang</th>
              <th className="py-2 px-1 text-center w-16">Jumlah</th>
              <th className="py-2 px-1 text-center w-16">Unit</th>
              <th className="py-2 px-1 text-right w-32">Harga</th>
              <th className="py-2 px-1 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="py-3 px-1">{item.name}</td>
                <td className="py-3 px-1 text-center">{item.qty}</td>
                <td className="py-3 px-1 text-center">{item.sku === 'KABEL' ? 'meter' : (item.sku === 'MANUAL' ? 'paket' : 'pcs')}</td>
                <td className="py-3 px-1 text-right">{formatIDR(item.selling_price)}</td>
                <td className="py-3 px-1 text-right font-medium">{formatIDR(item.selling_price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-900">
              <td colSpan={4} className="py-3 px-1 font-bold text-right text-base">Total</td>
              <td className="py-3 px-1 font-bold text-right text-base">{formatIDR(total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* FOOTER & INFORMASI TAMBAHAN */}
        {docType === 'penawaran' ? (
          // --- STYLE PENAWARAN ---
          <div className="text-xs text-gray-700 leading-relaxed text-justify space-y-4">
            <p>
              Askara Indonesia telah berpengalaman lebih dari 9 tahun dalam hal Instalasi Jaringan & CCTV yang membantu 
              keluhan dalam hal internet baik eksternal maupun internal dan keamanan area secara menyeluruh.
            </p>
            <p>
              Membantu lebih dari 300+ Perusahaan Besar, UMKM, Koperasi, Cafe dll untuk meningkatkan perusahaan dalam 
              persaingan di bidang teknologi.
            </p>
            <p>
              Besar harapan kami untuk dapat diberi kesempatan untuk menjadi partner perusahan Bapak/Ibu. Untuk informasi 
              lebih lanjut dapat menghubungi kami di <strong>{profile.phone}</strong>.
            </p>
            <div className="mt-8 flex justify-between">
              <div>
                <p>Demikian surat penawaran ini kami sampaikan.</p>
                <p>Terimakasih atas perhatian dan kerjasamanya.</p>
              </div>
              <div className="text-center w-48">
                <p className="mb-16">Hormat Kami,</p>
                <p className="font-bold underline">{profile.signatureName}</p>
                <p>Askara Indonesia</p>
              </div>
            </div>
          </div>
        ) : (
          // --- STYLE INVOICE ---
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <h3 className="font-bold text-blue-900 text-base mb-2">Payment</h3>
              <p className="text-gray-600 mb-2">We accept cash or transfer payments</p>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800 font-medium">
                Payment Transfer via {profile.bankName} {profile.bankAccount}<br/>
                a.n {profile.bankOwner}
              </div>
              
              <div className="mt-6 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">Please contact us if you have any questions</p>
                <p>Email: {profile.email}</p>
                <p>Telepon: {profile.phone}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-end">
              <div className="text-center w-full">
                <p className="mb-20 font-medium">Askara Indonesia</p>
                <p className="font-bold border-b border-gray-400 inline-block px-4 pb-1">{profile.signatureName}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}