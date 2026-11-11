/**
 * dsh-openfin floating HUD — Electron main process.
 *
 * Started by the plugin's Host half (`lib/hud.js`) as a separate Electron
 * process. It is a display surface and nothing else:
 *
 *   - one frameless, transparent, always-on-top, taskbar-less window
 *   - the main process fetches `GET <host>/dsh-openfin/api/snapshot` with Node
 *     fetch (no browser origin, no auth), watches the plugin's hud.json for
 *     config changes, and pushes `{ config, snapshot }` to the renderer
 *   - native window opacity + idle fade are applied here; the renderer only
 *     reports pointer enter/leave and asks to close
 *   - bounds are persisted to hud-window.json and clamped to the display work
 *     area; `recenterAt` in that file means "move to the default corner"
 *
 * This file is CommonJS with no dependencies on purpose: it is shipped inside
 * the plugin package and launched by path with no install step.
 */
const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const READY_TIMEOUT_MS = 4000
const CONFIG_POLL_MS = 2000
const SNAPSHOT_POLL_MS = 15000
const PARENT_POLL_MS = 3000
const SAVE_DEBOUNCE_MS = 350

const WIDTHS = { s: 300, m: 340, l: 384 }
const ROW_HEIGHTS = { s: 26, m: 30, l: 34 }
const HEADER_HEIGHT = 44
const FOOTER_HEIGHT = 21
const CARD_PADDING = 10

const DEFAULT_CONFIG = {
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
  direction: 'cn',
  position: { x: 0, y: 0 },
}

