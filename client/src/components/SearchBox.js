/**
 * SearchBox — the inline search field shared by the Academy and Glossary tabs.
 *
 * Presentational only: the owning view keeps the query in state. Escape clears
 * a non-empty query, which matches the native feel of `type="search"` while
 * staying identical across browsers.
 */
import { createElement as h } from 'react'
import { Icon } from './Icon.js'

export function SearchBox(props) {
  const value = typeof props.value === 'string' ? props.value : ''
  const placeholder = props.placeholder || ''
  const onChange = props.onChange
  return h(
    'div',
    { className: 'of-search' },
    h('span', { className: 'of-search-icon', 'aria-hidden': 'true' }, h(Icon, { name: 'search', size: 14 })),
    h('input', {
      className: 'of-search-input',
      type: 'search',
      value,
      placeholder,
      'aria-label': placeholder,
      autoComplete: 'off',
      autoCapitalize: 'off',
      autoCorrect: 'off',
      spellCheck: false,
      onChange: (event) => onChange(event.target.value),
      onKeyDown: (event) => {
        if (event.key === 'Escape' && value) {
          event.preventDefault()
          onChange('')
        }
      },
    }),
  )
}
