# dsh-openfin — build spec (v0.1.0)

Native DeepSeek Harness plugin: one sidebar page that combines the **OpenFinLens**
market dashboard (A-share + global indices, sector heatmap, movers, news) with the
**OpenFin Academy** plain-language finance library (25 articles, 293 glossary terms).

The contract this plugin was built against. It documents the wire formats, the
module split and the invariants that keep the two halves compatible.

## Hard constraints

- Everything in the plugin's **Client half** must bundle into one file
  `client/client.js` (the Web shell loads it through `window.__ModuleLoader__.load`).
  Only `react` may be `require`d from the host module table. No imports of
  `@deepseek-ai/*` packages from the client half — the bundle is plain JS.
- The **Host half** may import `node:*` builtins only (no `@deepseek-ai/*`).
  Its routes are registered on `ctx.webServer`; this keeps `dsh plugin add` and a
  linked local install both working without peer dependencies.
- No build step is required at install time: committed `client/client.js` is the
  artifact. Source builds use `npm run build` (esbuild, devDependency).
- UI text goes through the locale dictionaries (`t('key')`). Article/glossary
  content itself stays Chinese (it is the source material); UI labels are bilingual.
- Theme: only `--dsw-alias-*` tokens plus the plugin's own `--of-*` variables.
  No literal colors for chrome. Artwork may carry brand color.

## Data contracts (Host routes)

All routes are same-origin `GET`, JSON, `cache-control: no-store` for live data,
`cache-control: public, max-age=300` for academy data. Errors answer
`{ error: string }` with a 5xx status; the client degrades, never throws.

Route prefix is `path: '/dsh-openfin'` (no trailing slash — the webserver matches
`pathname === prefix || pathname.startsWith(prefix + '/')`).

### `GET /dsh-openfin/api/snapshot`

One aggregate request for the dashboard. Internally fetches upstreams in parallel
with per-part independence and a short cache (default 30 s; `refreshMs` is what the
client should use). `stale: true` means at least one part came from an expired cache.

```jsonc
{
  "updatedAt": 1794327581205,      // ms epoch of assembly
  "refreshMs": 30000,
  "stale": false,
  "parts": [
    { "id": "quotes", "ok": true, "ms": 210 },
    { "id": "boards", "ok": true, "ms": 180 },
    { "id": "movers", "ok": false, "ms": 3000, "error": "timeout" }
  ],
  "quotes": [
    { "id": "sh000001", "name": "上证指数", "price": 3663.72, "change": 2.93, "pct": 0.08,
      "digits": 2, "kind": "index", "spark": [3660.1, 3665.4, 3663.7] }
  ],
  "boards": [
    { "code": "BK1295", "name": "其他数字媒体", "pct": 9.8, "price": 1622.11, "marketCap": 16946255000 }
  ],
  "boardBreadth": { "up": 63, "down": 21, "flat": 4, "total": 88 },
  "movers": {
    "up":   [{ "code": "300264", "name": "佳创视讯", "price": 6.58, "pct": 20.07 }],
    "down": [{ "code": "600519", "name": "贵州茅台", "price": 1200.0, "pct": -3.2 }],
    "active": [{ "code": "600030", "name": "中信证券", "price": 28.1, "pct": 1.2, "amount": 8123456789 }]
  },
  "news": [
    { "id": "202611103927362337", "title": "李强签署国务院令…", "time": "2026-11-10 17:00:28",
      "url": "https://finance.eastmoney.com/a/202611103927362337.html" }
  ]
}
```

Rules:
- `quotes` always returns the same 11 entries in this order when upstream succeeds:
  `sh000001 上证指数`, `sz399001 深证成指`, `sz399006 创业板指`, `hkHSI 恒生指数`,
  `usIXIC 纳斯达克`, `usSPX 标普500`, `usDJIA 道琼斯`, `hfGC COMEX黄金`,
  `fxUDI 美元指数`, `btc BTC`, `eth ETH`.
  Missing upstream parts are dropped from the array (client renders what exists and
  shows a "部分数据不可用" note when `parts` has a failure or `quotes.length < 11`).
