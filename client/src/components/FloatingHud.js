/**
 * The in-page "摸鱼" HUD: a 44 px mascot chip that expands into a quiet dark
 * quote card. Presentational apart from its own quote poll — the page shell
 * owns the shared config and passes `onChange` down.
 *
 * Data comes from `/api/hud/quotes`, which renders exactly the requested
 * `config.symbols` order (built-in ids and `em:<secid>` customs); the config
 * catalog supplies a name fallback when the quote payload has none.
 *
 * Geometry: `config.position` is the top-left of the *collapsed* chip row
 * (`{x:0,y:0}` = bottom-right with a 24 px margin). The card grows up-left from
 * the chip's bottom-right corner, so the pet stays put in its corner while the
 * card unfolds. Pointer capture + a 4 px threshold separate clicks from drags.
 */
import {
  createElement as h,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getHudQuotes } from '../api.js'
import { fmtClock, fmtPct, fmtPrice, signClass } from '../format.js'
import { useCountUp, useMediaQuery } from '../hooks.js'
import { instrumentName } from '../hud-config.js'
import { Icon, Mark } from './Icon.js'
import { Sparkline } from './Sparkline.js'

const POLL_MS = 30000
const CHIP = 44
const PILL_W = 62
const CHIP_GAP = 6
const COLLAPSED_W = PILL_W + CHIP_GAP + CHIP
const COLLAPSED_H = CHIP
const EDGE = 8
const DEFAULT_MARGIN = 24
const DRAG_START_SQ = 16
const TITLE_MAX = 18
const CARD_W = Object.freeze({ s: 300, m: 330, l: 368 })

/**
 * `SYMBOLS` ids are the live snapshot ids. Keep a bridge to the eastmoney
 * secids some earlier builds of the Host emitted, so an old snapshot (or a
 * desktop helper mid-update) still renders rows instead of silently dropping
 * them. Direct id matches always win.
 */
const QUOTE_ALIASES = Object.freeze({
  hkHSI: '100.HSI',
  usIXIC: '100.NDX',
  usSPX: '100.SPX',
  usDJIA: '100.DJIA',
  hfGC: '101.GC00Y',
  fxUDI: '100.UDI',
  btc: 'BTC',
  eth: 'ETH',
})

function estimateCardHeight(rowCount) {
  return 84 + Math.max(1, rowCount) * 31
}

function readViewport() {
  if (typeof window === 'undefined') return { w: 1280, h: 800 }
  return { w: window.innerWidth || 1280, h: window.innerHeight || 800 }
}

function useViewport() {
  const [viewport, setViewport] = useState(readViewport)
  useEffect(() => {
    const onChange = () => setViewport(readViewport())
    window.addEventListener('resize', onChange)
    return () => window.removeEventListener('resize', onChange)
  }, [])
  return viewport
}

function clampValue(value, min, max) {
  if (min > max) return min
  return Math.min(max, Math.max(min, value))
}

function isDefaultPosition(position) {
  if (!position || typeof position !== 'object') return true
  return Math.round(Number(position.x) || 0) === 0 && Math.round(Number(position.y) || 0) === 0
}

/**
 * Clamp a chip-anchor position into the viewport (and clamp the expanded card
 * into it too, which shifts the anchor correspondingly).
 */
function resolveAnchor(position, viewport, collapsed, cardW, cardH) {
  const base = isDefaultPosition(position)
    ? { x: viewport.w - COLLAPSED_W - DEFAULT_MARGIN, y: viewport.h - COLLAPSED_H - DEFAULT_MARGIN }
    : { x: Number(position.x) || 0, y: Number(position.y) || 0 }
  let x = clampValue(base.x, EDGE, viewport.w - COLLAPSED_W - EDGE)
  let y = clampValue(base.y, EDGE, viewport.h - COLLAPSED_H - EDGE)
  if (!collapsed) {
    const left = clampValue(x + COLLAPSED_W - cardW, EDGE, viewport.w - cardW - EDGE)
    const top = clampValue(y + COLLAPSED_H - cardH, EDGE, viewport.h - cardH - EDGE)
    x = left + cardW - COLLAPSED_W
    y = top + cardH - COLLAPSED_H
  }
  return { x: Math.round(x), y: Math.round(y) }
}

