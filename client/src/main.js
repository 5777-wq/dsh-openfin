import { createElement as h, useCallback, useEffect, useRef, useState } from 'react'
import { getSnapshot, getHud, postHud } from './api.js'
import { CSS } from './theme.js'
import { en, zh } from './generated-locales.js'
import { Mark, Icon } from './components/Icon.js'
import { HUD_CSS } from './theme-hud.js'
import { loadHudConfig, saveHudConfig, subscribeHudConfig, syncHudConfig, pushDesktop, openHudSettings, onOpenHudSettings } from './hud-config.js'
import { FloatingHud } from './components/FloatingHud.js'
import { HudSettings } from './components/HudSettings.js'
import { Tabs, RefreshButton } from './components/Tabs.js'
import { Dashboard } from './views/Dashboard.js'
import { Terminal } from './views/Terminal.js'
import { Academy } from './views/Academy.js'
import { ArticleView } from './views/ArticleView.js'
import { Glossary } from './views/Glossary.js'

export const name = 'dsh-openfin'

export const inject = ['slots', 'locale']

const NS = 'dsh-openfin'
const PANEL_ID = 'dsh-openfin'
const TAB_KEY = 'dsh-openfin:tab'

function readTab() {
  try {
    const saved = window.localStorage.getItem(TAB_KEY)
    if (saved === 'terminal' || saved === 'market' || saved === 'academy' || saved === 'glossary') return saved
  } catch {
    /* storage may be disabled; the default tab is fine */
  }
  return 'terminal'
}

function writeTab(tab) {
  try {
    window.localStorage.setItem(TAB_KEY, tab)
  } catch {
    /* ignore */
  }
}

/**
 * Snapshot polling shared by the header refresh button and the page body.
 *
 * `enabled` is false on the terminal tab: the embedded OpenFinLens app has its
 * own data sources, so polling `/api/snapshot` behind it only costs the Host
 * upstream calls nobody reads. The last snapshot is kept while disabled, so
 * switching back paints immediately.
 *
 * @param {boolean} enabled
 */
