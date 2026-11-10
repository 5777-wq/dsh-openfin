import { createElement as h, useCallback, useEffect, useRef, useState } from 'react'
import { getSector } from '../api.js'
import { fmtClock, fmtPct, signClass } from '../format.js'
import { ErrorState, EmptyState, Skeleton, SkeletonLines } from '../components/Feedback.js'
import { QuoteCard } from '../components/QuoteCard.js'
import { Heatmap } from '../components/Heatmap.js'
import { MoversList, NewsList, SectorPanel } from '../components/MarketLists.js'

/**
 * Market tab: quote pulse, sector heatmap with an inline sector panel, movers
 * and the news feed. Owns the sector fetch; the snapshot itself is owned by
 * the page shell so the header refresh button and the footer share it.
 *
 * @param {{ t: Function, snapshot: any, loading: boolean, error: string | null, onRetry: Function }} props
 */
export function Dashboard({ t, snapshot, loading, error, onRetry }) {
  const [sector, setSector] = useState(null)
  const [sectorLoading, setSectorLoading] = useState(false)
  const sectorRequest = useRef(null)

  const clearSector = useCallback(() => {
    if (sectorRequest.current) sectorRequest.current.abort()
    sectorRequest.current = null
    setSector(null)
    setSectorLoading(false)
  }, [])

  const selectSector = useCallback(
    (board) => {
      if (!board) return
      if (sectorRequest.current) sectorRequest.current.abort()
      const controller = new AbortController()
      sectorRequest.current = controller
      setSector({ code: board.code, name: board.name, pct: board.pct, stocks: [] })
      setSectorLoading(true)
      getSector(board.code, controller.signal).then(
        (detail) => {
          if (controller.signal.aborted) return
          setSector({
            code: board.code,
            name: detail.name || board.name,
            pct: typeof detail.pct === 'number' ? detail.pct : board.pct,
            stocks: Array.isArray(detail.stocks) ? detail.stocks : [],
          })
          setSectorLoading(false)
        },
        (reason) => {
          if (controller.signal.aborted) return
          setSector({ code: board.code, name: board.name, pct: board.pct, stocks: [] })
          setSectorLoading(false)
        },
      )
    },
    [sector],
  )

  useEffect(() => () => {
    if (sectorRequest.current) sectorRequest.current.abort()
  }, [])

  if (!snapshot && loading) return h(DashboardSkeleton, { t })
  if (!snapshot && error) {
    return h(ErrorState, {
      title: t('error.title'),
      body: error,
      retryLabel: t('retry'),
      onRetry,
    })
  }
  if (!snapshot) return h(EmptyState, { title: t('empty') })

  const quotes = Array.isArray(snapshot.quotes) ? snapshot.quotes : []
  const boards = Array.isArray(snapshot.boards) ? snapshot.boards : []
  const breadth = snapshot.boardBreadth || null
  const failedParts = Array.isArray(snapshot.parts) ? snapshot.parts.filter((part) => !part.ok) : []

  return h(
    'div',
    { className: 'of-dashboard' },
    failedParts.length > 0 || snapshot.stale
      ? h(
          'div',
          { className: 'of-foot', style: { margin: '0 0 12px', paddingTop: 0, borderTop: 0 } },
          h('span', { className: 'of-badge' }, t('partial')),
          h(
            'span',
            null,
            failedParts.map((part) => part.id).join(' · ') + (snapshot.stale ? ' · cached' : ''),
          ),
        )
      : null,

    h(
      'section',
      { className: 'of-section' },
      h(
        'div',
        { className: 'of-section-head' },
        h('h3', { className: 'of-section-title' }, t('market.indices')),
        h('span', { className: 'of-section-hint' }, t('market.indicesHint')),
      ),
      quotes.length === 0
        ? h(EmptyState, { title: t('empty'), body: t('market.partialBody') })
        : h(
            'div',
            { className: 'of-grid of-grid-quotes' },
            quotes.map((quote, index) => h(QuoteCard, { key: quote.id, quote, index })),
          ),
    ),

    h(
      'section',
      { className: 'of-section' },
      h(
        'div',
        { className: 'of-grid of-grid-main' },
        h(
          'div',
          { className: 'of-card of-heat-card of-fade-in' },
          h(
            'div',
            { className: 'of-heat-top' },
            h('h3', { className: 'of-section-title' }, t('market.heatmap')),
            breadth
              ? h(
                  'div',
                  { className: 'of-heat-breadth', title: t('market.breadth') },
                  h('span', { className: 'of-up' }, String(breadth.up || 0)),
                  h(
                    'span',
                    { className: 'of-breadth-bar', 'aria-hidden': true },
                    h('span', {
                      className: 'of-breadth-up',
                      style: { width: share(breadth.up, breadth.total) + '%' },
                    }),
                    h('span', {
                      className: 'of-breadth-flat',
                      style: { width: share(breadth.flat, breadth.total) + '%' },
                    }),
                    h('span', {
                      className: 'of-breadth-down',
                      style: { width: share(breadth.down, breadth.total) + '%' },
                    }),
                  ),
                  h('span', { className: 'of-down' }, String(breadth.down || 0)),
                )
              : null,
          ),
          h(Heatmap, {
            boards,
            activeCode: sector ? sector.code : null,
            onSelect: selectSector,
            t,
          }),
          h(
            'div',
            { className: 'of-heat-legend' },
            h('span', null, '-5%'),
            h('span', { className: 'of-legend-ramp' }),
            h('span', null, '+5%'),
            h('span', { style: { flex: 1 } }),
            h('span', null, t('market.heatmapHint')),
          ),
          h(SectorPanel, {
            sector,
            loading: sectorLoading,
            onClose: clearSector,
            t,
          }),
        ),
        h(
          'div',
          { className: 'of-rail' },
          h('div', { className: 'of-card of-fade-in' }, h(MoversList, { movers: snapshot.movers, t })),
          h('div', { className: 'of-card of-fade-in' }, h(NewsList, { news: snapshot.news, t })),
        ),
      ),
    ),
  )
}

function share(value, total) {
  const count = Number(value) || 0
  const whole = Number(total) || 0
  if (!whole) return 0
  return Math.round((count / whole) * 100)
}

function DashboardSkeleton({ t }) {
  return h(
    'div',
    { 'aria-label': t('loading'), 'aria-busy': true },
    h(
      'div',
      { className: 'of-grid of-grid-quotes' },
      Array.from({ length: 11 }, (_, index) =>
        h(
          'div',
          { key: index, className: 'of-quote' },
          h(Skeleton, { height: 10, width: '56%' }),
          h(Skeleton, { height: 20, width: '76%', style: { marginTop: 10 } }),
          h(Skeleton, { height: 10, width: '44%', style: { marginTop: 8 } }),
        ),
      ),
    ),
    h(
      'div',
      { className: 'of-grid of-grid-main', style: { marginTop: 14 } },
      h(
        'div',
        { className: 'of-card of-pad' },
        h(Skeleton, { height: 400, radius: 12 }),
      ),
      h(
        'div',
        { className: 'of-card of-pad' },
        h(SkeletonLines, { lines: 8 }),
      ),
    ),
  )
}

export { EmptyState }
