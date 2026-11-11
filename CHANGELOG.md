# Changelog

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
