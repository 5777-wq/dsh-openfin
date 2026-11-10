/**
 * dsh-openfin — Host half.
 *
 * Registers exactly one prefix route on the harness Web server:
 *   { kind: 'prefix', path: '/dsh-openfin', resource }
 * The path must NOT carry a trailing slash: the Web server matches
 * `pathname === prefix || pathname.startsWith(prefix + '/')`, so a trailing
 * slash would never match `/dsh-openfin/api/...` requests.
 *
 * Everything reachable from here imports `node:*` builtins only. The plugin is
 * installed as a linked local directory in some profiles, so `@deepseek-ai/*`
 * packages would not resolve from this module graph; the Web server service is
 * reached through `ctx` instead.
 *
 * Data flow: `lib/routes.js` answers the five public endpoints; market data is
 * fetched by the loader modules and assembled by `lib/snapshot.js`; academy
 * data is read from the committed `data/` directory by `lib/academy.js`.
 */
import { createCache } from './lib/cache.js'
import { createQuotes } from './lib/quotes.js'
import { createBoards } from './lib/boards.js'
import { createMovers } from './lib/movers.js'
import { createNews } from './lib/news.js'
import { createAcademy } from './lib/academy.js'
import { buildSnapshot } from './lib/snapshot.js'
import { createRouter, ROUTE_PREFIX } from './lib/routes.js'

export const name = 'dsh-openfin'

export const inject = ['webServer']

/**
 * @param {{ effect: Function, webServer: { register: Function } }} ctx
 */
export function apply(ctx) {
  // One cache instance shared by the snapshot parts and the sector route, so
  // opening a sector reuses the board list the dashboard just loaded.
  const cache = createCache()
  const quotes = createQuotes({ cache })
  const boards = createBoards()
  const movers = createMovers()
  const news = createNews()
  const academy = createAcademy()

  const snapshot = () =>
    buildSnapshot({
      parts: {
        quotes: { load: quotes.load },
        boards: { load: boards.load },
        movers: { load: movers.load },
        news: { load: news.load },
      },
      cache,
    })

  const route = createRouter({
    snapshot,
    loadSector: boards.loadSector,
    academy,
    // The sector drawer's board name/percent normally comes from stock/get;
    // this cached heatmap is the fallback when that call fails.
    cachedBoards: () => cache.peek('part:boards')?.value?.boards,
  })

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        resource: (request) => route(request),
      }),
    'dsh-openfin: routes',
  )
}
