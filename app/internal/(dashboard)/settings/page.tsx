'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [margin, setMargin] = useState<number>(20)
  
  // State Profil Perusahaan (Sesuai data invoice & penawaran standar)
  const [profile, setProfile] = useState({
    address: 'Jl. Sukarno Hatta No.83 Ruko Kav.e Malang',
    phone: '089 6810 11 618',
    email: 'askaraindonesiacompany@gmail.com',
    bankName: 'BCA',
    bankAccount: '0190702197',
    bankOwner: 'Yohanes Vianey Riki Nugroho',
    signatureName: 'I Gusti Ngurah'
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedMargin = localStorage.getItem('askara_profit_margin')
    if (savedMargin) setMargin(Number(savedMargin))

    const savedProfile = localStorage.getItem('askara_company_profile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const saveSettings = () => {
    localStorage.setItem('askara_profit_margin', margin.toString())
    localStorage.setItem('askara_company_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pengaturan Sistem & Profil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Kolom 1: Estimator */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b pb-2">Estimator</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Profit Margin (%)</label>
            <input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-32 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Kolom 2: Info Kontak & Bank */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium border-b pb-2">Profil & Kontak Dokumen</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alamat Kantor</label>
            <input type="text" name="address" value={profile.address} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telepon / WhatsApp</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="text" name="email" value={profile.email} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" />
            </div>
          </div>
          
          <h2 className="text-lg font-medium border-b pb-2 pt-4">Data Rekening Pembayaran</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nama Bank</label>
              <input type="text" name="bankName" value={profile.bankName} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">No. Rekening</label>
              <input type="text" name="bankAccount" value={profile.bankAccount} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Atas Nama (A/N)</label>
            <input type="text" name="bankOwner" value={profile.bankOwner} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nama Penandatangan Dokumen</label>
            <input type="text" name="signatureName" value={profile.signatureName} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center space-x-4">
        <button onClick={saveSettings} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          Simpan Pengaturan
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">Berhasil disimpan!</span>}
      </div>
    </div>
  )
}