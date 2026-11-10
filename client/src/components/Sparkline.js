import { createElement as h } from 'react'

/**
 * Intraday sparkline. Values are normalized to the box; the fill uses the
 * direction color at low opacity so the card stays quiet.
 */
export function Sparkline({ values, up }) {
  if (!Array.isArray(values) || values.length < 3) return null
  let min = Infinity
  let max = -Infinity
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  const span = max - min || 1
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100
    const y = 100 - ((value - min) / span) * 96 - 2
    return [x, y]
  })
  const line = points
    .map(([x, y], index) => (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2))
    .join(' ')
  const area = line + ' L100 100 L0 100 Z'
  const color = up ? 'var(--of-up)' : 'var(--of-down)'
  return h(
    'svg',
    {
      className: 'of-quote-spark',
      viewBox: '0 0 100 100',
      preserveAspectRatio: 'none',
      'aria-hidden': true,
      focusable: false,
    },
    h('path', { d: area, fill: color, opacity: 0.1 }),
    h('path', {
      d: line,
      fill: 'none',
      stroke: color,
      strokeWidth: 1.4,
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
      opacity: 0.9,
    }),
  )
}
