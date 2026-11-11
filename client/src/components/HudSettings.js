/**
 * Floating-HUD settings sheet.
 *
 * A centered modal over a dim backdrop, styled with the page's `--dsw-alias-*`
 * tokens (the HUD artwork itself stays dark; the settings follow the host
 * theme). Everything edits the shared `HudConfig` through `onChange`; the page
 * shell owns persistence and the debounced Host sync.
 *
 * Desktop status is live: `getHud` is polled after a toggle so the sheet can
 * report available / running / reason without a reload.
 */
import { createElement as h, useCallback, useEffect, useRef, useState } from 'react'
import { getHud, postHud } from '../api.js'
import { SYMBOLS } from '../hud-config.js'
import { Icon, Mark } from './Icon.js'

const TITLE_MAX = 18
const IDLE_OPTIONS = [0, 10000, 30000, 60000]
const SIZE_OPTIONS = [
  ['s', 'hud.sizeS'],
  ['m', 'hud.sizeM'],
  ['l', 'hud.sizeL'],
]

function SettingSwitch({ checked, label, disabled, onChange, autoFocus }) {
  return h('button', {
    type: 'button',
    className: 'of-hset-switch',
    role: 'switch',
    'aria-checked': checked ? 'true' : 'false',
    'aria-label': label,
    title: label,
    disabled: Boolean(disabled),
    'data-autofocus': autoFocus ? 'true' : undefined,
    onClick: () => onChange(!checked),
  })
}

