import { createClient } from '@supabase/supabase-js'

export const RUANG_BOCAH_ADMIN_WA = '6285815999953'
export const RUANG_BOCAH_APP_VERSION = process.env.RUANG_BOCAH_APP_VERSION?.trim() || '1.9.2'

export async function sendRuangBocahPush(input: {
  userIds: string[]; title: string; message: string; type: string; version?: string; broadcast?: boolean
}) {
  const apiKey = process.env.ONESIGNAL_REST_API_KEY?.trim()
  const appId = process.env.ONESIGNAL_APP_ID?.trim() || '48a05f5f-216d-41b9-9ae1-a3f528fe5683'
  if (!apiKey) throw new Error('ONESIGNAL_REST_API_KEY belum dikonfigurasi')
  let subscriptionIds: string[] = []
  if (input.broadcast) {
    let offset = 0
    while (true) {
      const listResponse = await fetch(`https://api.onesignal.com/players?app_id=${appId}&limit=300&offset=${offset}`, {
        headers: { Authorization: `Key ${apiKey}` },
      })
      if (!listResponse.ok) throw new Error(`OneSignal gagal membaca perangkat (${listResponse.status})`)
      const list = await listResponse.json() as {
        total_count?: number
        players?: Array<{ id?: string; identifier?: string; invalid_identifier?: boolean }>
      }
      subscriptionIds.push(...(list.players ?? [])
        .filter((player) => player.id && player.identifier && !player.invalid_identifier)
        .map((player) => player.id as string))
      offset += list.players?.length ?? 0
      if (!list.players?.length || offset >= Number(list.total_count ?? 0)) break
    }
    subscriptionIds = [...new Set(subscriptionIds)]
    if (subscriptionIds.length === 0) throw new Error('Belum ada perangkat aktif yang berlangganan push notification')
  }
  const targets = input.broadcast ? subscriptionIds : input.userIds
  let accepted = 0
  const invalidAliases: string[] = []
  for (let index = 0; index < targets.length; index += 2000) {
    const batch = targets.slice(index, index + 2000)
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        ...(input.broadcast
          ? { include_subscription_ids: batch }
          : { include_aliases: { external_id: batch } }),
        target_channel: 'push',
        headings: { en: input.title, id: input.title },
        contents: { en: input.message, id: input.message },
        data: {
          type: input.type,
          version: input.version || '',
          update_url: input.type === 'app_update'
            ? 'https://askaraindonesia.com/ruangbocah'
            : '',
        },
        url: input.type === 'app_update' ? 'https://askaraindonesia.com/ruangbocah' : undefined,
        buttons: input.type === 'app_update' ? [{ id: 'install_update', text: 'Download & install' }] : undefined,
        existing_android_channel_id: 'ruang_bocah_alerts_v4',
        android_sound: 'ruangbocah_notification',
        ios_sound: 'ruangbocah-notification.mp3',
      }),
    })
    if (!response.ok) throw new Error(`OneSignal gagal (${response.status}): ${await response.text()}`)
    const result = await response.json() as { id?: string; recipients?: number; errors?: { invalid_aliases?: Record<string, string[]> } | string[] }
    if (!result.id) throw new Error(`OneSignal tidak menerima pesan: ${JSON.stringify(result.errors || 'unknown error')}`)
    accepted += Number(result.recipients ?? batch.length)
    const aliases = result.errors && !Array.isArray(result.errors) ? result.errors.invalid_aliases?.external_id : undefined
    if (aliases) invalidAliases.push(...aliases)
  }
  return { accepted, invalidAliases: invalidAliases.length }
}

export const RUANG_BOCAH_PACKAGES = {
  ACCESS6: {
    code: 'ACCESS6',
    name: 'Paket Hemat Ruang Bocah 3 Bulan',
    amount: 99_000,
    coinBonus: 50,
    premiumDays: 90,
  },
  ACCESS8: {
    code: 'ACCESS8',
    name: 'Paket Keluarga Ruang Bocah 6 Bulan',
    amount: 149_000,
    coinBonus: 100,
    premiumDays: 180,
  },
  ACCESS12: {
    code: 'ACCESS12',
    name: 'Akses Ruang Bocah 12 Bulan',
    amount: 180_000,
    coinBonus: 150,
    premiumDays: 365,
  },
  COIN20: {
    code: 'COIN20',
    name: 'Top Up 20 Koin Ruang Bocah',
    amount: 20_000,
    coinBonus: 20,
    premiumDays: 0,
  },
  COIN80: {
    code: 'COIN80',
    name: 'Top Up 80 Koin Ruang Bocah',
    amount: 49_000,
    coinBonus: 80,
    premiumDays: 0,
  },
  // Paket lama dipertahankan agar transaksi yang sudah dibuat tetap dapat
  // diproses dari dashboard admin. Paket ini tidak lagi ditampilkan ke user.
  INITIAL_ACCESS: {
    code: 'INITIAL_ACCESS',
    name: 'Akses Awal Ruang Bocah (30 Hari)',
    amount: 99_000,
    coinBonus: 50,
    premiumDays: 30,
  },
  PREMIUM30: {
    code: 'PREMIUM30',
    name: 'Perpanjangan Ruang Bocah (30 Hari)',
    amount: 49_000,
    coinBonus: 50,
    premiumDays: 30,
  },
  COIN50: {
    code: 'COIN50',
    name: 'Top Up 50 Koin Ruang Bocah',
    amount: 69_000,
    coinBonus: 50,
    premiumDays: 0,
  },
  COIN100: {
    code: 'COIN100',
    name: 'Top Up 100 Koin Ruang Bocah',
    amount: 90_000,
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

export const RUANG_BOCAH_ACCESS_CODES = ['ACCESS6', 'ACCESS8', 'ACCESS12', 'INITIAL_ACCESS', 'PREMIUM30'] as const
export const RUANG_BOCAH_PURCHASABLE_CODES = ['ACCESS6', 'ACCESS8', 'ACCESS12', 'COIN50', 'COIN100'] as const

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
