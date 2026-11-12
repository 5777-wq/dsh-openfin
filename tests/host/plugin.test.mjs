// Wiring test for the Host half: `apply()` is the only place that knows how the
// routes, the shared cache and the loaders fit together, so it is worth one
// end-to-end check that does not need a running harness.
//
// The upstream network is replaced by a fixture-backed `fetch`; the HUD state
// directory is redirected to a temp dir so the test can never spawn the desktop
// helper from the developer's real configuration.
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { apply, inject, name } from '../../index.js'
import { fixture } from './helpers.mjs'

const ulist = await fixture('eastmoney/quotes-ulist.json')
const trend = await fixture('eastmoney/trend-sh000001.json')
const boards = await fixture('eastmoney/boards-industry.json')
const sector = await fixture('eastmoney/sector-BK1295.json')
const boardMeta = await fixture('eastmoney/board-meta-BK1295.json')
const moversUp = await fixture('eastmoney/movers-gainers.json')
const moversDown = await fixture('eastmoney/movers-losers.json')
const moversActive = await fixture('eastmoney/movers-active.json')
const news = await fixture('eastmoney/news-column.json')
const binance = await fixture('crypto/binance-tickers.json')
const klines = await fixture('crypto/binance-klines-btc.json')

/** Serve fixtures by URL and record the request count. */
function stubFetch() {
  const calls = []
  const respond = (body) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
  globalThis.fetch = async (url) => {
    const href = String(url)
    calls.push(href)
    if (href.includes('ulist.np/get')) return respond(ulist)
    if (href.includes('trends2/get')) return respond(trend)
    if (href.includes('binance.com/api/v3/ticker')) return respond(binance)
    if (href.includes('binance.com/api/v3/klines')) return respond(klines)
    if (href.includes('getNewsByColumns')) return respond(news)
    if (href.includes('clist/get')) {
      // URLSearchParams decodes the `+` separators eastmoney uses, so compare
      // on the decoded form.
      const params = new URL(href).searchParams
      const fs = String(params.get('fs') ?? '').replaceAll(' ', '+')
      const fid = params.get('fid')
      const po = params.get('po')
      if (fs === 'm:90+t:2') return respond(boards)
      if (fs.startsWith('b:')) return respond(sector)
      if (fid === 'f3' && po === '1') return respond(moversUp)
      if (fid === 'f3' && po === '0') return respond(moversDown)
      if (fid === 'f6' && po === '1') return respond(moversActive)
    }
    if (href.includes('secid=90.BK1295')) return respond(boardMeta)
    throw new Error(`unexpected upstream url: ${href}`)
  }
  return calls
}

function fakeContext() {
  const routes = []
  const disposers = []
  return {
    routes,
    ctx: {
      effect(fn, label) {
        const dispose = fn()
        if (typeof dispose === 'function') disposers.push(dispose)
        void label
      },
      webServer: {
        register(options) {
          routes.push(options)
          return () => {}
        },
        getOrigin: () => 'http://127.0.0.1:1',
      },
      logger: { info() {}, warn() {} },
    },
    disposers,
  }
}

/** @param {Array<{ kind: string, path: string, resource?: Function, handler?: Function }>} routes */
function findRoute(routes, path) {
  const route = routes.find((entry) => entry.path === path)
  assert.ok(route, `no route registered for ${path}`)
  return route
}

/**
 * Drive a node:http handler the way the web server does. The HUD route is a
 * `handler`, not a `resource`, because it also accepts POST.
 */
async function callHandler(handler, url, method = 'GET') {
  const body = []
  const res = {
    statusCode: 0,
    headers: {},
    writeHead(status, headers) {
      this.statusCode = status
      this.headers = headers ?? {}
    },
    end(chunk) {
      if (chunk !== undefined) body.push(Buffer.from(chunk))
    },
  }
  const req = {
    method,
    url,
    headers: {},
    async *[Symbol.asyncIterator]() {
      /* no request body in these cases */
    },
  }
  await handler(req, res)
  const text = Buffer.concat(body).toString('utf8')
  return { status: res.statusCode, headers: res.headers, text, json: text === '' ? undefined : JSON.parse(text) }
}

test('apply wires every route and the HUD reuses the snapshot quotes cache', async (t) => {
  const previousHome = process.env.DSH_HOME
  const home = await mkdtemp(join(tmpdir(), 'dsh-openfin-plugin-'))
  const previousFetch = globalThis.fetch
  process.env.DSH_HOME = home
  const calls = stubFetch()
  const { ctx, routes, disposers } = fakeContext()

  t.after(async () => {
    for (const dispose of disposers) {
      try {
        await dispose()
      } catch {
        /* best effort */
      }
    }
    globalThis.fetch = previousFetch
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await rm(home, { recursive: true, force: true })
  })

  assert.equal(name, 'dsh-openfin')
  assert.deepEqual(inject, ['webServer'])
  apply(ctx)

  assert.deepEqual(
    routes.map((route) => `${route.kind} ${route.path}`),
    ['prefix /dsh-openfin', 'prefix /dsh-openfin/lens', 'prefix /dsh-openfin/api/hud'],
  )

  const resource = findRoute(routes, '/dsh-openfin').resource
  const get = (path) => resource(new Request(`http://127.0.0.1:1/dsh-openfin${path}`))

  // 1. The dashboard snapshot populates the shared `part:quotes` entry.
  const snapshot = await (await get('/api/snapshot')).json()
  assert.equal(snapshot.parts.every((part) => part.ok), true)
  const ulistCalls = () => calls.filter((url) => url.includes('ulist.np/get')).length
  assert.equal(ulistCalls(), 1)

  // 2. The floating HUD asks for one built-in symbol: it must join the same
  //    cache entry instead of issuing its own index request. The HUD route is a
  //    node handler (it also serves POST), so it is driven directly.
  const hudRoute = findRoute(routes, '/dsh-openfin/api/hud')
  const hudQuotes = (
    await callHandler(hudRoute.handler, '/dsh-openfin/api/hud/quotes?ids=sh000001')
  ).json
  assert.equal(hudQuotes.quotes.length, 1)
  assert.equal(hudQuotes.quotes[0].id, 'sh000001')
  assert.equal(ulistCalls(), 1, 'the HUD must not refetch the index list')

  // 3. A sector drawer reopened inside the window is served from cache.
  const before = calls.length
  const first = await (await get('/api/sector?code=BK1295')).json()
  const afterFirst = calls.length
  const second = await (await get('/api/sector?code=BK1295')).json()
  assert.deepEqual(second, first)
  assert.equal(calls.length, afterFirst, 'the second sector open must not hit upstream')
  assert.equal(afterFirst - before, 2, 'one constituent call and one meta call')

  // 4. Committed content is served, and a bad query is a 400 rather than a 500.
  assert.equal((await get('/api/glossary')).status, 200)
  assert.equal((await get('/api/academy')).status, 200)
  assert.equal((await get('/api/sector')).status, 400)
  assert.equal((await get('/api/nope')).status, 404)
})
