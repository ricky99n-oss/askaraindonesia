import { createInternalServerClient } from '@/lib/internal/supabase/server'

export async function requireInternalMember() {
  const supabase = await createInternalServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  const { data: teamMember } = await supabase
    .from('askara_internal_team')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (!teamMember?.is_active) {
    throw new Error('FORBIDDEN')
  }

  return { user, role: String(teamMember.role ?? 'member') }
}
