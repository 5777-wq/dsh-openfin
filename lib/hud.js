/**
 * Floating HUD host manager.
 *
 * The floating widget itself lives in the Web page (client half). This module
 * owns the part a browser page cannot do: a real always-on-top desktop window,
 * created by a small bundled Electron helper process.
 *
 * Responsibilities:
 *   - persist the shared HudConfig at `$DSH_HOME/dsh-openfin/hud.json`
 *   - find an Electron binary (the runtime other DSH desktop plugins keep under
 *     `$DSH_HOME/electron`, an explicit env override, or PATH)
 *   - spawn / stop / supervise exactly one helper process
 *   - answer `GET|POST /dsh-openfin/api/hud`
 *
 * No `@deepseek-ai/*` imports: the plugin is installed as a linked directory in
 * some profiles. Everything here is `node:*` plus injected seams so the unit
 * tests never spawn a real process.
 */
import { spawn as nodeSpawn } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { homedir, platform as platformOf } from 'node:os'
import { delimiter, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BUILTIN_IDS, MAX_HUD_SYMBOLS, customSecid } from './instruments.js'

/** Quote ids the HUD may show (the `quotes[].id` values of /api/snapshot). */
export const SYMBOL_IDS = [
  'sh000001',
  'sz399001',
  'sz399006',
  'hkHSI',
  'usIXIC',
  'usSPX',
  'usDJIA',
  'hfGC',
  'fxUDI',
  'btc',
  'eth',
]

/** Opt-in by default: the widget is something the user turns on. */
export const HUD_DEFAULTS = Object.freeze({
  version: 1,
  inline: false,
  desktop: false,
  collapsed: false,
  symbols: ['sh000001', 'sz399001', 'hkHSI', 'usIXIC', 'btc'],
  opacity: 85,
  idleOpacity: 35,
  idleAfterMs: 30000,
  hoverFull: true,
  size: 'm',
  title: 'OpenFin',
  showSpark: true,
  position: { x: 0, y: 0 },
  catalog: {},
  panicEnabled: true,
  panicShortcut: 'CommandOrControl+Shift+H',
})

/** Accelerators offered by the settings sheet (also used by the helper). */
export const PANIC_SHORTCUTS = Object.freeze([
  'CommandOrControl+Shift+H',
  'Alt+X',
  'CommandOrControl+Alt+H',
  'CommandOrControl+Shift+Space',
])

const SIZES = new Set(['s', 'm', 'l'])
const MAX_SYMBOLS = 6
const MIN_OPACITY = 20
const MAX_OPACITY = 100
const MIN_IDLE_MS = 5000
const MAX_IDLE_MS = 600000
const DEFAULT_SPAWN_DEADLINE_MS = 6000
const STOP_GRACE_MS = 2000

/** Width per size; the helper derives the height from the row count. */
export const HUD_SIZES = Object.freeze({
  s: { width: 300, rowHeight: 26 },
  m: { width: 340, rowHeight: 30 },
  l: { width: 384, rowHeight: 34 },
})

function clampNumber(value, min, max, fallback) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function clampBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeTitle(value, fallback) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.replace(/\s+/g, ' ').trim().slice(0, 18)
  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeSymbols(value, fallback) {
  if (!Array.isArray(value)) return fallback.slice()
  const seen = new Set()
  const picked = []
  for (const entry of value) {
    if (typeof entry !== 'string' || seen.has(entry)) continue
    if (!BUILTIN_IDS.has(entry) && customSecid(entry) === null) continue
    seen.add(entry)
    picked.push(entry)
    if (picked.length >= MAX_HUD_SYMBOLS) break
  }
  return picked.length > 0 ? picked : fallback.slice()
}

/** Custom-symbol labels: only ids already in `symbols` survive, max 12. */
function normalizeCatalog(value, symbols, fallback) {
  const base = fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback) ? fallback : {}
  const source = value !== null && typeof value === 'object' && !Array.isArray(value) ? value : base
  const out = {}
  const wanted = new Set(symbols.filter((id) => customSecid(id) !== null))
  for (const [id, entry] of Object.entries(source)) {
    if (!wanted.has(id) || entry === null || typeof entry !== 'object') continue
    const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, 24) : ''
    if (name === '') continue
    out[id] = {
      name,
      secid: customSecid(id),
      code: typeof entry.code === 'string' ? entry.code.slice(0, 12) : '',
      market: typeof entry.market === 'string' ? entry.market.slice(0, 12) : '',
      kind: entry.kind === 'index' ? 'index' : 'stock',
    }
    if (Object.keys(out).length >= 12) break
  }
  return out
}

