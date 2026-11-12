/**
 * A-share industry board heatmap plus per-board constituents.
 *
 * Eastmoney `clist/get` field codes (with `fltt=2` and `invt=2`, values are
 * plain decimals, not the integer-scaled form some other endpoints use):
 *   f2  latest price, f3 change percent, f4 change amount,
 *   f6  turnover (成交额), f12 code, f14 name, f20 total market cap.
 *
 * Board list query: `fs=m:90+t:2` = industry boards; sorted by `fid=f20`
 * descending so the heatmap starts with the heaviest sectors.
 * Constituent query: `fs=b:<BK code>` sorted by `fid=f6` (turnover) descending.
 *
 * The board's own name/percent is NOT part of the constituent response. A
 * separate `stock/get` call returns it (`f43` price ×100, `f58` name,
 * `f170` percent ×100); this was verified against the live endpoint from the
 * build machine. If that call fails the router falls back to the cached board
 * list, so the sector drawer still opens.
 */
import { fetchJson, DEFAULT_TIMEOUT_MS, UpstreamError } from './upstream.js'

/** At most this many boards in the heatmap payload (SPEC). */
export const MAX_BOARDS = 96
/** A healthy upstream returns hundreds; the SPEC asks for at least 24. */
export const MIN_HEALTHY_BOARDS = 24
/** Sector drawer shows the top 10 constituents by turnover. */
export const MAX_SECTOR_STOCKS = 10
/** A sector drawer reopened inside this window is served without upstream calls. */
export const SECTOR_TTL_MS = 30 * 1000
/** A hung constituent call must not stall the drawer (two calls, one budget). */
export const SECTOR_BUDGET_MS = 5000

const CLIST_BASE = 'https://push2.eastmoney.com/api/qt/clist/get'
const STOCK_GET_BASE = 'https://push2.eastmoney.com/api/qt/stock/get'

export const BOARD_LIST_URL =
  // pz=150 covers MAX_BOARDS (96) plus enough headroom for boards that arrive
  // without a price; asking for 500 only made the payload 3× larger.
  `${CLIST_BASE}?pn=1&pz=150&po=1&np=1&fltt=2&invt=2&fid=f20&fs=m:90+t:2&fields=f2,f3,f4,f12,f14,f20`

/** @param {string} code e.g. `BK1295` */
export function boardStocksUrl(code) {
  return `${CLIST_BASE}?pn=1&pz=${MAX_SECTOR_STOCKS}&po=1&np=1&fltt=2&invt=2&fid=f6&fs=b:${encodeURIComponent(code)}&fields=f2,f3,f6,f12,f14`
}

/** @param {string} code e.g. `BK1295` */
export function boardMetaUrl(code) {
  return `${STOCK_GET_BASE}?secid=90.${encodeURIComponent(code)}&fields=f43,f57,f58,f170`
}

/**
 * Normalize the industry board list and sort by market cap descending.
 * Entries without a price/percent are skipped (a suspended/empty board).
 *
 * @param {unknown} payload
 * @returns {Array<{ code: string, name: string, pct: number, price: number, marketCap: number }>}
 */
export function normalizeBoardList(payload) {
  const diff = payload?.data?.diff
  if (!Array.isArray(diff)) return []
  const boards = []
  for (const item of diff) {
    if (item === null || typeof item !== 'object') continue
    const code = text(item.f12)
    const name = text(item.f14)
    const price = toNumber(item.f2)
    const pct = toNumber(item.f3)
    if (code === null || name === null || price === null || pct === null) continue
    boards.push({ code, name, pct, price, marketCap: toNumber(item.f20) ?? 0 })
  }
  boards.sort((a, b) => b.marketCap - a.marketCap || a.code.localeCompare(b.code))
  return boards
}

/**
 * Up/down/flat counts across the boards actually returned in the payload.
 * The Lead's contract amendment: breadth comes from the heatmap array, never
 * from a second upstream call.
 *
 * @param {Array<{ pct: number }>} boards
 */
export function boardBreadth(boards) {
  const breadth = { up: 0, down: 0, flat: 0, total: 0 }
  for (const board of boards) {
    if (board.pct > 0) breadth.up += 1
    else if (board.pct < 0) breadth.down += 1
    else breadth.flat += 1
    breadth.total += 1
  }
  return breadth
}

/**
 * Complete boards part: capped list plus its breadth.
 * @param {unknown} payload
 */
export function buildBoardsPayload(payload) {
  const boards = normalizeBoardList(payload).slice(0, MAX_BOARDS)
  return { boards, boardBreadth: boardBreadth(boards) }
}

/**
 * Constituents, sorted by turnover descending and capped at 10.
 * @param {unknown} payload
 * @returns {Array<{ code: string, name: string, price: number, pct: number, amount: number }>}
 */
