import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createInternalServerClient } from '@/lib/internal/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createInternalServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/internal/login')

  const { data: teamMember } = await supabase
    .from('askara_internal_team')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!teamMember || !teamMember.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        {/* ... (kode blokir akses sama seperti sebelumnya) ... */}
        <h1 className="text-xl font-bold">Akses Ditolak</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-100 print:bg-white">
      {/* Tambahkan print:hidden di sini agar sidebar menghilang saat di-print */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col space-y-4 print:hidden">
        <div className="text-xl font-bold mb-8">Askara Internal</div>
        <nav className="flex-1 space-y-2">
          <Link href="/internal/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">Estimator</Link>
          <Link href="/internal/sync" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">Data Supplier</Link>
          <Link href="/internal/settings" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">Pengaturan</Link>
          <Link href="/internal/history" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white">Riwayat Dokumen</Link>
        </nav>
        <div className="border-t border-gray-700 pt-4 text-xs text-gray-400">
          Role: {teamMember.role.toUpperCase()}
        </div>
      </aside>
      
      {/* Tambahkan print:p-0 print:overflow-visible agar kertas memenuhi layar penuh */}
      <main className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible">
        {children}
      </main>
    </div>
  )
}