import { createElement as h } from 'react'
import { fmtChange, fmtPct, fmtPrice, signClass } from '../format.js'
import { useCountUp } from '../hooks.js'
import { Sparkline } from './Sparkline.js'

/** One index / commodity / crypto quote tile. */
export function QuoteCard({ quote, index = 0 }) {
  const direction = signClass(quote.pct)
  const shown = useCountUp(quote.price, 460)
  const digits = Number.isFinite(quote.digits) ? quote.digits : 2
  return h(
    'div',
    { className: 'of-quote of-stagger', style: { '--i': index } },
    h(
      'div',
      { className: 'of-quote-name' },
      h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, quote.name),
      h('span', {
        className: 'of-quote-dot ' + (direction === 'up' ? 'of-up' : direction === 'down' ? 'of-down' : 'of-flat'),
        style: { background: 'currentColor' },
      }),
    ),
    h('div', { className: 'of-quote-price' }, fmtPrice(shown, digits)),
    h(
      'div',
      { className: 'of-quote-change of-' + direction },
      h('span', null, fmtPct(quote.pct)),
      Number.isFinite(quote.change)
        ? h('span', { style: { opacity: 0.62 } }, fmtChange(quote.change, digits))
        : null,
    ),
    h(Sparkline, { values: quote.spark, up: direction === 'up' }),
  )
}
