/**
 * FilterChips — the horizontal section switcher for the Academy tab.
 *
 * One chip per `data.sections` entry (the Host always includes the `all`
 * pseudo-section). Selection is controlled by the Academy view so the search
 * box and the chips filter the same list.
 */
import { createElement as h } from 'react'

export function FilterChips(props) {
  const sections = Array.isArray(props.sections) ? props.sections : []
  const active = props.active
  const onSelect = props.onSelect
  if (sections.length === 0) return null
  return h(
    'div',
    { className: 'of-filters', role: 'group', 'aria-label': props.label || undefined },
    sections.map((section) =>
      h(
        'button',
        {
          key: section.id,
          type: 'button',
          className: section.id === active ? 'of-filter of-filter-active' : 'of-filter',
          'aria-pressed': section.id === active,
          onClick: () => onSelect(section.id),
        },
        section.label,
      ),
    ),
  )
}
