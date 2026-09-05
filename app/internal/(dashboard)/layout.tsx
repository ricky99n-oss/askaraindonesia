import { redirect } from 'next/navigation'
import { createInternalServerClient } from '@/lib/internal/supabase/server'
import ClientSidebar from './ClientSidebar'

export const runtime = 'edge'

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
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md border border-red-100 text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Akses Ditolak</h1>
          <p className="text-sm text-gray-500">
            Akun Anda terdaftar di sistem, tetapi tidak memiliki izin untuk masuk ke area manajerial Askara.
          </p>
          <form action={async () => {
            'use server'
            const sb = await createInternalServerClient()
            await sb.auth.signOut()
            redirect('/internal/login')
          }}>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Keluar & Ganti Akun
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    // Penyesuaian flex-col untuk HP, flex-row untuk Desktop
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 print:bg-white">
      
      {/* Menggunakan Sidebar Dinamis */}
      <ClientSidebar role={teamMember.role} />
      
      {/* Konten Utama (Akan terdorong ke bawah di HP) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible">
        {children}
      </main>
    </div>
  )
}