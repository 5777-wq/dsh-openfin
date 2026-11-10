/**
 * A-share movers: top gainers, top losers and most active by turnover.
 *
 * Same eastmoney `clist/get` endpoint and field codes as `lib/boards.js`
 * (f2 price, f3 percent, f6 turnover, f12 code, f14 name). Three queries over
 * the A-share universe (`fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23` = Shenzhen
 * main + ChiNext + Shanghai main + STAR):
 *   - gainers  `fid=f3&po=1` (percent descending)
 *   - losers   `fid=f3&po=0` (percent ascending)
 *   - active   `fid=f6&po=1` (turnover descending)
 *
 * The contract asks for 8 entries in each bucket; `amount` is only part of
 * the `active` records (the other two lists would waste bytes with it).
 */
import { fetchJson, DEFAULT_TIMEOUT_MS } from './upstream.js'

/** A-share universe accepted by the clist `fs` filter. */
const A_SHARE_FS = 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23'
const CLIST_BASE = 'https://push2.eastmoney.com/api/qt/clist/get'
const FIELDS = 'f2,f3,f6,f12,f14'

/** Entries per bucket (SPEC). */
export const MOVERS_LIMIT = 8

/** @param {'up'|'down'|'active'} bucket */
export function moversUrl(bucket) {
  const spec = {
    up: { fid: 'f3', po: '1' },
    down: { fid: 'f3', po: '0' },
    active: { fid: 'f6', po: '1' },
  }[bucket]
  return `${CLIST_BASE}?pn=1&pz=${MOVERS_LIMIT}&po=${spec.po}&np=1&fltt=2&invt=2&fid=${spec.fid}&fs=${A_SHARE_FS}&fields=${FIELDS}`
}

/**
 * @param {unknown} payload
 * @param {{ withAmount?: boolean }} [options]
 * @returns {Array<{ code: string, name: string, price: number, pct: number, amount?: number }>}
 */
export function normalizeMovers(payload, { withAmount = false } = {}) {
  const diff = payload?.data?.diff
  if (!Array.isArray(diff)) return []
  const rows = []
  for (const item of diff) {
    if (item === null || typeof item !== 'object') continue
    const code = text(item.f12)
    const name = text(item.f14)
    const price = toNumber(item.f2)
    const pct = toNumber(item.f3)
    if (code === null || name === null || price === null || pct === null) continue
    /** @type {{ code: string, name: string, price: number, pct: number, amount?: number }} */
    const row = { code, name, price, pct }
    if (withAmount) row.amount = toNumber(item.f6) ?? 0
    rows.push(row)
  }
  return rows.slice(0, MOVERS_LIMIT)
}

/**
 * @param {{ fetchJson?: typeof fetchJson, timeoutMs?: number }} [options]
 */
export function createMovers({ fetchJson: fetchJsonImpl = fetchJson, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  /**
   * All three buckets are one snapshot part. They share the same upstream, so
   * treating them as an all-or-nothing part keeps `parts[].ok` honest; the
   * snapshot's stale-cache fallback covers a transient failure.
   *
   * @returns {Promise<{ up: Array<object>, down: Array<object>, active: Array<object> }>}
   */
  async function load() {
    const [up, down, active] = await Promise.all([
      fetchJsonImpl(moversUrl('up'), { timeoutMs }),
      fetchJsonImpl(moversUrl('down'), { timeoutMs }),
      fetchJsonImpl(moversUrl('active'), { timeoutMs }),
    ])
    return {
      up: normalizeMovers(up),
      down: normalizeMovers(down),
      active: normalizeMovers(active, { withAmount: true }),
    }
  }

  return { load }
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
