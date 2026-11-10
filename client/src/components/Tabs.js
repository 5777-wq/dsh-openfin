import { createElement as h } from 'react'
import { Icon } from './Icon.js'

/**
 * Segmented tab control.
 * @param {{ items: Array<{id: string, label: string}>, value: string, onChange: (id: string) => void, ariaLabel?: string }} props
 */
export function Tabs({ items, value, onChange, ariaLabel }) {
  return h(
    'div',
    { className: 'of-tabs', role: 'tablist', 'aria-label': ariaLabel },
    items.map((item) =>
      h(
        'button',
        {
          key: item.id,
          type: 'button',
          role: 'tab',
          className: 'of-tab',
          'aria-selected': item.id === value,
          'aria-controls': 'of-panel-' + item.id,
          onClick: () => onChange(item.id),
        },
        item.label,
      ),
    ),
  )
}

export function RefreshButton({ label, busy, onClick }) {
  return h(
    'button',
    {
      type: 'button',
      className: 'of-icon-btn',
      'data-busy': busy ? 'true' : 'false',
      title: label,
      'aria-label': label,
      onClick,
    },
    h(Icon, { name: 'refresh', size: 15 }),
  )
}
