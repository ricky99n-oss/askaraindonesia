'use client'
import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
export default function SecretInput({ label, className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  const [visible, setVisible] = useState(false)
  return <div className="relative"><input {...props} type={visible ? 'text' : 'password'} className={className + ' pr-14'} /><button type="button" aria-label={(visible ? 'Sembunyikan ' : 'Tampilkan ') + label} aria-pressed={visible} onClick={() => setVisible(value => !value)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-purple-500"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg></button></div>
}
