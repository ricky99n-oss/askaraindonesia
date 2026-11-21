import { createAnmAdmin } from '@/lib/anm/admin'
import { processOrderTasks } from '@/lib/anm/commerce'
import { checked, hash, response } from '@/lib/anm/commerce-security'
export const runtime = 'edge'
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '') || '', expected = process.env.ANM_ORDER_CRON_SECRET || ''
  if (!expected || !token || await hash(token) !== await hash(expected)) return response({ error: 'Unauthorized' }, 401)
  try {
    const now = new Date().toISOString()
    const tasks = checked(await createAnmAdmin().from('anm_order_tasks').select('order_id').neq('state', 'sent').lt('attempts', 10).or('locked_until.is.null,locked_until.lt.' + now).order('created_at').limit(15)) || []
    const ids = [...new Set(tasks.map(task => task.order_id))].slice(0, 5)
    for (const id of ids) await processOrderTasks(id)
    return response({ ok: true, orders_processed: ids.length })
  } catch { return response({ error: 'Retry unavailable' }, 503) }
}
