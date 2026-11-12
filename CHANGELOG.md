# Changelog

## 0.5.0 — 2026-11-12

Performance and logic pass over both halves, found by auditing every request
path rather than by guessing.

### Changed

- **The client bundle is minified**: `client/client.js` 222 KB → 143 KB
  (gzip 47 KB → 38 KB). It is parsed on every DSH page load, so this is paid on
  every refresh, not just the first.
- **The glossary paints immediately.** Its reveal animation is a stagger, not a
  queue, but the delay was derived from the card index: with 293 terms the last
  card only became visible 7.6 s after the first. The index is now capped, and
  off-screen cards use `content-visibility` so they skip layout and paint.
- **Committed content is cached.** Articles are parsed once (revalidated by
  mtime/size), the glossary payload is built once per local date and
  pre-serialized for the route, and the client keeps `/api/academy`,
  `/api/glossary` and each article for the page lifetime instead of re-reading
  them on every tab switch.
- **The sector drawer is cached and bounded**: one 30 s entry per board code
  plus a 5 s budget, so reopening a board costs no upstream calls and a hung
  constituent request cannot stall the drawer.
- **The floating HUD reuses the dashboard's quotes entry.** Built-in symbols
  used to load the quotes part outside the shared cache (one extra index +
  crypto request per HUD poll, and the desktop helper polls every 15 s); they
  now join `part:quotes`, and built-in and custom symbols load in parallel.
- **Sparklines no longer stall a poll**: a cached series is served as-is while
  an expired one refreshes in the background, so the 30 s refresh stops waiting
  on nine trend requests.
- **Retries have to fit the budget**: `fetchJson` gained a 5.5 s deadline, so a
  4 s timeout is no longer followed by an 8.15 s second attempt that could
  never reach a 6 s snapshot part.
- **The crypto fallback chain can no longer hold the index cards hostage.** It
  has its own cache entry and a 2 s wait, so a dead Binance/OKX/CoinGecko path
  costs at most 2 s instead of up to 24 s.
- The board list asks upstream for 150 rows instead of 500 (the heatmap keeps
  96).
- The HUD settings sheet renders the status it is given instead of fetching it
  again (3 → 1 request on open), and the opacity sliders stage locally and
  commit on release instead of writing config on every pointer move.

### Fixed

- Snapshot polling now stops on the terminal tab (nothing there reads it),
  pauses while the page is hidden via `visibilitychange` instead of re-arming
  an 8 s timer, and backs off 30 s → 5 min on repeated failures.
