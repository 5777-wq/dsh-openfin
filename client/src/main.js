import { createElement as h, useCallback, useEffect, useState } from 'react'
import { getSnapshot } from './api.js'
import { CSS } from './theme.js'
import { en, zh } from './generated-locales.js'
import { Mark } from './components/Icon.js'
import { Tabs, RefreshButton } from './components/Tabs.js'
import { Dashboard } from './views/Dashboard.js'
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
    if (saved === 'market' || saved === 'academy' || saved === 'glossary') return saved
  } catch {
    /* storage may be disabled; the default tab is fine */
  }
  return 'market'
}

function writeTab(tab) {
  try {
    window.localStorage.setItem(TAB_KEY, tab)
  } catch {
    /* ignore */
  }
}

/** Snapshot polling shared by the header refresh button and the page body. */
function useSnapshotFeed() {
  const [state, setState] = useState({ snapshot: null, loading: true, error: null })
  const [generation, setGeneration] = useState(0)

  const refresh = useCallback(() => setGeneration((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    let timer = 0

    const schedule = (delay) => {
      clearTimeout(timer)
      timer = setTimeout(run, Math.max(10000, Number(delay) || 30000))
    }

    const run = async () => {
      if (typeof document !== 'undefined' && document.hidden) {
        schedule(8000)
        return
      }
      try {
        const snapshot = await getSnapshot(controller.signal)
        if (!alive) return
        setState({ snapshot, loading: false, error: null })
        schedule(snapshot && snapshot.refreshMs)
      } catch (error) {
        if (!alive || (error && error.name === 'AbortError')) return
        setState((previous) => ({
          snapshot: previous.snapshot,
          loading: false,
          error: (error && error.message) || String(error),
        }))
        schedule(30000)
      }
    }

    setState((previous) => ({ snapshot: previous.snapshot, loading: true, error: null }))
    run()
    return () => {
      alive = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [generation])

  return { ...state, refresh }
}

function OpenFinPage({ t }) {
  const [tab, setTab] = useState(readTab)
  const [articleId, setArticleId] = useState(null)
  const feed = useSnapshotFeed()
  const direction = t('meta.direction') === 'intl' ? 'intl' : 'cn'

  const changeTab = useCallback((next) => {
    setArticleId(null)
    setTab(next)
    writeTab(next)
  }, [])

  const openArticle = useCallback((id) => {
    setArticleId(id)
    setTab('academy')
  }, [])

  const updated = feed.snapshot && feed.snapshot.updatedAt

  return h(
    'div',
    { className: 'of-page', 'data-direction': direction },
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
              { id: 'market', label: t('tab.market') },
              { id: 'academy', label: t('tab.academy') },
              { id: 'glossary', label: t('tab.glossary') },
            ],
            value: tab,
            onChange: changeTab,
            ariaLabel: t('title'),
          }),
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
        tab === 'market'
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
      h(
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
    tag.textContent = CSS
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
}
