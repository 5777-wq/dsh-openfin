#!/usr/bin/env node
// Repository self-check for dsh-openfin: manifest, patch, locales, icon, the
// committed client artifact and the generated academy data. No network, no
// writes — safe for CI and for `npm run check` before publishing.
import { readFile, stat, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const warnings = []

function fail(message) {
  failures.push(message)
}

function warn(message) {
  warnings.push(message)
}

async function readText(relative) {
  return readFile(resolve(root, relative), 'utf8')
}

async function readJson(relative) {
  return JSON.parse(await readText(relative))
}

// ---------------------------------------------------------------- manifest
const pkg = await readJson('package.json')
if (typeof pkg.name !== 'string' || !/^dsh-[a-z0-9-]+$/.test(pkg.name)) {
  fail(`package.json name must match dsh-<kebab>: got ${JSON.stringify(pkg.name)}`)
}
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(pkg.version ?? '')) fail('package.json version is not semver')
if (!pkg.description || pkg.description.length < 20) fail('package.json description is missing or too short')
if (!pkg.license) fail('package.json license is missing')
const dsh = pkg.dsh ?? {}
if (!dsh.bundle || typeof dsh.bundle.patch !== 'string') fail('package.json dsh.bundle.patch is missing')
else if (!existsSync(resolve(root, dsh.bundle.patch))) fail(`bundle patch not found: ${dsh.bundle.patch}`)
if (!dsh.client || dsh.client.platform !== 'web') fail('package.json dsh.client.platform must be "web"')
if (!dsh.client?.immediately) warn('dsh.client.immediately is not set; the page will load lazily')
if (!Array.isArray(dsh.client?.inject) || dsh.client.inject.length === 0) {
  warn('dsh.client.inject is empty; activation order is unspecified')
}
for (const entry of ['.', './client', './icon', './locale/*.json', './package.json']) {
  if (!pkg.exports || !(entry in pkg.exports)) fail(`package.json exports is missing "${entry}"`)
}
if (!Array.isArray(pkg.files)) fail('package.json files must list the shipped files')
else {
  const listed = new Set(pkg.files.map((entry) => String(entry).replace(/^\.\//, '')))
  for (const expected of ['index.js', 'lib', 'client/client.js', 'data', 'locale/*.json', 'icon.svg', dsh.bundle?.patch, 'LICENSES', 'README.md']) {
    if (expected && !listed.has(String(expected).replace(/^\.\//, ''))) {
      fail(`package.json files is missing "${expected}"`)
    }
  }
}
if (!pkg.engines?.dsh) fail('package.json engines.dsh is missing (the marketplace reads it)')

// ------------------------------------------------------------- bundle patch
const patch = await readText(dsh.bundle.patch)
if (!/^-\s*insert:/m.test(patch)) fail('cordis.patch.yml has no insert list')
if (!patch.includes(`name: '${pkg.name}'`) && !patch.includes(`name: "${pkg.name}"`) && !patch.includes(`name: ${pkg.name}`)) {
  fail(`cordis.patch.yml does not insert the package "${pkg.name}"`)
}

// ------------------------------------------------------------------ locales
const requiredKeys = [
  'meta.title', 'meta.description', 'meta.direction',
  'nav', 'title', 'subtitle',
  'tab.market', 'tab.academy', 'tab.glossary',
  'refresh', 'loading', 'retry', 'empty', 'partial', 'stale',
  'market.indices', 'market.heatmap', 'market.movers', 'market.news',
  'academy.search', 'academy.readMinutes',
  'glossary.search', 'glossary.daily',
]
const localeSets = {}
for (const locale of ['en', 'zh']) {
  const raw = await readJson(`locale/${locale}.json`)
  const flat = flatten(raw)
  localeSets[locale] = flat
  for (const key of requiredKeys) {
    if (typeof flat[key] !== 'string' || flat[key].trim() === '') fail(`locale/${locale}.json is missing "${key}"`)
  }
  if (!/^(cn|intl)$/.test(flat['meta.direction'] ?? '')) fail(`locale/${locale}.json meta.direction must be cn|intl`)
}
const enKeys = Object.keys(localeSets.en).sort()
const zhKeys = Object.keys(localeSets.zh).sort()
for (const key of enKeys) if (!zhKeys.includes(key)) warn(`key "${key}" exists in en but not zh`)
for (const key of zhKeys) if (!enKeys.includes(key)) warn(`key "${key}" exists in zh but not en`)

function flatten(value, prefix = '') {
  const out = {}
  for (const [key, inner] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) Object.assign(out, flatten(inner, path))
    else out[path] = inner
  }
  return out
}

// --------------------------------------------------------------------- icon
if (!existsSync(resolve(root, 'icon.svg'))) fail('icon.svg is missing')
else {
  const info = await stat(resolve(root, 'icon.svg'))
  if (info.size > 256 * 1024) fail('icon.svg exceeds the 256 KiB limit')
  const svg = await readText('icon.svg')
  if (!svg.trimStart().startsWith('<svg')) fail('icon.svg is not an SVG document')
}

// ----------------------------------------------------------- client artifact
if (!existsSync(resolve(root, 'client/client.js'))) fail('client/client.js is missing (run npm run build)')
else {
  const client = await readText('client/client.js')
  if (!client.includes('window.__ModuleLoader__.load(')) fail('client/client.js is not a ModuleLoader factory')
  if (!client.includes(`id: ${JSON.stringify(pkg.name)}`)) fail(`client/client.js is not registered as ${pkg.name}`)
  if (/require\(['"]@deepseek-ai\//.test(client)) fail('client/client.js imports a @deepseek-ai package; only react may be required')
  if (client.length < 4096) fail('client/client.js looks empty')
  if (client.length > 2 * 1024 * 1024) warn('client/client.js is larger than 2 MiB')
}

// --------------------------------------------------------------- host half
if (existsSync(resolve(root, 'lib'))) {
  for (const file of await readdir(resolve(root, 'lib'))) {
    if (!file.endsWith('.js')) continue
    const source = await readText(`lib/${file}`)
    if (/(?:from|import\()\s*['"]@deepseek-ai\//.test(source)) {
      fail(`lib/${file} imports a @deepseek-ai package; the Host half must use node:* only`)
    }
  }
}

// ------------------------------------------------------------ academy data
if (existsSync(resolve(root, 'data/academy/index.json'))) {
  const index = await readJson('data/academy/index.json')
  const articles = Array.isArray(index.articles) ? index.articles : []
  if (articles.length < 10) fail(`data/academy/index.json has only ${articles.length} articles`)
  const ids = new Set()
  for (const article of articles) {
    if (!article.id) fail('data/academy/index.json has an article without id')
    if (ids.has(article.id)) fail(`duplicate article id ${article.id}`)
    ids.add(article.id)
    if (!existsSync(resolve(root, 'data/academy/articles', `${article.id}.json`))) {
      fail(`missing data/academy/articles/${article.id}.json`)
    }
  }
  if (!Array.isArray(index.sections) || index.sections.length === 0) fail('data/academy/index.json has no sections')
  const glossary = await readJson('data/glossary.json')
  if (!Array.isArray(glossary.terms) || glossary.terms.length < 50) fail('data/glossary.json has too few terms')
  if (!Array.isArray(glossary.categories) || glossary.categories.length === 0) fail('data/glossary.json has no categories')
  const size = (await stat(resolve(root, 'data/glossary.json'))).size
  if (size > 260 * 1024) fail(`data/glossary.json is ${size} bytes (limit 260 KiB)`)
}

// ----------------------------------------------------- generated locale copy
const generated = resolve(root, 'client/src/generated-locales.js')
if (!existsSync(generated)) warn('client/src/generated-locales.js is missing (created by npm run build)')
else {
  const text = await readText('client/src/generated-locales.js')
  if (!text.includes('export const en =') || !text.includes('export const zh =')) {
    fail('client/src/generated-locales.js is malformed')
  }
}

// -------------------------------------------------------------------- report
for (const message of warnings) console.warn('warn  ' + message)
if (failures.length > 0) {
  for (const message of failures) console.error('FAIL  ' + message)
  console.error(`\n${failures.length} check(s) failed`)
  process.exit(1)
}
console.log(`ok  ${pkg.name}@${pkg.version}: manifest, patch, locales, icon, client artifact and data verified`)
if (warnings.length > 0) console.log(`    ${warnings.length} warning(s)`)
