/**
 * Shared floating-HUD config store (client half).
 *
 * The Host owns the authoritative copy (`$DSH_HOME/dsh-openfin/hud.json`) for
 * the desktop helper; the page keeps a mirror in `localStorage` so the widget
 * paints instantly and survives a reload without waiting for a request. Every
 * local change is written through and then POSTed to `/api/hud` on a short
 * debounce; the Host normalizes the same way, so the two copies converge.
 *
 * `inline` is opt-in: nothing floats on first load until the user turns it on
 * from the settings sheet. v0.3 adds custom instruments (`em:<secid>` symbols
 * with a small name/market `catalog`) and the boss-key panic settings.
 */

import { getHud, postHud } from './api.js'

/** localStorage mirror key. */
export const STORAGE_KEY = 'dsh-openfin:hud'
/** Window event the page header uses to open the settings sheet. */
export const SETTINGS_EVENT = 'dsh-openfin:hud-settings'

/** Debounce for `syncHudConfig`; a desktop toggle bypasses it. */
const SYNC_DELAY_MS = 400
const MAX_SYMBOLS = 6
const MAX_CATALOG = 12
const CATALOG_NAME_MAX = 24
const MIN_OPACITY = 20
const MAX_OPACITY = 100
const MIN_IDLE_MS = 5000
const MAX_IDLE_MS = 600000
const TITLE_MAX = 18
const SIZES = new Set(['s', 'm', 'l'])
/** An eastmoney `QuoteID`: market number + `.` + code (`1.600519`, `105.AAPL`). */
const SECID_RE = /^\d{1,3}\.[A-Za-z0-9_]+$/
const CUSTOM_PREFIX = 'em:'
const DEFAULT_PANIC_SHORTCUT = 'CommandOrControl+Shift+H'

/**
 * The boss-key accelerators the Host accepts (Electron accelerator strings).
 * `label` is the human combo for the settings sheet; it stays locale-neutral
 * because the modifier glyphs read the same in both dictionaries.
 */
export const PANIC_SHORTCUTS = Object.freeze(
  [
    { id: 'CommandOrControl+Shift+H', accelerator: 'CommandOrControl+Shift+H', label: 'Ctrl/⌘ + Shift + H' },
    { id: 'Alt+X', accelerator: 'Alt+X', label: 'Alt + X' },
    { id: 'CommandOrControl+Alt+H', accelerator: 'CommandOrControl+Alt+H', label: 'Ctrl/⌘ + Alt + H' },
    {
      id: 'CommandOrControl+Shift+Space',
      accelerator: 'CommandOrControl+Shift+Space',
      label: 'Ctrl/⌘ + Shift + Space',
    },
  ].map((entry) => Object.freeze(entry)),
)
const PANIC_ACCELERATORS = new Set(PANIC_SHORTCUTS.map((entry) => entry.accelerator))

/**
 * The eleven built-in instruments the HUD may show, in display order.
 * Ids are the `/api/snapshot` `quotes[].id` values (the Host's `HudConfig`
 * symbol ids and the ids the Electron helper receives are the same list).
 * Custom instruments use `em:<secid>` on top of these.
 */
export const SYMBOLS = Object.freeze(
  [
    { id: 'sh000001', name: '上证指数', kind: 'index' },
    { id: 'sz399001', name: '深证成指', kind: 'index' },
    { id: 'sz399006', name: '创业板指', kind: 'index' },
    { id: 'hkHSI', name: '恒生指数', kind: 'index' },
    { id: 'usIXIC', name: '纳斯达克', kind: 'index' },
    { id: 'usSPX', name: '标普500', kind: 'index' },
    { id: 'usDJIA', name: '道琼斯', kind: 'index' },
    { id: 'hfGC', name: 'COMEX黄金', kind: 'commodity' },
    { id: 'fxUDI', name: '美元指数', kind: 'fx' },
    { id: 'btc', name: 'BTC', kind: 'crypto' },
    { id: 'eth', name: 'ETH', kind: 'crypto' },
  ].map((symbol) => Object.freeze(symbol)),
)

