type Env = { SITE_ORIGIN: string; ANM_ORDER_CRON_SECRET: string }
export default {
  async scheduled(_event: unknown, env: Env, context: { waitUntil(promise: Promise<unknown>): void }) {
    context.waitUntil((async () => {
      const response = await fetch(env.SITE_ORIGIN + '/api/internal/anm-shop/retry-jobs', { method: 'POST', headers: { Authorization: 'Bearer ' + env.ANM_ORDER_CRON_SECRET }, signal: AbortSignal.timeout(110000) })
      if (!response.ok) throw new Error('ANM order retry returned HTTP ' + response.status)
    })())
  },
}
