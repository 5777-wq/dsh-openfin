/**
 * Host-side tests for the floating HUD manager (lib/hud.js).
 *
 * Everything is injected: no real Electron process, no network, no writes
 * outside a temp directory. The real helper is exercised manually with
 * `--openfin-capture <png>` (see docs/SPEC.md).
 */
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, it } from 'node:test'

import {
  HUD_DEFAULTS,
  SYMBOL_IDS,
  createHud,
  findElectron,
  normalizeConfig,
} from '../../lib/hud.js'

const homes = []

function makeHome() {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-openfin-hud-'))
  homes.push(dir)
  return dir
}

afterEach(() => {
  while (homes.length > 0) {
    const dir = homes.pop()
    try {
      rmSync(dir, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
})

/** A ChildProcess lookalike: records args, emits when told. */
function fakeSpawnFactory(options = {}) {
  const calls = []
  const spawn = (command, args, spawnOptions) => {
    const child = new EventEmitter()
    child.command = command
    child.args = args
    child.spawnOptions = spawnOptions
    child.pid = 4242
    child.exitCode = null
    child.stderr = new EventEmitter()
    child.killed = false
    child.kill = (signal) => {
      child.killed = true
      child.killedWith = signal
      child.exitCode = 0
      return true
    }
    calls.push(child)
    if (options.emitSpawn !== false) {
      queueMicrotask(() => child.emit('spawn'))
    }
    return child
  }
  return { spawn, calls }
}

function fakeExists(map) {
  return (path) => Boolean(map[path])
}

function postRequest(body) {
  return new Request('http://127.0.0.1:1/dsh-openfin/api/hud', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('normalizeConfig', () => {
  it('returns the documented defaults from an empty patch', () => {
    const config = normalizeConfig(HUD_DEFAULTS, {})
    assert.equal(config.version, 1)
    assert.equal(config.inline, false)
    assert.equal(config.desktop, false)
    assert.deepEqual(config.symbols, ['sh000001', 'sz399001', 'hkHSI', 'usIXIC', 'btc'])
    assert.equal(config.opacity, 85)
    assert.equal(config.idleAfterMs, 30000)
    assert.equal(config.size, 'm')
    assert.equal(config.title, 'OpenFin')
  })

  it('clamps numbers and drops unknown symbols', () => {
    const config = normalizeConfig(HUD_DEFAULTS, {
      opacity: 5,
      idleOpacity: 400,
      idleAfterMs: 1000,
      size: 'xl',
      symbols: ['nope', 'sh000001', 'sh000001', 'sz399001'],
    })
    assert.equal(config.opacity, 20)
    assert.equal(config.idleOpacity, 100)
    assert.equal(config.idleAfterMs, 5000)
    assert.equal(config.size, 'm')
    assert.deepEqual(config.symbols, ['sh000001', 'sz399001'])
  })

  it('keeps idle fade explicitly off and caps symbols at six', () => {
    const config = normalizeConfig(HUD_DEFAULTS, {
      idleAfterMs: 0,
      symbols: SYMBOL_IDS,
    })
    assert.equal(config.idleAfterMs, 0)
    assert.equal(config.symbols.length, 6)
  })

  it('truncates the title and rejects a blank one', () => {
    assert.equal(normalizeConfig(HUD_DEFAULTS, { title: 'x'.repeat(40) }).title.length, 18)
    assert.equal(normalizeConfig(HUD_DEFAULTS, { title: '   ' }).title, 'OpenFin')
  })

  it('ignores a malformed position', () => {
    assert.deepEqual(normalizeConfig(HUD_DEFAULTS, { position: { x: 'a', y: 3 } }).position, { x: 0, y: 0 })
    assert.deepEqual(normalizeConfig(HUD_DEFAULTS, { position: { x: 12.4, y: -8.6 } }).position, { x: 12, y: -9 })
  })
})

describe('findElectron', () => {
  it('prefers an explicit environment override', () => {
    const explicit = join('C:', 'custom', 'electron.exe')
    const shared = join('C:', 'home', 'electron', 'electron.exe')
    const found = findElectron({
      platform: 'win32',
      env: { DSH_OPENFIN_ELECTRON: explicit },
      home: join('C:', 'home'),
      exists: fakeExists({ [explicit]: true, [shared]: true }),
    })
    assert.deepEqual(found, { path: explicit, source: 'env' })
  })

  it('falls back to the shared DSH_HOME runtime', () => {
    const shared = join('C:', 'home', 'electron', 'electron.exe')
    const found = findElectron({
      platform: 'win32',
      env: {},
      home: join('C:', 'home'),
      exists: fakeExists({ [shared]: true }),
    })
    assert.deepEqual(found, { path: shared, source: 'dsh-home' })
  })

  it('falls back to PATH', () => {
    const expected = join('/usr/bin', 'electron')
    const found = findElectron({
      platform: 'linux',
      env: { PATH: join('/usr', 'bin') },
      home: join('/home', 'u', '.dsh'),
      exists: fakeExists({ [expected]: true }),
    })
    assert.deepEqual(found, { path: expected, source: 'path' })
  })

  it('reports no runtime instead of throwing', () => {
    assert.deepEqual(
      findElectron({ platform: 'win32', env: { PATH: '' }, home: 'C:/none', exists: () => false }),
      { path: null, source: null },
    )
  })
})

describe('createHud', () => {
  it('starts from defaults and reports the documented status shape', () => {
    const home = makeHome()
    const hud = createHud({ home, platform: 'win32', env: {}, exists: () => false, origin: 'http://127.0.0.1:1' })
    const status = hud.status()
    assert.equal(status.available, false)
    assert.equal(status.running, false)
    assert.equal(status.electron.path, null)
    assert.match(status.reason, /Electron/)
    assert.deepEqual(status.config.symbols, HUD_DEFAULTS.symbols)
    assert.equal(status.window, null)
  })

  it('loads a persisted config and merges a POST patch', async () => {
    const home = makeHome()
    mkdirSync(join(home, 'dsh-openfin'), { recursive: true })
    writeFileSync(
      join(home, 'dsh-openfin', 'hud.json'),
      JSON.stringify({ opacity: 42, symbols: ['btc'], desktop: false }),
      'utf8',
    )
    const hud = createHud({ home, platform: 'win32', env: {}, exists: () => false, origin: 'http://127.0.0.1:1' })
    assert.equal(hud.status().config.opacity, 42)
    assert.deepEqual(hud.status().config.symbols, ['btc'])

    const response = await hud.handle(postRequest({ config: { opacity: 70, title: '摸鱼' } }))
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.config.opacity, 70)
    assert.equal(body.config.title, '摸鱼')
    const persisted = JSON.parse(readFileSync(join(home, 'dsh-openfin', 'hud.json'), 'utf8'))
    assert.equal(persisted.opacity, 70)
    hud.dispose()
  })

  it('answers 400 for malformed bodies and 405 for unsupported methods', async () => {
    const home = makeHome()
    const hud = createHud({ home, platform: 'win32', env: {}, exists: () => false, origin: 'http://127.0.0.1:1' })
    const badJson = await hud.handle(
      new Request('http://x/dsh-openfin/api/hud', { method: 'POST', body: '{nope' }),
    )
    assert.equal(badJson.status, 400)
    const badConfig = await hud.handle(postRequest({ config: 'nope' }))
    assert.equal(badConfig.status, 400)
    const badDesktop = await hud.handle(postRequest({ desktop: 'yes' }))
    assert.equal(badDesktop.status, 400)
    const put = await hud.handle(new Request('http://x/dsh-openfin/api/hud', { method: 'PUT' }))
    assert.equal(put.status, 405)
    hud.dispose()
  })

  it('refuses to open the desktop window without an Electron runtime', async () => {
    const home = makeHome()
    const hud = createHud({ home, platform: 'win32', env: {}, exists: () => false, origin: 'http://127.0.0.1:1' })
    const response = await hud.handle(postRequest({ desktop: true }))
    assert.equal(response.status, 409)
    assert.equal((await response.json()).running, false)
    hud.dispose()
  })

  it('spawns once with namespaced equals-form args and a clean env', async () => {
    const home = makeHome()
    const electronPath = join(home, 'electron', 'electron.exe')
    mkdirSync(join(home, 'electron'), { recursive: true })
    writeFileSync(electronPath, '')
    const { spawn, calls } = fakeSpawnFactory()
    const env = { DSH_HOME: home, PATH: '', ELECTRON_RUN_AS_NODE: '1', KEEP_ME: 'yes' }
    const hud = createHud({
      home,
      platform: 'win32',
      env,
      exists: fakeExists({ [electronPath]: true }),
      spawn,
      origin: 'http://127.0.0.1:64027',
    })

    const response = await hud.handle(postRequest({ desktop: true }))
    assert.equal(response.status, 200)
    assert.equal(calls.length, 1)
    const [command, args, options] = [calls[0].command, calls[0].args, calls[0].spawnOptions]
    assert.equal(command, electronPath)
    assert.ok(args.includes('--openfin-host=http://127.0.0.1:64027'))
    assert.ok(args.some((arg) => arg.startsWith('--openfin-config=')))
    assert.ok(args.some((arg) => arg.startsWith('--openfin-parent-pid=')))
    assert.ok(args.includes('--openfin-size=m'))
    assert.ok(args.every((arg) => arg.startsWith('--')), 'every helper arg is a --key=value token')
    assert.equal(options.env.ELECTRON_RUN_AS_NODE, undefined)
    assert.equal(options.env.KEEP_ME, 'yes')
    assert.equal(hud.status().running, true)

    // A second request while running does not spawn again.
    const again = await hud.handle(postRequest({ desktop: true }))
    assert.equal(again.status, 200)
    assert.equal(calls.length, 1)

    await hud.handle(postRequest({ desktop: false }))
    assert.equal(calls[0].killed, true)
    assert.equal(hud.status().running, false)
    hud.dispose()
  })

  it('marks the helper as stopped when the child exits by itself', async () => {
    const home = makeHome()
    const electronPath = join(home, 'electron', 'electron.exe')
    mkdirSync(join(home, 'electron'), { recursive: true })
    writeFileSync(electronPath, '')
    const { spawn, calls } = fakeSpawnFactory()
    const hud = createHud({
      home,
      platform: 'win32',
      env: { DSH_HOME: home, PATH: '' },
      exists: fakeExists({ [electronPath]: true }),
      spawn,
      origin: 'http://127.0.0.1:1',
    })
    await hud.handle(postRequest({ desktop: true }))
    assert.equal(hud.status().running, true)
    calls[0].emit('exit', 1, null)
    assert.equal(hud.status().running, false)
    assert.match(hud.status().reason, /exited|code/)
    hud.dispose()
  })

  it('reports a spawn deadline instead of hanging', async () => {
    const home = makeHome()
    const electronPath = join(home, 'electron', 'electron.exe')
    mkdirSync(join(home, 'electron'), { recursive: true })
    writeFileSync(electronPath, '')
    const { spawn } = fakeSpawnFactory({ emitSpawn: false })
    const hud = createHud({
      home,
      platform: 'win32',
      env: { DSH_HOME: home, PATH: '' },
      exists: fakeExists({ [electronPath]: true }),
      spawn,
      origin: 'http://127.0.0.1:1',
      spawnDeadlineMs: 30,
    })
    await hud.handle(postRequest({ desktop: true }))
    await new Promise((resolve) => setTimeout(resolve, 60))
    assert.equal(hud.status().running, false)
    assert.match(hud.status().reason, /did not start/i)
    hud.dispose()
  })

  it('writes a recenter request the helper can observe', async () => {
    const home = makeHome()
    const hud = createHud({ home, platform: 'win32', env: {}, exists: () => false, origin: 'http://127.0.0.1:1' })
    const response = await hud.handle(postRequest({ action: 'recenter' }))
    assert.equal(response.status, 200)
    const state = JSON.parse(readFileSync(join(home, 'dsh-openfin', 'hud-window.json'), 'utf8'))
    assert.equal(state.bounds, null)
    assert.equal(typeof state.recenterAt, 'number')
    hud.dispose()
  })

  it('exposes no config file until the user changes something', () => {
    const home = makeHome()
    const hud = createHud({ home, platform: 'win32', env: {}, exists: () => false, origin: 'http://127.0.0.1:1' })
    assert.equal(existsSync(join(home, 'dsh-openfin', 'hud.json')), false)
    hud.dispose()
  })
})