- The terminal's theme observer runs only while its tab is visible.
- A NUL byte in a static path answers 404 (the SPEC's contract) instead of 400.
- The desktop helper can report an unexpected exit again after an intentional
  stop; the in-process cache sweeps expired entries instead of growing forever,
  and a part served from a still-fresh entry is no longer flagged stale.
- `npm run check` no longer skips the academy checks when `data/` is missing.
  It now validates section counts, article → article/term cross-references, and
  the 260 KiB budget on the payload the route actually serves.
- Tests: 171 (+10), including an end-to-end wiring test that proves the HUD,
  the dashboard and the sector route share one cache.

## 0.4.0 — 2026-11-11

### Added

- **The complete OpenFinLens terminal** as the default tab — not a subset. The
  original MIT-licensed app is vendored under `lens/` (130 runtime files,
  ~2 MB), served by the Host from `/dsh-openfin/lens/`, and embedded full-bleed
  in the DSH page with the host light/dark theme. Every upstream feature is
  available: multi-market heatmaps with zoom/pan and legend filters, the global
  event map, prediction markets, stock K-lines with technical indicators, fund
  profiles / risk quiz / comparison, portfolio tracking, macro curves, industry
  chains, dragon-tiger / 13F / southbound flows, the ⌘K command palette and
  deep links.
- `scripts/sync-lens.mjs`: deterministic vendoring from the upstream checkout
  with commit provenance (`lens/SOURCES.json`), only the runtime file set, and
  the one-line embed adapter injection.
- `lens/dsh-embed.js`: theme handshake (initial `?theme=` + live `dsh-theme`
  messages) and a readiness message that clears the DSH loading veil.
- `lib/lens.js`: a hardened static server (GET/HEAD only, traversal/symlink
  containment, MIME, ETag/304, document no-cache) with 8 unit tests.
- `client/src/views/Terminal.js`: terminal tab with loading veil, reload and
  open-in-new-tab controls; the frame stays mounted across tab switches so the
  app keeps its tab/scroll/chart state.
- Tests: 161 total.

## 0.3.0 — 2026-11-11

### Added

- **Custom instruments** in the floating HUD: search any eastmoney instrument
  (A-share, HK, US, funds, indices) by name or code, add it to the HUD as an
  `em:<secid>` symbol with a catalog label, up to six symbols in total. Search
  and quotes run in the Host (`/api/hud/search`, `/api/hud/quotes`) because the
  upstream has no CORS; custom quotes carry a 30 s cache and a 5 min sparkline.
- **Boss key**: one keystroke hides the floating HUD and the desktop window
  instantly, the same keystroke brings them back. Default `Ctrl+Shift+H`
  (presets: `Alt+X`, `Ctrl+Alt+H`, `Ctrl+Shift+Space`, or off), configurable in
  the HUD settings. The desktop window registers it system-wide through Electron
  `globalShortcut`; the page listens while focused; a Host panic fallback
  (`action: 'panic'`) covers a taken accelerator.
- Settings: instrument search with add/remove chips, selected-symbol count, and
  a panic section (switch, shortcut preset, "hide now").
- Tests: 13 instrument tests (search/quote normalization, caching, failure
  isolation) and 6 new HUD tests (catalog validation, panic routes, shortcut
  validation) — 153 overall.

### Fixed

- The helper is now spawned with its app path as the first argument; without it
  Electron booted its default app instead of the HUD window.
- `useCountUp` now lands a value that arrives after the first render, so a HUD
  row no longer keeps showing "—" for its price.

## 0.2.0 — 2026-11-11

### Added

- **Floating HUD ("摸鱼模式")** — a draggable quote card with a pet-like mascot:
  - in-page widget rendered in the frame-wide overlay, independent of the
    selected panel, with collapse/expand, drag, viewport clamping and a
    remembered position;
  - optional **desktop always-on-top window** created by a bundled standalone
    Electron helper (`runtime/electron-helper/`), with native window opacity,
    idle fade, remembered position, parent-process watchdog and a clean exit;
  - shared settings: 1–6 instruments out of eleven, opacity 20–100, idle opacity
    and timeout, hover-to-full, size s/m/l, custom card title, sparkline toggle,
    position reset, and a live Electron availability/running status with an
    "open desktop window" switch;
  - settings sheet opened from the page header or the card's gear; Esc closes,
    focus is restored, reduced-motion is respected.
- Host route `GET|POST /dsh-openfin/api/hud` (status, config patch, desktop
  on/off, recenter) and a persisted `$DSH_HOME/dsh-openfin/hud.json`.
- Electron discovery (env override → `$DSH_HOME/electron` → `PATH`), a 6 s spawn
  deadline, single-instance supervision and stop-on-dispose.
- Tests: 18 new host tests for config validation, discovery, spawn/stop
  lifecycle and the HTTP surface (104 host tests total, 134 overall).

### Notes

- The desktop window needs an Electron runtime; the in-page card does not.
- The helper is started with `--openfin-*=<value>` flags because Electron
  mis-resolves the app when a URL-looking argument is followed by another flag
  (verified on Electron 43).

## 0.1.0 — 2026-11-11

First public release.

### Added

- Native OpenFin page in the DeepSeek Harness Web UI: sidebar row, three tabs,
  host theme tokens, zh/en UI dictionaries, reduced-motion-safe motion.
- **Markets** tab: 11 live quotes with intraday sparklines (SSE, SZSE, ChiNext,
  Hang Seng, Nasdaq, S&P 500, Dow, COMEX gold, dollar index, BTC, ETH); a
  market-cap treemap of up to 96 A-share industry sectors with an inline
  constituents panel on click; gainers / losers / turnover lists; a market news
  feed; sector breadth bar.
- **Academy** tab: 25 plain-language finance articles with search, section
  filters, key-points callout, markdown rendering (headings, lists, blockquotes,
  tables, bold, inline code, links) and glossary cross-links with an inline
  term peek.
- **Glossary** tab: term of the day plus 293 searchable terms, each expanding in
  place to metaphor / number / pitfall.
- Host half: one same-origin route prefix (`/dsh-openfin`); server-side fetching
  with a 30 s snapshot cache, per-part timeouts and retries, stale-cache
  fallback, and a `parts[]` status the page shows as "partial data". Routes:
  `/api/snapshot`, `/api/sector`, `/api/academy`, `/api/academy/article`,
  `/api/glossary`.
- Deterministic content pipeline (`scripts/sync-academy.mjs`) from the MIT
  sibling repositories, with provenance in `data/SOURCES.json`.
- Tests: 86 host unit tests (normalizers, cache, snapshot assembly, routes) and
  30 markdown/content tests; `scripts/check.mjs` validates the manifest, bundle
  patch, locales, icon, committed client artifact and generated data.
- CI: builds the client, fails on a stale committed artifact, runs the checks and
  the test suites.

### Notes

- Requires DeepSeek Harness 0.2.2-rc.1 or a later 0.2.x.
- Quotes come from public endpoints and may be delayed or missing; nothing here
  is investment advice.
- Academy article bodies are Chinese originals; the English UI translates
  interface copy only.
