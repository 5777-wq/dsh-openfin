/**
 * GlossaryCard — one term card in the glossary grid. Clicking/Enter expands
 * the full record inline: the detail block stays mounted (the theme animates
 * `.of-gcard[data-open="true"] .of-gcard-detail` from `0fr` to `1fr`), so the
 * open/close motion is a height transition rather than a content swap.
 *
 * `GlossaryRecord` is the same full record without the interactive card
 * chrome; the Glossary daily hero and the ArticleView term peek reuse it.
 */
import { createElement as h } from 'react'

function Field(props) {
  if (!props.text) return null
  return h(
    'div',
    null,
    h('div', { className: 'of-gcard-label' }, props.label),
    h('div', { className: 'of-gcard-text' }, props.text),
  )
}

/** Term name + one-liner + metaphor/number/pit, for non-interactive panels. */
export function GlossaryRecord(props) {
  const t = props.t
  const term = props.term || {}
  return h(
    'div',
    null,
    h('div', { className: 'of-daily-term' }, term.term || term.id),
    term.alias ? h('div', { className: 'of-gcard-alias' }, term.alias) : null,
    term.one ? h('p', { className: 'of-daily-one' }, term.one) : null,
    h(Field, { label: t('glossary.metaphor'), text: term.metaphor }),
    h(Field, { label: t('glossary.number'), text: term.number }),
    h(Field, { label: t('glossary.pit'), text: term.pit }),
  )
}

export function GlossaryCard(props) {
  const t = props.t
  const term = props.term || {}
  const open = Boolean(props.open)
  const index = typeof props.index === 'number' ? props.index : 0
  const detailId = 'of-gloss-' + String(term.id || index)
  const toggle = () => props.onToggle()
  return h(
    'div',
    {
      className: 'of-gcard of-stagger',
      // The reveal is a stagger, not a queue: capping the index keeps a 293
      // card grid from painting its last row 7.6 s after the first.
      style: { '--i': String(Math.min(index, 10)) },
      'data-open': open ? 'true' : 'false',
      role: 'button',
      tabIndex: 0,
      'aria-expanded': open,
      'aria-controls': detailId,
      onClick: toggle,
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggle()
        }
      },
    },
    h(
      'div',
      { className: 'of-gcard-term' },
      h('span', null, term.term || term.id),
      term.alias ? h('span', { className: 'of-gcard-alias' }, term.alias) : null,
    ),
    term.one ? h('div', { className: 'of-gcard-one' }, term.one) : null,
    h(
      'div',
      { className: 'of-gcard-detail' },
      h(
        'div',
        { className: 'of-gcard-detail-inner', id: detailId, 'aria-hidden': open ? 'false' : 'true' },
        h(Field, { label: t('glossary.metaphor'), text: term.metaphor }),
        h(Field, { label: t('glossary.number'), text: term.number }),
        h(Field, { label: t('glossary.pit'), text: term.pit }),
      ),
    ),
  )
}
