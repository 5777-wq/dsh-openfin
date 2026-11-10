import { createElement as h } from 'react'

/** Small rounded label; `tone="brand"` tints it with the OpenFin accent. */
export function Chip({ children, tone }) {
  return h('span', { className: 'of-chip', 'data-tone': tone }, children)
}

/** Academy tag pill. */
export function Tag({ children }) {
  return h('span', { className: 'of-tag' }, children)
}

/** Difficulty as filled dots (1–4, matching the source data). */
export function DifficultyDots({ value, label }) {
  const level = Math.max(1, Math.min(4, Number(value) || 1))
  return h(
    'span',
    { className: 'of-dots', title: label, 'aria-label': label },
    [0, 1, 2, 3].map((index) =>
      h('span', { key: index, className: 'of-dot' + (index < level ? ' of-dot-on' : '') }),
    ),
  )
}
