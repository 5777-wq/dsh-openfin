/**
 * Dashboard index quotes (A-share + global indices, gold, dollar index) and
 * crypto quotes, plus the intraday sparkline series.
 *
 * Eastmoney field codes used here (fltt=2 makes them plain decimals):
 *   f1  display digits (2 for indices, 1 for COMEX gold)
 *   f2  latest price
 *   f3  change percent
 *   f4  change amount
 *   f12 code, f13 market id, f14 name
 * The `secids` list in `QUOTE_DEFS` is the SPEC's fixed 11-entry order; the
 * crypto pair is filled from Binance and only falls back to OKX/CoinGecko.
 *
 * Sparklines come from `push2his .../trends2/get` with `fields2=f51,f53`:
 * each entry is the string `"YYYY-MM-DD HH:mm,price"`. A full A-share session
 * is 241 points, so the series is evenly downsampled to at most 48 values
 * (first and last preserved) before it is sent to the client.
 * Sparks have their own 5 minute cache and never fail the quotes part.
 */
import { fetchJson, DEFAULT_TIMEOUT_MS } from './upstream.js'
import { defaultCache } from './cache.js'

/** Fixed quote order and the upstream identifiers behind each card. */
export const QUOTE_DEFS = [
  { id: 'sh000001', secid: '1.000001', name: '上证指数', kind: 'index', digits: 2 },
  { id: 'sz399001', secid: '0.399001', name: '深证成指', kind: 'index', digits: 2 },
  { id: 'sz399006', secid: '0.399006', name: '创业板指', kind: 'index', digits: 2 },
  { id: 'hkHSI', secid: '100.HSI', name: '恒生指数', kind: 'index', digits: 2 },
  { id: 'usIXIC', secid: '100.NDX', name: '纳斯达克', kind: 'index', digits: 2 },
  { id: 'usSPX', secid: '100.SPX', name: '标普500', kind: 'index', digits: 2 },
  { id: 'usDJIA', secid: '100.DJIA', name: '道琼斯', kind: 'index', digits: 2 },
  { id: 'hfGC', secid: '101.GC00Y', name: 'COMEX黄金', kind: 'index', digits: 1 },
  { id: 'fxUDI', secid: '100.UDI', name: '美元指数', kind: 'index', digits: 2 },
  { id: 'btc', name: 'BTC', kind: 'crypto', digits: 2 },
  { id: 'eth', name: 'ETH', kind: 'crypto', digits: 2 },
]

/** Crypto ids in output order; index N maps to `CRYPTO_SYMBOLS[N]`. */
export const CRYPTO_IDS = ['btc', 'eth']
/** Binance symbol per crypto id. */
const BINANCE_SYMBOLS = { btc: 'BTCUSDT', eth: 'ETHUSDT' }
/** OKX instrument per crypto id (first fallback). */
const OKX_INST_IDS = { btc: 'BTC-USDT', eth: 'ETH-USDT' }
/** CoinGecko coin id per crypto id (second fallback). */
const COINGECKO_IDS = { btc: 'bitcoin', eth: 'ethereum' }

export const SPARK_TTL_MS = 5 * 60 * 1000
export const SPARK_LIMIT = 48
/**
 * How long the quotes part waits for sparklines. They are cosmetic, so a slow
 * trends endpoint must not hold the dashboard hostage; unresolved sparks stay
 * `null` this round and the 5 minute cache fills in on the next refresh.
 */
export const SPARK_WAIT_MS = 2500

const ULIST_BASE = 'https://push2.eastmoney.com/api/qt/ulist.np/get'
const TREND_BASE = 'https://push2his.eastmoney.com/api/qt/stock/trends2/get'
const BINANCE_TICKERS = 'https://api.binance.com/api/v3/ticker/24hr'
const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines'
const OKX_TICKER = 'https://www.okx.com/api/v5/market/ticker'
const COINGECKO_PRICE = 'https://api.coingecko.com/api/v3/simple/price'

