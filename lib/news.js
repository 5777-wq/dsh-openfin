/**
 * Finance news feed via eastmoney `np-listapi` (news column 344, 8 items).
 *
 * The endpoint requires `req_trace=1` in the query string; without it the
 * gateway answers an error envelope instead of the list. The response shape is
 *   { code: "1", message: "success", data: { list: [ ... ] } }
 * where each item carries `code` (numeric id), `title`, `summary`,
 * `showTime` ("YYYY-MM-DD HH:mm:ss"), `uniqueUrl` and `url`.
 *
 * Quirks handled here:
 * - `uniqueUrl`/`url` are `http://` in the payload; the client page is served
 *   over `http://127.0.0.1`, but upgrading to https avoids mixed-content
 *   warnings when the app is opened from an https origin later.
 * - Some items have no `title`; the SPEC asks for a compact title derived from
 *   the first sentence of `summary` (≤ 46 chars, ellipsis).
 * - The list is sorted newest first defensively even though `order=1` already
 *   asks upstream for that order.
 */
import { fetchJson, DEFAULT_TIMEOUT_MS } from './upstream.js'

/** `column=344` is the 财经 news column used by the dashboard. */
export const NEWS_URL =
  'https://np-listapi.eastmoney.com/comm/web/getNewsByColumns?client=web&biz=web_news_col&column=344&order=1&needInteractData=0&page_index=1&page_size=8&req_trace=1'

/** Maximum items in the snapshot news array (SPEC). */
export const MAX_NEWS = 8

/** Maximum length of a title derived from `summary`. */
export const DERIVED_TITLE_MAX = 46

/**
 * Derive a compact title from the first sentence of a news summary.
 * The trailing sentence terminator is dropped; a too-long sentence becomes an
 * ellipsized prefix of at most `max` characters.
 *
 * @param {unknown} summary
 * @param {number} [max]
 * @returns {string}
 */
export function titleFromSummary(summary, max = DERIVED_TITLE_MAX) {
  const text = String(summary ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length === 0) return ''
  // First sentence: up to and excluding a CJK or western terminator.
  const match = /^[^。！？!?]+/.exec(text)
  const first = (match === null ? text : match[0]).trim()
  if (first.length === 0) return ''
  if (first.length <= max) return first
  return `${first.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

/**
 * @param {unknown} item
 * @returns {{ id: string, title: string, time: string, url: string } | null}
 */
export function normalizeNewsItem(item) {
  if (item === null || typeof item !== 'object') return null
  const id = text(item.code) ?? text(item.id)
  const title = text(item.title) ?? titleFromSummary(item.summary)
  if (id === null || title.length === 0) return null
  const rawUrl = text(item.uniqueUrl) ?? text(item.url) ?? ''
  return {
    id,
    title,
    time: text(item.showTime) ?? text(item.time) ?? '',
    url: httpsUrl(rawUrl),
  }
}

/**
 * @param {unknown} payload
 * @param {{ limit?: number }} [options]
 * @returns {Array<{ id: string, title: string, time: string, url: string }>}
 */
export function normalizeNewsList(payload, { limit = MAX_NEWS } = {}) {
  const list = payload?.data?.list
  if (!Array.isArray(list)) return []
  const items = []
  for (const item of list) {
    const normalized = normalizeNewsItem(item)
    if (normalized !== null) items.push(normalized)
  }
  // Newest first; ISO-ish "YYYY-MM-DD HH:mm:ss" sorts lexicographically.
  items.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))
  return items.slice(0, limit)
}

/**
 * @param {{ fetchJson?: typeof fetchJson, timeoutMs?: number }} [options]
 */
export function createNews({ fetchJson: fetchJsonImpl = fetchJson, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  /** @returns {Promise<Array<object>>} */
  async function load() {
    return normalizeNewsList(await fetchJsonImpl(NEWS_URL, { timeoutMs }))
  }

  return { load }
}

/** Upgrade plain-http links to https; leave anything else untouched. */
function httpsUrl(url) {
  if (typeof url !== 'string') return ''
  return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url
}

/** @param {unknown} value @returns {string | null} */
function text(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
