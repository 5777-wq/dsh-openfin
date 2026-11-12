/**
 * Small in-process cache with three behaviours the dashboard depends on:
 *
 * - `memo(key, ttlMs, loader)` serves a fresh entry without touching the
 *   upstream, and dedupes concurrent calls so one page load cannot fan out
 *   into N identical eastmoney requests.
 * - `peek(key)` reads an entry even after it expired. Callers use it to serve
 *   stale data when the upstream fails, which is what keeps the aggregate
 *   snapshot alive during a network hiccup.
 * - `set(key, value, ttlMs)` seeds the cache, mainly for tests and for
 *   warming a part from a different route.
 *
 * Time is injectable (`now`) so tests can advance a fake clock instead of
 * sleeping. Keys are mostly a fixed set of part / spark / upstream names, but
 * the HUD search cache carries a user query, so the map is swept once it grows
 * past `maxEntries` to keep a long-lived process bounded.
 */

/**
 * @param {{ now?: () => number, maxEntries?: number }} [options]
 */
export function createCache({ now = Date.now, maxEntries = 512 } = {}) {
  /** @type {Map<string, { value: unknown, storedAt: number, expiresAt: number }>} */
  const entries = new Map()
  /** @type {Map<string, Promise<unknown>>} */
  const pending = new Map()
  let generation = 0

  /** Drop expired entries once the map has grown past its budget. */
  function sweep() {
    if (entries.size <= maxEntries) return
    const at = now()
    for (const [key, entry] of entries) {
      if (at >= entry.expiresAt) entries.delete(key)
    }
    // Everything is still fresh: drop the oldest half rather than grow forever.
    if (entries.size > maxEntries) {
      const oldest = [...entries.entries()].sort((a, b) => a[1].storedAt - b[1].storedAt)
      for (const [key] of oldest.slice(0, entries.size - maxEntries)) entries.delete(key)
    }
  }

  /**
   * Return the cached value for `key`, or load it and remember it for `ttlMs`.
   * A failed load is not cached, so the next caller retries immediately;
   * concurrent callers share a single in-flight load.
   *
   * @template T
   * @param {string} key
   * @param {number} ttlMs
   * @param {() => Promise<T> | T} loader
   * @returns {Promise<T>}
   */
  async function memo(key, ttlMs, loader) {
    const entry = entries.get(key)
    if (entry !== undefined && now() < entry.expiresAt) return entry.value

    const running = pending.get(key)
    if (running !== undefined) return running

    const startedAt = generation
    const promise = Promise.resolve()
      .then(loader)
      .then((value) => {
        // A clear() while the loader was in flight must not resurrect data.
        if (generation === startedAt) {
          entries.set(key, { value, storedAt: now(), expiresAt: now() + ttlMs })
          sweep()
        }
        return value
      })
      .finally(() => {
        if (pending.get(key) === promise) pending.delete(key)
      })

    pending.set(key, promise)
    return promise
  }

  /**
   * Read the current entry for `key`, fresh or expired, without loading.
   * @param {string} key
   * @returns {{ value: unknown, storedAt: number, expiresAt: number, ageMs: number, fresh: boolean } | undefined}
   */
  function peek(key) {
    const entry = entries.get(key)
    if (entry === undefined) return undefined
    const at = now()
    return {
      value: entry.value,
      storedAt: entry.storedAt,
      expiresAt: entry.expiresAt,
      ageMs: at - entry.storedAt,
      fresh: at < entry.expiresAt,
    }
  }

  /**
   * Seed or overwrite an entry (used by tests and by cache warming).
   * @param {string} key
   * @param {unknown} value
   * @param {number} ttlMs
   */
  function set(key, value, ttlMs) {
    entries.set(key, { value, storedAt: now(), expiresAt: now() + ttlMs })
    sweep()
  }

  /** @param {string} key */
  function remove(key) {
    entries.delete(key)
    pending.delete(key)
  }

  function clear() {
    generation += 1
    entries.clear()
    pending.clear()
  }

  /** @returns {number} number of stored entries (fresh + stale) */
  function size() {
    return entries.size
  }

  return { memo, peek, set, remove, clear, size }
}

/** Shared cache used by the live plugin instance. */
export const defaultCache = createCache()

/** Module-level aliases kept for the layout promised in docs/SPEC.md. */
export const memo = defaultCache.memo
export const peek = defaultCache.peek
export const set = defaultCache.set
export const remove = defaultCache.remove
export const clear = defaultCache.clear
