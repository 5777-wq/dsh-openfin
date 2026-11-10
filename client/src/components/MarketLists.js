import { createElement as h, useState } from 'react'
import { fmtCompact, fmtPct, fmtPrice, signClass } from '../format.js'

/**
 * Gainers / losers / most-active A-share list with a compact tab switch.
 * @param {{ movers: { up?: any[], down?: any[], active?: any[] }, t: (key: string) => string }} props
 */
export function MoversList({ movers, t }) {
  const [tab, setTab] = useState('up')
  const rows = Array.isArray(movers && movers[tab]) ? movers[tab] : []
  const tabs = [
    { id: 'up', label: t('market.gainers') },
    { id: 'down', label: t('market.losers') },
    { id: 'active', label: t('market.active') },
  ]
  return h(
    'div',
    null,
    h(
      'div',
      { className: 'of-section-head', style: { padding: '12px 14px 0' } },
      h('h3', { className: 'of-section-title' }, t('market.movers')),
    ),
    h(
      'div',
      { className: 'of-movers-tabs', role: 'tablist' },
      tabs.map((item) =>
        h(
          'button',
          {
            key: item.id,
            type: 'button',
            role: 'tab',
            className: 'of-movers-tab',
            'aria-selected': item.id === tab,
            onClick: () => setTab(item.id),
          },
          item.label,
        ),
      ),
    ),
    rows.length === 0
      ? h('div', { className: 'of-empty', style: { padding: '14px 18px' } }, t('empty'))
      : h(
          'div',
          { className: 'of-movers', role: 'tabpanel' },
          rows.map((row, index) =>
            h(
              'div',
              { key: row.code || index, className: 'of-mover' },
              h('span', { className: 'of-mover-rank' }, index + 1),
              h(
                'span',
                { className: 'of-mover-name' },
                row.name,
                h('span', { className: 'of-mover-code' }, row.code),
              ),
              h(
                'span',
                { className: 'of-mover-pct of-' + signClass(row.pct) },
                tab === 'active' && Number.isFinite(row.amount)
                  ? fmtCompact(row.amount)
                  : fmtPct(row.pct),
              ),
            ),
          ),
        ),
  )
}

/** News headline list; items open in a new tab. */
export function NewsList({ news, t, limit = 8 }) {
  const items = Array.isArray(news) ? news.slice(0, limit) : []
  return h(
    'div',
    null,
    h(
      'div',
      { className: 'of-section-head', style: { padding: '12px 14px 0' } },
      h('h3', { className: 'of-section-title' }, t('market.news')),
      h('span', { className: 'of-section-hint' }, t('market.newsHint')),
    ),
    items.length === 0
      ? h('div', { className: 'of-empty', style: { padding: '14px 18px' } }, t('empty'))
      : h(
          'div',
          { className: 'of-news' },
          items.map((item) =>
            h(
              'a',
              {
                key: item.id,
                className: 'of-news-item',
                href: item.url,
                target: '_blank',
                rel: 'noreferrer noopener',
              },
              h('div', { className: 'of-news-time' }, item.time || ''),
              h('div', { className: 'of-news-title' }, item.title),
            ),
          ),
        ),
  )
}

/** One index quote row used by the sector panel. */
export function StockRow({ stock }) {
  return h(
    'div',
    { className: 'of-stock' },
    h('span', { className: 'of-stock-name' }, stock.name),
    h('span', { className: 'of-stock-code' }, stock.code),
    h('span', { className: 'of-stock-pct of-' + signClass(stock.pct) }, fmtPct(stock.pct)),
  )
}

/** Sector detail panel that expands under the heatmap. */
export function SectorPanel({ sector, loading, onClose, t }) {
  const open = Boolean(sector)
  const stocks = sector && Array.isArray(sector.stocks) ? sector.stocks : []
  return h(
    'div',
    { className: 'of-sector', 'data-open': open ? 'true' : 'false' },
    h(
      'div',
      { className: 'of-sector-inner' },
      h(
        'div',
        { className: 'of-sector-pad' },
        h(
          'div',
          { className: 'of-sector-head' },
          h('span', { className: 'of-sector-name' }, sector ? sector.name : ''),
          sector
            ? h('span', { className: 'of-chip', 'data-tone': 'brand' }, fmtPct(sector.pct))
            : null,
          h('span', { style: { flex: 1 } }),
          h(
            'button',
            {
              type: 'button',
              className: 'of-icon-btn',
              style: { width: 26, height: 26 },
              onClick: onClose,
              'aria-label': t('market.closeSector'),
            },
            h('span', { style: { fontSize: 14, lineHeight: 1 } }, '×'),
          ),
        ),
        loading
          ? h('div', { className: 'of-skeleton', style: { height: 54 } })
          : stocks.length === 0
            ? h('div', { className: 'of-empty', style: { padding: '10px 0' } }, t('market.sectorEmpty'))
            : h(
                'div',
                { className: 'of-sector-stocks' },
                stocks.map((stock) => h(StockRow, { key: stock.code, stock })),
              ),
        sector
          ? h(
              'div',
              { className: 'of-meta', style: { marginTop: 8 } },
              t('market.sectorHint'),
            )
          : null,
      ),
    ),
  )
}
