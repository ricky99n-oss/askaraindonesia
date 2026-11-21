'use client'
import { useEffect, useRef, useState, FormEvent } from 'react'
import { consumeEmailLink, createEmailAuthClient } from '@/lib/anm/email-auth'
export default function AnmResetPassword() {
  const [auth] = useState(createEmailAuthClient)
  const verification = useRef<Promise<boolean> | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [passwordLength, setPasswordLength] = useState(0)
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
    if (password.length < 12) { setMessage('Password baru masih kurang dari 12 karakter. Tambahkan karakter lalu coba lagi.'); return }
    if (password !== form.get('confirm')) { setMessage('Konfirmasi password belum sama. Ketik ulang persis seperti password baru, termasuk huruf besar/kecil.'); return }
    setBusy(true)
    try {
      const { error } = await auth.auth.updateUser({ password })
      if (error) {
        if (error.code === 'same_password') setMessage('Password baru harus berbeda dari password sebelumnya.')
        else if (error.code === 'weak_password') setMessage('Password belum memenuhi syarat keamanan. Gunakan minimal 12 karakter dengan campuran huruf besar, huruf kecil, dan angka.')
        else { setReady(false); setMessage('Sesi pemulihan sudah berakhir atau tidak berlaku. Minta tautan terbaru melalui Lupa password di aplikasi.') }
        return
      }
      await auth.auth.signOut({ scope: 'local' })
      setReady(false)
      setMessage('Password berhasil diubah. Silakan masuk kembali melalui aplikasi Askara Network Monitoring.')
    } catch { setMessage('Layanan tidak dapat dihubungi. Periksa internet lalu coba lagi.') }
    finally { setBusy(false) }
  }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
    <form noValidate onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-sm uppercase tracking-widest text-purple-300">Askara Network Monitoring</p>
      <h1 className="text-3xl font-bold">Pemulihan password</h1>
      <p role="status" className="text-base text-slate-300">{message}</p>
      {ready && <>
        <div><label htmlFor="anm-password-new" className="block text-sm">Password baru</label>
          <div className="relative mt-2"><input id="anm-password-new" name="password" type={visible ? 'text' : 'password'} onChange={event => setPasswordLength(event.target.value.length)} required minLength={12} autoComplete="new-password" className="w-full rounded-xl bg-slate-800 p-3 pr-14 text-base" />
            <button type="button" aria-label={visible ? 'Sembunyikan password baru' : 'Tampilkan password baru'} aria-controls="anm-password-new" aria-pressed={visible} onClick={() => setVisible(value => !value)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-purple-300 hover:bg-slate-700"><EyeIcon visible={visible} /></button>
          </div><p className="mt-2 text-sm text-slate-400">{passwordLength} karakter, minimal 12.</p>
        </div>
        <div><label htmlFor="anm-password-confirm" className="block text-sm">Konfirmasi password</label>
          <div className="relative mt-2"><input id="anm-password-confirm" name="confirm" type={confirmVisible ? 'text' : 'password'} required minLength={12} autoComplete="new-password" className="w-full rounded-xl bg-slate-800 p-3 pr-14 text-base" />
            <button type="button" aria-label={confirmVisible ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'} aria-controls="anm-password-confirm" aria-pressed={confirmVisible} onClick={() => setConfirmVisible(value => !value)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-purple-300 hover:bg-slate-700"><EyeIcon visible={confirmVisible} /></button>
          </div>
        </div>
        <button disabled={busy} className="w-full rounded-xl bg-purple-500 p-3 text-base font-semibold disabled:opacity-50">{busy ? 'Menyimpan...' : 'Simpan password'}</button>
      </>}
    </form>
  </main>
}

function EyeIcon({ visible }: { visible: boolean }) {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg>
}
