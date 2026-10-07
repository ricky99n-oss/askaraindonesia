import { createClient } from '@supabase/supabase-js'

export const RUANG_BOCAH_ADMIN_WA = '6285815999953'

export const RUANG_BOCAH_PACKAGES = {
  PREMIUM30: {
    code: 'PREMIUM30',
    name: 'Ruang Bocah Premium (30 Hari)',
    amount: 49_000,
    coinBonus: 50,
    premiumDays: 30,
  },
  COIN50: {
    code: 'COIN50',
    name: 'Top Up 50 Koin Ruang Bocah',
    amount: 50_000,
    coinBonus: 50,
    premiumDays: 0,
  },
  COIN100: {
    code: 'COIN100',
    name: 'Top Up 100 Koin Ruang Bocah',
    amount: 95_000,
    coinBonus: 100,
    premiumDays: 0,
  },
  COIN250: {
    code: 'COIN250',
    name: 'Top Up 250 Koin Ruang Bocah',
    amount: 220_000,
    coinBonus: 250,
    premiumDays: 0,
  },
  COIN500: {
    code: 'COIN500',
    name: 'Top Up 500 Koin Ruang Bocah',
    amount: 400_000,
    coinBonus: 500,
    premiumDays: 0,
  },
} as const

export type RuangBocahPackageCode = keyof typeof RUANG_BOCAH_PACKAGES

export function isRuangBocahPackageCode(value: unknown): value is RuangBocahPackageCode {
  return typeof value === 'string' && value in RUANG_BOCAH_PACKAGES
}

export function createRuangBocahAdminClient() {
  const url = process.env.RUANG_BOCAH_SUPABASE_URL
  const key = process.env.RUANG_BOCAH_SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Konfigurasi Supabase Ruang Bocah belum lengkap')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createRuangBocahReference(userId: string, packageCode: RuangBocahPackageCode) {
  return `RBM|${userId}|${packageCode}|${Date.now()}`
}

export function parseRuangBocahReference(referenceId: string) {
  const [prefix, userId, packageCode] = referenceId.split('|')
  if (prefix !== 'RBM' || !userId || !isRuangBocahPackageCode(packageCode)) {
    throw new Error('Reference transaksi Ruang Bocah tidak valid')
  }

  return { userId, packageCode }
}
