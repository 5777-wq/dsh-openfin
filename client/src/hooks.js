import { createElement as h, useEffect, useRef, useState } from 'react'

/** Tween a number toward a new value; skipped under reduced motion. */
export function useCountUp(value, duration = 420) {
  const [display, setDisplay] = useState(value)
  const current = useRef(value)

  useEffect(() => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      current.current = value
      setDisplay(value)
      return undefined
    }
    const from = typeof current.current === 'number' && Number.isFinite(current.current) ? current.current : value
    if (from === value) return undefined
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      current.current = value
      setDisplay(value)
      return undefined
    }
    const started = performance.now()
    let frame = 0
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (value - from) * eased
      current.current = next
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else {
        current.current = value
        setDisplay(value)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return display
}

/** Observe a CSS media query. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** A ticking clock for "updated Ns ago" style labels. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
