/**
 * Tests for the vendored-terminal static server (`lib/lens.js`).
 * Temp directories only; no network, no real Web server.
 */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, it } from 'node:test'

import { LENS_PREFIX, createLens, resolveLensPath } from '../../lib/lens.js'

const roots = []

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), 'dsh-openfin-lens-'))
  roots.push(root)
  mkdirSync(join(root, 'css'), { recursive: true })
  mkdirSync(join(root, 'data', 'events'), { recursive: true })
  writeFileSync(join(root, 'index.html'), '<!doctype html><title>OpenFinLens</title>')
  writeFileSync(join(root, 'css', 'bundle.css'), 'body{color:#000}')
  writeFileSync(join(root, 'data', 'events', 'global.json'), '{"ok":true}')
  return root
}

function fakeRequest(method, url, headers = {}) {
  return { method, url, headers }
}

function fakeResponse() {
  return {
    statusCode: 0,
    headers: {},
    chunks: [],
    writeHead(code, headers) {
      this.statusCode = code
      this.headers = headers ?? {}
    },
    end(body) {
      if (body !== undefined) this.chunks.push(Buffer.isBuffer(body) ? body : Buffer.from(String(body)))
    },
    get body() {
      return Buffer.concat(this.chunks).toString('utf8')
    },
  }
}

afterEach(() => {
  while (roots.length > 0) {
    try {
      rmSync(roots.pop(), { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
})

describe('resolveLensPath', () => {
  it('maps the prefix root to index.html and keeps nested paths', () => {
    const root = makeRoot()
    assert.equal(resolveLensPath(LENS_PREFIX, root).file, join(root, 'index.html'))
    assert.equal(resolveLensPath(LENS_PREFIX + '/', root).file, join(root, 'index.html'))
    assert.equal(resolveLensPath(LENS_PREFIX + '/css/bundle.css', root).file, join(root, 'css', 'bundle.css'))
    assert.equal(
      resolveLensPath(LENS_PREFIX + '/index.html?x=1'.replace('?x=1', ''), root).file,
      join(root, 'index.html'),
    )
  })

  it('rejects traversal, encoded traversal, backslashes and NUL bytes', () => {
    const root = makeRoot()
    for (const path of [
      LENS_PREFIX + '/../secret.txt',
      LENS_PREFIX + '/css/../../secret.txt',
      LENS_PREFIX + '/%2e%2e/secret.txt',
      LENS_PREFIX + '/%2e%2e%2fsecret.txt',
      LENS_PREFIX + '/..%5csecret.txt',
      LENS_PREFIX + '/css%5c..%5cbundle.css',
      LENS_PREFIX + '/bad%00name',
      '/etc/passwd',
      '/other/prefix',
    ]) {
      const resolved = resolveLensPath(path, root)
      assert.ok('error' in resolved, 'expected rejection for ' + path)
    }
  })

  it('answers 404 (not 400) for NUL bytes, like every other rejected path', () => {
    const root = makeRoot()
    assert.equal(resolveLensPath(LENS_PREFIX + '/bad%00name', root).status, 404)
  })

  it('returns 404 for a missing file', () => {
    const root = makeRoot()
    const resolved = resolveLensPath(LENS_PREFIX + '/nope.js', root)
    assert.equal(resolved.status, 404)
  })
})

describe('createLens.handleNode', () => {
  it('serves index.html with a document cache policy', async () => {
    const lens = createLens({ root: makeRoot() })
    const res = fakeResponse()
    await lens.handleNode(fakeRequest('GET', LENS_PREFIX), res)
    assert.equal(res.statusCode, 200)
    assert.match(res.headers['content-type'], /text\/html/)
    assert.equal(res.headers['cache-control'], 'no-cache')
    assert.match(res.body, /OpenFinLens/)
  })

  it('serves static assets with a long cache and an ETag', async () => {
    const lens = createLens({ root: makeRoot() })
    const res = fakeResponse()
    await lens.handleNode(fakeRequest('GET', LENS_PREFIX + '/css/bundle.css'), res)
    assert.equal(res.statusCode, 200)
    assert.match(res.headers['content-type'], /text\/css/)
    assert.match(res.headers['cache-control'], /max-age=300/)
    assert.ok(res.headers.etag)

    const again = fakeResponse()
    await lens.handleNode(
      fakeRequest('GET', LENS_PREFIX + '/css/bundle.css', { 'if-none-match': res.headers.etag }),
      again,
    )
    assert.equal(again.statusCode, 304)
    assert.equal(again.body, '')
  })

  it('answers HEAD without a body and rejects other methods', async () => {
    const lens = createLens({ root: makeRoot() })
    const head = fakeResponse()
    await lens.handleNode(fakeRequest('HEAD', LENS_PREFIX + '/data/events/global.json'), head)
    assert.equal(head.statusCode, 200)
    assert.match(head.headers['content-type'], /application\/json/)
    assert.equal(head.body, '')

    const post = fakeResponse()
    await lens.handleNode(fakeRequest('POST', LENS_PREFIX + '/index.html'), post)
    assert.equal(post.statusCode, 405)
    assert.equal(post.headers.allow, 'GET, HEAD')
  })

  it('answers JSON 404 for missing files and traversal attempts', async () => {
    const lens = createLens({ root: makeRoot() })
    for (const path of [LENS_PREFIX + '/nope.png', LENS_PREFIX + '/../secret.txt']) {
      const res = fakeResponse()
      await lens.handleNode(fakeRequest('GET', path), res)
      assert.equal(res.statusCode, 404)
      assert.deepEqual(JSON.parse(res.body), { error: 'not found' })
    }
  })

  it('does not leak files through a symlink that leaves the root', async () => {
    const root = makeRoot()
    const outside = mkdtempSync(join(tmpdir(), 'dsh-openfin-outside-'))
    roots.push(outside)
    writeFileSync(join(outside, 'secret.txt'), 'top secret')
    try {
      // Node's symlink creation on Windows may need privileges; skip when it fails.
      const { symlinkSync } = await import('node:fs')
      symlinkSync(outside, join(root, 'escape'), 'junction')
    } catch {
      return
    }
    const lens = createLens({ root })
    const res = fakeResponse()
    await lens.handleNode(fakeRequest('GET', LENS_PREFIX + '/escape/secret.txt'), res)
    assert.equal(res.statusCode, 404)
  })
})
