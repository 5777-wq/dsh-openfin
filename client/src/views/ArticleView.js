/**
 * ArticleView — the academy reader.
 *
 * Fetches one article by id, renders title/dek/meta, the key-points callout,
 * the markdown body (via ArticleBody) and related links. A glossary reference
 * in the body opens a compact term peek below the article, fetched lazily on
 * the first click so opening an article stays a single request.
 *
 * The page (`.of-page`) owns scrolling, so switching articles resets it to the
 * top; the content wrapper is keyed by id + phase to replay the theme's
 * fade-up on a change.
 */
import { createElement as h, useCallback, useEffect, useRef, useState } from 'react'
import { getArticle, getGlossary, useResource } from '../api.js'
import { ArticleBody } from '../components/ArticleBody.js'
import { DifficultyDots, Tag } from '../components/Chip.js'
import { EmptyState, ErrorState, Skeleton, SkeletonLines } from '../components/Feedback.js'
import { GlossaryRecord } from '../components/GlossaryCard.js'
import { Icon } from '../components/Icon.js'

function ArticleSkeleton(props) {
  return h(
    'div',
    { 'aria-busy': 'true', 'aria-label': props.t('a11y.loading') },
    h(Skeleton, { height: 26, width: '72%', radius: 8 }),
    h(Skeleton, { height: 13, width: '92%', style: { marginTop: 16 } }),
    h(Skeleton, { height: 13, width: '64%', style: { marginTop: 8 } }),
    h('div', { className: 'of-section' }, h(SkeletonLines, { lines: 7, gap: 11 })),
  )
}

/** Inline glossary reference target, rendered on demand under the article. */
function TermPeek(props) {
  const t = props.t
  const termId = props.termId
  const { loading, data, error, reload } = useResource((signal) => getGlossary(signal), [])
  const nodeRef = useRef(null)

  // The term panel lives below the body; pull it into view when the reader
  // clicks a reference (respecting reduced motion — a jump, not a glide).
  useEffect(() => {
    const node = nodeRef.current
    if (!node || typeof node.scrollIntoView !== 'function') return
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [termId])

  const terms = data && Array.isArray(data.terms) ? data.terms : []
  const term = terms.find((item) => item.id === termId) || null

  return h(
    'div',
    { className: 'of-section', ref: nodeRef, 'aria-live': 'polite' },
    h('div', { className: 'of-section-head' }, h('h2', { className: 'of-section-title' }, t('glossary.title'))),
    loading
      ? h('div', { className: 'of-gloss-cards' }, h(Skeleton, { height: 92, radius: 12 }))
      : error
        ? h(ErrorState, { title: t('error.title'), body: error, retryLabel: t('retry'), onRetry: reload })
        : term
          ? h('div', { className: 'of-daily' }, h(GlossaryRecord, { t, term }))
          : h(EmptyState, { title: t('glossary.empty') }),
  )
}

export function ArticleView(props) {
  const t = props.t
  const id = props.id
  const onBack = props.onBack
  const onOpenArticle = props.onOpenArticle
  const { data, error, reload } = useResource((signal) => getArticle(id, signal), [id])
  const [termId, setTermId] = useState(null)
  const rootRef = useRef(null)

  // Ignore a previous article's payload for the frame before the new fetch
  // starts; `data.id` is authoritative for what is on screen.
  const article = data && data.id === id ? data : null

  const onTerm = useCallback((nextId) => {
    setTermId((current) => (current === nextId ? null : nextId))
  }, [])

  useEffect(() => {
    const node = rootRef.current
    const page = node && typeof node.closest === 'function' ? node.closest('.of-page') : null
    if (page) page.scrollTop = 0
  }, [id])

  // A new article starts with no term peek open.
  useEffect(() => {
    setTermId(null)
  }, [id])

  const phase = article ? 'ready' : error ? 'error' : 'loading'
  const readMinutes = article ? Number(article.readMinutes) : 0
  const difficulty = article ? Number(article.difficulty) : 0
  const asOf = article ? article.dataAsOfActual || article.dataAsOf : null
  const points = article && Array.isArray(article.points) ? article.points : []
  const related = article && Array.isArray(article.related) ? article.related : []

  return h(
    'div',
    { className: 'of-article', ref: rootRef },
    h(
      'button',
      { type: 'button', className: 'of-article-back', onClick: onBack },
      h(Icon, { name: 'back', size: 13 }),
      h('span', null, t('academy.back')),
    ),
    h(
      'div',
      { key: id + ':' + phase, className: 'of-fade-in' },
      article
        ? h(
            'div',
            null,
            h('h1', { className: 'of-article-title' }, article.title || id),
            article.dek ? h('p', { className: 'of-article-dek' }, article.dek) : null,
            h(
              'div',
              { className: 'of-article-meta' },
              article.tag ? h(Tag, null, article.tag) : null,
              readMinutes > 0 ? h('span', { className: 'of-meta' }, t('academy.readMinutes', { n: readMinutes })) : null,
              difficulty > 0
                ? h(DifficultyDots, { value: difficulty, label: t('academy.difficulty', { n: difficulty }) })
                : null,
              asOf ? h('span', { className: 'of-meta' }, t('academy.dataAsOf', { date: asOf })) : null,
            ),
            points.length > 0
              ? h(
                  'div',
                  { className: 'of-section' },
                  h(
                    'div',
                    { className: 'of-section-head' },
                    h('h2', { className: 'of-section-title' }, t('academy.points')),
                  ),
                  h(
                    'div',
                    { className: 'of-points' },
                    points.map((point, index) => h('div', { key: index, className: 'of-point' }, point)),
                  ),
                )
              : null,
            h(ArticleBody, { body: article.body, onTerm }),
            termId ? h(TermPeek, { key: 'term-peek', t, termId }) : null,
            related.length > 0
              ? h(
                  'div',
                  { className: 'of-related' },
                  h(
                    'div',
                    { className: 'of-section-head' },
                    h('h2', { className: 'of-section-title' }, t('academy.related')),
                  ),
                  related.map((entry, index) => {
                    const item = typeof entry === 'string' ? { id: entry, title: entry } : entry || {}
                    // `kind: 'term'` related entries point at the glossary, not
                    // at an article id — open the inline term peek instead of
                    // requesting a nonexistent /academy/article?id=…
                    const isTerm = item.kind === 'term'
                    return h(
                      'button',
                      {
                        key: item.id || index,
                        type: 'button',
                        className: 'of-related-link',
                        onClick: () => {
                          if (isTerm) setTermId((current) => (current === item.id ? null : item.id))
                          else onOpenArticle(item.id)
                        },
                      },
                      item.title || item.id,
                    )
                  }),
                )
              : null,
          )
        : error
          ? h(ErrorState, { title: t('error.title'), body: error, retryLabel: t('retry'), onRetry: reload })
          : h(ArticleSkeleton, { t: t }),
    ),
  )
}
