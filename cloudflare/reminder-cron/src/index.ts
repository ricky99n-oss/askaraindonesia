import type { ExecutionContext, ScheduledController } from '@cloudflare/workers-types'

interface Env {
  REMINDER_URL: string
  RUANG_BOCAH_CRON_SECRET: string
}

async function runReminder(env: Env) {
  const response = await fetch(env.REMINDER_URL, {
    headers: { Authorization: `Bearer ${env.RUANG_BOCAH_CRON_SECRET}` },
  })
  const body = await response.text()
  if (!response.ok) throw new Error(`Reminder endpoint ${response.status}: ${body}`)
  return body
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runReminder(env))
  },
  async fetch(request: Request, env: Env) {
    if (new URL(request.url).pathname !== '/health') return new Response('Not found', { status: 404 })
    return Response.json({ ok: true, schedule: '0 1 * * *', target: env.REMINDER_URL })
  },
}
