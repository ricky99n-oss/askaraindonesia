import { createClient } from '@supabase/supabase-js'

// Temporary email sessions must not replace a website/admin login.
export function createEmailAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-placeholder',
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  )
}

export function consumeEmailLink() {
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const query = new URLSearchParams(window.location.search)
  const values = fragment.has('token_hash') || fragment.has('access_token') || fragment.has('error') ? fragment : query
  const link = {
    token: values.get('token_hash'), type: values.get('type'),
    access: values.get('access_token'), refresh: values.get('refresh_token'),
    error: values.get('error') || values.get('error_code'),
  }
  // Remove credentials before network requests or page interaction.
  window.history.replaceState(null, '', window.location.pathname)
  return link
}