- `spark`: up to 48 points, normalized later by the client; `null` when unavailable.
  Sparks may be cached longer (5 min) than quotes; do not fail the snapshot for sparks.
- `boards`: A-share industry boards sorted by market cap desc, at most 96 entries,
  never fewer than 24 when upstream is healthy.
- `movers`: 8 each; `amount` only on `active`.
- `news`: up to 8 items, newest first. If the upstream item has no title field,
  derive a compact title from the first sentence of `summary` (≤ 46 chars, ellipsis).

### `GET /dsh-openfin/api/sector?code=BK1295`

```jsonc
{ "code": "BK1295", "name": "其他数字媒体", "pct": 9.8,
  "stocks": [{ "code": "603466", "name": "风语筑", "price": 15.33, "pct": 9.97, "amount": 812345678 }] }
```
Top 10 constituents by turnover. `404 { error }` for an unknown board code.

### `GET /dsh-openfin/api/academy`

```jsonc
{
  "articles": [
    { "id": "2008", "section": "crisis", "sectionLabel": "危机复盘", "title": "2008 金融危机…",
      "dek": "…", "tag": "危机复盘", "tags": ["2008"], "readMinutes": 12, "difficulty": 3,
      "dataAsOf": "2026-10-21", "dataAsOfActual": null }
  ],
  "sections": [ { "id": "all", "label": "全部", "count": 25 }, { "id": "crisis", "label": "危机复盘", "count": 7 } ]
}
```

### `GET /dsh-openfin/api/academy/article?id=2008`

```jsonc
{ "id": "2008", "title": "…", "dek": "…", "section": "crisis", "tag": "危机复盘",
  "readMinutes": 12, "difficulty": 3, "dataAsOf": "2026-10-21", "dataAsOfActual": null,
  "points": ["…"], "body": "## 一句话\n\n[[gold|黄金]]…",
  "related": [{ "id": "risk-free-rate", "title": "…" }] }
```
`404` for unknown ids.

### `GET /dsh-openfin/api/glossary`

```jsonc
{ "daily": { "id": "a-share", "term": "A股", "alias": "大A", "one": "…", "metaphor": "…",
             "number": "…", "pit": "…", "cat": "asset" },
  "terms": [ { "id": "a-share", "term": "A股", "alias": "大A", "one": "…", "metaphor": "…",
               "number": "…", "pit": "…", "cat": "asset" } ],
  "categories": [{ "id": "asset", "label": "资产" }] }
```
`terms` and `daily` carry the same full record shape (the client expands a term
in place); upstream fields `source`, `sym`, `lens`, `name`, `kw` are dropped.
`daily` is rotated by local date. Keep the payload under 260 KiB and sort terms
deterministically (`localeCompare`, zh). `categories[]` uses the source
repository's own ten ids and labels (data 研报数据, fund 基金与策略, asset 资产类别,
option 期权与期权策略, macro 宏观经济, basic 基础概念, micro 微观与行为,
player 机构与人物, risk 风险与交易, tech 技术指标), in source display order.

## Host module layout and ownership

| File | Part | Notes |
|---|---|---|
| `index.js` | Host | `apply(ctx)`, `inject = ['webServer']`, registers the route prefix inside `ctx.effect` |
| `lib/upstream.js` | Host | `fetchJson(url, { timeoutMs, headers })`, retry once, UA string `dsh-openfin/0.1 (+https://github.com/5777-wq/dsh-openfin)` |
| `lib/cache.js` | Host | `memo(key, ttlMs, loader)` + in-flight dedupe + `peek(key)` for stale fallback |
| `lib/quotes.js` | Host | eastmoney `ulist.np/get` + `trends2/get`; binance/okx/coingecko fallback chain for crypto |
| `lib/boards.js` | Host | eastmoney `clist/get` (`fs=m:90+t:2`), sector constituents (`fs=b:<code>`) |
| `lib/movers.js` | Host | eastmoney `clist/get` for A-share gainers/losers/turnover |
| `lib/news.js` | Host | eastmoney `np-listapi` news columns (needs `req_trace`) |
| `lib/academy.js` | Host | reads `data/academy/*.json` lazily, search + article + glossary |
| `lib/snapshot.js` | Host | parallel assembly, `parts` status, stale flag |
| `lib/routes.js` | Host | route table + JSON helpers |
| `tests/host/*.test.mjs` | Host tests | `node:test`; normalize fixtures under `tests/fixtures/` recorded from real responses |

