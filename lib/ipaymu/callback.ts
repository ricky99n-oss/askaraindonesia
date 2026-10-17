type CallbackValue = string | number | boolean | null | unknown[]

export type IpaymuCallback = Record<string, CallbackValue>

function normalizeValue(key: string, value: FormDataEntryValue | unknown): CallbackValue {
  const text = String(value ?? '')
  if (key === 'additional_info') {
    if (text === '[]' || text === '') return []
    try {
      return JSON.parse(text) as unknown[]
    } catch {
      return text
    }
  }
  if (['trx_id', 'status_code', 'transaction_status_code', 'paid_off'].includes(key)) {
    const parsed = Number.parseInt(text, 10)
    return Number.isNaN(parsed) ? text : parsed
  }
  if (key === 'is_escrow') return text === 'true' || text === '1'
  return value === null || value === undefined ? '' : text
}

function sortPayload(payload: IpaymuCallback) {
  return Object.fromEntries(
    Object.keys(payload)
      .filter((key) => key !== 'signature' && key !== 'x-signature')
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, payload[key]]),
  )
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let result = 0
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return result === 0
}

export async function verifyIpaymuCallback(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''
  let rawPayload: IpaymuCallback
  if (contentType.includes('application/json')) {
    rawPayload = (await request.json()) as IpaymuCallback
  } else {
    const form = await request.formData()
    rawPayload = Object.fromEntries([...form.entries()].map(([key, value]) => [key, value])) as IpaymuCallback
  }

  const payload = Object.fromEntries(
    Object.entries(rawPayload).map(([key, value]) => [key, normalizeValue(key, value)]),
  ) as IpaymuCallback
  if (!Object.hasOwn(payload, 'additional_info')) payload.additional_info = []

  const signature = request.headers.get('x-signature')?.trim().toLowerCase() ?? ''
  const secret = process.env.IPAYMU_VA?.trim() ?? ''
  if (!signature || !secret || !/^[a-f0-9]{64}$/.test(signature)) return { valid: false, payload }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const json = JSON.stringify(sortPayload(payload)).replace(/\//g, '\\/')
  const expected = toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(json)))
  return { valid: safeEqual(expected, signature), payload }
}
