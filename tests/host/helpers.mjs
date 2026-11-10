// Shared helpers for the Host test suites. Fixtures are trimmed copies of
// real upstream responses; tests are hermetic and never touch the network.
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

/**
 * Read a JSON fixture relative to tests/fixtures.
 * @param {string} relativePath
 */
export async function fixture(relativePath) {
  return JSON.parse(await readFile(join(FIXTURES, relativePath), 'utf8'))
}

/** Absolute path helper for academy data directories. */
export function fixturePath(relativePath) {
  return join(FIXTURES, relativePath)
}

/**
 * Build a fake `fetchJson` whose behaviour is decided per URL. Records every
 * call (url + options) so tests can assert timeouts, methods and request count.
 *
 * @param {(url: string, options?: object) => unknown | Promise<unknown>} handler
 */
export function mockFetchJson(handler) {
  /** @type {Array<{ url: string, options: object }>} */
  const calls = []
  async function fetchJson(url, options = {}) {
    calls.push({ url, options })
    return handler(url, options)
  }
  fetchJson.calls = calls
  return fetchJson
}

/** A router-style fetch mock: first matching substring wins. */
export function routedFetchJson(routes) {
  return mockFetchJson((url) => {
    for (const [needle, value] of routes) {
      if (url.includes(needle)) {
        if (value instanceof Error) throw value
        return typeof value === 'function' ? value(url) : value
      }
    }
    throw new Error(`unexpected upstream url: ${url}`)
  })
}

/** Error shaped like lib/upstream.js's UpstreamError, for loader tests. */
export function upstreamError(code = 'timeout') {
  const error = new Error(`boom (${code})`)
  error.name = 'UpstreamError'
  error.code = code
  return error
}
