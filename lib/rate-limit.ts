// Limiteur de débit en mémoire (par processus). Suffisant pour une instance
// unique ; derrière plusieurs instances, préférer un stockage partagé (Redis).

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()
const MAX_STORE_SIZE = 10_000

export function checkRateLimit(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()

  if (store.size >= MAX_STORE_SIZE) {
    for (const [k, e] of store) if (now > e.resetAt) store.delete(k)
    if (store.size >= MAX_STORE_SIZE) return { allowed: false, retryAfterSec: Math.ceil(windowMs / 1000) }
  }

  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }

  entry.count++
  if (entry.count > max) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { allowed: true, retryAfterSec: 0 }
}

export function clientIp(headers: Headers): string {
  return headers.get('x-real-ip')
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}
