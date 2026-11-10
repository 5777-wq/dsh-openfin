import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createMovers, MOVERS_LIMIT, moversUrl, normalizeMovers } from '../../lib/movers.js'
import { fixture, routedFetchJson } from './helpers.mjs'

const gainers = await fixture('eastmoney/movers-gainers.json')
const losers = await fixture('eastmoney/movers-losers.json')
const active = await fixture('eastmoney/movers-active.json')

test('moversUrl uses the verified fid/po combos', () => {
  assert.match(moversUrl('up'), /fid=f3&fs=m:0\+t:6,m:0\+t:80,m:1\+t:2,m:1\+t:23/)
  assert.match(moversUrl('up'), /po=1/)
  assert.match(moversUrl('down'), /po=0/)
  assert.match(moversUrl('active'), /fid=f6/)
  assert.match(moversUrl('active'), /po=1/)
  for (const bucket of ['up', 'down', 'active']) {
    assert.match(moversUrl(bucket), new RegExp(`pz=${MOVERS_LIMIT}`))
  }
})

test('normalizeMovers maps f12/f14/f2/f3 and leaves amount out by default', () => {
  const up = normalizeMovers(gainers)
  assert.equal(up.length, 8)
  assert.deepEqual(up[0], { code: '688827', name: 'N钶锐', price: 129.2, pct: 184.77 })
  assert.equal('amount' in up[0], false)
})

test('normalizeMovers includes turnover only for the active bucket', () => {
  const rows = normalizeMovers(active, { withAmount: true })
  assert.equal(rows[0].code, '300308')
  assert.equal(rows[0].amount, 18564294195.63)
  assert.equal('amount' in normalizeMovers(gainers)[0], false)
})

test('normalizeMovers caps the list and tolerates missing rows', () => {
  const many = {
    data: {
      diff: Array.from({ length: 20 }, (_, index) => ({
        f2: 1 + index,
        f3: index,
        f6: 100 - index,
        f12: `00000${index}`,
        f14: `stock ${index}`,
      })),
    },
  }
  assert.equal(normalizeMovers(many).length, MOVERS_LIMIT)
  assert.deepEqual(normalizeMovers({ data: { diff: null } }), [])
  assert.deepEqual(normalizeMovers({}), [])
})

test('createMovers.load fetches all three buckets in parallel', async () => {
  const fetchJson = routedFetchJson([
    ['fid=f3&fs=', (url) => (url.includes('po=1') ? gainers : losers)],
    ['fid=f6&fs=', active],
  ])
  const movers = await createMovers({ fetchJson }).load()
  assert.equal(movers.up.length, 8)
  assert.equal(movers.down.length, 8)
  assert.equal(movers.active.length, 8)
  assert.equal(movers.active[0].amount, 18564294195.63)
  assert.equal(fetchJson.calls.length, 3)
})

test('createMovers.load rejects when one bucket fails (all-or-nothing part)', async () => {
  const fetchJson = routedFetchJson([
    ['fid=f3&fs=', (url) => {
      if (url.includes('po=0')) throw new Error('losers down')
      return gainers
    }],
    ['fid=f6&fs=', active],
  ])
  await assert.rejects(createMovers({ fetchJson }).load(), /losers down/)
})
