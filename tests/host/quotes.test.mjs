import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createQuotes,
  downsample,
  normalizeBinanceKlines,
  normalizeBinanceTickers,
  normalizeCoingecko,
  normalizeOkxTickers,
  normalizeQuoteList,
  normalizeTrend,
  QUOTE_DEFS,
  SPARK_LIMIT,
} from '../../lib/quotes.js'
import { createCache } from '../../lib/cache.js'
import { fixture, routedFetchJson } from './helpers.mjs'

const ulist = await fixture('eastmoney/quotes-ulist.json')
const trend = await fixture('eastmoney/trend-sh000001.json')
const binanceTickers = await fixture('crypto/binance-tickers.json')
const binanceKlines = await fixture('crypto/binance-klines-btc.json')
const okxBtc = await fixture('crypto/okx-btc.json')
const okxEth = await fixture('crypto/okx-eth.json')
const coingecko = await fixture('crypto/coingecko-simple.json')

test('normalizeQuoteList follows the fixed index order and digits', () => {
  const quotes = normalizeQuoteList(ulist)
  assert.deepEqual(
    quotes.map((quote) => quote.id),
    ['sh000001', 'sz399001', 'sz399006', 'hkHSI', 'usIXIC', 'usSPX', 'usDJIA', 'hfGC', 'fxUDI'],
  )
  assert.deepEqual(quotes[0], {
    id: 'sh000001',
    name: '上证指数',
    price: 3663.72,
    change: 2.93,
    pct: 0.08,
    digits: 2,
    kind: 'index',
  })
  // f1=1 for COMEX gold → one decimal on the card.
  assert.equal(quotes.find((quote) => quote.id === 'hfGC')?.digits, 1)
})

test('normalizeQuoteList drops entries the upstream omitted', () => {
  const filtered = {
    ...ulist,
    data: { ...ulist.data, diff: ulist.data.diff.filter((item) => item.f12 !== 'HSI') },
  }
  const quotes = normalizeQuoteList(filtered)
  assert.equal(quotes.length, 8)
  assert.equal(quotes.some((quote) => quote.id === 'hkHSI'), false)
})

test('normalizeTrend parses trends2 rows and downsamples to 48 points', () => {
  const spark = normalizeTrend(trend)
  assert.equal(spark?.length, SPARK_LIMIT)
  assert.equal(spark?.[0], 3682.04)
  assert.equal(spark?.[spark.length - 1], 3663.72)
})

test('normalizeTrend returns null for empty or malformed payloads', () => {
  assert.equal(normalizeTrend({ data: { trends: [] } }), null)
  assert.equal(normalizeTrend({ data: null }), null)
  assert.equal(normalizeTrend({ data: { trends: [null, 'nope', '2026-11-10 09:30,-'] } }), null)
})

test('downsample keeps the first and last point and is a no-op below the limit', () => {
  assert.deepEqual(downsample([1, 2, 3], 48), [1, 2, 3])
  const series = Array.from({ length: 100 }, (_, index) => index)
  const reduced = downsample(series, 48)
  assert.equal(reduced.length, 48)
  assert.equal(reduced[0], 0)
  assert.equal(reduced[47], 99)
})

test('normalizeBinanceTickers maps both crypto symbols', () => {
  const quotes = normalizeBinanceTickers(binanceTickers)
  assert.deepEqual(
    quotes.map((quote) => quote.id),
    ['btc', 'eth'],
  )
  assert.equal(quotes[0].kind, 'crypto')
  assert.equal(quotes[0].price, 73255.3)
  assert.equal(quotes[0].pct, -2.24)
  assert.equal(quotes[1].price, 2023.9)
})

test('normalizeOkxTickers derives change from the 24h open', () => {
  const quotes = normalizeOkxTickers([okxBtc, okxEth])
  assert.equal(quotes[0].id, 'btc')
  assert.equal(quotes[0].price, 73259)
  assert.equal(quotes[0].change, -1660.7)
  assert.equal(quotes[0].pct, -2.22)
  assert.equal(quotes[1].price, 2021.7)
})

test('normalizeCoingecko maps prices and the 24h percentage', () => {
  const quotes = normalizeCoingecko(coingecko)
  assert.equal(quotes[0].id, 'btc')
  assert.equal(quotes[0].price, 73225)
  assert.equal(quotes[0].pct, -2.34)
  assert.equal(quotes[1].price, 2027.61)
})

test('normalizeBinanceKlines takes closes', () => {
  const closes = normalizeBinanceKlines(binanceKlines)
  assert.equal(closes?.length, 8)
  assert.equal(closes?.[0], 74706.02)
  assert.equal(normalizeBinanceKlines([]), null)
})

