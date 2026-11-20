'use client'
import { useEffect, useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function AnmResetPassword() {
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Buka halaman ini dari tautan pemulihan email Askara.')
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') { setReady(true); setMessage('Masukkan password baru minimal 12 karakter.') }
    })
    return () => subscription.unsubscribe()
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true)
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    if (password.length < 12 || password !== form.get('confirm')) { setMessage('Password minimal 12 karakter dan konfirmasi harus sama.'); setBusy(false); return }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage('Pemulihan gagal. Gunakan tautan terbaru atau minta ulang dari aplikasi.')
    else { await supabase.auth.signOut(); setReady(false); setMessage('Password berhasil diubah. Silakan masuk kembali melalui aplikasi Askara Network Monitoring.') }
    setBusy(false)
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"><p className="text-sm uppercase tracking-widest text-purple-300">Askara Network Monitoring</p><h1 className="text-3xl font-bold">Pemulihan password</h1><p role="status" className="text-base text-slate-300">{message}</p>{ready && <><label className="block text-sm">Password baru<input name="password" type="password" required minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-base" /></label><label className="block text-sm">Konfirmasi password<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-base" /></label><button disabled={busy} className="w-full rounded-xl bg-purple-500 p-3 text-base font-semibold disabled:opacity-50">{busy ? 'Menyimpan…' : 'Simpan password'}</button></>}</form></main>
}
