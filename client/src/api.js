/**
 * Same-origin data access for the OpenFin page.
 *
 * The Host half owns every upstream call (no browser CORS, no keys); the page
 * only ever talks to `/dsh-openfin/api/*` on the harness origin.
 */
import { useEffect, useRef, useState } from 'react'

export const API_BASE = '/dsh-openfin/api'

/**
 * Read one JSON endpoint.
 * @param {string} path - path below the API base, already query-encoded.
 * @param {{ signal?: AbortSignal, cache?: RequestCache }} [options]
 * @returns {Promise<any>}
 */
export async function getJson(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    signal: options.signal,
    cache: options.cache ?? 'no-store',
    headers: { accept: 'application/json' },
  })
  let body
  try {
    body = await response.json()
  } catch {
    body = undefined
  }
  if (!response.ok) {
    const message = body && typeof body.error === 'string' ? body.error : `HTTP ${response.status}`
    throw new Error(message)
  }
  if (body === undefined) throw new Error('响应不是 JSON')
  return body
}

/** Live dashboard snapshot (indices, heatmap boards, movers, news). */
export const getSnapshot = (signal) => getJson('/snapshot', { signal })

/** Constituents of one eastmoney industry board. */
export const getSector = (code, signal) =>
  getJson('/sector?code=' + encodeURIComponent(code), { signal })

/** Academy article index and section chips. */
export const getAcademy = (signal) => getJson('/academy', { signal, cache: 'default' })

/** One academy article with its markdown body. */
export const getArticle = (id, signal) =>
  getJson('/academy/article?id=' + encodeURIComponent(id), { signal, cache: 'default' })

/** Glossary terms plus the term of the day. */
export const getGlossary = (signal) => getJson('/glossary', { signal, cache: 'default' })

/**
 * POST one JSON body to a HUD endpoint.
 * @param {string} path
 * @param {object} body
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function postJson(path, body, options = {}) {
  const response = await fetch(API_BASE + path, {
    method: 'POST',
    signal: options.signal,
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })
  let payload
  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }
  if (!response.ok) {
    const message = payload && typeof payload.error === 'string' ? payload.error : `HTTP ${response.status}`
    throw new Error(message)
  }
  return payload
}

/** Floating-HUD status: Electron availability, helper state and shared config. */
export const getHud = (signal) => getJson('/hud', { signal })

/** Change the HUD: `{ desktop }`, `{ config }` or `{ action: 'recenter' }`. */
export const postHud = (body, signal) => postJson('/hud', body, { signal })

/**
 * One-shot resource fetch with loading/error state and a manual reload.
 *
 * @param {(signal: AbortSignal) => Promise<any>} loader
 * @param {any[]} [deps] - reload when these change
 * @returns {{ loading: boolean, data: any, error: string | null, reload: () => void }}
 */
export function useResource(loader, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [nonce, setNonce] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    setState((previous) => ({ loading: true, data: previous.data, error: null }))
    loaderRef.current(controller.signal).then(
      (data) => {
        if (alive) setState({ loading: false, data, error: null })
      },
      (error) => {
        if (!alive || (error && error.name === 'AbortError')) return
        setState((previous) => ({
          loading: false,
          data: previous.data,
          error: (error && error.message) || String(error),
        }))
      },
    )
    return () => {
      alive = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { ...state, reload: () => setNonce((value) => value + 1) }
}