const QUOTE_FIELDS = 'f1,f2,f3,f4,f12,f13,f14'

/** @param {string[]} secids */
export function ulistUrl(secids = QUOTE_DEFS.filter((def) => def.secid).map((def) => def.secid)) {
  return `${ULIST_BASE}?fltt=2&secids=${secids.join(',')}&fields=${QUOTE_FIELDS}`
}

/** @param {string} secid */
export function trendUrl(secid) {
  return `${TREND_BASE}?secid=${encodeURIComponent(secid)}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11&fields2=f51,f53&ndays=1&iscr=0`
}

/** @param {string} symbols JSON array as Binance expects it (`["BTCUSDT","ETHUSDT"]`). */
export function binanceTickersUrl(symbols = Object.values(BINANCE_SYMBOLS)) {
  return `${BINANCE_TICKERS}?symbols=${encodeURIComponent(JSON.stringify(symbols))}`
}

/** @param {string} symbol */
export function binanceKlinesUrl(symbol) {
  return `${BINANCE_KLINES}?symbol=${encodeURIComponent(symbol)}&interval=15m&limit=48`
}

/** @param {string} instId */
export function okxTickerUrl(instId) {
  return `${OKX_TICKER}?instId=${encodeURIComponent(instId)}`
}

/** @param {string} ids */
export function coingeckoUrl(ids = Object.values(COINGECKO_IDS).join(',')) {
  return `${COINGECKO_PRICE}?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`
}

/**
 * Map the `ulist.np/get` diff array onto the fixed index order. Upstream may
 * omit an entry (`data.diff` only carries what the server returned); omitted
 * quotes are dropped from the array, as the SPEC requires.
 *
 * @param {unknown} payload
 * @returns {Array<{ id: string, name: string, price: number, change: number|null, pct: number|null, digits: number, kind: 'index' }>}
 */
export function normalizeQuoteList(payload) {
  const diff = payload?.data?.diff
  if (!Array.isArray(diff)) return []

  /** @type {Map<string, any>} */
  const bySecid = new Map()
  for (const item of diff) {
    if (item === null || typeof item !== 'object') continue
    bySecid.set(`${item.f13}.${item.f12}`, item)
  }

  const quotes = []
  for (const def of QUOTE_DEFS) {
    if (def.kind !== 'index') continue
    const item = bySecid.get(def.secid)
    if (item === undefined) continue
    const price = toNumber(item.f2)
    if (price === null) continue
    const digits = Number.isInteger(item.f1) && item.f1 >= 0 && item.f1 <= 4 ? item.f1 : def.digits
    quotes.push({
      id: def.id,
      name: typeof item.f14 === 'string' && item.f14.length > 0 ? item.f14 : def.name,
      price,
      change: toNumber(item.f4),
      pct: toNumber(item.f3),
      digits,
      kind: 'index',
    })
  }
  return quotes
}

/**
 * Parse a trends2 response into a sparkline: comma-separated
 * `"YYYY-MM-DD HH:mm,price"` rows, last column is the price.
 *
 * @param {unknown} payload
 * @param {{ limit?: number }} [options]
 * @returns {number[] | null} `null` when the upstream has no usable series.
 */
export function normalizeTrend(payload, { limit = SPARK_LIMIT } = {}) {
  const trends = payload?.data?.trends
  if (!Array.isArray(trends) || trends.length === 0) return null
  const prices = []
  for (const row of trends) {
    if (typeof row !== 'string') continue
    const comma = row.lastIndexOf(',')
    if (comma === -1) continue
    const price = Number(row.slice(comma + 1))
    if (Number.isFinite(price)) prices.push(price)
  }
  if (prices.length === 0) return null
  return downsample(prices, limit)
}

/**
 * Evenly reduce a series to `limit` points, always keeping the first and the
 * last point so the shape ends on the current price.
 *
 * @param {number[]} points
 * @param {number} [limit]
 * @returns {number[]}
 */
