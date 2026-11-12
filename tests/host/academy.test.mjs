import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import {
  AcademyUnavailableError,
  buildGlossaryPayload,
  collectTermRecords,
  createAcademy,
  dailyIndexFor,
  hashString,
  localDateKey,
  MAX_GLOSSARY_BYTES,
  TERM_FIELDS,
} from '../../lib/academy.js'
import { FIXTURES } from './helpers.mjs'

// `lib/academy.js` expects a plugin data root containing `academy/` and
// `glossary.json`; tests/fixtures is a miniature copy of that layout.
const DATA_DIR = FIXTURES
// Local-time constructor: the daily rotation must be local-date based.
const DAY = new Date(2026, 10, 11, 9, 0, 0).getTime()

test('getIndex serves the articles + sections payload verbatim', async () => {
  const academy = createAcademy({ dataDir: DATA_DIR, now: () => DAY })
  const index = await academy.getIndex()
  assert.equal(index.articles.length, 2)
  assert.deepEqual(
    index.articles.map((article) => article.id).sort(),
    ['2008', 'gold'],
  )
  assert.deepEqual(index.sections[0], { id: 'all', label: '全部', count: 2 })
  // Cards keep the fields the client needs, and nothing content-only leaks in.
  for (const article of index.articles) {
    for (const field of ['id', 'section', 'sectionLabel', 'title', 'dek', 'tag', 'tags', 'readMinutes', 'difficulty', 'dataAsOf', 'dataAsOfActual']) {
      assert.ok(field in article, `missing ${field}`)
    }
  }
})

test('getArticle returns the full article and null for unknown ids', async () => {
  const academy = createAcademy({ dataDir: DATA_DIR, now: () => DAY })
  const article = await academy.getArticle('2008')
  assert.equal(article?.id, '2008')
  assert.ok(article.body.length > 200)
  assert.equal(Array.isArray(article.points), true)
  assert.equal(Array.isArray(article.related), true)

  assert.equal(await academy.getArticle('does-not-exist'), null)
  assert.equal(await academy.getArticle('../package'), null)
  assert.equal(await academy.getArticle(''), null)
})

test('getGlossary returns full, sorted term records with a rotating daily entry', async () => {
  const academy = createAcademy({ dataDir: DATA_DIR, now: () => DAY })
  const glossary = await academy.getGlossary()

  assert.ok(glossary.terms.length >= 5, `expected several fixture terms, got ${glossary.terms.length}`)
  assert.deepEqual(Object.keys(glossary.terms[0]), TERM_FIELDS)
  assert.equal(glossary.categories.length > 0, true)

  // Sorted by term with localeCompare('zh') — deterministic for a given ICU.
  const sorted = [...glossary.terms].sort((a, b) => a.term.localeCompare(b.term, 'zh'))
  assert.deepEqual(
    glossary.terms.map((term) => term.id),
    sorted.map((term) => term.id),
  )

  // Full records only: the upstream-only fields are stripped.
  for (const term of glossary.terms) {
    for (const stripped of ['source', 'sym', 'lens', 'name', 'kw', 'links']) {
      assert.equal(stripped in term, false)
    }
    assert.deepEqual(Object.keys(term), TERM_FIELDS)
  }

  // daily is the same full record as one of the terms.
  assert.deepEqual(glossary.daily, glossary.terms[dailyIndexFor(DAY, glossary.terms.length)])
  assert.equal(Buffer.byteLength(JSON.stringify(glossary), 'utf8') < MAX_GLOSSARY_BYTES, true)
})

test('the daily term is stable within one local date and rotates across dates', async () => {
  const first = createAcademy({ dataDir: DATA_DIR, now: () => DAY })
  const second = createAcademy({ dataDir: DATA_DIR, now: () => DAY + 60 * 60 * 1000 })
  assert.equal((await first.getGlossary()).daily.id, (await second.getGlossary()).daily.id)

  const count = (await first.getGlossary()).terms.length
  const tomorrow = new Date(2026, 10, 12, 9, 0, 0).getTime()
  let rotatedDay = tomorrow
  for (let offset = 0; offset < 14; offset += 1) {
    rotatedDay = new Date(2026, 10, 12 + offset, 9, 0, 0).getTime()
    if (dailyIndexFor(rotatedDay, count) !== dailyIndexFor(DAY, count)) break
  }
  assert.notEqual(dailyIndexFor(rotatedDay, count), dailyIndexFor(DAY, count))
  assert.equal(localDateKey(rotatedDay).length, 10)
})

test('hashString/dailyIndexFor are deterministic edge cases', () => {
  assert.equal(hashString('2026-11-11'), hashString('2026-11-11'))
  assert.equal(Number.isInteger(hashString('2026-11-11')), true)
  assert.equal(dailyIndexFor(DAY, 0), -1)
  assert.equal(dailyIndexFor(DAY, 7) >= 0, true)
})

