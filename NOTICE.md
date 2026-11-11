# Third-party notices

`dsh-openfin` bundles content derived from two MIT-licensed sibling projects by
the same author. Their license texts are reproduced verbatim in `LICENSES/`.

## OpenFin Academy — article and glossary content

- Repository: <https://github.com/5777-wq/openfin-academy>
- Copyright (c) 2026 5777-wq and OpenFin Academy contributors
- License: MIT (`LICENSES/OpenFinAcademy.txt`)
- What is bundled: the article index, 25 article bodies, and the glossary
  records under `data/`. The build step (`scripts/sync-academy.mjs`) normalizes
  these files; the wording is unmodified.

## OpenFinLens — the complete terminal (vendored app)

- Repository: <https://github.com/5777-wq/openfinlens>
- Copyright (c) 2026 GLOBAL FIN contributors
- License: MIT (`LICENSES/OpenFinLens.txt`)
- What is bundled: the **runtime files of the complete OpenFinLens web app**
  under `lens/` (HTML, CSS, JS bundles, vendored chart/map libraries, icons,
  static event/actor data), served by the plugin at `/dsh-openfin/lens/` and
  embedded in the DSH page so the terminal keeps 1:1 feature parity. The
  upstream commit and file list are recorded in `lens/SOURCES.json`; the only
  in-tree change is the injected `dsh-embed.js` adapter (theme handshake and
  readiness message). Re-vendor with `npm run sync:lens`.
- The plugin's native market page re-derived endpoint paths and field meanings
  from the same project; no other upstream files are copied.

## Market data

Live quotes, boards, constituents and news are fetched at runtime from public
endpoints operated by 东方财富 (Eastmoney), Binance, OKX and CoinGecko. The
plugin stores no market data in its repository except the small test fixtures
under `tests/fixtures/`, which are trimmed responses used to keep the tests
hermetic. All trademarks belong to their owners.

**The data is for information only and is not investment advice.** No
endpoint requires an API key, and the plugin never sends user data anywhere: the
Host half only performs outbound `GET` requests for public market data.
