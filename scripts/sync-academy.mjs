#!/usr/bin/env node
/**
 * dsh-openfin — Academy content pipeline.
 *
 * Regenerates the committed content bundle under data/ from the MIT-licensed
 * OpenFin Academy checkout (and OpenFinLens, for provenance):
 *
 *   data/academy/index.json              -> GET /dsh-openfin/api/academy
 *   data/academy/articles/<id>.json      -> GET /dsh-openfin/api/academy/article?id=
 *   data/glossary.json                   -> GET /dsh-openfin/api/glossary source
 *   data/SOURCES.json                    -> provenance / MIT license pointers
 *
 * Usage:
 *   node scripts/sync-academy.mjs [options]
 *
 *   --academy <dir>       OpenFin Academy checkout (default: ../openfin/openfin-academy)
 *   --openfinlens <dir>   OpenFinLens checkout (default: ../openfin/openfinlens)
 *   --out <dir>           Output directory (default: <repo>/data)
 *   --ref <git-ref>       Branch/tag used for the GitHub raw fallback (default: main)
 *   --local-only          Never touch the network; fail if a local checkout is missing
 *   --help                Show this help
 *
 * Local checkouts are the default source. When the Academy checkout is absent
 * (or its data/content/index.json is missing) the script falls back to GitHub
 * raw for 5777-wq/openfin-academy; the OpenFinLens checkout is only read for
 * provenance, so a missing one is also filled from GitHub raw.
 *
 * The output is deterministic: same inputs => same bytes. `generatedAt` is the
 * source commit timestamp (or the newest content date when git metadata is
 * unavailable), never the wall clock. Article and glossary ids are sorted, JSON
 * key order is fixed, and stale article files are removed.
 */
import { readFile, writeFile, mkdir, rm, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_ACADEMY = resolve(ROOT, '..', 'openfin', 'openfin-academy')
const DEFAULT_LENS = resolve(ROOT, '..', 'openfin', 'openfinlens')
const UA = 'dsh-openfin/0.1 (+https://github.com/5777-wq/dsh-openfin)'

const REPO = {
  academy: '5777-wq/openfin-academy',
  lens: '5777-wq/openfinlens',
}
const SITE = { academy: 'https://github.com/5777-wq/openfin-academy', lens: 'https://github.com/5777-wq/openfinlens' }

/** Section ids in display order (all first), with the labels from SPEC.md. */
const SECTION_ORDER = ['all', 'assets', 'concepts', 'crisis', 'cycles', 'family', 'reports']
const SECTION_LABELS = {
  all: '全部',
  assets: '标的百科',
  concepts: '概念',
  crisis: '危机复盘',
  cycles: '周期',
  family: '家庭',
  reports: '报告',
}

/**
 * Glossary category labels, in the source site's display order
 * (openfin-academy/js/views/term.js). The `cat` field uses these ten ids.
 */
const CATEGORY_ORDER = ['data', 'fund', 'asset', 'option', 'macro', 'basic', 'micro', 'player', 'risk', 'tech']
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

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const opts = {
    academy: DEFAULT_ACADEMY,
    openfinlens: DEFAULT_LENS,
    out: resolve(ROOT, 'data'),
    ref: 'main',
    localOnly: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => {
      const v = argv[++i]
      if (!v || v.startsWith('--')) throw new Error(`${arg} needs a value`)
      return v
    }
    switch (arg) {
      case '--academy':
        opts.academy = resolve(next())
        break
      case '--openfinlens':
        opts.openfinlens = resolve(next())
        break
      case '--out':
        opts.out = resolve(next())
        break
      case '--ref':
        opts.ref = next()
        break
      case '--local-only':
        opts.localOnly = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        throw new Error(`unknown argument: ${arg} (try --help)`)
    }
  }
  return opts
}

