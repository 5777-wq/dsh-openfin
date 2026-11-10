// Markdown parser + renderer tests for dsh-openfin Academy bodies.
//
// `client/src/md.js` imports `createElement` from 'react', and the plugin does
// not ship React (the Web shell provides it at runtime). Tests therefore install
// a tiny React stub through node:module's synchronous hooks — no node_modules
// react, no network, no DOM. The parser itself is pure and would need no stub.
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'react') return { url: 'stub:react', shortCircuit: true }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url === 'stub:react') {
      return {
        format: 'module',
        source: 'export const createElement = (type, props, ...children) => ({ type, props: props || {}, children })',
        shortCircuit: true,
      }
    }
    return nextLoad(url, context)
  },
})

const { parseMarkdown, renderBlocks, renderMarkdown } = await import('../client/src/md.js')

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DATA = join(ROOT, 'data')

const index = JSON.parse(await readFile(join(DATA, 'academy', 'index.json'), 'utf8'))
const glossary = JSON.parse(await readFile(join(DATA, 'glossary.json'), 'utf8'))
const articles = new Map()
for (const card of index.articles) {
  articles.set(card.id, JSON.parse(await readFile(join(DATA, 'academy', 'articles', `${card.id}.json`), 'utf8')))
}

/* ------------------------------------------------------------------ */
/* AST helpers                                                         */
/* ------------------------------------------------------------------ */

function blockInlineGroups(block) {
  const groups = []
  if (block.children) groups.push(block.children)
  if (block.items) groups.push(...block.items)
  if (block.paragraphs) groups.push(...block.paragraphs)
  if (block.header) groups.push(...block.header)
  if (block.rows) for (const row of block.rows) groups.push(...row)
  return groups
}

function walkInline(nodes, visit) {
  for (const node of nodes) {
    visit(node)
    if (node.children) walkInline(node.children, visit)
  }
}

function inlineCounts(blocks) {
  const counts = {}
  for (const block of blocks) {
    for (const group of blockInlineGroups(block)) {
      walkInline(group, (node) => {
        counts[node.type] = (counts[node.type] || 0) + 1
      })
    }
  }
  return counts
}

function inlineText(nodes) {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.value
      if (node.type === 'code') return node.value
      if (node.type === 'term') return node.text
      return inlineText(node.children || [])
    })
    .join('')
}

function paragraphsOf(blocks) {
  return blocks.filter((block) => block.type === 'paragraph').map((block) => inlineText(block.children))
}

/* ------------------------------------------------------------------ */
/* Element helpers (React stub elements are { type, props, children }) */
/* ------------------------------------------------------------------ */

function walkElements(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walkElements(item, visit)
    return
  }
  if (!value || typeof value !== 'object' || value.type === undefined) return
  visit(value)
  walkElements(value.children, visit)
}

function findAll(elements, predicate) {
  const found = []
  walkElements(elements, (element) => {
    if (predicate(element)) found.push(element)
  })
  return found
}

function byClass(name) {
  return (element) => element.props && element.props.className === name
}

function byType(type) {
  return (element) => element.type === type
}

/** Strip function props (click handlers) so two renders compare structurally. */
function normalizeElements(value) {
  if (Array.isArray(value)) return value.map(normalizeElements)
  if (!value || typeof value !== 'object' || value.type === undefined) return value
  const props = {}
  for (const [key, propValue] of Object.entries(value.props || {})) {
    if (typeof propValue !== 'function') props[key] = propValue
  }
  return { type: value.type, props, children: normalizeElements(value.children) }
}

/* ------------------------------------------------------------------ */
/* Parser: real article corpus                                         */
/* ------------------------------------------------------------------ */