export function normalizeSectorStocks(payload) {
  const diff = payload?.data?.diff
  if (!Array.isArray(diff)) return []
  const stocks = []
  for (const item of diff) {
    if (item === null || typeof item !== 'object') continue
    const code = text(item.f12)
    const name = text(item.f14)
    const price = toNumber(item.f2)
    const pct = toNumber(item.f3)
    if (code === null || name === null || price === null || pct === null) continue
    stocks.push({ code, name, price, pct, amount: toNumber(item.f6) ?? 0 })
  }
  stocks.sort((a, b) => b.amount - a.amount || a.code.localeCompare(b.code))
  return stocks.slice(0, MAX_SECTOR_STOCKS)
}

/**
 * Board name/percent from `stock/get`. Values arrive integer-scaled ×100
 * (f43 162211 → 1622.11, f170 980 → 9.80), so divide by 100.
 *
 * @param {unknown} payload
 * @returns {{ code: string|null, name: string|null, price: number|null, pct: number|null } | null}
 */
export function normalizeBoardMeta(payload) {
  const data = payload?.data
  if (data === null || typeof data !== 'object') return null
  const price = toNumber(data.f43)
  const pct = toNumber(data.f170)
  const name = text(data.f58)
  return {
    code: text(data.f57),
    name,
    price: price === null ? null : price / 100,
    pct: pct === null ? null : pct / 100,
  }
}

/**
 * @param {{
 *   fetchJson?: typeof fetchJson,
 *   timeoutMs?: number,
 *   cache?: { memo: Function } | null,
 *   sectorTtlMs?: number,
 *   sectorBudgetMs?: number,
 * }} [options]
 */
export function createBoards({
  fetchJson: fetchJsonImpl = fetchJson,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  cache = null,
  sectorTtlMs = SECTOR_TTL_MS,
  sectorBudgetMs = SECTOR_BUDGET_MS,
} = {}) {
  /** @returns {Promise<{ boards: Array<object>, boardBreadth: object }>} */
  async function load() {
    return buildBoardsPayload(await fetchJsonImpl(BOARD_LIST_URL, { timeoutMs }))
  }

  /**
   * @param {string} code
   * @param {{ fallbackBoards?: Array<{ code: string, name: string, pct: number, price: number }> }} [options]
   * @returns {Promise<{ code: string, name: string, pct: number|null, stocks: Array<object> } | null>}
   *   `null` means "unknown board code" → the router answers 404.
   */
  async function loadSectorOnce(code, { fallbackBoards } = {}) {
    const [stocksResult, metaResult] = await Promise.allSettled([
      fetchJsonImpl(boardStocksUrl(code), { timeoutMs }),
      fetchJsonImpl(boardMetaUrl(code), { timeoutMs }),
    ])

    // No constituent list means we cannot honour the contract at all.
    if (stocksResult.status === 'rejected') throw stocksResult.reason
    const stocks = normalizeSectorStocks(stocksResult.value)

    let meta = null
    if (metaResult.status === 'fulfilled') meta = normalizeBoardMeta(metaResult.value)
    if (meta === null && Array.isArray(fallbackBoards)) {
      const cached = fallbackBoards.find((board) => board.code === code)
      if (cached !== undefined) meta = { code: cached.code, name: cached.name, price: cached.price, pct: cached.pct }
    }

    // Empty `data.diff` (or `data: null`) is how upstream reports an unknown
    // board code; `stock/get` would still answer, so check the list first.
    if (stocks.length === 0) return null

    return {
      code,
      name: meta?.name ?? code,
      pct: meta?.pct ?? null,
      stocks,
    }
  }

  /**
   * The drawer is opened, closed and reopened while scanning boards, so the
   * result is cached per code for `sectorTtlMs` and bounded by one budget.
   * The first caller's `fallbackBoards` is the one the cached load sees; it is
   * only a name/percent fallback, so that is not worth a second upstream call.
   *
   * @param {string} code
   * @param {{ fallbackBoards?: Array<object> }} [options]
   */
  async function loadSector(code, options = {}) {
    const run = () => withBudget(loadSectorOnce(code, options), sectorBudgetMs)
    if (cache === null || typeof cache?.memo !== 'function') return run()
    return cache.memo(`sector:${code}`, sectorTtlMs, run)
  }

  return { load, loadSector }
}

/**
 * Race a promise against a deadline; the loser keeps running (it is a cache
 * loader, so a late answer is still useful on the next attempt).
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T>}
 */
function withBudget(promise, ms) {
  if (!(ms > 0)) return promise
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new UpstreamError(`sector request exceeded ${ms}ms`, { code: 'timeout' })),
      ms,
    )
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

/** @param {unknown} value @returns {string | null} */
function text(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** @param {unknown} value @returns {number | null} */
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '' && value.trim() !== '-') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