test('collectTermRecords merges a slim terms list with a full record pool', () => {
  const merged = collectTermRecords({
    terms: [{ id: 'a-share', term: 'A股', alias: '大A', one: 'one', cat: 'asset' }],
    records: [{ id: 'a-share', term: 'A股', metaphor: 'm', number: 'n', pit: 'p', cat: 'asset' }],
  })
  assert.equal(merged.length, 1)
  assert.equal(merged[0].metaphor, 'm')
  assert.equal(merged[0].number, 'n')
  assert.equal(merged[0].pit, 'p')
})

test('collectTermRecords accepts the upstream object-keyed glossary shape', () => {
  const merged = collectTermRecords({
    terms: {
      'a-share': { term: 'A股', one: 'one', metaphor: 'm', number: 'n', pit: 'p', cat: 'asset' },
    },
  })
  assert.equal(merged[0].id, 'a-share')
  assert.equal(merged[0].metaphor, 'm')
})

test('buildGlossaryPayload degrades to slim cards if the payload would exceed the cap', async () => {
  const raw = await (await import('./helpers.mjs')).fixture('glossary.json')
  const payload = buildGlossaryPayload(raw, { now: DAY, maxBytes: 100 })
  assert.equal(payload.terms[0].metaphor, undefined)
  // The daily record is always full, so the daily card still has its detail.
  assert.equal(typeof payload.daily.metaphor, 'string')
})

test('missing data files raise AcademyUnavailableError (route → 503)', async () => {
  const academy = createAcademy({ dataDir: join(DATA_DIR, 'not-generated'), now: () => DAY })
  await assert.rejects(academy.getIndex(), AcademyUnavailableError)
  await assert.rejects(academy.getGlossary(), AcademyUnavailableError)
  await assert.rejects(academy.getArticle('2008'), AcademyUnavailableError)
})

test('lazy loaders recover once the data files appear', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-openfin-academy-'))
  try {
    const academy = createAcademy({ dataDir: dir, now: () => DAY })
    await assert.rejects(academy.getIndex(), AcademyUnavailableError)

    await mkdir(join(dir, 'academy'), { recursive: true })
    await writeFile(
      join(dir, 'academy', 'index.json'),
      JSON.stringify({ articles: [], sections: [{ id: 'all', label: '全部', count: 0 }] }),
    )
    const index = await academy.getIndex()
    assert.deepEqual(index.articles, [])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('malformed JSON raises AcademyUnavailableError', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-openfin-academy-'))
  try {
    await mkdir(join(dir, 'academy'), { recursive: true })
    await writeFile(join(dir, 'academy', 'index.json'), '{ not json')
    const academy = createAcademy({ dataDir: dir, now: () => DAY })
    await assert.rejects(academy.getIndex(), AcademyUnavailableError)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('an invalid glossary file raises AcademyUnavailableError, not a partial payload', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-openfin-academy-'))
  try {
    await mkdir(join(dir, 'academy'), { recursive: true })
    await writeFile(join(dir, 'academy', 'index.json'), JSON.stringify({ articles: [], sections: [] }))
    // Regression: the content pipeline once wrote `"daily": undefined` (not JSON).
    await writeFile(join(dir, 'glossary.json'), '{ "daily": undefined, "terms": [] }')
    const academy = createAcademy({ dataDir: dir, now: () => DAY })
    await assert.rejects(academy.getGlossary(), AcademyUnavailableError)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('getArticle reuses the parsed article and re-reads it after a change', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-openfin-article-'))
  try {
    await mkdir(join(dir, 'academy', 'articles'), { recursive: true })
    await writeFile(
      join(dir, 'academy', 'index.json'),
      JSON.stringify({ articles: [{ id: 'a1' }], sections: [{ id: 'all', label: 'all', count: 1 }] }),
    )
    await writeFile(join(dir, 'glossary.json'), JSON.stringify({ terms: [], categories: [] }))
    await writeFile(join(dir, 'academy', 'articles', 'a1.json'), JSON.stringify({ id: 'a1', body: 'v1' }))

    const academy = createAcademy({ dataDir: dir, now: () => DAY })
    const first = await academy.getArticle('a1')
    assert.equal(await academy.getArticle('a1'), first, 'a second open must not reparse the file')

    // A size change is a deterministic change signal (mtime is coarse on Windows).
    await writeFile(join(dir, 'academy', 'articles', 'a1.json'), JSON.stringify({ id: 'a1', body: 'v2-longer' }))
    const second = await academy.getArticle('a1')
    assert.equal(second.body, 'v2-longer')
    assert.notEqual(second, first)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('getGlossaryJson returns the bytes of the same payload, once', async () => {
  const academy = createAcademy({ dataDir: DATA_DIR, now: () => DAY })
  const payload = await academy.getGlossary()
  const text = await academy.getGlossaryJson()

  assert.equal(text, JSON.stringify(payload))
  // The memoized record is reused, not rebuilt per request.
  assert.equal(await academy.getGlossaryJson(), text)
  assert.equal(await academy.getGlossary(), payload)
})