test('parseMarkdown parses all 25 committed article bodies into supported blocks', () => {
  assert.equal(index.articles.length, 25)
  const totals = {}
  const supportedBlocks = new Set(['heading', 'paragraph', 'list', 'blockquote', 'table', 'hr'])
  const supportedInlines = new Set(['text', 'strong', 'em', 'code', 'link', 'term'])

  for (const card of index.articles) {
    const article = articles.get(card.id)
    assert.ok(article, `article file for ${card.id}`)
    const blocks = parseMarkdown(article.body)
    assert.ok(Array.isArray(blocks), `${card.id}: blocks array`)
    assert.ok(blocks.length > 0, `${card.id}: non-empty body produces blocks`)

    for (const block of blocks) {
      totals[block.type] = (totals[block.type] || 0) + 1
      assert.ok(supportedBlocks.has(block.type), `${card.id}: supported block type ${block.type}`)
      if (block.type === 'heading') {
        assert.ok(block.level === 2 || block.level === 3, `${card.id}: heading level 2|3`)
      }
      if (block.type === 'list') {
        assert.equal(typeof block.ordered, 'boolean')
        assert.ok(block.items.length > 0)
      }
      if (block.type === 'blockquote') assert.ok(block.paragraphs.length > 0)
      if (block.type === 'table') {
        assert.ok(block.header.length > 0)
        for (const row of block.rows) assert.equal(row.length, block.header.length, `${card.id}: table row width`)
      }
    }

    for (const group of blocks.flatMap(blockInlineGroups)) {
      walkInline(group, (node) => {
        assert.ok(supportedInlines.has(node.type), `${card.id}: supported inline type ${node.type}`)
        if (node.type === 'text' || node.type === 'code') assert.equal(typeof node.value, 'string')
        if (node.type === 'term') {
          assert.ok(node.id.length > 0)
          assert.equal(typeof node.text, 'string')
        }
        if (node.type === 'link') {
          assert.match(node.href, /^(https?:|mailto:)/i)
          assert.ok(node.children.length > 0)
        }
      })
    }
  }

  // Exact corpus totals: they prove every construct class is detected. They
  // change only when the committed Academy content is regenerated.
  assert.deepEqual(totals, {
    heading: 155, // 144 x h2 + 11 x h3
    paragraph: 452, // upstream paragraphs; 13 footer dividers were standalone, 12 hugged the disclaimer line
    list: 55,
    blockquote: 29,
    table: 13,
    hr: 25, // one upstream source-footer divider per article
  })
  const inlines = inlineCounts(index.articles.flatMap((card) => parseMarkdown(articles.get(card.id).body)))
  assert.equal(inlines.term, 46, 'glossary refs detected')
  assert.equal(inlines.strong, 611, 'bold runs detected')
  assert.equal(inlines.em, 25, 'one italic source-footer disclaimer per article')
  assert.equal(inlines.link || 0, 0, 'all corpus links are internal (#/series/…) and degrade to text')
  assert.equal(inlines.code || 0, 0)
})

test('canonical article: gold parses headings, bold, terms, blockquote and a table', () => {
  const blocks = parseMarkdown(articles.get('gold').body)

  assert.deepEqual(blocks[0], {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', value: '一句话' }],
  })

  const headings = blocks.filter((block) => block.type === 'heading')
  assert.ok(headings.length >= 7, `gold has ${headings.length} headings`)
  assert.ok(headings.some((heading) => heading.level === 3) === false, 'gold uses only h2')

  const paragraphs = paragraphsOf(blocks)
  assert.ok(paragraphs.some((text) => text.includes('共识')), 'paragraph text preserved')

  // The first paragraph references [[gold|黄金]].
  const firstParagraph = blocks.find((block) => block.type === 'paragraph')
  const term = firstParagraph.children.find((node) => node.type === 'term')
  assert.deepEqual(term, { type: 'term', id: 'gold', text: '黄金' })

  // **它的支撑不是现金流，而是共识** -> strong inline nodes exist in the body.
  const strongNodes = []
  for (const block of blocks) {
    for (const group of blockInlineGroups(block)) {
      walkInline(group, (node) => {
        if (node.type === 'strong') strongNodes.push(node)
      })
    }
  }
  assert.ok(strongNodes.length >= 5, `gold has ${strongNodes.length} bold runs`)

  const quote = blocks.find((block) => block.type === 'blockquote')
  assert.ok(quote, 'gold has a blockquote')
  assert.ok(inlineText(quote.paragraphs[0]).includes('规律'), 'blockquote text preserved')
  assert.ok(inlineText(quote.paragraphs[0]).includes('流动性危机'))

  const table = blocks.find((block) => block.type === 'table')
  assert.ok(table, 'gold has a comparison table')
  assert.deepEqual(
    table.header.map((cell) => inlineText(cell)),
    ['', '实物金条', '黄金ETF'],
  )
  assert.equal(table.rows.length, 6, 'six comparison rows')
  assert.deepEqual(
    table.rows.map((row) => inlineText(row[0])),
    ['存放成本', '买卖价差', '起点金额', '存储风险', '收益来源', '能不能随时变现'],
  )
  assert.equal(inlineText(table.rows[0][1]), '高（保险、保管）')
})

