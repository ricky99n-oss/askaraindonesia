import { createClient } from '@supabase/supabase-js'
import { requireInternalMember } from '@/lib/internal/authorize'

export async function requireAnmAdmin() {
  const member = await requireInternalMember()
  if (!['owner', 'admin', 'super_admin'].includes(member.role)) throw new Error('FORBIDDEN')
  return member
}
export function createAnmAdmin() {
  const url = process.env.ANM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.ANM_SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('ANM_CONFIGURATION_MISSING')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
export function validateLicense(input: Record<string, unknown>, creating: boolean) {
  const label = String(input.label ?? '').trim()
  const email = String(input.customer_email ?? '').trim().toLowerCase()
  const plan = String(input.plan ?? '')
  const status = String(input.status ?? '')
  const expiry = new Date(String(input.expires_at ?? ''))
  const maxDevices = Number(input.max_devices)
  const maxMonitored = Number(input.max_monitored)
  if (!label || label.length > 120 || !['starter', 'professional', 'enterprise'].includes(plan) ||
      !['active', 'suspended', 'revoked'].includes(status) || Number.isNaN(expiry.getTime()) ||
      !Number.isSafeInteger(maxDevices) || maxDevices < 1 || maxDevices > 100 ||
      !Number.isSafeInteger(maxMonitored) || maxMonitored < 1 || maxMonitored > 4096 ||
      (creating && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254))) {
    throw new Error('INVALID_LICENSE')
  }
  return { label, customer_email: email, plan, status, expires_at: expiry.toISOString(), max_devices: maxDevices, max_monitored: maxMonitored }
}
