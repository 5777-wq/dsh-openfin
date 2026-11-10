import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AcademyUnavailableError } from '../../lib/academy.js'
import { UpstreamError } from '../../lib/upstream.js'
import { createRouter, json, routePath, ROUTE_PREFIX } from '../../lib/routes.js'

const SNAPSHOT = {
  updatedAt: 1,
  refreshMs: 30000,
  stale: false,
  parts: [],
  quotes: [],
  boards: [],
  boardBreadth: { up: 0, down: 0, flat: 0, total: 0 },
  movers: { up: [], down: [], active: [] },
  news: [],
}
const SECTOR = { code: 'BK1295', name: '其他数字媒体', pct: 9.8, stocks: [] }
const INDEX = { articles: [{ id: '2008' }], sections: [{ id: 'all', label: '全部', count: 1 }] }

/** Build a router with recording fakes; every dependency can be overridden. */
function makeRouter(overrides = {}) {
  const calls = { sector: [] }
  const deps = {
    snapshot: async () => SNAPSHOT,
    loadSector: async (code, options) => {
      calls.sector.push({ code, options })
      return code === 'BK1295' ? SECTOR : null
    },
    academy: {
      getIndex: async () => INDEX,
      getArticle: async (id) => (id === '2008' ? { id, title: 'title', body: 'body' } : null),
      getGlossary: async () => ({ daily: null, terms: [], categories: [] }),
    },
    cachedBoards: () => [{ code: 'BK1295', name: '其他数字媒体', pct: 9.8, price: 1622.11 }],
    now: () => 12345,
    ...overrides,
  }
  return { route: createRouter(deps), calls }
}

/** @param {(request: Request) => Promise<Response>} route */
async function get(route, path) {
  return route(new Request(`http://127.0.0.1:61001${path}`))
}

test('routePath maps the registered prefix and rejects foreign paths', () => {
  assert.equal(routePath(`${ROUTE_PREFIX}/api/snapshot`), '/api/snapshot')
  assert.equal(routePath(ROUTE_PREFIX), '/')
  assert.equal(routePath('/other/api/snapshot'), null)
  assert.equal(routePath('/dsh-openfinx'), null)
})

test('GET /api/snapshot is JSON with no-store', async () => {
  const { route } = makeRouter()
  const response = await get(route, `${ROUTE_PREFIX}/api/snapshot`)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /application\/json/)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.match(response.headers.get('x-content-type-options'), /nosniff/)
  assert.deepEqual(await response.json(), SNAPSHOT)
})

test('GET /ping stays available for the earlier client skeleton', async () => {
  const { route } = makeRouter()
  const response = await get(route, `${ROUTE_PREFIX}/ping`)
  assert.deepEqual(await response.json(), { ok: true, at: 12345 })
})

test('academy endpoints are cacheable for 300 seconds', async () => {
  const { route } = makeRouter()
  for (const path of [`${ROUTE_PREFIX}/api/academy`, `${ROUTE_PREFIX}/api/glossary`]) {
    const response = await get(route, path)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300')
  }
  const article = await get(route, `${ROUTE_PREFIX}/api/academy/article?id=2008`)
  assert.equal(article.status, 200)
  assert.equal(article.headers.get('cache-control'), 'public, max-age=300')
  assert.equal((await article.json()).id, '2008')
})

test('GET /api/academy/article validates and reports unknown ids', async () => {
  const { route } = makeRouter()
  for (const query of ['', '?id=', '?id=..%2Fpackage', '?id=has%20space']) {
    const response = await get(route, `${ROUTE_PREFIX}/api/academy/article${query}`)
    assert.equal(response.status, 400)
    assert.equal(typeof (await response.json()).error, 'string')
  }
  const missing = await get(route, `${ROUTE_PREFIX}/api/academy/article?id=unknown`)
  assert.equal(missing.status, 404)
})

test('GET /api/sector validates, uppercases and forwards the cached boards', async () => {
  const { route, calls } = makeRouter()
  const response = await get(route, `${ROUTE_PREFIX}/api/sector?code=bk1295`)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await response.json(), SECTOR)
  assert.equal(calls.sector.length, 1)
  assert.equal(calls.sector[0].code, 'BK1295')
  assert.deepEqual(calls.sector[0].options.fallbackBoards, [
    { code: 'BK1295', name: '其他数字媒体', pct: 9.8, price: 1622.11 },
  ])

  const unknown = await get(route, `${ROUTE_PREFIX}/api/sector?code=BK9999`)
  assert.equal(unknown.status, 404)
})

test('GET /api/sector without a code is a 400', async () => {
  const { route } = makeRouter()
  const response = await get(route, `${ROUTE_PREFIX}/api/sector`)
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /code is required/)
})

test('unknown routes and foreign paths answer 404 JSON', async () => {
  const { route } = makeRouter()
  for (const path of [`${ROUTE_PREFIX}/api/nope`, '/elsewhere', ROUTE_PREFIX]) {
    const response = await get(route, path)
    assert.equal(response.status, 404)
    assert.equal(typeof (await response.json()).error, 'string')
  }
})

test('upstream failures answer 502 and never throw', async () => {
  const { route } = makeRouter({
    loadSector: async () => {
      throw new UpstreamError('down', { code: 'timeout' })
    },
  })
  const response = await get(route, `${ROUTE_PREFIX}/api/sector?code=BK1295`)
  assert.equal(response.status, 502)
  assert.match((await response.json()).error, /upstream unavailable \(timeout\)/)
})

test('missing academy data answers 503', async () => {
  const { route } = makeRouter({
    academy: {
      getIndex: async () => {
        throw new AcademyUnavailableError('not generated')
      },
      getArticle: async () => null,
      getGlossary: async () => {
        throw new AcademyUnavailableError('not generated')
      },
    },
  })
  for (const path of [`${ROUTE_PREFIX}/api/academy`, `${ROUTE_PREFIX}/api/glossary`]) {
    const response = await get(route, path)
    assert.equal(response.status, 503)
    assert.equal(typeof (await response.json()).error, 'string')
  }
})

test('unexpected handler errors answer 500 JSON instead of crashing the resource', async () => {
  const { route } = makeRouter({
    snapshot: async () => {
      throw new Error('kaboom')
    },
  })
  const response = await get(route, `${ROUTE_PREFIX}/api/snapshot`)
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'internal error' })
})

test('json helper sets status, content type and cache headers', async () => {
  const response = json({ ok: true }, { status: 201, cache: 'no-store' })
  assert.equal(response.status, 201)
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await response.json(), { ok: true })
})
