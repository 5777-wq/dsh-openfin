import { createElement as h } from 'react'

export function Skeleton({ height = 12, width = '100%', radius, style, className }) {
  return h('div', {
    className: className ? 'of-skeleton ' + className : 'of-skeleton',
    style: { height, width, borderRadius: radius, ...style },
    'aria-hidden': true,
  })
}

/** Three shimmering lines, for loading paragraphs/lists. */
export function SkeletonLines({ lines = 3, gap = 8 }) {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap }, 'aria-hidden': true },
    Array.from({ length: lines }, (_, index) =>
      h(Skeleton, {
        key: index,
        height: 10,
        width: index === lines - 1 ? '62%' : '100%',
        radius: 5,
      }),
    ),
  )
}

export function EmptyState({ title, body, icon }) {
  return h(
    'div',
    { className: 'of-empty' },
    icon ? h('div', { className: 'of-empty-icon' }, icon) : null,
    title ? h('div', { className: 'of-error-title' }, title) : null,
    body ? h('div', null, body) : null,
  )
}

export function ErrorState({ title, body, retryLabel, onRetry }) {
  return h(
    'div',
    { className: 'of-error', role: 'alert' },
    h('div', { className: 'of-error-title' }, title),
    body ? h('div', null, body) : null,
    onRetry && retryLabel
      ? h('button', { type: 'button', className: 'of-btn', onClick: onRetry, style: { marginTop: 4 } }, retryLabel)
      : null,
  )
}
