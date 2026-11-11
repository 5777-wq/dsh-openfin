# dsh-openfin

English | [中文](README.md)

[![ci](https://github.com/5777-wq/dsh-openfin/actions/workflows/ci.yml/badge.svg)](https://github.com/5777-wq/dsh-openfin/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-black)](LICENSE)

> A finance dashboard and a plain-language finance library, installed into DeepSeek Harness as **one native page** — not an iframe, not an external link.

![Markets](docs/screenshots/market.jpg)

## What it is

OpenFin puts two things on one DSH page:

- **Complete terminal (default tab)** — the **original OpenFinLens app** (MIT, vendored in `lens/` and shipped with the plugin), 1:1 rather than a subset: full-market heatmaps for 5,574 A-shares, Hong Kong, US and crypto (market cap / turnover / equal area, wheel zoom anchored at the cursor, legend as filter), the global event map and prediction markets, stock K-lines with RSI/MACD/KDJ/BOLL, fund profiles, risk quizzes and comparison, portfolio tracking, macro curves, industry chains, dragon-tiger lists, 13F and southbound flows, the ⌘K command palette, `#tab=` deep links, and the primary→fallback→cache degradation chain. It follows the host light/dark theme and keeps its state across tab switches.
- **Markets** — 11 global instruments (Shanghai, Shenzhen, ChiNext, Hang Seng, Nasdaq, S&P 500, Dow, COMEX gold, dollar index, BTC, ETH), a market-cap treemap of 96 A-share industry sectors, gainers/losers/turnover lists, and an Eastmoney news feed. Click any sector to expand its constituents underneath the heatmap.
- **Academy** — 25 plain-language finance articles (7 crisis replays, 13 asset explainers, concepts and cycles) with glossary cross-links, plus a 293-term finance glossary with a term of the day.
- **Floating HUD ("slacking mode")** — a small draggable quote card, inside the page or **always-on-top on the desktop**: pick the eleven built-in instruments or search any A-share/HK/US symbol (e.g. Kweichow Moutai), set opacity, idle fade, card title and size. Collapsed, it is a mascot chip showing the first instrument's change. A **boss key** hides everything instantly and brings it back.

The page is one row in the DSH sidebar that opens a full page. It follows the host theme (light, dark, or a community skin), locale (zh/en), and window width; motion only touches `transform`/`opacity` and respects `prefers-reduced-motion`.

| Academy | Glossary |
|---|---|
| ![Academy](docs/screenshots/academy.jpg) | ![Glossary](docs/screenshots/glossary.jpg) |

| Sector constituents | Article reader |
|---|---|
| ![Sector](docs/screenshots/sector.jpg) | ![Article](docs/screenshots/article.jpg) |

## Floating HUD ("slacking mode")

Open **OpenFin → the floating-window button (top right)**:

- **In-page card** — a draggable card over the DSH window, bottom-right by default; collapsed it becomes a 44 px mascot chip that expands on click. Opacity 20–100%, fade to an "idle opacity" after N seconds, full opacity on hover.
- **Desktop window** — a transparent **always-on-top** window outside the app, still visible when DSH is behind other windows; native window opacity, remembered position, close button to quit. It needs an Electron runtime on the machine (other DSH desktop plugins usually leave one in `$DSH_HOME/electron`; alternatively point `DSH_OPENFIN_ELECTRON` at one, or have `electron` on `PATH`).
- **Instruments** — choose from the eleven built-in quotes, or search any stock, fund or index by name/code (typing “茅台” finds Kweichow Moutai, “五粮液” another) and add it to the HUD; up to six in total, rendered in your selection order. Optional sparklines, a custom card title, and a one-click position reset.
- **Boss key** — default `Ctrl+Shift+H` (presets: `Alt+X`, `Ctrl+Alt+H`, `Ctrl+Shift+Space`, or off). One press hides the in-page card and the desktop window instantly; another press brings them back. The desktop window registers it **system-wide**, so it works while DSH is not focused; if the combination is already taken, the page still works and the desktop window follows within ~2 s through the Host fallback.

## Complete terminal

The **Terminal** tab is the original OpenFinLens app itself — the full ~22k-line native-JS product, not a rewritten subset:

- multi-market heatmaps: A-shares / Hong Kong / US / crypto, with market-cap, turnover and equal-area modes; wheel zoom, drag pan, legend colour buckets as filters
- events: global event map, prediction markets (probability trends, tier rings), dragon-tiger capital flows, 13F holdings, southbound flows
- assets: stock K-lines with technical indicators, multi-symbol comparison, fund profiles / risk quiz / holdings
- insights: US–China yield curves, cross-asset matrix, industry chains and concept boards, World Bank annual heatmap
- ⌘K / Ctrl+K command palette, `#tab=` deep links, primary→fallback→local-cache degradation

The plugin vendors the whole runtime into `lens/` (MIT; version and commit in `lens/SOURCES.json`), serves it from the Host, and embeds it full-bleed in the DSH page while syncing the host light/dark theme. Upgrading is one `npm run sync:lens`. The Markets/Academy/Glossary tabs and the floating HUD remain native DSH surfaces.

![Complete terminal](docs/screenshots/terminal.jpg)

| In-page card | Desktop always-on-top |
|---|---|
| ![HUD](docs/screenshots/hud-inline.jpg) | ![Desktop HUD](docs/screenshots/hud-desktop.png) |

| HUD settings |
|---|
| ![HUD settings](docs/screenshots/hud-settings.jpg) |

Settings are remembered and shared between both surfaces; quotes refresh every 30 s and pause while the page is hidden.

## Install

**Desktop:** open **Plugins → + Install** and paste

```text
github:5777-wq/dsh-openfin
```

**`dsh web`:**

```sh
dsh plugin --profile web add github:5777-wq/dsh-openfin
```

**Prebuilt tarball** (nothing to build, no `allowBuilds` prompt):

```sh
dsh plugin --profile web add https://github.com/5777-wq/dsh-openfin/releases/latest/download/dsh-openfin.tgz
```

After installing, click **OpenFin** in the sidebar. Refresh the page; if the row does not appear, restart DSH once.

## Requirements

- DeepSeek Harness **0.2.2-rc.1** or a later 0.2.x (`engines.dsh` is declared).
- Network access to public quote endpoints (Eastmoney / Binance / OKX / CoinGecko — any one reachable).
- No API key, no login, no Python, no local build.
- The **desktop always-on-top window** additionally needs an Electron runtime (auto-detected from `$DSH_HOME/electron`, `DSH_OPENFIN_ELECTRON`, or `PATH`; the in-page card works without it).

## Data and privacy

- Quotes are fetched by the plugin's **Host half** inside the DSH process; the browser only talks to its own origin, so there is no CORS problem and no third-party origin in the page.
- Every request is an anonymous `GET`. The plugin uploads nothing, writes no files, and reads none of your files or sessions.
- A snapshot is cached for 30 s (the page polls using the `refreshMs` the server returns). If one upstream fails, the rest is served with a "partial data" badge instead of failing the page.
- Articles and glossary ship with the plugin, derived from the MIT-licensed sibling projects [openfin-academy](https://github.com/5777-wq/openfin-academy) and [openfinlens](https://github.com/5777-wq/openfinlens). Attribution in [NOTICE.md](NOTICE.md).

## Interactions

| Where | What |
|---|---|
| Sidebar **OpenFin** | Opens the page |
| **Markets** tab | Live quote cards; click a sector to expand constituents; switch movers between gainers/losers/turnover; news opens in a new tab |
| **Academy** tab | Search, filter by section, open an article; green term links open a definition |
| **Glossary** tab | Term of the day plus 293 terms; clicking a card expands metaphor/number/pitfall |
| Refresh button (top right) | Fetches a snapshot immediately (polling continues) |
| `Ctrl+Shift+H` | Hide / restore the floating HUD instantly (boss key) |

## Development

```sh
npm install
npm run build        # emits the single-file ModuleLoader artifact at client/client.js
npm run check        # manifest, patch, locales, icon, artifact, generated data, terminal
node --test "tests/**/*.test.mjs"
npm run sync:lens    # re-vendor the complete terminal from ../openfin/openfinlens
```

Regenerate the bundled content from the sibling repositories:

```sh
node scripts/sync-academy.mjs --academy ../openfin-academy --openfinlens ../openfinlens
```

Layout:

```text
index.js                  Host half entry (registers /dsh-openfin routes)
lib/                      quote fetching, caching, snapshot assembly, academy data, HUD manager, HTTP routes
runtime/electron-helper/  the desktop always-on-top window (standalone Electron process, no dependencies)
client/src/               page sources (React, bundled into one file)
client/client.js          committed build artifact (no build needed at install time)
lens/                     the complete OpenFinLens terminal (original MIT app, generated by sync:lens)
data/                     article index, 25 article bodies, 293 glossary terms (generated)
locale/                   zh/en dictionaries (also read by the plugin manager)
docs/SPEC.md              interface and module contracts
```

## Known limits

- Quotes are an aggregation of public endpoints and may be late or missing; the page says so, and nothing here is investment advice.
- The desktop window is unavailable without an Electron runtime (the reason is shown in settings); the in-page card is unaffected.
- The desktop window is always-on-top and does not steal focus or block other apps' clicks; lower the opacity or close it if you want it out of the way.
- Custom instruments depend on eastmoney's public search/quote endpoints; a suspended or missing symbol leaves that row blank while the others keep rendering.
- The **Terminal** tab is the original OpenFinLens app embedded same-origin, by design, so the feature set stays 1:1. Its storage keys (`gfd_*`, `ofl:*`) do not collide with the plugin's (`dsh-openfin:*`); the host light/dark theme is passed in, but canvas charts already open inside the terminal may need re-entering that view to repaint after a theme flip.
- Article bodies are Chinese originals; the English UI translates interface copy only.
- Tested on DSH 0.2.2-rc.1 desktop and `dsh web` only.

## License

MIT. Third-party attribution and full license texts: [NOTICE.md](NOTICE.md) and [LICENSES/](LICENSES/).
