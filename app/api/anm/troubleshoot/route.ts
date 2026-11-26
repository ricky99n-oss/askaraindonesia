import { readJson, response, failure } from '@/lib/anm/commerce-security'
export const runtime = 'edge'

// The Edge Function owns JWT, verified-email, installation-license and rate checks.
export async function POST(request: Request) {
  try {
    const body = await readJson(request)
    const result = await fetch(`${process.env.ANM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/anm-troubleshoot`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        authorization: request.headers.get('authorization') || '',
        'x-anm-device-id': request.headers.get('x-anm-device-id') || '',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(50000),
    })
    return response(await result.json(), result.status)
  } catch (error) { return failure(error) }
}
