// Consistency tests for the committed Academy content bundle (data/).
//
// These tests are offline: they only read the generated files that ship with
// the plugin. When the sibling MIT checkouts are present they also re-run the
// generator into a temp directory and assert the committed bytes are fresh and
// deterministic (extra assurance for maintainers; skipped elsewhere).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile, readdir, mkdtemp, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DATA = join(ROOT, 'data')
const ACADEMY_DEFAULT = resolve(ROOT, '..', 'openfin', 'openfin-academy')
const LENS_DEFAULT = resolve(ROOT, '..', 'openfin', 'openfinlens')

const SECTION_LABELS = {
  all: '全部',
  assets: '标的百科',
  concepts: '概念',
  crisis: '危机复盘',
  cycles: '周期',
  family: '家庭',
  reports: '报告',
}
const CATEGORY_LABELS = {
  data: '研报数据',
  fund: '基金与策略',
  asset: '资产类别',
  option: '期权与期权策略',
  macro: '宏观经济',
  basic: '基础概念',
  micro: '微观与行为',
  player: '机构与人物',
  risk: '风险与交易',
  tech: '技术指标',
}
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS)
const CARD_KEYS = [
  'id',
  'section',
  'sectionLabel',
  'title',
  'dek',
  'tag',
  'tags',
  'readMinutes',
  'difficulty',
  'dataAsOf',
  'dataAsOfActual',
]
const ARTICLE_KEYS = [...CARD_KEYS, 'points', 'body', 'related']
const TERM_KEYS = ['id', 'term', 'alias', 'one', 'metaphor', 'number', 'pit', 'cat']

async function listFiles(dir, prefix = '') {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...(await listFiles(join(dir, entry.name), rel)))
    else out.push(rel)
  }
  return out.sort()
}

const files = await listFiles(DATA)
const raw = new Map()
const data = new Map()
for (const rel of files) {
  const text = await readFile(join(DATA, rel), 'utf8')
  raw.set(rel, text)
  data.set(rel, JSON.parse(text))
}

const index = data.get('academy/index.json')
const glossary = data.get('glossary.json')
const sources = data.get('SOURCES.json')
const cardsById = new Map(index.articles.map((card) => [card.id, card]))
const articleFiles = files.filter((rel) => rel.startsWith('academy/articles/') && rel.endsWith('.json'))
const articleById = new Map(
  articleFiles.map((rel) => [rel.slice('academy/articles/'.length, -'.json'.length), data.get(rel)]),
)

/* ------------------------------------------------------------------ */
/* Generated file hygiene                                              */
/* ------------------------------------------------------------------ */

test('every committed data file is valid JSON and ends with a newline', () => {
  assert.ok(files.length >= 28, `expected the full bundle, found ${files.length} files`)
  for (const rel of files) {
    const text = raw.get(rel)
    assert.equal(text.at(-1), '\n', `${rel}: trailing newline`)
    assert.doesNotThrow(() => JSON.parse(text), `${rel}: valid JSON`)
  }
  // The specific bug class that shipped once: JS `undefined` inside JSON.
  for (const rel of files) assert.ok(!/: undefined\b/.test(raw.get(rel)), `${rel}: no undefined token`)
})

/* ------------------------------------------------------------------ */
/* /api/academy                                                        */
/* ------------------------------------------------------------------ */