const HUD_GLYPHS = {
  gear: (strokeWidth) =>
    h(
      'g',
      null,
      h('circle', { cx: 12, cy: 12, r: 3.3, strokeWidth }),
      h('path', {
        d: 'M12 3.4v2.3M12 18.3v2.3M3.4 12h2.3M18.3 12h2.3M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6',
        strokeWidth,
      }),
    ),
  collapse: (strokeWidth) => h('path', { d: 'M6.5 12h11', strokeWidth }),
  eye: (strokeWidth) =>
    h(
      'g',
      null,
      h('path', {
        d: 'M2.8 12S6.4 5.6 12 5.6 21.2 12 21.2 12 17.6 18.4 12 18.4 2.8 12 2.8 12Z',
        strokeWidth,
      }),
      h('circle', { cx: 12, cy: 12, r: 2.7, strokeWidth }),
    ),
}

function HudGlyph({ name, size = 13, strokeWidth = 1.6 }) {
  const draw = HUD_GLYPHS[name]
  if (!draw) return null
  return h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: size,
      height: size,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
      style: { display: 'block', flex: 'none' },
    },
    draw(strokeWidth),
  )
}

/** One quote row; its own component so the price can tween via `useCountUp`. */
function HudRow({ fallbackName, quote, showSpark, onOpen }) {
  const animated = useCountUp(quote && typeof quote.price === 'number' ? quote.price : null, 420)
  const pct = quote && typeof quote.pct === 'number' ? quote.pct : null
  const tone = quote ? signClass(pct) : 'flat'
  const name = (quote && quote.name) || fallbackName || ''
  const digits = quote && typeof quote.digits === 'number' ? quote.digits : 2
  const priceText = quote ? fmtPrice(animated, digits) : '—'
  const pctText = quote ? fmtPct(pct) : '—'
  return h(
    'div',
    {
      className: 'of-hud-row',
      role: 'button',
      tabIndex: 0,
      'data-hud-action': 'open',
      'aria-label': name + ' ' + priceText + ' ' + pctText,
      title: name,
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen?.()
        }
      },
    },
    h('span', { className: 'of-hud-row-name' }, name),
    h('span', { className: 'of-hud-row-price' }, priceText),
    h('span', { className: 'of-hud-row-pct', 'data-tone': tone }, pctText),
    showSpark
      ? h(
          'span',
          { className: 'of-hud-spark', 'data-tone': tone, 'aria-hidden': true },
          quote && Array.isArray(quote.spark) ? h(Sparkline, { values: quote.spark, up: pct >= 0 }) : null,
        )
      : null,
  )
}

