/**
 * Instrument search and per-symbol quotes for the floating HUD.
 *
 * The HUD may show any eastmoney instrument the user picks (A-share, HK, US,
 * funds, indices), not just the eleven dashboard cards. The browser cannot ask
 * eastmoney directly (no CORS headers), so the Host searches and quotes here:
 *
 *   search(query)  -> searchapi.eastmoney.com suggest endpoint (QuoteID)
 *   quotes(ids)    -> built-in ids from the shared quotes loader; `em:<secid>`
 *                     ids from push2 stock/get, with a trends2 sparkline
 *
 * Everything is cached with the plugin's cache service and everything failing is
 * local: one bad symbol is omitted from `quotes`, it never fails the batch.
 */
import { QUOTE_DEFS, normalizeTrend, trendUrl } from './quotes.js'
import { fetchJson as defaultFetchJson, DEFAULT_TIMEOUT_MS } from './upstream.js'

/** Fixed token the eastmoney web app ships for its suggest endpoint. */
export const SEARCH_TOKEN = 'D43BF722C8E33BDC906FB84D85E326E8'
export const SEARCH_TTL_MS = 60_000
export const INSTRUMENT_TTL_MS = 30_000
export const INSTRUMENT_SPARK_TTL_MS = 5 * 60_000
export const MAX_HUD_SYMBOLS = 6

/** `em:1.600519` -> `1.600519`; anything else -> null. */
export function customSecid(id) {
  if (typeof id !== 'string' || !id.startsWith('em:')) return null
  const secid = id.slice(3)
  return /^\d{1,3}\.[A-Za-z0-9_]+$/.test(secid) ? secid : null
}

/** Built-in dashboard ids (the eleven cards of /api/snapshot). */
export const BUILTIN_IDS = new Set(QUOTE_DEFS.map((def) => def.id))

export function searchUrl(query, limit = 8) {
  const count = Math.min(10, Math.max(1, Math.round(limit)))
  return (
    'https://searchapi.eastmoney.com/api/suggest/get?input=' +
    encodeURIComponent(query) +
    '&type=14&token=' +
    SEARCH_TOKEN +
    '&count=' +
    String(count)
  )
}

export function instrumentQuoteUrl(secid) {
  return (
    'https://push2.eastmoney.com/api/qt/stock/get?fltt=2&secid=' +
    encodeURIComponent(secid) +
    '&fields=f43,f57,f58,f59,f60,f169,f170'
  )
}

/**
 * Normalize the suggest payload.
 * @returns {Array<{ id: string, secid: string, code: string, name: string, market: string, kind: string }>}
 */
export function normalizeSearch(payload, limit = 8) {
  const rows = payload?.QuotationCodeTable?.Data
  if (!Array.isArray(rows)) return []
  const out = []
  for (const row of rows) {
    const secid = typeof row?.QuoteID === 'string' ? row.QuoteID.trim() : ''
    if (!/^\d{1,3}\.[A-Za-z0-9_]+$/.test(secid)) continue
    const name = typeof row.Name === 'string' ? row.Name.trim() : ''
    if (name === '') continue
    const classify = String(row.Classify ?? '')
    out.push({
      id: 'em:' + secid,
      secid,
      code: typeof row.Code === 'string' ? row.Code : '',
      name: name.slice(0, 24),
      market: typeof row.SecurityTypeName === 'string' ? row.SecurityTypeName.slice(0, 12) : '',
      kind: /index|指数/i.test(classify) || /指$/.test(name) ? 'index' : 'stock',
    })
    if (out.length >= limit) break
  }
  return out
}

/**
 * Normalize `push2 stock/get` into a HUD quote. `data: null` means the symbol
 * does not exist or is not quoted.
 */
export function normalizeInstrumentQuote(payload, id) {
  const data = payload?.data
  if (data === null || typeof data !== 'object') return null
  const price = Number(data.f43)
  if (!Number.isFinite(price)) return null
  const change = Number(data.f169)
  const pct = Number(data.f170)
  // eastmoney asks for 3 decimals on HK/US lines; two is what a quote ticker
  // should show, except for sub-unit prices where a third digit matters.
  const sourceDigits = Number(data.f59)
  const digits = Number.isFinite(sourceDigits) ? Math.min(sourceDigits, price >= 1 ? 2 : 3) : 2
  return {
    id,
    name: typeof data.f58 === 'string' && data.f58.trim() !== '' ? data.f58.trim() : id,
    price,
    change: Number.isFinite(change) ? change : null,
    pct: Number.isFinite(pct) ? pct : null,
    digits,
    spark: null,
  }
}

