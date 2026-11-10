/**
 * Academy data: article library, article reader and the glossary.
 *
 * The content pipeline (`scripts/sync-academy.mjs`, owned by the content
 * teammate) writes committed JSON under `data/`; this module reads it lazily
 * and keeps it in memory, so the Host half never ships content inside JS.
 * Files:
 *   data/academy/index.json         { articles: [...], sections: [...] }
 *   data/academy/articles/<id>.json { ...card, points, body, related }
 *   data/glossary.json              { terms: [...], categories: [...] }
 *
 * Glossary contract (Lead amendment): the route returns FULL term records in
 * `terms[]` — `{ id, term, alias, one, metaphor, number, pit, cat }` — with the
 * upstream-only fields (source, sym, lens, name, kw) stripped. `daily` is the
 * same record rotated by local date: hash("YYYY-MM-DD") modulo the term list,
 * sorted by `term` with `localeCompare('zh')` for a deterministic order. The
 * payload is kept under 260 KiB.
 *
 * Missing data files are reported as `AcademyUnavailableError` (route → 503),
 * while an unknown article id is simply `null` (route → 404). Lazy loaders
 * reset their promise on failure so a later request picks up a freshly
 * generated `data/` directory without restarting the process.
 */
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Directory the content pipeline writes and this module reads. */
export const DEFAULT_DATA_DIR = join(PLUGIN_ROOT, 'data')

/** Hard cap for the `/api/glossary` payload (Lead amendment: 260 KiB). */
export const MAX_GLOSSARY_BYTES = 260 * 1024

/** Full term shape returned by `/api/glossary`. */
export const TERM_FIELDS = ['id', 'term', 'alias', 'one', 'metaphor', 'number', 'pit', 'cat']

/** Search-card shape used only as a size emergency fallback. */
export const SLIM_FIELDS = ['id', 'term', 'alias', 'one', 'cat']

/** Article ids are file names: keep them conservative to prevent traversal. */
export const ARTICLE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/

export class AcademyUnavailableError extends Error {
  constructor(message, { cause } = {}) {
    super(message)
    this.name = 'AcademyUnavailableError'
    if (cause !== undefined) this.cause = cause
  }
}

/**
 * @param {{ dataDir?: string, now?: () => number, maxGlossaryBytes?: number }} [options]
 */
export function createAcademy({ dataDir = DEFAULT_DATA_DIR, now = Date.now, maxGlossaryBytes = MAX_GLOSSARY_BYTES } = {}) {
  /** Memoize a promise-returning loader, retrying if it failed. */
  const lazy = (loader) => {
    let promise
    return () => {
      if (promise === undefined) {
        promise = loader().catch((error) => {
          promise = undefined
          throw error
        })
      }
      return promise
    }
  }

  const loadIndex = lazy(async () => {
    const data = await readJson(join(dataDir, 'academy', 'index.json'))
    if (data === null || typeof data !== 'object' || !Array.isArray(data.articles) || !Array.isArray(data.sections)) {
      throw new AcademyUnavailableError('data/academy/index.json must contain articles[] and sections[]')
    }
    return data
  })

  const loadGlossary = lazy(async () => {
    const data = await readJson(join(dataDir, 'glossary.json'))
    if (data === null || typeof data !== 'object') {
      throw new AcademyUnavailableError('data/glossary.json must be a JSON object')
    }
    return data
  })

  async function getIndex() {
    return loadIndex()
  }

  /**
   * @param {string} id
   * @returns {Promise<object | null>} `null` when the id is unknown.
   */
  async function getArticle(id) {
    if (!ARTICLE_ID_PATTERN.test(String(id ?? ''))) return null
    // Canary: distinguishes "article missing" (404) from "data not built yet" (503).
    await loadIndex()
    let data
    try {
      data = JSON.parse(await readFile(join(dataDir, 'academy', 'articles', `${id}.json`), 'utf8'))
    } catch (error) {
      if (error?.code === 'ENOENT') return null
      throw new AcademyUnavailableError(`cannot read article ${id}`, { cause: error })
    }
    if (data === null || typeof data !== 'object') {
      throw new AcademyUnavailableError(`article ${id} is not a JSON object`)
    }
    return data
  }

  /** @returns {Promise<{ daily: object|null, terms: Array<object>, categories: Array<object> }>} */
  async function getGlossaryPayload() {
    return buildGlossaryPayload(await loadGlossary(), { now: now(), maxBytes: maxGlossaryBytes })
  }

  return { getIndex, getArticle, getGlossary: getGlossaryPayload }
}