function normalizePanicShortcut(value, enabled, fallback) {
  if (enabled === false) return fallback
  return PANIC_SHORTCUTS.includes(value) ? value : fallback
}

function normalizePosition(value, fallback) {
  if (value === null || typeof value !== 'object') return { ...fallback }
  const x = Number(value.x)
  const y = Number(value.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { ...fallback }
  return { x: Math.round(x), y: Math.round(y) }
}

/**
 * Merge a partial config over a base config, clamping every field.
 * Unknown keys are dropped on purpose: the file is user-editable and the page
 * is not the only writer.
 *
 * @param {object} base
 * @param {object} patch
 * @returns {object}
 */
export function normalizeConfig(base, patch) {
  const source = patch !== null && typeof patch === 'object' ? patch : {}
  return {
    version: 1,
    inline: clampBoolean(source.inline, base.inline),
    desktop: clampBoolean(source.desktop, base.desktop),
    collapsed: clampBoolean(source.collapsed, base.collapsed),
    symbols: source.symbols === undefined ? base.symbols.slice() : normalizeSymbols(source.symbols, base.symbols),
    opacity: source.opacity === undefined ? base.opacity : clampNumber(source.opacity, MIN_OPACITY, MAX_OPACITY, base.opacity),
    idleOpacity:
      source.idleOpacity === undefined
        ? base.idleOpacity
        : clampNumber(source.idleOpacity, MIN_OPACITY, MAX_OPACITY, base.idleOpacity),
    idleAfterMs:
      source.idleAfterMs === undefined
        ? base.idleAfterMs
        : source.idleAfterMs === 0
          ? 0
          : clampNumber(source.idleAfterMs, MIN_IDLE_MS, MAX_IDLE_MS, base.idleAfterMs),
    hoverFull: clampBoolean(source.hoverFull, base.hoverFull),
    size: typeof source.size === 'string' && SIZES.has(source.size) ? source.size : base.size,
    title: source.title === undefined ? base.title : normalizeTitle(source.title, base.title),
    showSpark: clampBoolean(source.showSpark, base.showSpark),
    position: source.position === undefined ? { ...base.position } : normalizePosition(source.position, base.position),
    catalog: normalizeCatalog(source.catalog, source.symbols === undefined ? base.symbols : normalizeSymbols(source.symbols, base.symbols), base.catalog),
    panicEnabled: clampBoolean(source.panicEnabled, base.panicEnabled),
    panicShortcut: normalizePanicShortcut(source.panicShortcut, source.panicEnabled === undefined ? base.panicEnabled : source.panicEnabled, base.panicShortcut),
  }
}

/** Default electron executable name for a platform. */
function electronExecutable(platform) {
  return platform === 'win32' ? 'electron.exe' : 'electron'
}

/**
 * Find an Electron binary without spawning anything.
 *
 * Order: explicit env override, the runtime DSH desktop plugins share under
 * `$DSH_HOME/electron`, then PATH.
 *
 * @param {{ platform?: string, env?: Record<string, string | undefined>, exists?: (path: string) => boolean, home?: string }} [options]
 * @returns {{ path: string | null, source: string | null }}
 */
export function findElectron(options = {}) {
  const platform = options.platform ?? platformOf()
  const env = options.env ?? process.env
  const exists = options.exists ?? existsSync
  const home = options.home ?? dshHomeDir(env)
  const candidates = []

  if (typeof env.DSH_OPENFIN_ELECTRON === 'string' && env.DSH_OPENFIN_ELECTRON.trim() !== '') {
    candidates.push({ path: env.DSH_OPENFIN_ELECTRON.trim(), source: 'env' })
  }
  if (platform === 'darwin') {
    candidates.push({
      path: join(home, 'electron', 'Electron.app', 'Contents', 'MacOS', 'Electron'),
      source: 'dsh-home',
    })
  }
  candidates.push({ path: join(home, 'electron', electronExecutable(platform)), source: 'dsh-home' })
  for (const entry of String(env.PATH ?? '').split(delimiter)) {
    const directory = entry.trim()
    if (directory === '') continue
    candidates.push({ path: join(directory, electronExecutable(platform)), source: 'path' })
  }

  for (const candidate of candidates) {
    try {
      if (exists(candidate.path)) return candidate
    } catch {
      /* an unreadable PATH entry is not a match */
    }
  }
  return { path: null, source: null }
}

/** `$DSH_HOME` from the environment, or `~/.dsh`. */
export function dshHomeDir(env = process.env) {
  const configured = env.DSH_HOME
  if (typeof configured === 'string' && configured.trim() !== '') return configured.trim()
  return join(homedir(), '.dsh')
}

function readJsonFile(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

/** Atomic JSON write: a half-written config must never be read by the helper. */
function writeJsonAtomic(file, value) {
  mkdirSync(dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.tmp`
  writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', 'utf8')
  renameSync(temporary, file)
}

/**
 * @param {{
 *   origin?: string | (() => string),
 *   home?: string,
 *   platform?: string,
 *   env?: Record<string, string | undefined>,
 *   spawn?: typeof nodeSpawn,
 *   exists?: (path: string) => boolean,
 *   logger?: { warn?: (message: string) => void },
 *   now?: () => number,
 * }} [options]
 */
export function createHud(options = {}) {
  const env = options.env ?? process.env
  const platform = options.platform ?? platformOf()
  const home = options.home ?? dshHomeDir(env)
  const spawn = options.spawn ?? nodeSpawn
  const exists = options.exists ?? existsSync
  const logger = options.logger ?? console
  const now = options.now ?? Date.now
  const instruments = options.instruments ?? null
  const spawnDeadlineMs = Number.isFinite(options.spawnDeadlineMs) ? options.spawnDeadlineMs : DEFAULT_SPAWN_DEADLINE_MS
  const originOf =
    typeof options.origin === 'function' ? options.origin : () => options.origin ?? ''

  const stateDir = join(home, 'dsh-openfin')
  const configPath = join(stateDir, 'hud.json')
  const windowPath = join(stateDir, 'hud-window.json')
  const helperRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'runtime', 'electron-helper')

  let config = normalizeConfig(HUD_DEFAULTS, readJsonFile(configPath) ?? {})
  /** @type {import('node:child_process').ChildProcess | null} */
  let child = null
  let running = false
  let lastReason = ''
  let spawnDeadline = null
  let disposed = false

  const electron = findElectron({ platform, env, exists, home })

  function persistConfig() {
    try {
      writeJsonAtomic(configPath, config)
    } catch (error) {
      lastReason = `cannot write ${configPath}: ${error instanceof Error ? error.message : String(error)}`
      logger.warn?.(lastReason)
    }
  }

  function readWindowState() {
    const raw = readJsonFile(windowPath)
    if (!raw || typeof raw !== 'object' || !raw.bounds || typeof raw.bounds !== 'object') return null
    const { x, y, width, height } = raw.bounds
    if (![x, y, width, height].every((value) => Number.isFinite(value))) return null
    return { x, y, width, height, hidden: raw.hidden === true }
  }

  function status() {
    return {
      available: electron.path !== null,
      running,
      electron: { path: electron.path, source: electron.source },
      reason: electron.path === null ? '未找到 Electron 运行时：设置 DSH_OPENFIN_ELECTRON，或让桌面端插件在 $DSH_HOME/electron 下准备一份。' : lastReason,
      config: { ...config, symbols: config.symbols.slice(), catalog: { ...config.catalog }, position: { ...config.position } },
      window: readWindowState(),
    }
  }

  function helperArgs() {
    const origin = originOf()
    // Flags are plugin-namespaced: Chromium reserves a number of plain switch
    // names, and an unrecognized collision makes Electron exit before it loads
    // the app (observed with `--host`/`--size` combinations).
    // `--key=value` (one token each) is not cosmetic: Electron mis-resolves the
    // app when an argument that looks like a URL is followed by another flag,
    // and exits before loading the app. Verified against Electron 43.
    const args = [
      // First positional argument is the Electron app path. Without it Electron
      // boots its default app instead of our helper.
      helperRoot,
      `--openfin-host=${origin}`,
      `--openfin-config=${configPath}`,
      `--openfin-window=${windowPath}`,
      `--openfin-parent-pid=${process.pid}`,
      `--openfin-size=${config.size}`,
    ]
    return args
  }

  function childEnv() {
    const next = { ...env }
    // The DSH host runs under Electron's node mode; inherited, the helper would
    // start as plain Node and fail to create a window. An empty string makes
    // Electron abort, so the key must be absent.
    delete next.ELECTRON_RUN_AS_NODE
    delete next.ELECTRON_NO_ATTACH_CONSOLE
    return next
  }

  function start() {
    if (disposed) return { ok: false, reason: 'plugin disposed' }
    if (electron.path === null) return { ok: false, reason: 'no electron runtime' }
    if (child !== null && running) return { ok: true }
    lastReason = ''

    let spawned = false
    try {
      const proc = spawn(electron.path, helperArgs(), {
        cwd: helperRoot,
        env: childEnv(),
        stdio: ['ignore', 'ignore', 'pipe'],
        windowsHide: true,
        detached: false,
      })
      child = proc
      running = true

      const fail = (message) => {
        lastReason = message
        running = false
        if (spawnDeadline !== null) {
          clearTimeout(spawnDeadline)
          spawnDeadline = null
        }
      }

      proc.stderr?.on?.('data', (chunk) => {
        const text = String(chunk).trim()
        if (text !== '') logger.warn?.(`[dsh-openfin hud] ${text.slice(0, 400)}`)
      })
      proc.once('error', (error) => {
        fail(`helper failed: ${error instanceof Error ? error.message : String(error)}`)
        child = null
      })
      proc.once('exit', (code, signal) => {
        if (spawnDeadline !== null) {
          clearTimeout(spawnDeadline)
          spawnDeadline = null
        }
        if (!spawned && !disposed) fail(`helper exited early (code ${String(code)}, signal ${String(signal)})`)
        else if (!stopping && !disposed) lastReason = `helper exited (code ${String(code)})`
        running = false
        child = null
      })
      proc.once('spawn', () => {
        spawned = true
        if (spawnDeadline !== null) {
          clearTimeout(spawnDeadline)
          spawnDeadline = null
        }
      })
      spawnDeadline = setTimeout(() => {
        spawnDeadline = null
        if (spawned || proc.exitCode !== null) return
        lastReason = 'helper did not start within 6s'
        running = false
        try {
          proc.kill()
        } catch {
          /* already gone */
        }
      }, spawnDeadlineMs)
      if (typeof spawnDeadline.unref === 'function') spawnDeadline.unref()
      return { ok: true }
    } catch (error) {
      lastReason = `cannot spawn helper: ${error instanceof Error ? error.message : String(error)}`
      running = false
      child = null
      return { ok: false, reason: lastReason }
    }
  }

  let stopping = false

  function stop() {
    stopping = true
    return new Promise((resolveStop) => {
      const proc = child
      if (proc === null) {
        running = false
        resolveStop()
        return
      }
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        running = false
        child = null
        // Clear the flag with the process: the next helper must be able to
        // report an unexpected exit again.
        stopping = false
        resolveStop()
      }
      const timer = setTimeout(() => {
        try {
          if (process.platform === 'win32' && proc.pid !== undefined) {
            const killer = nodeSpawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {
              stdio: 'ignore',
              windowsHide: true,
            })
            killer.once('error', () => {})
          } else {
            proc.kill('SIGKILL')
          }
        } catch {
          /* already gone */
        }
        finish()
      }, STOP_GRACE_MS)
      if (typeof timer.unref === 'function') timer.unref()
      proc.once('exit', () => {
        // An intentional stop is not a failure; keep the status line clean.
        lastReason = ''
        finish()
      })
      try {
        proc.kill()
      } catch {
        finish()
        return
      }
      if (proc.exitCode !== null) finish()
    })
  }

  function applyConfigPatch(patch) {
    const before = config
    config = normalizeConfig(before, patch)
    persistConfig()
    return config
  }

  async function handle(request) {
    const method = String(request?.method ?? 'GET').toUpperCase()
    const url = new URL(request?.url ?? 'http://127.0.0.1/dsh-openfin/api/hud')
    const pathname = url.pathname.replace(/\/+$/, '')
    try {
      if (pathname.endsWith('/api/hud/search')) {
        if (method !== 'GET' && method !== 'HEAD') return json({ error: 'method not allowed' }, 405, { allow: 'GET, HEAD' })
        if (instruments === null) return json({ error: 'instrument search is unavailable' }, 503)
        const query = url.searchParams.get('q') ?? ''
        const limit = Number(url.searchParams.get('limit') ?? 8)
        const result = await instruments.search(query, { limit })
        return json(result)
      }
      if (pathname.endsWith('/api/hud/quotes')) {
        if (method !== 'GET' && method !== 'HEAD') return json({ error: 'method not allowed' }, 405, { allow: 'GET, HEAD' })
        if (instruments === null) return json({ error: 'instrument quotes are unavailable' }, 503)
        const ids = (url.searchParams.get('ids') ?? '')
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        return json(await instruments.quotes(ids))
      }
      if (!pathname.endsWith('/api/hud')) return json({ error: 'not found' }, 404)

      if (method === 'GET' || method === 'HEAD') {
        return json(status())
      }
      if (method !== 'POST') {
        return json({ error: 'method not allowed' }, 405, { allow: 'GET, POST, HEAD' })
      }
      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: 'body must be JSON' }, 400)
      }
      if (body === null || typeof body !== 'object' || Array.isArray(body)) {
        return json({ error: 'body must be a JSON object' }, 400)
      }

      if (body.config !== undefined) {
        if (body.config === null || typeof body.config !== 'object' || Array.isArray(body.config)) {
          return json({ error: 'config must be an object' }, 400)
        }
        applyConfigPatch(body.config)
      }

      if (body.action === 'recenter') {
        try {
          writeJsonAtomic(windowPath, { ...(readJsonFile(windowPath) ?? {}), bounds: null, recenterAt: now() })
        } catch (error) {
          return json({ error: `cannot write window state: ${error instanceof Error ? error.message : String(error)}` }, 500)
        }
      }

      if (body.action === 'panic') {
        if (typeof body.hidden !== 'boolean') return json({ error: 'hidden must be a boolean' }, 400)
        try {
          writeJsonAtomic(windowPath, { ...(readJsonFile(windowPath) ?? {}), hidden: body.hidden, panicAt: now() })
        } catch (error) {
          return json({ error: `cannot write window state: ${error instanceof Error ? error.message : String(error)}` }, 500)
        }
      }

      if (body.desktop !== undefined) {
        if (typeof body.desktop !== 'boolean') return json({ error: 'desktop must be a boolean' }, 400)
        applyConfigPatch({ desktop: body.desktop })
        if (body.desktop) {
          if (electron.path === null) return json(status(), 409)
          const outcome = start()
          if (!outcome.ok) return json(status(), 500)
        } else {
          await stop()
        }
      }

      return json(status())
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error)
      return json({ error: lastReason }, 500)
    }
  }

  /**
   * node:http adapter for the Web server's `handler` route form. Resources only
   * receive GET and HEAD, and the HUD needs POST, so this route is registered
   * as a handler and bridged to the Fetch-style `handle()` above.
   */
  async function handleNode(req, res) {
    try {
      const chunks = []
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        for await (const chunk of req) chunks.push(chunk)
      }
      const request = new Request('http://127.0.0.1' + String(req.url || '/'), {
        method: String(req.method || 'GET').toUpperCase(),
        headers: { 'content-type': String(req.headers['content-type'] || 'application/json') },
        body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
      })
      const response = await handle(request)
      const headers = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })
      res.writeHead(response.status, headers)
      if (request.method === 'HEAD') {
        res.end()
        return
      }
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (error) {
      try {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
      } catch {
        /* response already gone */
      }
    }
  }

  function dispose() {
    disposed = true
    if (spawnDeadline !== null) {
      clearTimeout(spawnDeadline)
      spawnDeadline = null
    }
    void stop()
  }

  return {
    handle,
    handleNode,
    status,
    start,
    stop,
    dispose,
    electronPath: electron.path,
    get config() {
      return { ...config, symbols: config.symbols.slice(), catalog: { ...config.catalog }, position: { ...config.position } }
    },
    paths: { config: configPath, window: windowPath, helper: helperRoot },
  }
}

function json(value, statusCode = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status: statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extraHeaders,
    },
  })
}