/**
 * @param {{
 *   fetchJson?: typeof defaultFetchJson,
 *   cache: { memo: Function, peek: Function },
 *   loadBuiltinQuotes: () => Promise<Array<object>>,
 *   timeoutMs?: number,
 *   now?: () => number,
 * }} options
 */
export function createInstruments({
  fetchJson: fetchJsonImpl = defaultFetchJson,
  cache,
  loadBuiltinQuotes,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = Date.now,
}) {
  /**
   * @param {string} query
   * @param {{ limit?: number, signal?: AbortSignal }} [options]
   */
  async function search(query, { limit = 8, signal } = {}) {
    const text = String(query ?? '').trim()
    if (text === '') return { query: '', results: [] }
    const capped = Math.min(10, Math.max(1, Math.round(limit)))
    const results = await cache.memo(
      `hud:search:${capped}:${text.toLowerCase()}`,
      SEARCH_TTL_MS,
      () => fetchJsonImpl(searchUrl(text, capped), { timeoutMs, signal }).then((payload) => normalizeSearch(payload, capped)),
    )
    return { query: text, results }
  }

  async function loadSpark(secid) {
    return cache.memo(`hud:spark:${secid}`, INSTRUMENT_SPARK_TTL_MS, async () => {
      try {
        return normalizeTrend(await fetchJsonImpl(trendUrl(secid), { timeoutMs }))
      } catch {
        return null
      }
    })
  }

  async function loadCustom(secid) {
    const quote = await cache.memo(`hud:instrument:${secid}`, INSTRUMENT_TTL_MS, () =>
      fetchJsonImpl(instrumentQuoteUrl(secid), { timeoutMs }).then((payload) =>
        normalizeInstrumentQuote(payload, 'em:' + secid),
      ),
    )
    if (quote === null) return null
    const spark = await loadSpark(secid).catch(() => null)
    return { ...quote, spark }
  }

  /**
   * @param {string[]} ids - built-in ids and `em:<secid>` values, in display order.
   * @returns {Promise<{ updatedAt: number, stale: boolean, quotes: Array<object> }>}
   */
  async function quotes(ids) {
    const requested = []
    const seen = new Set()
    for (const id of Array.isArray(ids) ? ids : []) {
      if (typeof id !== 'string' || seen.has(id)) continue
      if (!BUILTIN_IDS.has(id) && customSecid(id) === null) continue
      seen.add(id)
      requested.push(id)
      if (requested.length >= MAX_HUD_SYMBOLS) break
    }

    const builtinIds = requested.filter((id) => BUILTIN_IDS.has(id))
    const customIds = requested.filter((id) => customSecid(id) !== null)

    // Built-in and custom symbols are independent: asking for six symbols used
    // to cost two sequential network rounds, which is longer than the desktop
    // helper's own timeout. Run them together.
    const [builtinResult, custom] = await Promise.all([
      builtinIds.length > 0
        ? loadBuiltinQuotes().then(
            (loaded) => ({ ok: true, loaded }),
            () => ({ ok: false, loaded: [] }),
          )
        : Promise.resolve({ ok: true, loaded: [] }),
      Promise.allSettled(customIds.map((id) => loadCustom(customSecid(id)))),
    ])

    const byId = new Map()
    for (const quote of builtinResult.loaded) byId.set(quote.id, quote)
    for (const result of custom) {
      if (result.status === 'fulfilled' && result.value !== null) byId.set(result.value.id, result.value)
    }

    return {
      updatedAt: now(),
      // The dashboard's quotes part is the only source for built-in ids here;
      // when it failed, say so instead of pretending the answer is complete.
      stale: builtinIds.length > 0 && !builtinResult.ok,
      quotes: requested.map((id) => byId.get(id)).filter(Boolean),
    }
  }

  return { search, quotes }
}
