import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createNews,
  DERIVED_TITLE_MAX,
  MAX_NEWS,
  NEWS_URL,
  normalizeNewsItem,
  normalizeNewsList,
  titleFromSummary,
} from '../../lib/news.js'
import { fixture, routedFetchJson } from './helpers.mjs'

const newsFixture = await fixture('eastmoney/news-column.json')

test('NEWS_URL keeps the req_trace parameter the endpoint requires', () => {
  assert.match(NEWS_URL, /req_trace=1/)
  assert.match(NEWS_URL, /column=344/)
  assert.match(NEWS_URL, /page_size=8/)
})

test('titleFromSummary takes the first sentence and ellipsizes at 46 chars', () => {
  assert.equal(titleFromSummary('短句。后面还有更多内容'), '短句')
  assert.equal(titleFromSummary('第一句！第二句？'), '第一句')
  assert.equal(titleFromSummary(''), '')
  assert.equal(titleFromSummary(undefined), '')

  const long = `${'这是一个没有句号的长摘要'.repeat(8)}`
  const derived = titleFromSummary(long)
  assert.equal(derived.length, DERIVED_TITLE_MAX)
  assert.ok(derived.endsWith('…'))
})

test('normalizeNewsList sorts newest first and upgrades links to https', () => {
  const items = normalizeNewsList(newsFixture)
  assert.equal(items.length, 4)
  assert.deepEqual(
    items.map((item) => item.time),
    ['2026-11-11 00:13:28', '2026-11-10 21:30:16', '2026-11-10 17:00:28', '2026-11-10 16:15:08'],
  )
  for (const item of items) {
    assert.match(item.url, /^https:\/\/finance\.eastmoney\.com\/a\//)
    assert.ok(item.id.length > 0)
    assert.ok(item.title.length > 0)
  }
})

test('normalizeNewsItem derives a title when the upstream has none', () => {
  const raw = structuredClone(newsFixture.data.list[0])
  delete raw.title
  const item = normalizeNewsItem(raw)
  assert.equal(item?.id, raw.code)
  assert.equal(item?.title, titleFromSummary(raw.summary))
  assert.ok(item.title.length <= DERIVED_TITLE_MAX)
})

test('normalizeNewsItem drops items with no id or no usable text', () => {
  assert.equal(normalizeNewsItem({ title: 'no id', summary: 'x' }), null)
  assert.equal(normalizeNewsItem({ code: '1', title: '', summary: '' }), null)
})

test('normalizeNewsList caps the feed at 8 items', () => {
  const list = Array.from({ length: 12 }, (_, index) => ({
    code: `id-${index}`,
    title: `title ${index}`,
    showTime: `2026-11-10 ${String(index).padStart(2, '0')}:00:00`,
    uniqueUrl: `http://finance.eastmoney.com/a/${index}.html`,
  }))
  const items = normalizeNewsList({ data: { list } })
  assert.equal(items.length, MAX_NEWS)
  assert.equal(items[0].id, 'id-11')
})

test('createNews.load returns the normalized feed', async () => {
  const fetchJson = routedFetchJson([['np-listapi', newsFixture]])
  const items = await createNews({ fetchJson }).load()
  assert.equal(items.length, 4)
  assert.equal(fetchJson.calls[0].url, NEWS_URL)
  assert.equal(fetchJson.calls[0].options.timeoutMs, 4000)
})
