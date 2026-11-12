// Optional dev probe: applies the Host half in a separate process, against the
// real public upstreams, and prints the timings the caching changes are meant
// to move (snapshot cold/warm, glossary, article, sector reopen).
//
// Not part of CI and not part of the plugin: it needs network access, and it is
// the only way to see real upstream behaviour without restarting the harness.
// If the public endpoints are unreachable from your network the market parts
// report FAIL; the hermetic proof lives in tests/host/plugin.test.mjs.
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const home = await mkdtemp(join(tmpdir(), 'openfin-probe-'))
process.env.DSH_HOME = home

const { apply } = await import('../index.js')

const routes = []
const disposers = []
const ctx = {
  effect(fn) {
    const d = fn()
    if (typeof d === 'function') disposers.push(d)
  },
  webServer: {
    register(options) {
      routes.push(options)
      return () => {}
    },
    getOrigin: () => 'http://127.0.0.1:1',
  },
  logger: { info() {}, warn() {} },
}
apply(ctx)

const resource = routes.find((r) => r.path === '/dsh-openfin').resource
const get = (path) => resource(new Request(`http://127.0.0.1:1/dsh-openfin${path}`))
const time = async (label, fn) => {
  const started = performance.now()
  const value = await fn()
  const ms = performance.now() - started
  console.log(`${label.padEnd(28)} ${ms.toFixed(1).padStart(8)} ms`)
  return value
}

try {
  const cold = await time('snapshot (cold)', async () => (await get('/api/snapshot')).json())
  console.log('  parts:', cold.parts.map((p) => `${p.id}:${p.ok ? 'ok' : 'FAIL'}/${p.ms}ms`).join(' '))
  console.log('  quotes', cold.quotes.length, '| boards', cold.boards.length, '| news', cold.news.length)
  const sparks = cold.quotes.filter((q) => Array.isArray(q.spark) && q.spark.length > 0).length
  console.log('  sparklines present:', sparks, '/', cold.quotes.length)

  await time('snapshot (warm)', async () => (await get('/api/snapshot')).json())

  const glossary = await time('glossary #1', async () => (await get('/api/glossary')).text())
  await time('glossary #2', async () => (await get('/api/glossary')).text())
  console.log('  glossary bytes:', glossary.length)

  const article = await time('article 2008 #1', async () => (await get('/api/academy/article?id=2008')).text())
  await time('article 2008 #2', async () => (await get('/api/academy/article?id=2008')).text())
  console.log('  article bytes:', article.length)

  const sector1 = await time('sector BK1295 #1', async () => (await get('/api/sector?code=BK1295')).text())
  await time('sector BK1295 #2', async () => (await get('/api/sector?code=BK1295')).text())
  console.log('  sector bytes:', sector1.length)
} finally {
  for (const dispose of disposers) {
    try {
      await dispose()
    } catch {
      /* ignore */
    }
  }
  await rm(home, { recursive: true, force: true })
  process.exit(0)
}
