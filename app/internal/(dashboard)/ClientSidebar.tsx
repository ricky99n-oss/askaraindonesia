'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ClientSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Deteksi jika browser mendukung instalasi PWA
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  const closeMenu = () => setIsOpen(false)

  const navLinks = [
    { name: 'Estimator', href: '/internal/dashboard' },
    { name: 'Riwayat Dokumen', href: '/internal/history' },
    { name: 'Data Supplier', href: '/internal/sync' },
    { name: 'Pengaturan', href: '/internal/settings' },
  ]

  return (
    <>
      {/* HEADER MOBILE (Hanya muncul di HP) */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center print:hidden z-30 sticky top-0">
        <div className="text-xl font-bold tracking-tight">Askara Internal</div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 focus:outline-none bg-gray-800 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* OVERLAY GELAP (Saat menu terbuka di HP) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={closeMenu} />
      )}

      {/* SIDEBAR UTAMA */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-white p-6 flex flex-col space-y-4 z-30 transition-transform duration-300 print:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="text-2xl font-bold mb-6 hidden md:block">Askara Internal</div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={closeMenu}
              className={`block px-4 py-2.5 rounded-lg transition-colors font-medium ${
                pathname === link.href ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          {isInstallable && (
            <button 
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-3 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Install ke Perangkat
            </button>
          )}
          
          <div className="text-xs font-mono text-gray-500 bg-gray-950/50 p-3 rounded-lg text-center border border-gray-800">
            Role: <span className="text-blue-400 font-semibold">{role.toUpperCase()}</span>
          </div>
        </div>
      </aside>
    </>
  )
}