/**
 * Academy — the article library: search + section chips + card grid.
 *
 * Data comes from the Host (`GET /dsh-openfin/api/academy`); search and the
 * section filter are client-side over the 25-card index. Cards open the
 * reader through `onOpenArticle(id)`, which the page owns.
 */
import { createElement as h, useEffect, useMemo, useRef, useState } from 'react'
import { getAcademy, useResource } from '../api.js'
import { AcademyCard } from '../components/AcademyCard.js'
import { EmptyState, ErrorState, Skeleton } from '../components/Feedback.js'
import { FilterChips } from '../components/FilterChips.js'
import { Icon } from '../components/Icon.js'
import { SearchBox } from '../components/SearchBox.js'

const ALL = 'all'
const LOADING_CARDS = [0, 1, 2, 3, 4, 5]

/** Case-insensitive haystack for one article card. */
function searchText(article) {
  const parts = [article.title, article.dek, article.tag, article.sectionLabel, article.id]
  if (Array.isArray(article.tags)) parts.push(article.tags.join(' '))
  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function Academy(props) {
  const t = props.t
  const onOpenArticle = props.onOpenArticle
  const { loading, data, error, reload } = useResource((signal) => getAcademy(signal), [])
  const [query, setQuery] = useState('')
  const [section, setSection] = useState(ALL)
  const rootRef = useRef(null)

  const articles = data && Array.isArray(data.articles) ? data.articles : []
  const sections = data && Array.isArray(data.sections) ? data.sections : []
  const activeSection = sections.some((item) => item.id === section) ? section : ALL

  // The page scrolls, not this view: a fresh Academy tab starts at the top.
  useEffect(() => {
    const node = rootRef.current
    const page = node && typeof node.closest === 'function' ? node.closest('.of-page') : null
    if (page) page.scrollTop = 0
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles.filter((article) => {
      if (activeSection !== ALL && article.section !== activeSection) return false
      return needle ? searchText(article).includes(needle) : true
    })
  }, [articles, activeSection, query])

  const isFiltered = query.trim() !== '' || activeSection !== ALL

  return h(
    'div',
    { className: 'of-academy of-fade-in', ref: rootRef },
    h(
      'div',
      { className: 'of-toolbar' },
      h(SearchBox, { value: query, onChange: setQuery, placeholder: t('academy.search') }),
    ),
    sections.length > 0
      ? h(FilterChips, {
          sections,
          active: activeSection,
          onSelect: setSection,
          label: t('academy.title'),
        })
      : null,
    loading
      ? h(
          'div',
          { className: 'of-cards', 'aria-busy': 'true', 'aria-label': t('a11y.loading') },
          LOADING_CARDS.map((index) => h(Skeleton, { key: index, height: 118, radius: 14 })),
        )
      : error
        ? h(ErrorState, {
            title: t('error.title'),
            body: error,
            retryLabel: t('retry'),
            onRetry: reload,
          })
        : filtered.length === 0
          ? h(EmptyState, {
              title: isFiltered ? t('academy.searchEmpty') : t('academy.empty'),
              icon: h(Icon, { name: 'search', size: 20 }),
            })
          : h(
              'div',
              { className: 'of-cards' },
              filtered.map((article, index) =>
                h(AcademyCard, {
                  key: article.id,
                  t,
                  article,
                  index,
                  onOpen: onOpenArticle,
                }),
              ),
            ),
  )
}
