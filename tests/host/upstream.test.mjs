import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { fetchJson, UpstreamError, USER_AGENT } from '../../lib/upstream.js'

/**
 * Run `fn` against a throwaway HTTP server bound to 127.0.0.1. Fully hermetic:
 * no external network, no fixed port.
 */
async function withServer(handler, fn) {
  const server = createServer(handler)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  try {
    return await fn(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

test('fetchJson parses JSON and sends the plugin User-Agent', async () => {
  const seen = []
  await withServer(
    (req, res) => {
      seen.push(req.headers['user-agent'])
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: 1 }))
    },
    async (base) => {
      assert.deepEqual(await fetchJson(`${base}/x`), { ok: 1 })
    },
  )
  assert.deepEqual(seen, [USER_AGENT])
})

test('fetchJson retries exactly once on a 5xx and returns the retry result', async () => {
  let requests = 0
  await withServer(
    (req, res) => {
      requests += 1
      if (requests === 1) {
        res.writeHead(500)
        res.end('upstream exploded')
        return
      }
      res.writeHead(200)
      res.end('{"recovered":true}')
    },
    async (base) => {
      assert.deepEqual(await fetchJson(`${base}/x`, { retryDelayMs: 0 }), { recovered: true })
    },
  )
  assert.equal(requests, 2)
})

test('fetchJson does not retry a 4xx and reports the status', async () => {
  let requests = 0
  await withServer(
    (req, res) => {
      requests += 1
      res.writeHead(404)
      res.end('nope')
    },
    async (base) => {
      await assert.rejects(fetchJson(`${base}/x`, { retryDelayMs: 0 }), (error) => {
        assert.equal(error instanceof UpstreamError, true)
        assert.equal(error.code, 'http')
        assert.equal(error.status, 404)
        return true
      })
    },
  )
  assert.equal(requests, 1)
})

test('fetchJson times out and a timeout is retried once', async () => {
  let requests = 0
  await withServer(
    (req, res) => {
      requests += 1
      let timer
      res.on('close', () => clearTimeout(timer))
      timer = setTimeout(() => res.end('{"late":true}'), 500)
    },
    async (base) => {
      await assert.rejects(fetchJson(`${base}/x`, { timeoutMs: 40, retryDelayMs: 0 }), (error) => {
        assert.equal(error instanceof UpstreamError, true)
        assert.equal(error.code, 'timeout')
        return true
      })
    },
  )
  assert.equal(requests, 2)
})

test('fetchJson reports invalid JSON as a parse error without retrying', async () => {
  let requests = 0
  await withServer(
    (req, res) => {
      requests += 1
      res.writeHead(200)
      res.end('<html>not json</html>')
    },
    async (base) => {
      await assert.rejects(fetchJson(`${base}/x`, { retryDelayMs: 0 }), (error) => {
        assert.equal(error.code, 'parse')
        return true
      })
    },
  )
  assert.equal(requests, 1)
})

test('fetchJson surfaces a caller abort as code "aborted"', async () => {
  let requests = 0
  await withServer(
    (req, res) => {
      requests += 1
      let timer
      res.on('close', () => clearTimeout(timer))
      timer = setTimeout(() => res.end('{}'), 500)
    },
    async (base) => {
      const controller = new AbortController()
      controller.abort()
      await assert.rejects(fetchJson(`${base}/x`, { signal: controller.signal, retryDelayMs: 0 }), (error) => {
        assert.equal(error.code, 'aborted')
        return true
      })
    },
  )
  // An already-aborted request is not retried.
  assert.equal(requests, 0)
})

test('a retry that cannot fit the deadline is skipped', async () => {
  let requests = 0
  await withServer(
    (req, res) => {
      requests += 1
      const timer = setTimeout(() => res.end('{"late":true}'), 300)
      res.on('close', () => clearTimeout(timer))
    },
    async (base) => {
      const started = Date.now()
      await assert.rejects(
        fetchJson(`${base}/x`, { timeoutMs: 80, deadlineMs: 120, retryDelayMs: 0 }),
        (error) => error.code === 'timeout',
      )
      // First attempt already spent the budget: a second one would only stall
      // the caller past its own part budget.
      assert.ok(Date.now() - started < 250)
    },
  )
  assert.equal(requests, 1)
})
