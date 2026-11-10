/**
 * HTTP surface of the Host half.
 *
 * The Web server (`@deepseek-ai/dsh-host-webserver`) hands this module every
 * request whose pathname matches the registered prefix; the resource maps a
 * Fetch `Request` to a `Response` (GET/HEAD only — other methods are answered
 * 405 by the server before reaching us). The prefix registration lives in
 * `index.js`; paths here are relative to it:
 *
 *   /dsh-openfin/api/snapshot            live JSON, no-store
 *   /dsh-openfin/api/sector?code=BK1295  live JSON, no-store
 *   /dsh-openfin/api/academy             committed JSON, public max-age=300
 *   /dsh-openfin/api/academy/article?id= committed JSON, public max-age=300
 *   /dsh-openfin/api/glossary            committed JSON, public max-age=300
 *   /dsh-openfin/ping                    compatibility probe used by the
 *                                        earlier skeleton client page
 *
 * Errors always answer `{ error: string }`: 400 for a missing/invalid query
 * parameter, 404 for an unknown sector/article/route, 502 when an upstream
 * fails, 503 while the academy data has not been generated yet. The router
 * catches everything, because a throwing resource becomes a bare 400 in the
 * Web server and the client would lose the readable error.
 */
import { AcademyUnavailableError } from './academy.js'
import { UpstreamError } from './upstream.js'

/** Registered route prefix (no trailing slash; see docs/SPEC.md). */
export const ROUTE_PREFIX = '/dsh-openfin'

/** Live market data must never be cached by a browser or proxy. */
export const LIVE_CACHE_CONTROL = 'no-store'

/** Committed academy data may be cached briefly. */
export const ACADEMY_CACHE_CONTROL = 'public, max-age=300'

/** Sector codes are eastmoney board codes (e.g. BK1295). */
const SECTOR_CODE_PATTERN = /^[A-Za-z0-9]{2,16}$/

/**
 * @param {{
 *   snapshot: () => Promise<object>,
 *   loadSector: (code: string, options?: object) => Promise<object | null>,
 *   academy: { getIndex: () => Promise<object>, getArticle: (id: string) => Promise<object|null>, getGlossary: () => Promise<object> },
 *   cachedBoards?: () => Array<object> | undefined,
 *   now?: () => number,
 * }} deps
 * @returns {(request: Request) => Promise<Response>}
 */
export function createRouter({ snapshot, loadSector, academy, cachedBoards, now = Date.now }) {
  if (typeof snapshot !== 'function' || typeof loadSector !== 'function' || academy === null || typeof academy !== 'object') {
    throw new TypeError('createRouter: snapshot, loadSector and academy are required')
  }

  return async function route(request) {
    let url
    try {
      url = new URL(request.url)
    } catch {
      return json({ error: 'bad request url' }, { status: 400 })
    }
    const path = routePath(url.pathname)
    if (path === null) return json({ error: 'not found' }, { status: 404 })

    try {
      switch (path) {
        case '/ping':
          return json({ ok: true, at: now() })
        case '/api/snapshot':
          return json(await snapshot(), { cache: LIVE_CACHE_CONTROL })
        case '/api/sector':
          return await sectorRoute(url, { loadSector, cachedBoards })
        case '/api/academy':
          return json(await academy.getIndex(), { cache: ACADEMY_CACHE_CONTROL })
        case '/api/academy/article':
          return await articleRoute(url, academy)
        case '/api/glossary':
          return json(await academy.getGlossary(), { cache: ACADEMY_CACHE_CONTROL })
        default:
          return json({ error: 'not found' }, { status: 404 })
      }
    } catch (error) {
      return errorResponse(error)
    }
  }
}

/**
 * Map an absolute pathname onto the router-relative path, or `null` when it is
 * outside the registered prefix. The Web server already filters by prefix, so
 * the `null` arm only protects direct in-process calls (tests, future callers).
 *
 * @param {string} pathname
 * @returns {string | null}
 */
export function routePath(pathname) {
  if (pathname === ROUTE_PREFIX) return '/'
  if (pathname.startsWith(`${ROUTE_PREFIX}/`)) return pathname.slice(ROUTE_PREFIX.length)
  return null
}

/**
 * @param {URL} url
 * @param {{ loadSector: Function, cachedBoards?: () => Array<object> | undefined }} deps
 */
async function sectorRoute(url, { loadSector, cachedBoards }) {
  const raw = url.searchParams.get('code')
  const code = raw === null ? '' : raw.trim().toUpperCase()
  if (!SECTOR_CODE_PATTERN.test(code)) {
    return json({ error: 'code is required, e.g. /api/sector?code=BK1295' }, { status: 400 })
  }

  let fallbackBoards
  if (typeof cachedBoards === 'function') {
    try {
      fallbackBoards = cachedBoards()
    } catch {
      fallbackBoards = undefined
    }
  }

  const sector = await loadSector(code, { fallbackBoards })
  if (sector === null) return json({ error: `unknown sector ${code}` }, { status: 404 })
  return json(sector, { cache: LIVE_CACHE_CONTROL })
}

/**
 * @param {URL} url
 * @param {{ getArticle: (id: string) => Promise<object | null> }} academy
 */
async function articleRoute(url, academy) {
  const raw = url.searchParams.get('id')
  const id = raw === null ? '' : raw.trim()
  if (id.length === 0 || id.length > 64 || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id)) {
    return json({ error: 'id is required, e.g. /api/academy/article?id=2008' }, { status: 400 })
  }
  const article = await academy.getArticle(id)
  if (article === null) return json({ error: `unknown article ${id}` }, { status: 404 })
  return json(article, { cache: ACADEMY_CACHE_CONTROL })
}

/**
 * Build a JSON `Response` with the headers the SPEC asks for.
 *
 * @param {unknown} body
 * @param {{ status?: number, cache?: string }} [options]
 */
export function json(body, { status = 200, cache = LIVE_CACHE_CONTROL } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
    },
  })
}

/** @param {unknown} error */
function errorResponse(error) {
  if (error instanceof AcademyUnavailableError || /** @type {any} */ (error)?.name === 'AcademyUnavailableError') {
    return json({ error: 'academy data is not available yet' }, { status: 503 })
  }
  if (error instanceof UpstreamError || /** @type {any} */ (error)?.name === 'UpstreamError') {
    const code = /** @type {any} */ (error)?.code
    return json({ error: `upstream unavailable${typeof code === 'string' ? ` (${code})` : ''}` }, { status: 502 })
  }
  return json({ error: 'internal error' }, { status: 500 })
}
