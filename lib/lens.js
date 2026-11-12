/**
 * Static file server for the vendored OpenFinLens terminal.
 *
 * The complete terminal is the original MIT-licensed OpenFinLens build, copied
 * into `lens/` by `scripts/sync-lens.mjs` and served under
 * `/dsh-openfin/lens/`. The DSH page embeds it with `?embed=1`; the app is pure
 * static and resolves its own assets relative to the document, so this module
 * only needs to map URLs to files safely.
 *
 * Safety rules: GET/HEAD only, no directory listing, no symlink escape, no
 * `..`/encoded traversal, no NUL bytes, and every resolved file must stay
 * inside the vendored root.
 */
import { createHash } from 'node:crypto'
import { existsSync, realpathSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { extname, normalize, resolve, sep } from 'node:path'

export const LENS_PREFIX = '/dsh-openfin/lens'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

function contentType(file) {
  return MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
}

/**
 * Map a request pathname to a file inside the vendored root.
 *
 * @param {string} pathname
 * @param {string} root
 * @param {string} [prefix]
 * @param {string|null} [realRoot] - `realpathSync(root)`, cached by the caller.
 * @returns {{ file: string } | { status: number, error: string }}
 */
export function resolveLensPath(pathname, root, prefix = LENS_PREFIX, realRoot = null) {
  if (typeof pathname !== 'string' || pathname === '') return { status: 400, error: 'bad path' }
  if (pathname.includes('\0')) return { status: 404, error: 'not found' }

  let path = pathname
  try {
    path = decodeURIComponent(pathname)
  } catch {
    return { status: 400, error: 'bad encoding' }
  }
  if (path.includes('\0')) return { status: 404, error: 'not found' }
  if (path !== prefix && !path.startsWith(prefix + '/')) return { status: 404, error: 'not found' }

  let relativePath = path.slice(prefix.length)
  if (relativePath === '' || relativePath === '/') relativePath = '/index.html'
  // Normalize POSIX-style, then rebuild under the root. A leading slash is
  // stripped so `join` cannot treat it as an absolute path.
  const normalized = normalize(relativePath).replace(/^([/\\])+/, '')
  const segments = normalized.split(/[/\\]/)
  if (segments.some((segment) => segment === '..' || segment === '.' || segment === '')) {
    return { status: 404, error: 'not found' }
  }

  const file = resolve(root, normalized)
  const rootWithSep = resolve(root) + sep
  if (file !== resolve(root) && !file.startsWith(rootWithSep)) return { status: 404, error: 'not found' }
  if (!existsSync(file)) return { status: 404, error: 'not found' }

  // Follow the real path too: a symlink inside the vendored tree must not
  // point outside it.
  try {
    const realRootPath = (realRoot ?? realpathSync(resolve(root))) + sep
    const realFile = realpathSync(file)
    if (!realFile.startsWith(realRootPath)) return { status: 404, error: 'not found' }
  } catch {
    return { status: 404, error: 'not found' }
  }

  return { file }
}

/**
 * @param {{ root: string, prefix?: string }} options
 */
export function createLens({ root, prefix = LENS_PREFIX }) {
  // Resolved once: one realpath syscall per request shares the event loop with
  // the market API, and the vendored tree does not move while the plugin runs.
  let realRoot = null
  try {
    realRoot = realpathSync(resolve(root))
  } catch {
    realRoot = null
  }

  function etagFor(stats) {
    return 'W/"' + createHash('sha1').update(`${stats.mtimeMs}:${stats.size}`).digest('hex').slice(0, 16) + '"'
  }

  async function handleNode(req, res) {
    try {
      const method = String(req.method || 'GET').toUpperCase()
      if (method !== 'GET' && method !== 'HEAD') {
        res.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: 'method not allowed' }))
        return
      }
      const url = new URL(String(req.url || '/'), 'http://127.0.0.1')
      const resolved = resolveLensPath(url.pathname, root, prefix, realRoot)
      if ('error' in resolved) {
        res.writeHead(resolved.status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ error: resolved.error }))
        return
      }
      const stats = await stat(resolved.file)
      if (!stats.isFile()) {
        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: 'not found' }))
        return
      }

      const etag = etagFor(stats)
      const isDocument = resolved.file.endsWith('.html')
      const headers = {
        'content-type': contentType(resolved.file),
        'content-length': String(stats.size),
        'x-content-type-options': 'nosniff',
        'cache-control': isDocument ? 'no-cache' : 'public, max-age=300',
        etag,
        'referrer-policy': 'no-referrer',
      }
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, { etag, 'cache-control': headers['cache-control'] })
        res.end()
        return
      }
      if (method === 'HEAD') {
        res.writeHead(200, headers)
        res.end()
        return
      }
      // Read first, then commit the head: a read error must still be able to
      // answer 500 instead of dying after a 200 was already sent.
      const body = await readFile(resolved.file)
      res.writeHead(200, headers)
      res.end(body)
    } catch (error) {
      try {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      } catch {
        /* response already gone */
      }
    }
  }

  return { handleNode, root }
}