const SYMBOL_IDS = new Set(SYMBOLS.map((symbol) => symbol.id))
const SYMBOL_BY_ID = new Map(SYMBOLS.map((symbol) => [symbol.id, symbol]))

/**
 * Defaults — mirrors SPEC's `HudConfig`. `inline` and `desktop` are off: the
 * HUD has to be invited in. The boss key is on by default.
 */
export const DEFAULT_HUD = Object.freeze({
  version: 1,
  inline: false,
  desktop: false,
  collapsed: false,
  symbols: Object.freeze(['sh000001', 'sz399001', 'hkHSI', 'usIXIC', 'btc']),
  catalog: Object.freeze({}),
  opacity: 85,
  idleOpacity: 35,
  idleAfterMs: 30000,
  hoverFull: true,
  size: 'm',
  title: 'OpenFin',
  showSpark: true,
  position: Object.freeze({ x: 0, y: 0 }),
  panicEnabled: true,
  panicShortcut: DEFAULT_PANIC_SHORTCUT,
})

/** @type {object | null} */
let cache = null
/** @type {Set<Function>} */
const listeners = new Set()
let revision = 0
let reconcileStarted = false
let storageBound = false
let syncTimer = 0
/** @type {object | null} */
let pendingPatch = null

function readStored() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStored(config) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* storage can be disabled; the in-memory copy still works this session */
  }
}

function bool(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function clampNumber(value, min, max, fallback) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function normalizeTitle(value, fallback) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX)
  return trimmed.length > 0 ? trimmed : fallback
}

/** `em:1.600519` → `1.600519`; anything malformed → null. */
function customSecid(id) {
  if (typeof id !== 'string' || !id.startsWith(CUSTOM_PREFIX)) return null
  const secid = id.slice(CUSTOM_PREFIX.length)
  return SECID_RE.test(secid) ? secid : null
}

/** True for a well-formed `em:<secid>` custom instrument id. */
export function isCustomSymbol(id) {
  return customSecid(id) !== null
}

/**
 * Human label for a symbol id: catalog name first (customs), then the built-in
 * table, finally the raw id (which is still better than an empty row).
 *
 * @param {string} id
 * @param {object} [config]
 * @returns {string}
 */
export function instrumentName(id, config) {
  const key = typeof id === 'string' ? id : ''
  const catalog = config && typeof config === 'object' ? config.catalog : null
  const entry = catalog && typeof catalog === 'object' ? catalog[key] : null
  if (entry && typeof entry.name === 'string' && entry.name !== '') return entry.name
  const builtIn = SYMBOL_BY_ID.get(key)
  if (builtIn) return builtIn.name
  return key
}

/** Display label for one of the `PANIC_SHORTCUTS` accelerators ('' if none). */
export function panicShortcutLabel(accelerator) {
  const entry = PANIC_SHORTCUTS.find((preset) => preset.accelerator === accelerator || preset.id === accelerator)
  return entry ? entry.label : ''
}

function normalizeSymbols(value, fallback) {
  if (!Array.isArray(value)) return fallback.slice()
  const seen = new Set()
  const picked = []
  for (const id of value) {
    if (typeof id !== 'string' || seen.has(id)) continue
    if (!SYMBOL_IDS.has(id) && customSecid(id) === null) continue
    seen.add(id)
    picked.push(id)
    if (picked.length >= MAX_SYMBOLS) break
  }
  return picked.length > 0 ? picked : fallback.slice()
}

/**
 * Keep the small name/market catalog for custom instruments only. Entries are
 * pruned to the final `symbols` list (and capped), so removing a chip drops its
 * label as well.
 *
 * @param {object} value
 * @param {string[]} symbols
 * @returns {Record<string, { name: string, secid: string, code: string, market: string, kind: string }>}
 */
function normalizeCatalog(value, symbols) {
  const source = value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const out = {}
  let count = 0
  for (const id of symbols) {
    if (count >= MAX_CATALOG) break
    const secid = customSecid(id)
    if (secid === null) continue
    const entry = source[id]
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, CATALOG_NAME_MAX) : ''
    if (name === '') continue
    out[id] = {
      name,
      secid,
      code: typeof entry.code === 'string' ? entry.code.slice(0, 12) : '',
      market: typeof entry.market === 'string' ? entry.market.slice(0, 12) : '',
      kind: entry.kind === 'index' ? 'index' : 'stock',
    }
    count += 1
  }
  return out
}