test('table cells: term refs containing "|" are not split into extra columns', () => {
  const blocks = parseMarkdown(articles.get('reading-reports').body)
  const table = blocks.find((block) => block.type === 'table')
  assert.ok(table)
  assert.deepEqual(
    table.header.map((cell) => inlineText(cell)),
    ['表', '回答的问题', '像什么'],
  )
  assert.equal(table.rows.length, 3)
  assert.deepEqual(
    table.rows.map((row) => row[0].find((node) => node.type === 'term')),
    [
      { type: 'term', id: 'income-statement', text: '利润表' },
      { type: 'term', id: 'balance-sheet', text: '资产负债表' },
      { type: 'term', id: 'cash-flow-statement', text: '现金流量表' },
    ],
  )
  for (const row of table.rows) assert.equal(row.length, 3)
})

test('nested ordered list under a bullet degrades into its own top-level list', () => {
  const blocks = parseMarkdown(articles.get('reading-reports').body)
  const orderedLists = blocks.filter((block) => block.type === 'list' && block.ordered)
  const numbered = orderedLists.find((list) => list.items.length === 5)
  assert.ok(numbered, 'five-step ordered list survives')
  assert.match(inlineText(numbered.items[0]), /^主要会计数据/)
  assert.match(inlineText(numbered.items[4]), /分红/)
  // The parent bullet list is still intact before it.
  const bulletLists = blocks.filter((block) => block.type === 'list' && !block.ordered)
  assert.ok(bulletLists.some((list) => list.items.length === 2))
})

test('blockquote gathers consecutive > lines and keeps paragraphs', () => {
  const blocks = parseMarkdown(articles.get('2008').body)
  const quotes = blocks.filter((block) => block.type === 'blockquote')
  assert.ok(quotes.length >= 1, '2008 has blockquotes')
  for (const quote of quotes) {
    assert.ok(quote.paragraphs.length >= 1)
    for (const paragraph of quote.paragraphs) {
      assert.ok(paragraph.length > 0)
      assert.ok(!inlineText(paragraph).startsWith('>'), 'quote marker removed')
    }
  }

  const synthetic = parseMarkdown('> first line\n> second line\n\n> second paragraph')
  assert.deepEqual(synthetic, [
    { type: 'blockquote', paragraphs: [[{ type: 'text', value: 'first line second line' }]] },
    { type: 'blockquote', paragraphs: [[{ type: 'text', value: 'second paragraph' }]] },
  ])
})

/* ------------------------------------------------------------------ */
/* Parser: constructs, degradation, robustness                         */
/* ------------------------------------------------------------------ */

test('empty, whitespace-only and null bodies parse to no blocks', () => {
  assert.deepEqual(parseMarkdown(''), [])
  assert.deepEqual(parseMarkdown('   \n\n\t\n'), [])
  assert.deepEqual(parseMarkdown(null), [])
  assert.deepEqual(parseMarkdown(undefined), [])
  assert.deepEqual(renderMarkdown(''), [])
})

test('CRLF bodies parse exactly like LF bodies', () => {
  for (const id of ['gold', '2008', 'reading-reports', 'money-jar']) {
    const body = articles.get(id).body
    assert.deepEqual(parseMarkdown(body.replace(/\n/g, '\r\n')), parseMarkdown(body))
    // Lone CR line endings too.
    assert.deepEqual(parseMarkdown(body.replace(/\n/g, '\r')), parseMarkdown(body))
  }
})

test('## and ### headings become headings; # and #### degrade to paragraphs', () => {
  const blocks = parseMarkdown('## 二级\n\n### 三级\n\n# 一级\n\n#### 四级')
  assert.deepEqual(
    blocks.map((block) => block.type),
    ['heading', 'heading', 'paragraph', 'paragraph'],
  )
  assert.deepEqual(
    blocks.filter((block) => block.type === 'heading').map((block) => block.level),
    [2, 3],
  )
  assert.deepEqual(paragraphsOf(blocks), ['# 一级', '#### 四级'])
})

