import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createCache, defaultCache } from '../../lib/cache.js'

test('memo caches within the TTL and reloads after it', async () => {
  let now = 1_000
  const cache = createCache({ now: () => now })
  let loads = 0
  const loader = async () => {
    loads += 1
    return `v${loads}`
  }

  assert.equal(await cache.memo('k', 1_000, loader), 'v1')
  assert.equal(await cache.memo('k', 1_000, loader), 'v1')
  assert.equal(loads, 1)

  now += 1_001
  assert.equal(await cache.memo('k', 1_000, loader), 'v2')
  assert.equal(loads, 2)
})

test('peek exposes expired values for stale fallback', async () => {
  let now = 0
  const cache = createCache({ now: () => now })
  cache.set('k', { hello: 'world' }, 100)

  let entry = cache.peek('k')
  assert.equal(entry?.fresh, true)
  assert.deepEqual(entry?.value, { hello: 'world' })

  now = 500
  entry = cache.peek('k')
  assert.equal(entry?.fresh, false)
  assert.deepEqual(entry?.value, { hello: 'world' })
  assert.equal(entry?.ageMs, 500)

  assert.equal(cache.peek('missing'), undefined)
})

test('concurrent memo calls share one in-flight loader', async () => {
  const cache = createCache()
  let loads = 0
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const loader = async () => {
    loads += 1
    await gate
    return 'shared'
  }

  const first = cache.memo('k', 1_000, loader)
  const second = cache.memo('k', 1_000, loader)
  release()
  assert.deepEqual(await Promise.all([first, second]), ['shared', 'shared'])
  assert.equal(loads, 1)
})

test('a failed load is not cached and the next call retries', async () => {
  const cache = createCache()
  let attempts = 0
  const loader = async () => {
    attempts += 1
    if (attempts === 1) throw new Error('nope')
    return 'ok'
  }

  await assert.rejects(cache.memo('k', 1_000, loader), /nope/)
  assert.equal(await cache.memo('k', 1_000, loader), 'ok')
  assert.equal(attempts, 2)
})

test('clear during an in-flight load does not resurrect data', async () => {
  const cache = createCache()
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  const pending = cache.memo('k', 1_000, async () => {
    await gate
    return 'late'
  })
  cache.clear()
  release()
  assert.equal(await pending, 'late')
  assert.equal(cache.peek('k'), undefined)
})

test('default cache exports the module-level memo/peek aliases', async () => {
  defaultCache.clear()
  const cache = createCache()
  cache.set('a', 1, 10)
  assert.equal(cache.peek('a')?.value, 1)
  assert.equal(typeof defaultCache.memo, 'function')
  assert.equal(defaultCache.size(), 0)
})
