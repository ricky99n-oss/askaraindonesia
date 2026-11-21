import { NextResponse } from 'next/server'
export class ShopError extends Error { constructor(public status: number, message: string) { super(message) } }
export function response(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }) }
export function failure(error: unknown) {
  if (error instanceof ShopError) return response({ error: error.message }, error.status)
  const code = error instanceof Error ? error.message : ''
  if (code === 'UNAUTHORIZED') return response({ error: 'Silakan login sebagai admin.' }, 401)
  if (code === 'FORBIDDEN') return response({ error: 'Akses admin diperlukan.' }, 403)
  return response({ error: 'Layanan belum dapat memproses permintaan. Coba lagi atau hubungi Askara.' }, 503)
}
export function checkOrigin(request: Request) {
  const value = request.headers.get('origin') || ''
  let origin: URL
  try { origin = new URL(value) } catch { throw new ShopError(403, 'Permintaan tidak diizinkan.') }
  const host = request.headers.get('host') || new URL(request.url).host
  const local = ['localhost', '127.0.0.1'].includes(origin.hostname)
  if (origin.origin !== value || origin.host !== host || (origin.protocol !== 'https:' && !(local && origin.protocol === 'http:'))) throw new ShopError(403, 'Permintaan tidak diizinkan.')
}
export async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new ShopError(413, 'Ukuran data terlalu besar.')
  const reader = request.body?.getReader()
  if (!reader) throw new ShopError(400, 'Data belum diisi.')
  const chunks: Uint8Array[] = []; let length = 0
  while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > limit) { await reader.cancel(); throw new ShopError(413, 'Ukuran data terlalu besar.') } chunks.push(part.value) }
  const bytes = new Uint8Array(length); let position = 0
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.length }
  return bytes
}
export async function readJson(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ShopError(400, 'Format permintaan tidak sesuai.')
  try { const value = JSON.parse(new TextDecoder().decode(await readBody(request, 12000))); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ShopError(400, 'Data tidak valid.'); return value as Record<string, unknown> }
  catch (error) { if (error instanceof ShopError) throw error; throw new ShopError(400, 'Data tidak valid.') }
}
export function randomToken() { return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
export async function hash(value: string | Uint8Array) { const digest = await crypto.subtle.digest('SHA-256', (typeof value === 'string' ? new TextEncoder().encode(value) : value) as BufferSource); return [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('') }
async function encryptionKey() {
  const encoded = process.env.ANM_COMMERCE_ENCRYPTION_KEY
  if (!encoded) throw new Error('COMMERCE_CONFIGURATION_MISSING')
  const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0))
  if (bytes.length !== 32) throw new Error('COMMERCE_CONFIGURATION_MISSING')
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt'])
}
export async function encrypt(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(), new TextEncoder().encode(value))
  return 'v1.' + btoa(String.fromCharCode(...iv)) + '.' + btoa(String.fromCharCode(...new Uint8Array(cipher)))
}
export async function decrypt(value: string) {
  const [version, nonce, cipher] = value.split('.')
  if (version !== 'v1' || !nonce || !cipher) throw new Error('INVALID_CIPHERTEXT')
  const iv = Uint8Array.from(atob(nonce), c => c.charCodeAt(0)), bytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0))
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await encryptionKey(), bytes))
}
export function checked<T>(result: { data: T; error: { code?: string; message?: string } | null }): T {
  if (!result.error) return result.data
  const code = result.error.message || ''
  const messages: Record<string, [number, string]> = {
    SHOP_NOT_READY: [503, 'Pembelian sedang disiapkan. Hubungi admin Askara.'], INVALID_ORDER: [400, 'Periksa data pesanan.'],
    INVALID_PRODUCT: [400, 'Paket ini tidak tersedia.'], RENEWAL_NOT_AVAILABLE: [400, 'Lisensi, email pembelian, dan paket perpanjangan belum sesuai.'],
    ORDER_RATE_LIMIT: [429, 'Terlalu banyak pesanan. Tunggu satu jam atau hubungi Askara.'], ORDER_NOT_FOUND: [404, 'Pesanan tidak ditemukan.'],
    PROOF_NOT_ALLOWED: [409, 'Bukti sudah dikirim atau batas waktu pembayaran telah berakhir.'], INVALID_PROOF: [400, 'Bukti harus berupa gambar PNG, JPG, atau WebP.'],
    PAYMENT_NOT_READY: [409, 'Bukti pembayaran belum siap diperiksa.'], FORBIDDEN: [403, 'Akses admin diperlukan.'],
  }
  if (messages[code]) throw new ShopError(...messages[code])
  if (result.error.code === '23505') throw new ShopError(409, 'Data atau bukti pembayaran ini sudah digunakan. Periksa pesanan sebelumnya.')
  throw new Error('COMMERCE_DATABASE_OPERATION_FAILED')
}
export function proofType(bytes: Uint8Array) {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return { mime: 'image/png', ext: 'png' }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { mime: 'image/jpeg', ext: 'jpg' }
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') return { mime: 'image/webp', ext: 'webp' }
  throw new ShopError(400, 'Isi file bukan gambar PNG, JPG, atau WebP yang didukung.')
}