test('--- lines become hr blocks (three or more dashes, optional spaces)', () => {
  assert.deepEqual(parseMarkdown('---'), [{ type: 'hr' }])
  assert.deepEqual(parseMarkdown('  ----  '), [{ type: 'hr' }])
  assert.deepEqual(parseMarkdown('- - -'), [{ type: 'hr' }])
  assert.deepEqual(parseMarkdown('--'), [{ type: 'paragraph', children: [{ type: 'text', value: '--' }] }])
  assert.deepEqual(parseMarkdown('--- 后面还有字'), [
    { type: 'paragraph', children: [{ type: 'text', value: '--- 后面还有字' }] },
  ])
  const blocks = parseMarkdown('前言\n\n---\n\n后记')
  assert.deepEqual(
    blocks.map((block) => block.type),
    ['paragraph', 'hr', 'paragraph'],
  )
})

test('*italic* becomes em; **bold** stays strong; math and unmatched stars stay literal', () => {
  const block = parseMarkdown('正文 *斜体* 与 **粗体** 和 `代码`').find((item) => item.type === 'paragraph')
  assert.deepEqual(block.children, [
    { type: 'text', value: '正文 ' },
    { type: 'em', children: [{ type: 'text', value: '斜体' }] },
    { type: 'text', value: ' 与 ' },
    { type: 'strong', children: [{ type: 'text', value: '粗体' }] },
    { type: 'text', value: ' 和 ' },
    { type: 'code', value: '代码' },
  ])

  // Emphasis can carry a glossary ref.
  assert.deepEqual(parseMarkdown('*见 [[etf|ETF]] 一节*')[0].children, [
    {
      type: 'em',
      children: [
        { type: 'text', value: '见 ' },
        { type: 'term', id: 'etf', text: 'ETF' },
        { type: 'text', value: ' 一节' },
      ],
    },
  ])

  // `2*3`-style multiplication is not emphasis; unmatched asterisks stay literal.
  for (const literal of ['2*3', '2*3*4', '*未闭合', '** 也不是粗体', '*空格结尾 *']) {
    assert.equal(inlineText(parseMarkdown(literal)[0].children), literal, literal)
  }
})

test('lists: unordered markers, ordered markers and continuation lines', () => {
  const blocks = parseMarkdown('- one\n- two\n\n1. first\n2. second\n\n3) third')
  assert.deepEqual(
    blocks.map((block) => (block.type === 'list' ? `list:${block.ordered}:${block.items.length}` : block.type)),
    ['list:false:2', 'list:true:2', 'list:true:1'],
  )

  const continuation = parseMarkdown('- a bullet that wraps\n  onto a second line\n- next')
  assert.deepEqual(continuation[0].items.map(inlineText), ['a bullet that wraps onto a second line', 'next'])
})

test('terminology refs parse into term nodes and resolve against the glossary', () => {
  const blocks = parseMarkdown('用 [[gold|黄金]] 对冲，而不是 [[etf|ETF]]。')
  const terms = []
  walkInline(blocks[0].children, (node) => {
    if (node.type === 'term') terms.push(node)
  })
  assert.deepEqual(terms, [
    { type: 'term', id: 'gold', text: '黄金' },
    { type: 'term', id: 'etf', text: 'ETF' },
  ])

  const glossaryIds = new Set(glossary.terms.map((term) => term.id))
  for (const card of index.articles) {
    for (const ref of articles.get(card.id).body.match(/\[\[([^\]|]+)\|([^\]]+)\]\]/g) || []) {
      const id = ref.slice(2, ref.indexOf('|'))
      assert.ok(glossaryIds.has(id), `${card.id}: term ref ${id} resolves`)
    }
  }
})

test('inline bold, code, external links and term refs compose', () => {
  const block = parseMarkdown('**加粗的 [[etf|ETF]]**、`ROE` 与 [官网](https://example.com/x)').find(
    (item) => item.type === 'paragraph',
  )
  assert.deepEqual(block.children, [
    { type: 'strong', children: [{ type: 'text', value: '加粗的 ' }, { type: 'term', id: 'etf', text: 'ETF' }] },
    { type: 'text', value: '、' },
    { type: 'code', value: 'ROE' },
    { type: 'text', value: ' 与 ' },
    {
      type: 'link',
      href: 'https://example.com/x',
      children: [{ type: 'text', value: '官网' }],
    },
  ])
})