export function downsample(points, limit = SPARK_LIMIT) {
  if (!Array.isArray(points)) return []
  if (points.length <= limit) return points.slice()
  const out = new Array(limit)
  for (let i = 0; i < limit; i += 1) {
    out[i] = points[Math.round((i * (points.length - 1)) / (limit - 1))]
  }
  return out
}

/**
 * Binance `/ticker/24hr` → crypto quote records.
 * @param {unknown} payload
 */
export function normalizeBinanceTickers(payload) {
  if (!Array.isArray(payload)) return []
  const bySymbol = new Map()
  for (const ticker of payload) {
    if (ticker !== null && typeof ticker === 'object' && typeof ticker.symbol === 'string') {
      bySymbol.set(ticker.symbol, ticker)
    }
  }
  const quotes = []
  for (const id of CRYPTO_IDS) {
    const ticker = bySymbol.get(BINANCE_SYMBOLS[id])
    if (ticker === undefined) continue
    const price = toNumber(ticker.lastPrice)
    if (price === null) continue
    quotes.push(cryptoQuote(id, price, toNumber(ticker.priceChange), toNumber(ticker.priceChangePercent)))
  }
  return quotes
}

/**
 * OKX tickers (one response per crypto id) → crypto quote records.
 * @param {unknown[]} payloads aligned with `CRYPTO_IDS`
 */
export function normalizeOkxTickers(payloads) {
  const quotes = []
  for (let i = 0; i < CRYPTO_IDS.length; i += 1) {
    const row = payloads?.[i]?.data?.[0]
    if (row === null || row === undefined) continue
    const price = toNumber(row.last)
    const open = toNumber(row.open24h)
    if (price === null) continue
    const change = open === null ? null : price - open
    const pct = open === null || open === 0 ? null : ((price - open) / open) * 100
    quotes.push(cryptoQuote(CRYPTO_IDS[i], price, change, pct))
  }
  return quotes
}

/**
 * CoinGecko `simple/price` → crypto quote records. The 24 h percentage is the
 * only change figure available, so the absolute change is derived from it.
 * @param {unknown} payload
 */
export function normalizeCoingecko(payload) {
  if (payload === null || typeof payload !== 'object') return []
  const quotes = []
  for (const id of CRYPTO_IDS) {
    const row = payload[COINGECKO_IDS[id]]
    if (row === null || row === undefined) continue
    const price = toNumber(row.usd)
    if (price === null) continue
    const pct = toNumber(row.usd_24h_change)
    const change = price === null || pct === null || pct === -100 ? null : price - price / (1 + pct / 100)
    quotes.push(cryptoQuote(id, price, change, pct))
  }
  return quotes
}

/**
 * Binance klines `[[openTime, open, high, low, close, ...], ...]` → closes.
 * @param {unknown} payload
 * @param {{ limit?: number }} [options]
 * @returns {number[] | null}
 */
export function normalizeBinanceKlines(payload, { limit = SPARK_LIMIT } = {}) {
  if (!Array.isArray(payload) || payload.length === 0) return null
  const closes = []
  for (const candle of payload) {
    if (!Array.isArray(candle)) continue
    const close = toNumber(candle[4])
    if (close !== null) closes.push(close)
  }
  if (closes.length === 0) return null
  return downsample(closes, limit)
}

/**
 * @param {string} id
 * @param {number} price
 * @param {number|null} change
 * @param {number|null} pct
 */
function cryptoQuote(id, price, change, pct) {
  const def = QUOTE_DEFS.find((item) => item.id === id)
  return {
    id,
    name: def?.name ?? id.toUpperCase(),
    price: round(price, 2),
    change: change === null ? null : round(change, 2),
    pct: pct === null ? null : round(pct, 2),
    digits: 2,
    kind: 'crypto',
  }
}

/**
 * Build the quotes loader. Dependencies are injected so tests never touch the
 * network and so the plugin can share one cache across loader modules.
 *
 * @param {{
 *   fetchJson?: typeof fetchJson,
 *   cache?: ReturnType<typeof import('./cache.js').createCache>,
 *   timeoutMs?: number,
 *   sparkTtlMs?: number,
 *   sparkWaitMs?: number,
 * }} [options]
 */
