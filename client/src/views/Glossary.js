/**
 * Glossary — the term-of-the-day hero plus the searchable 293-term grid.
 *
 * Each card expands in place (see GlossaryCard) instead of opening a detail
 * page: the daily hero already shows the full record format, and the grid is
 * where readers scan. Search matches term, alias, one-liner and category label.
 */
import { createElement as h, useEffect, useMemo, useRef, useState } from 'react'
import { getGlossary, useResource } from '../api.js'
import { Chip } from '../components/Chip.js'
import { EmptyState, ErrorState, Skeleton } from '../components/Feedback.js'
import { GlossaryCard, GlossaryRecord } from '../components/GlossaryCard.js'
import { Icon } from '../components/Icon.js'
import { SearchBox } from '../components/SearchBox.js'

const LOADING_TERMS = [0, 1, 2, 3, 4, 5, 6, 7]

function categoryLabel(categories, id) {
  const match = categories.find((category) => category.id === id)
  return match ? match.label : ''
}

/** Term of the day: same record format as an expanded card, hero styling. */
function DailyWord(props) {
  const t = props.t
  const daily = props.daily
  const category = categoryLabel(props.categories, daily.cat)
  return h(
    'section',
    { className: 'of-daily of-fade-in', 'aria-label': t('glossary.daily') },
    h('div', { style: { flex: '1 1 auto', minWidth: 0 } }, h(GlossaryRecord, { t, term: daily })),
    h(
      'div',
      { className: 'of-filters' },
      h(Chip, { tone: 'brand' }, t('glossary.daily')),
      category ? h(Chip, null, category) : null,
    ),
  )
}

export function Glossary(props) {
  const t = props.t
  const { loading, data, error, reload } = useResource((signal) => getGlossary(signal), [])
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)
  const rootRef = useRef(null)

  const terms = data && Array.isArray(data.terms) ? data.terms : []
  const categories = data && Array.isArray(data.categories) ? data.categories : []
  const daily = data && data.daily ? data.daily : null
  const needle = query.trim().toLowerCase()

  // A fresh Glossary tab starts at the top of the page (the page scrolls).
  useEffect(() => {
    const node = rootRef.current
    const page = node && typeof node.closest === 'function' ? node.closest('.of-page') : null
    if (page) page.scrollTop = 0
  }, [])

  const filtered = useMemo(() => {
    if (!needle) return terms
    return terms.filter((term) => {
      const parts = [term.term, term.alias, term.one, term.cat, categoryLabel(categories, term.cat)]
      return parts.filter(Boolean).join(' ').toLowerCase().includes(needle)
    })
  }, [terms, categories, needle])

  // The daily hero is only shown while browsing; searching should stay literal.
  const shown = useMemo(() => {
    if (needle || !daily) return filtered
    return filtered.filter((term) => term.id !== daily.id)
  }, [filtered, daily, needle])

  const body = []
  if (loading) {
    body.push(h(Skeleton, { key: 'daily-skeleton', height: 122, radius: 14 }))
    body.push(
      h(
        'div',
        { key: 'term-skeleton', className: 'of-gloss-cards', 'aria-busy': 'true', 'aria-label': t('a11y.loading') },
        LOADING_TERMS.map((index) => h(Skeleton, { key: index, height: 76, radius: 12 })),
      ),
    )
  } else if (error) {
    body.push(
      h(ErrorState, {
        key: 'error',
        title: t('error.title'),
        body: error,
        retryLabel: t('retry'),
        onRetry: reload,
      }),
    )
  } else {
    if (!needle && daily) body.push(h(DailyWord, { key: 'daily', t, daily, categories }))
    if (shown.length > 0) {
      body.push(
        h(
          'div',
          { key: 'terms' },
          h(
            'div',
            { className: 'of-section-head' },
            h('h2', { className: 'of-section-title' }, t('glossary.terms')),
          ),
          h(
            'div',
            { className: 'of-gloss-cards' },
            shown.map((term, index) =>
              h(GlossaryCard, {
                key: term.id,
                t,
                term,
                index,
                open: openId === term.id,
                onToggle: () => setOpenId((current) => (current === term.id ? null : term.id)),
              }),
            ),
          ),
        ),
      )
    } else {
      body.push(
        h(EmptyState, {
          key: 'empty',
          title: needle ? t('glossary.empty') : t('empty'),
          icon: h(Icon, { name: 'search', size: 20 }),
        }),
      )
    }
  }

  return h(
    'div',
    { className: 'of-gloss of-fade-in', ref: rootRef },
    h(
      'div',
      { className: 'of-toolbar' },
      h(SearchBox, { value: query, onChange: setQuery, placeholder: t('glossary.search') }),
    ),
    ...body,
  )
}