/** Parse `--key value` pairs from argv. */
function parseArgs(argv) {
  const out = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const body = token.slice(2)
    const equals = body.indexOf('=')
    if (equals !== -1) {
      out[body.slice(0, equals)] = body.slice(equals + 1)
      continue
    }
    const next = argv[index + 1]
    if (next === undefined || next.startsWith('--')) {
      out[body] = true
    } else {
      out[body] = next
      index += 1
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const configPath = typeof args['openfin-config'] === 'string' ? args['openfin-config'] : ''
const windowConfigPath = typeof args['openfin-window'] === 'string' ? args['openfin-window'] : ''
const hostOrigin = typeof args['openfin-host'] === 'string' ? args['openfin-host'].replace(/\/+$/, '') : ''
const parentPid = Number.parseInt(String(args['openfin-parent-pid'] ?? ''), 10)
const capturePath = typeof args['openfin-capture'] === 'string' ? args['openfin-capture'] : ''

let config = { ...DEFAULT_CONFIG }
let snapshot = null
let lastSnapshotError = ''
let win = null
let hovering = false
let idleTimer = null
let configStamp = ''
let lastRecenterAt = 0
let saveTimer = null
let quitting = false

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(file, value) {
  if (typeof file !== 'string' || file === '') return
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    const temporary = `${file}.${process.pid}.tmp`
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', 'utf8')
    fs.renameSync(temporary, file)
  } catch {
    /* a HUD that cannot persist is still usable */
  }
}

/** The Host validates too; this keeps a hand-edited file from breaking the window. */
function sanitizeConfig(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const size = ['s', 'm', 'l'].includes(source.size) ? source.size : DEFAULT_CONFIG.size
  const symbols = Array.isArray(source.symbols) && source.symbols.length > 0
    ? source.symbols.filter((id) => typeof id === 'string').slice(0, 6)
    : DEFAULT_CONFIG.symbols
  const clamp = (value, min, max, fallback) => {
    const number = Number(value)
    if (!Number.isFinite(number)) return fallback
    return Math.min(max, Math.max(min, Math.round(number)))
  }
  return {
    ...DEFAULT_CONFIG,
    ...source,
    size,
    symbols,
    opacity: clamp(source.opacity, 20, 100, DEFAULT_CONFIG.opacity),
    idleOpacity: clamp(source.idleOpacity, 20, 100, DEFAULT_CONFIG.idleOpacity),
    idleAfterMs: Number(source.idleAfterMs) === 0 ? 0 : clamp(source.idleAfterMs, 5000, 600000, DEFAULT_CONFIG.idleAfterMs),
    title: typeof source.title === 'string' && source.title.trim() !== '' ? source.title.trim().slice(0, 18) : DEFAULT_CONFIG.title,
    showSpark: source.showSpark !== false,
    hoverFull: source.hoverFull !== false,
    direction: source.direction === 'intl' ? 'intl' : 'cn',
  }
}

function loadConfig() {
  const next = sanitizeConfig(readJson(configPath, DEFAULT_CONFIG))
  const stamp = JSON.stringify(next)
  const changed = stamp !== configStamp
  config = next
  configStamp = stamp
  if (changed) applyConfig()
  return changed
}

function windowHeight() {
  const rowHeight = ROW_HEIGHTS[config.size] || ROW_HEIGHTS.m
  const rows = Math.max(1, Math.min(6, config.symbols.length))
  return HEADER_HEIGHT + rows * rowHeight + FOOTER_HEIGHT + CARD_PADDING * 2
}

function windowWidth() {
  return WIDTHS[config.size] || WIDTHS.m
}

function defaultBounds() {
  const display = screen.getPrimaryDisplay()
  const area = display.workArea
  const width = windowWidth()
  const height = windowHeight()
  return {
    x: Math.round(area.x + area.width - width - 16),
    y: Math.round(area.y + area.height - height - 16),
    width,
    height,
  }
}

function clampBounds(bounds) {
  const display = screen.getDisplayMatching({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  })
  const area = display.workArea
  const width = Math.min(bounds.width, area.width)
  const height = Math.min(bounds.height, area.height)
  return {
    x: Math.min(Math.max(bounds.x, area.x), area.x + area.width - width),
    y: Math.min(Math.max(bounds.y, area.y), area.y + area.height - height),
    width,
    height,
  }
}

function savedBounds() {
  const state = readJson(windowConfigPath, null)
  const bounds = state && state.bounds
  if (!bounds) return null
  if (![bounds.x, bounds.y, bounds.width, bounds.height].every((value) => Number.isFinite(value))) return null
  return clampBounds(bounds)
}

function saveBoundsSoon() {
  if (windowConfigPath === '') return
  if (saveTimer !== null) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    if (win === null || win.isDestroyed()) return
    const bounds = win.getBounds()
    const state = readJson(windowConfigPath, {})
    writeJson(windowConfigPath, { ...state, bounds })
  }, SAVE_DEBOUNCE_MS)
  if (typeof saveTimer.unref === 'function') saveTimer.unref()
}

function applyOpacity() {
  if (win === null || win.isDestroyed()) return
  const value = hovering && config.hoverFull ? config.opacity : config.opacity
  win.setOpacity(Math.min(1, Math.max(0.2, value / 100)))
}

function scheduleIdle() {
  if (idleTimer !== null) clearTimeout(idleTimer)
  idleTimer = null
  if (!Number.isFinite(config.idleAfterMs) || config.idleAfterMs <= 0) return
  idleTimer = setTimeout(() => {
    idleTimer = null
    if (hovering || win === null || win.isDestroyed()) return
    win.setOpacity(Math.min(1, Math.max(0.2, config.idleOpacity / 100)))
  }, config.idleAfterMs)
  if (typeof idleTimer.unref === 'function') idleTimer.unref()
}

function setHovering(next) {
  hovering = next
  if (win === null || win.isDestroyed()) return
  if (hovering) {
    win.setOpacity(Math.min(1, Math.max(0.2, config.opacity / 100)))
    if (idleTimer !== null) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
  } else {
    scheduleIdle()
  }
}