export function HudSettings({ t, config, onChange, status, onRefreshStatus, onClose }) {
  const [localStatus, setLocalStatus] = useState(null)
  const [recentering, setRecentering] = useState(false)
  const [desktopPending, setDesktopPending] = useState(false)
  const [titleDraft, setTitleDraft] = useState(config.title || '')
  const sheetRef = useRef(null)
  const titleFocusedRef = useRef(false)
  const cancelTitleRef = useRef(false)
  const direction = t('meta.direction') === 'intl' ? 'intl' : 'cn'

  const refreshStatus = useCallback(() => {
    getHud().then(
      (next) => setLocalStatus(next !== null && typeof next === 'object' ? next : null),
      () => setLocalStatus(null),
    )
    if (typeof onRefreshStatus === 'function') onRefreshStatus()
  }, [onRefreshStatus])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  // Re-check the helper a couple of times after a desktop toggle: spawning is
  // asynchronous on the Host side.
  useEffect(() => {
    if (!desktopPending) return undefined
    const first = setTimeout(refreshStatus, 700)
    const second = setTimeout(refreshStatus, 2200)
    const settle = setTimeout(() => setDesktopPending(false), 2600)
    return () => {
      clearTimeout(first)
      clearTimeout(second)
      clearTimeout(settle)
    }
  }, [desktopPending, refreshStatus])

  useEffect(() => {
    if (!titleFocusedRef.current) setTitleDraft(typeof config.title === 'string' ? config.title : '')
  }, [config.title])

  // Esc to close + keep Tab inside the dialog + restore focus to the opener.
  useEffect(() => {
    const sheet = sheetRef.current
    const opener = typeof document !== 'undefined' ? document.activeElement : null
    const focusables = () => {
      if (!sheet) return []
      return Array.from(
        sheet.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
        ),
      ).filter((node) => node.offsetParent !== null)
    }
    const initial = sheet ? sheet.querySelector('[data-autofocus="true"]') || focusables()[0] : null
    if (initial && typeof initial.focus === 'function') {
      try {
        initial.focus()
      } catch {
        /* focus is best-effort */
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        const target = event.target
        const typing = target && target.tagName === 'INPUT' && target.type === 'text'
        if (typing) return // the title input cancels its own edit
        event.preventDefault()
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key !== 'Tab' || !sheet) return
      const items = focusables()
      if (items.length === 0) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      if (opener && typeof opener.focus === 'function') {
        try {
          opener.focus()
        } catch {
          /* the opener may be gone */
        }
      }
    }
  }, [onClose])

  const onTitleBlur = () => {
    titleFocusedRef.current = false
    if (cancelTitleRef.current) {
      cancelTitleRef.current = false
      setTitleDraft(config.title || '')
      return
    }
    const next = titleDraft.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX)
    if (next && next !== config.title) onChange?.({ title: next })
    else setTitleDraft(config.title || '')
  }

  const onTitleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancelTitleRef.current = true
      event.currentTarget.blur()
    }
  }

  const toggleDesktop = (next) => {
    onChange?.({ desktop: next })
    setDesktopPending(true)
  }

  const recenter = () => {
    if (recentering) return
    setRecentering(true)
    postHud({ action: 'recenter' }).then(
      () => {
        setRecentering(false)
        refreshStatus()
      },
      () => setRecentering(false),
    )
  }

  const symbols = Array.isArray(config.symbols) ? config.symbols : []
  const toggleSymbol = (id) => {
    if (symbols.includes(id)) {
      if (symbols.length <= 1) return
      onChange?.({ symbols: symbols.filter((entry) => entry !== id) })
      return
    }
    if (symbols.length >= 6) return
    onChange?.({ symbols: [...symbols, id] })
  }

  const hud = status !== null && status !== undefined ? status : localStatus
  const available = hud ? hud.available !== false : null
  const running = hud ? hud.running === true : false
  const reason = hud && hud.reason ? String(hud.reason) : ''
  let statusText = t('hud.waiting')
  let statusTone = 'muted'
  if (hud) {
    if (hud.available === false) {
      statusText = t('hud.desktopUnavailable')
      statusTone = 'warn'
    } else if (hud.running === true) {
      statusText = t('hud.desktopOn')
      statusTone = 'ok'
    } else {
      statusText = t('hud.desktopOff')
    }
  }

  const idleAfter = typeof config.idleAfterMs === 'number' ? config.idleAfterMs : 0
  const idleChoices = IDLE_OPTIONS.includes(idleAfter) ? IDLE_OPTIONS.slice() : [...IDLE_OPTIONS, idleAfter]
  idleChoices.sort((left, right) => left - right)
  const opacity = typeof config.opacity === 'number' ? config.opacity : 85
  const idleOpacity = typeof config.idleOpacity === 'number' ? config.idleOpacity : 35
  const size = config.size === 's' || config.size === 'l' ? config.size : 'm'
  const spark = config.showSpark !== false

  return h(
    'div',
    {
      className: 'of-hset-backdrop',
      'data-direction': direction,
      onPointerDown: (event) => {
        if (event.target === event.currentTarget) onClose?.()
      },
    },
    h(
      'section',
      {
        className: 'of-hset',
        ref: sheetRef,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'of-hset-title',
        tabIndex: -1,
      },
      h(
        'header',
        { className: 'of-hset-head' },
        h('span', { className: 'of-hset-mark' }, h(Mark, { size: 18 })),
        h(
          'div',
          { className: 'of-hset-titles' },
          h('h2', { className: 'of-hset-title', id: 'of-hset-title' }, t('hud.title')),
          h('div', { className: 'of-hset-sub' }, t('hud.saved')),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'of-icon-btn of-hset-close',
            title: t('hud.close'),
            'aria-label': t('hud.close'),
            onClick: () => onClose?.(),
          },
          h(Icon, { name: 'close', size: 14 }),
        ),
      ),
      h(
        'div',
        { className: 'of-hset-body' },
        // ------------------------------------------------------ visibility
        h(
          'section',
          { className: 'of-hset-section' },
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.inline')),
              h(SettingSwitch, {
                checked: config.inline === true,
                label: t('hud.inline'),
                autoFocus: true,
                onChange: (next) => onChange?.({ inline: next }),
              }),
            ),
            h('div', { className: 'of-hset-hint' }, t('hud.inlineHint')),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.desktop')),
              h(SettingSwitch, {
                checked: config.desktop === true,
                label: t('hud.desktop'),
                disabled: available === false,
                onChange: toggleDesktop,
              }),
            ),
            h('div', { className: 'of-hset-hint' }, t('hud.desktopHint')),
            h(
              'div',
              { className: 'of-hset-status', 'data-tone': statusTone },
              h('span', { className: 'of-hset-dot', 'aria-hidden': true }),
              h('span', { className: 'of-hset-status-text' }, statusText),
              reason && !running ? h('span', { className: 'of-hset-status-reason', title: reason }, reason) : null,
              h(
                'button',
                {
                  type: 'button',
                  className: 'of-btn',
                  style: { flex: 'none', marginLeft: 'auto', padding: '4px 9px', fontSize: 10.5 },
                  title: t('hud.recenter'),
                  disabled: !running || recentering,
                  onClick: recenter,
                },
                t('hud.recenter'),
              ),
            ),
          ),
        ),
        // ------------------------------------------------------ instruments
        h(
          'section',
          { className: 'of-hset-section' },
          h(
            'div',
            { className: 'of-hset-section-head' },
            h('span', { className: 'of-hset-section-label' }, t('hud.symbols')),
            h('span', { className: 'of-hset-section-meta' }, symbols.length + '/6'),
          ),
          h(
            'div',
            { className: 'of-hset-symbols', role: 'group', 'aria-label': t('hud.symbols') },
            SYMBOLS.map((symbol) => {
              const selected = symbols.includes(symbol.id)
              return h(
                'button',
                {
                  key: symbol.id,
                  type: 'button',
                  className: 'of-hset-symbol',
                  'aria-pressed': selected ? 'true' : 'false',
                  title: symbol.name,
                  onClick: () => toggleSymbol(symbol.id),
                },
                h('span', { className: 'of-hset-check', 'aria-hidden': true }, selected ? '✓' : ''),
                h('span', { className: 'of-hset-symbol-name' }, symbol.name),
              )
            }),
          ),
          h('div', { className: 'of-hset-hint' }, t('hud.symbolsHint')),
        ),
        // -------------------------------------------------------- appearance
        h(
          'section',
          { className: 'of-hset-section' },
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.titleLabel')),
              h('span', { className: 'of-hset-count' }, titleDraft.length + '/' + TITLE_MAX),
            ),
            h('input', {
              type: 'text',
              className: 'of-hset-input',
              value: titleDraft,
              maxLength: TITLE_MAX,
              placeholder: t('hud.titleLabel'),
              'aria-label': t('hud.titleLabel'),
              onFocus: () => {
                titleFocusedRef.current = true
              },
              onBlur: onTitleBlur,
              onChange: (event) => setTitleDraft(event.target.value),
              onKeyDown: onTitleKeyDown,
            }),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.opacity')),
              h('input', {
                type: 'range',
                className: 'of-hset-range',
                min: 20,
                max: 100,
                step: 1,
                value: opacity,
                'aria-label': t('hud.opacity'),
                onChange: (event) => onChange?.({ opacity: Number(event.target.value) }),
              }),
              h('span', { className: 'of-hset-value' }, opacity + '%'),
            ),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.idleOpacity')),
              h('input', {
                type: 'range',
                className: 'of-hset-range',
                min: 20,
                max: 100,
                step: 1,
                value: idleOpacity,
                disabled: idleAfter === 0,
                'aria-label': t('hud.idleOpacity'),
                onChange: (event) => onChange?.({ idleOpacity: Number(event.target.value) }),
              }),
              h('span', { className: 'of-hset-value' }, idleOpacity + '%'),
            ),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.idleAfter')),
              h(
                'select',
                {
                  className: 'of-hset-select',
                  value: String(idleAfter),
                  'aria-label': t('hud.idleAfter'),
                  onChange: (event) => onChange?.({ idleAfterMs: Number(event.target.value) }),
                },
                idleChoices.map((value) =>
                  h('option', { key: value, value: String(value) }, value === 0 ? t('hud.idleOff') : Math.round(value / 1000) + 's'),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.hoverFull')),
              h(SettingSwitch, {
                checked: config.hoverFull !== false,
                label: t('hud.hoverFull'),
                onChange: (next) => onChange?.({ hoverFull: next }),
              }),
            ),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.size')),
              h(
                'div',
                { className: 'of-hset-seg', role: 'group', 'aria-label': t('hud.size') },
                SIZE_OPTIONS.map(([value, key]) =>
                  h(
                    'button',
                    {
                      key: value,
                      type: 'button',
                      className: 'of-hset-seg-btn',
                      'aria-pressed': size === value ? 'true' : 'false',
                      onClick: () => onChange?.({ size: value }),
                    },
                    t(key),
                  ),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'of-hset-field' },
            h(
              'div',
              { className: 'of-hset-line' },
              h('span', { className: 'of-hset-label' }, t('hud.spark')),
              h(SettingSwitch, {
                checked: spark,
                label: t('hud.spark'),
                onChange: (next) => onChange?.({ showSpark: next }),
              }),
            ),
          ),
        ),
        // ---------------------------------------------------------- position
        h(
          'section',
          { className: 'of-hset-section' },
          h(
            'div',
            { className: 'of-hset-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'of-btn',
                onClick: () => onChange?.({ position: { x: 0, y: 0 } }),
              },
              t('hud.resetPosition'),
            ),
            h('span', { className: 'of-hset-hint' }, t('hud.positionHint')),
          ),
        ),
      ),
    ),
  )
}