export function createQuotes({
  fetchJson: fetchJsonImpl = fetchJson,
  cache = defaultCache,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  sparkTtlMs = SPARK_TTL_MS,
  sparkWaitMs = SPARK_WAIT_MS,
} = {}) {
  /**
   * Crypto first from Binance, then OKX (two calls), then CoinGecko.
   * Only the winning chain's data is used; the function throws when all fail
   * so the quotes part can drop crypto without failing the index cards.
   */
  async function loadCrypto() {
    try {
      return normalizeBinanceTickers(await fetchJsonImpl(binanceTickersUrl(), { timeoutMs }))
    } catch (binanceError) {
      try {
        const payloads = await Promise.all(
          CRYPTO_IDS.map((id) => fetchJsonImpl(okxTickerUrl(OKX_INST_IDS[id]), { timeoutMs })),
        )
        const okx = normalizeOkxTickers(payloads)
        if (okx.length > 0) return okx
      } catch {
        // fall through to CoinGecko
      }
      try {
        const gecko = normalizeCoingecko(await fetchJsonImpl(coingeckoUrl(), { timeoutMs }))
        if (gecko.length > 0) return gecko
      } catch {
        // fall through to the original Binance error
      }
      throw binanceError
    }
  }

  /**
   * One sparkline, cached independently of the quotes part.
   * @param {{ id: string, secid?: string, kind: string }} def
   */
  async function loadSpark(def) {
    return cache.memo(`spark:${def.id}`, sparkTtlMs, async () => {
      if (def.kind === 'crypto') {
        const spark = normalizeBinanceKlines(await fetchJsonImpl(binanceKlinesUrl(BINANCE_SYMBOLS[def.id]), { timeoutMs }))
        return spark
      }
      return normalizeTrend(await fetchJsonImpl(trendUrl(def.secid), { timeoutMs }))
    })
  }

  /**
   * @returns {Promise<Array<object>>} up to the 11 SPEC quote cards, in order.
   */
  async function load() {
    const [listResult, cryptoResult] = await Promise.allSettled([fetchJsonImpl(ulistUrl(), { timeoutMs }), loadCrypto()])
    if (listResult.status === 'rejected') throw listResult.reason

    const quotes = normalizeQuoteList(listResult.value)
    if (cryptoResult.status === 'fulfilled') quotes.push(...cryptoResult.value)

    // Sparklines are cosmetic and independently cached; wait a bounded time.
    const sparks = await settleWithin(
      quotes.map((quote) => loadSpark(QUOTE_DEFS.find((def) => def.id === quote.id)).catch(() => null)),
      sparkWaitMs,
    )
    return quotes.map((quote, index) => ({ ...quote, spark: sparks[index] ?? null }))
  }

  return { load, loadCrypto, loadSpark }
}

/**
 * Resolve all promises, but stop waiting after `ms`. Entries that are still
 * pending resolve as `null`; their rejections are already swallowed by callers.
 *
 * @template T
 * @param {Promise<T>[]} promises
 * @param {number} ms
 * @returns {Promise<Array<T | null>>}
 */
export function settleWithin(promises, ms) {
  const slots = new Array(promises.length).fill(null)
  let cleared = false
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer
  const all = Promise.all(
    promises.map((promise, index) =>
      Promise.resolve(promise).then(
        (value) => {
          slots[index] = value
        },
        () => {
          slots[index] = null
        },
      ),
    ),
  )
  return new Promise((resolve) => {
    const finish = () => {
      if (cleared) return
      cleared = true
      if (timer !== undefined) clearTimeout(timer)
      resolve(slots)
    }
    timer = setTimeout(finish, ms)
    all.then(finish)
  })
}

/** @param {unknown} value */
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '' && value !== '-') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** @param {number} value @param {number} digits */
function round(value, digits) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
