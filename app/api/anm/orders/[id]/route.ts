import { ownedOrder, publicOrder } from '@/lib/anm/commerce'
import { failure, response } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try { return response(await publicOrder(await ownedOrder(request, (await context.params).id))) }
  catch (error) { return failure(error) }
}
