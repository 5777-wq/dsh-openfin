/**
 * JSON fetch helper for the Host half.
 *
 * Every market upstream is an unauthenticated public endpoint, so the rules
 * are simple and deliberately uniform:
 * - always send a User-Agent that names this plugin (some eastmoney edges
 *   answer 403 to Node's default `node` UA),
 * - always bound the request with a timeout, because a hung upstream must not
 *   stall the aggregate snapshot,
 * - retry exactly once on transient failures (timeout, socket error, 5xx/429);
 *   a 4xx other than 429 is a bad request and is not repeated,
 * - never spend more than `deadlineMs` in total: a retry that cannot finish
 *   inside the caller's budget is skipped instead of being started. Without
 *   this the worst case (4 s timeout + retry) is 8.15 s against a 6 s part
 *   budget, so the second attempt could never reach the response at all,
 * - surface failures as `UpstreamError` with a stable `code`
 *   (`timeout` | `network` | `http` | `parse` | `aborted`) so `lib/snapshot.js`
 *   can put a short reason in `parts[].error`.
 */
import { setTimeout as sleep } from 'node:timers/promises'

export const USER_AGENT = 'dsh-openfin/0.1 (+https://github.com/5777-wq/dsh-openfin)'

/** Per-request timeout for one upstream call (SPEC: individual part 4 s). */
export const DEFAULT_TIMEOUT_MS = 4000

/**
 * Total time budget for one logical fetch, retries included. Kept below the
 * snapshot's 6 s part budget so a retried call can still answer this round.
 */
export const DEFAULT_DEADLINE_MS = 5500

/** One retry, as required by the SPEC. */
export const DEFAULT_RETRIES = 1

/** Codes worth repeating; `parse` and `http` 4xx are not. */
const RETRYABLE_CODES = new Set(['timeout', 'network'])

export class UpstreamError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, url?: string, status?: number, cause?: unknown }} [details]
   */
  constructor(message, { code = 'upstream', url, status, cause } = {}) {
    super(message)
    this.name = 'UpstreamError'
    this.code = code
    this.url = url
    this.status = status
    if (cause !== undefined) this.cause = cause
  }
}

/**
 * Fetch a URL and parse the body as JSON.
 *
 * @param {string} url
 * @param {{
 *   timeoutMs?: number,
 *   headers?: Record<string, string>,
 *   retries?: number,
 *   retryDelayMs?: number,
 *   deadlineMs?: number,
 *   signal?: AbortSignal,
 *   fetchImpl?: typeof fetch,
 * }} [options]
 * @returns {Promise<unknown>}
 * @throws {UpstreamError}
 */
export async function fetchJson(url, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers = {},
    retries = DEFAULT_RETRIES,
    retryDelayMs = 150,
    deadlineMs = DEFAULT_DEADLINE_MS,
    signal,
    fetchImpl = globalThis.fetch,
  } = options

  const startedAt = Date.now()
  // A deadline of 0 or less means "no deadline", matching snapshot's budget.
  const deadline = deadlineMs > 0 ? startedAt + deadlineMs : Infinity

  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    // Shrink the attempt so it cannot outlive the budget, and give up when
    // there is no time left for a meaningful one.
    const remaining = deadline - Date.now()
    if (remaining <= 0) break
    const attemptTimeout = timeoutMs > 0 ? Math.min(timeoutMs, remaining) : remaining
    try {
      return await fetchJsonOnce(url, { timeoutMs: attemptTimeout, headers, signal, fetchImpl })
    } catch (error) {
      lastError = error
      if (!isRetryable(error) || attempt === retries) break
      // The caller going away cancels the whole operation, including the wait.
      if (signal?.aborted) break
      // A retry needs a realistic attempt: starting one with a sliver of the
      // budget left only delays the failure the caller is going to see anyway.
      const remainingForRetry = deadline - Date.now() - retryDelayMs
      const minAttemptMs = Math.max(250, Math.min(timeoutMs > 0 ? timeoutMs : 1000, 1000) / 2)
      if (remainingForRetry < minAttemptMs) break
      await sleep(retryDelayMs)
      if (signal?.aborted) break
    }
  }
  if (lastError !== undefined) throw lastError
  throw new UpstreamError(`no attempt fit inside the ${deadlineMs}ms budget for ${url}`, {
    code: 'timeout',
    url,
  })
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isRetryable(error) {
  if (!(error instanceof UpstreamError)) return false
  if (RETRYABLE_CODES.has(error.code)) return true
  return error.code === 'http' && (error.status === 429 || (error.status ?? 0) >= 500)
}

/**
 * One network attempt (no retry logic).
 * @param {string} url
 * @param {{ timeoutMs: number, headers: Record<string, string>, signal?: AbortSignal, fetchImpl: typeof fetch }} options
 */
async function fetchJsonOnce(url, { timeoutMs, headers, signal, fetchImpl }) {
  const timeoutSignal = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined
  const combined =
    timeoutSignal === undefined ? signal : signal === undefined ? timeoutSignal : AbortSignal.any([signal, timeoutSignal])

  let response
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      redirect: 'follow',
      signal: combined,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'application/json, text/plain, */*',
        ...headers,
      },
    })
  } catch (error) {
    throw classifyNetworkError(error, { url, timeoutSignal, signal, timeoutMs })
  }

  if (!response.ok) {
    // Drain the body so the socket can be reused; the payload is useless here.
    await response.body?.cancel().catch(() => undefined)
    throw new UpstreamError(`HTTP ${response.status} for ${url}`, {
      code: 'http',
      url,
      status: response.status,
    })
  }

  let text
  try {
    text = await response.text()
  } catch (error) {
    throw classifyNetworkError(error, { url, timeoutSignal, signal, timeoutMs })
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    throw new UpstreamError(`invalid JSON from ${url}: ${messageOf(error)}`, {
      code: 'parse',
      url,
      cause: error,
    })
  }
}

/**
 * Turn a fetch exception into a stable `UpstreamError` code. The caller abort
 * wins over the timeout because both can be true when a request is cancelled.
 *
 * @param {unknown} error
 * @param {{ url: string, timeoutSignal?: AbortSignal, signal?: AbortSignal, timeoutMs: number }} context
 */
function classifyNetworkError(error, { url, timeoutSignal, signal, timeoutMs }) {
  if (signal?.aborted) {
    return new UpstreamError(`request aborted: ${url}`, { code: 'aborted', url, cause: error })
  }
  if (timeoutSignal?.aborted) {
    return new UpstreamError(`timeout after ${timeoutMs}ms: ${url}`, { code: 'timeout', url, cause: error })
  }
  return new UpstreamError(`network error for ${url}: ${messageOf(error)}`, { code: 'network', url, cause: error })
}

/** @param {unknown} error */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}