test('data/academy/index.json: 25 unique, sorted article cards with stable key order', () => {
  assert.deepEqual(Object.keys(index), ['articles', 'sections'])
  assert.equal(index.articles.length, 25)
  assert.equal(articleFiles.length, 25, 'one article file per card')

  const ids = index.articles.map((card) => card.id)
  assert.equal(new Set(ids).size, ids.length, 'article ids unique')
  const sorted = [...ids].sort()
  assert.deepEqual(ids, sorted, 'article ids sorted')
  assert.deepEqual([...articleById.keys()].sort(), sorted, 'article files match index ids')

  for (const card of index.articles) {
    assert.deepEqual(Object.keys(card), CARD_KEYS, `${card.id}: card key order`)
    assert.equal(typeof card.id, 'string')
    assert.equal(typeof card.section, 'string')
    assert.equal(card.sectionLabel, SECTION_LABELS[card.section], `${card.id}: sectionLabel`)
    assert.ok(card.title.length > 0)
    assert.ok(card.dek.length > 0)
    assert.equal(typeof card.tag, 'string')
    assert.ok(Array.isArray(card.tags) && card.tags.every((tag) => typeof tag === 'string'))
    assert.ok(Number.isInteger(card.readMinutes) && card.readMinutes > 0)
    assert.ok(Number.isInteger(card.difficulty) && card.difficulty >= 1 && card.difficulty <= 5)
    assert.match(card.dataAsOf, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(card.dataAsOfActual === null || /^\d{4}-\d{2}-\d{2}$/.test(card.dataAsOfActual))
    // Card text is plain: inline markdown was flattened by the generator.
    for (const field of [card.title, card.dek, card.tag]) {
      assert.ok(!/\[[^\]]*\]\([^)]*\)/.test(field), `${card.id}: no markdown link in ${field}`)
      assert.ok(!field.includes('**') && !field.includes('[['), `${card.id}: no markdown markers in ${field}`)
    }
  }
})

test('data/academy/index.json: section entries and counts match the cards', () => {
  assert.deepEqual(Object.keys(index.sections[0]), ['id', 'label', 'count'])
  assert.equal(index.sections[0].id, 'all')
  assert.equal(index.sections[0].count, index.articles.length)
  assert.equal(index.sections.length, 7)

  const expected = [
    ['all', 25],
    ['assets', 13],
    ['concepts', 2],
    ['crisis', 7],
    ['cycles', 1],
    ['family', 1],
    ['reports', 1],
  ]
  assert.deepEqual(
    index.sections.map((section) => [section.id, section.count]),
    expected,
  )
  for (const section of index.sections) {
    assert.equal(section.label, SECTION_LABELS[section.id], `${section.id}: label`)
    if (section.id === 'all') continue
    const actual = index.articles.filter((card) => card.section === section.id).length
    assert.equal(section.count, actual, `${section.id}: count`)
  }
  const parts = index.sections.filter((section) => section.id !== 'all').reduce((sum, section) => sum + section.count, 0)
  assert.equal(parts, 25, 'sections partition the articles')
})

/* ------------------------------------------------------------------ */
/* /api/academy/article                                                */
/* ------------------------------------------------------------------ */

test('data/academy/articles/<id>.json: card + points + body + resolved related', () => {
  const glossaryIds = new Set(glossary.terms.map((term) => term.id))
  const relatedTotals = { article: 0, term: 0 }
  let termRefs = 0

  for (const card of index.articles) {
    const article = articleById.get(card.id)
    assert.ok(article, `${card.id}: article file exists`)
    assert.deepEqual(Object.keys(article), ARTICLE_KEYS, `${card.id}: key order`)
    for (const key of CARD_KEYS) assert.deepEqual(article[key], card[key], `${card.id}: ${key} matches index`)

    assert.ok(Array.isArray(article.points) && article.points.length >= 1, `${card.id}: points`)
    for (const point of article.points) {
      assert.equal(typeof point, 'string')
      assert.ok(point.trim().length > 0)
      assert.ok(!point.includes('**') && !point.includes('[['), `${card.id}: points are plain text`)
    }

    assert.equal(typeof article.body, 'string')
    assert.ok(article.body.length > 200, `${card.id}: body length ${article.body.length}`)
    assert.ok(!article.body.includes('\r'), `${card.id}: body normalized to LF`)
    assert.ok(article.body.includes('## '), `${card.id}: body has h2 headings`)
    assert.ok(article.body === article.body.replace(/\s+$/, ''), `${card.id}: no trailing whitespace`)

    assert.ok(Array.isArray(article.related), `${card.id}: related array`)
    const relatedIds = new Set()
    for (const related of article.related) {
      assert.deepEqual(Object.keys(related), ['id', 'title', 'kind'], `${card.id}: related key order`)
      assert.ok(!relatedIds.has(related.id), `${card.id}: related id ${related.id} unique`)
      relatedIds.add(related.id)
      assert.ok(related.title.length > 0)
      if (related.kind === 'article') {
        relatedTotals.article++
        assert.ok(cardsById.has(related.id), `${card.id}: related article ${related.id} resolves`)
        assert.equal(related.title, cardsById.get(related.id).title, `${card.id}: related article title`)
      } else if (related.kind === 'term') {
        relatedTotals.term++
        assert.ok(glossaryIds.has(related.id), `${card.id}: related term ${related.id} resolves`)
        assert.equal(related.title, glossary.terms.find((term) => term.id === related.id).term)
      } else {
        assert.fail(`${card.id}: related kind ${related.kind}`)
      }
    }

    const refs = article.body.match(/\[\[([^\]|]+)\|([^\]]+)\]\]/g) || []
    termRefs += refs.length
    for (const ref of refs) {
      const id = ref.slice(2, ref.indexOf('|'))
      assert.ok(glossaryIds.has(id), `${card.id}: body term ref ${id} resolves`)
    }
  }

  assert.deepEqual(relatedTotals, { article: 30, term: 61 })
  assert.equal(termRefs, 46, 'body glossary refs')
})

