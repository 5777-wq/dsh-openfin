import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  boardBreadth,
  boardMetaUrl,
  boardStocksUrl,
  buildBoardsPayload,
  createBoards,
  MAX_BOARDS,
  normalizeBoardList,
  normalizeBoardMeta,
  normalizeSectorStocks,
} from '../../lib/boards.js'
import { fixture, mockFetchJson, routedFetchJson } from './helpers.mjs'

const boardsFixture = await fixture('eastmoney/boards-industry.json')
const sectorBk1295 = await fixture('eastmoney/sector-BK1295.json')
const sectorBk1201 = await fixture('eastmoney/sector-BK1201.json')
const boardMeta = await fixture('eastmoney/board-meta-BK1295.json')

test('normalizeBoardList maps f2/f3/f12/f14/f20 and sorts by market cap desc', () => {
  const boards = normalizeBoardList(boardsFixture)
  assert.equal(boards.length, 20)
  assert.deepEqual(boards[0], {
    code: 'BK1201',
    name: '电子',
    pct: 3.29,
    price: 10958.81,
    marketCap: 18229601280000,
  })
  for (let index = 1; index < boards.length; index += 1) {
    assert.ok(boards[index - 1].marketCap >= boards[index].marketCap)
  }
})

test('normalizeBoardList skips rows without price/percent/name', () => {
  const boards = normalizeBoardList({
    data: {
      diff: [
        { f2: 10, f3: 1, f12: 'BK1', f14: 'ok', f20: 5 },
        { f2: '-', f3: 1, f12: 'BK2', f14: 'no price', f20: 4 },
        { f2: 10, f3: '-', f12: 'BK3', f14: 'no pct', f20: 3 },
        { f2: 10, f3: 1, f12: 'BK4', f14: '', f20: 2 },
      ],
    },
  })
  assert.deepEqual(
    boards.map((board) => board.code),
    ['BK1'],
  )
})

test('boardBreadth counts up/down/flat over the returned array', () => {
  const breadth = boardBreadth([{ pct: 1 }, { pct: -1 }, { pct: 0 }, { pct: 2.5 }, { pct: -0.1 }])
  assert.deepEqual(breadth, { up: 2, down: 2, flat: 1, total: 5 })
})

test('buildBoardsPayload caps the list at 96 boards and derives breadth from it', () => {
  const diff = []
  for (let index = 1; index <= 120; index += 1) {
    diff.push({
      f2: 10,
      f3: index % 3 === 0 ? 1 : index % 3 === 1 ? -1 : 0,
      f12: `BK${String(index).padStart(4, '0')}`,
      f14: `board ${index}`,
      f20: index,
    })
  }
  const payload = buildBoardsPayload({ data: { diff } })
  assert.equal(payload.boards.length, MAX_BOARDS)
  assert.equal(payload.boards[0].marketCap, 120)
  assert.deepEqual(payload.boardBreadth, { up: 32, down: 32, flat: 32, total: 96 })
})

test('normalizeSectorStocks sorts by turnover and takes the top 10', () => {
  const stocks = normalizeSectorStocks(sectorBk1201)
  assert.equal(stocks.length, 10)
  assert.deepEqual(stocks[0], {
    code: '002384',
    name: '东山精密',
    price: 83.69,
    pct: 2.7,
    amount: 10537458791.83,
  })
  for (let index = 1; index < stocks.length; index += 1) {
    assert.ok(stocks[index - 1].amount >= stocks[index].amount)
  }
})

test('normalizeSectorStocks handles a small real board', () => {
  const stocks = normalizeSectorStocks(sectorBk1295)
  assert.equal(stocks.length, 2)
  assert.equal(stocks[0].code, '301313')
})

test('normalizeBoardMeta decodes the integer-scaled price and percent', () => {
  assert.deepEqual(normalizeBoardMeta(boardMeta), {
    code: 'BK1295',
    name: '其他数字媒体',
    price: 1622.11,
    pct: 9.8,
  })
  assert.equal(normalizeBoardMeta({ data: null }), null)
})

test('board URL builders use the verified query shapes', () => {
  assert.equal(
    boardStocksUrl('BK1295'),
    'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=10&po=1&np=1&fltt=2&invt=2&fid=f6&fs=b:BK1295&fields=f2,f3,f6,f12,f14',
  )
  assert.equal(
    boardMetaUrl('BK1295'),
    'https://push2.eastmoney.com/api/qt/stock/get?secid=90.BK1295&fields=f43,f57,f58,f170',
  )
})

test('createBoards.load returns boards plus breadth', async () => {
  const fetchJson = routedFetchJson([['clist/get', boardsFixture]])
  const payload = await createBoards({ fetchJson }).load()
  assert.equal(payload.boards.length, 20)
  assert.equal(payload.boardBreadth.total, 20)
  assert.equal(payload.boardBreadth.up + payload.boardBreadth.down + payload.boardBreadth.flat, 20)
})

test('loadSector joins constituents with board metadata', async () => {
  const fetchJson = routedFetchJson([
    ['fs=b:BK1295', sectorBk1295],
    ['stock/get', boardMeta],
  ])
  const sector = await createBoards({ fetchJson }).loadSector('BK1295')
  assert.deepEqual(sector, {
    code: 'BK1295',
    name: '其他数字媒体',
    pct: 9.8,
    stocks: [
      { code: '301313', name: '凡拓数创', price: 76.49, pct: 9.63, amount: 2366087397.29 },
      { code: '603466', name: '风语筑', price: 15.33, pct: 9.97, amount: 1267469701 },
    ],
  })
})

test('loadSector returns null for an unknown board code', async () => {
  const fetchJson = routedFetchJson([
    ['clist/get', { rc: 0, data: null }],
    ['stock/get', { rc: 0, data: null }],
  ])
  assert.equal(await createBoards({ fetchJson }).loadSector('BK9999'), null)
})

test('loadSector falls back to the cached board list when stock/get fails', async () => {
  const fetchJson = routedFetchJson([
    ['fs=b:BK1295', sectorBk1295],
    ['stock/get', new Error('meta down')],
  ])
  const sector = await createBoards({ fetchJson }).loadSector('BK1295', {
    fallbackBoards: [{ code: 'BK1295', name: '其他数字媒体', pct: 9.8, price: 1622.11, marketCap: 1 }],
  })
  assert.equal(sector?.name, '其他数字媒体')
  assert.equal(sector?.pct, 9.8)
})

test('loadSector propagates a constituent failure so the route can answer 502', async () => {
  const fetchJson = mockFetchJson(() => {
    throw new Error('clist down')
  })
  await assert.rejects(createBoards({ fetchJson }).loadSector('BK1295'), /clist down/)
})