function applyConfig() {
  if (win === null || win.isDestroyed()) return
  const height = windowHeight()
  const width = windowWidth()
  const bounds = win.getBounds()
  if (bounds.width !== width || bounds.height !== height) {
    win.setContentSize(width, height)
  }
  win.setOpacity(Math.min(1, Math.max(0.2, config.opacity / 100)))
  scheduleIdle()
  sendState()
}

function sendState() {
  if (win === null || win.isDestroyed() || win.webContents.isLoading()) return
  win.webContents.send('hud:state', {
    config,
    snapshot,
    error: lastSnapshotError,
    updatedAt: Date.now(),
  })
}

async function fetchSnapshot() {
  if (hostOrigin === '') {
    lastSnapshotError = 'host origin missing'
    return
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(`${hostOrigin}/dsh-openfin/api/snapshot`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    })
    clearTimeout(timer)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    snapshot = await response.json()
    lastSnapshotError = ''
  } catch (error) {
    lastSnapshotError = error instanceof Error ? error.message : String(error)
  }
  sendState()
}

function checkRecenter() {
  if (windowConfigPath === '') return
  const state = readJson(windowConfigPath, null)
  if (!state || !Number.isFinite(state.recenterAt)) return
  if (state.recenterAt <= lastRecenterAt) return
  lastRecenterAt = state.recenterAt
  if (win === null || win.isDestroyed()) return
  const bounds = defaultBounds()
  win.setBounds(bounds)
  saveBoundsSoon()
}

function parentAlive() {
  if (!Number.isFinite(parentPid) || parentPid <= 0) return true
  try {
    process.kill(parentPid, 0)
    return true
  } catch {
    return false
  }
}

function createWindow() {
  const bounds = savedBounds() ?? defaultBounds()
  win = new BrowserWindow({
    ...bounds,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false,
    },
  })
  win.setMenu(null)
  win.setAlwaysOnTop(true, 'screen-saver')
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    app.dock?.hide()
  }
  win.loadFile(path.join(__dirname, 'hud.html'))
  win.webContents.on('did-finish-load', () => {
    sendState()
    win.setOpacity(Math.min(1, Math.max(0.2, config.opacity / 100)))
    win.showInactive()
    if (capturePath !== '') {
      setTimeout(async () => {
        try {
          const image = await win.webContents.capturePage()
          fs.mkdirSync(path.dirname(capturePath), { recursive: true })
          fs.writeFileSync(capturePath, image.toPNG())
        } catch {
          /* the capture aid is best effort */
        }
        app.quit()
      }, 1800)
    }
  })
  win.webContents.on('render-process-gone', () => app.quit())
  win.on('move', saveBoundsSoon)
  win.on('resize', saveBoundsSoon)
  win.on('closed', () => app.quit())
}

function start() {
  Menu.setApplicationMenu(null)
  // One helper per Host: the Host spawns at most one and kills it on dispose.
  // Electron's process singleton is intentionally not used here.
  app.on('window-all-closed', () => app.quit())
  app.whenReady().then(() => {
    loadConfig()
    createWindow()
    setInterval(() => {
      loadConfig()
      checkRecenter()
    }, CONFIG_POLL_MS).unref?.()
    setInterval(fetchSnapshot, SNAPSHOT_POLL_MS).unref?.()
    setInterval(() => {
      if (!quitting && !parentAlive()) {
        quitting = true
        app.quit()
      }
    }, PARENT_POLL_MS).unref?.()
    fetchSnapshot()
  })

  ipcMain.on('hud:hover', (_event, value) => setHovering(Boolean(value)))
  ipcMain.on('hud:close', () => {
    quitting = true
    if (win !== null && !win.isDestroyed()) win.close()
    app.quit()
  })
  ipcMain.on('hud:ready', () => sendState())

  setTimeout(() => {
    if (win !== null && !win.isVisible() && !capturePath) win.showInactive()
  }, READY_TIMEOUT_MS).unref?.()
}

app.on('before-quit', () => {
  quitting = true
})

start()
