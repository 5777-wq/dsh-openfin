/**
 * AcademyCard — one article card in the Academy grid.
 *
 * A real <button> (the theme's `.of-acard` resets the control chrome); the
 * whole card is the hit target and Enter/Space come for free. The staggered
 * reveal uses the theme's `.of-stagger` hook, driven by the `--i` custom
 * property so the delay matches the card's position in the grid.
 */
import { createElement as h } from 'react'
import { DifficultyDots, Tag } from './Chip.js'

export function AcademyCard(props) {
  const t = props.t
  const article = props.article || {}
  const index = typeof props.index === 'number' ? props.index : 0
  const readMinutes = Number(article.readMinutes)
  const difficulty = Number(article.difficulty)
  return h(
    'button',
    {
      type: 'button',
      className: 'of-acard of-stagger',
      // Cap the stagger so a filtered list never waits on a long delay chain.
      style: { '--i': String(Math.min(index, 6)) },
      onClick: () => props.onOpen(article.id),
    },
    h('span', { className: 'of-acard-title' }, article.title || article.id),
    article.dek ? h('span', { className: 'of-acard-dek' }, article.dek) : null,
    h(
      'span',
      { className: 'of-acard-meta' },
      article.tag ? h(Tag, null, article.tag) : null,
      readMinutes > 0 ? h('span', { className: 'of-meta' }, t('academy.readMinutes', { n: readMinutes })) : null,
      difficulty > 0
        ? h(DifficultyDots, { value: difficulty, label: t('academy.difficulty', { n: difficulty }) })
        : null,
    ),
  )
}
