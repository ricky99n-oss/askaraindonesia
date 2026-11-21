'use client'
import { useEffect, useRef, useState } from 'react'
import { consumeEmailLink, createEmailAuthClient } from '@/lib/anm/email-auth'

export default function VerifiedAnm() {
  const [auth] = useState(createEmailAuthClient)
  const verification = useRef<Promise<boolean> | null>(null)
  const [message, setMessage] = useState('Memeriksa tautan verifikasi...')
  useEffect(() => {
    let active = true
    if (!verification.current) {
      const link = consumeEmailLink()
      verification.current = (async () => {
        if (link.error) return false
        if (link.token && (link.type === 'signup' || link.type === 'email')) {
          const { data, error } = await auth.auth.verifyOtp({ token_hash: link.token, type: 'signup' })
          if (error || !data.user?.email_confirmed_at) return false
          await auth.auth.signOut({ scope: 'local' })
          return true
        }
        if (link.access) {
          const { data, error } = await auth.auth.getUser(link.access)
          return !error && !!data.user?.email_confirmed_at
        }
        return false
      })().catch(() => false)
    }
    verification.current.then(valid => {
      if (active) setMessage(valid ? 'Email berhasil diverifikasi. Kembali ke aplikasi, masuk dengan email dan password, lalu aktifkan license key dari Askara.' : 'Tautan tidak valid, sudah dipakai, atau kedaluwarsa. Jika sebelumnya sudah diverifikasi, coba masuk melalui aplikasi. Untuk akun baru, minta ulang email verifikasi atau hubungi admin Askara.')
    })
    return () => { active = false }
  }, [auth])
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white"><div className="w-full max-w-lg space-y-5 rounded-2xl border border-purple-700 bg-slate-900 p-8"><p className="text-sm uppercase tracking-widest text-purple-300">Askara Network Monitoring</p><h1 className="text-3xl font-bold">Verifikasi email</h1><p role="status" className="text-base leading-relaxed text-slate-300">{message}</p></div></main>
}