function normalizePanic(source, base) {
  const enabled = bool(source.panicEnabled, base.panicEnabled !== false)
  if (!enabled) return { panicEnabled: false, panicShortcut: '' }
  const candidate =
    typeof source.panicShortcut === 'string'
      ? source.panicShortcut
      : typeof base.panicShortcut === 'string'
        ? base.panicShortcut
        : ''
  return {
    panicEnabled: true,
    panicShortcut: PANIC_ACCELERATORS.has(candidate) ? candidate : DEFAULT_PANIC_SHORTCUT,
  }
}

function normalizePosition(value, fallback) {
  if (value === null || typeof value !== 'object') return { x: fallback.x, y: fallback.y }
  const x = Number(value.x)
  const y = Number(value.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { x: fallback.x, y: fallback.y }
  return { x: Math.round(x), y: Math.round(y) }
}

/**
 * Merge a partial config over a base config, clamping every field.
 * Unknown keys are dropped on purpose: `hud.json` is user-editable too.
 *
 * @param {object} base
 * @param {object} patch
 * @returns {object}
 */
function normalizeConfig(base, patch) {
  const source = patch !== null && typeof patch === 'object' ? patch : {}
  const symbols = source.symbols === undefined ? base.symbols.slice() : normalizeSymbols(source.symbols, base.symbols)
  const catalog = normalizeCatalog(source.catalog === undefined ? base.catalog : source.catalog, symbols)
  const panic = normalizePanic(source, base)
  return {
    version: 1,
    inline: bool(source.inline, base.inline),
    desktop: bool(source.desktop, base.desktop),
    collapsed: bool(source.collapsed, base.collapsed),
    symbols,
    catalog,
    opacity:
      source.opacity === undefined
        ? base.opacity
        : clampNumber(source.opacity, MIN_OPACITY, MAX_OPACITY, base.opacity),
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
    hoverFull: bool(source.hoverFull, base.hoverFull),
    size: typeof source.size === 'string' && SIZES.has(source.size) ? source.size : base.size,
    title: source.title === undefined ? base.title : normalizeTitle(source.title, base.title),
    showSpark: bool(source.showSpark, base.showSpark),
    position:
      source.position === undefined
        ? { x: base.position.x, y: base.position.y }
        : normalizePosition(source.position, base.position),
    panicEnabled: panic.panicEnabled,
    panicShortcut: panic.panicShortcut,
  }
}

function cloneCatalog(catalog) {
  const out = {}
  if (catalog !== null && typeof catalog === 'object') {
    for (const [id, entry] of Object.entries(catalog)) out[id] = { ...entry }
  }
  return out
}

function cloneConfig(config) {
  return {
    ...config,
    symbols: Array.isArray(config.symbols) ? config.symbols.slice() : [],
    catalog: cloneCatalog(config.catalog),
    position: { x: config.position.x, y: config.position.y },
  }
}

function sameConfig(left, right) {
  return JSON.stringify(cloneConfig(left)) === JSON.stringify(cloneConfig(right))
}

/** Load the current HUD config (localStorage merged over defaults, clamped). */
export function loadHudConfig() {
  if (cache === null) cache = normalizeConfig(DEFAULT_HUD, readStored() || {})
  return cloneConfig(cache)
}

function notify() {
  const current = loadHudConfig()
  for (const listener of Array.from(listeners)) {
    try {
      listener(current)
    } catch {
      /* one broken subscriber must not starve the others */
    }
  }
}

/**
 * Merge a partial config into the local mirror, persist it, and notify every
 * subscriber. Returns the new full config.
 *
 * @param {object} partial
 * @returns {object}
 */
export function saveHudConfig(partial) {
  if (cache === null) cache = normalizeConfig(DEFAULT_HUD, readStored() || {})
  cache = normalizeConfig(cache, partial && typeof partial === 'object' ? partial : {})
  revision += 1
  writeStored(cache)
  notify()
  return cloneConfig(cache)
}

/**
 * Observe config changes (local saves, the Host reconcile and other tabs).
 * Returns an unsubscribe function.
 *
 * @param {(config: object) => void} listener
 * @returns {() => void}
 */
export function subscribeHudConfig(listener) {
  if (typeof listener !== 'function') return () => {}
  listeners.add(listener)
  if (!storageBound) {
    storageBound = true
    bindStorage()
  }
  if (!reconcileStarted) {
    reconcileStarted = true
    scheduleReconcile()
  }
  return () => {
    listeners.delete(listener)
  }
}

/**
 * POST the config to the Host (debounced 400 ms). `desktop` is stripped: it is
 * pushed immediately by `pushDesktop`, and a late config patch must never undo
 * a desktop toggle.
 *
 * @param {object} [config]
 */
export function syncHudConfig(config) {
  const source = config && typeof config === 'object' ? config : loadHudConfig()
  const { desktop: _desktop, ...patch } = source
  pendingPatch = patch
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(flushSync, SYNC_DELAY_MS)
}

function flushSync() {
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = 0
  }
  const patch = pendingPatch
  pendingPatch = null
  if (!patch) return
  postHud({ config: patch }).catch(() => {
    /* the local copy is still correct; the Host retries on the next change */
  })
}