test('unknown constructs degrade to text instead of crashing or injecting HTML', () => {
  const cases = [
    ['![图](https://example.com/x.png)', '图'],
    ['<b>html</b>', '<b>html</b>'],
    ['**未闭合', '**未闭合'],
    ['[[only-id]]', '[[only-id]]'],
    ['[内部](#/series/usNVDA)', '内部'],
    ['![no alt]()', 'no alt'],
    ['#### 四级', '#### 四级'],
  ]
  for (const [source, expected] of cases) {
    const blocks = parseMarkdown(source)
    assert.equal(blocks.length, 1, `${source}: one block`)
    assert.equal(blocks[0].type, 'paragraph')
    assert.equal(inlineText(blocks[0].children), expected, source)
  }
})

test('parseMarkdown is pure: same input, same AST', () => {
  const body = articles.get('2022').body
  assert.deepEqual(parseMarkdown(body), parseMarkdown(body))
})

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

const RICH_BODY = [
  '## 标题',
  '',
  '段落带 [[gold|黄金]]、**粗体**、`代码` 和 [链接](https://example.com/a)。',
  '',
  '### 小标题',
  '',
  '- 项目一',
  '- 项目二',
  '',
  '1. 第一',
  '2. 第二',
  '',
  '> 引用一段',
  '',
  '| 列 | 值 |',
  '|---|---|',
  '| A | [[etf|ETF]] |',
].join('\n')

test('renderMarkdown returns React elements with the agreed class contract', () => {
  const elements = renderMarkdown(RICH_BODY, { onTerm: () => {} })
  assert.ok(Array.isArray(elements))
  assert.equal(elements.length, 7)
  assert.deepEqual(
    elements.map((element) => element.type),
    ['h2', 'p', 'h3', 'ul', 'ol', 'blockquote', 'div'],
  )
  assert.deepEqual(
    elements.map((element) => element.props.className),
    ['of-md-h2', 'of-md-p', 'of-md-h3', 'of-md-ul', 'of-md-ol', 'of-md-quote', 'of-md-table-wrap'],
  )

  const ul = elements[3]
  assert.deepEqual(
    ul.children.map((li) => li.props.className),
    ['of-md-li', 'of-md-li'],
  )
  assert.equal(ul.children[0].props.key, 'md-3-0')

  const quote = elements[5]
  assert.equal(quote.children[0].type, 'p')
  assert.equal(quote.children[0].props.className, 'of-md-p')

  const wrapper = elements[6]
  const table = wrapper.children[0]
  assert.equal(table.type, 'table')
  assert.equal(table.props.className, 'of-md-table')
  const head = table.children[0]
  const body = table.children[1]
  assert.equal(head.type, 'thead')
  assert.equal(body.type, 'tbody')
  assert.equal(head.children[0].type, 'tr')
  assert.deepEqual(
    head.children[0].children.map((th) => th.props.className),
    ['of-md-th', 'of-md-th'],
  )
  assert.equal(head.children[0].children[0].props.scope, 'col')
  assert.equal(body.children[0].children[0].props.className, 'of-md-td')

  // Inline classes.
  const code = findAll(elements, byType('code'))
  assert.equal(code.length, 1)
  assert.equal(code[0].props.className, 'of-md-code')
  assert.equal(code[0].children[0], '代码')

  const link = findAll(elements, byType('a'))
  assert.equal(link.length, 1)
  assert.equal(link[0].props.className, 'of-md-link')
  assert.equal(link[0].props.href, 'https://example.com/a')
  assert.equal(link[0].props.target, '_blank')
  assert.equal(link[0].props.rel, 'noreferrer')

  const strong = findAll(elements, byType('strong'))
  assert.equal(strong.length, 1)
  assert.deepEqual(strong[0].children, ['粗体'])
})

test('renderMarkdown renders hr.of-md-hr and em.of-md-em for source footers', () => {
  const elements = renderMarkdown('正文\n\n---\n\n*免责声明，不构成投资建议。*')
  assert.deepEqual(
    elements.map((element) => element.type),
    ['p', 'hr', 'p'],
  )
  assert.equal(elements[1].props.className, 'of-md-hr')
  const footer = elements[2]
  assert.equal(footer.children.length, 1)
  assert.equal(footer.children[0].type, 'em')
  assert.equal(footer.children[0].props.className, 'of-md-em')
  assert.deepEqual(footer.children[0].children, ['免责声明，不构成投资建议。'])
})

