/**
 * DSH embed adapter for the vendored OpenFinLens terminal.
 *
 * The plugin serves the original OpenFinLens app from `/dsh-openfin/lens/` and
 * opens it with `?embed=1&theme=<daylight|nexus>`. This file runs before the
 * app's own scripts and does the only two things embedding needs:
 *
 *   1. put the requested theme into the app's own settings key before boot, so
 *      the first paint is already in the host's light/dark mode, and accept
 *      later `postMessage({ type: 'dsh-theme' })` updates;
 *   2. tell the parent frame when the app is ready (the DSH page shows a
 *      loading veil until then).
 *
 * Everything else — routing, data sources, keyboard shortcuts — stays exactly
 * the app's own behaviour.
 */
(function () {
  var params = new URLSearchParams(window.location.search)
  if (params.get('embed') !== '1') return

  var THEMES = ['nexus', 'daylight']
  var root = document.documentElement
  root.setAttribute('data-dsh-embed', '1')
  root.setAttribute('data-dsh-embed-origin', window.location.origin)

  /** The app persists settings as JSON under `gfd_settings` (see its Store). */
  function storeTheme(theme) {
    try {
      var raw = window.localStorage.getItem('gfd_settings')
      var settings = raw ? JSON.parse(raw) : {}
      if (!settings || typeof settings !== 'object') settings = {}
      settings.theme = theme
      window.localStorage.setItem('gfd_settings', JSON.stringify(settings))
    } catch (error) {
      /* private mode: the document attribute still applies this session */
    }
  }

  function paint(theme) {
    root.dataset.theme = theme
    root.style.colorScheme = theme === 'daylight' ? 'light' : 'dark'
  }

  var requested = params.get('theme')
  if (THEMES.indexOf(requested) >= 0) {
    paint(requested)
    storeTheme(requested)
  }

  window.addEventListener('message', function (event) {
    if (event.source !== window.parent) return
    var data = event.data
    if (!data || data.type !== 'dsh-theme' || THEMES.indexOf(data.theme) < 0) return
    storeTheme(data.theme)
    if (root.dataset.theme !== data.theme) {
      paint(data.theme)
      // The app redraws its canvas charts on resize; the CSS variables used by
      // the DOM side update immediately.
      window.dispatchEvent(new Event('resize'))
    }
  })

  function announce() {
    try {
      window.parent.postMessage({ type: 'dsh-lens-ready', title: document.title }, '*')
    } catch (error) {
      /* not embedded in a frame that listens */
    }
  }

  if (document.readyState === 'complete') announce()
  else window.addEventListener('load', announce, { once: true })
})()
