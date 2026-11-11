/**
 * Instrument search / per-symbol quote tests for the floating HUD.
 * No network: `fetchJson` is injected and answers canned payloads.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createCache } from '../../lib/cache.js'
import {
  createInstruments,
  customSecid,
  normalizeInstrumentQuote,
  normalizeSearch,
  searchUrl,
  instrumentQuoteUrl,
} from '../../lib/instruments.js'

const SEARCH_PAYLOAD = {
  QuotationCodeTable: {
    Data: [
      {
        Code: '600519',
        Name: '贵州茅台',
        QuoteID: '1.600519',
        SecurityTypeName: '沪A',
        Classify: 'AStock',
      },
      {
        Code: '00700',
        Name: '腾讯控股',
        QuoteID: '116.00700',
        SecurityTypeName: '港股',
        Classify: 'HKStock',
      },
      {
        Code: 'AAPL',
        Name: '苹果',
        QuoteID: '105.AAPL',
        SecurityTypeName: '美股',
        Classify: 'USStock',
      },
      { Code: 'BAD', Name: 'no quote id' },
    ],
  },
}

const QUOTE_PAYLOAD = {
  rc: 0,
  data: { f43: 1404.8, f57: '600519', f58: '贵州茅台', f59: 2, f60: 1439, f169: -34.2, f170: -2.38 },
}

const TREND_PAYLOAD = {
  data: {
    trends: [
      '2026-11-11 09:30,1400.0',
      '2026-11-11 09:31,1402.0',
      '2026-11-11 09:32,1404.8',
    ],
  },
}

function fakeFetch(routes) {
  const calls = []
  const fetchJson = async (url) => {
    calls.push(url)
    for (const [pattern, payload] of routes) {
      if (url.includes(pattern)) {
        if (payload instanceof Error) throw payload
        return payload
      }
    }
    throw new Error('unexpected url ' + url)
  }
  return { fetchJson, calls }
}

const BUILTIN_QUOTES = [
  { id: 'sh000001', name: '上证指数', price: 3663.72, change: 2.93, pct: 0.08, digits: 2, spark: [1, 2, 3] },
  { id: 'sz399001', name: '深证成指', price: 11241.54, change: 96.05, pct: 0.86, digits: 2, spark: null },
  { id: 'btc', name: 'BTC', price: 73300, change: -2211, pct: -2.93, digits: 2, spark: null },
]

function makeInstruments(overrides = {}) {
  const cache = createCache({ now: () => Date.now() })
  const { fetchJson, calls } = fakeFetch([
    ['searchapi.eastmoney.com', SEARCH_PAYLOAD],
    ['stock/get', QUOTE_PAYLOAD],
    ['trends2', TREND_PAYLOAD],
  ])
  const instruments = createInstruments({
    cache,
    fetchJson,
    loadBuiltinQuotes: async () => BUILTIN_QUOTES,
    ...overrides,
  })
  return { instruments, calls }
}

describe('customSecid', () => {
  it('accepts eastmoney secids and rejects everything else', () => {
    assert.equal(customSecid('em:1.600519'), '1.600519')
    assert.equal(customSecid('em:116.00700'), '116.00700')
    assert.equal(customSecid('em:105.AAPL'), '105.AAPL')
    assert.equal(customSecid('sh000001'), null)
    assert.equal(customSecid('em:'), null)
    assert.equal(customSecid('em:1'), null)
    assert.equal(customSecid('em:1.600519;rm'), null)
    assert.equal(customSecid(null), null)
  })
})

describe('urls', () => {
  it('encodes the query and clamps the result count', () => {
    const url = searchUrl('贵州茅台', 50)
    assert.ok(url.includes(encodeURIComponent('贵州茅台')))
    assert.ok(url.includes('count=10'))
    assert.ok(url.includes('token=D43BF722C8E33BDC906FB84D85E326E8'))
    assert.ok(instrumentQuoteUrl('1.600519').includes('secid=1.600519'))
    assert.ok(instrumentQuoteUrl('1.600519').includes('fltt=2'))
  })
})

describe('normalizeSearch', () => {
  it('maps eastmoney rows to hud results', () => {
    const results = normalizeSearch(SEARCH_PAYLOAD, 8)
    assert.equal(results.length, 3)
    assert.deepEqual(results[0], {
      id: 'em:1.600519',
      secid: '1.600519',
      code: '600519',
      name: '贵州茅台',
      market: '沪A',
      kind: 'stock',
    })
    assert.equal(results[1].id, 'em:116.00700')
    assert.equal(results[2].market, '美股')
  })

  it('drops rows without a usable QuoteID and respects the limit', () => {
    assert.equal(normalizeSearch(SEARCH_PAYLOAD, 2).length, 2)
    const broken = { QuotationCodeTable: { Data: [{ Name: 'x' }, null] } }
    assert.deepEqual(normalizeSearch(broken, 8), [])
    assert.deepEqual(normalizeSearch(null, 8), [])
  })
})

describe('normalizeInstrumentQuote', () => {
  it('maps a stock/get payload to a hud quote', () => {
    const quote = normalizeInstrumentQuote(QUOTE_PAYLOAD, 'em:1.600519')
    assert.equal(quote.id, 'em:1.600519')
    assert.equal(quote.name, '贵州茅台')
    assert.equal(quote.price, 1404.8)
    assert.equal(quote.pct, -2.38)
    assert.equal(quote.digits, 2)
  })

  it('returns null for an unknown symbol', () => {
    assert.equal(normalizeInstrumentQuote({ data: null }, 'em:9.999999'), null)
    assert.equal(normalizeInstrumentQuote({}, 'em:9.999999'), null)
  })
})

describe('createInstruments.search', () => {
  it('returns an empty result without touching the upstream for a blank query', async () => {
    const { instruments, calls } = makeInstruments()
    assert.deepEqual(await instruments.search('   '), { query: '', results: [] })
    assert.equal(calls.length, 0)
  })

  it('searches once per query and caches the answer', async () => {
    const { instruments, calls } = makeInstruments()
    const first = await instruments.search('茅台')
    const second = await instruments.search('茅台')
    assert.equal(first.results.length, 3)
    assert.deepEqual(second, first)
    assert.equal(calls.filter((url) => url.includes('searchapi')).length, 1)
  })

  it('surfaces an upstream failure instead of inventing results', async () => {
    const { instruments } = makeInstruments({
      fetchJson: async () => {
        throw new Error('upstream down')
      },
    })
    await assert.rejects(() => instruments.search('茅台'), /upstream down/)
  })
})

describe('createInstruments.quotes', () => {
  it('resolves built-ins and customs in the requested order', async () => {
    const { instruments, calls } = makeInstruments()
    const result = await instruments.quotes(['em:1.600519', 'btc', 'sh000001', 'em:1.600519'])
    assert.equal(result.quotes.length, 3)
    assert.deepEqual(result.quotes.map((quote) => quote.id), ['em:1.600519', 'btc', 'sh000001'])
    assert.equal(result.quotes[0].spark.length, 3)
    // one stock/get + one trends2 + the built-in loader (no HTTP here)
    assert.equal(calls.filter((url) => url.includes('stock/get')).length, 1)
    assert.equal(calls.filter((url) => url.includes('trends2')).length, 1)
  })

  it('keeps working when one custom symbol is unavailable', async () => {
    const fetchJson = async (url) => {
      if (url.includes('stock/get') && url.includes('999999')) throw new Error('boom')
      if (url.includes('stock/get')) return QUOTE_PAYLOAD
      if (url.includes('trends2')) return TREND_PAYLOAD
      throw new Error('unexpected ' + url)
    }
    const cache = createCache()
    const instruments = createInstruments({ cache, fetchJson, loadBuiltinQuotes: async () => BUILTIN_QUOTES })
    const result = await instruments.quotes(['em:1.600519', 'em:9.999999'])
    assert.deepEqual(result.quotes.map((quote) => quote.id), ['em:1.600519'])
  })

  it('still answers customs when the built-in loader fails', async () => {
    const { instruments } = makeInstruments({
      loadBuiltinQuotes: async () => {
        throw new Error('snapshot down')
      },
    })
    const result = await instruments.quotes(['sh000001', 'em:1.600519'])
    assert.deepEqual(result.quotes.map((quote) => quote.id), ['em:1.600519'])
  })

  it('drops unknown ids, dedupes and caps at six symbols', async () => {
    const { instruments } = makeInstruments()
    const ids = ['nope', 'em:bad', 'em:1.600519', 'em:1.600519', 'sh000001', 'sz399001', 'btc', 'eth']
    const result = await instruments.quotes(ids)
    assert.deepEqual(result.quotes.map((quote) => quote.id), ['em:1.600519', 'sh000001', 'sz399001', 'btc'])
    assert.equal(typeof result.updatedAt, 'number')
    assert.equal(result.stale, false)
  })
})
