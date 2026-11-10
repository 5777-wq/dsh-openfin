/**
 * dsh-openfin — Academy markdown.
 *
 * Two layers, deliberately split so the parser is pure and testable without a
 * React environment:
 *
 *   parseMarkdown(body)                 -> Block[]        (no imports, no side effects)
 *   renderMarkdown(body, { onTerm })    -> ReactElement[] (uses `h` from 'react')
 *
 * Supported constructs (the subset the Academy bodies use):
 *   `##` / `###` headings, paragraphs, `-` / `1.` lists, `> ` blockquotes,
 *   GitHub-style tables (`| a | b |` + `|---|` separator), `**bold**`,
 *   `*italic*`, `` `code` ``, `[text](https://…)` links, `[[termId|text]]`
 *   glossary refs, and `---` horizontal rules (the Academy source footer).
 *
 * Unknown constructs degrade to text: `# h1`, `####`, images (`![alt](src)` ->
 * alt text), raw HTML and malformed markers all become plain text nodes.
 * `2*3` style multiplication is not emphasis: a `*` that opens right after a
 * letter or digit stays literal, and so does every unmatched asterisk.
 * Internal `#/series/…` links degrade to their label.
 * Nothing is ever injected as HTML: the renderer only builds elements.
 *
 * Block AST:
 *   { type:'heading',    level: 2|3, children: Inline[] }
 *   { type:'paragraph',  children: Inline[] }
 *   { type:'list',       ordered: boolean, items: Inline[][] }
 *   { type:'blockquote', paragraphs: Inline[][] }
 *   { type:'table',      header: Inline[][], rows: Inline[][][] }
 *   { type:'hr' }
 *
 * Inline AST:
 *   { type:'text',   value }
 *   { type:'strong', children: Inline[] }
 *   { type:'em',     children: Inline[] }
 *   { type:'code',   value }
 *   { type:'link',   href, children: Inline[] }   // http(s)/mailto only
 *   { type:'term',   id, text }                   // [[id|text]] -> <button.of-term-ref>
 */
import { createElement as h } from 'react'

const HEADING_RE = /^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/
const UNORDERED_RE = /^([ \t]*)[-*+][ \t]+(.*)$/
const ORDERED_RE = /^([ \t]*)(\d{1,3})[.)][ \t]+(.*)$/
const QUOTE_RE = /^[ \t]*>[ \t]?(.*)$/
const TABLE_ROW_RE = /^[ \t]*\|/
const HR_RE = /^[ \t]*-(?:[ \t]*-){2,}[ \t]*$/
const SEPARATOR_CELL_RE = /^:?-{2,}:?$/
const SEPARATOR_CHARS_RE = /^[|\s:-]+$/
const EXTERNAL_HREF_RE = /^(https?:|mailto:)/i

/* ------------------------------------------------------------------ */
/* Inline parsing                                                      */
/* ------------------------------------------------------------------ */

function pushText(nodes, value) {
  const text = String(value)
  if (!text) return
  const last = nodes[nodes.length - 1]
  if (last && last.type === 'text') last.value += text
  else nodes.push({ type: 'text', value: text })
}

/**
 * Parse the inline constructs of one text run into Inline nodes.
 * A fresh regex per call keeps recursion safe; depth caps pathological nesting.
 */
