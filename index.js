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
 *
 * The floating HUD adds one exact route (`/dsh-openfin/api/hud`) owned by
 * `lib/hud.js`; it starts and stops a separate Electron helper process and is
 * the only part of this plugin that spawns anything.
 */
import { createCache } from './lib/cache.js'
import { createQuotes } from './lib/quotes.js'
import { createBoards } from './lib/boards.js'
import { createMovers } from './lib/movers.js'
import { createNews } from './lib/news.js'
import { createAcademy } from './lib/academy.js'
import { buildSnapshot } from './lib/snapshot.js'
import { createRouter, ROUTE_PREFIX } from './lib/routes.js'
import { createHud } from './lib/hud.js'
import { createInstruments } from './lib/instruments.js'

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

  // Floating HUD: the desktop helper is opt-in, but a profile that already has
  // it enabled restores the window on boot.
  const instruments = createInstruments({ cache, loadBuiltinQuotes: quotes.load })
  const hud = createHud({
    instruments,
    origin: () => {
      try {
        return ctx.webServer.getOrigin ? ctx.webServer.getOrigin() : ''
      } catch {
        return ''
      }
    },
    logger: ctx.logger,
  })
  ctx.effect(() => () => hud.dispose(), 'dsh-openfin: hud lifecycle')
  ctx.effect(
    () =>
      ctx.webServer.register({
        // Prefix, not exact: the HUD also owns `/api/hud/search` and
        // `/api/hud/quotes`. A `handler` route, not a `resource`, because
        // turning the desktop window on/off is a POST and resources only
        // receive GET/HEAD.
        kind: 'prefix',
        path: `${ROUTE_PREFIX}/api/hud`,
        handler: (request, response) => hud.handleNode(request, response),
      }),
    'dsh-openfin: hud route',
  )
  if (hud.config.desktop && hud.status().available) {
    ctx.effect(
      () => {
        hud.start()
        return () => {}
      },
      'dsh-openfin: hud restore',
    )
  }
}
