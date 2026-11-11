import { createElement as h } from 'react'

const GLYPHS = {
  refresh: (strokeWidth) =>
    h(
      'g',
      null,
      h('path', { d: 'M20.4 12a8.4 8.4 0 1 1-2.6-6.05', strokeWidth }),
      h('path', { d: 'M20.4 3.6v4.8h-4.8', strokeWidth }),
    ),
  search: (strokeWidth) =>
    h(
      'g',
      null,
      h('circle', { cx: 10.8, cy: 10.8, r: 6.4, strokeWidth }),
      h('path', { d: 'm15.6 15.6 4.2 4.2', strokeWidth }),
    ),
  close: (strokeWidth) => h('path', { d: 'M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6', strokeWidth }),
  back: (strokeWidth) => h('path', { d: 'M14.6 5.4 8 12l6.6 6.6', strokeWidth }),
  external: (strokeWidth) =>
    h(
      'g',
      null,
      h('path', { d: 'M13.5 5.5h5v5', strokeWidth }),
      h('path', { d: 'M18.5 5.5 10.8 13.2', strokeWidth }),
      h('path', { d: 'M18.5 13v4.4a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 17.4V7.1a1.6 1.6 0 0 1 1.6-1.6h4.2', strokeWidth }),
    ),
  float: (strokeWidth) =>
    h(
      'g',
      null,
      h('rect', { x: 3.5, y: 4.5, width: 17, height: 14, rx: 2.6, strokeWidth }),
      h('rect', { x: 11, y: 10.5, width: 7, height: 5.4, rx: 1.2, fill: 'currentColor', stroke: 'none', opacity: 0.9 }),
    ),
  chevron: (strokeWidth) => h('path', { d: 'm8.5 5.5 6.5 6.5-6.5 6.5', strokeWidth }),
  info: (strokeWidth) =>
    h(
      'g',
      null,
      h('circle', { cx: 12, cy: 12, r: 8.4, strokeWidth }),
      h('path', { d: 'M12 11v5.2', strokeWidth }),
      h('path', { d: 'M12 7.8h.01', strokeWidth: strokeWidth + 0.6 }),
    ),
}

/**
 * Small line icon. `name` is one of the keys in GLYPHS; unknown names render
 * nothing so a typo costs one glyph, not the page.
 */
export function Icon({ name, size = 16, strokeWidth = 1.7, className, style }) {
  const glyph = GLYPHS[name]
  if (!glyph) return null
  return h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: size,
      height: size,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
      className,
      style: { display: 'block', flex: 'none', ...style },
    },
    glyph(strokeWidth),
  )
}

/** The OpenFin lens mark — used in the page header and the sidebar row. */
export function Mark({ size = 22, radius = 6 }) {
  return h(
    'svg',
    {
      viewBox: '0 0 64 64',
      width: size,
      height: size,
      'aria-hidden': true,
      focusable: false,
      style: { display: 'block' },
    },
    h('rect', { width: 64, height: 64, rx: 15, fill: 'transparent' }),
    h('circle', { cx: 32, cy: 33, r: 18.5, fill: 'none', stroke: 'currentColor', strokeWidth: 3.2, opacity: 0.9 }),
    h('path', {
      d: 'M14.5 39.5 24 29.5l7 6.8 9.5-11.2 8 8.4',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 3.2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
    h('circle', { cx: 48.5, cy: 33, r: 3.1, fill: 'var(--of-gold, #c79a3a)' }),
  )
}
