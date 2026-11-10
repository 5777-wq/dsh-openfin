# Changelog

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