export function FloatingHud({ t, config, onChange, onConfigure, onOpenDashboard, hidden, onPanic }) {
  const viewport = useViewport()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hover, setHover] = useState(false)
  const [idle, setIdle] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragPos, setDragPos] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(config.title || 'OpenFin')
  const [measuredHeight, setMeasuredHeight] = useState(0)

  const rootRef = useRef(null)
  const cardRef = useRef(null)
  const titleInputRef = useRef(null)
  const dragRef = useRef(null)
  const dragPosRef = useRef(null)
  const frameRef = useRef(0)
  const idleTimerRef = useRef(0)
  const idleRef = useRef(false)
  const reloadRef = useRef(null)

  const direction = t('meta.direction') === 'intl' ? 'intl' : 'cn'
  const collapsed = config.collapsed === true
  const size = CARD_W[config.size] ? config.size : 'm'
  const cardW = CARD_W[size]

  const rows = useMemo(() => {
    const ids = Array.isArray(config.symbols) ? config.symbols : []
    return ids.map((id) => ({ id, fallbackName: instrumentName(id, config) }))
  }, [config.symbols, config.catalog])
  const symbolsKey = Array.isArray(config.symbols) ? config.symbols.join('|') : ''

  const quoteMap = useMemo(() => {
    const map = new Map()
    const quotes = snapshot && Array.isArray(snapshot.quotes) ? snapshot.quotes : []
    for (const quote of quotes) {
      if (quote && typeof quote.id === 'string') map.set(quote.id, quote)
    }
    for (const hudId of Object.keys(QUOTE_ALIASES)) {
      const quote = map.get(QUOTE_ALIASES[hudId])
      if (quote && !map.has(hudId)) map.set(hudId, quote)
    }
    return map
  }, [snapshot])

  const cardH = collapsed ? COLLAPSED_H : measuredHeight || estimateCardHeight(rows.length)
  const resolved = resolveAnchor(config.position, viewport, collapsed, cardW, cardH)
  const anchor = dragPos || resolved
  const left = collapsed ? anchor.x : anchor.x + COLLAPSED_W - cardW
  const top = collapsed ? anchor.y : anchor.y + COLLAPSED_H - cardH

  /* ------------------------------------------------------------- data poll */
  useEffect(() => {
    if (hidden) return undefined
    let alive = true
    const controller = new AbortController()
    const requestIds = Array.isArray(config.symbols) ? config.symbols.slice() : []
    let timer = 0

    const load = async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        const data = await getHudQuotes(requestIds, controller.signal)
        if (!alive) return
        setSnapshot(data)
        setError(null)
      } catch (reason) {
        if (!alive || (reason && reason.name === 'AbortError')) return
        setError((reason && reason.message) || String(reason))
      } finally {
        if (alive) setLoading(false)
      }
    }
    reloadRef.current = load
    setLoading(true)

    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        // A hidden page schedules nothing: `onVisibility` resumes the poll when
        // the page comes back, so the card is never stale-but-polling.
        if (typeof document !== 'undefined' && document.hidden) return
        await load()
        if (alive) schedule()
      }, POLL_MS)
    }
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        clearTimeout(timer)
        timer = 0
        return
      }
      void load()
      schedule()
    }

    void load()
    schedule()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      alive = false
      controller.abort()
      clearTimeout(timer)
      reloadRef.current = null
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // `symbolsKey` covers the numeric symbols array without depending on its
    // identity; changing the pick triggers an immediate refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, hidden])

  /* ------------------------------------------------------------- title edit */
  useEffect(() => {
    if (!editingTitle) setDraftTitle(config.title || '')
  }, [config.title, editingTitle])

  useEffect(() => {
    if (!editingTitle) return
    const node = titleInputRef.current
    if (node) {
      try {
        node.focus()
        node.select()
      } catch {
        /* focus is best-effort */
      }
    }
  }, [editingTitle])

  /* -------------------------------------------------------- card height map */
  useLayoutEffect(() => {
    if (collapsed) {
      setMeasuredHeight(0)
      return undefined
    }
    const node = cardRef.current
    if (!node) return undefined
    const update = () => {
      const height = node.offsetHeight
      if (height > 0) setMeasuredHeight(height)
    }
    update()
    let observer = null
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(update)
      observer.observe(node)
    }
    return () => {
      if (observer) observer.disconnect()
    }
  }, [collapsed, size, symbolsKey, config.showSpark])

  /* ----------------------------------------------------------- idle fade */
  useEffect(() => {
    const timeout = Number(config.idleAfterMs) || 0
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = 0
    idleRef.current = false
    setIdle(false)
    if (timeout <= 0) return undefined
    idleTimerRef.current = setTimeout(() => {
      idleRef.current = true
      setIdle(true)
    }, timeout)
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = 0
      }
    }
  }, [config.idleAfterMs])

  const bump = useCallback(() => {
    const timeout = Number(config.idleAfterMs) || 0
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = 0
    }
    if (idleRef.current) {
      idleRef.current = false
      setIdle(false)
    }
    if (timeout > 0) {
      idleTimerRef.current = setTimeout(() => {
        idleRef.current = true
        setIdle(true)
      }, timeout)
    }
  }, [config.idleAfterMs])

  const opacityBase = clampValue(Number(config.opacity) || 100, 20, 100) / 100
  const opacityIdle = clampValue(Number(config.idleOpacity) || 20, 20, 100) / 100
  const active = hover || dragging
  const opacity = active && config.hoverFull !== false ? 1 : idle ? opacityIdle : opacityBase

  /* --------------------------------------------------------------- dragging */
  const beginTitleEdit = () => {
    setDraftTitle(config.title || '')
    setEditingTitle(true)
  }

  const commitTitle = () => {
    setEditingTitle(false)
    const next = draftTitle.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX)
    if (next && next !== config.title) onChange?.({ title: next })
  }

  const cancelTitle = () => {
    setEditingTitle(false)
    setDraftTitle(config.title || '')
  }

  const startDrag = (event) => {
    if (event.button !== 0) return
    if (event.isPrimary === false) return
    const target = event.target
    if (target && typeof target.closest === 'function' && target.closest('[data-hud-no-drag="true"]')) return
    if (dragRef.current) return
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: anchor,
      moved: false,
      // Pointer capture retargets later events to the root, so remember what
      // the user actually pressed to decide between expand/title/open.
      target: event.target,
    }
    try {
      if (rootRef.current) rootRef.current.setPointerCapture(event.pointerId)
    } catch {
      /* capture is an optimisation; plain pointermove also works inside */
    }
    bump()
  }

  const moveDrag = (event) => {
    bump()
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved) {
      if (dx * dx + dy * dy < DRAG_START_SQ) return
      drag.moved = true
      setDragging(true)
    }
    const next = resolveAnchor(
      { x: drag.origin.x + dx, y: drag.origin.y + dy },
      viewport,
      collapsed,
      cardW,
      cardH,
    )
    dragPosRef.current = next
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      if (dragPosRef.current) setDragPos(dragPosRef.current)
    })
  }

  const cancelDrag = () => {
    dragRef.current = null
    dragPosRef.current = null
    setDragPos(null)
    setDragging(false)
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }

  const endDrag = (event) => {
    const drag = dragRef.current
    if (!drag) return
    if (event && drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    const finalPosition = drag.moved ? dragPosRef.current || drag.origin : null
    dragPosRef.current = null
    setDragPos(null)
    try {
      if (rootRef.current && rootRef.current.hasPointerCapture && rootRef.current.hasPointerCapture(drag.pointerId)) {
        rootRef.current.releasePointerCapture(drag.pointerId)
      }
    } catch {
      /* the pointer may already be gone */
    }
    if (drag.moved) {
      if (finalPosition) onChange?.({ position: { x: finalPosition.x, y: finalPosition.y } })
      return
    }
    const target = drag.target
    const action = target && typeof target.closest === 'function' ? target.closest('[data-hud-action]') : null
    const kind = action ? action.getAttribute('data-hud-action') : ''
    if (kind === 'expand') onChange?.({ collapsed: false })
    else if (kind === 'title') beginTitleEdit()
    else if (kind === 'open') onOpenDashboard?.()
  }

  /* ------------------------------------------------------------------ view */
  if (hidden) return null

  const firstSymbol = rows.length > 0 ? rows[0] : null
  const firstQuote = firstSymbol ? quoteMap.get(firstSymbol.id) || null : null
  const firstPct = firstQuote && typeof firstQuote.pct === 'number' ? firstQuote.pct : null
  const pillTone = firstQuote ? signClass(firstPct) : 'flat'
  const pillText = firstQuote ? fmtPct(firstPct) : loading && !error ? '…' : '—'
  const updatedText =
    snapshot && typeof snapshot.updatedAt === 'number'
      ? fmtClock(snapshot.updatedAt)
      : loading
        ? t('hud.waiting')
        : '—'

  const chip = collapsed
    ? h(
        'div',
        {
          key: 'chip',
          className: 'of-hud-chip-row',
          role: 'button',
          tabIndex: 0,
          'data-hud-action': 'expand',
          'aria-label': t('hud.collapsedHint'),
          title: t('hud.expand'),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onChange?.({ collapsed: false })
            }
          },
        },
        h(
          'span',
          {
            className: 'of-hud-pill',
            'data-tone': pillTone,
            title: firstSymbol ? firstSymbol.fallbackName + ' ' + pillText : t('hud.waiting'),
          },
          pillText,
        ),
        h('span', { className: 'of-hud-mascot' }, h(Mark, { size: 22 })),
      )
    : null

  const titleNode = editingTitle
    ? h('input', {
        key: 'title-input',
        className: 'of-hud-title-input',
        ref: titleInputRef,
        value: draftTitle,
        maxLength: TITLE_MAX,
        'data-hud-no-drag': 'true',
        'aria-label': t('hud.titleLabel'),
        onChange: (event) => setDraftTitle(event.target.value),
        onBlur: commitTitle,
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commitTitle()
          } else if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            cancelTitle()
          }
        },
      })
    : h(
        'div',
        {
          key: 'title',
          className: 'of-hud-title',
          'data-hud-action': 'title',
          role: 'button',
          tabIndex: 0,
          title: t('hud.titleLabel'),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              beginTitleEdit()
            }
          },
        },
        config.title || t('hud.title'),
      )

  const head = h(
    'div',
    { className: 'of-hud-head' },
    h('span', { className: 'of-hud-face' }, h(Mark, { size: 15 })),
    titleNode,
    h(
      'div',
      { className: 'of-hud-actions' },
      typeof onPanic === 'function'
        ? h(
            'button',
            {
              type: 'button',
              className: 'of-hud-ibtn of-hud-panic-btn',
              'data-hud-no-drag': 'true',
              title: t('hud.panicNow'),
              'aria-label': t('hud.panicNow'),
              onClick: () => onPanic(),
            },
            h(HudGlyph, { name: 'eye' }),
          )
        : null,
      h(
        'button',
        {
          type: 'button',
          className: 'of-hud-ibtn',
          'data-hud-no-drag': 'true',
          title: t('hud.collapse'),
          'aria-label': t('hud.collapse'),
          onClick: () => onChange?.({ collapsed: true }),
        },
        h(HudGlyph, { name: 'collapse' }),
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'of-hud-ibtn',
          'data-hud-no-drag': 'true',
          title: t('hud.settings'),
          'aria-label': t('hud.settings'),
          onClick: () => onConfigure?.(),
        },
        h(HudGlyph, { name: 'gear' }),
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'of-hud-ibtn',
          'data-hud-no-drag': 'true',
          'data-danger': 'true',
          title: t('hud.close'),
          'aria-label': t('hud.close'),
          onClick: () => onChange?.({ inline: false }),
        },
        h(Icon, { name: 'close', size: 13 }),
      ),
    ),
  )

  const rowsNode = h(
    'div',
    { className: 'of-hud-rows' },
    rows.length === 0
      ? h('div', { className: 'of-hud-row', style: { cursor: 'default' } }, h('span', { className: 'of-hud-row-name' }, t('empty')))
      : rows.map((row) =>
          h(HudRow, {
            key: row.id,
            fallbackName: row.fallbackName,
            quote: quoteMap.get(row.id) || null,
            showSpark: config.showSpark !== false,
            onOpen: onOpenDashboard,
          }),
        ),
  )

  const footNote = error
    ? h(
        'button',
        {
          type: 'button',
          className: 'of-hud-foot-note',
          'data-error': 'true',
          'data-hud-no-drag': 'true',
          title: error,
          onClick: () => {
            if (reloadRef.current) reloadRef.current()
          },
        },
        t('hud.error'),
      )
    : h('span', { className: 'of-hud-foot-note', title: t('hud.disclaimer') }, t('hud.disclaimer'))

  const foot = h(
    'div',
    { className: 'of-hud-foot' },
    h('span', { className: 'of-hud-foot-time', title: t('hud.updated') }, updatedText),
    h('span', { className: 'of-hud-foot-sep', 'aria-hidden': true }, '·'),
    footNote,
    h(
      'button',
      {
        type: 'button',
        className: 'of-hud-ibtn of-hud-foot-btn',
        'data-hud-no-drag': 'true',
        title: t('hud.openDashboard'),
        'aria-label': t('hud.openDashboard'),
        onClick: () => onOpenDashboard?.(),
      },
      h(Icon, { name: 'external', size: 12 }),
    ),
  )

  const card = collapsed
    ? null
    : h(
        'div',
        {
          key: 'card',
          className: 'of-hud-card',
          ref: cardRef,
          role: 'region',
          'aria-label': config.title || t('hud.title'),
        },
        head,
        rowsNode,
        foot,
      )

  return h(
    'div',
    {
      ref: rootRef,
      className: 'of-hud',
      role: 'group',
      'aria-label': collapsed ? t('hud.collapsedHint') : config.title || t('hud.title'),
      'data-collapsed': collapsed ? 'true' : 'false',
      'data-direction': direction,
      'data-reduced': reduceMotion ? 'true' : 'false',
      'data-idle': idle ? 'true' : 'false',
      'data-dragging': dragging ? 'true' : 'false',
      'data-size': size,
      'data-spark': config.showSpark !== false ? 'true' : 'false',
      style: {
        left: left + 'px',
        top: top + 'px',
        width: (collapsed ? COLLAPSED_W : cardW) + 'px',
        height: (collapsed ? COLLAPSED_H : cardH) + 'px',
        opacity,
        '--of-hud-w': cardW + 'px',
      },
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: endDrag,
      onPointerCancel: cancelDrag,
      onLostPointerCapture: cancelDrag,
      onPointerEnter: () => {
        setHover(true)
        bump()
      },
      onPointerLeave: () => setHover(false),
    },
    chip,
    card,
  )
}