function printHelp() {
  console.log(`dsh-openfin Academy content pipeline

  node scripts/sync-academy.mjs [options]

  --academy <dir>       OpenFin Academy checkout (default: ../openfin/openfin-academy)
  --openfinlens <dir>   OpenFinLens checkout (default: ../openfin/openfinlens)
  --out <dir>           Output directory (default: <repo>/data)
  --ref <git-ref>       Branch/tag for the GitHub raw fallback (default: main)
  --local-only          Never touch the network
  -h, --help            Show this help`)
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Deterministic code-unit id ordering (no locale/ICU dependence). */
function byId(a, b) {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/** Deterministic Chinese term ordering with an id tie-break. */
function byTerm(a, b) {
  return a.term.localeCompare(b.term, 'zh') || byId(a, b)
}

/** Flatten inline markdown to plain text for card fields (titles/points). */
function plainText(value) {
  return String(value == null ? '' : value)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r\n?/g, '\n')
    .trim()
}

function normalizeBody(body) {
  return String(body == null ? '' : body).replace(/\r\n?/g, '\n').replace(/\s+$/, '')
}

function prettyJson(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

/**
 * data/glossary.json is the one large generated file (~244 KB): pretty-printing
 * every record would blow the < 260 KiB budget, so records are compact and one
 * per line. The result is still ordinary, parseable JSON.
 */
function serializeGlossary(glossary) {
  if (glossary.daily !== null) throw new Error('glossary.daily must be null on disk (rotated at request time)')
  const lines = ['{', '  "daily": null,', '  "terms": [']
  glossary.terms.forEach((term, i) => {
    lines.push(`    ${JSON.stringify(term)}${i === glossary.terms.length - 1 ? '' : ','}`)
  })
  lines.push('  ],', '  "categories": [')
  glossary.categories.forEach((category, i) => {
    lines.push(`    ${JSON.stringify(category)}${i === glossary.categories.length - 1 ? '' : ','}`)
  })
  lines.push('  ]', '}')
  return lines.join('\n') + '\n'
}

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function readText(path) {
  return readFile(path, 'utf8')
}

async function fileSize(path) {
  return (await stat(path)).size
}

function git(dir, args) {
  try {
    return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

function licenseCopyright(licenseText) {
  const line = (licenseText || '').split(/\r?\n/).find((l) => /^copyright\b/i.test(l.trim()))
  return line ? line.trim() : ''
}

function upstreamEntry(repo, site, { mode, commit, licenseText, ref }) {
  const commitPart = commit || ref
  return {
    repo,
    url: site,
    commit,
    license: 'MIT',
    licenseUrl: `https://github.com/${repo}/blob/${commitPart}/LICENSE`,
    copyright: licenseCopyright(licenseText),
    source: mode === 'local' ? 'local-checkout' : 'github-raw',
  }
}

/* ------------------------------------------------------------------ */
/* Source loaders                                                      */
/* ------------------------------------------------------------------ */

function localAcademyReady(dir) {
  return existsSync(join(dir, 'data', 'content', 'index.json'))
}

function localLensReady(dir) {
  return existsSync(join(dir, 'LICENSE'))
}

async function loadLocalAcademy(dir) {
  const contentDir = join(dir, 'data', 'content')
  const index = await readJson(join(contentDir, 'index.json'))
  if (!index || !Array.isArray(index.items)) throw new Error(`${join(contentDir, 'index.json')}: missing "items" array`)

  const articles = new Map()
  for (const item of index.items) {
    if (!item || typeof item.id !== 'string' || !item.id) throw new Error(`index.json: article without id`)
    const file = join(contentDir, `${item.id}.json`)
    if (!existsSync(file)) throw new Error(`article file missing for id "${item.id}": ${file}`)
    articles.set(item.id, { ...(await readJson(file)), id: item.id })
  }

  const glossary = await readJson(join(contentDir, 'glossary.json'))
  const licenseText = await readText(join(dir, 'LICENSE'))
  return {
    mode: 'local',
    index,
    articles,
    glossary,
    licenseText,
    commit: git(dir, ['rev-parse', 'HEAD']),
    commitDate: git(dir, ['show', '-s', '--format=%cI', 'HEAD']),
  }
}

async function loadLocalLens(dir) {
  const licenseText = await readText(join(dir, 'LICENSE'))
  return {
    mode: 'local',
    licenseText,
    commit: git(dir, ['rev-parse', 'HEAD']),
    commitDate: git(dir, ['show', '-s', '--format=%cI', 'HEAD']),
  }
}

async function fetchText(url, { attempts = 2 } = {}) {
  let lastError = null
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/plain, application/json' } })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return await res.text()
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(`GET ${url}: ${lastError && lastError.message}`)
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url))
}

async function githubCommit(repo, ref) {
  try {
    const body = JSON.parse(
      await fetchText(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref)}`, {
        attempts: 1,
      }),
    )
    const sha = body && body.sha ? String(body.sha) : null
    const date = body && body.commit && (body.commit.committer || {}).date ? String(body.commit.committer.date) : null
    return { sha, date }
  } catch {
    return { sha: null, date: null }
  }
}

async function loadRemoteAcademy(repo, ref) {
  const raw = (path) => `https://raw.githubusercontent.com/${repo}/${ref}/${path}`
  const index = JSON.parse(await fetchText(raw('data/content/index.json')))
  if (!index || !Array.isArray(index.items)) throw new Error('GitHub raw index.json: missing "items" array')
  const articles = new Map()
  for (const item of index.items) {
    if (!item || typeof item.id !== 'string' || !item.id) throw new Error('GitHub raw index.json: article without id')
    articles.set(item.id, { ...(await fetchJson(raw(`data/content/${item.id}.json`))), id: item.id })
  }
  const glossary = JSON.parse(await fetchText(raw('data/content/glossary.json')))
  const licenseText = await fetchText(raw('LICENSE'))
  const head = await githubCommit(repo, ref)
  return { mode: 'remote', index, articles, glossary, licenseText, commit: head.sha, commitDate: head.date }
}

async function loadRemoteLens(repo, ref) {
  const raw = (path) => `https://raw.githubusercontent.com/${repo}/${ref}/${path}`
  const licenseText = await fetchText(raw('LICENSE'))
  const head = await githubCommit(repo, ref)
  return { mode: 'remote', licenseText, commit: head.sha, commitDate: head.date }
}

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

function buildCards(academy) {
  return academy.index.items
    .map((item) => {
      const article = academy.articles.get(item.id)
      const section = item.section || article.section || ''
      return {
        id: item.id,
        section,
        sectionLabel: SECTION_LABELS[section] || section,
        title: plainText(item.title != null ? item.title : article.title),
        dek: plainText(item.dek != null ? item.dek : article.dek),
        tag: plainText(item.tag != null ? item.tag : article.tag),
        tags: Array.isArray(item.tags) ? item.tags.map((t) => plainText(t)) : [],
        readMinutes: Number(item.readMinutes != null ? item.readMinutes : article.readMinutes) || 0,
        difficulty: Number(item.difficulty != null ? item.difficulty : article.difficulty) || 0,
        dataAsOf: item.dataAsOf != null ? item.dataAsOf : article.dataAsOf != null ? article.dataAsOf : null,
        dataAsOfActual:
          item.dataAsOfActual != null
            ? item.dataAsOfActual
            : article.dataAsOfActual != null
              ? article.dataAsOfActual
              : null,
      }
    })
    .sort(byId)
}

function buildSections(cards) {
  const counts = new Map()
  for (const card of cards) counts.set(card.section, (counts.get(card.section) || 0) + 1)
  const sections = [{ id: 'all', label: SECTION_LABELS.all, count: cards.length }]
  for (const id of SECTION_ORDER) {
    if (id === 'all') continue
    const count = counts.get(id) || 0
    if (count > 0) sections.push({ id, label: SECTION_LABELS[id] || id, count })
  }
  // Any unexpected section from a future upstream refresh still shows up.
  const known = new Set(SECTION_ORDER)
  for (const [id, count] of [...counts.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
    if (known.has(id)) continue
    sections.push({ id, label: SECTION_LABELS[id] || id, count })
  }
  return sections
}

/** Resolve upstream `related` ids (article ids and glossary term ids mixed). */
function buildRelated(article, articleCards, glossaryById) {
  const articleById = new Map(articleCards.map((card) => [card.id, card]))
  const related = []
  const counts = { article: 0, term: 0 }
  for (const rawId of Array.isArray(article.related) ? article.related : []) {
    const id = String(rawId)
    const card = articleById.get(id)
    if (card) {
      related.push({ id, title: card.title, kind: 'article' })
      counts.article++
      continue
    }
    const term = glossaryById.get(id)
    if (term) {
      related.push({ id, title: term.term, kind: 'term' })
      counts.term++
    }
  }
  return { related, counts }
}

function buildArticle(card, article, articleCards, glossaryById) {
  const { related, counts } = buildRelated(article, articleCards, glossaryById)
  return {
    value: {
      ...card,
      points: (Array.isArray(article.points) ? article.points : []).map((p) => plainText(p)),
      body: normalizeBody(article.body),
      related,
    },
    counts,
  }
}

function buildGlossary(academy) {
  const sourceTerms = academy.glossary && academy.glossary.terms ? academy.glossary.terms : null
  if (!sourceTerms) throw new Error('glossary.json: missing "terms"')
  const entries = Array.isArray(sourceTerms) ? sourceTerms.map((t) => [String(t.id || ''), t]) : Object.entries(sourceTerms)

  const terms = entries
    .filter(([id, term]) => {
      if (!id) throw new Error('glossary.json: term without id')
      if (!term || typeof term !== 'object') throw new Error(`glossary.json: bad record for "${id}"`)
      return true
    })
    .map(([id, term]) => ({
      id,
      term: plainText(term.term != null ? term.term : id),
      alias: term.alias == null ? '' : String(term.alias),
      one: term.one == null ? '' : String(term.one),
      metaphor: term.metaphor == null ? '' : String(term.metaphor),
      number: term.number == null ? '' : String(term.number),
      pit: term.pit == null ? '' : String(term.pit),
      cat: term.cat == null ? '' : String(term.cat),
    }))
    .sort(byTerm)

  const present = new Set(terms.map((term) => term.cat))
  const categories = CATEGORY_ORDER.filter((id) => present.has(id)).map((id) => ({
    id,
    label: CATEGORY_LABELS[id] || id,
  }))
  for (const cat of [...present].sort()) {
    if (!CATEGORY_ORDER.includes(cat)) categories.push({ id: cat, label: cat })
  }
  if (categories.length === 0) throw new Error('glossary.json: no categories derived from "cat"')

  const byIdMap = new Map(terms.map((term) => [term.id, term]))
  // `daily` is intentionally null on disk: the host rotates one record by local
  // date from the same full `terms` list at request time.
  return { daily: null, terms, categories, byId: byIdMap }
}

function generatedAtOf(academy) {
  if (academy.commitDate) {
    const date = new Date(academy.commitDate)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  // No git metadata (or a plain copy of the sources): newest content date is
  // still deterministic for the same inputs.
  const dates = academy.index.items.map((item) => String(item.updatedAt || item.dataAsOf || '')).filter(Boolean)
  dates.sort()
  const newest = dates.length ? dates[dates.length - 1] : ''
  return newest ? `${newest}T00:00:00.000Z` : '1970-01-01T00:00:00.000Z'
}

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

async function writeOutputs(opts, { cards, sections, articlesById, glossary, sources }) {
  const academyDir = join(opts.out, 'academy')
  const articlesDir = join(academyDir, 'articles')
  await mkdir(articlesDir, { recursive: true })

  const written = []
  const write = async (path, text) => {
    await writeFile(path, text)
    written.push({ path, bytes: Buffer.byteLength(text) })
  }

  await write(join(academyDir, 'index.json'), prettyJson({ articles: cards, sections }))
  for (const card of cards) {
    await write(join(articlesDir, `${card.id}.json`), prettyJson(articlesById.get(card.id).value))
  }
  await write(join(opts.out, 'glossary.json'), serializeGlossary(glossary))
  await write(join(opts.out, 'SOURCES.json'), prettyJson(sources))

  // Deterministic tree: remove article files that are no longer in the index.
  const expected = new Set(cards.map((card) => `${card.id}.json`))
  for (const name of await readdir(articlesDir)) {
    if (!expected.has(name)) await rm(join(articlesDir, name), { force: true })
  }

  return written
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const started = Date.now()

  let academy
  if (localAcademyReady(opts.academy)) {
    academy = await loadLocalAcademy(opts.academy)
  } else if (opts.localOnly) {
    throw new Error(`no local OpenFin Academy checkout at ${opts.academy} (data/content/index.json missing)`)
  } else {
    console.log(`local Academy checkout not found at ${opts.academy} — falling back to GitHub raw (${REPO.academy}@${opts.ref})`)
    academy = await loadRemoteAcademy(REPO.academy, opts.ref)
  }

  let lens
  if (localLensReady(opts.openfinlens)) {
    lens = await loadLocalLens(opts.openfinlens)
  } else if (opts.localOnly) {
    lens = { mode: 'local', licenseText: '', commit: null, commitDate: null }
  } else {
    console.log(`local OpenFinLens checkout not found at ${opts.openfinlens} — falling back to GitHub raw (${REPO.lens}@${opts.ref})`)
    lens = await loadRemoteLens(REPO.lens, opts.ref)
  }

  const cards = buildCards(academy)
  const sections = buildSections(cards)
  const glossary = buildGlossary(academy)

  // Glossary resolution must happen after the glossary is built; related refs
  // point at glossary terms as well as articles.
  const articlesById = new Map()
  const relatedCounts = { article: 0, term: 0 }
  for (const card of cards) {
    const article = academy.articles.get(card.id)
    if (!article) throw new Error(`article "${card.id}" is listed in index.json but has no data/content/<id>.json`)
    if (normalizeBody(article.body).length < 1) throw new Error(`article "${card.id}" has an empty body`)
    const { value, counts } = buildArticle(card, article, cards, glossary.byId)
    articlesById.set(card.id, { value })
    relatedCounts.article += counts.article
    relatedCounts.term += counts.term
  }

  const sources = {
    generatedAt: generatedAtOf(academy),
    generator: 'scripts/sync-academy.mjs',
    upstream: [
      upstreamEntry(REPO.academy, SITE.academy, academy),
      upstreamEntry(REPO.lens, SITE.lens, lens),
    ],
    counts: {
      articles: cards.length,
      sections: sections.filter((s) => s.id !== 'all').length,
      articleBodyChars: cards.reduce((sum, card) => sum + articlesById.get(card.id).value.body.length, 0),
      relatedArticleRefs: relatedCounts.article,
      relatedTermRefs: relatedCounts.term,
      glossaryTerms: glossary.terms.length,
      glossaryCategories: glossary.categories.length,
    },
  }

  const written = await writeOutputs(opts, { cards, sections, articlesById, glossary, sources })
  const total = written.reduce((sum, file) => sum + file.bytes, 0)

  console.log('')
  console.log('dsh-openfin content pipeline')
  console.log(`  source      ${academy.mode === 'local' ? 'local checkout' : 'GitHub raw'} · ${REPO.academy}${academy.commit ? ` @ ${academy.commit.slice(0, 12)}` : ''}`)
  console.log(`  articles    ${cards.length} (${sections.filter((s) => s.id !== 'all').length} sections, ${sources.counts.articleBodyChars} body chars)`)
  console.log(`  related     ${relatedCounts.article} article refs + ${relatedCounts.term} glossary refs resolved`)
  console.log(`  glossary    ${glossary.terms.length} terms · ${glossary.categories.length} categories`)
  console.log(`  output      ${written.length} files, ${fmtBytes(total)} in ${opts.out}`)
  for (const file of written) {
    if (file.path.endsWith('glossary.json') || file.path.endsWith('index.json') || file.path.endsWith('SOURCES.json')) {
      console.log(`                ${fmtBytes(file.bytes).padStart(8)}  ${file.path.replace(opts.out + (process.platform === 'win32' ? '\\' : '/'), '')}`)
    }
  }
  console.log(`  generatedAt ${sources.generatedAt}`)
  console.log(`  done in ${Date.now() - started} ms`)
}

main().catch((error) => {
  console.error(`sync-academy: ${error && error.message ? error.message : error}`)
  process.exitCode = 1
})