Upstream endpoints that are verified working from the build machine:

- `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=1.000001,0.399001,0.399006,100.HSI,100.NDX,100.SPX,100.DJIA,101.GC00Y,100.UDI&fields=f1,f2,f3,f4,f12,f13,f14`
- `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=1.000001&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11&fields2=f51,f53&ndays=1&iscr=0`
- `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=500&po=1&np=1&fltt=2&invt=2&fid=f20&fs=m:90+t:2&fields=f2,f3,f4,f12,f14,f20`
- `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=8&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f12,f14,f6`
- `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=10&po=1&np=1&fltt=2&invt=2&fid=f6&fs=b:BK1295&fields=f2,f3,f6,f12,f14`
- `https://np-listapi.eastmoney.com/comm/web/getNewsByColumns?client=web&biz=web_news_col&column=344&order=1&needInteractData=0&page_index=1&page_size=8&req_trace=1`
- `https://push2.eastmoney.com/api/qt/stock/get?secid=90.BK1295&fields=f43,f57,f58,f169,f170` (sector display name / level; f43 and f170 are scaled by 100)
- Additive compatibility route: `GET /dsh-openfin/ping` (used by the skeleton page; kept)
- `https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]` and `/api/v3/klines?symbol=BTCUSDT&interval=15m&limit=48`
- fallbacks: `https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT`, `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`

Never let one upstream failure reject the snapshot. Total snapshot budget ~6 s;
individual part timeout 4 s.

## Content pipeline (`scripts/sync-academy.mjs`)

Source: the MIT-licensed sibling repos, read from a local checkout via
`--openfinlens <dir> --academy <dir>` or fetched from GitHub raw when absent.

Outputs (committed, deterministic, sorted):
- `data/academy/index.json` — the `articles` + `sections` payload of
  `/api/academy` (from `openfin-academy/data/content/index.json`, section labels
  from `{ all: 全部, assets: 标的百科, crisis: 危机复盘, concepts: 概念, cycles: 周期,
  family: 家庭, reports: 报告 }`).
- `data/academy/articles/<id>.json` — `{ ...card, points, body, related }` from
  `data/content/<id>.json`.
- `data/glossary.json` — `{ daily: null, terms, categories }` from
  `data/content/glossary.json`; `terms` keeps `{id, term, alias, one, cat}`,
  full records keep `{id, term, alias, one, metaphor, number, pit, cat}`.
- `data/SOURCES.json` — `{ generatedAt, upstream: [{repo, commit, license}], counts }`.

The script must be idempotent and print a summary. `scripts/check.mjs` asserts the
committed JSON is internally consistent (article ids unique, related ids resolve,
sections counts match, glossary payload size bound).

## Client module layout

`client/src/main.js` owns plugin registration and imports:

```js
import { Dashboard } from './views/Dashboard.js'
import { Academy } from './views/Academy.js'
import { Glossary } from './views/Glossary.js'
import { en, zh } from './generated-locales.js'
```

`client/src/theme.js` exports `export const CSS = String.raw\`…\`` with every
class the components use. The class prefix is `of-`. Component files must use
classes from theme.js only; dynamic geometry may use inline `style`.

Client views and their components:

| Module | Exports |
|---|---|
| `client/src/api.js` | `getSnapshot(signal)`, `getSector(code, signal)`, `getAcademy(signal)`, `getArticle(id, signal)`, `getGlossary(signal)` — each returns parsed JSON and throws `Error` with a readable message on non-2xx |
| `client/src/format.js` | `fmtPrice(v, digits)`, `fmtPct(v)`, `fmtChange(v, digits)`, `fmtCompact(v)` (亿/万), `fmtClock(ms)`, `signClass(v)` (`'up'|'down'|'flat'`) |
| `client/src/layout.js` | `squarify(items, { x, y, width, height })` → `[{ item, x, y, w, h }]` (squarified treemap, items pre-sorted desc by weight) |
| `client/src/components/*.js` | `Icon`, `Tabs`, `RefreshButton`, `QuoteCard`, `Sparkline`, `Heatmap`, `MoversList`, `NewsList`, `TermCard`, `Skeleton`, `EmptyState`, `ErrorState`, `Chip`, `Tooltip` |
| `client/src/views/Dashboard.js` | `Dashboard({ t, dir, onOpenSector })` |
| `client/src/views/Academy.js` | `Academy({ t, onOpenArticle })` |
| `client/src/views/ArticleView.js` | `ArticleView({ t, id, onBack, onOpenArticle })` |
| `client/src/views/Glossary.js` | `Glossary({ t })` |