/**
 * Build the `/api/glossary` payload from `data/glossary.json`: strip fields,
 * sort, rotate the daily record and enforce the payload budget.
 *
 * @param {object} data raw glossary file
 * @param {{ now?: number, maxBytes?: number }} [options]
 */
export function buildGlossaryPayload(data, { now = Date.now(), maxBytes = MAX_GLOSSARY_BYTES } = {}) {
  const terms = collectTermRecords(data)
  const daily = terms.length === 0 ? null : terms[dailyIndexFor(now, terms.length)]
  const categories = normalizeCategories(data?.categories)

  const payload = { daily, terms, categories }
  if (payloadBytes(payload) <= maxBytes) return payload

  // Emergency fallback: a future glossary with unusually long prose must not
  // break the page. Cards still render (search + one-liner); the four-part
  // detail lives in `daily` only. With the current 293 terms this never fires.
  return {
    daily,
    terms: terms.map((term) => pick(term, SLIM_FIELDS)),
    categories,
  }
}

/**
 * Every full term record found in the file. Accepts both the content
 * pipeline's array shape and the upstream object-keyed shape, and merges a
 * full record pool (`records`/`full`/`dailyPool`) into slim `terms` entries.
 *
 * @param {object} data
 * @returns {Array<object>}
 */
export function collectTermRecords(data) {
  if (data === null || typeof data !== 'object') return []
  /** @type {Map<string, object>} */
  const byId = new Map()
  for (const key of ['terms', 'records', 'full', 'dailyPool']) {
    for (const raw of recordList(data[key])) {
      if (raw === null || typeof raw !== 'object') continue
      const id = text(raw.id)
      if (id === null) continue
      const merged = byId.get(id) ?? {}
      for (const field of TERM_FIELDS) {
        const value = field === 'id' ? id : text(raw[field])
        if (value !== null && (merged[field] === null || merged[field] === undefined)) merged[field] = value
      }
      merged.id = id
      byId.set(id, merged)
    }
  }
  const records = []
  for (const record of byId.values()) {
    // A term without `term` or `one` cannot render a card.
    if (record.term === undefined || record.one === undefined) continue
    /** @type {Record<string, unknown>} */
    const normalized = {}
    for (const field of TERM_FIELDS) normalized[field] = record[field] ?? null
    records.push(normalized)
  }
  records.sort((a, b) => a.term.localeCompare(b.term, 'zh') || a.id.localeCompare(b.id))
  return records
}

/**
 * @param {unknown} value array of records, or an object keyed by term id
 * @returns {Array<object>}
 */
function recordList(value) {
  if (Array.isArray(value)) return value
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).map(([id, record]) =>
      record !== null && typeof record === 'object' ? { ...record, id: record.id ?? id } : null,
    )
  }
  return []
}

/** @param {unknown} value */
function normalizeCategories(value) {
  const list = recordList(value)
  const categories = []
  for (const raw of list) {
    if (raw === null || typeof raw !== 'object') continue
    const id = text(raw.id)
    if (id === null) continue
    categories.push({ id, label: text(raw.label) ?? id })
  }
  return categories
}

/** Index of the daily term: local calendar date → stable hash → modulo. */
export function dailyIndexFor(now, count) {
  if (!Number.isInteger(count) || count <= 0) return -1
  return hashString(localDateKey(now)) % count
}

/** FNV-1a 32-bit, so the same local date always picks the same term. */
export function hashString(input) {
  let hash = 0x811c9dc5
  const text = String(input)
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Local calendar date as `YYYY-MM-DD` (the SPEC says "rotated by local date"). */
export function localDateKey(now) {
  const date = new Date(now)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** @param {object} value */
function payloadBytes(value) {
  return Buffer.byteLength(JSON.stringify(value), 'utf8')
}

/** @param {object} record @param {string[]} fields */
function pick(record, fields) {
  /** @type {Record<string, unknown>} */
  const out = {}
  for (const field of fields) out[field] = record[field] ?? null
  return out
}

/** @param {unknown} value @returns {string | null} */
function text(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** @param {string} path @returns {Promise<any>} */
async function readJson(path) {
  let text
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    throw new AcademyUnavailableError(`cannot read ${path}`, { cause: error })
  }
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new AcademyUnavailableError(`invalid JSON in ${path}`, { cause: error })
  }
}
