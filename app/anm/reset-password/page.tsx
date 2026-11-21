'use client'
import { useEffect, useRef, useState, FormEvent } from 'react'
import { consumeEmailLink, createEmailAuthClient } from '@/lib/anm/email-auth'
export default function AnmResetPassword() {
  const [auth] = useState(createEmailAuthClient)
  const verification = useRef<Promise<boolean> | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Memeriksa tautan pemulihan...')
  useEffect(() => {
    let active = true
    if (!verification.current) {
      const link = consumeEmailLink()
      verification.current = (async () => {
        if (link.error || link.type !== 'recovery') return false
        if (link.token) {
          const { data, error } = await auth.auth.verifyOtp({ token_hash: link.token, type: 'recovery' })
          return !error && !!data.session
        }
        if (link.access && link.refresh) {
          const { data, error } = await auth.auth.setSession({ access_token: link.access, refresh_token: link.refresh })
          return !error && !!data.session
        }
        return false
      })().catch(() => false)
    }
    verification.current.then(valid => {
      if (!active) return
      setReady(valid)
      setMessage(valid ? 'Masukkan password baru minimal 12 karakter.' : 'Tautan tidak valid, sudah dipakai, atau kedaluwarsa. Minta tautan baru melalui Lupa password di aplikasi.')
    })
    return () => { active = false }
  }, [auth])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !ready) return
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    if (password.length < 12 || password !== form.get('confirm')) { setMessage('Password minimal 12 karakter dan konfirmasi harus sama.'); return }
    setBusy(true)
    try {
      const { error } = await auth.auth.updateUser({ password })
      if (error) { setMessage('Pemulihan gagal. Gunakan password berbeda atau minta tautan terbaru dari aplikasi.'); return }
      await auth.auth.signOut({ scope: 'local' })
      setReady(false)
      setMessage('Password berhasil diubah. Silakan masuk kembali melalui aplikasi Askara Network Monitoring.')
    } catch { setMessage('Layanan tidak dapat dihubungi. Periksa internet lalu coba lagi.') }
    finally { setBusy(false) }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"><p className="text-sm uppercase tracking-widest text-purple-300">Askara Network Monitoring</p><h1 className="text-3xl font-bold">Pemulihan password</h1><p role="status" className="text-base text-slate-300">{message}</p>{ready && <><label className="block text-sm">Password baru<input name="password" type="password" required minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-base" /></label><label className="block text-sm">Konfirmasi password<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-base" /></label><button disabled={busy} className="w-full rounded-xl bg-purple-500 p-3 text-base font-semibold disabled:opacity-50">{busy ? 'Menyimpan…' : 'Simpan password'}</button></>}</form></main>
}
