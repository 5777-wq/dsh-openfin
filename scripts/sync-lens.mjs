#!/usr/bin/env node
/**
 * Vendor the OpenFinLens terminal into `lens/`.
 *
 * The plugin reproduces the complete OpenFinLens app by serving the original
 * MIT-licensed static build from `/dsh-openfin/lens/` inside the DSH page, so
 * the feature set does not drift from upstream. This script copies only the
 * runtime files, injects `lens/dsh-embed.js` into index.html, writes
 * `lens/SOURCES.json` provenance, and is deterministic: the same upstream
 * commit produces byte-identical output.
 *
 * Usage:
 *   node scripts/sync-lens.mjs [--lens <path-to-openfinlens-checkout>]
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lensOut = join(root, 'lens')
const args = process.argv.slice(2)
const lensFlag = args.indexOf('--lens')
const source = resolve(
  lensFlag >= 0 && args[lensFlag + 1] ? args[lensFlag + 1] : join(root, '..', 'openfin', 'openfinlens'),
)

/** Runtime files only: no docs, tests, screenshots, android app, api snapshots. */
export const RUNTIME_FILES = [
  'index.html',
  'manifest.webmanifest',
  'css/bundle.css',
  'js/bundle.js',
  'js/bundle-lazy.js',
  'lib/d3-array.min.js',
  'lib/d3-geo.min.js',
  'lib/topojson-client.min.js',
  'lib/lightweight-charts.standalone.production.js',
  'lib/THIRD_PARTY.md',
  'assets/globe/countries-110m.json',
]

export const RUNTIME_DIRS = ['assets/icons', 'data/actors', 'data/events']

const EMBED_TAG = '<!-- DSH embed adapter: theme handshake + readiness report (plugin-owned, not upstream) -->\n<script src="dsh-embed.js"></script>'
const CHARSET_TAG = '<meta charset="UTF-8">'

function fail(message) {
  console.error('sync-lens: ' + message)
  process.exit(1)
}

if (!existsSync(join(source, 'index.html'))) {
  fail(`no OpenFinLens checkout at ${source} — pass --lens <path> or clone 5777-wq/openfinlens there`)
}

let commit = null
try {
  commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
} catch {
  fail(`${source} is not a git checkout; provenance needs a commit`)
}

let committedAt = null
try {
  committedAt = execFileSync('git', ['-C', source, 'log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim()
} catch {
  /* SOURCES simply omits it */
}

// Clean the generated part of lens/ but keep the authored embed adapter.
mkdirSync(lensOut, { recursive: true })
for (const entry of readdirSync(lensOut)) {
  if (entry === 'dsh-embed.js' || entry === 'SOURCES.json') continue
  rmSync(join(lensOut, entry), { recursive: true, force: true })
}

const copied = []
for (const relativePath of RUNTIME_FILES) {
  const from = join(source, relativePath)
  if (!existsSync(from)) fail(`missing runtime file: ${relativePath}`)
  const to = join(lensOut, relativePath)
  mkdirSync(dirname(to), { recursive: true })
  if (relativePath === 'index.html') {
    const html = readFileSync(from, 'utf8')
    if (!html.includes(CHARSET_TAG)) fail('upstream index.html has no <meta charset="UTF-8"> marker to inject after')
    if (html.includes('src="dsh-embed.js"')) fail('upstream index.html already references dsh-embed.js')
    const injected = html.replace(CHARSET_TAG, `${CHARSET_TAG}\n${EMBED_TAG}`)
    writeFileSync(to, injected, 'utf8')
  } else {
    cpSync(from, to)
  }
  copied.push(relativePath)
}

for (const relativeDir of RUNTIME_DIRS) {
  const from = join(source, relativeDir)
  if (!existsSync(from)) fail(`missing runtime directory: ${relativeDir}`)
  cpSync(from, join(lensOut, relativeDir), { recursive: true })
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name)
      if (entry.isDirectory()) walk(full)
      else copied.push(relative(source, full).split('\\').join('/'))
    }
  }
  walk(from)
}

const website = 'https://5777-wq.github.io/openfinlens/'
const sources = {
  app: 'OpenFinLens',
  repo: 'https://github.com/5777-wq/openfinlens',
  website,
  commit,
  committedAt,
  license: 'MIT',
  licenseFile: 'LICENSES/OpenFinLens.txt',
  vendoredAt: 'lens/',
  adapter: 'lens/dsh-embed.js',
  note: 'Runtime files of the complete terminal, served by the plugin at /dsh-openfin/lens/ and embedded in the DSH page; see NOTICE.md.',
  files: copied.sort(),
}
writeFileSync(join(lensOut, 'SOURCES.json'), JSON.stringify(sources, null, 2) + '\n', 'utf8')

const bytes = copied.reduce((sum, entry) => {
  try {
    return sum + statSync(join(lensOut, entry)).size
  } catch {
    return sum
  }
}, 0)
const digest = createHash('sha256')
  .update(copied.join('\n'))
  .digest('hex')
  .slice(0, 12)

console.log(`sync-lens: vendored ${copied.length} files (${(bytes / 1024 / 1024).toFixed(2)} MiB) from ${source}`)
console.log(`sync-lens: OpenFinLens @ ${commit.slice(0, 12)}${committedAt ? ' (' + committedAt + ')' : ''}, file-list digest ${digest}`)