function parseInline(text, depth = 0) {
  const source = String(text == null ? '' : text)
  if (!source) return []
  if (depth > 4) return [{ type: 'text', value: source }]

  // image (degrade to alt) | **strong** | *em* | `code` | [[term|text]] | [text](href)
  // `**strong**` is listed before `*em*`: double asterisks always win over emphasis.
  const re = /!\[(?<imageAlt>[^\]]*)\]\((?<imageSrc>[^)\s]*)\)|\*\*(?<strong>[\s\S]+?)\*\*|\*(?<em>[^\s*\n](?:[^*\n]*[^\s*])?)\*|`(?<code>[^`\n]+)`|\[\[(?<termId>[^\]|\n]+)\|(?<termText>[^\]\n]+)\]\]|\[(?<linkText>[^\]\n]+)\]\((?<href>[^)\s]+)\)/g
  const nodes = []
  let last = 0
  let match
  while ((match = re.exec(source))) {
    const groups = match.groups || {}
    if (match.index > last) pushText(nodes, source.slice(last, match.index))
    last = re.lastIndex

    if (groups.imageAlt !== undefined) {
      pushText(nodes, groups.imageAlt) // image -> alt text
    } else if (groups.strong !== undefined) {
      const children = parseInline(groups.strong, depth + 1)
      if (children.length) nodes.push({ type: 'strong', children })
      else pushText(nodes, match[0])
    } else if (groups.em !== undefined) {
      // `2*3*4` style multiplication: a `*` opening right after a letter or
      // digit is not emphasis. Otherwise recurse for terms/code inside the run.
      const previous = match.index > 0 ? source[match.index - 1] : ''
      if (/[0-9A-Za-z]/.test(previous)) {
        pushText(nodes, match[0])
        continue
      }
      const children = parseInline(groups.em, depth + 1)
      if (children.length) nodes.push({ type: 'em', children })
      else pushText(nodes, match[0])
    } else if (groups.code !== undefined) {
      nodes.push({ type: 'code', value: groups.code })
    } else if (groups.termId !== undefined) {
      nodes.push({ type: 'term', id: groups.termId.trim(), text: groups.termText })
    } else if (groups.linkText !== undefined) {
      const href = groups.href
      if (EXTERNAL_HREF_RE.test(href)) {
        const children = parseInline(groups.linkText, depth + 1)
        if (children.length) nodes.push({ type: 'link', href, children })
      } else {
        // Internal/relative targets (all `#/series/…` in the Academy corpus)
        // have no destination inside the plugin: degrade to the label text.
        pushText(nodes, groups.linkText)
      }
    }
  }
  if (last < source.length) pushText(nodes, source.slice(last))
  return nodes
}

/* ------------------------------------------------------------------ */
/* Block parsing                                                       */
/* ------------------------------------------------------------------ */

function splitTableRow(line) {
  let text = String(line).trim()
  if (text.startsWith('|')) text = text.slice(1)
  if (text.endsWith('|')) text = text.slice(0, -1)
  // Split on cell pipes but keep `|` inside `[[term|text]]` and inline code —
  // the Academy tables reference glossary terms directly in cells.
  const cells = []
  let current = ''
  let inTerm = false
  let inCode = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\\' && text[i + 1] === '|') {
      current += '|'
      i++
      continue
    }
    if (!inCode && ch === '`') {
      inCode = !inCode
      current += ch
      continue
    }
    if (!inCode && ch === '[' && text[i + 1] === '[') {
      inTerm = true
      current += '[['
      i++
      continue
    }
    if (inTerm && ch === ']' && text[i + 1] === ']') {
      inTerm = false
      current += ']]'
      i++
      continue
    }
    if (ch === '|' && !inTerm && !inCode) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current.trim())
  return cells
}

function isTableSeparator(line) {
  const text = String(line).trim()
  if (!text.includes('|') || !text.includes('-')) return false
  if (!SEPARATOR_CHARS_RE.test(text)) return false
  const cells = splitTableRow(text)
  return cells.length > 0 && cells.every((cell) => SEPARATOR_CELL_RE.test(cell))
}

function isTableStart(lines, index) {
  return TABLE_ROW_RE.test(lines[index]) && index + 1 < lines.length && isTableSeparator(lines[index + 1])
}

function startsBlock(lines, index) {
  const line = lines[index]
  if (!line || !line.trim()) return false
  const trimmed = line.trim()
  if (HEADING_RE.test(trimmed)) return true
  if (QUOTE_RE.test(line)) return true
  if (UNORDERED_RE.test(line) || ORDERED_RE.test(line)) return true
  if (HR_RE.test(line)) return true
  if (isTableStart(lines, index)) return true
  return false
}

