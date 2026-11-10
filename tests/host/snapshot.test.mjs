import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildSnapshot, errorCode, PART_IDS } from '../../lib/snapshot.js'
import { createCache } from '../../lib/cache.js'
import { UpstreamError } from '../../lib/upstream.js'
import { upstreamError } from './helpers.mjs'

const QUOTES = [{ id: 'sh000001', name: '上证指数', price: 3663.72 }]
const BOARDS = {
  boards: [{ code: 'BK1201', name: '电子', pct: 3.29, price: 10958.81, marketCap: 1 }],
  boardBreadth: { up: 1, down: 0, flat: 0, total: 1 },
}
const MOVERS = { up: [{ code: '300264' }], down: [], active: [{ code: '600030', amount: 1 }] }
const NEWS = [{ id: '1', title: 't', time: '2026-11-10 12:00:00', url: 'https://example.test/a' }]

function makeParts(overrides = {}) {
  return {
    quotes: { load: async () => QUOTES },
    boards: { load: async () => BOARDS },
    movers: { load: async () => MOVERS },
    news: { load: async () => NEWS },
    ...overrides,
  }
}

test('buildSnapshot assembles the SPEC shape when every part is healthy', async () => {
  const snapshot = await buildSnapshot({ parts: makeParts(), cache: createCache(), now: () => 1111 })

  assert.equal(snapshot.updatedAt, 1111)
  assert.equal(snapshot.refreshMs, 30000)
  assert.equal(snapshot.stale, false)
  assert.deepEqual(
    snapshot.parts.map((part) => part.id),
    PART_IDS,
  )
  for (const part of snapshot.parts) {
    assert.equal(part.ok, true)
    assert.equal(typeof part.ms, 'number')
    assert.equal('error' in part, false)
  }
  assert.deepEqual(snapshot.quotes, QUOTES)
  assert.deepEqual(snapshot.boards, BOARDS.boards)
  assert.deepEqual(snapshot.boardBreadth, BOARDS.boardBreadth)
  assert.deepEqual(snapshot.movers, MOVERS)
  assert.deepEqual(snapshot.news, NEWS)
})

test('a failing part is reported in parts[] and yields an empty section', async () => {
  const parts = makeParts({
    quotes: { load: async () => { throw upstreamError('timeout') } },
  })
  const snapshot = await buildSnapshot({ parts, cache: createCache(), now: () => 2 })

  assert.deepEqual(snapshot.quotes, [])
  assert.equal(snapshot.stale, false)
  assert.deepEqual(snapshot.parts[0], { id: 'quotes', ok: false, ms: 0, error: 'timeout' })
  assert.equal(snapshot.parts[1].ok, true)
})

test('an expired cache entry is served with stale: true when the loader fails', async () => {
  let now = 0
  const cache = createCache({ now: () => now })
  cache.set('part:boards', BOARDS, 30_000)
  now = 60_000

  const parts = makeParts({ boards: { load: async () => { throw upstreamError('network') } } })
  const snapshot = await buildSnapshot({ parts, cache, now: () => now })

  assert.deepEqual(snapshot.boards, BOARDS.boards)
  assert.equal(snapshot.stale, true)
  assert.equal(snapshot.parts.find((part) => part.id === 'boards')?.ok, true)
})

test('a fresh cache entry is served without calling the loader', async () => {
  let now = 0
  const cache = createCache({ now: () => now })
  cache.set('part:quotes', QUOTES, 30_000)
  let loads = 0
  const parts = makeParts({
    quotes: {
      load: async () => {
        loads += 1
        throw upstreamError()
      },
    },
  })
  const snapshot = await buildSnapshot({ parts, cache, now: () => now })
  assert.equal(loads, 0)
  assert.equal(snapshot.stale, false)
  assert.deepEqual(snapshot.quotes, QUOTES)
})

test('the per-part deadline keeps a hung upstream from stalling the snapshot', async () => {
  const parts = makeParts({ movers: { load: () => new Promise(() => {}) } })
  const startedAt = Date.now()
  const snapshot = await buildSnapshot({ parts, cache: createCache(), now: () => 5, budgetMs: 40 })
  const elapsed = Date.now() - startedAt

  assert.ok(elapsed < 1_000)
  assert.equal(snapshot.parts.find((part) => part.id === 'movers')?.ok, false)
  assert.equal(snapshot.parts.find((part) => part.id === 'movers')?.error, 'timeout')
  assert.deepEqual(snapshot.movers, { up: [], down: [], active: [] })
})

test('a hung loader with a stale cache entry serves stale data', async () => {
  let now = 0
  const cache = createCache({ now: () => now })
  cache.set('part:news', NEWS, 1_000)
  now = 10_000
  const parts = makeParts({ news: { load: () => new Promise(() => {}) } })
  const snapshot = await buildSnapshot({ parts, cache, now: () => now, budgetMs: 30 })
  assert.deepEqual(snapshot.news, NEWS)
  assert.equal(snapshot.stale, true)
})

test('missing part configuration is reported, not thrown', async () => {
  const parts = { quotes: { load: async () => QUOTES } }
  const snapshot = await buildSnapshot({ parts, cache: createCache(), now: () => 0 })
  assert.equal(snapshot.parts.length, 4)
  assert.equal(snapshot.parts[1].error, 'not configured')
  assert.deepEqual(snapshot.boardBreadth, { up: 0, down: 0, flat: 0, total: 0 })
  assert.deepEqual(snapshot.movers, { up: [], down: [], active: [] })
  assert.deepEqual(snapshot.news, [])
})

test('part specs can be plain loader functions', async () => {
  const snapshot = await buildSnapshot({ parts: makeParts({ news: async () => NEWS }), cache: createCache() })
  assert.deepEqual(snapshot.news, NEWS)
})

test('errorCode prefers the stable upstream code and falls back to the message', () => {
  assert.equal(errorCode(upstreamError('timeout')), 'timeout')
  assert.equal(errorCode(new UpstreamError('x', { code: 'http', status: 502 })), 'http')
  assert.equal(errorCode(new Error('plain failure')), 'plain failure')
  assert.equal(errorCode('weird'), 'upstream error')
})
