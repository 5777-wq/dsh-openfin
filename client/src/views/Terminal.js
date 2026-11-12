import { createElement as h, useCallback, useEffect, useRef, useState } from 'react'

/** The complete terminal is the vendored OpenFinLens build served by the Host. */
const LENS_URL = '/dsh-openfin/lens/index.html'
/** How long the loading veil waits for the app's readiness message. */
const READY_TIMEOUT_MS = 12000

function channel(value) {
  const text = String(value).trim()
  if (text.startsWith('#')) {
    const hex = text.slice(1)
    const full = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex.slice(0, 6)
    const number = Number.parseInt(full, 16)
    if (!Number.isFinite(number) || full.length !== 6) return null
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255]
  }
  const match = /^rgba?\(([^)]+)\)$/i.exec(text)
  if (!match) return null
  const parts = match[1].split(/[, /]+/).filter(Boolean).slice(0, 3).map(Number)
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null
  return parts
}

/**
 * Which OpenFinLens theme matches the current DSH appearance. Read from the
 * host token rather than a class name: community skins set the token too.
 * @returns {'daylight'|'nexus'}
 */
export function hostTerminalTheme() {
  try {
    const styles = getComputedStyle(document.documentElement)
    const parts = channel(styles.getPropertyValue('--dsw-alias-bg-base'))
    if (parts !== null) {
      const [r, g, b] = parts.map((part) => part / 255)
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      return luminance < 0.42 ? 'nexus' : 'daylight'
    }
    const attribute = String(document.documentElement.getAttribute('data-theme') ?? '')
    if (/dark/i.test(attribute)) return 'nexus'
  } catch {
    /* fall through to the media query */
  }
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'nexus'
  } catch {
    /* default below */
  }
  return 'daylight'
}

function frameSrc(theme) {
  return `${LENS_URL}?embed=1&theme=${theme}`
}

/**
 * Full-bleed view of the complete OpenFinLens terminal.
 *
 * It is a same-origin iframe on purpose: the vendored app is the untouched
 * upstream build (22k lines, canvas treemaps, world map, charts), so embedding
 * keeps feature parity with OpenFinLens instead of reimplementing it partially.
 * The embed adapter receives the host theme and reports readiness.
 */
export function Terminal({ t, active = true }) {
  const [src, setSrc] = useState(() => frameSrc(hostTerminalTheme()))
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)
  const frameRef = useRef(null)
  const timeoutRef = useRef(0)

  const armTimeout = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setSlow(false)
    timeoutRef.current = setTimeout(() => setSlow(true), READY_TIMEOUT_MS)
  }, [])

  const reload = useCallback(() => {
    setReady(false)
    setSrc(frameSrc(hostTerminalTheme()))
    armTimeout()
  }, [armTimeout])

  useEffect(() => {
    armTimeout()
    return () => clearTimeout(timeoutRef.current)
  }, [armTimeout])

  // Readiness: the embed adapter posts one message after the app's load event.
  useEffect(() => {
    const onMessage = (event) => {
      const frame = frameRef.current
      if (!frame || event.source !== frame.contentWindow) return
      const data = event.data
      if (!data || data.type !== 'dsh-lens-ready') return
      setReady(true)
      setSlow(false)
      clearTimeout(timeoutRef.current)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Theme handshake: initial theme is in the URL; later DSH theme flips are a
  // message, so the embedded app keeps its tab/scroll state. The observer only
  // runs while the terminal is the visible tab: a hidden iframe does not need
  // a postMessage for every host style mutation.
  useEffect(() => {
    if (!active) return undefined
    const root = document.documentElement
    const body = document.body
    const send = () => {
      const frame = frameRef.current
      if (!frame || !frame.contentWindow) return
      try {
        frame.contentWindow.postMessage({ type: 'dsh-theme', theme: hostTerminalTheme() }, '*')
      } catch {
        /* frame navigating */
      }
    }
    const observer = new MutationObserver(send)
    observer.observe(root, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] })
    if (body) observer.observe(body, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] })
    let query = null
    try {
      query = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
      query?.addEventListener?.('change', send)
    } catch {
      query = null
    }
    // Pick up a theme change that happened while the tab was hidden.
    send()
    return () => {
      observer.disconnect()
      query?.removeEventListener?.('change', send)
    }
  }, [active])

  const openExternal = useCallback((event) => {
    event.preventDefault()
    const current = (frameRef.current && frameRef.current.getAttribute('src')) || src
    window.open(current, '_blank', 'noopener,noreferrer')
  }, [src])

  return h(
    'div',
    { className: 'of-terminal' },
    h(
      'div',
      { className: 'of-terminal-bar' },
      h('span', { className: 'of-terminal-title' }, t('terminal.title')),
      h('span', { className: 'of-terminal-hint' }, t('terminal.hint')),
      h('span', { style: { flex: '1 1 auto' } }),
      h(
        'button',
        {
          type: 'button',
          className: 'of-icon-btn',
          title: t('terminal.reload'),
          'aria-label': t('terminal.reload'),
          onClick: reload,
        },
        h('span', { style: { fontSize: 13, lineHeight: 1 } }, '⟳'),
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'of-icon-btn',
          title: t('terminal.openExternal'),
          'aria-label': t('terminal.openExternal'),
          onClick: openExternal,
        },
        h('span', { style: { fontSize: 12, lineHeight: 1 } }, '↗'),
      ),
    ),
    h('iframe', {
      ref: frameRef,
      className: 'of-terminal-frame',
      src,
      title: t('terminal.frameTitle'),
      allow: 'clipboard-write; fullscreen',
    }),
    !ready
      ? h(
          'div',
          { className: 'of-terminal-veil', 'aria-live': 'polite' },
          h('div', { className: 'of-terminal-veil-card' },
            h('div', { className: 'of-terminal-veil-title' }, t('terminal.loading')),
            slow
              ? h('div', { className: 'of-terminal-veil-hint' }, t('terminal.slow'))
              : h('div', { className: 'of-terminal-veil-hint' }, t('terminal.hint')),
          ),
        )
      : null,
  )
}
