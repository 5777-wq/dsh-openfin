/**
 * Squarified treemap layout (Bruls, Huizing & van Wijk, 2000).
 *
 * Pure geometry: no DOM, no colors. `items` are sorted by weight internally so
 * callers can pass boards in any order; each result rect is in the same
 * coordinate space as `box` and non-overlapping by construction.
 */
export function squarify(items, box) {
  const rects = []
  if (!Array.isArray(items) || items.length === 0) return rects
  const width = Math.max(0, box.width)
  const height = Math.max(0, box.height)
  if (!width || !height) return rects

  const entries = items
    .filter((item) => item && Number.isFinite(item.weight) && item.weight > 0)
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .map((item) => ({ item, area: item.weight }))
  const total = entries.reduce((sum, entry) => sum + entry.area, 0)
  if (!total) return rects

  const scale = (width * height) / total
  for (const entry of entries) entry.area *= scale

  let x = box.x
  let y = box.y
  let w = width
  let h = height
  let index = 0

  while (index < entries.length) {
    const side = Math.min(w, h)
    if (side <= 0) break
    const row = []
    let previousRatio = Infinity
    while (index < entries.length) {
      const candidate = row.concat(entries[index])
      const ratio = worstRatio(candidate, side)
      if (ratio > previousRatio && row.length > 0) break
      previousRatio = ratio
      row.push(entries[index])
      index += 1
    }
    if (row.length === 0) break
    const rowArea = row.reduce((sum, entry) => sum + entry.area, 0)
    const thickness = side > 0 ? rowArea / side : 0

    if (w >= h) {
      let cursor = y
      for (const entry of row) {
        const cellHeight = rowArea > 0 ? (entry.area / rowArea) * h : 0
        rects.push({ item: entry.item, x, y: cursor, w: thickness, h: cellHeight })
        cursor += cellHeight
      }
      x += thickness
      w -= thickness
    } else {
      let cursor = x
      for (const entry of row) {
        const cellWidth = rowArea > 0 ? (entry.area / rowArea) * w : 0
        rects.push({ item: entry.item, x: cursor, y, w: cellWidth, h: thickness })
        cursor += cellWidth
      }
      y += thickness
      h -= thickness
    }
  }

  return rects
}

function worstRatio(row, side) {
  if (side <= 0) return Infinity
  let sum = 0
  let max = 0
  let min = Infinity
  for (const entry of row) {
    sum += entry.area
    if (entry.area > max) max = entry.area
    if (entry.area < min) min = entry.area
  }
  if (sum <= 0 || min === Infinity || min <= 0) return Infinity
  const sideSquared = side * side
  const sumSquared = sum * sum
  return Math.max((sideSquared * max) / sumSquared, sumSquared / (sideSquared * min))
}
