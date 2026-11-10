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

## OpenFinLens — product design and data-source research

- Repository: <https://github.com/5777-wq/openfinlens>
- Copyright (c) 2026 GLOBAL FIN contributors
- License: MIT (`LICENSES/OpenFinLens.txt`)
- What is bundled: no source files. OpenFinLens documents and prototypes the
  public market endpoints this plugin's Host half reads, and the plugin's
  product concept (market dashboard plus plain-language academy) comes from the
  same family of projects. Endpoint paths and field meanings were re-derived and
  reimplemented here; no OpenFinLens code is copied.

## Market data

Live quotes, boards, constituents and news are fetched at runtime from public
endpoints operated by 东方财富 (Eastmoney), Binance, OKX and CoinGecko. The
plugin stores no market data in its repository except the small test fixtures
under `tests/fixtures/`, which are trimmed responses used to keep the tests
hermetic. All trademarks belong to their owners.

**The data is for information only and is not investment advice.** No
endpoint requires an API key, and the plugin never sends user data anywhere: the
Host half only performs outbound `GET` requests for public market data.