function useSnapshotFeed(enabled) {
  const [state, setState] = useState({ snapshot: null, loading: true, error: null })
  const [generation, setGeneration] = useState(0)

  const refresh = useCallback(() => setGeneration((value) => value + 1), [])

  useEffect(() => {
    if (!enabled) return undefined
    const doc = typeof document === 'undefined' ? null : document
    const controller = new AbortController()
    let alive = true
    let timer = 0
    let failures = 0

    const schedule = (delay) => {
      clearTimeout(timer)
      timer = setTimeout(run, Math.max(10000, Number(delay) || 30000))
    }

    const run = async () => {
      clearTimeout(timer)
      timer = 0
      // A hidden page does not need live quotes. The visibility listener below
      // fetches once when the page comes back, instead of polling in the dark.
      if (doc !== null && doc.hidden) return
      try {
        const snapshot = await getSnapshot(controller.signal)
        if (!alive) return
        failures = 0
        setState({ snapshot, loading: false, error: null })
        schedule(snapshot && snapshot.refreshMs)
      } catch (error) {
        if (!alive || (error && error.name === 'AbortError')) return
        failures += 1
        setState((previous) => ({
          snapshot: previous.snapshot,
          loading: false,
          error: (error && error.message) || String(error),
        }))
        // Back off: an upstream outage should not be retried every 30 s forever.
        schedule(Math.min(30_000 * 2 ** (failures - 1), 5 * 60_000))
      }
    }

    const onVisibility = () => {
      if (doc === null) return
      if (doc.hidden) {
        clearTimeout(timer)
        timer = 0
        return
      }
      if (timer === 0) void run()
    }

    doc?.addEventListener('visibilitychange', onVisibility)
    setState((previous) => ({ snapshot: previous.snapshot, loading: true, error: null }))
    if (doc === null || !doc.hidden) void run()
    return () => {
      alive = false
      controller.abort()
      clearTimeout(timer)
      doc?.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled, generation])

  return { ...state, refresh }
}

/**
 * Floating "摸鱼" HUD layer: the in-page widget plus its settings sheet.
 *
 * Registered once in `shell.overlay` at root scope, so it stays alive across
 * panel and tab switches. The config is the shared HudConfig: the page header
 * opens the settings sheet, the sheet edits the config, and every change is
 * mirrored to the Host for the desktop helper.
 */
/**
 * Match a keyboard event against an Electron-style accelerator such as
 * `CommandOrControl+Shift+H` (the same string the desktop helper registers).
 * @param {KeyboardEvent} event
 * @param {string} accelerator
 */
function matchesAccelerator(event, accelerator) {
  if (typeof accelerator !== 'string' || accelerator === '') return false
  const parts = accelerator.split('+').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return false
  const key = parts[parts.length - 1].toLowerCase()
  const modifiers = new Set(parts.slice(0, -1).map((part) => part.toLowerCase()))
  const wantsCtrl = modifiers.has('commandorcontrol') || modifiers.has('control') || modifiers.has('ctrl') || modifiers.has('command') || modifiers.has('cmd')
  const wantsShift = modifiers.has('shift')
  const wantsAlt = modifiers.has('alt') || modifiers.has('option')
  if (event.ctrlKey !== wantsCtrl && !(modifiers.has('commandorcontrol') && event.metaKey)) return false
  if (event.shiftKey !== wantsShift) return false
  if (event.altKey !== wantsAlt) return false
  if (key === 'space') return event.code === 'Space' || event.key === ' '
  return event.key.toLowerCase() === key
}

function HudLayer({ t, onOpenDashboard }) {
  const [config, setConfig] = useState(loadHudConfig)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [status, setStatus] = useState(null)
  // Boss key visibility is deliberately ephemeral: reloading DSH brings the HUD back.
  const [hidden, setHidden] = useState(false)
  const hiddenRef = useRef(false)

  const setPanic = useCallback((next) => {
    hiddenRef.current = next
    setHidden(next)
    postHud({ action: 'panic', hidden: next }).catch(() => {})
  }, [])

  useEffect(() => subscribeHudConfig(setConfig), [])
  useEffect(() => onOpenHudSettings(() => setSettingsOpen(true)), [])

  useEffect(() => {
    if (!config.panicEnabled) return undefined
    const onKeyDown = (event) => {
      if (!matchesAccelerator(event, config.panicShortcut)) return
      event.preventDefault()
      event.stopPropagation()
      setPanic(!hiddenRef.current)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [config.panicEnabled, config.panicShortcut, setPanic])

  // Leaving the page hidden or turning the HUD off must not trap the state.
  useEffect(() => {
    if (!config.inline && hidden) setPanic(false)
  }, [config.inline, hidden, setPanic])

  const update = useCallback((partial) => {
    const next = saveHudConfig(partial)
    setConfig(next)
    if (partial && partial.desktop !== undefined) pushDesktop(partial.desktop)
    else syncHudConfig(next)
  }, [])

  const refreshStatus = useCallback(() => {
    getHud().then(setStatus, () => setStatus(null))
  }, [])

  useEffect(() => {
    if (!config.desktop && !settingsOpen) return undefined
    refreshStatus()
    const timer = setInterval(() => {
      // No point waking the Host for a status nobody can see.
      if (typeof document !== 'undefined' && document.hidden) return
      if (config.desktop) refreshStatus()
    }, 15000)
    return () => clearInterval(timer)
  }, [config.desktop, settingsOpen, refreshStatus])

  if (!config.inline && !settingsOpen) return null

  return h(
    'div',
    { className: 'of-hud-layer' },
    config.inline
      ? h(FloatingHud, {
          t,
          config,
          onChange: update,
          onConfigure: () => setSettingsOpen(true),
          onOpenDashboard,
          hidden,
          onPanic: () => setPanic(true),
        })
      : null,
    settingsOpen
      ? h(HudSettings, {
          t,
          config,
          status,
          onChange: update,
          onRefreshStatus: refreshStatus,
          onClose: () => setSettingsOpen(false),
          onPanicNow: () => {
            setPanic(true)
            setSettingsOpen(false)
          },
        })
      : null,
  )
}

function OpenFinPage({ t }) {
  const [tab, setTab] = useState(readTab)
  const [articleId, setArticleId] = useState(null)
  // The terminal is a same-origin iframe with the whole OpenFinLens app: once
  // the user opens it, keep it mounted (hidden) so switching tabs does not
  // reload the app and lose its tab/scroll/chart state.
  const [terminalMounted, setTerminalMounted] = useState(() => readTab() === 'terminal')
  // Nothing on the terminal tab reads the snapshot: the embedded app has its
  // own feeds, so the poll stays off until a tab that shows quotes is opened.
  const feed = useSnapshotFeed(tab !== 'terminal')
  const direction = t('meta.direction') === 'intl' ? 'intl' : 'cn'

  const changeTab = useCallback((next) => {
    setArticleId(null)
    setTab(next)
    writeTab(next)
    if (next === 'terminal') setTerminalMounted(true)
  }, [])

  const openArticle = useCallback((id) => {
    setArticleId(id)
    setTab('academy')
  }, [])

  const updated = feed.snapshot && feed.snapshot.updatedAt

  return h(
    'div',
    { className: 'of-page', 'data-direction': direction, 'data-view': tab },
    h(
      'div',
      { className: 'of-inner' },
      h(
        'header',
        { className: 'of-head' },
        h('div', { className: 'of-mark' }, h(Mark, { size: 23 })),
        h(
          'div',
          { className: 'of-titles' },
          h('h1', { className: 'of-title' }, t('title')),
          h('div', { className: 'of-sub' }, t('subtitle')),
        ),
        h(
          'div',
          { className: 'of-head-actions' },
          h(Tabs, {
            items: [
              { id: 'terminal', label: t('tab.terminal') },
              { id: 'market', label: t('tab.market') },
              { id: 'academy', label: t('tab.academy') },
              { id: 'glossary', label: t('tab.glossary') },
            ],
            value: tab,
            onChange: changeTab,
            ariaLabel: t('title'),
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'of-icon-btn',
              title: t('hud.settings'),
              'aria-label': t('hud.settings'),
              onClick: () => openHudSettings(),
            },
            h(Icon, { name: 'float', size: 15 }),
          ),
          tab === 'market'
            ? h(RefreshButton, {
                label: t('refresh'),
                busy: feed.loading,
                onClick: feed.refresh,
              })
            : null,
        ),
      ),
      h(
        'main',
        { id: 'of-panel-' + tab, role: 'tabpanel' },
        terminalMounted
          ? h(
              'div',
              {
                className: 'of-terminal-holder',
                'data-active': tab === 'terminal' ? 'true' : 'false',
              },
              h(Terminal, { t, active: tab === 'terminal' }),
            )
          : null,
        tab === 'terminal'
          ? null
          : tab === 'market'
          ? h(Dashboard, {
              t,
              snapshot: feed.snapshot,
              loading: feed.loading,
              error: feed.error,
              onRetry: feed.refresh,
            })
          : tab === 'academy'
            ? articleId
              ? h(ArticleView, {
                  t,
                  id: articleId,
                  onBack: () => setArticleId(null),
                  onOpenArticle: openArticle,
                })
              : h(Academy, { t, onOpenArticle: openArticle })
            : h(Glossary, { t }),
      ),
      tab === 'terminal'
        ? null
        : h(
        'footer',
        { className: 'of-foot' },
        h('span', { className: 'of-live-dot', 'data-stale': feed.snapshot && feed.snapshot.stale ? 'true' : 'false' }),
        h(
          'span',
          { className: 'of-foot-meta' },
          t('market.updated') + ' ' + (updated ? new Date(updated).toLocaleTimeString() : '—'),
        ),
        feed.snapshot && feed.snapshot.stale ? h('span', { className: 'of-badge' }, t('stale')) : null,
        h('span', { style: { flex: 1 } }),
        h(
          'a',
          { href: 'https://github.com/5777-wq/openfinlens', target: '_blank', rel: 'noreferrer noopener' },
          'OpenFinLens',
        ),
        h('span', null, '·'),
        h(
          'a',
          { href: 'https://github.com/5777-wq/openfin-academy', target: '_blank', rel: 'noreferrer noopener' },
          'OpenFin Academy',
        ),
        h('span', null, '·'),
        h('span', null, t('market.disclaimer')),
      ),
    ),
  )
}

export function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-openfin: dictionaries')
  const raw = ctx.locale.bind(NS)

  /**
   * Translate with optional `{name}` placeholder interpolation.
   * @param {string} key
   * @param {Record<string, string | number>} [vars]
   */
  const t = (key, vars) => {
    let text = raw(key)
    if (typeof text !== 'string') return key
    if (vars === undefined) return text
    return text.replace(/\{(\w+)\}/g, (match, name) =>
      vars[name] === undefined || vars[name] === null ? match : String(vars[name]),
    )
  }

  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.setAttribute('data-dsh-openfin', '')
    tag.textContent = CSS + HUD_CSS
    document.head.appendChild(tag)
    return () => {
      tag.remove()
    }
  }, 'dsh-openfin: stylesheet')

  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 2,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ t }),
      },
      (owner) => h(Mark, { size: (owner && owner.size) || 16 }),
    ),
  )

  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({ t }),
      },
      (ownerProps) => h(OpenFinPage, { t: (ownerProps && ownerProps.t) || t }),
    ),
  )

  // The floating HUD lives in the frame-wide overlay, not in the page, so it
  // survives panel switches and can stay visible while the user chats.
  const layout = ctx.get ? ctx.get('layout') : undefined
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'dsh-openfin-hud',
        order: 60,
        label: () => t('hud.title'),
        locale: NS,
        inject: () => ({ t }),
      },
      (ownerProps) =>
        h(HudLayer, {
          t: (ownerProps && ownerProps.t) || t,
          onOpenDashboard: () => {
            if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(PANEL_ID)
          },
        }),
    ),
  )
}
