// Entry point for `node --test tests/host`.
//
// Node 24 treats `--test` positional arguments as files or glob patterns, not
// directories, so the directory form resolves through this index file and
// imports every suite here. The canonical command in docs is still
// `node --test tests/host`; `node --test "tests/host/*.test.mjs"` also works
// and does not load this file.
import './upstream.test.mjs'
import './cache.test.mjs'
import './quotes.test.mjs'
import './boards.test.mjs'
import './movers.test.mjs'
import './news.test.mjs'
import './academy.test.mjs'
import './snapshot.test.mjs'
import './routes.test.mjs'