/**
 * Turn the desktop helper on or off immediately. Any debounced config patch is
 * folded into the same request so ordering cannot invert the desktop flag.
 *
 * @param {boolean} enabled
 * @returns {Promise<object | null>}
 */
export function pushDesktop(enabled) {
  const on = enabled === true
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = 0
  }
  const patch = pendingPatch
  pendingPatch = null
  const body = patch ? { config: patch, desktop: on } : { desktop: on }
  return postHud(body).then(
    (status) => status,
    () => null,
  )
}

/** Ask the page (its overlay slot) to open the floating-HUD settings sheet. */
export function openHudSettings() {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT))
  } catch {
    /* no CustomEvent (old engine): the header button simply does nothing */
  }
}

/**
 * Listen for the "open HUD settings" event. Returns an unsubscribe function.
 *
 * @param {() => void} listener
 * @returns {() => void}
 */
export function onOpenHudSettings(listener) {
  if (typeof window === 'undefined' || typeof listener !== 'function') return () => {}
  const handler = () => listener()
  window.addEventListener(SETTINGS_EVENT, handler)
  return () => {
    window.removeEventListener(SETTINGS_EVENT, handler)
  }
}

/* -------------------------------------------------------------- internals */

function bindStorage() {
  if (typeof window === 'undefined') return
  window.addEventListener('storage', (event) => {
    if (!event || event.key !== STORAGE_KEY || typeof event.newValue !== 'string') return
    let parsed
    try {
      parsed = JSON.parse(event.newValue)
    } catch {
      return
    }
    const next = normalizeConfig(DEFAULT_HUD, parsed !== null && typeof parsed === 'object' ? parsed : {})
    if (cache !== null && sameConfig(cache, next)) return
    cache = next
    revision += 1
    notify()
  })
  // A debounced Host sync must not be lost on tab close/navigation.
  window.addEventListener('pagehide', flushSync)
}

/**
 * Reconcile the localStorage mirror with the Host copy once per page load.
 * The Host wins (= it is the shared copy for the desktop helper); a local edit
 * that lands while the request is in flight wins instead.
 */
function scheduleReconcile() {
  if (typeof window === 'undefined') return
  const run = () => {
    const startedAt = revision
    getHud().then(
      (status) => {
        const hostConfig = status && status.config
        if (!hostConfig || typeof hostConfig !== 'object') return
        if (revision !== startedAt) return
        const next = normalizeConfig(DEFAULT_HUD, hostConfig)
        const local = loadHudConfig()
        if (sameConfig(local, next)) return
        cache = next
        writeStored(cache)
        notify()
      },
      () => {
        /* no Host route (or offline): keep the local mirror */
      },
    )
  }
  if (typeof queueMicrotask === 'function') queueMicrotask(run)
  else setTimeout(run, 0)
}