/* ------------------------------------------------------------------ */
/* /api/glossary                                                       */
/* ------------------------------------------------------------------ */

test('data/glossary.json: daily is null, 293 sorted full terms, ten categories', () => {
  assert.deepEqual(Object.keys(glossary), ['daily', 'terms', 'categories'])
  assert.equal(glossary.daily, null, 'daily rotation happens host-side')
  assert.equal(glossary.terms.length, 293)

  const ids = glossary.terms.map((term) => term.id)
  assert.equal(new Set(ids).size, ids.length, 'term ids unique')
  const categoryIds = new Set(glossary.categories.map((category) => category.id))

  for (let i = 0; i < glossary.terms.length; i++) {
    const term = glossary.terms[i]
    assert.deepEqual(Object.keys(term), TERM_KEYS, `${term.id}: key order`)
    for (const key of TERM_KEYS) assert.equal(typeof term[key], 'string', `${term.id}: ${key} is a string`)
    for (const key of ['id', 'term', 'alias', 'one', 'metaphor', 'number', 'pit', 'cat']) {
      assert.ok(term[key].length > 0, `${term.id}: ${key} non-empty`)
    }
    assert.ok(categoryIds.has(term.cat), `${term.id}: category ${term.cat} declared`)
    if (i > 0) {
      const previous = glossary.terms[i - 1]
      const order = previous.term.localeCompare(term.term, 'zh')
      assert.ok(order <= 0, `${term.id}: terms sorted (${previous.term} <= ${term.term})`)
      if (order === 0) assert.ok(previous.id <= term.id, 'id tie-break')
    }
  }

  assert.deepEqual(
    glossary.categories.map((category) => category.id),
    CATEGORY_ORDER,
    'all ten upstream categories, source order',
  )
  for (const category of glossary.categories) {
    assert.deepEqual(Object.keys(category), ['id', 'label'])
    assert.equal(category.label, CATEGORY_LABELS[category.id])
    const count = glossary.terms.filter((term) => term.cat === category.id).length
    assert.ok(count > 0, `${category.id}: has terms`)
  }
})

test('data/glossary.json: full file < 260 KiB, slim API payload < 150 KiB', async () => {
  const bytes = (await stat(join(DATA, 'glossary.json'))).size
  assert.ok(bytes < 260 * 1024, `glossary file ${bytes} B < 260 KiB`)

  // The host serves full records, but the search-card projection the SPEC's
  // ~150 KB bound describes still fits comfortably.
  const slim = {
    daily: null,
    terms: glossary.terms.map(({ id, term, alias, one, cat }) => ({ id, term, alias, one, cat })),
    categories: glossary.categories,
  }
  const slimBytes = Buffer.byteLength(JSON.stringify(slim))
  assert.ok(slimBytes < 150 * 1024, `slim glossary payload ${slimBytes} B < 150 KiB`)
})

/* ------------------------------------------------------------------ */
/* data/SOURCES.json (provenance)                                      */
/* ------------------------------------------------------------------ */

