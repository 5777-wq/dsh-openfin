/**
 * Aggregate dashboard snapshot.
 *
 * One request fans out into four independent parts — quotes, boards, movers,
 * news — each cached for `refreshMs` (30 s) and each wrapped so a failure can
 * never reject the snapshot:
 *
 * 1. fresh cache hit  → serve it, `ok: true`
 * 2. loader succeeds  → serve and cache it, `ok: true`
 * 3. loader fails     → serve the last cached value if one exists and raise
 *                       the top-level `stale` flag, `ok: true`
 * 4. no cache at all  → empty default for that section, `parts[].ok: false`
 *                       with a short `error` code (e.g. "timeout")
 *
 * A per-part deadline (`budgetMs`, default 6 s) keeps a pathological upstream
 * from stalling the whole page; an in-flight load that outlives it simply
 * finishes into the cache for the next refresh.
 */
import { defaultCache } from './cache.js'

/** Fixed part order in the `parts` array. */
export const PART_IDS = ['quotes', 'boards', 'movers', 'news']

/** Client polling interval; also the cache TTL of each part. */
export const DEFAULT_REFRESH_MS = 30_000

/** Whole-snapshot budget (SPEC: ~6 s). */
export const DEFAULT_BUDGET_MS = 6_000

/**
 * Assemble the snapshot.
 *
 * @param {{
 *   parts: Record<string, { load: () => Promise<unknown>, ttlMs?: number } | (() => Promise<unknown>)>,
 *   cache?: ReturnType<typeof import('./cache.js').createCache>,
 *   now?: () => number,
 *   refreshMs?: number,
 *   budgetMs?: number,
 * }} options
 * @returns {Promise<object>} the SPEC snapshot shape
 */
export async function buildSnapshot({
  parts,
  cache = defaultCache,
  now = Date.now,
  refreshMs = DEFAULT_REFRESH_MS,
  budgetMs = DEFAULT_BUDGET_MS,
} = {}) {
  if (parts === null || typeof parts !== 'object') {
    throw new TypeError('buildSnapshot: parts must be an object')
  }

  const results = await Promise.all(
    PART_IDS.map((id) => runPart(id, parts[id], { cache, now, refreshMs, budgetMs })),
  )

  /** @type {Map<string, { value: unknown }>} */
  const values = new Map()
  for (const result of results) if (result.value !== undefined) values.set(result.id, result)

  const quotes = /** @type {Array<object>} */ (values.get('quotes')?.value ?? [])
  const boardsPart = /** @type {{ boards?: Array<object>, boardBreadth?: object } | undefined} */ (values.get('boards')?.value)
  const boards = boardsPart?.boards ?? []
  const moversPart = /** @type {{ up?: Array<object>, down?: Array<object>, active?: Array<object> } | undefined} */ (
    values.get('movers')?.value
  )
  const news = /** @type {Array<object>} */ (values.get('news')?.value ?? [])

  return {
    updatedAt: now(),
    refreshMs,
    stale: results.some((result) => result.stale === true),
    parts: results.map((result) => result.part),
    quotes,
    boards,
    // Never omit the object: the client renders the breadth bar unconditionally.
    boardBreadth: boardsPart?.boardBreadth ?? { up: 0, down: 0, flat: 0, total: 0 },
    movers: {
      up: moversPart?.up ?? [],
      down: moversPart?.down ?? [],
      active: moversPart?.active ?? [],
    },
    news,
  }
}

/**
 * Resolve one part with cache, stale fallback and a deadline.
 *
 * @param {string} id
 * @param {{ load: () => Promise<unknown>, ttlMs?: number } | (() => Promise<unknown>) | undefined} spec
 * @param {{ cache: ReturnType<typeof import('./cache.js').createCache>, now: () => number, refreshMs: number, budgetMs: number }} context
 */
async function runPart(id, spec, { cache, now, refreshMs, budgetMs }) {
  const startedAt = now()
  const loader = typeof spec === 'function' ? spec : spec?.load
  const key = `part:${id}`
  const ttlMs = typeof spec === 'function' ? refreshMs : (spec?.ttlMs ?? refreshMs)

  if (typeof loader !== 'function') {
    return { id, stale: false, part: { id, ok: false, ms: 0, error: 'not configured' } }
  }

  try {
    const value = await withDeadline(cache.memo(key, ttlMs, loader), budgetMs)
    return { id, stale: false, value, part: { id, ok: true, ms: now() - startedAt } }
  } catch (error) {
    const cached = cache.peek(key)
    if (cached !== undefined) {
      // Expired entry: still far better than dropping the whole section.
      return { id, stale: true, value: cached.value, part: { id, ok: true, ms: now() - startedAt } }
    }
    return {
      id,
      stale: false,
      part: { id, ok: false, ms: now() - startedAt, error: errorCode(error) },
    }
  }
}

/**
 * Race a promise against a timer. The loser keeps running in the background
 * (it is a cache loader, so its result is still useful on the next refresh).
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T>}
 */
function withDeadline(promise, ms) {
  if (!(ms > 0)) return promise
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new PartTimeoutError(ms)), ms)
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

class PartTimeoutError extends Error {
  constructor(ms) {
    super(`part timeout after ${ms}ms`)
    this.name = 'PartTimeoutError'
    this.code = 'timeout'
  }
}

/**
 * Compact reason for `parts[].error`: the stable upstream code when we have
 * one ("timeout", "network", "http", "parse"), otherwise the message.
 *
 * @param {unknown} error
 */
export function errorCode(error) {
  if (error !== null && typeof error === 'object') {
    const code = /** @type {{ code?: unknown }} */ (error).code
    if (typeof code === 'string' && code.length > 0) return code
    const name = /** @type {{ name?: unknown }} */ (error).name
    if (name === 'PartTimeoutError') return 'timeout'
  }
  return error instanceof Error ? error.message.slice(0, 120) : 'upstream error'
}
