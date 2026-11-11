/**
 * Floating HUD renderer.
 *
 * Receives `{ config, snapshot, error, updatedAt }` from the main process and
 * paints the card. No network access, no node integration: the page is data
 * that arrives over IPC.
 */
const card = document.getElementById('card')
const title = document.getElementById('title')
const rows = document.getElementById('rows')
const status = document.getElementById('status')
const close = document.getElementById('close')

let state = { config: null, snapshot: null, error: '', updatedAt: 0 }

function formatPrice(value, digits) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  const places = Number.isFinite(digits) ? digits : 2
  return value.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places })
}

function formatPct(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return (value > 0 ? '+' : '') + value.toFixed(2) + '%'
}

function directionOf(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) < 1e-9) return 'flat'
  return value > 0 ? 'up' : 'down'
}

function formatClock(ms) {
  const date = new Date(typeof ms === 'number' ? ms : Date.now())
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function sparkNode(spark) {
  if (!Array.isArray(spark) || spark.length < 3) return null
  let min = Infinity
  let max = -Infinity
  for (const value of spark) {
    if (value < min) min = value
    if (value > max) max = value
  }
  const span = max - min || 1
  const points = spark
    .map((value, index) => {
      const x = (index / (spark.length - 1)) * 100
      const y = 100 - ((value - min) / span) * 92 - 4
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 100 100')
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.setAttribute('class', 'row-spark')
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
  line.setAttribute('points', points)
  line.setAttribute('fill', 'none')
  line.setAttribute('stroke', 'currentColor')
  line.setAttribute('stroke-width', '2')
  line.setAttribute('vector-effect', 'non-scaling-stroke')
  svg.appendChild(line)
  return svg
}

function render() {
  const config = state.config
  if (!config) return
  card.dataset.size = config.size || 'm'
  card.dataset.direction = config.direction === 'intl' ? 'intl' : 'cn'
  title.textContent = config.title || 'OpenFin'

  const quotes = state.snapshot && Array.isArray(state.snapshot.quotes) ? state.snapshot.quotes : []
  const byId = new Map(quotes.map((quote) => [quote.id, quote]))
  const selected = (config.symbols || []).map((id) => byId.get(id)).filter(Boolean)

  rows.replaceChildren()
  if (selected.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty'
    empty.textContent = state.error ? '行情暂不可用' : '等待行情…'
    rows.appendChild(empty)
  } else {
    for (const quote of selected) {
      const row = document.createElement('div')
      row.className = 'row'

      const name = document.createElement('span')
      name.className = 'row-name'
      name.textContent = quote.name || quote.id
      row.appendChild(name)

      if (config.showSpark !== false) {
        const spark = sparkNode(quote.spark)
        if (spark !== null) {
          spark.classList.add(directionOf(quote.pct))
          row.appendChild(spark)
        }
      }

      const value = document.createElement('span')
      value.className = 'row-value'
      value.textContent = formatPrice(quote.price, quote.digits)
      row.appendChild(value)

      const pct = document.createElement('span')
      pct.className = 'row-pct ' + directionOf(quote.pct)
      pct.textContent = formatPct(quote.pct)
      row.appendChild(pct)

      rows.appendChild(row)
    }
  }

  const stale = state.snapshot && state.snapshot.stale
  const updated = state.snapshot && state.snapshot.updatedAt
  status.textContent = updated ? `${stale ? '缓存 ' : ''}${formatClock(updated)}` : state.error || '等待行情…'
}

function apply(next) {
  state = {
    config: next.config || state.config,
    snapshot: next.snapshot || state.snapshot,
    error: next.error || '',
    updatedAt: next.updatedAt || 0,
  }
  render()
}

if (window.openfinHud) {
  window.openfinHud.onState(apply)
  window.openfinHud.ready()
}

close.addEventListener('click', (event) => {
  event.stopPropagation()
  if (window.openfinHud) window.openfinHud.close()
})

card.addEventListener('mouseenter', () => {
  if (window.openfinHud) window.openfinHud.hover(true)
})
card.addEventListener('mouseleave', () => {
  if (window.openfinHud) window.openfinHud.hover(false)
})