test('data/SOURCES.json: MIT provenance for both upstream repos and accurate counts', () => {
  assert.deepEqual(Object.keys(sources), ['generatedAt', 'generator', 'upstream', 'counts'])
  assert.equal(sources.generator, 'scripts/sync-academy.mjs')
  assert.match(sources.generatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  assert.ok(!Number.isNaN(new Date(sources.generatedAt).getTime()))

  assert.equal(sources.upstream.length, 2)
  assert.deepEqual(
    sources.upstream.map((upstream) => upstream.repo),
    ['5777-wq/openfin-academy', '5777-wq/openfinlens'],
  )
  assert.deepEqual(
    sources.upstream.map((upstream) => upstream.license),
    ['MIT', 'MIT'],
  )
  for (const upstream of sources.upstream) {
    assert.deepEqual(Object.keys(upstream), [
      'repo',
      'url',
      'commit',
      'license',
      'licenseUrl',
      'copyright',
      'source',
    ])
    assert.match(upstream.commit, /^[0-9a-f]{40}$/, `${upstream.repo}: commit sha`)
    assert.match(upstream.url, /^https:\/\/github\.com\//)
    assert.ok(upstream.licenseUrl.includes(upstream.commit), 'license pointer pinned to the commit')
    assert.match(upstream.copyright, /^Copyright \(c\) \d{4}/)
    assert.ok(['local-checkout', 'github-raw'].includes(upstream.source))
  }

  assert.deepEqual(Object.keys(sources.counts), [
    'articles',
    'sections',
    'articleBodyChars',
    'relatedArticleRefs',
    'relatedTermRefs',
    'glossaryTerms',
    'glossaryCategories',
  ])
  assert.equal(sources.counts.articles, index.articles.length)
  assert.equal(sources.counts.sections, index.sections.length - 1)
  assert.equal(
    sources.counts.articleBodyChars,
    index.articles.reduce((sum, card) => sum + articleById.get(card.id).body.length, 0),
  )
  assert.equal(
    sources.counts.relatedArticleRefs,
    index.articles.reduce(
      (sum, card) => sum + articleById.get(card.id).related.filter((related) => related.kind === 'article').length,
      0,
    ),
  )
  assert.equal(
    sources.counts.relatedTermRefs,
    index.articles.reduce(
      (sum, card) => sum + articleById.get(card.id).related.filter((related) => related.kind === 'term').length,
      0,
    ),
  )
  assert.equal(sources.counts.glossaryTerms, glossary.terms.length)
  assert.equal(sources.counts.glossaryCategories, glossary.categories.length)

  // When the local checkouts carry git metadata, provenance must match them.
  const academyGit = join(ACADEMY_DEFAULT, '.git')
  const lensGit = join(LENS_DEFAULT, '.git')
  if (existsSync(academyGit) && existsSync(lensGit)) {
    const head = (dir) => execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    assert.equal(sources.upstream[0].commit, head(ACADEMY_DEFAULT))
    assert.equal(sources.upstream[1].commit, head(LENS_DEFAULT))
  } else {
    // Without sibling checkouts the pinned commits still have to look real.
    assert.match(sources.upstream[0].commit, /^[0-9a-f]{40}$/)
  }
})

/* ------------------------------------------------------------------ */
/* Determinism / freshness (only when the sibling checkouts exist)     */
/* ------------------------------------------------------------------ */

const canRegenerate =
  existsSync(join(ACADEMY_DEFAULT, 'data', 'content', 'index.json')) && existsSync(join(LENS_DEFAULT, 'LICENSE'))

test(
  'sync-academy.mjs regenerates byte-identical committed output',
  { skip: canRegenerate ? false : 'sibling MIT checkouts not available in this environment' },
  async () => {
    const out = await mkdtemp(join(tmpdir(), 'dsh-openfin-sync-'))
    try {
      execFileSync(process.execPath, [join(ROOT, 'scripts', 'sync-academy.mjs'), '--out', out], {
        cwd: ROOT,
        stdio: 'pipe',
        timeout: 120000,
      })
      const regenerated = await listFiles(out)
      assert.deepEqual(regenerated, files, 'same file tree')
      for (const rel of files) {
        const bytes = await readFile(join(out, rel), 'utf8')
        assert.equal(bytes, raw.get(rel), `${rel}: committed output is fresh and deterministic`)
      }
    } finally {
      await rm(out, { recursive: true, force: true })
    }
  },
)