test('createQuotes.load returns all 11 quotes in SPEC order with sparks', async () => {
  const fetchJson = routedFetchJson([
    ['ulist.np/get', ulist],
    ['binance.com/api/v3/ticker/24hr', binanceTickers],
    ['binance.com/api/v3/klines', binanceKlines],
    ['trends2/get', trend],
  ])
  const quotes = createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100 }).load()
  const list = await quotes

  assert.deepEqual(
    list.map((quote) => quote.id),
    QUOTE_DEFS.map((def) => def.id),
  )
  for (const quote of list.slice(0, 9)) {
    assert.equal(quote.kind, 'index')
    assert.equal(quote.spark?.length, SPARK_LIMIT)
  }
  for (const quote of list.slice(9)) {
    assert.equal(quote.kind, 'crypto')
    assert.equal(quote.spark?.length, 8)
  }
  assert.equal(list[0].spark[0], 3682.04)
  // The 4 s per-request timeout is passed to every upstream fetch.
  assert.equal(fetchJson.calls[0].options.timeoutMs, 4000)
  assert.match(fetchJson.calls[0].url, /fltt=2&secids=1\.000001/)
})

test('a failed sparkline becomes null without failing the quotes part', async () => {
  const fetchJson = routedFetchJson([
    ['ulist.np/get', ulist],
    ['binance.com/api/v3/ticker/24hr', binanceTickers],
    ['binance.com/api/v3/klines', binanceKlines],
    ['trends2/get', new Error('trend down')],
  ])
  const list = await createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100 }).load()
  assert.equal(list.length, 11)
  assert.equal(list[0].spark, null)
  assert.equal(list[9].spark?.length, 8)
})

test('crypto falls back to OKX when Binance fails', async () => {
  const fetchJson = routedFetchJson([
    ['ulist.np/get', ulist],
    ['binance.com/api/v3/ticker/24hr', new Error('binance blocked')],
    ['binance.com/api/v3/klines', binanceKlines],
    ['okx.com/api/v5/market/ticker?instId=BTC-USDT', okxBtc],
    ['okx.com/api/v5/market/ticker?instId=ETH-USDT', okxEth],
    ['trends2/get', trend],
  ])
  const list = await createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100 }).load()
  const crypto = list.filter((quote) => quote.kind === 'crypto')
  assert.deepEqual(
    crypto.map((quote) => quote.id),
    ['btc', 'eth'],
  )
  assert.equal(crypto[0].price, 73259)
})

test('crypto falls back to CoinGecko when Binance and OKX fail', async () => {
  const fetchJson = routedFetchJson([
    ['ulist.np/get', ulist],
    ['binance.com/api/v3/ticker/24hr', new Error('binance blocked')],
    ['binance.com/api/v3/klines', new Error('binance blocked')],
    ['okx.com/api/v5/market/ticker', new Error('okx blocked')],
    ['coingecko.com/api/v3/simple/price', coingecko],
    ['trends2/get', trend],
  ])
  const list = await createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100 }).load()
  assert.equal(list.filter((quote) => quote.kind === 'crypto').length, 2)
  assert.equal(list.find((quote) => quote.id === 'btc')?.price, 73225)
})

test('the quotes part still succeeds with only indices when all crypto sources fail', async () => {
  const fetchJson = routedFetchJson([
    ['ulist.np/get', ulist],
    ['binance.com', new Error('binance blocked')],
    ['okx.com', new Error('okx blocked')],
    ['coingecko.com', new Error('gecko blocked')],
    ['trends2/get', trend],
  ])
  const list = await createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100 }).load()
  assert.equal(list.length, 9)
  assert.equal(list.some((quote) => quote.kind === 'crypto'), false)
})

test('the quotes part fails only when the index list itself fails', async () => {
  const fetchJson = routedFetchJson([
    ['ulist.np/get', new Error('ulist down')],
    ['binance.com/api/v3/ticker/24hr', binanceTickers],
    ['binance.com/api/v3/klines', binanceKlines],
    ['trends2/get', trend],
  ])
  await assert.rejects(createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100 }).load(), /ulist down/)
})

test('a crypto chain that never answers does not hold the index cards', async () => {
  const never = new Promise(() => {})
  const fetchJson = (url) => {
    if (url.includes('ulist.np/get')) return Promise.resolve(ulist)
    if (url.includes('trends2/get')) return Promise.resolve(trend)
    // Every crypto source hangs, as a blackholed exchange edge does.
    return never
  }
  const started = Date.now()
  const list = await createQuotes({ fetchJson, cache: createCache(), sparkWaitMs: 100, cryptoWaitMs: 40 }).load()
  const elapsed = Date.now() - started

  assert.equal(list.filter((quote) => quote.kind === 'index').length, 9)
  assert.equal(list.some((quote) => quote.kind === 'crypto'), false)
  assert.ok(elapsed < 1_000, `index cards waited ${elapsed}ms for crypto`)
})
