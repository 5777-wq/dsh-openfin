/**
 * ArticleBody — renders an academy article's markdown through the content
 * half's renderer (`md.js` owns parsing and every `.of-md-*` class).
 *
 * `renderMarkdown` returns a React element array; if it ever throws on an
 * unexpected construct the reader degrades to the raw body text instead of
 * blanking the page. `onTerm` is passed straight through so glossary
 * references (`[[termId|text]]`) can open the term peek in ArticleView.
 */
import { createElement as h, useMemo } from 'react'
import { renderMarkdown } from '../md.js'

export function ArticleBody(props) {
  const body = props.body
  const onTerm = props.onTerm
  const nodes = useMemo(() => {
    if (typeof body !== 'string' || body.trim() === '') return null
    try {
      const rendered = renderMarkdown(body, { onTerm })
      return Array.isArray(rendered) && rendered.length > 0 ? rendered : null
    } catch (error) {
      return [h('p', { key: 'of-md-fallback', className: 'of-md-p' }, body)]
    }
  }, [body, onTerm])
  if (!nodes) return null
  return h('div', { className: 'of-article-body' }, nodes)
}
