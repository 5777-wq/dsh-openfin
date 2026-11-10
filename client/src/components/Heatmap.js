import { createElement as h, useMemo, useRef, useState, useEffect } from 'react'
import { fmtPct, fmtPrice, fmtCompact, signClass } from '../format.js'
import { squarify } from '../layout.js'

const MAX_ALPHA = 6 // |pct| at which the cell reaches its strongest tint

/**
 * Keep the tooltip inside the heatmap: above the cell when there is room,
 * below it when the cell sits against the top edge (the box clips overflow).
 */
function placeTip(tip, size) {
  const left = Math.max(56, Math.min(size.width - 56, tip.x))
  const below = tip.y < 62
  return {
    left,
    top: below ? tip.y + (tip.height || 0) + 6 : Math.max(58, tip.y - 2),
    transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -108%)',
  }
}

function cellBackground(pct) {
  const token = pct >= 0 ? 'var(--of-up)' : 'var(--of-down)'
  const clamped = Math.min(Math.abs(pct), MAX_ALPHA) / MAX_ALPHA
  const strength = Math.round(9 + clamped * 61)
  return `color-mix(in srgb, ${token} ${strength}%, var(--of-surface-2))`
}

/**
 * A-share industry-board treemap. The component owns geometry, color and the
 * hover tooltip; the sector detail panel below it is drawn by Dashboard.
 */
export function Heatmap({ boards, activeCode, onSelect, t }) {
  const hostRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [tip, setTip] = useState(null)

  useEffect(() => {
    const node = hostRef.current
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0] && entries[0].contentRect
      if (rect) setSize({ width: rect.width, height: rect.height })
    })
    observer.observe(node)
    setSize({ width: node.clientWidth, height: node.clientHeight })
    return () => observer.disconnect()
  }, [])

  const rects = useMemo(() => {
    if (!Array.isArray(boards) || size.width < 20 || size.height < 20) return []
    const items = boards.map((board) => ({
      board,
      weight: Number.isFinite(board.marketCap) && board.marketCap > 0 ? board.marketCap : 1,
    }))
    return squarify(items, { x: 0, y: 0, width: size.width, height: size.height })
  }, [boards, size.width, size.height])

  return h(
    'div',
    {
      className: 'of-heat',
      ref: hostRef,
      role: 'group',
      'aria-label': t('market.heatmap'),
      onMouseLeave: () => setTip(null),
    },
    rects.map(({ item, x, y, w, h: height }) => {
      const board = item.board
      const direction = signClass(board.pct)
      const pale = Math.abs(board.pct) < 1.2
      const showPct = height >= 32 && w >= 42
      const showName = w >= 30 && height >= 16
      return h(
        'button',
        {
          key: board.code,
          type: 'button',
          className: 'of-heat-cell',
          'data-pale': pale ? 'true' : 'false',
          'data-active': board.code === activeCode ? 'true' : 'false',
          style: {
            left: x + 0.75,
            top: y + 0.75,
            width: Math.max(0, w - 1.5),
            height: Math.max(0, height - 1.5),
            background: cellBackground(board.pct),
          },
          title: board.name + ' ' + fmtPct(board.pct),
          onMouseEnter: () => setTip({ board, x: x + w / 2, y, height }),
          onFocus: () => setTip({ board, x: x + w / 2, y, height }),
          onBlur: () => setTip(null),
          onClick: () => onSelect && onSelect(board),
        },
        showName
          ? h('div', { className: 'of-heat-label' }, board.name)
          : null,
        showPct
          ? h(
              'div',
              { className: 'of-heat-pct of-' + direction },
              fmtPct(board.pct),
            )
          : null,
      )
    }),
    tip
      ? h(
          'div',
          {
            className: 'of-heat-tip',
            style: placeTip(tip, size),
          },
          h('div', { className: 'of-heat-tip-name' }, tip.board.name),
          h(
            'div',
            { className: 'of-heat-tip-row' },
            h('span', null, t('market.tooltipChange')),
            h('b', { className: 'of-' + signClass(tip.board.pct) }, fmtPct(tip.board.pct)),
          ),
          h(
            'div',
            { className: 'of-heat-tip-row' },
            h('span', null, t('market.tooltipPrice')),
            h('span', null, fmtPrice(tip.board.price, 2)),
          ),
          h(
            'div',
            { className: 'of-heat-tip-row' },
            h('span', null, t('market.tooltipCap')),
            h('span', null, fmtCompact(tip.board.marketCap)),
          ),
        )
      : null,
  )
}