function parseTable(lines, index) {
  const header = splitTableRow(lines[index])
  const rows = []
  let i = index + 2
  while (i < lines.length && TABLE_ROW_RE.test(lines[i]) && lines[i].trim() && !isTableSeparator(lines[i])) {
    rows.push(splitTableRow(lines[i]))
    i++
  }
  const width = header.length
  const fit = (cells) => {
    const out = cells.slice(0, width)
    while (out.length < width) out.push('')
    return out
  }
  return {
    block: {
      type: 'table',
      header: header.map((cell) => parseInline(cell)),
      rows: rows.map((row) => fit(row).map((cell) => parseInline(cell))),
    },
    next: i,
  }
}

function parseList(lines, index) {
  const first = UNORDERED_RE.exec(lines[index]) || ORDERED_RE.exec(lines[index])
  const ordered = !UNORDERED_RE.test(lines[index])
  const baseIndent = first[1].length
  const items = []
  let i = index
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) break
    const unordered = UNORDERED_RE.exec(line)
    const orderedMatch = ORDERED_RE.exec(line)
    if (unordered && !ordered && unordered[1].length <= baseIndent) {
      items.push(unordered[2].trim())
      i++
      continue
    }
    if (orderedMatch && ordered && orderedMatch[1].length <= baseIndent) {
      items.push(orderedMatch[3].trim())
      i++
      continue
    }
    // A nested list (deeper indent) or a switch between bullet kinds ends this
    // block; the outer loop parses the rest as its own list.
    if (unordered || orderedMatch) break
    // Lazy continuation of the previous item.
    if (items.length && !startsBlock(lines, i)) {
      items[items.length - 1] = `${items[items.length - 1]} ${line.trim()}`
      i++
      continue
    }
    break
  }
  return { block: { type: 'list', ordered, items: items.map((item) => parseInline(item)) }, next: i }
}

function parseBlockquote(lines, index) {
  const paragraphs = []
  let current = []
  let i = index
  while (i < lines.length) {
    const quoted = QUOTE_RE.exec(lines[i])
    if (quoted) {
      const content = quoted[1].trim()
      if (content) current.push(content)
      else if (current.length) {
        paragraphs.push(current.join(' '))
        current = []
      }
      i++
      continue
    }
    if (lines[i].trim() && current.length && !startsBlock(lines, i)) {
      current.push(lines[i].trim()) // lazy continuation
      i++
      continue
    }
    break
  }
  if (current.length) paragraphs.push(current.join(' '))
  return {
    block: { type: 'blockquote', paragraphs: paragraphs.map((paragraph) => parseInline(paragraph)) },
    next: i,
  }
}

/**
 * Parse an Academy article body into blocks. Pure: no I/O, no React, CRLF-safe.
 * @param {string} body
 * @returns {Array<object>} Block[]
 */
export function parseMarkdown(body) {
  const source = String(body == null ? '' : body).replace(/\r\n?/g, '\n')
  const lines = source.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    const heading = HEADING_RE.exec(line.trim())
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, children: parseInline(heading[2].trim()) })
      i++
      continue
    }

    if (isTableStart(lines, i)) {
      const { block, next } = parseTable(lines, i)
      blocks.push(block)
      i = next
      continue
    }

    if (QUOTE_RE.test(line)) {
      const { block, next } = parseBlockquote(lines, i)
      blocks.push(block)
      i = next
      continue
    }

    if (HR_RE.test(line)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    if (UNORDERED_RE.test(line) || ORDERED_RE.test(line)) {
      const { block, next } = parseList(lines, i)
      blocks.push(block)
      i = next
      continue
    }

    const paragraph = []
    while (i < lines.length && lines[i].trim() && !startsBlock(lines, i)) {
      paragraph.push(lines[i].trim())
      i++
    }
    if (!paragraph.length) {
      // Defensive: never loop forever on an unrecognised line.
      paragraph.push(line.trim())
      i++
    }
    blocks.push({ type: 'paragraph', children: parseInline(paragraph.join(' ')) })
  }

  return blocks
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function renderInline(nodes, onTerm, keyPrefix) {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    switch (node.type) {
      case 'strong':
        return h('strong', { key }, ...renderInline(node.children, onTerm, key))
      case 'em':
        return h('em', { key, className: 'of-md-em' }, ...renderInline(node.children, onTerm, key))
      case 'code':
        return h('code', { key, className: 'of-md-code' }, node.value)
      case 'term':
        return h(
          'button',
          {
            key,
            className: 'of-term-ref',
            type: 'button',
            'data-term': node.id,
            onClick: () => onTerm && onTerm(node.id),
          },
          node.text,
        )
      case 'link':
        return h(
          'a',
          { key, className: 'of-md-link', href: node.href, target: '_blank', rel: 'noreferrer' },
          ...renderInline(node.children, onTerm, key),
        )
      case 'text':
      default:
        return node.value != null ? String(node.value) : ''
    }
  })
}

