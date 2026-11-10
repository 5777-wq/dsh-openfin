/**
 * Display formatters. Prices use tabular grouping; big CNY amounts switch to
 * 亿/万 because that is how the source data is read in Chinese finance.
 */

const PLACEHOLDER = '—'

export function fmtPrice(value, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return PLACEHOLDER
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function fmtPct(value, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return PLACEHOLDER
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(digits) + '%'
}

export function fmtChange(value, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return PLACEHOLDER
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(digits)
}

/** 123456789 -> '1.23亿'; 12345 -> '1.23万'. */
export function fmtCompact(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return PLACEHOLDER
  const abs = Math.abs(value)
  if (abs >= 1e12) return trim(value / 1e12) + '万亿'
  if (abs >= 1e8) return trim(value / 1e8) + '亿'
  if (abs >= 1e4) return trim(value / 1e4) + '万'
  return trim(value)
}

function trim(value) {
  const abs = Math.abs(value)
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2
  return value.toFixed(digits)
}

/** Milliseconds -> 'HH:MM:SS' in the viewer's local time. */
export function fmtClock(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return PLACEHOLDER
  const date = new Date(ms)
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** Milliseconds -> 'HH:MM'. */
export function fmtHourMinute(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return PLACEHOLDER
  const date = new Date(ms)
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** '2026-11-10 17:00:28' -> '17:00'; anything else passes through. */
export function fmtNewsTime(text) {
  if (typeof text !== 'string') return ''
  const match = /(\d{2}):(\d{2})/.exec(text)
  return match ? `${match[1]}:${match[2]}` : text
}

/** Semantic direction for colors; CSS flips up/down per locale direction. */
export function signClass(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) < 1e-9) return 'flat'
  return value > 0 ? 'up' : 'down'
}