Every component is a plain function component; no `React.` namespace access —
import hooks explicitly: `import { createElement as h, useEffect, useMemo, useRef, useState } from 'react'`.
Vite/esbuild JSX is **not** used: write `h(...)` calls (a local `el` helper per module is fine).

The content pipeline's `client/src/md.js` exports
`renderMarkdown(body, { onTerm })` → array of React elements. Supports `##`/`###`
headings, paragraphs, `-`/`1.` lists, `> ` blockquotes, tables (`| a | b |` with
`---` separator row), `**bold**`, `` `code` ``, `[text](https://…)` links,
and `[[termId|text]]` glossary references rendered as `<button class="of-term-ref" data-term="termId">text</button>`
that calls `onTerm(termId)`. Unknown constructs fall back to plain text. No HTML injection.

## Page composition

`main.js` renders a single `OpenFinPage` that owns:

- `tab`: `'market' | 'academy' | 'glossary'` (default `market`, remembered in
  `localStorage` under `dsh-openfin:tab`), and the article view (`articleId`).
- Header: mark, title `t('title')`, subtitle `t('subtitle')`; right side
  `<Tabs>` (three) and `<RefreshButton>`.
- Market tab: `<Dashboard t dir onOpenSector />` with `sector` state stored here;
  a sector drawer is rendered by `Dashboard` itself via `getSector`.
- Academy tab: `articleId === null ? <Academy /> : <ArticleView />`.
- Footer line: data attribution + `t('disclaimer')`.
- Locale direction: `dir = dict.meta.direction` (`zh` → `'cn'`, `en` → `'intl'`);
  the page sets `data-direction` on the root so CSS flips up/down colors.

## Locale dictionary keys

`meta.title`, `meta.description`, `meta.direction`, `nav`, `title`, `subtitle`,
`tab.market`, `tab.academy`, `tab.glossary`, `refresh`, `refreshedAt`, `loading`,
`stale`, `partial`, `retry`, `error.title`, `error.body`, `empty`,
`market.indices`, `market.heatmap`, `market.heatmapHint`, `market.breadth`,
`market.breadthUp`, `market.breadthDown`, `market.breadthFlat`, `market.movers`,
`market.gainers`, `market.losers`, `market.active`, `market.news`, `market.sector`,
`market.sectorEmpty`, `market.source`, `market.disclaimer`, `market.updated`,
`academy.title`, `academy.search`, `academy.searchEmpty`, `academy.readMinutes`,
`academy.difficulty`, `academy.dataAsOf`, `academy.back`, `academy.related`,
`academy.points`, `glossary.title`, `glossary.search`, `glossary.empty`,
`glossary.one`, `glossary.metaphor`, `glossary.number`, `glossary.pit`,
`glossary.daily`, `unit.yi`, `unit.wan`, `a11y.loading`, `a11y.refresh`.

Components may ask for keys not listed here; add them to **both** `locale/*.json`
files and report the addition in the task log.

## Release checklist for v0.1.0

1. `npm run build` succeeds; `node scripts/check.mjs` passes; `node --test "tests/**/*.test.mjs"` passes.
2. Installed in the running profile: sidebar row + full page, all three tabs work,
   sector drawer, article reader, glossary search.
3. Playwright captures (1600×1000): market tab, academy tab, article, glossary;
   no console errors; reduced-motion capture does not break layout.
4. `GET /dsh-openfin/api/snapshot` returns the documented shape, and a killed
   upstream yields `parts[].ok = false` instead of a 500.
