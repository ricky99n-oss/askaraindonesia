export type AnmLicense = { id: string; label: string; customer_email: string; user_id: string | null; key_hint: string; plan: string; status: string; expires_at: string; max_devices: number; max_monitored: number }
export type RegisteredUser = { id: string; email: string; display_name: string; created_at: string; email_confirmed_at: string | null; last_sign_in_at: string | null; licenses: AnmLicense[] }
export type RegistrationCounts = { registered: number; unverified: number; without_license: number }
export type RegisteredUsersData = { users: RegisteredUser[]; total: number; page: number; perPage: number; counts: RegistrationCounts }
