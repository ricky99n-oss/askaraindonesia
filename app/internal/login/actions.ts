'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createInternalServerClient } from '@/lib/internal/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('remember_me') === 'on'
  
  const supabase = await createInternalServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/internal/login?message=' + encodeURIComponent(error.message))
  }

  // Jika tidak dicentang, kita bisa menerapkan logika penghentian sesi di middleware, 
  // namun secara standar SSR cookies akan mengikuti opsi sesi browser.
  if (!rememberMe) {
     // Placeholder untuk custom maxAge session override jika dibutuhkan nantinya
  }

  revalidatePath('/internal', 'layout')
  redirect('/internal/dashboard')
}