5. README (zh + en), LICENSE, third-party notice, screenshots, marketplace entry ready.

---

# Floating HUD (v0.2)

A "摸鱼" surface: a small always-available quote widget with a pet-like mascot,
configurable instruments, opacity and idle fade. Two renderings of the same
config:

1. **In-page HUD** — a React component in the `shell.overlay` slot: draggable
   inside the DSH window, works in `dsh web` and Desktop, CSS opacity, idle fade.
2. **Desktop HUD** — an optional always-on-top transparent window created by a
   bundled Electron helper process (`runtime/electron-helper/`). Desktop only;
   native window opacity, still on top when DSH is behind other windows. The
   helper is a plain display surface: settings live in the DSH page, the helper
   receives config + snapshots from its own main process.

## Shared config (`HudConfig`)

Persisted by the Host at `$DSH_HOME/dsh-openfin/hud.json` (atomic tmp+rename).
The in-page HUD mirrors it to `localStorage` for instant boot, then reconciles
with the Host copy on mount.

```jsonc
{
  "version": 1,
  "inline": false,         // show the in-page HUD (opt-in)
  "desktop": false,        // desired state of the desktop helper
  "collapsed": false,      // in-page HUD collapsed to the mascot
  "symbols": ["sh000001", "sz399001", "hkHSI", "usIXIC", "btc"], // 1..6 known quote ids
  "opacity": 85,           // 20..100 (CSS + native window opacity)
  "idleOpacity": 35,       // 20..100; used only when idleAfterMs > 0
  "idleAfterMs": 30000,    // 0 | 5000..600000
  "hoverFull": true,       // pointer over the HUD restores `opacity`
  "size": "m",             // s | m | l
  "title": "OpenFin",      // 1..18 chars, user-editable label
  "showSpark": true,       // mini sparklines
  "position": { "x": 0, "y": 0 } // in-page HUD, viewport px (0,0 = default bottom-right)
}
```

Validation clamps or rejects invalid values; unknown keys are dropped. Quote ids
are the `quotes[].id` values from `/api/snapshot`: `sh000001`, `sz399001`, `sz399006`, `hkHSI`, `usIXIC`, `usSPX`, `usDJIA`, `hfGC`, `fxUDI`, `btc`, `eth`.

## Host routes

Both live under the existing `/dsh-openfin` prefix; the exact route for the HUD
is registered separately:

```
GET  /dsh-openfin/api/hud   -> 200 HudStatus
POST /dsh-openfin/api/hud   body: { desktop?: boolean, config?: Partial<HudConfig>, action?: 'recenter' }
                            -> 200 HudStatus
```

```jsonc
// HudStatus
{
  "available": true,              // an Electron binary was found
  "running": false,               // helper process alive
  "electron": { "path": "C:/.../electron.exe" },   // path null when unavailable
  "reason": "…",                  // human text when !available or spawn failed
  "config": { /* HudConfig */ },
  "window": { "x": 1, "y": 1, "width": 340, "height": 210 }   // null when closed
}
```

Behavior:

- `config` is merged into the persisted config, validated, written, and returned.
- `desktop: true` spawns the helper when not running; `false` stops it.
- `action: 'recenter'` asks a running helper to move to the default corner.
- Errors answer `{ error }` with 400 (invalid body), 409 (helper unavailable),
  500 (spawn/stop failure); the status routes never throw.

## Electron discovery and lifecycle (`lib/hud.js`)

Discovery order (first existing file wins, `available:false` + `reason` otherwise):

1. `process.env.DSH_OPENFIN_ELECTRON`
2. `$DSH_HOME/electron/electron.exe` (Windows), `$DSH_HOME/electron/electron`
   (Linux), `$DSH_HOME/electron/Electron.app/Contents/MacOS/Electron` (macOS) —
   the runtime other DSH desktop plugins already keep there
3. `electron` / `electron.exe` found on `PATH`

`$DSH_HOME` is `process.env.DSH_HOME` or `~/.dsh`. Spawning:

- args, one token each: `--openfin-host=<origin> --openfin-config=<hud.json>
  --openfin-window=<hud-window.json> --openfin-parent-pid=<pid>
  --openfin-size=<s|m|l>`. The `--key=value` form is required: with a
  URL-looking value followed by another flag, Electron 43 mis-resolves the app
  and exits before loading it (verified; see lib/hud.js)`
- env: inherited **minus `ELECTRON_RUN_AS_NODE`** (this variable is set inside a
  DSH host and would start Electron in Node mode, breaking the helper)
- a 6 s spawn deadline, one instance only, killed on plugin dispose and on
  `process` exit; `running` tracks the real child, `reason` records the last error

`$DSH_HOME/dsh-openfin/hud-window.json` is written by the helper only:
`{ "bounds": { "x": 1, "y": 1, "width": 340, "height": 210 } }`.

## Electron helper (`runtime/electron-helper/`)

CommonJS, no build, no dependencies. Files: `package.json`, `main.js`,
`preload.js`, `hud.html`, `hud.css`, `hud.js`.

- One frameless transparent `BrowserWindow`: `alwaysOnTop` level
  `screen-saver`, `skipTaskbar`, `hasShadow:false`, `resizable:false`,
  `showInactive()`, `backgroundColor:'#00000000'`, sandboxed webPreferences with
  a preload.
- Loads `hud.html` from disk; the main process fetches the snapshot every 15 s
  (and once immediately) from `<host>/dsh-openfin/api/snapshot` with Node fetch,
  watches the config file every 2 s, and pushes `{ snapshot, config }` to the
  renderer over `webContents.send`.
- Window size by config: s 300×150, m 340×210, l 384×270 (header + rows + footer);
  position from `hud-window.json` clamped into the display work area; default is
  the primary display's bottom-right corner with a 16 px margin.
- Native opacity = `config.opacity/100`; when idle (`idleAfterMs > 0`) and the
  pointer is away, fade to `config.idleOpacity/100`; pointer entry restores.
- Renderer reports pointer enter/leave; header is a drag region
  (`-webkit-app-region: drag`), buttons are `no-drag`.
- Close button closes the window and quits the app. The helper exits by itself
  when the parent PID disappears (checked every 3 s) and when the window closes.
- `--capture <path>` (test aid): after first paint, `capturePage()` to a PNG,
  quit. Never passed in production.
- The helper must never open an unauthenticated page over HTTP; the only network
  call is its own main-process fetch of the snapshot.

## In-page HUD (client)

- Registered in `shell.overlay` (frame-wide, root scope) — independent of the
  selected panel, so it survives page/tab switches.
- Collapsed: 44 px mascot chip + a change pill for the first selected symbol.
  Expanded: card with header (mascot, title, expand/collapse, settings, close),
  one row per selected symbol (name, value, change, optional spark), footer
  (updated time, disclaimer).
- Pointer drag moves it; position clamps to the viewport and persists in
  `HudConfig.position`; `action:'recenter'` resets it.
- Opacity applies to the widget only (not a backdrop); `hoverFull` raises it to
  `opacity` while the pointer is over the widget; idle fade applies after
  `idleAfterMs` with no pointer.
- Reduced motion: no idle pulse/spark animations.
- The settings sheet is opened from the card's gear or the page header button
  (`plugin header`), rendered in the same overlay, and edits the shared config:
  inline on/off, desktop on/off + status, symbol checkboxes (eleven),
  opacity/idle sliders, size, title, spark toggle, reset position.
- Every config change saves locally, then debounces a `POST /api/hud` (400 ms);
  a changed `desktop` flag is sent immediately.

## Acceptance

- `GET/POST /api/hud` answer the documented shapes; invalid bodies are 400.
- In-page HUD: shows configured symbols, drags, persists across reload, opacity
  and idle fade work, settings edit everything, desktop toggle reports status.
- Desktop helper on a machine with an Electron binary: opens a transparent
  always-on-top window, shows the same symbols, drags by its header, stays on
  top, restores position, closes from its button, and disappears when DSH quits.
- `node --test "tests/**/*.test.mjs"` covers config validation, discovery order,
  status shape, spawn/kill with a fake child process, and (when a real Electron
  binary is present) a documented manual capture check via `--capture`.