test('term refs render as button.of-term-ref with data-term and onTerm click', () => {
  const clicked = []
  const elements = renderMarkdown(RICH_BODY, { onTerm: (id) => clicked.push(id) })
  const buttons = findAll(elements, byType('button'))

  assert.equal(buttons.length, 2, 'gold + etf refs')
  assert.equal(buttons[0].props.className, 'of-term-ref')
  assert.equal(buttons[0].props.type, 'button')
  assert.equal(buttons[0].props['data-term'], 'gold')
  assert.deepEqual(buttons[0].children, ['黄金'])
  assert.equal(buttons[1].props['data-term'], 'etf')

  buttons[0].props.onClick()
  buttons[1].props.onClick()
  assert.deepEqual(clicked, ['gold', 'etf'])

  // Still safe when the view passes no handler.
  const bare = renderMarkdown('[[gold|黄金]]')
  const bareButton = findAll(bare, byType('button'))[0]
  assert.doesNotThrow(() => bareButton.props.onClick())
})

test('renderMarkdown never uses dangerouslySetInnerHTML', async () => {
  const allElements = []
  for (const card of index.articles) {
    walkElements(renderMarkdown(articles.get(card.id).body, { onTerm: () => {} }), (element) => allElements.push(element))
  }
  assert.ok(allElements.length > 900, `sanity: rendered ${allElements.length} elements`)
  for (const element of allElements) {
    assert.ok(!('dangerouslySetInnerHTML' in element.props), `${element.type} corrupts via HTML`)
    assert.ok(typeof element.type === 'string', 'host elements only')
    assert.ok(!['script', 'style', 'iframe', 'object', 'embed'].includes(element.type))
  }
  const source = await readFile(join(ROOT, 'client', 'src', 'md.js'), 'utf8')
  assert.ok(!source.includes('dangerouslySetInnerHTML'))
  assert.ok(!/\.innerHTML\s*=/.test(source))
})

test('renderBlocks maps a pre-parsed AST (memo-friendly) and keeps keys unique per level', () => {
  const blocks = parseMarkdown(RICH_BODY)
  const rendered = renderBlocks(blocks, { onTerm: () => {} })
  assert.equal(rendered.length, blocks.length)
  assert.deepEqual(normalizeElements(rendered), normalizeElements(renderMarkdown(RICH_BODY, { onTerm: () => {} })))
  for (const element of rendered) {
    assert.equal(typeof element.props.key, 'string')
    assert.ok(element.props.key.length > 0)
  }
  const keys = rendered.map((element) => element.props.key)
  assert.equal(new Set(keys).size, keys.length)
})

test('real corpus renders one top-level element per block and keeps term buttons', () => {
  let buttons = 0
  for (const card of index.articles) {
    const body = articles.get(card.id).body
    const blocks = parseMarkdown(body)
    const elements = renderMarkdown(body, { onTerm: () => {} })
    assert.equal(elements.length, blocks.length, `${card.id}: one element per block`)
    buttons += findAll(elements, byType('button')).length
  }
  assert.equal(buttons, 46, 'every glossary ref becomes a term button')
})

test('every article renders its upstream footer as one hr block + one em disclaimer', () => {
  let hrCount = 0
  let emCount = 0
  for (const card of index.articles) {
    const body = articles.get(card.id).body
    const blocks = parseMarkdown(body)
    assert.equal(blocks.filter((block) => block.type === 'hr').length, 1, `${card.id}: one hr`)
    assert.equal(blocks[blocks.length - 2].type, 'hr', `${card.id}: hr sits right before the footer`)
    assert.equal(blocks[blocks.length - 1].type, 'paragraph', `${card.id}: footer paragraph is last`)

    const emNodes = []
    walkInline(blocks[blocks.length - 1].children, (node) => {
      if (node.type === 'em') emNodes.push(node)
    })
    assert.equal(emNodes.length, 1, `${card.id}: one em in the footer`)
    assert.match(inlineText(emNodes), /不构成投资建议/, `${card.id}: disclaimer wording`)

    const elements = renderMarkdown(body, { onTerm: () => {} })
    const hrs = findAll(elements, byType('hr'))
    const ems = findAll(elements, byType('em'))
    assert.equal(hrs.length, 1, `${card.id}: renders one hr`)
    assert.equal(ems.length, 1, `${card.id}: renders one em`)
    for (const hr of hrs) assert.equal(hr.props.className, 'of-md-hr')
    for (const em of ems) assert.equal(em.props.className, 'of-md-em')
    hrCount += hrs.length
    emCount += ems.length
  }
  assert.equal(hrCount, 25, 'hr per article')
  assert.equal(emCount, 25, 'em per article')
})