/**
 * Map a parsed Block[] to React elements. Exported so views can memoise
 * `parseMarkdown(body)` and re-render cheaply.
 */
export function renderBlocks(blocks, { onTerm } = {}) {
  return blocks.map((block, index) => {
    const key = `md-${index}`
    switch (block.type) {
      case 'heading': {
        const level = block.level === 3 ? 3 : 2
        return h(
          level === 3 ? 'h3' : 'h2',
          { key, className: level === 3 ? 'of-md-h3' : 'of-md-h2' },
          ...renderInline(block.children, onTerm, key),
        )
      }
      case 'paragraph':
        return h('p', { key, className: 'of-md-p' }, ...renderInline(block.children, onTerm, key))
      case 'hr':
        return h('hr', { key, className: 'of-md-hr' })
      case 'list': {
        const ordered = !!block.ordered
        return h(
          ordered ? 'ol' : 'ul',
          { key, className: ordered ? 'of-md-ol' : 'of-md-ul' },
          ...block.items.map((item, itemIndex) => {
            const itemKey = `${key}-${itemIndex}`
            return h('li', { key: itemKey, className: 'of-md-li' }, ...renderInline(item, onTerm, itemKey))
          }),
        )
      }
      case 'blockquote':
        return h(
          'blockquote',
          { key, className: 'of-md-quote' },
          ...block.paragraphs.map((paragraph, paragraphIndex) => {
            const paragraphKey = `${key}-${paragraphIndex}`
            return h('p', { key: paragraphKey, className: 'of-md-p' }, ...renderInline(paragraph, onTerm, paragraphKey))
          }),
        )
      case 'table':
        return h(
          'div',
          { key, className: 'of-md-table-wrap' },
          h(
            'table',
            { className: 'of-md-table' },
            h(
              'thead',
              null,
              h(
                'tr',
                null,
                ...block.header.map((cell, cellIndex) => {
                  const cellKey = `${key}-h${cellIndex}`
                  return h(
                    'th',
                    { key: cellKey, className: 'of-md-th', scope: 'col' },
                    ...renderInline(cell, onTerm, cellKey),
                  )
                }),
              ),
            ),
            h(
              'tbody',
              null,
              ...block.rows.map((row, rowIndex) =>
                h(
                  'tr',
                  { key: `${key}-r${rowIndex}` },
                  ...row.map((cell, cellIndex) => {
                    const cellKey = `${key}-r${rowIndex}c${cellIndex}`
                    return h('td', { key: cellKey, className: 'of-md-td' }, ...renderInline(cell, onTerm, cellKey))
                  }),
                ),
              ),
            ),
          ),
        )
      default:
        return h('p', { key, className: 'of-md-p' }, String(block && block.text != null ? block.text : ''))
    }
  })
}

/**
 * Render an Academy article body to an array of React elements.
 * @param {string} body markdown source
 * @param {{ onTerm?: (termId: string) => void }} [options]
 * @returns {Array<import('react').ReactElement>}
 */
export function renderMarkdown(body, { onTerm } = {}) {
  return renderBlocks(parseMarkdown(body), { onTerm })
}
