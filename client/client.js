/* dsh-openfin 0.3.0 — built by scripts/build-client.mjs. Do not edit. */
window.__ModuleLoader__.load({
  id: "dsh-openfin",
  factory(require) {
    const module = { exports: {} };
    const exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/src/main.js
var main_exports = {};
__export(main_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(main_exports);
var import_react23 = require("react");

// client/src/api.js
var import_react = require("react");
var API_BASE = "/dsh-openfin/api";
async function getJson(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    signal: options.signal,
    cache: options.cache ?? "no-store",
    headers: { accept: "application/json" }
  });
  let body;
  try {
    body = await response.json();
  } catch {
    body = void 0;
  }
  if (!response.ok) {
    const message = body && typeof body.error === "string" ? body.error : `HTTP ${response.status}`;
    throw new Error(message);
  }
  if (body === void 0) throw new Error("\u54CD\u5E94\u4E0D\u662F JSON");
  return body;
}
var getSnapshot = (signal) => getJson("/snapshot", { signal });
var getSector = (code, signal) => getJson("/sector?code=" + encodeURIComponent(code), { signal });
var getAcademy = (signal) => getJson("/academy", { signal, cache: "default" });
var getArticle = (id, signal) => getJson("/academy/article?id=" + encodeURIComponent(id), { signal, cache: "default" });
var getGlossary = (signal) => getJson("/glossary", { signal, cache: "default" });
async function postJson(path, body, options = {}) {
  const response = await fetch(API_BASE + path, {
    method: "POST",
    signal: options.signal,
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = void 0;
  }
  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}
var getHud = (signal) => getJson("/hud", { signal });
var postHud = (body, signal) => postJson("/hud", body, { signal });
async function searchInstruments(query, signal) {
  const text = String(query ?? "").trim();
  if (text === "") return { query: "", results: [] };
  return getJson("/hud/search?q=" + encodeURIComponent(text) + "&limit=8", { signal });
}
async function getHudQuotes(ids, signal) {
  const list = Array.isArray(ids) ? ids.join(",") : String(ids ?? "");
  return getJson("/hud/quotes?ids=" + encodeURIComponent(list), { signal });
}
function useResource(loader, deps = []) {
  const [state, setState] = (0, import_react.useState)({ loading: true, data: null, error: null });
  const [nonce, setNonce] = (0, import_react.useState)(0);
  const loaderRef = (0, import_react.useRef)(loader);
  loaderRef.current = loader;
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    let alive = true;
    setState((previous) => ({ loading: true, data: previous.data, error: null }));
    loaderRef.current(controller.signal).then(
      (data) => {
        if (alive) setState({ loading: false, data, error: null });
      },
      (error) => {
        if (!alive || error && error.name === "AbortError") return;
        setState((previous) => ({
          loading: false,
          data: previous.data,
          error: error && error.message || String(error)
        }));
      }
    );
    return () => {
      alive = false;
      controller.abort();
    };
  }, [...deps, nonce]);
  return { ...state, reload: () => setNonce((value) => value + 1) };
}

// client/src/theme.js
var CSS = String.raw`
.of-page {
  --of-brand: #0f8c93;
  --of-brand-deep: #0a5c64;
  --of-gold: #c79a3a;
  --of-ease: cubic-bezier(0.22, 0.8, 0.24, 1);
  --of-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --of-up: var(--dsw-alias-state-error-primary, #d93a3a);
  --of-down: var(--dsw-alias-state-success-primary, #1f9d63);
  --of-flat: var(--dsw-alias-label-secondary, #6b7280);
  --of-border: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.09));
  --of-border-strong: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.16));
  --of-surface: var(--dsw-alias-bg-layer-1, #fff);
  --of-surface-2: var(--dsw-alias-bg-layer-2, #f5f5f4);
  --of-text: var(--dsw-alias-label-primary, #1b1b1b);
  --of-text-2: var(--dsw-alias-label-secondary, #6b7280);
  --of-mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--dsw-alias-bg-base, #faf9f7);
  color: var(--of-text);
  font: inherit;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--of-text) 18%, transparent) transparent;
}
.of-page[data-direction="intl"] {
  --of-up: var(--dsw-alias-state-success-primary, #1f9d63);
  --of-down: var(--dsw-alias-state-error-primary, #d93a3a);
}
.of-page *,
.of-page *::before,
.of-page *::after { box-sizing: border-box; }
.of-page ::selection { background: color-mix(in srgb, var(--of-brand) 24%, transparent); }
.of-page ::-webkit-scrollbar { width: 10px; height: 10px; }
.of-page ::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--of-text) 16%, transparent);
  border: 3px solid transparent;
  border-radius: 99px;
  background-clip: content-box;
}
.of-page ::-webkit-scrollbar-thumb:hover { background-color: color-mix(in srgb, var(--of-text) 28%, transparent); }
.of-page :focus-visible { outline: 2px solid var(--of-brand); outline-offset: 2px; border-radius: 6px; }

.of-inner {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: calc(26px + var(--dsh-frame-top-clearance, 0px)) clamp(16px, 3.4vw, 40px) 72px;
}

/* ---------------------------------------------------------------- head */
.of-head { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.of-mark {
  flex: none;
  width: 40px; height: 40px;
  border-radius: 12px;
  display: grid; place-items: center;
  background: linear-gradient(148deg, #14989f 0%, #0b6a72 58%, #0a535b 100%);
  box-shadow: 0 8px 20px -12px color-mix(in srgb, var(--of-brand-deep) 90%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.22);
  color: #f6f4ec;
}
.of-titles { flex: 1; min-width: 0; }
.of-title { margin: 0; font-size: 22px; line-height: 1.2; font-weight: 650; letter-spacing: -0.015em; }
.of-sub { margin-top: 3px; font-size: 12.5px; color: var(--of-text-2); }
.of-head-actions { display: flex; align-items: center; gap: 10px; }

/* ---------------------------------------------------------------- tabs */
.of-tabs {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 3px;
  border: 0.5px solid var(--of-border);
  border-radius: 11px;
  background: var(--of-surface-2);
}
.of-tab {
  appearance: none; border: 0; background: transparent; color: var(--of-text-2);
  font: inherit; font-size: 12.5px; line-height: 1; font-weight: 500;
  padding: 7px 13px; border-radius: 8px; cursor: pointer;
  transition: color 0.18s var(--of-ease), background-color 0.18s var(--of-ease), box-shadow 0.22s var(--of-ease);
  white-space: nowrap;
}
.of-tab:hover { color: var(--of-text); }
.of-tab[aria-selected="true"] {
  color: var(--of-text);
  background: var(--of-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.07), 0 0 0 0.5px var(--of-border);
}
.of-tab:active { transform: scale(0.98); }

/* ------------------------------------------------------------- buttons */
.of-btn {
  appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: 0.5px solid var(--of-border); background: var(--of-surface); color: var(--of-text);
  font: inherit; font-size: 12.5px; font-weight: 500; line-height: 1;
  padding: 8px 12px; border-radius: 9px; cursor: pointer;
  transition: background-color 0.16s var(--of-ease), border-color 0.16s var(--of-ease), transform 0.12s var(--of-ease);
}
.of-btn:hover { background: var(--of-surface-2); border-color: var(--of-border-strong); }
.of-btn:active { transform: scale(0.97); }
.of-icon-btn {
  appearance: none; display: inline-grid; place-items: center;
  width: 32px; height: 32px; padding: 0;
  border: 0.5px solid var(--of-border); border-radius: 9px;
  background: var(--of-surface); color: var(--of-text-2); cursor: pointer;
  transition: color 0.16s var(--of-ease), background-color 0.16s var(--of-ease), transform 0.12s var(--of-ease);
}
.of-icon-btn:hover { color: var(--of-text); background: var(--of-surface-2); }
.of-icon-btn:active { transform: scale(0.94); }
.of-icon-btn[data-busy="true"] svg { animation: of-spin 0.9s linear infinite; }

/* ------------------------------------------------------------- layout */
.of-section { margin-top: 22px; }
.of-section:first-child { margin-top: 0; }
.of-section-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.of-section-title {
  display: inline-flex; align-items: center; gap: 8px;
  margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
}
.of-section-title::before {
  content: ""; width: 3px; height: 12px; border-radius: 2px; background: var(--of-brand);
}
.of-section-hint { font-size: 11px; color: var(--of-text-2); }
.of-grid { display: grid; gap: 12px; }
.of-grid-quotes { grid-template-columns: repeat(auto-fill, minmax(146px, 1fr)); }
.of-grid-main { grid-template-columns: minmax(0, 1fr) 318px; align-items: start; }
.of-card {
  background: var(--of-surface);
  border: 0.5px solid var(--of-border);
  border-radius: 14px;
}
.of-pad { padding: 14px; }
.of-rail { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

/* -------------------------------------------------------------- quotes */
.of-quote {
  position: relative;
  padding: 12px 13px 22px;
  border-radius: 13px;
  background: var(--of-surface);
  border: 0.5px solid var(--of-border);
  overflow: hidden;
  transition: transform 0.22s var(--of-ease), border-color 0.22s var(--of-ease),
              box-shadow 0.28s var(--of-ease);
}
.of-quote:hover {
  transform: translateY(-1px);
  border-color: var(--of-border-strong);
  box-shadow: 0 10px 26px -20px rgba(0, 0, 0, 0.55);
}
.of-quote-name {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
  font-size: 11.5px; color: var(--of-text-2); white-space: nowrap;
}
.of-quote-dot { width: 5px; height: 5px; border-radius: 50%; flex: none; opacity: 0.9; }
.of-quote-price {
  margin-top: 7px;
  font-size: 19px; font-weight: 620; letter-spacing: -0.012em;
  font-variant-numeric: tabular-nums; line-height: 1.15;
}
.of-quote-change {
  margin-top: 2px;
  display: inline-flex; align-items: baseline; gap: 7px;
  font-size: 11.5px; font-variant-numeric: tabular-nums;
}
.of-quote-spark { position: absolute; left: 0; right: 0; bottom: 0; height: 26px; pointer-events: none; }
.of-quote-spark path { vector-effect: non-scaling-stroke; }
.of-quote-flash { animation: of-flash 0.7s var(--of-ease); }
.of-up { color: var(--of-up); }
.of-down { color: var(--of-down); }
.of-flat { color: var(--of-flat); }
.of-pill { border-radius: 6px; padding: 1px 6px; font-size: 11px; font-variant-numeric: tabular-nums; }
.of-pill.of-up { background: color-mix(in srgb, var(--of-up) 12%, transparent); }
.of-pill.of-down { background: color-mix(in srgb, var(--of-down) 12%, transparent); }
.of-pill.of-flat { background: color-mix(in srgb, var(--of-flat) 12%, transparent); }

/* ------------------------------------------------------------ heatmap */
.of-heat-card { overflow: hidden; }
.of-heat-top { display: flex; align-items: center; gap: 12px; padding: 12px 14px 10px; }
.of-heat-top .of-section-title { margin-right: auto; }
.of-heat-breadth { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--of-text-2); }
.of-breadth-bar {
  display: flex; width: 92px; height: 6px; border-radius: 99px; overflow: hidden;
  background: var(--of-surface-2);
}
.of-breadth-up { background: var(--of-up); opacity: 0.85; }
.of-breadth-flat { background: var(--of-flat); opacity: 0.45; }
.of-breadth-down { background: var(--of-down); opacity: 0.85; }
.of-heat {
  position: relative;
  height: 426px;
  margin: 0 10px 6px;
  border-radius: 11px;
  background: var(--of-surface-2);
  overflow: hidden;
}
.of-heat-cell {
  position: absolute;
  padding: 5px 7px;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  color: #fff;
  transition: background-color 0.55s var(--of-ease), transform 0.18s var(--of-ease),
              box-shadow 0.2s var(--of-ease), filter 0.2s var(--of-ease);
  will-change: background-color;
  contain: layout paint;
}
.of-heat-cell[data-pale="true"] { color: var(--of-text); }
.of-heat-cell::after {
  content: ""; position: absolute; inset: 0; border-radius: 3px;
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.16);
  pointer-events: none;
}
.of-heat-cell:hover, .of-heat-cell[data-active="true"] {
  transform: scale(1.018);
  z-index: 3;
  box-shadow: 0 10px 24px -14px rgba(0, 0, 0, 0.6);
  filter: saturate(1.08) brightness(1.03);
}
.of-heat-label {
  font-size: 10.5px; line-height: 1.25; font-weight: 500;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; text-overflow: ellipsis; word-break: break-all;
}
.of-heat-pct { margin-top: 2px; font-size: 10px; opacity: 0.92; font-variant-numeric: tabular-nums; }
.of-heat-tip {
  position: absolute; z-index: 6; pointer-events: none;
  padding: 8px 10px; border-radius: 10px;
  background: var(--dsw-alias-bg-overlay, var(--of-surface));
  border: 0.5px solid var(--of-border-strong);
  box-shadow: 0 18px 44px -24px rgba(0, 0, 0, 0.7);
  transform: translate(-50%, -108%);
  min-width: 112px;
  transition: opacity 0.12s linear;
}
.of-heat-tip-name { font-size: 12px; font-weight: 600; }
.of-heat-tip-row {
  display: flex; justify-content: space-between; gap: 14px;
  font-size: 11px; color: var(--of-text-2); margin-top: 3px;
  font-variant-numeric: tabular-nums;
}
.of-heat-legend {
  display: flex; align-items: center; gap: 6px;
  padding: 0 14px 12px; font-size: 10.5px; color: var(--of-text-2);
  font-variant-numeric: tabular-nums;
}
.of-legend-ramp {
  flex: none; width: 120px; height: 6px; border-radius: 99px;
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--of-down) 78%, var(--of-surface-2)) 0%,
    color-mix(in srgb, var(--of-surface-2) 88%, transparent) 50%,
    color-mix(in srgb, var(--of-up) 78%, var(--of-surface-2)) 100%);
}

/* sector detail expands inside the heatmap card */
.of-sector {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows 0.34s var(--of-ease);
  border-top: 0.5px solid transparent;
}
.of-sector[data-open="true"] { grid-template-rows: 1fr; border-top-color: var(--of-border); }
.of-sector-inner { overflow: hidden; min-height: 0; }
.of-sector-pad { padding: 12px 14px 14px; }
.of-sector-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.of-sector-name { font-size: 13px; font-weight: 600; }
.of-sector-stocks { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 4px 8px; }
.of-stock {
  display: flex; align-items: baseline; gap: 6px;
  padding: 5px 7px; border-radius: 7px; min-width: 0;
  transition: background-color 0.14s var(--of-ease);
}
.of-stock:hover { background: var(--of-surface-2); }
.of-stock-name { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.of-stock-code { font-size: 10px; color: var(--of-text-2); font-family: var(--of-mono); }
.of-stock-pct { margin-left: auto; font-size: 11.5px; font-variant-numeric: tabular-nums; }

/* -------------------------------------------------------------- movers */
.of-movers-tabs { display: flex; gap: 4px; padding: 0 10px 6px; }
.of-movers-tab {
  appearance: none; border: 0; background: transparent; color: var(--of-text-2);
  font: inherit; font-size: 11.5px; padding: 4px 7px; border-radius: 7px; cursor: pointer;
  transition: color 0.15s var(--of-ease), background-color 0.15s var(--of-ease);
}
.of-movers-tab:hover { color: var(--of-text); background: var(--of-surface-2); }
.of-movers-tab[aria-selected="true"] { color: var(--of-text); background: var(--of-surface-2); font-weight: 600; }
.of-movers { display: flex; flex-direction: column; padding: 0 8px 8px; }
.of-mover {
  display: grid; grid-template-columns: 16px minmax(0, 1fr) auto;
  align-items: center; gap: 8px;
  padding: 6px 7px; border-radius: 8px;
  transition: background-color 0.14s var(--of-ease);
}
.of-mover:hover { background: var(--of-surface-2); }
.of-mover-rank {
  font-size: 10.5px; color: var(--of-text-2); text-align: right;
  font-variant-numeric: tabular-nums;
}
.of-mover-name {
  font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.of-mover-code {
  margin-left: 6px; font-size: 10px; color: var(--of-text-2);
  font-family: var(--of-mono);
}
.of-mover-pct { font-size: 12px; font-variant-numeric: tabular-nums; }

/* ---------------------------------------------------------------- news */
.of-news { display: flex; flex-direction: column; padding: 2px 14px 8px; }
.of-news-item {
  display: block; padding: 8px 0; text-decoration: none; color: inherit;
  border-bottom: 0.5px solid var(--of-border);
  transition: opacity 0.15s var(--of-ease);
}
.of-news-item:last-child { border-bottom: 0; }
.of-news-item:hover { opacity: 0.72; }
.of-news-time {
  font-size: 10.5px; color: var(--of-text-2); font-variant-numeric: tabular-nums;
  font-family: var(--of-mono);
}
.of-news-title {
  margin-top: 3px; font-size: 12.8px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* --------------------------------------------------------------- chips */
.of-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 8px; border-radius: 99px;
  border: 0.5px solid var(--of-border); background: var(--of-surface-2);
  font-size: 10.5px; color: var(--of-text-2); white-space: nowrap;
}
.of-chip[data-tone="brand"] {
  color: var(--of-brand);
  border-color: color-mix(in srgb, var(--of-brand) 32%, transparent);
  background: color-mix(in srgb, var(--of-brand) 8%, transparent);
}
.of-tag {
  display: inline-flex; align-items: center;
  padding: 2px 7px; border-radius: 6px;
  background: color-mix(in srgb, var(--of-brand) 9%, transparent);
  color: var(--of-brand); font-size: 10.5px; font-weight: 500; white-space: nowrap;
}

/* ------------------------------------------------------------ skeletons */
.of-skeleton {
  position: relative; overflow: hidden; border-radius: 8px;
  background: var(--of-surface-2);
}
.of-skeleton::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent,
    color-mix(in srgb, var(--of-text) 6%, transparent), transparent);
  animation: of-shimmer 1.5s var(--of-ease) infinite;
}
.of-skeleton-line { height: 10px; border-radius: 5px; }

/* --------------------------------------------------------- empty/error */
.of-empty, .of-error {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 34px 18px; text-align: center;
  color: var(--of-text-2); font-size: 12.5px;
}
.of-error-title { color: var(--of-text); font-size: 13px; font-weight: 600; }
.of-empty-icon { opacity: 0.5; }

/* ------------------------------------------------------------- academy */
.of-academy { display: flex; flex-direction: column; gap: 14px; }
.of-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.of-search {
  position: relative; display: flex; align-items: center; flex: 1; min-width: 180px;
}
.of-search-icon {
  position: absolute; left: 10px; display: grid; place-items: center;
  color: var(--of-text-2); pointer-events: none;
}
.of-search-input {
  width: 100%; padding: 8px 12px 8px 32px;
  border: 0.5px solid var(--of-border); border-radius: 9px;
  background: var(--of-surface); color: var(--of-text);
  font: inherit; font-size: 12.5px; outline: none;
  transition: border-color 0.16s var(--of-ease), box-shadow 0.16s var(--of-ease);
}
.of-search-input::placeholder { color: var(--of-text-2); }
.of-search-input:focus {
  border-color: color-mix(in srgb, var(--of-brand) 55%, var(--of-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--of-brand) 12%, transparent);
}
.of-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.of-filter {
  appearance: none; border: 0.5px solid var(--of-border); background: transparent;
  color: var(--of-text-2); font: inherit; font-size: 11.5px;
  padding: 5px 10px; border-radius: 99px; cursor: pointer;
  transition: color 0.16s var(--of-ease), background-color 0.16s var(--of-ease), border-color 0.16s var(--of-ease);
}
.of-filter:hover { color: var(--of-text); background: var(--of-surface-2); }
.of-filter-active {
  color: var(--of-brand);
  background: color-mix(in srgb, var(--of-brand) 9%, transparent);
  border-color: color-mix(in srgb, var(--of-brand) 34%, transparent);
}
.of-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(258px, 1fr)); gap: 12px; }
.of-acard {
  display: flex; flex-direction: column; gap: 7px;
  padding: 15px 16px 13px; border-radius: 14px;
  background: var(--of-surface); border: 0.5px solid var(--of-border);
  cursor: pointer; text-align: left; font: inherit; color: inherit;
  transition: transform 0.22s var(--of-ease), border-color 0.22s var(--of-ease),
              box-shadow 0.26s var(--of-ease);
}
.of-acard:hover {
  transform: translateY(-2px);
  border-color: var(--of-border-strong);
  box-shadow: 0 14px 34px -26px rgba(0, 0, 0, 0.6);
}
.of-acard:active { transform: translateY(0) scale(0.995); }
.of-acard-title { font-size: 15px; line-height: 1.42; font-weight: 620; letter-spacing: -0.008em; }
.of-acard-dek {
  font-size: 12.3px; line-height: 1.62; color: var(--of-text-2);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.of-acard-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; flex-wrap: wrap; }
.of-meta { font-size: 10.5px; color: var(--of-text-2); font-variant-numeric: tabular-nums; }
.of-dots { display: inline-flex; gap: 2px; align-items: center; }
.of-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--of-border-strong); }
.of-dot-on { background: var(--of-brand); }

/* ------------------------------------------------------------- article */
.of-article { max-width: 768px; margin: 0 auto; animation: of-fade-up 0.4s var(--of-ease) both; }
.of-article-back {
  appearance: none; border: 0; background: transparent; color: var(--of-text-2);
  font: inherit; font-size: 12px; padding: 4px 6px 4px 0; margin-bottom: 10px;
  cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
  transition: color 0.15s var(--of-ease), transform 0.15s var(--of-ease);
}
.of-article-back:hover { color: var(--of-text); transform: translateX(-2px); }
.of-article-title { margin: 0; font-size: 27px; line-height: 1.32; font-weight: 650; letter-spacing: -0.02em; }
.of-article-dek { margin-top: 10px; font-size: 13.5px; line-height: 1.68; color: var(--of-text-2); }
.of-article-meta { display: flex; align-items: center; gap: 10px; margin: 12px 0 4px; flex-wrap: wrap; }
.of-article-body { margin-top: 18px; font-size: 14.5px; line-height: 1.86; }
.of-points {
  margin: 16px 0 0; padding: 12px 15px; border-radius: 12px;
  background: var(--of-surface-2); border: 0.5px solid var(--of-border);
  display: flex; flex-direction: column; gap: 6px;
}
.of-point { display: flex; gap: 8px; font-size: 12.5px; line-height: 1.6; color: var(--of-text); }
.of-point::before { content: ""; flex: none; width: 4px; height: 4px; border-radius: 50%; background: var(--of-brand); margin-top: 8px; }
.of-related { margin-top: 26px; padding-top: 14px; border-top: 0.5px solid var(--of-border); }
.of-related-link {
  appearance: none; border: 0; background: transparent; font: inherit; text-align: left;
  color: var(--of-brand); font-size: 12.5px; padding: 4px 0; cursor: pointer; display: block;
}
.of-related-link:hover { text-decoration: underline; text-underline-offset: 3px; }

/* markdown */
.of-md-h2 { font-size: 18px; line-height: 1.5; font-weight: 640; margin: 28px 0 10px; letter-spacing: -0.01em; }
.of-md-h3 { font-size: 15px; line-height: 1.5; font-weight: 620; margin: 22px 0 8px; }
.of-md-p { margin: 10px 0; }
.of-md-ul, .of-md-ol { margin: 10px 0; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
.of-md-ul { list-style: disc; }
.of-md-ol { list-style: decimal; }
.of-md-list { margin: 10px 0; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
.of-md-list[data-ordered="true"] { list-style: decimal; }
.of-md-list[data-ordered="false"] { list-style: disc; }
.of-md-li { line-height: 1.78; }
.of-md-quote {
  margin: 14px 0; padding: 10px 14px;
  border-left: 3px solid color-mix(in srgb, var(--of-brand) 55%, transparent);
  background: color-mix(in srgb, var(--of-brand) 6%, transparent);
  border-radius: 0 10px 10px 0; color: var(--of-text);
}
.of-md-quote .of-md-p { margin: 4px 0; }
.of-md-table-wrap { margin: 14px 0; overflow-x: auto; border: 0.5px solid var(--of-border); border-radius: 10px; }
.of-md-table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
.of-md-th {
  text-align: left; font-weight: 600; padding: 8px 10px;
  background: var(--of-surface-2); white-space: nowrap;
}
.of-md-td { padding: 8px 10px; border-top: 0.5px solid var(--of-border); }
.of-md-code {
  font-family: var(--of-mono); font-size: 0.88em;
  padding: 1px 5px; border-radius: 5px; background: var(--of-surface-2);
}
.of-md-hr { border: 0; border-top: 0.5px solid var(--of-border); margin: 26px 0 14px; }
.of-md-em { font-style: italic; color: var(--of-text-2); }
.of-md-link { color: var(--of-brand); text-decoration: none; border-bottom: 1px dashed color-mix(in srgb, var(--of-brand) 45%, transparent); }
.of-md-link:hover { border-bottom-style: solid; }
.of-term-ref {
  appearance: none; border: 0; background: transparent; padding: 0 1px;
  font: inherit; color: var(--of-brand); cursor: help;
  border-bottom: 1px dotted color-mix(in srgb, var(--of-brand) 60%, transparent);
}
.of-term-ref:hover { border-bottom-style: solid; }

/* ------------------------------------------------------------- glossary */
.of-gloss { display: flex; flex-direction: column; gap: 14px; }
.of-daily {
  display: flex; gap: 16px; align-items: flex-start;
  padding: 16px 18px; border-radius: 14px;
  background:
    radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--of-brand) 10%, transparent) 0%, transparent 58%),
    var(--of-surface);
  border: 0.5px solid var(--of-border);
}
.of-daily-term { font-size: 18px; font-weight: 650; letter-spacing: -0.01em; }
.of-daily-one { margin-top: 5px; font-size: 13px; line-height: 1.66; color: var(--of-text-2); max-width: 62ch; }
.of-gloss-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.of-gcard {
  display: flex; flex-direction: column; gap: 5px;
  padding: 12px 14px; border-radius: 12px; text-align: left;
  background: var(--of-surface); border: 0.5px solid var(--of-border);
  font: inherit; color: inherit; cursor: pointer;
  transition: border-color 0.18s var(--of-ease), background-color 0.18s var(--of-ease),
              transform 0.18s var(--of-ease), box-shadow 0.22s var(--of-ease);
}
.of-gcard:hover { border-color: var(--of-border-strong); transform: translateY(-1px); box-shadow: 0 10px 24px -22px rgba(0, 0, 0, 0.6); }
.of-gcard[data-open="true"] { border-color: color-mix(in srgb, var(--of-brand) 36%, var(--of-border)); }
.of-gcard-term { font-size: 13px; font-weight: 600; display: flex; align-items: baseline; gap: 7px; }
.of-gcard-alias { font-size: 10.5px; color: var(--of-text-2); font-weight: 400; }
.of-gcard-one { font-size: 11.8px; line-height: 1.6; color: var(--of-text-2); }
.of-gcard-detail {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s var(--of-ease);
}
.of-gcard[data-open="true"] .of-gcard-detail { grid-template-rows: 1fr; }
.of-gcard-detail-inner { overflow: hidden; min-height: 0; }
.of-gcard-label {
  font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--of-brand); margin-top: 8px;
}
.of-gcard-text { font-size: 11.8px; line-height: 1.62; color: var(--of-text); margin-top: 2px; }

/* ------------------------------------------------------------------ foot */
.of-foot {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-top: 26px; padding-top: 12px;
  border-top: 0.5px solid var(--of-border);
  font-size: 10.5px; color: var(--of-text-2);
}
.of-foot-meta { display: inline-flex; align-items: center; gap: 6px; font-variant-numeric: tabular-nums; }
.of-foot a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.of-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 1px 6px; border-radius: 5px;
  background: color-mix(in srgb, var(--of-gold) 16%, transparent);
  color: color-mix(in srgb, var(--of-gold) 78%, var(--of-text));
  font-size: 9.5px; font-variant-numeric: tabular-nums;
}
.of-live-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--of-down);
  animation: of-pulse 2.4s var(--of-ease) infinite;
}
.of-live-dot[data-stale="true"] { background: var(--of-gold); animation: none; }

/* --------------------------------------------------------------- motion */
.of-fade-in { animation: of-fade-up 0.42s var(--of-ease) backwards; }
.of-stagger {
  animation: of-fade-up 0.46s var(--of-ease) backwards;
  animation-delay: calc(var(--i, 0) * 26ms);
}
@keyframes of-fade-up {
  from { opacity: 0; transform: translateY(7px); }
  to { opacity: 1; transform: none; }
}
@keyframes of-shimmer { 100% { transform: translateX(100%); } }
@keyframes of-spin { to { transform: rotate(360deg); } }
@keyframes of-flash {
  0% { background-color: color-mix(in srgb, var(--of-brand) 10%, transparent); }
  100% { background-color: transparent; }
}
@keyframes of-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.35); }
}

/* ---------------------------------------------------------- responsive */
@media (max-width: 1080px) {
  .of-grid-main { grid-template-columns: minmax(0, 1fr); }
  .of-rail { flex-direction: row; flex-wrap: wrap; }
  .of-rail > * { flex: 1 1 290px; }
}
@media (max-width: 720px) {
  .of-head { flex-wrap: wrap; }
  .of-head-actions { width: 100%; justify-content: space-between; }
  .of-title { font-size: 19px; }
  .of-heat { height: 340px; }
  .of-article-title { font-size: 22px; }
  .of-quote-price { font-size: 17px; }
}

@media (prefers-reduced-motion: reduce) {
  .of-page *, .of-page *::before, .of-page *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;

// client/src/generated-locales.js
var en = {
  "meta.title": "OpenFin market and academy",
  "meta.description": "A-share and global quotes, an industry heatmap, market news, a plain-language finance academy and glossary, plus a draggable, translucent market HUD with searchable custom instruments and a boss key, as native DeepSeek Harness surfaces.",
  "meta.direction": "intl",
  "nav": "OpenFin",
  "title": "OpenFin",
  "subtitle": "Markets and plain-language finance, one page.",
  "tab.market": "Markets",
  "tab.academy": "Academy",
  "tab.glossary": "Glossary",
  "refresh": "Refresh quotes",
  "loading": "Loading\u2026",
  "retry": "Retry",
  "error.title": "Market data is unavailable",
  "error.body": "The upstream feed did not answer; this retries automatically.",
  "empty": "Nothing here yet",
  "partial": "Partial data",
  "stale": "Cached data",
  "market.indices": "Global markets",
  "market.indicesHint": "A-shares \xB7 Hong Kong \xB7 US \xB7 Commodities \xB7 Crypto",
  "market.partialBody": "The upstream feed did not answer; retrying automatically.",
  "market.heatmap": "A-share industry heatmap",
  "market.heatmapHint": "Area = market cap \xB7 Color = change",
  "market.breadth": "Sectors up / down",
  "market.movers": "Movers",
  "market.gainers": "Gainers",
  "market.losers": "Losers",
  "market.active": "Turnover",
  "market.news": "Market news",
  "market.newsHint": "Eastmoney",
  "market.tooltipChange": "Change",
  "market.tooltipPrice": "Level",
  "market.tooltipCap": "Market cap",
  "market.sector": "Constituents",
  "market.sectorHint": "Constituents are sorted by turnover; informational only.",
  "market.sectorEmpty": "No constituent data for this sector yet",
  "market.closeSector": "Close sector",
  "market.updated": "Updated",
  "market.disclaimer": "For information only, not investment advice",
  "academy.title": "Plain-language finance academy",
  "academy.search": "Search articles, topics or keywords",
  "academy.searchEmpty": "No matching articles",
  "academy.empty": "The academy content is being prepared",
  "academy.readMinutes": "{n} min read",
  "academy.difficulty": "Level {n}",
  "academy.dataAsOf": "Data as of {date}",
  "academy.back": "Back to academy",
  "academy.related": "Related reading",
  "academy.points": "Key points",
  "academy.all": "All",
  "glossary.title": "Finance glossary",
  "glossary.search": "Search terms",
  "glossary.empty": "No matching terms",
  "glossary.one": "In one line",
  "glossary.metaphor": "Metaphor",
  "glossary.number": "One number",
  "glossary.pit": "Common pitfall",
  "glossary.daily": "Term of the day",
  "glossary.terms": "All terms",
  "glossary.expand": "Expand",
  "glossary.collapse": "Collapse",
  "a11y.loading": "Loading",
  "a11y.refresh": "Refresh",
  "hud.title": "Floating quotes",
  "hud.inline": "Show the in-page HUD",
  "hud.inlineHint": "A small draggable quote card that floats inside DeepSeek Harness.",
  "hud.desktop": "Desktop HUD",
  "hud.desktopHint": "An always-on-top window outside the app. Needs an Electron runtime on this machine.",
  "hud.desktopOn": "Running",
  "hud.desktopOff": "Stopped",
  "hud.desktopUnavailable": "Electron runtime not found",
  "hud.recenter": "Recenter",
  "hud.symbols": "Instruments",
  "hud.symbolsHint": "Choose 1\u20136 instruments for the card.",
  "hud.opacity": "Opacity",
  "hud.idleOpacity": "Idle opacity",
  "hud.idleAfter": "Fade out after",
  "hud.idleOff": "Never",
  "hud.hoverFull": "Full opacity on hover",
  "hud.size": "Size",
  "hud.sizeS": "S",
  "hud.sizeM": "M",
  "hud.sizeL": "L",
  "hud.spark": "Mini sparklines",
  "hud.titleLabel": "Card title",
  "hud.resetPosition": "Reset position",
  "hud.positionHint": "Drag the card to move it; the default is the bottom-right corner.",
  "hud.collapsedHint": "Expand the quote card",
  "hud.expand": "Expand",
  "hud.collapse": "Collapse",
  "hud.settings": "Floating HUD settings",
  "hud.close": "Close",
  "hud.openDashboard": "Open the OpenFin page",
  "hud.updated": "Updated",
  "hud.disclaimer": "Informational only",
  "hud.waiting": "Waiting for quotes",
  "hud.error": "Quote feed unavailable",
  "hud.saved": "Changes save automatically",
  "hud.searchPlaceholder": "Search stocks / codes",
  "hud.searchHint": "Server-side search; pick a stock to pin it to the card.",
  "hud.searchEmpty": "No matching instruments",
  "hud.searching": "Searching\u2026",
  "hud.custom": "Custom",
  "hud.remove": "Remove",
  "hud.add": "Add",
  "hud.selectedCount": "Selected",
  "hud.market": "Market",
  "hud.customLimit": "Up to 6 instruments in total.",
  "hud.panic": "Boss key",
  "hud.panicHint": "Press it once to hide the floating card instantly; the same combo brings it back.",
  "hud.panicNow": "Hide now",
  "hud.panicShortcut": "Shortcut",
  "hud.panicOff": "Off"
};
var zh = {
  "meta.title": "OpenFin \u91D1\u878D\u770B\u677F",
  "meta.description": "A\u80A1\u4E0E\u5168\u7403\u884C\u60C5\u3001\u884C\u4E1A\u70ED\u529B\u56FE\u3001\u8D22\u7ECF\u5FEB\u8BAF\u3001\u767D\u8BDD\u91D1\u878D\u5B66\u9662\u4E0E\u8BCD\u5178\uFF0C\u5916\u52A0\u53EF\u62D6\u52A8\u3001\u53EF\u8C03\u900F\u660E\u5EA6\u3001\u53EF\u81EA\u9009\u4EFB\u610F\u6807\u7684\u7684\u60AC\u6D6E\u884C\u60C5\u7A97\u4E0E\u9632\u8001\u677F\u5FEB\u6377\u952E\uFF0C\u4F5C\u4E3A DeepSeek Harness \u7684\u539F\u751F\u9875\u9762\u4E0E\u684C\u9762\u5C0F\u7EC4\u4EF6\u3002",
  "meta.direction": "cn",
  "nav": "OpenFin",
  "title": "OpenFin",
  "subtitle": "\u884C\u60C5\u4E0E\u767D\u8BDD\u91D1\u878D\uFF0C\u4E00\u9875\u8BFB\u5B8C\u3002",
  "tab.market": "\u884C\u60C5",
  "tab.academy": "\u5B66\u9662",
  "tab.glossary": "\u8BCD\u5178",
  "refresh": "\u5237\u65B0\u884C\u60C5",
  "loading": "\u6B63\u5728\u52A0\u8F7D\u2026",
  "retry": "\u91CD\u8BD5",
  "error.title": "\u6570\u636E\u6682\u65F6\u53D6\u4E0D\u5230\u4E86",
  "error.body": "\u4E0A\u6E38\u63A5\u53E3\u6CA1\u6709\u8FD4\u56DE\u6570\u636E\uFF0C\u7A0D\u540E\u4F1A\u81EA\u52A8\u91CD\u8BD5\u3002",
  "empty": "\u6682\u65E0\u6570\u636E",
  "partial": "\u90E8\u5206\u6570\u636E\u5EF6\u8FDF",
  "stale": "\u7F13\u5B58\u6570\u636E",
  "market.indices": "\u5168\u7403\u884C\u60C5",
  "market.indicesHint": "A\u80A1 \xB7 \u6E2F\u80A1 \xB7 \u7F8E\u80A1 \xB7 \u5546\u54C1 \xB7 \u52A0\u5BC6",
  "market.partialBody": "\u4E0A\u6E38\u63A5\u53E3\u6CA1\u6709\u8FD4\u56DE\u884C\u60C5\uFF0C\u7A0D\u540E\u81EA\u52A8\u91CD\u8BD5\u3002",
  "market.heatmap": "A\u80A1\u884C\u4E1A\u70ED\u529B\u56FE",
  "market.heatmapHint": "\u9762\u79EF=\u603B\u5E02\u503C \xB7 \u989C\u8272=\u6DA8\u8DCC\u5E45",
  "market.breadth": "\u677F\u5757\u6DA8\u8DCC\u5BB6\u6570",
  "market.movers": "\u5F02\u52A8\u699C",
  "market.gainers": "\u6DA8\u5E45",
  "market.losers": "\u8DCC\u5E45",
  "market.active": "\u6210\u4EA4\u989D",
  "market.news": "\u8D22\u7ECF\u5FEB\u8BAF",
  "market.newsHint": "\u4E1C\u65B9\u8D22\u5BCC",
  "market.tooltipChange": "\u6DA8\u8DCC",
  "market.tooltipPrice": "\u70B9\u4F4D",
  "market.tooltipCap": "\u603B\u5E02\u503C",
  "market.sector": "\u677F\u5757\u6210\u5206\u80A1",
  "market.sectorHint": "\u6210\u5206\u80A1\u6309\u6210\u4EA4\u989D\u6392\u5E8F\uFF0C\u4EC5\u4F9B\u89C2\u5BDF\u3002",
  "market.sectorEmpty": "\u8FD9\u4E2A\u677F\u5757\u6682\u65F6\u6CA1\u6709\u6210\u5206\u80A1\u6570\u636E",
  "market.closeSector": "\u5173\u95ED\u677F\u5757",
  "market.updated": "\u66F4\u65B0\u4E8E",
  "market.disclaimer": "\u6570\u636E\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u6784\u6210\u6295\u8D44\u5EFA\u8BAE",
  "academy.title": "\u767D\u8BDD\u91D1\u878D\u5B66\u9662",
  "academy.search": "\u641C\u7D22\u6587\u7AE0\u3001\u4E3B\u9898\u6216\u5173\u952E\u8BCD",
  "academy.searchEmpty": "\u6CA1\u6709\u5339\u914D\u7684\u6587\u7AE0",
  "academy.empty": "\u5B66\u9662\u5185\u5BB9\u8FD8\u5728\u51C6\u5907\u4E2D",
  "academy.readMinutes": "{n} \u5206\u949F",
  "academy.difficulty": "\u96BE\u5EA6 {n}",
  "academy.dataAsOf": "\u6570\u636E\u622A\u81F3 {date}",
  "academy.back": "\u8FD4\u56DE\u5B66\u9662",
  "academy.related": "\u76F8\u5173\u9605\u8BFB",
  "academy.points": "\u8BB0\u4F4F\u8FD9\u51E0\u70B9",
  "academy.all": "\u5168\u90E8",
  "glossary.title": "\u91D1\u878D\u8BCD\u5178",
  "glossary.search": "\u641C\u7D22\u8BCD\u6761",
  "glossary.empty": "\u6CA1\u6709\u5339\u914D\u7684\u8BCD\u6761",
  "glossary.one": "\u4E00\u53E5\u8BDD",
  "glossary.metaphor": "\u6253\u4E2A\u6BD4\u65B9",
  "glossary.number": "\u4E00\u4E2A\u6570\u5B57",
  "glossary.pit": "\u5BB9\u6613\u8E29\u7684\u5751",
  "glossary.daily": "\u4ECA\u65E5\u4E00\u8BCD",
  "glossary.terms": "\u5168\u90E8\u8BCD\u6761",
  "glossary.expand": "\u5C55\u5F00",
  "glossary.collapse": "\u6536\u8D77",
  "a11y.loading": "\u6B63\u5728\u52A0\u8F7D",
  "a11y.refresh": "\u5237\u65B0",
  "hud.title": "\u60AC\u6D6E\u884C\u60C5",
  "hud.inline": "\u9875\u9762\u5185\u60AC\u6D6E\u5361",
  "hud.inlineHint": "\u5728 DeepSeek Harness \u7A97\u53E3\u4E0A\u5C42\u663E\u793A\u4E00\u5F20\u53EF\u62D6\u52A8\u7684\u884C\u60C5\u5C0F\u5361\u3002",
  "hud.desktop": "\u684C\u9762\u60AC\u6D6E\u7A97",
  "hud.desktopHint": "\u5728\u5E94\u7528\u4E4B\u5916\u7F6E\u9876\u663E\u793A\uFF0C\u9700\u8981\u672C\u673A\u6709 Electron \u8FD0\u884C\u65F6\u3002",
  "hud.desktopOn": "\u8FD0\u884C\u4E2D",
  "hud.desktopOff": "\u672A\u8FD0\u884C",
  "hud.desktopUnavailable": "\u672A\u627E\u5230 Electron \u8FD0\u884C\u65F6",
  "hud.recenter": "\u56DE\u5230\u9ED8\u8BA4\u4F4D\u7F6E",
  "hud.symbols": "\u663E\u793A\u7684\u54C1\u79CD",
  "hud.symbolsHint": "\u9009 1\u20136 \u4E2A\u54C1\u79CD\u653E\u8FDB\u5C0F\u5361\u91CC\u3002",
  "hud.opacity": "\u4E0D\u900F\u660E\u5EA6",
  "hud.idleOpacity": "\u95F2\u7F6E\u4E0D\u900F\u660E\u5EA6",
  "hud.idleAfter": "\u95F2\u7F6E\u6DE1\u51FA",
  "hud.idleOff": "\u4E0D\u6DE1\u51FA",
  "hud.hoverFull": "\u60AC\u505C\u65F6\u6062\u590D\u5168\u4E0D\u900F\u660E",
  "hud.size": "\u5C3A\u5BF8",
  "hud.sizeS": "\u5C0F",
  "hud.sizeM": "\u4E2D",
  "hud.sizeL": "\u5927",
  "hud.spark": "\u8FF7\u4F60\u8D70\u52BF\u7EBF",
  "hud.titleLabel": "\u5361\u7247\u6807\u9898",
  "hud.resetPosition": "\u91CD\u7F6E\u4F4D\u7F6E",
  "hud.positionHint": "\u62D6\u52A8\u5361\u7247\u5373\u53EF\u6446\u653E\uFF0C\u9ED8\u8BA4\u5728\u53F3\u4E0B\u89D2\u3002",
  "hud.collapsedHint": "\u5C55\u5F00\u884C\u60C5\u5C0F\u5361",
  "hud.expand": "\u5C55\u5F00",
  "hud.collapse": "\u6536\u8D77",
  "hud.settings": "\u60AC\u6D6E\u884C\u60C5\u8BBE\u7F6E",
  "hud.close": "\u5173\u95ED",
  "hud.openDashboard": "\u6253\u5F00 OpenFin \u9875\u9762",
  "hud.updated": "\u66F4\u65B0\u4E8E",
  "hud.disclaimer": "\u4EC5\u4F9B\u53C2\u8003",
  "hud.waiting": "\u7B49\u5F85\u884C\u60C5\u6570\u636E",
  "hud.error": "\u884C\u60C5\u6682\u65F6\u53D6\u4E0D\u5230",
  "hud.saved": "\u8BBE\u7F6E\u4F1A\u81EA\u52A8\u4FDD\u5B58",
  "hud.searchPlaceholder": "\u641C\u7D22\u80A1\u7968 / \u4EE3\u7801",
  "hud.searchHint": "\u670D\u52A1\u7AEF\u641C\u7D22\uFF0C\u9009\u4E2D\u540E\u628A\u8BE5\u6807\u7684\u56FA\u5B9A\u5230\u5C0F\u5361\u4E0A\u3002",
  "hud.searchEmpty": "\u6CA1\u6709\u5339\u914D\u7684\u6807\u7684",
  "hud.searching": "\u641C\u7D22\u4E2D\u2026",
  "hud.custom": "\u81EA\u5B9A\u4E49",
  "hud.remove": "\u79FB\u9664",
  "hud.add": "\u6DFB\u52A0",
  "hud.selectedCount": "\u5DF2\u9009",
  "hud.market": "\u5E02\u573A",
  "hud.customLimit": "\u6700\u591A\u540C\u65F6\u663E\u793A 6 \u4E2A\u6807\u7684\u3002",
  "hud.panic": "\u8001\u677F\u952E",
  "hud.panicHint": "\u6309\u4E00\u6B21\u7ACB\u5373\u9690\u85CF\u60AC\u6D6E\u5361\uFF0C\u518D\u6309\u4E00\u6B21\u6062\u590D\u663E\u793A\u3002",
  "hud.panicNow": "\u7ACB\u5373\u9690\u85CF",
  "hud.panicShortcut": "\u5FEB\u6377\u952E",
  "hud.panicOff": "\u5173\u95ED"
};

// client/src/components/Icon.js
var import_react2 = require("react");
var GLYPHS = {
  refresh: (strokeWidth) => (0, import_react2.createElement)(
    "g",
    null,
    (0, import_react2.createElement)("path", { d: "M20.4 12a8.4 8.4 0 1 1-2.6-6.05", strokeWidth }),
    (0, import_react2.createElement)("path", { d: "M20.4 3.6v4.8h-4.8", strokeWidth })
  ),
  search: (strokeWidth) => (0, import_react2.createElement)(
    "g",
    null,
    (0, import_react2.createElement)("circle", { cx: 10.8, cy: 10.8, r: 6.4, strokeWidth }),
    (0, import_react2.createElement)("path", { d: "m15.6 15.6 4.2 4.2", strokeWidth })
  ),
  close: (strokeWidth) => (0, import_react2.createElement)("path", { d: "M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6", strokeWidth }),
  back: (strokeWidth) => (0, import_react2.createElement)("path", { d: "M14.6 5.4 8 12l6.6 6.6", strokeWidth }),
  external: (strokeWidth) => (0, import_react2.createElement)(
    "g",
    null,
    (0, import_react2.createElement)("path", { d: "M13.5 5.5h5v5", strokeWidth }),
    (0, import_react2.createElement)("path", { d: "M18.5 5.5 10.8 13.2", strokeWidth }),
    (0, import_react2.createElement)("path", { d: "M18.5 13v4.4a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 17.4V7.1a1.6 1.6 0 0 1 1.6-1.6h4.2", strokeWidth })
  ),
  float: (strokeWidth) => (0, import_react2.createElement)(
    "g",
    null,
    (0, import_react2.createElement)("rect", { x: 3.5, y: 4.5, width: 17, height: 14, rx: 2.6, strokeWidth }),
    (0, import_react2.createElement)("rect", { x: 11, y: 10.5, width: 7, height: 5.4, rx: 1.2, fill: "currentColor", stroke: "none", opacity: 0.9 })
  ),
  chevron: (strokeWidth) => (0, import_react2.createElement)("path", { d: "m8.5 5.5 6.5 6.5-6.5 6.5", strokeWidth }),
  info: (strokeWidth) => (0, import_react2.createElement)(
    "g",
    null,
    (0, import_react2.createElement)("circle", { cx: 12, cy: 12, r: 8.4, strokeWidth }),
    (0, import_react2.createElement)("path", { d: "M12 11v5.2", strokeWidth }),
    (0, import_react2.createElement)("path", { d: "M12 7.8h.01", strokeWidth: strokeWidth + 0.6 })
  )
};
function Icon({ name: name2, size = 16, strokeWidth = 1.7, className, style }) {
  const glyph = GLYPHS[name2];
  if (!glyph) return null;
  return (0, import_react2.createElement)(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      focusable: false,
      className,
      style: { display: "block", flex: "none", ...style }
    },
    glyph(strokeWidth)
  );
}
function Mark({ size = 22, radius = 6 }) {
  return (0, import_react2.createElement)(
    "svg",
    {
      viewBox: "0 0 64 64",
      width: size,
      height: size,
      "aria-hidden": true,
      focusable: false,
      style: { display: "block" }
    },
    (0, import_react2.createElement)("rect", { width: 64, height: 64, rx: 15, fill: "transparent" }),
    (0, import_react2.createElement)("circle", { cx: 32, cy: 33, r: 18.5, fill: "none", stroke: "currentColor", strokeWidth: 3.2, opacity: 0.9 }),
    (0, import_react2.createElement)("path", {
      d: "M14.5 39.5 24 29.5l7 6.8 9.5-11.2 8 8.4",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 3.2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    (0, import_react2.createElement)("circle", { cx: 48.5, cy: 33, r: 3.1, fill: "var(--of-gold, #c79a3a)" })
  );
}

// client/src/theme-hud.js
var HUD_CSS = String.raw`
/* ------------------------------------------------------------- layer */
.of-hud-layer {
  --of-brand: #0f8c93;
  --of-brand-deep: #0a5c64;
  --of-gold: #c79a3a;
  --of-ease: cubic-bezier(0.22, 0.8, 0.24, 1);
  --of-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --of-up: var(--dsw-alias-state-error-primary, #d93a3a);
  --of-down: var(--dsw-alias-state-success-primary, #1f9d63);
  --of-flat: var(--dsw-alias-label-secondary, #6b7280);
  --of-border: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.09));
  --of-border-strong: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.16));
  --of-surface: var(--dsw-alias-bg-layer-1, #ffffff);
  --of-surface-2: var(--dsw-alias-bg-layer-2, #f5f5f4);
  --of-text: var(--dsw-alias-label-primary, #1b1b1b);
  --of-text-2: var(--dsw-alias-label-secondary, #6b7280);
  --of-mono: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}
.of-hud-layer *,
.of-hud-layer *::before,
.of-hud-layer *::after { box-sizing: border-box; }
.of-hud-layer ::selection { background: color-mix(in srgb, var(--of-brand) 26%, transparent); }
.of-hud-layer :focus-visible {
  outline: 2px solid var(--of-brand);
  outline-offset: 2px;
  border-radius: 6px;
}

/* -------------------------------------------------------------- widget */
.of-hud {
  --of-hud-w: 330px;
  --of-hud-up: #ff8f86;
  --of-hud-down: #5cd6a3;
  --of-hud-flat: #9fb0b3;
  --of-hud-ink: #f2f7f6;
  --of-hud-ink-2: rgba(230, 241, 239, 0.52);
  --of-hud-card: #0e161b;
  --of-hud-line: rgba(255, 255, 255, 0.075);
  --of-hud-soft: rgba(255, 255, 255, 0.06);
  position: fixed;
  pointer-events: auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  color: var(--of-hud-ink);
  opacity: 1;
  transition: opacity 180ms var(--of-ease);
  will-change: opacity;
}
.of-hud[data-direction="intl"] {
  --of-hud-up: #5cd6a3;
  --of-hud-down: #ff8f86;
}
.of-hud[data-dragging="true"] { cursor: grabbing; }

/* collapsed: [pct pill][mascot chip] */
.of-hud-chip-row {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  cursor: grab;
  animation: of-hud-fade 180ms var(--of-ease) both;
}
.of-hud[data-dragging="true"] .of-hud-chip-row { cursor: grabbing; }
.of-hud-pill {
  width: 62px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 620;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  color: var(--of-hud-ink-2);
  background: color-mix(in srgb, var(--of-hud-card) 82%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 10px 22px -16px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px) saturate(1.1);
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  overflow: hidden;
  white-space: nowrap;
}
.of-hud-pill[data-tone="up"] { color: var(--of-hud-up); }
.of-hud-pill[data-tone="down"] { color: var(--of-hud-down); }
.of-hud-pill[data-tone="flat"] { color: var(--of-hud-ink-2); }

/* the mascot: a 44 px round chip carrying the OpenFin lens */
.of-hud-mascot {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #f4f9f8;
  background:
    radial-gradient(120% 120% at 32% 22%, rgba(56, 190, 190, 0.5) 0%, transparent 62%),
    linear-gradient(152deg, #14989f 0%, #0c6f77 56%, #094b53 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 14px 30px -18px rgba(3, 18, 22, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    inset 0 -8px 16px -12px rgba(0, 0, 0, 0.6);
}
.of-hud-mascot::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--of-gold) 52%, transparent);
  opacity: 0;
  animation: of-hud-breathe 3.4s var(--of-ease) infinite;
  pointer-events: none;
}
.of-hud-mascot::before {
  content: "";
  position: absolute;
  top: 7px;
  right: 9px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--of-gold);
  opacity: 0.85;
  box-shadow: 0 0 6px color-mix(in srgb, var(--of-gold) 60%, transparent);
}
.of-hud[data-idle="true"] .of-hud-mascot::after,
.of-hud[data-reduced="true"] .of-hud-mascot::after { animation: none; opacity: 0; }
@keyframes of-hud-breathe {
  0% { opacity: 0; transform: scale(0.88); }
  32% { opacity: 0.6; }
  100% { opacity: 0; transform: scale(1.18); }
}

/* expanded card */
.of-hud-card {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  color: var(--of-hud-ink);
  background:
    radial-gradient(120% 90% at 100% 0%, rgba(20, 152, 159, 0.16) 0%, transparent 58%),
    linear-gradient(168deg, rgba(22, 35, 41, 0.94) 0%, var(--of-hud-card) 52%, rgba(11, 18, 22, 0.96) 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    0 30px 64px -34px rgba(0, 0, 0, 0.82),
    0 4px 14px -8px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  overflow: hidden;
  transform-origin: 100% 100%;
  animation: of-hud-pop 220ms var(--of-ease-out) both;
}
.of-hud[data-reduced="true"] .of-hud-card { animation: of-hud-fade 160ms linear both; }
@keyframes of-hud-pop {
  from { opacity: 0; transform: translateY(6px) scale(0.94); }
  to { opacity: 1; transform: none; }
}
@keyframes of-hud-fade { from { opacity: 0; } to { opacity: 1; } }

.of-hud-head {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 8px 0 10px;
  border-bottom: 1px solid var(--of-hud-line);
  cursor: grab;
}
.of-hud[data-dragging="true"] .of-hud-head { cursor: grabbing; }
.of-hud-face {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  color: #f4f9f8;
  background: linear-gradient(152deg, #14989f 0%, #0a5c64 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.of-hud-title {
  flex: 1;
  min-width: 0;
  padding: 3px 5px;
  margin-left: -5px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 620;
  letter-spacing: 0.008em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
  transition: background-color 140ms var(--of-ease);
}
.of-hud-title:hover { background: var(--of-hud-soft); }
.of-hud-title-input {
  flex: 1;
  min-width: 0;
  height: 26px;
  padding: 0 7px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--of-brand) 55%, transparent);
  background: rgba(6, 12, 15, 0.6);
  color: var(--of-hud-ink);
  font: inherit;
  font-size: 12.5px;
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--of-brand) 16%, transparent);
}
.of-hud-actions { display: flex; align-items: center; gap: 1px; flex: none; }
.of-hud-ibtn {
  appearance: none;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: rgba(233, 245, 243, 0.58);
  cursor: pointer;
  transition: color 140ms var(--of-ease), background-color 140ms var(--of-ease), transform 120ms var(--of-ease);
}
.of-hud-ibtn:hover { color: var(--of-hud-ink); background: var(--of-hud-soft); }
.of-hud-ibtn:active { transform: scale(0.92); }
.of-hud-panic-btn:hover { color: var(--of-gold); background: color-mix(in srgb, var(--of-gold) 14%, transparent); }
.of-hud-ibtn[data-danger="true"]:hover {
  color: #ffb6ae;
  background: rgba(255, 107, 107, 0.14);
}

/* instrument rows */
.of-hud-rows {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 3px 6px;
}
.of-hud-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 60px 46px;
  align-items: center;
  gap: 8px;
  height: 31px;
  padding: 0 6px;
  border-radius: 8px;
  cursor: grab;
  transition: background-color 150ms var(--of-ease);
}
.of-hud[data-spark="false"] .of-hud-row { grid-template-columns: minmax(0, 1fr) auto 60px; }
.of-hud-row:hover { background: var(--of-hud-soft); }
.of-hud-row-name {
  font-size: 11.5px;
  font-weight: 520;
  color: rgba(238, 246, 244, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.of-hud-row-price {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: rgba(238, 246, 244, 0.66);
  text-align: right;
}
.of-hud-row-pct {
  justify-self: end;
  min-width: 56px;
  padding: 2px 6px;
  border-radius: 6px;
  text-align: center;
  font-size: 10.5px;
  font-weight: 620;
  font-variant-numeric: tabular-nums;
  color: var(--of-hud-flat);
}
.of-hud-row-pct[data-tone="up"] {
  color: var(--of-hud-up);
  background: color-mix(in srgb, var(--of-hud-up) 13%, transparent);
}
.of-hud-row-pct[data-tone="down"] {
  color: var(--of-hud-down);
  background: color-mix(in srgb, var(--of-hud-down) 13%, transparent);
}
.of-hud-row-pct[data-tone="flat"] { background: rgba(255, 255, 255, 0.05); }
.of-hud-spark {
  position: relative;
  width: 46px;
  height: 18px;
  opacity: 0.9;
}
.of-hud-spark .of-quote-spark {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: auto;
  height: 18px;
}
.of-hud-spark[data-tone="up"] .of-quote-spark path:first-child { fill: var(--of-hud-up); }
.of-hud-spark[data-tone="up"] .of-quote-spark path:last-child { stroke: var(--of-hud-up); }
.of-hud-spark[data-tone="down"] .of-quote-spark path:first-child { fill: var(--of-hud-down); }
.of-hud-spark[data-tone="down"] .of-quote-spark path:last-child { stroke: var(--of-hud-down); }
.of-hud-spark[data-tone="flat"] .of-quote-spark path:first-child { fill: var(--of-hud-flat); }
.of-hud-spark[data-tone="flat"] .of-quote-spark path:last-child { stroke: var(--of-hud-flat); }

/* footer */
.of-hud-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px 0 11px;
  border-top: 1px solid var(--of-hud-line);
  font-size: 9.5px;
  color: rgba(226, 238, 236, 0.42);
  letter-spacing: 0.01em;
}
.of-hud-foot-time {
  flex: none;
  font-family: var(--of-mono);
  font-variant-numeric: tabular-nums;
  color: rgba(226, 238, 236, 0.52);
}
.of-hud-foot-sep { opacity: 0.5; }
.of-hud-foot-note {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 9.5px;
  color: inherit;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
button.of-hud-foot-note { cursor: pointer; }
button.of-hud-foot-note:hover { color: rgba(255, 210, 205, 0.9); }
.of-hud-foot-note[data-error="true"] { color: #ffb6ae; }
.of-hud-foot-btn { width: 22px; height: 22px; color: rgba(226, 238, 236, 0.5); }
.of-hud-foot-btn:hover { color: var(--of-hud-ink); }

/* ---------------------------------------------------- settings sheet */
.of-hset-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  pointer-events: auto;
  background: color-mix(in srgb, #0e161b 40%, transparent);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  animation: of-hset-scrim 160ms linear both;
}
@keyframes of-hset-scrim { from { opacity: 0; } to { opacity: 1; } }
.of-hset {
  display: flex;
  flex-direction: column;
  width: min(560px, 100%);
  max-height: min(86vh, 780px);
  overflow: hidden;
  border-radius: 16px;
  border: 0.5px solid var(--of-border-strong);
  background: var(--of-surface);
  color: var(--of-text);
  box-shadow:
    0 40px 100px -48px rgba(0, 0, 0, 0.65),
    0 2px 10px rgba(0, 0, 0, 0.1);
  animation: of-hset-rise 200ms var(--of-ease-out) both;
}
@keyframes of-hset-rise {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
.of-hset[data-reduced="true"] { animation: of-hset-scrim 160ms linear both; }
.of-hset-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  padding: 13px 12px 12px 16px;
  border-bottom: 0.5px solid var(--of-border);
  background:
    radial-gradient(120% 160% at 0% 0%, color-mix(in srgb, var(--of-brand) 8%, transparent) 0%, transparent 60%),
    var(--of-surface);
}
.of-hset-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 9px;
  color: var(--of-brand);
  background: color-mix(in srgb, var(--of-brand) 10%, transparent);
}
.of-hset-titles { flex: 1; min-width: 0; }
.of-hset-title {
  margin: 0;
  font-size: 14px;
  line-height: 1.3;
  font-weight: 650;
  letter-spacing: -0.006em;
}
.of-hset-sub { margin-top: 2px; font-size: 10.5px; color: var(--of-text-2); }
.of-hset-close { flex: none; }
.of-hset-body {
  min-height: 0;
  overflow-y: auto;
  padding: 2px 16px 16px;
  scrollbar-width: thin;
}
.of-hset-section {
  padding: 14px 0;
  border-bottom: 0.5px solid var(--of-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.of-hset-section:last-child { border-bottom: 0; padding-bottom: 4px; }
.of-hset-section-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.of-hset-section-label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--of-text-2);
}
.of-hset-section-meta {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--of-text-2);
  font-variant-numeric: tabular-nums;
}
.of-hset-field { display: flex; flex-direction: column; gap: 6px; }
.of-hset-line {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
}
.of-hset-label {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
}
.of-hset-value {
  flex: none;
  min-width: 42px;
  text-align: right;
  font-size: 11.5px;
  color: var(--of-text-2);
  font-variant-numeric: tabular-nums;
}
.of-hset-hint {
  font-size: 10.5px;
  line-height: 1.55;
  color: var(--of-text-2);
}
.of-hset-error { font-size: 10.5px; line-height: 1.55; color: var(--of-up); }

/* switch */
.of-hset-switch {
  appearance: none;
  position: relative;
  flex: none;
  width: 34px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--of-text-2) 26%, transparent);
  cursor: pointer;
  transition: background-color 180ms var(--of-ease);
}
.of-hset-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--of-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: transform 180ms var(--of-ease);
}
.of-hset-switch[aria-checked="true"] { background: var(--of-brand); }
.of-hset-switch[aria-checked="true"]::after { transform: translateX(14px); }
.of-hset-switch:disabled { opacity: 0.42; cursor: default; }

/* desktop status line */
.of-hset-status {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 16px;
  font-size: 10.8px;
  color: var(--of-text-2);
  line-height: 1.45;
}
.of-hset-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--of-text-2);
}
.of-hset-status[data-tone="ok"] .of-hset-dot { background: var(--dsw-alias-state-success-primary, #1f9d63); }
.of-hset-status[data-tone="warn"] .of-hset-dot { background: var(--of-gold); }
.of-hset-status-text { flex: none; font-weight: 500; }
.of-hset-status-reason {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--of-text-2);
  opacity: 0.85;
}

/* symbols grid */
.of-hset-symbols {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 6px;
}
.of-hset-symbol {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 7px 9px;
  border: 0.5px solid var(--of-border);
  border-radius: 9px;
  background: transparent;
  color: var(--of-text);
  font: inherit;
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 150ms var(--of-ease),
    border-color 150ms var(--of-ease),
    color 150ms var(--of-ease);
}
.of-hset-symbol:hover { background: var(--of-surface-2); }
.of-hset-symbol[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--of-brand) 42%, transparent);
  background: color-mix(in srgb, var(--of-brand) 8%, transparent);
}
.of-hset-check {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  flex: none;
  border: 1px solid var(--of-border-strong);
  border-radius: 4px;
  font-size: 9px;
  line-height: 1;
  color: var(--of-surface);
}
.of-hset-symbol[aria-pressed="true"] .of-hset-check {
  background: var(--of-brand);
  border-color: var(--of-brand);
  color: #fff;
}
.of-hset-symbol-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* instrument search (v0.3) */
.of-hset-search { display: flex; flex-direction: column; gap: 6px; }
.of-hset-search-input { flex: none; width: 100%; }
.of-hset-results {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 208px;
  overflow-y: auto;
  padding: 4px;
  border: 0.5px solid var(--of-border);
  border-radius: 10px;
  background: var(--of-surface-2);
  scrollbar-width: thin;
}
.of-hset-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px 5px 8px;
  border-radius: 8px;
}
.of-hset-result:hover { background: var(--of-surface); }
.of-hset-result[data-selected="true"] { opacity: 0.72; }
.of-hset-result-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.of-hset-result-name {
  font-size: 12px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.of-hset-result-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--of-text-2);
  font-variant-numeric: tabular-nums;
}
.of-hset-result-code { font-family: var(--of-mono); }
.of-hset-result-market {
  padding: 0 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--of-text-2) 12%, transparent);
}
.of-hset-result-add { flex: none; padding: 4px 9px; font-size: 10.5px; }
.of-hset-result-add:disabled { opacity: 0.55; cursor: default; }
.of-hset-result-empty {
  padding: 10px 8px;
  text-align: center;
  font-size: 11px;
  color: var(--of-text-2);
}

/* selected custom instrument chips */
.of-hset-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.of-hset-chips-head { flex: none; font-size: 10.5px; color: var(--of-text-2); }
.of-hset-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  max-width: 100%;
  padding: 3px 4px 3px 9px;
  border: 0.5px solid color-mix(in srgb, var(--of-brand) 34%, transparent);
  border-radius: 99px;
  background: color-mix(in srgb, var(--of-brand) 8%, transparent);
  color: var(--of-text);
  font-size: 11px;
}
.of-hset-chip-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.of-hset-chip-remove {
  appearance: none;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  flex: none;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--of-text-2);
  cursor: pointer;
  transition: background-color 140ms var(--of-ease), color 140ms var(--of-ease);
}
.of-hset-chip-remove:hover {
  background: color-mix(in srgb, var(--of-text-2) 18%, transparent);
  color: var(--of-text);
}
.of-hset-chip-remove:disabled { opacity: 0.4; cursor: default; }
.of-hset-warn { color: color-mix(in srgb, var(--of-gold) 72%, var(--of-text)); }

/* boss key */
.of-hset-combo {
  align-self: flex-start;
  padding: 3px 8px;
  border: 0.5px solid var(--of-border);
  border-radius: 6px;
  background: var(--of-surface-2);
  color: var(--of-text-2);
  font-family: var(--of-mono);
  font-size: 10.5px;
  letter-spacing: 0.01em;
}
.of-hset-combo[data-off="true"] { opacity: 0.6; }
.of-hset-panic .of-hset-actions { margin-top: 2px; }

/* slider / select / input / segmented */
.of-hset-range {
  flex: 1;
  min-width: 100px;
  height: 20px;
  accent-color: var(--of-brand);
  cursor: pointer;
}
.of-hset-range:disabled { opacity: 0.45; cursor: default; }
.of-hset-select {
  flex: none;
  max-width: 160px;
  padding: 6px 8px;
  border: 0.5px solid var(--of-border);
  border-radius: 8px;
  background: var(--of-surface);
  color: var(--of-text);
  font: inherit;
  font-size: 11.5px;
  cursor: pointer;
}
.of-hset-select:focus-visible { outline: 2px solid var(--of-brand); outline-offset: 1px; }
.of-hset-input {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 10px;
  border: 0.5px solid var(--of-border);
  border-radius: 8px;
  background: var(--of-surface);
  color: var(--of-text);
  font: inherit;
  font-size: 12.5px;
  outline: none;
  transition: border-color 150ms var(--of-ease), box-shadow 150ms var(--of-ease);
}
.of-hset-input::placeholder { color: var(--of-text-2); }
.of-hset-input:focus {
  border-color: color-mix(in srgb, var(--of-brand) 55%, var(--of-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--of-brand) 12%, transparent);
}
.of-hset-count {
  flex: none;
  min-width: 44px;
  text-align: right;
  font-size: 10.5px;
  color: var(--of-text-2);
  font-variant-numeric: tabular-nums;
}
.of-hset-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 0.5px solid var(--of-border);
  border-radius: 9px;
  background: var(--of-surface-2);
}
.of-hset-seg-btn {
  appearance: none;
  min-width: 34px;
  padding: 5px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--of-text-2);
  font: inherit;
  font-size: 11.5px;
  line-height: 1;
  cursor: pointer;
  transition: color 150ms var(--of-ease), background-color 150ms var(--of-ease);
}
.of-hset-seg-btn:hover { color: var(--of-text); }
.of-hset-seg-btn[aria-pressed="true"] {
  background: var(--of-surface);
  color: var(--of-text);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 0 0 0.5px var(--of-border);
}

.of-hset-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.of-hset-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  padding-top: 10px;
  font-size: 10.5px;
  color: var(--of-text-2);
}

/* -------------------------------------------------------- responsive */
@media (max-width: 560px) {
  .of-hset-backdrop { padding: 10px; align-items: flex-end; }
  .of-hset { max-height: 92vh; width: 100%; }
  .of-hset-body { padding: 2px 12px 12px; }
  .of-hud-title { font-size: 12px; }
}

/* ---------------------------------------------------- reduced motion */
@media (prefers-reduced-motion: reduce) {
  .of-hud,
  .of-hud *,
  .of-hset,
  .of-hset * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  .of-hud-mascot::after { animation: none !important; opacity: 0 !important; }
}
`;

// client/src/hud-config.js
var STORAGE_KEY = "dsh-openfin:hud";
var SETTINGS_EVENT = "dsh-openfin:hud-settings";
var SYNC_DELAY_MS = 400;
var MAX_SYMBOLS = 6;
var MAX_CATALOG = 12;
var CATALOG_NAME_MAX = 24;
var MIN_OPACITY = 20;
var MAX_OPACITY = 100;
var MIN_IDLE_MS = 5e3;
var MAX_IDLE_MS = 6e5;
var TITLE_MAX = 18;
var SIZES = /* @__PURE__ */ new Set(["s", "m", "l"]);
var SECID_RE = /^\d{1,3}\.[A-Za-z0-9_]+$/;
var CUSTOM_PREFIX = "em:";
var DEFAULT_PANIC_SHORTCUT = "CommandOrControl+Shift+H";
var PANIC_SHORTCUTS = Object.freeze(
  [
    { id: "CommandOrControl+Shift+H", accelerator: "CommandOrControl+Shift+H", label: "Ctrl/\u2318 + Shift + H" },
    { id: "Alt+X", accelerator: "Alt+X", label: "Alt + X" },
    { id: "CommandOrControl+Alt+H", accelerator: "CommandOrControl+Alt+H", label: "Ctrl/\u2318 + Alt + H" },
    {
      id: "CommandOrControl+Shift+Space",
      accelerator: "CommandOrControl+Shift+Space",
      label: "Ctrl/\u2318 + Shift + Space"
    }
  ].map((entry) => Object.freeze(entry))
);
var PANIC_ACCELERATORS = new Set(PANIC_SHORTCUTS.map((entry) => entry.accelerator));
var SYMBOLS = Object.freeze(
  [
    { id: "sh000001", name: "\u4E0A\u8BC1\u6307\u6570", kind: "index" },
    { id: "sz399001", name: "\u6DF1\u8BC1\u6210\u6307", kind: "index" },
    { id: "sz399006", name: "\u521B\u4E1A\u677F\u6307", kind: "index" },
    { id: "hkHSI", name: "\u6052\u751F\u6307\u6570", kind: "index" },
    { id: "usIXIC", name: "\u7EB3\u65AF\u8FBE\u514B", kind: "index" },
    { id: "usSPX", name: "\u6807\u666E500", kind: "index" },
    { id: "usDJIA", name: "\u9053\u743C\u65AF", kind: "index" },
    { id: "hfGC", name: "COMEX\u9EC4\u91D1", kind: "commodity" },
    { id: "fxUDI", name: "\u7F8E\u5143\u6307\u6570", kind: "fx" },
    { id: "btc", name: "BTC", kind: "crypto" },
    { id: "eth", name: "ETH", kind: "crypto" }
  ].map((symbol) => Object.freeze(symbol))
);
var SYMBOL_IDS = new Set(SYMBOLS.map((symbol) => symbol.id));
var SYMBOL_BY_ID = new Map(SYMBOLS.map((symbol) => [symbol.id, symbol]));
var DEFAULT_HUD = Object.freeze({
  version: 1,
  inline: false,
  desktop: false,
  collapsed: false,
  symbols: Object.freeze(["sh000001", "sz399001", "hkHSI", "usIXIC", "btc"]),
  catalog: Object.freeze({}),
  opacity: 85,
  idleOpacity: 35,
  idleAfterMs: 3e4,
  hoverFull: true,
  size: "m",
  title: "OpenFin",
  showSpark: true,
  position: Object.freeze({ x: 0, y: 0 }),
  panicEnabled: true,
  panicShortcut: DEFAULT_PANIC_SHORTCUT
});
var cache = null;
var listeners = /* @__PURE__ */ new Set();
var revision = 0;
var reconcileStarted = false;
var storageBound = false;
var syncTimer = 0;
var pendingPatch = null;
function readStored() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function writeStored(config) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
  }
}
function bool(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function clampNumber(value, min, max, fallback) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}
function normalizeTitle(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX);
  return trimmed.length > 0 ? trimmed : fallback;
}
function customSecid(id) {
  if (typeof id !== "string" || !id.startsWith(CUSTOM_PREFIX)) return null;
  const secid = id.slice(CUSTOM_PREFIX.length);
  return SECID_RE.test(secid) ? secid : null;
}
function isCustomSymbol(id) {
  return customSecid(id) !== null;
}
function instrumentName(id, config) {
  const key = typeof id === "string" ? id : "";
  const catalog = config && typeof config === "object" ? config.catalog : null;
  const entry = catalog && typeof catalog === "object" ? catalog[key] : null;
  if (entry && typeof entry.name === "string" && entry.name !== "") return entry.name;
  const builtIn = SYMBOL_BY_ID.get(key);
  if (builtIn) return builtIn.name;
  return key;
}
function panicShortcutLabel(accelerator) {
  const entry = PANIC_SHORTCUTS.find((preset) => preset.accelerator === accelerator || preset.id === accelerator);
  return entry ? entry.label : "";
}
function normalizeSymbols(value, fallback) {
  if (!Array.isArray(value)) return fallback.slice();
  const seen = /* @__PURE__ */ new Set();
  const picked = [];
  for (const id of value) {
    if (typeof id !== "string" || seen.has(id)) continue;
    if (!SYMBOL_IDS.has(id) && customSecid(id) === null) continue;
    seen.add(id);
    picked.push(id);
    if (picked.length >= MAX_SYMBOLS) break;
  }
  return picked.length > 0 ? picked : fallback.slice();
}
function normalizeCatalog(value, symbols) {
  const source = value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  const out = {};
  let count = 0;
  for (const id of symbols) {
    if (count >= MAX_CATALOG) break;
    const secid = customSecid(id);
    if (secid === null) continue;
    const entry = source[id];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const name2 = typeof entry.name === "string" ? entry.name.trim().slice(0, CATALOG_NAME_MAX) : "";
    if (name2 === "") continue;
    out[id] = {
      name: name2,
      secid,
      code: typeof entry.code === "string" ? entry.code.slice(0, 12) : "",
      market: typeof entry.market === "string" ? entry.market.slice(0, 12) : "",
      kind: entry.kind === "index" ? "index" : "stock"
    };
    count += 1;
  }
  return out;
}
function normalizePanic(source, base) {
  const enabled = bool(source.panicEnabled, base.panicEnabled !== false);
  if (!enabled) return { panicEnabled: false, panicShortcut: "" };
  const candidate = typeof source.panicShortcut === "string" ? source.panicShortcut : typeof base.panicShortcut === "string" ? base.panicShortcut : "";
  return {
    panicEnabled: true,
    panicShortcut: PANIC_ACCELERATORS.has(candidate) ? candidate : DEFAULT_PANIC_SHORTCUT
  };
}
function normalizePosition(value, fallback) {
  if (value === null || typeof value !== "object") return { x: fallback.x, y: fallback.y };
  const x = Number(value.x);
  const y = Number(value.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { x: fallback.x, y: fallback.y };
  return { x: Math.round(x), y: Math.round(y) };
}
function normalizeConfig(base, patch) {
  const source = patch !== null && typeof patch === "object" ? patch : {};
  const symbols = source.symbols === void 0 ? base.symbols.slice() : normalizeSymbols(source.symbols, base.symbols);
  const catalog = normalizeCatalog(source.catalog === void 0 ? base.catalog : source.catalog, symbols);
  const panic = normalizePanic(source, base);
  return {
    version: 1,
    inline: bool(source.inline, base.inline),
    desktop: bool(source.desktop, base.desktop),
    collapsed: bool(source.collapsed, base.collapsed),
    symbols,
    catalog,
    opacity: source.opacity === void 0 ? base.opacity : clampNumber(source.opacity, MIN_OPACITY, MAX_OPACITY, base.opacity),
    idleOpacity: source.idleOpacity === void 0 ? base.idleOpacity : clampNumber(source.idleOpacity, MIN_OPACITY, MAX_OPACITY, base.idleOpacity),
    idleAfterMs: source.idleAfterMs === void 0 ? base.idleAfterMs : source.idleAfterMs === 0 ? 0 : clampNumber(source.idleAfterMs, MIN_IDLE_MS, MAX_IDLE_MS, base.idleAfterMs),
    hoverFull: bool(source.hoverFull, base.hoverFull),
    size: typeof source.size === "string" && SIZES.has(source.size) ? source.size : base.size,
    title: source.title === void 0 ? base.title : normalizeTitle(source.title, base.title),
    showSpark: bool(source.showSpark, base.showSpark),
    position: source.position === void 0 ? { x: base.position.x, y: base.position.y } : normalizePosition(source.position, base.position),
    panicEnabled: panic.panicEnabled,
    panicShortcut: panic.panicShortcut
  };
}
function cloneCatalog(catalog) {
  const out = {};
  if (catalog !== null && typeof catalog === "object") {
    for (const [id, entry] of Object.entries(catalog)) out[id] = { ...entry };
  }
  return out;
}
function cloneConfig(config) {
  return {
    ...config,
    symbols: Array.isArray(config.symbols) ? config.symbols.slice() : [],
    catalog: cloneCatalog(config.catalog),
    position: { x: config.position.x, y: config.position.y }
  };
}
function sameConfig(left, right) {
  return JSON.stringify(cloneConfig(left)) === JSON.stringify(cloneConfig(right));
}
function loadHudConfig() {
  if (cache === null) cache = normalizeConfig(DEFAULT_HUD, readStored() || {});
  return cloneConfig(cache);
}
function notify() {
  const current = loadHudConfig();
  for (const listener of Array.from(listeners)) {
    try {
      listener(current);
    } catch {
    }
  }
}
function saveHudConfig(partial) {
  if (cache === null) cache = normalizeConfig(DEFAULT_HUD, readStored() || {});
  cache = normalizeConfig(cache, partial && typeof partial === "object" ? partial : {});
  revision += 1;
  writeStored(cache);
  notify();
  return cloneConfig(cache);
}
function subscribeHudConfig(listener) {
  if (typeof listener !== "function") return () => {
  };
  listeners.add(listener);
  if (!storageBound) {
    storageBound = true;
    bindStorage();
  }
  if (!reconcileStarted) {
    reconcileStarted = true;
    scheduleReconcile();
  }
  return () => {
    listeners.delete(listener);
  };
}
function syncHudConfig(config) {
  const source = config && typeof config === "object" ? config : loadHudConfig();
  const { desktop: _desktop, ...patch } = source;
  pendingPatch = patch;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(flushSync, SYNC_DELAY_MS);
}
function flushSync() {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = 0;
  }
  const patch = pendingPatch;
  pendingPatch = null;
  if (!patch) return;
  postHud({ config: patch }).catch(() => {
  });
}
function pushDesktop(enabled) {
  const on = enabled === true;
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = 0;
  }
  const patch = pendingPatch;
  pendingPatch = null;
  const body = patch ? { config: patch, desktop: on } : { desktop: on };
  return postHud(body).then(
    (status) => status,
    () => null
  );
}
function openHudSettings() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
  } catch {
  }
}
function onOpenHudSettings(listener) {
  if (typeof window === "undefined" || typeof listener !== "function") return () => {
  };
  const handler = () => listener();
  window.addEventListener(SETTINGS_EVENT, handler);
  return () => {
    window.removeEventListener(SETTINGS_EVENT, handler);
  };
}
function bindStorage() {
  if (typeof window === "undefined") return;
  window.addEventListener("storage", (event) => {
    if (!event || event.key !== STORAGE_KEY || typeof event.newValue !== "string") return;
    let parsed;
    try {
      parsed = JSON.parse(event.newValue);
    } catch {
      return;
    }
    const next = normalizeConfig(DEFAULT_HUD, parsed !== null && typeof parsed === "object" ? parsed : {});
    if (cache !== null && sameConfig(cache, next)) return;
    cache = next;
    revision += 1;
    notify();
  });
  window.addEventListener("pagehide", flushSync);
}
function scheduleReconcile() {
  if (typeof window === "undefined") return;
  const run = () => {
    const startedAt = revision;
    getHud().then(
      (status) => {
        const hostConfig = status && status.config;
        if (!hostConfig || typeof hostConfig !== "object") return;
        if (revision !== startedAt) return;
        const next = normalizeConfig(DEFAULT_HUD, hostConfig);
        const local = loadHudConfig();
        if (sameConfig(local, next)) return;
        cache = next;
        writeStored(cache);
        notify();
      },
      () => {
      }
    );
  };
  if (typeof queueMicrotask === "function") queueMicrotask(run);
  else setTimeout(run, 0);
}

// client/src/components/FloatingHud.js
var import_react5 = require("react");

// client/src/format.js
var PLACEHOLDER = "\u2014";
function fmtPrice(value, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) return PLACEHOLDER;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}
function fmtPct(value, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) return PLACEHOLDER;
  const sign = value > 0 ? "+" : "";
  return sign + value.toFixed(digits) + "%";
}
function fmtChange(value, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) return PLACEHOLDER;
  const sign = value > 0 ? "+" : "";
  return sign + value.toFixed(digits);
}
function fmtCompact(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return PLACEHOLDER;
  const abs = Math.abs(value);
  if (abs >= 1e12) return trim(value / 1e12) + "\u4E07\u4EBF";
  if (abs >= 1e8) return trim(value / 1e8) + "\u4EBF";
  if (abs >= 1e4) return trim(value / 1e4) + "\u4E07";
  return trim(value);
}
function trim(value) {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return value.toFixed(digits);
}
function fmtClock(ms) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return PLACEHOLDER;
  const date = new Date(ms);
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function signClass(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) < 1e-9) return "flat";
  return value > 0 ? "up" : "down";
}

// client/src/hooks.js
var import_react3 = require("react");
function useCountUp(value, duration = 420) {
  const [display, setDisplay] = (0, import_react3.useState)(value);
  const current = (0, import_react3.useRef)(value);
  const painted = (0, import_react3.useRef)(value);
  (0, import_react3.useEffect)(() => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      current.current = value;
      painted.current = value;
      setDisplay(value);
      return void 0;
    }
    const from = typeof current.current === "number" && Number.isFinite(current.current) ? current.current : value;
    if (from === value) {
      if (painted.current !== value) {
        painted.current = value;
        setDisplay(value);
      }
      return void 0;
    }
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      current.current = value;
      setDisplay(value);
      return void 0;
    }
    const started = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;
      current.current = next;
      painted.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else {
        current.current = value;
        painted.current = value;
        setDisplay(value);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return display;
}
function useMediaQuery(query) {
  const [matches, setMatches] = (0, import_react3.useState)(
    () => typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false
  );
  (0, import_react3.useEffect)(() => {
    if (typeof window === "undefined" || !window.matchMedia) return void 0;
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// client/src/components/Sparkline.js
var import_react4 = require("react");
function Sparkline({ values, up }) {
  if (!Array.isArray(values) || values.length < 3) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = index / (values.length - 1) * 100;
    const y = 100 - (value - min) / span * 96 - 2;
    return [x, y];
  });
  const line = points.map(([x, y], index) => (index === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2)).join(" ");
  const area = line + " L100 100 L0 100 Z";
  const color = up ? "var(--of-up)" : "var(--of-down)";
  return (0, import_react4.createElement)(
    "svg",
    {
      className: "of-quote-spark",
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      "aria-hidden": true,
      focusable: false
    },
    (0, import_react4.createElement)("path", { d: area, fill: color, opacity: 0.1 }),
    (0, import_react4.createElement)("path", {
      d: line,
      fill: "none",
      stroke: color,
      strokeWidth: 1.4,
      strokeLinejoin: "round",
      strokeLinecap: "round",
      opacity: 0.9
    })
  );
}

// client/src/components/FloatingHud.js
var POLL_MS = 3e4;
var CHIP = 44;
var PILL_W = 62;
var CHIP_GAP = 6;
var COLLAPSED_W = PILL_W + CHIP_GAP + CHIP;
var COLLAPSED_H = CHIP;
var EDGE = 8;
var DEFAULT_MARGIN = 24;
var DRAG_START_SQ = 16;
var TITLE_MAX2 = 18;
var CARD_W = Object.freeze({ s: 300, m: 330, l: 368 });
var QUOTE_ALIASES = Object.freeze({
  hkHSI: "100.HSI",
  usIXIC: "100.NDX",
  usSPX: "100.SPX",
  usDJIA: "100.DJIA",
  hfGC: "101.GC00Y",
  fxUDI: "100.UDI",
  btc: "BTC",
  eth: "ETH"
});
function estimateCardHeight(rowCount) {
  return 84 + Math.max(1, rowCount) * 31;
}
function readViewport() {
  if (typeof window === "undefined") return { w: 1280, h: 800 };
  return { w: window.innerWidth || 1280, h: window.innerHeight || 800 };
}
function useViewport() {
  const [viewport, setViewport] = (0, import_react5.useState)(readViewport);
  (0, import_react5.useEffect)(() => {
    const onChange = () => setViewport(readViewport());
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []);
  return viewport;
}
function clampValue(value, min, max) {
  if (min > max) return min;
  return Math.min(max, Math.max(min, value));
}
function isDefaultPosition(position) {
  if (!position || typeof position !== "object") return true;
  return Math.round(Number(position.x) || 0) === 0 && Math.round(Number(position.y) || 0) === 0;
}
function resolveAnchor(position, viewport, collapsed, cardW, cardH) {
  const base = isDefaultPosition(position) ? { x: viewport.w - COLLAPSED_W - DEFAULT_MARGIN, y: viewport.h - COLLAPSED_H - DEFAULT_MARGIN } : { x: Number(position.x) || 0, y: Number(position.y) || 0 };
  let x = clampValue(base.x, EDGE, viewport.w - COLLAPSED_W - EDGE);
  let y = clampValue(base.y, EDGE, viewport.h - COLLAPSED_H - EDGE);
  if (!collapsed) {
    const left = clampValue(x + COLLAPSED_W - cardW, EDGE, viewport.w - cardW - EDGE);
    const top = clampValue(y + COLLAPSED_H - cardH, EDGE, viewport.h - cardH - EDGE);
    x = left + cardW - COLLAPSED_W;
    y = top + cardH - COLLAPSED_H;
  }
  return { x: Math.round(x), y: Math.round(y) };
}
var HUD_GLYPHS = {
  gear: (strokeWidth) => (0, import_react5.createElement)(
    "g",
    null,
    (0, import_react5.createElement)("circle", { cx: 12, cy: 12, r: 3.3, strokeWidth }),
    (0, import_react5.createElement)("path", {
      d: "M12 3.4v2.3M12 18.3v2.3M3.4 12h2.3M18.3 12h2.3M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6",
      strokeWidth
    })
  ),
  collapse: (strokeWidth) => (0, import_react5.createElement)("path", { d: "M6.5 12h11", strokeWidth }),
  eye: (strokeWidth) => (0, import_react5.createElement)(
    "g",
    null,
    (0, import_react5.createElement)("path", {
      d: "M2.8 12S6.4 5.6 12 5.6 21.2 12 21.2 12 17.6 18.4 12 18.4 2.8 12 2.8 12Z",
      strokeWidth
    }),
    (0, import_react5.createElement)("circle", { cx: 12, cy: 12, r: 2.7, strokeWidth })
  )
};
function HudGlyph({ name: name2, size = 13, strokeWidth = 1.6 }) {
  const draw = HUD_GLYPHS[name2];
  if (!draw) return null;
  return (0, import_react5.createElement)(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      focusable: false,
      style: { display: "block", flex: "none" }
    },
    draw(strokeWidth)
  );
}
function HudRow({ fallbackName, quote, showSpark, onOpen }) {
  const animated = useCountUp(quote && typeof quote.price === "number" ? quote.price : null, 420);
  const pct = quote && typeof quote.pct === "number" ? quote.pct : null;
  const tone = quote ? signClass(pct) : "flat";
  const name2 = quote && quote.name || fallbackName || "";
  const digits = quote && typeof quote.digits === "number" ? quote.digits : 2;
  const priceText = quote ? fmtPrice(animated, digits) : "\u2014";
  const pctText = quote ? fmtPct(pct) : "\u2014";
  return (0, import_react5.createElement)(
    "div",
    {
      className: "of-hud-row",
      role: "button",
      tabIndex: 0,
      "data-hud-action": "open",
      "aria-label": name2 + " " + priceText + " " + pctText,
      title: name2,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }
    },
    (0, import_react5.createElement)("span", { className: "of-hud-row-name" }, name2),
    (0, import_react5.createElement)("span", { className: "of-hud-row-price" }, priceText),
    (0, import_react5.createElement)("span", { className: "of-hud-row-pct", "data-tone": tone }, pctText),
    showSpark ? (0, import_react5.createElement)(
      "span",
      { className: "of-hud-spark", "data-tone": tone, "aria-hidden": true },
      quote && Array.isArray(quote.spark) ? (0, import_react5.createElement)(Sparkline, { values: quote.spark, up: pct >= 0 }) : null
    ) : null
  );
}
function FloatingHud({ t, config, onChange, onConfigure, onOpenDashboard, hidden, onPanic }) {
  const viewport = useViewport();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [snapshot, setSnapshot] = (0, import_react5.useState)(null);
  const [loading, setLoading] = (0, import_react5.useState)(true);
  const [error, setError] = (0, import_react5.useState)(null);
  const [hover, setHover] = (0, import_react5.useState)(false);
  const [idle, setIdle] = (0, import_react5.useState)(false);
  const [dragging, setDragging] = (0, import_react5.useState)(false);
  const [dragPos, setDragPos] = (0, import_react5.useState)(null);
  const [editingTitle, setEditingTitle] = (0, import_react5.useState)(false);
  const [draftTitle, setDraftTitle] = (0, import_react5.useState)(config.title || "OpenFin");
  const [measuredHeight, setMeasuredHeight] = (0, import_react5.useState)(0);
  const rootRef = (0, import_react5.useRef)(null);
  const cardRef = (0, import_react5.useRef)(null);
  const titleInputRef = (0, import_react5.useRef)(null);
  const dragRef = (0, import_react5.useRef)(null);
  const dragPosRef = (0, import_react5.useRef)(null);
  const frameRef = (0, import_react5.useRef)(0);
  const idleTimerRef = (0, import_react5.useRef)(0);
  const idleRef = (0, import_react5.useRef)(false);
  const reloadRef = (0, import_react5.useRef)(null);
  const direction = t("meta.direction") === "intl" ? "intl" : "cn";
  const collapsed = config.collapsed === true;
  const size = CARD_W[config.size] ? config.size : "m";
  const cardW = CARD_W[size];
  const rows = (0, import_react5.useMemo)(() => {
    const ids = Array.isArray(config.symbols) ? config.symbols : [];
    return ids.map((id) => ({ id, fallbackName: instrumentName(id, config) }));
  }, [config.symbols, config.catalog]);
  const symbolsKey = Array.isArray(config.symbols) ? config.symbols.join("|") : "";
  const quoteMap = (0, import_react5.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    const quotes = snapshot && Array.isArray(snapshot.quotes) ? snapshot.quotes : [];
    for (const quote of quotes) {
      if (quote && typeof quote.id === "string") map.set(quote.id, quote);
    }
    for (const hudId of Object.keys(QUOTE_ALIASES)) {
      const quote = map.get(QUOTE_ALIASES[hudId]);
      if (quote && !map.has(hudId)) map.set(hudId, quote);
    }
    return map;
  }, [snapshot]);
  const cardH = collapsed ? COLLAPSED_H : measuredHeight || estimateCardHeight(rows.length);
  const resolved = resolveAnchor(config.position, viewport, collapsed, cardW, cardH);
  const anchor = dragPos || resolved;
  const left = collapsed ? anchor.x : anchor.x + COLLAPSED_W - cardW;
  const top = collapsed ? anchor.y : anchor.y + COLLAPSED_H - cardH;
  (0, import_react5.useEffect)(() => {
    if (hidden) return void 0;
    let alive = true;
    const controller = new AbortController();
    const requestIds = Array.isArray(config.symbols) ? config.symbols.slice() : [];
    let timer = 0;
    const load = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const data = await getHudQuotes(requestIds, controller.signal);
        if (!alive) return;
        setSnapshot(data);
        setError(null);
      } catch (reason) {
        if (!alive || reason && reason.name === "AbortError") return;
        setError(reason && reason.message || String(reason));
      } finally {
        if (alive) setLoading(false);
      }
    };
    reloadRef.current = load;
    setLoading(true);
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await load();
        if (alive) schedule();
      }, POLL_MS);
    };
    const onVisibility = () => {
      if (typeof document !== "undefined" && document.hidden) {
        clearTimeout(timer);
        timer = 0;
        return;
      }
      void load();
      schedule();
    };
    void load();
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(timer);
      reloadRef.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [symbolsKey, hidden]);
  (0, import_react5.useEffect)(() => {
    if (!editingTitle) setDraftTitle(config.title || "");
  }, [config.title, editingTitle]);
  (0, import_react5.useEffect)(() => {
    if (!editingTitle) return;
    const node = titleInputRef.current;
    if (node) {
      try {
        node.focus();
        node.select();
      } catch {
      }
    }
  }, [editingTitle]);
  (0, import_react5.useLayoutEffect)(() => {
    if (collapsed) {
      setMeasuredHeight(0);
      return void 0;
    }
    const node = cardRef.current;
    if (!node) return void 0;
    const update = () => {
      const height = node.offsetHeight;
      if (height > 0) setMeasuredHeight(height);
    };
    update();
    let observer = null;
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(update);
      observer.observe(node);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [collapsed, size, symbolsKey, config.showSpark]);
  (0, import_react5.useEffect)(() => {
    const timeout = Number(config.idleAfterMs) || 0;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = 0;
    idleRef.current = false;
    setIdle(false);
    if (timeout <= 0) return void 0;
    idleTimerRef.current = setTimeout(() => {
      idleRef.current = true;
      setIdle(true);
    }, timeout);
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = 0;
      }
    };
  }, [config.idleAfterMs]);
  const bump = (0, import_react5.useCallback)(() => {
    const timeout = Number(config.idleAfterMs) || 0;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = 0;
    }
    if (idleRef.current) {
      idleRef.current = false;
      setIdle(false);
    }
    if (timeout > 0) {
      idleTimerRef.current = setTimeout(() => {
        idleRef.current = true;
        setIdle(true);
      }, timeout);
    }
  }, [config.idleAfterMs]);
  const opacityBase = clampValue(Number(config.opacity) || 100, 20, 100) / 100;
  const opacityIdle = clampValue(Number(config.idleOpacity) || 20, 20, 100) / 100;
  const active = hover || dragging;
  const opacity = active && config.hoverFull !== false ? 1 : idle ? opacityIdle : opacityBase;
  const beginTitleEdit = () => {
    setDraftTitle(config.title || "");
    setEditingTitle(true);
  };
  const commitTitle = () => {
    setEditingTitle(false);
    const next = draftTitle.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX2);
    if (next && next !== config.title) onChange?.({ title: next });
  };
  const cancelTitle = () => {
    setEditingTitle(false);
    setDraftTitle(config.title || "");
  };
  const startDrag = (event) => {
    if (event.button !== 0) return;
    if (event.isPrimary === false) return;
    const target = event.target;
    if (target && typeof target.closest === "function" && target.closest('[data-hud-no-drag="true"]')) return;
    if (dragRef.current) return;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: anchor,
      moved: false,
      // Pointer capture retargets later events to the root, so remember what
      // the user actually pressed to decide between expand/title/open.
      target: event.target
    };
    try {
      if (rootRef.current) rootRef.current.setPointerCapture(event.pointerId);
    } catch {
    }
    bump();
  };
  const moveDrag = (event) => {
    bump();
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (dx * dx + dy * dy < DRAG_START_SQ) return;
      drag.moved = true;
      setDragging(true);
    }
    const next = resolveAnchor(
      { x: drag.origin.x + dx, y: drag.origin.y + dy },
      viewport,
      collapsed,
      cardW,
      cardH
    );
    dragPosRef.current = next;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      if (dragPosRef.current) setDragPos(dragPosRef.current);
    });
  };
  const cancelDrag = () => {
    dragRef.current = null;
    dragPosRef.current = null;
    setDragPos(null);
    setDragging(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  };
  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (event && drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    const finalPosition = drag.moved ? dragPosRef.current || drag.origin : null;
    dragPosRef.current = null;
    setDragPos(null);
    try {
      if (rootRef.current && rootRef.current.hasPointerCapture && rootRef.current.hasPointerCapture(drag.pointerId)) {
        rootRef.current.releasePointerCapture(drag.pointerId);
      }
    } catch {
    }
    if (drag.moved) {
      if (finalPosition) onChange?.({ position: { x: finalPosition.x, y: finalPosition.y } });
      return;
    }
    const target = drag.target;
    const action = target && typeof target.closest === "function" ? target.closest("[data-hud-action]") : null;
    const kind = action ? action.getAttribute("data-hud-action") : "";
    if (kind === "expand") onChange?.({ collapsed: false });
    else if (kind === "title") beginTitleEdit();
    else if (kind === "open") onOpenDashboard?.();
  };
  if (hidden) return null;
  const firstSymbol = rows.length > 0 ? rows[0] : null;
  const firstQuote = firstSymbol ? quoteMap.get(firstSymbol.id) || null : null;
  const firstPct = firstQuote && typeof firstQuote.pct === "number" ? firstQuote.pct : null;
  const pillTone = firstQuote ? signClass(firstPct) : "flat";
  const pillText = firstQuote ? fmtPct(firstPct) : loading && !error ? "\u2026" : "\u2014";
  const updatedText = snapshot && typeof snapshot.updatedAt === "number" ? fmtClock(snapshot.updatedAt) : loading ? t("hud.waiting") : "\u2014";
  const chip = collapsed ? (0, import_react5.createElement)(
    "div",
    {
      key: "chip",
      className: "of-hud-chip-row",
      role: "button",
      tabIndex: 0,
      "data-hud-action": "expand",
      "aria-label": t("hud.collapsedHint"),
      title: t("hud.expand"),
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onChange?.({ collapsed: false });
        }
      }
    },
    (0, import_react5.createElement)(
      "span",
      {
        className: "of-hud-pill",
        "data-tone": pillTone,
        title: firstSymbol ? firstSymbol.fallbackName + " " + pillText : t("hud.waiting")
      },
      pillText
    ),
    (0, import_react5.createElement)("span", { className: "of-hud-mascot" }, (0, import_react5.createElement)(Mark, { size: 22 }))
  ) : null;
  const titleNode = editingTitle ? (0, import_react5.createElement)("input", {
    key: "title-input",
    className: "of-hud-title-input",
    ref: titleInputRef,
    value: draftTitle,
    maxLength: TITLE_MAX2,
    "data-hud-no-drag": "true",
    "aria-label": t("hud.titleLabel"),
    onChange: (event) => setDraftTitle(event.target.value),
    onBlur: commitTitle,
    onKeyDown: (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitTitle();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancelTitle();
      }
    }
  }) : (0, import_react5.createElement)(
    "div",
    {
      key: "title",
      className: "of-hud-title",
      "data-hud-action": "title",
      role: "button",
      tabIndex: 0,
      title: t("hud.titleLabel"),
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          beginTitleEdit();
        }
      }
    },
    config.title || t("hud.title")
  );
  const head = (0, import_react5.createElement)(
    "div",
    { className: "of-hud-head" },
    (0, import_react5.createElement)("span", { className: "of-hud-face" }, (0, import_react5.createElement)(Mark, { size: 15 })),
    titleNode,
    (0, import_react5.createElement)(
      "div",
      { className: "of-hud-actions" },
      typeof onPanic === "function" ? (0, import_react5.createElement)(
        "button",
        {
          type: "button",
          className: "of-hud-ibtn of-hud-panic-btn",
          "data-hud-no-drag": "true",
          title: t("hud.panicNow"),
          "aria-label": t("hud.panicNow"),
          onClick: () => onPanic()
        },
        (0, import_react5.createElement)(HudGlyph, { name: "eye" })
      ) : null,
      (0, import_react5.createElement)(
        "button",
        {
          type: "button",
          className: "of-hud-ibtn",
          "data-hud-no-drag": "true",
          title: t("hud.collapse"),
          "aria-label": t("hud.collapse"),
          onClick: () => onChange?.({ collapsed: true })
        },
        (0, import_react5.createElement)(HudGlyph, { name: "collapse" })
      ),
      (0, import_react5.createElement)(
        "button",
        {
          type: "button",
          className: "of-hud-ibtn",
          "data-hud-no-drag": "true",
          title: t("hud.settings"),
          "aria-label": t("hud.settings"),
          onClick: () => onConfigure?.()
        },
        (0, import_react5.createElement)(HudGlyph, { name: "gear" })
      ),
      (0, import_react5.createElement)(
        "button",
        {
          type: "button",
          className: "of-hud-ibtn",
          "data-hud-no-drag": "true",
          "data-danger": "true",
          title: t("hud.close"),
          "aria-label": t("hud.close"),
          onClick: () => onChange?.({ inline: false })
        },
        (0, import_react5.createElement)(Icon, { name: "close", size: 13 })
      )
    )
  );
  const rowsNode = (0, import_react5.createElement)(
    "div",
    { className: "of-hud-rows" },
    rows.length === 0 ? (0, import_react5.createElement)("div", { className: "of-hud-row", style: { cursor: "default" } }, (0, import_react5.createElement)("span", { className: "of-hud-row-name" }, t("empty"))) : rows.map(
      (row) => (0, import_react5.createElement)(HudRow, {
        key: row.id,
        fallbackName: row.fallbackName,
        quote: quoteMap.get(row.id) || null,
        showSpark: config.showSpark !== false,
        onOpen: onOpenDashboard
      })
    )
  );
  const footNote = error ? (0, import_react5.createElement)(
    "button",
    {
      type: "button",
      className: "of-hud-foot-note",
      "data-error": "true",
      "data-hud-no-drag": "true",
      title: error,
      onClick: () => {
        if (reloadRef.current) reloadRef.current();
      }
    },
    t("hud.error")
  ) : (0, import_react5.createElement)("span", { className: "of-hud-foot-note", title: t("hud.disclaimer") }, t("hud.disclaimer"));
  const foot = (0, import_react5.createElement)(
    "div",
    { className: "of-hud-foot" },
    (0, import_react5.createElement)("span", { className: "of-hud-foot-time", title: t("hud.updated") }, updatedText),
    (0, import_react5.createElement)("span", { className: "of-hud-foot-sep", "aria-hidden": true }, "\xB7"),
    footNote,
    (0, import_react5.createElement)(
      "button",
      {
        type: "button",
        className: "of-hud-ibtn of-hud-foot-btn",
        "data-hud-no-drag": "true",
        title: t("hud.openDashboard"),
        "aria-label": t("hud.openDashboard"),
        onClick: () => onOpenDashboard?.()
      },
      (0, import_react5.createElement)(Icon, { name: "external", size: 12 })
    )
  );
  const card = collapsed ? null : (0, import_react5.createElement)(
    "div",
    {
      key: "card",
      className: "of-hud-card",
      ref: cardRef,
      role: "region",
      "aria-label": config.title || t("hud.title")
    },
    head,
    rowsNode,
    foot
  );
  return (0, import_react5.createElement)(
    "div",
    {
      ref: rootRef,
      className: "of-hud",
      role: "group",
      "aria-label": collapsed ? t("hud.collapsedHint") : config.title || t("hud.title"),
      "data-collapsed": collapsed ? "true" : "false",
      "data-direction": direction,
      "data-reduced": reduceMotion ? "true" : "false",
      "data-idle": idle ? "true" : "false",
      "data-dragging": dragging ? "true" : "false",
      "data-size": size,
      "data-spark": config.showSpark !== false ? "true" : "false",
      style: {
        left: left + "px",
        top: top + "px",
        width: (collapsed ? COLLAPSED_W : cardW) + "px",
        height: (collapsed ? COLLAPSED_H : cardH) + "px",
        opacity,
        "--of-hud-w": cardW + "px"
      },
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: endDrag,
      onPointerCancel: cancelDrag,
      onLostPointerCapture: cancelDrag,
      onPointerEnter: () => {
        setHover(true);
        bump();
      },
      onPointerLeave: () => setHover(false)
    },
    chip,
    card
  );
}

// client/src/components/HudSettings.js
var import_react6 = require("react");
var TITLE_MAX3 = 18;
var IDLE_OPTIONS = [0, 1e4, 3e4, 6e4];
var SIZE_OPTIONS = [
  ["s", "hud.sizeS"],
  ["m", "hud.sizeM"],
  ["l", "hud.sizeL"]
];
function SettingSwitch({ checked, label, disabled, onChange, autoFocus }) {
  return (0, import_react6.createElement)("button", {
    type: "button",
    className: "of-hset-switch",
    role: "switch",
    "aria-checked": checked ? "true" : "false",
    "aria-label": label,
    title: label,
    disabled: Boolean(disabled),
    "data-autofocus": autoFocus ? "true" : void 0,
    onClick: () => onChange(!checked)
  });
}
function HudSettings({ t, config, onChange, status, onRefreshStatus, onClose, onPanicNow }) {
  const [localStatus, setLocalStatus] = (0, import_react6.useState)(null);
  const [recentering, setRecentering] = (0, import_react6.useState)(false);
  const [desktopPending, setDesktopPending] = (0, import_react6.useState)(false);
  const [titleDraft, setTitleDraft] = (0, import_react6.useState)(config.title || "");
  const [searchQuery, setSearchQuery] = (0, import_react6.useState)("");
  const [searchResults, setSearchResults] = (0, import_react6.useState)([]);
  const [searching, setSearching] = (0, import_react6.useState)(false);
  const sheetRef = (0, import_react6.useRef)(null);
  const titleFocusedRef = (0, import_react6.useRef)(false);
  const cancelTitleRef = (0, import_react6.useRef)(false);
  const direction = t("meta.direction") === "intl" ? "intl" : "cn";
  const refreshStatus = (0, import_react6.useCallback)(() => {
    getHud().then(
      (next) => setLocalStatus(next !== null && typeof next === "object" ? next : null),
      () => setLocalStatus(null)
    );
    if (typeof onRefreshStatus === "function") onRefreshStatus();
  }, [onRefreshStatus]);
  (0, import_react6.useEffect)(() => {
    refreshStatus();
  }, [refreshStatus]);
  (0, import_react6.useEffect)(() => {
    if (!desktopPending) return void 0;
    const first = setTimeout(refreshStatus, 700);
    const second = setTimeout(refreshStatus, 2200);
    const settle = setTimeout(() => setDesktopPending(false), 2600);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
      clearTimeout(settle);
    };
  }, [desktopPending, refreshStatus]);
  (0, import_react6.useEffect)(() => {
    if (!titleFocusedRef.current) setTitleDraft(typeof config.title === "string" ? config.title : "");
  }, [config.title]);
  (0, import_react6.useEffect)(() => {
    const query = searchQuery.trim();
    if (query === "") {
      setSearchResults([]);
      setSearching(false);
      return void 0;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(() => {
      searchInstruments(query, controller.signal).then(
        (payload) => {
          if (controller.signal.aborted) return;
          setSearchResults(Array.isArray(payload && payload.results) ? payload.results.slice(0, 8) : []);
          setSearching(false);
        },
        (reason2) => {
          if (controller.signal.aborted || reason2 && reason2.name === "AbortError") return;
          setSearchResults([]);
          setSearching(false);
        }
      );
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);
  (0, import_react6.useEffect)(() => {
    const sheet = sheetRef.current;
    const opener = typeof document !== "undefined" ? document.activeElement : null;
    const focusables = () => {
      if (!sheet) return [];
      return Array.from(
        sheet.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]'
        )
      ).filter((node) => node.offsetParent !== null);
    };
    const initial = sheet ? sheet.querySelector('[data-autofocus="true"]') || focusables()[0] : null;
    if (initial && typeof initial.focus === "function") {
      try {
        initial.focus();
      } catch {
      }
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        const target = event.target;
        const typing = target && target.tagName === "INPUT" && (target.type === "text" || target.type === "search");
        if (typing) return;
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const items = focusables();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (opener && typeof opener.focus === "function") {
        try {
          opener.focus();
        } catch {
        }
      }
    };
  }, [onClose]);
  const onTitleBlur = () => {
    titleFocusedRef.current = false;
    if (cancelTitleRef.current) {
      cancelTitleRef.current = false;
      setTitleDraft(config.title || "");
      return;
    }
    const next = titleDraft.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX3);
    if (next && next !== config.title) onChange?.({ title: next });
    else setTitleDraft(config.title || "");
  };
  const onTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelTitleRef.current = true;
      event.currentTarget.blur();
    }
  };
  const toggleDesktop = (next) => {
    onChange?.({ desktop: next });
    setDesktopPending(true);
  };
  const recenter = () => {
    if (recentering) return;
    setRecentering(true);
    postHud({ action: "recenter" }).then(
      () => {
        setRecentering(false);
        refreshStatus();
      },
      () => setRecentering(false)
    );
  };
  const symbols = Array.isArray(config.symbols) ? config.symbols : [];
  const catalog = config.catalog !== null && typeof config.catalog === "object" ? config.catalog : {};
  const customSymbols = symbols.filter((id) => isCustomSymbol(id));
  const atCap = symbols.length >= 6;
  const panicEnabled = config.panicEnabled !== false;
  const panicShortcut = typeof config.panicShortcut === "string" ? config.panicShortcut : "";
  const panicLabel = panicShortcutLabel(panicShortcut);
  const toggleSymbol = (id) => {
    if (symbols.includes(id)) {
      if (symbols.length <= 1) return;
      const nextSymbols = symbols.filter((entry) => entry !== id);
      if (!isCustomSymbol(id)) {
        onChange?.({ symbols: nextSymbols });
        return;
      }
      const nextCatalog = { ...catalog };
      delete nextCatalog[id];
      onChange?.({ symbols: nextSymbols, catalog: nextCatalog });
      return;
    }
    if (symbols.length >= 6) return;
    onChange?.({ symbols: [...symbols, id] });
  };
  const resultId = (result) => {
    if (result && typeof result.id === "string" && result.id.startsWith("em:")) return result.id;
    const secid = result && typeof result.secid === "string" ? result.secid : "";
    return secid ? "em:" + secid : "";
  };
  const addInstrument = (result) => {
    const id = resultId(result);
    if (!id || symbols.includes(id) || symbols.length >= 6) return;
    const secid = id.slice(3);
    const name2 = ((result && typeof result.name === "string" ? result.name : "") || secid).trim().slice(0, 24);
    const nextCatalog = {
      ...catalog,
      [id]: {
        name: name2,
        secid,
        code: result && typeof result.code === "string" && result.code !== "" ? result.code : secid.slice(secid.indexOf(".") + 1),
        market: result && typeof result.market === "string" ? result.market : "",
        kind: result && typeof result.kind === "string" && result.kind !== "" ? result.kind : "stock"
      }
    };
    onChange?.({ symbols: [...symbols, id], catalog: nextCatalog });
  };
  const removeSymbol = (id) => {
    if (symbols.length <= 1) return;
    toggleSymbol(id);
  };
  const hud = status !== null && status !== void 0 ? status : localStatus;
  const available = hud ? hud.available !== false : null;
  const running = hud ? hud.running === true : false;
  const reason = hud && hud.reason ? String(hud.reason) : "";
  let statusText = t("hud.waiting");
  let statusTone = "muted";
  if (hud) {
    if (hud.available === false) {
      statusText = t("hud.desktopUnavailable");
      statusTone = "warn";
    } else if (hud.running === true) {
      statusText = t("hud.desktopOn");
      statusTone = "ok";
    } else {
      statusText = t("hud.desktopOff");
    }
  }
  const idleAfter = typeof config.idleAfterMs === "number" ? config.idleAfterMs : 0;
  const idleChoices = IDLE_OPTIONS.includes(idleAfter) ? IDLE_OPTIONS.slice() : [...IDLE_OPTIONS, idleAfter];
  idleChoices.sort((left, right) => left - right);
  const opacity = typeof config.opacity === "number" ? config.opacity : 85;
  const idleOpacity = typeof config.idleOpacity === "number" ? config.idleOpacity : 35;
  const size = config.size === "s" || config.size === "l" ? config.size : "m";
  const spark = config.showSpark !== false;
  return (0, import_react6.createElement)(
    "div",
    {
      className: "of-hset-backdrop",
      "data-direction": direction,
      onPointerDown: (event) => {
        if (event.target === event.currentTarget) onClose?.();
      }
    },
    (0, import_react6.createElement)(
      "section",
      {
        className: "of-hset",
        ref: sheetRef,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "of-hset-title",
        tabIndex: -1
      },
      (0, import_react6.createElement)(
        "header",
        { className: "of-hset-head" },
        (0, import_react6.createElement)("span", { className: "of-hset-mark" }, (0, import_react6.createElement)(Mark, { size: 18 })),
        (0, import_react6.createElement)(
          "div",
          { className: "of-hset-titles" },
          (0, import_react6.createElement)("h2", { className: "of-hset-title", id: "of-hset-title" }, t("hud.title")),
          (0, import_react6.createElement)("div", { className: "of-hset-sub" }, t("hud.saved"))
        ),
        (0, import_react6.createElement)(
          "button",
          {
            type: "button",
            className: "of-icon-btn of-hset-close",
            title: t("hud.close"),
            "aria-label": t("hud.close"),
            onClick: () => onClose?.()
          },
          (0, import_react6.createElement)(Icon, { name: "close", size: 14 })
        )
      ),
      (0, import_react6.createElement)(
        "div",
        { className: "of-hset-body" },
        // ------------------------------------------------------ visibility
        (0, import_react6.createElement)(
          "section",
          { className: "of-hset-section" },
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.inline")),
              (0, import_react6.createElement)(SettingSwitch, {
                checked: config.inline === true,
                label: t("hud.inline"),
                autoFocus: true,
                onChange: (next) => onChange?.({ inline: next })
              })
            ),
            (0, import_react6.createElement)("div", { className: "of-hset-hint" }, t("hud.inlineHint"))
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.desktop")),
              (0, import_react6.createElement)(SettingSwitch, {
                checked: config.desktop === true,
                label: t("hud.desktop"),
                disabled: available === false,
                onChange: toggleDesktop
              })
            ),
            (0, import_react6.createElement)("div", { className: "of-hset-hint" }, t("hud.desktopHint")),
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-status", "data-tone": statusTone },
              (0, import_react6.createElement)("span", { className: "of-hset-dot", "aria-hidden": true }),
              (0, import_react6.createElement)("span", { className: "of-hset-status-text" }, statusText),
              reason && !running ? (0, import_react6.createElement)("span", { className: "of-hset-status-reason", title: reason }, reason) : null,
              (0, import_react6.createElement)(
                "button",
                {
                  type: "button",
                  className: "of-btn",
                  style: { flex: "none", marginLeft: "auto", padding: "4px 9px", fontSize: 10.5 },
                  title: t("hud.recenter"),
                  disabled: !running || recentering,
                  onClick: recenter
                },
                t("hud.recenter")
              )
            )
          )
        ),
        // ------------------------------------------------------ instruments
        (0, import_react6.createElement)(
          "section",
          { className: "of-hset-section" },
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-section-head" },
            (0, import_react6.createElement)("span", { className: "of-hset-section-label" }, t("hud.symbols")),
            (0, import_react6.createElement)("span", { className: "of-hset-section-meta", title: t("hud.selectedCount") }, symbols.length + "/6")
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-symbols", role: "group", "aria-label": t("hud.symbols") },
            SYMBOLS.map((symbol) => {
              const selected = symbols.includes(symbol.id);
              return (0, import_react6.createElement)(
                "button",
                {
                  key: symbol.id,
                  type: "button",
                  className: "of-hset-symbol",
                  "aria-pressed": selected ? "true" : "false",
                  title: symbol.name,
                  onClick: () => toggleSymbol(symbol.id)
                },
                (0, import_react6.createElement)("span", { className: "of-hset-check", "aria-hidden": true }, selected ? "\u2713" : ""),
                (0, import_react6.createElement)("span", { className: "of-hset-symbol-name" }, symbol.name)
              );
            })
          ),
          (0, import_react6.createElement)("div", { className: "of-hset-hint" }, t("hud.symbolsHint")),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-search" },
            (0, import_react6.createElement)("input", {
              type: "search",
              className: "of-hset-input of-hset-search-input",
              value: searchQuery,
              placeholder: t("hud.searchPlaceholder"),
              "aria-label": t("hud.searchPlaceholder"),
              onChange: (event) => setSearchQuery(event.target.value),
              onKeyDown: (event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  setSearchQuery("");
                }
              }
            }),
            searchQuery.trim() === "" ? null : (0, import_react6.createElement)(
              "div",
              { className: "of-hset-results", role: "list" },
              searching ? (0, import_react6.createElement)("div", { className: "of-hset-result-empty" }, t("hud.searching")) : searchResults.length === 0 ? (0, import_react6.createElement)("div", { className: "of-hset-result-empty" }, t("hud.searchEmpty")) : searchResults.map((result) => {
                const id = resultId(result);
                const selected = symbols.includes(id);
                const disabled = selected || atCap;
                return (0, import_react6.createElement)(
                  "div",
                  {
                    key: id || result.code || result.name,
                    className: "of-hset-result",
                    "data-selected": selected ? "true" : "false",
                    role: "listitem"
                  },
                  (0, import_react6.createElement)(
                    "div",
                    { className: "of-hset-result-main" },
                    (0, import_react6.createElement)("span", { className: "of-hset-result-name" }, result.name || id),
                    (0, import_react6.createElement)(
                      "div",
                      { className: "of-hset-result-meta" },
                      result.code ? (0, import_react6.createElement)("span", { className: "of-hset-result-code" }, String(result.code)) : null,
                      result.market ? (0, import_react6.createElement)("span", { className: "of-hset-result-market", title: t("hud.market") }, String(result.market)) : null
                    )
                  ),
                  (0, import_react6.createElement)(
                    "button",
                    {
                      type: "button",
                      className: "of-btn of-hset-result-add",
                      disabled,
                      onClick: () => addInstrument(result)
                    },
                    selected ? t("hud.selectedCount") : t("hud.add")
                  )
                );
              })
            ),
            (0, import_react6.createElement)("div", { className: "of-hset-hint" }, t("hud.searchHint"))
          ),
          atCap ? (0, import_react6.createElement)("div", { className: "of-hset-hint of-hset-warn" }, t("hud.customLimit")) : null,
          customSymbols.length > 0 ? (0, import_react6.createElement)(
            "div",
            { className: "of-hset-chips" },
            (0, import_react6.createElement)("span", { className: "of-hset-chips-head" }, t("hud.custom")),
            customSymbols.map(
              (id) => (0, import_react6.createElement)(
                "span",
                {
                  key: id,
                  className: "of-hset-chip",
                  title: catalog[id] && catalog[id].code ? String(catalog[id].code) : id
                },
                (0, import_react6.createElement)("span", { className: "of-hset-chip-name" }, instrumentName(id, config)),
                (0, import_react6.createElement)(
                  "button",
                  {
                    type: "button",
                    className: "of-hset-chip-remove",
                    title: t("hud.remove"),
                    "aria-label": t("hud.remove"),
                    disabled: symbols.length <= 1,
                    onClick: () => removeSymbol(id)
                  },
                  (0, import_react6.createElement)(Icon, { name: "close", size: 10 })
                )
              )
            )
          ) : null
        ),
        // -------------------------------------------------------- appearance
        (0, import_react6.createElement)(
          "section",
          { className: "of-hset-section" },
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.titleLabel")),
              (0, import_react6.createElement)("span", { className: "of-hset-count" }, titleDraft.length + "/" + TITLE_MAX3)
            ),
            (0, import_react6.createElement)("input", {
              type: "text",
              className: "of-hset-input",
              value: titleDraft,
              maxLength: TITLE_MAX3,
              placeholder: t("hud.titleLabel"),
              "aria-label": t("hud.titleLabel"),
              onFocus: () => {
                titleFocusedRef.current = true;
              },
              onBlur: onTitleBlur,
              onChange: (event) => setTitleDraft(event.target.value),
              onKeyDown: onTitleKeyDown
            })
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.opacity")),
              (0, import_react6.createElement)("input", {
                type: "range",
                className: "of-hset-range",
                min: 20,
                max: 100,
                step: 1,
                value: opacity,
                "aria-label": t("hud.opacity"),
                onChange: (event) => onChange?.({ opacity: Number(event.target.value) })
              }),
              (0, import_react6.createElement)("span", { className: "of-hset-value" }, opacity + "%")
            )
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.idleOpacity")),
              (0, import_react6.createElement)("input", {
                type: "range",
                className: "of-hset-range",
                min: 20,
                max: 100,
                step: 1,
                value: idleOpacity,
                disabled: idleAfter === 0,
                "aria-label": t("hud.idleOpacity"),
                onChange: (event) => onChange?.({ idleOpacity: Number(event.target.value) })
              }),
              (0, import_react6.createElement)("span", { className: "of-hset-value" }, idleOpacity + "%")
            )
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.idleAfter")),
              (0, import_react6.createElement)(
                "select",
                {
                  className: "of-hset-select",
                  value: String(idleAfter),
                  "aria-label": t("hud.idleAfter"),
                  onChange: (event) => onChange?.({ idleAfterMs: Number(event.target.value) })
                },
                idleChoices.map(
                  (value) => (0, import_react6.createElement)("option", { key: value, value: String(value) }, value === 0 ? t("hud.idleOff") : Math.round(value / 1e3) + "s")
                )
              )
            )
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.hoverFull")),
              (0, import_react6.createElement)(SettingSwitch, {
                checked: config.hoverFull !== false,
                label: t("hud.hoverFull"),
                onChange: (next) => onChange?.({ hoverFull: next })
              })
            )
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.size")),
              (0, import_react6.createElement)(
                "div",
                { className: "of-hset-seg", role: "group", "aria-label": t("hud.size") },
                SIZE_OPTIONS.map(
                  ([value, key]) => (0, import_react6.createElement)(
                    "button",
                    {
                      key: value,
                      type: "button",
                      className: "of-hset-seg-btn",
                      "aria-pressed": size === value ? "true" : "false",
                      onClick: () => onChange?.({ size: value })
                    },
                    t(key)
                  )
                )
              )
            )
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.spark")),
              (0, import_react6.createElement)(SettingSwitch, {
                checked: spark,
                label: t("hud.spark"),
                onChange: (next) => onChange?.({ showSpark: next })
              })
            )
          )
        ),
        // ------------------------------------------------------------- panic
        (0, import_react6.createElement)(
          "section",
          { className: "of-hset-section of-hset-panic" },
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-section-head" },
            (0, import_react6.createElement)("span", { className: "of-hset-section-label" }, t("hud.panic"))
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.panic")),
              (0, import_react6.createElement)(SettingSwitch, {
                checked: panicEnabled,
                label: t("hud.panic"),
                onChange: (next) => onChange?.({ panicEnabled: next })
              })
            ),
            (0, import_react6.createElement)("div", { className: "of-hset-hint" }, t("hud.panicHint"))
          ),
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-field" },
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-line" },
              (0, import_react6.createElement)("span", { className: "of-hset-label" }, t("hud.panicShortcut")),
              (0, import_react6.createElement)(
                "select",
                {
                  className: "of-hset-select",
                  value: panicEnabled ? panicShortcut : "",
                  disabled: !panicEnabled,
                  "aria-label": t("hud.panicShortcut"),
                  onChange: (event) => {
                    const value = event.target.value;
                    if (value === "") onChange?.({ panicEnabled: false });
                    else onChange?.({ panicEnabled: true, panicShortcut: value });
                  }
                },
                (0, import_react6.createElement)("option", { value: "" }, t("hud.panicOff")),
                PANIC_SHORTCUTS.map(
                  (preset) => (0, import_react6.createElement)("option", { key: preset.id, value: preset.accelerator }, preset.label)
                )
              )
            ),
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-combo", "data-off": panicEnabled ? "false" : "true" },
              panicEnabled ? panicLabel || panicShortcut : t("hud.panicOff")
            ),
            (0, import_react6.createElement)(
              "div",
              { className: "of-hset-actions" },
              (0, import_react6.createElement)(
                "button",
                {
                  type: "button",
                  className: "of-btn",
                  disabled: typeof onPanicNow !== "function",
                  onClick: () => {
                    if (typeof onPanicNow === "function") onPanicNow();
                  }
                },
                t("hud.panicNow")
              )
            )
          )
        ),
        // ---------------------------------------------------------- position
        (0, import_react6.createElement)(
          "section",
          { className: "of-hset-section" },
          (0, import_react6.createElement)(
            "div",
            { className: "of-hset-actions" },
            (0, import_react6.createElement)(
              "button",
              {
                type: "button",
                className: "of-btn",
                onClick: () => onChange?.({ position: { x: 0, y: 0 } })
              },
              t("hud.resetPosition")
            ),
            (0, import_react6.createElement)("span", { className: "of-hset-hint" }, t("hud.positionHint"))
          )
        )
      )
    )
  );
}

// client/src/components/Tabs.js
var import_react7 = require("react");
function Tabs({ items, value, onChange, ariaLabel }) {
  return (0, import_react7.createElement)(
    "div",
    { className: "of-tabs", role: "tablist", "aria-label": ariaLabel },
    items.map(
      (item) => (0, import_react7.createElement)(
        "button",
        {
          key: item.id,
          type: "button",
          role: "tab",
          className: "of-tab",
          "aria-selected": item.id === value,
          "aria-controls": "of-panel-" + item.id,
          onClick: () => onChange(item.id)
        },
        item.label
      )
    )
  );
}
function RefreshButton({ label, busy, onClick }) {
  return (0, import_react7.createElement)(
    "button",
    {
      type: "button",
      className: "of-icon-btn",
      "data-busy": busy ? "true" : "false",
      title: label,
      "aria-label": label,
      onClick
    },
    (0, import_react7.createElement)(Icon, { name: "refresh", size: 15 })
  );
}

// client/src/views/Dashboard.js
var import_react12 = require("react");

// client/src/components/Feedback.js
var import_react8 = require("react");
function Skeleton({ height = 12, width = "100%", radius, style, className }) {
  return (0, import_react8.createElement)("div", {
    className: className ? "of-skeleton " + className : "of-skeleton",
    style: { height, width, borderRadius: radius, ...style },
    "aria-hidden": true
  });
}
function SkeletonLines({ lines = 3, gap = 8 }) {
  return (0, import_react8.createElement)(
    "div",
    { style: { display: "flex", flexDirection: "column", gap }, "aria-hidden": true },
    Array.from(
      { length: lines },
      (_, index) => (0, import_react8.createElement)(Skeleton, {
        key: index,
        height: 10,
        width: index === lines - 1 ? "62%" : "100%",
        radius: 5
      })
    )
  );
}
function EmptyState({ title, body, icon }) {
  return (0, import_react8.createElement)(
    "div",
    { className: "of-empty" },
    icon ? (0, import_react8.createElement)("div", { className: "of-empty-icon" }, icon) : null,
    title ? (0, import_react8.createElement)("div", { className: "of-error-title" }, title) : null,
    body ? (0, import_react8.createElement)("div", null, body) : null
  );
}
function ErrorState({ title, body, retryLabel, onRetry }) {
  return (0, import_react8.createElement)(
    "div",
    { className: "of-error", role: "alert" },
    (0, import_react8.createElement)("div", { className: "of-error-title" }, title),
    body ? (0, import_react8.createElement)("div", null, body) : null,
    onRetry && retryLabel ? (0, import_react8.createElement)("button", { type: "button", className: "of-btn", onClick: onRetry, style: { marginTop: 4 } }, retryLabel) : null
  );
}

// client/src/components/QuoteCard.js
var import_react9 = require("react");
function QuoteCard({ quote, index = 0 }) {
  const direction = signClass(quote.pct);
  const shown = useCountUp(quote.price, 460);
  const digits = Number.isFinite(quote.digits) ? quote.digits : 2;
  return (0, import_react9.createElement)(
    "div",
    { className: "of-quote of-stagger", style: { "--i": index } },
    (0, import_react9.createElement)(
      "div",
      { className: "of-quote-name" },
      (0, import_react9.createElement)("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, quote.name),
      (0, import_react9.createElement)("span", {
        className: "of-quote-dot " + (direction === "up" ? "of-up" : direction === "down" ? "of-down" : "of-flat"),
        style: { background: "currentColor" }
      })
    ),
    (0, import_react9.createElement)("div", { className: "of-quote-price" }, fmtPrice(shown, digits)),
    (0, import_react9.createElement)(
      "div",
      { className: "of-quote-change of-" + direction },
      (0, import_react9.createElement)("span", null, fmtPct(quote.pct)),
      Number.isFinite(quote.change) ? (0, import_react9.createElement)("span", { style: { opacity: 0.62 } }, fmtChange(quote.change, digits)) : null
    ),
    (0, import_react9.createElement)(Sparkline, { values: quote.spark, up: direction === "up" })
  );
}

// client/src/components/Heatmap.js
var import_react10 = require("react");

// client/src/layout.js
function squarify(items, box) {
  const rects = [];
  if (!Array.isArray(items) || items.length === 0) return rects;
  const width = Math.max(0, box.width);
  const height = Math.max(0, box.height);
  if (!width || !height) return rects;
  const entries = items.filter((item) => item && Number.isFinite(item.weight) && item.weight > 0).slice().sort((a, b) => b.weight - a.weight).map((item) => ({ item, area: item.weight }));
  const total = entries.reduce((sum, entry) => sum + entry.area, 0);
  if (!total) return rects;
  const scale = width * height / total;
  for (const entry of entries) entry.area *= scale;
  let x = box.x;
  let y = box.y;
  let w = width;
  let h23 = height;
  let index = 0;
  while (index < entries.length) {
    const side = Math.min(w, h23);
    if (side <= 0) break;
    const row = [];
    let previousRatio = Infinity;
    while (index < entries.length) {
      const candidate = row.concat(entries[index]);
      const ratio = worstRatio(candidate, side);
      if (ratio > previousRatio && row.length > 0) break;
      previousRatio = ratio;
      row.push(entries[index]);
      index += 1;
    }
    if (row.length === 0) break;
    const rowArea = row.reduce((sum, entry) => sum + entry.area, 0);
    const thickness = side > 0 ? rowArea / side : 0;
    if (w >= h23) {
      let cursor = y;
      for (const entry of row) {
        const cellHeight = rowArea > 0 ? entry.area / rowArea * h23 : 0;
        rects.push({ item: entry.item, x, y: cursor, w: thickness, h: cellHeight });
        cursor += cellHeight;
      }
      x += thickness;
      w -= thickness;
    } else {
      let cursor = x;
      for (const entry of row) {
        const cellWidth = rowArea > 0 ? entry.area / rowArea * w : 0;
        rects.push({ item: entry.item, x: cursor, y, w: cellWidth, h: thickness });
        cursor += cellWidth;
      }
      y += thickness;
      h23 -= thickness;
    }
  }
  return rects;
}
function worstRatio(row, side) {
  if (side <= 0) return Infinity;
  let sum = 0;
  let max = 0;
  let min = Infinity;
  for (const entry of row) {
    sum += entry.area;
    if (entry.area > max) max = entry.area;
    if (entry.area < min) min = entry.area;
  }
  if (sum <= 0 || min === Infinity || min <= 0) return Infinity;
  const sideSquared = side * side;
  const sumSquared = sum * sum;
  return Math.max(sideSquared * max / sumSquared, sumSquared / (sideSquared * min));
}

// client/src/components/Heatmap.js
var MAX_ALPHA = 6;
function placeTip(tip, size) {
  const left = Math.max(56, Math.min(size.width - 56, tip.x));
  const below = tip.y < 62;
  return {
    left,
    top: below ? tip.y + (tip.height || 0) + 6 : Math.max(58, tip.y - 2),
    transform: below ? "translate(-50%, 0)" : "translate(-50%, -108%)"
  };
}
function cellBackground(pct) {
  const token = pct >= 0 ? "var(--of-up)" : "var(--of-down)";
  const clamped = Math.min(Math.abs(pct), MAX_ALPHA) / MAX_ALPHA;
  const strength = Math.round(9 + clamped * 61);
  return `color-mix(in srgb, ${token} ${strength}%, var(--of-surface-2))`;
}
function Heatmap({ boards, activeCode, onSelect, t }) {
  const hostRef = (0, import_react10.useRef)(null);
  const [size, setSize] = (0, import_react10.useState)({ width: 0, height: 0 });
  const [tip, setTip] = (0, import_react10.useState)(null);
  (0, import_react10.useEffect)(() => {
    const node = hostRef.current;
    if (!node || typeof ResizeObserver === "undefined") return void 0;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0] && entries[0].contentRect;
      if (rect) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(node);
    setSize({ width: node.clientWidth, height: node.clientHeight });
    return () => observer.disconnect();
  }, []);
  const rects = (0, import_react10.useMemo)(() => {
    if (!Array.isArray(boards) || size.width < 20 || size.height < 20) return [];
    const items = boards.map((board) => ({
      board,
      weight: Number.isFinite(board.marketCap) && board.marketCap > 0 ? board.marketCap : 1
    }));
    return squarify(items, { x: 0, y: 0, width: size.width, height: size.height });
  }, [boards, size.width, size.height]);
  return (0, import_react10.createElement)(
    "div",
    {
      className: "of-heat",
      ref: hostRef,
      role: "group",
      "aria-label": t("market.heatmap"),
      onMouseLeave: () => setTip(null)
    },
    rects.map(({ item, x, y, w, h: height }) => {
      const board = item.board;
      const direction = signClass(board.pct);
      const pale = Math.abs(board.pct) < 1.2;
      const showPct = height >= 32 && w >= 42;
      const showName = w >= 30 && height >= 16;
      return (0, import_react10.createElement)(
        "button",
        {
          key: board.code,
          type: "button",
          className: "of-heat-cell",
          "data-pale": pale ? "true" : "false",
          "data-active": board.code === activeCode ? "true" : "false",
          style: {
            left: x + 0.75,
            top: y + 0.75,
            width: Math.max(0, w - 1.5),
            height: Math.max(0, height - 1.5),
            background: cellBackground(board.pct)
          },
          title: board.name + " " + fmtPct(board.pct),
          onMouseEnter: () => setTip({ board, x: x + w / 2, y, height }),
          onFocus: () => setTip({ board, x: x + w / 2, y, height }),
          onBlur: () => setTip(null),
          onClick: () => onSelect && onSelect(board)
        },
        showName ? (0, import_react10.createElement)("div", { className: "of-heat-label" }, board.name) : null,
        showPct ? (0, import_react10.createElement)(
          "div",
          { className: "of-heat-pct of-" + direction },
          fmtPct(board.pct)
        ) : null
      );
    }),
    tip ? (0, import_react10.createElement)(
      "div",
      {
        className: "of-heat-tip",
        style: placeTip(tip, size)
      },
      (0, import_react10.createElement)("div", { className: "of-heat-tip-name" }, tip.board.name),
      (0, import_react10.createElement)(
        "div",
        { className: "of-heat-tip-row" },
        (0, import_react10.createElement)("span", null, t("market.tooltipChange")),
        (0, import_react10.createElement)("b", { className: "of-" + signClass(tip.board.pct) }, fmtPct(tip.board.pct))
      ),
      (0, import_react10.createElement)(
        "div",
        { className: "of-heat-tip-row" },
        (0, import_react10.createElement)("span", null, t("market.tooltipPrice")),
        (0, import_react10.createElement)("span", null, fmtPrice(tip.board.price, 2))
      ),
      (0, import_react10.createElement)(
        "div",
        { className: "of-heat-tip-row" },
        (0, import_react10.createElement)("span", null, t("market.tooltipCap")),
        (0, import_react10.createElement)("span", null, fmtCompact(tip.board.marketCap))
      )
    ) : null
  );
}

// client/src/components/MarketLists.js
var import_react11 = require("react");
function MoversList({ movers, t }) {
  const [tab, setTab] = (0, import_react11.useState)("up");
  const rows = Array.isArray(movers && movers[tab]) ? movers[tab] : [];
  const tabs = [
    { id: "up", label: t("market.gainers") },
    { id: "down", label: t("market.losers") },
    { id: "active", label: t("market.active") }
  ];
  return (0, import_react11.createElement)(
    "div",
    null,
    (0, import_react11.createElement)(
      "div",
      { className: "of-section-head", style: { padding: "12px 14px 0" } },
      (0, import_react11.createElement)("h3", { className: "of-section-title" }, t("market.movers"))
    ),
    (0, import_react11.createElement)(
      "div",
      { className: "of-movers-tabs", role: "tablist" },
      tabs.map(
        (item) => (0, import_react11.createElement)(
          "button",
          {
            key: item.id,
            type: "button",
            role: "tab",
            className: "of-movers-tab",
            "aria-selected": item.id === tab,
            onClick: () => setTab(item.id)
          },
          item.label
        )
      )
    ),
    rows.length === 0 ? (0, import_react11.createElement)("div", { className: "of-empty", style: { padding: "14px 18px" } }, t("empty")) : (0, import_react11.createElement)(
      "div",
      { className: "of-movers", role: "tabpanel" },
      rows.map(
        (row, index) => (0, import_react11.createElement)(
          "div",
          { key: row.code || index, className: "of-mover" },
          (0, import_react11.createElement)("span", { className: "of-mover-rank" }, index + 1),
          (0, import_react11.createElement)(
            "span",
            { className: "of-mover-name" },
            row.name,
            (0, import_react11.createElement)("span", { className: "of-mover-code" }, row.code)
          ),
          (0, import_react11.createElement)(
            "span",
            { className: "of-mover-pct of-" + signClass(row.pct) },
            tab === "active" && Number.isFinite(row.amount) ? fmtCompact(row.amount) : fmtPct(row.pct)
          )
        )
      )
    )
  );
}
function NewsList({ news, t, limit = 8 }) {
  const items = Array.isArray(news) ? news.slice(0, limit) : [];
  return (0, import_react11.createElement)(
    "div",
    null,
    (0, import_react11.createElement)(
      "div",
      { className: "of-section-head", style: { padding: "12px 14px 0" } },
      (0, import_react11.createElement)("h3", { className: "of-section-title" }, t("market.news")),
      (0, import_react11.createElement)("span", { className: "of-section-hint" }, t("market.newsHint"))
    ),
    items.length === 0 ? (0, import_react11.createElement)("div", { className: "of-empty", style: { padding: "14px 18px" } }, t("empty")) : (0, import_react11.createElement)(
      "div",
      { className: "of-news" },
      items.map(
        (item) => (0, import_react11.createElement)(
          "a",
          {
            key: item.id,
            className: "of-news-item",
            href: item.url,
            target: "_blank",
            rel: "noreferrer noopener"
          },
          (0, import_react11.createElement)("div", { className: "of-news-time" }, item.time || ""),
          (0, import_react11.createElement)("div", { className: "of-news-title" }, item.title)
        )
      )
    )
  );
}
function StockRow({ stock }) {
  return (0, import_react11.createElement)(
    "div",
    { className: "of-stock" },
    (0, import_react11.createElement)("span", { className: "of-stock-name" }, stock.name),
    (0, import_react11.createElement)("span", { className: "of-stock-code" }, stock.code),
    (0, import_react11.createElement)("span", { className: "of-stock-pct of-" + signClass(stock.pct) }, fmtPct(stock.pct))
  );
}
function SectorPanel({ sector, loading, onClose, t }) {
  const open = Boolean(sector);
  const stocks = sector && Array.isArray(sector.stocks) ? sector.stocks : [];
  return (0, import_react11.createElement)(
    "div",
    { className: "of-sector", "data-open": open ? "true" : "false" },
    (0, import_react11.createElement)(
      "div",
      { className: "of-sector-inner" },
      (0, import_react11.createElement)(
        "div",
        { className: "of-sector-pad" },
        (0, import_react11.createElement)(
          "div",
          { className: "of-sector-head" },
          (0, import_react11.createElement)("span", { className: "of-sector-name" }, sector ? sector.name : ""),
          sector ? (0, import_react11.createElement)("span", { className: "of-chip", "data-tone": "brand" }, fmtPct(sector.pct)) : null,
          (0, import_react11.createElement)("span", { style: { flex: 1 } }),
          (0, import_react11.createElement)(
            "button",
            {
              type: "button",
              className: "of-icon-btn",
              style: { width: 26, height: 26 },
              onClick: onClose,
              "aria-label": t("market.closeSector")
            },
            (0, import_react11.createElement)("span", { style: { fontSize: 14, lineHeight: 1 } }, "\xD7")
          )
        ),
        loading ? (0, import_react11.createElement)("div", { className: "of-skeleton", style: { height: 54 } }) : stocks.length === 0 ? (0, import_react11.createElement)("div", { className: "of-empty", style: { padding: "10px 0" } }, t("market.sectorEmpty")) : (0, import_react11.createElement)(
          "div",
          { className: "of-sector-stocks" },
          stocks.map((stock) => (0, import_react11.createElement)(StockRow, { key: stock.code, stock }))
        ),
        sector ? (0, import_react11.createElement)(
          "div",
          { className: "of-meta", style: { marginTop: 8 } },
          t("market.sectorHint")
        ) : null
      )
    )
  );
}

// client/src/views/Dashboard.js
function Dashboard({ t, snapshot, loading, error, onRetry }) {
  const [sector, setSector] = (0, import_react12.useState)(null);
  const [sectorLoading, setSectorLoading] = (0, import_react12.useState)(false);
  const sectorRequest = (0, import_react12.useRef)(null);
  const clearSector = (0, import_react12.useCallback)(() => {
    if (sectorRequest.current) sectorRequest.current.abort();
    sectorRequest.current = null;
    setSector(null);
    setSectorLoading(false);
  }, []);
  const selectSector = (0, import_react12.useCallback)(
    (board) => {
      if (!board) return;
      if (sectorRequest.current) sectorRequest.current.abort();
      const controller = new AbortController();
      sectorRequest.current = controller;
      setSector({ code: board.code, name: board.name, pct: board.pct, stocks: [] });
      setSectorLoading(true);
      getSector(board.code, controller.signal).then(
        (detail) => {
          if (controller.signal.aborted) return;
          setSector({
            code: board.code,
            name: detail.name || board.name,
            pct: typeof detail.pct === "number" ? detail.pct : board.pct,
            stocks: Array.isArray(detail.stocks) ? detail.stocks : []
          });
          setSectorLoading(false);
        },
        (reason) => {
          if (controller.signal.aborted) return;
          setSector({ code: board.code, name: board.name, pct: board.pct, stocks: [] });
          setSectorLoading(false);
        }
      );
    },
    [sector]
  );
  (0, import_react12.useEffect)(() => () => {
    if (sectorRequest.current) sectorRequest.current.abort();
  }, []);
  if (!snapshot && loading) return (0, import_react12.createElement)(DashboardSkeleton, { t });
  if (!snapshot && error) {
    return (0, import_react12.createElement)(ErrorState, {
      title: t("error.title"),
      body: error,
      retryLabel: t("retry"),
      onRetry
    });
  }
  if (!snapshot) return (0, import_react12.createElement)(EmptyState, { title: t("empty") });
  const quotes = Array.isArray(snapshot.quotes) ? snapshot.quotes : [];
  const boards = Array.isArray(snapshot.boards) ? snapshot.boards : [];
  const breadth = snapshot.boardBreadth || null;
  const failedParts = Array.isArray(snapshot.parts) ? snapshot.parts.filter((part) => !part.ok) : [];
  return (0, import_react12.createElement)(
    "div",
    { className: "of-dashboard" },
    failedParts.length > 0 || snapshot.stale ? (0, import_react12.createElement)(
      "div",
      { className: "of-foot", style: { margin: "0 0 12px", paddingTop: 0, borderTop: 0 } },
      (0, import_react12.createElement)("span", { className: "of-badge" }, t("partial")),
      (0, import_react12.createElement)(
        "span",
        null,
        failedParts.map((part) => part.id).join(" \xB7 ") + (snapshot.stale ? " \xB7 cached" : "")
      )
    ) : null,
    (0, import_react12.createElement)(
      "section",
      { className: "of-section" },
      (0, import_react12.createElement)(
        "div",
        { className: "of-section-head" },
        (0, import_react12.createElement)("h3", { className: "of-section-title" }, t("market.indices")),
        (0, import_react12.createElement)("span", { className: "of-section-hint" }, t("market.indicesHint"))
      ),
      quotes.length === 0 ? (0, import_react12.createElement)(EmptyState, { title: t("empty"), body: t("market.partialBody") }) : (0, import_react12.createElement)(
        "div",
        { className: "of-grid of-grid-quotes" },
        quotes.map((quote, index) => (0, import_react12.createElement)(QuoteCard, { key: quote.id, quote, index }))
      )
    ),
    (0, import_react12.createElement)(
      "section",
      { className: "of-section" },
      (0, import_react12.createElement)(
        "div",
        { className: "of-grid of-grid-main" },
        (0, import_react12.createElement)(
          "div",
          { className: "of-card of-heat-card of-fade-in" },
          (0, import_react12.createElement)(
            "div",
            { className: "of-heat-top" },
            (0, import_react12.createElement)("h3", { className: "of-section-title" }, t("market.heatmap")),
            breadth ? (0, import_react12.createElement)(
              "div",
              { className: "of-heat-breadth", title: t("market.breadth") },
              (0, import_react12.createElement)("span", { className: "of-up" }, String(breadth.up || 0)),
              (0, import_react12.createElement)(
                "span",
                { className: "of-breadth-bar", "aria-hidden": true },
                (0, import_react12.createElement)("span", {
                  className: "of-breadth-up",
                  style: { width: share(breadth.up, breadth.total) + "%" }
                }),
                (0, import_react12.createElement)("span", {
                  className: "of-breadth-flat",
                  style: { width: share(breadth.flat, breadth.total) + "%" }
                }),
                (0, import_react12.createElement)("span", {
                  className: "of-breadth-down",
                  style: { width: share(breadth.down, breadth.total) + "%" }
                })
              ),
              (0, import_react12.createElement)("span", { className: "of-down" }, String(breadth.down || 0))
            ) : null
          ),
          (0, import_react12.createElement)(Heatmap, {
            boards,
            activeCode: sector ? sector.code : null,
            onSelect: selectSector,
            t
          }),
          (0, import_react12.createElement)(
            "div",
            { className: "of-heat-legend" },
            (0, import_react12.createElement)("span", null, "-5%"),
            (0, import_react12.createElement)("span", { className: "of-legend-ramp" }),
            (0, import_react12.createElement)("span", null, "+5%"),
            (0, import_react12.createElement)("span", { style: { flex: 1 } }),
            (0, import_react12.createElement)("span", null, t("market.heatmapHint"))
          ),
          (0, import_react12.createElement)(SectorPanel, {
            sector,
            loading: sectorLoading,
            onClose: clearSector,
            t
          })
        ),
        (0, import_react12.createElement)(
          "div",
          { className: "of-rail" },
          (0, import_react12.createElement)("div", { className: "of-card of-fade-in" }, (0, import_react12.createElement)(MoversList, { movers: snapshot.movers, t })),
          (0, import_react12.createElement)("div", { className: "of-card of-fade-in" }, (0, import_react12.createElement)(NewsList, { news: snapshot.news, t }))
        )
      )
    )
  );
}
function share(value, total) {
  const count = Number(value) || 0;
  const whole = Number(total) || 0;
  if (!whole) return 0;
  return Math.round(count / whole * 100);
}
function DashboardSkeleton({ t }) {
  return (0, import_react12.createElement)(
    "div",
    { "aria-label": t("loading"), "aria-busy": true },
    (0, import_react12.createElement)(
      "div",
      { className: "of-grid of-grid-quotes" },
      Array.from(
        { length: 11 },
        (_, index) => (0, import_react12.createElement)(
          "div",
          { key: index, className: "of-quote" },
          (0, import_react12.createElement)(Skeleton, { height: 10, width: "56%" }),
          (0, import_react12.createElement)(Skeleton, { height: 20, width: "76%", style: { marginTop: 10 } }),
          (0, import_react12.createElement)(Skeleton, { height: 10, width: "44%", style: { marginTop: 8 } })
        )
      )
    ),
    (0, import_react12.createElement)(
      "div",
      { className: "of-grid of-grid-main", style: { marginTop: 14 } },
      (0, import_react12.createElement)(
        "div",
        { className: "of-card of-pad" },
        (0, import_react12.createElement)(Skeleton, { height: 400, radius: 12 })
      ),
      (0, import_react12.createElement)(
        "div",
        { className: "of-card of-pad" },
        (0, import_react12.createElement)(SkeletonLines, { lines: 8 })
      )
    )
  );
}

// client/src/views/Academy.js
var import_react17 = require("react");

// client/src/components/AcademyCard.js
var import_react14 = require("react");

// client/src/components/Chip.js
var import_react13 = require("react");
function Chip({ children, tone }) {
  return (0, import_react13.createElement)("span", { className: "of-chip", "data-tone": tone }, children);
}
function Tag({ children }) {
  return (0, import_react13.createElement)("span", { className: "of-tag" }, children);
}
function DifficultyDots({ value, label }) {
  const level = Math.max(1, Math.min(4, Number(value) || 1));
  return (0, import_react13.createElement)(
    "span",
    { className: "of-dots", title: label, "aria-label": label },
    [0, 1, 2, 3].map(
      (index) => (0, import_react13.createElement)("span", { key: index, className: "of-dot" + (index < level ? " of-dot-on" : "") })
    )
  );
}

// client/src/components/AcademyCard.js
function AcademyCard(props) {
  const t = props.t;
  const article = props.article || {};
  const index = typeof props.index === "number" ? props.index : 0;
  const readMinutes = Number(article.readMinutes);
  const difficulty = Number(article.difficulty);
  return (0, import_react14.createElement)(
    "button",
    {
      type: "button",
      className: "of-acard of-stagger",
      style: { "--i": String(index) },
      onClick: () => props.onOpen(article.id)
    },
    (0, import_react14.createElement)("span", { className: "of-acard-title" }, article.title || article.id),
    article.dek ? (0, import_react14.createElement)("span", { className: "of-acard-dek" }, article.dek) : null,
    (0, import_react14.createElement)(
      "span",
      { className: "of-acard-meta" },
      article.tag ? (0, import_react14.createElement)(Tag, null, article.tag) : null,
      readMinutes > 0 ? (0, import_react14.createElement)("span", { className: "of-meta" }, t("academy.readMinutes", { n: readMinutes })) : null,
      difficulty > 0 ? (0, import_react14.createElement)(DifficultyDots, { value: difficulty, label: t("academy.difficulty", { n: difficulty }) }) : null
    )
  );
}

// client/src/components/FilterChips.js
var import_react15 = require("react");
function FilterChips(props) {
  const sections = Array.isArray(props.sections) ? props.sections : [];
  const active = props.active;
  const onSelect = props.onSelect;
  if (sections.length === 0) return null;
  return (0, import_react15.createElement)(
    "div",
    { className: "of-filters", role: "group", "aria-label": props.label || void 0 },
    sections.map(
      (section) => (0, import_react15.createElement)(
        "button",
        {
          key: section.id,
          type: "button",
          className: section.id === active ? "of-filter of-filter-active" : "of-filter",
          "aria-pressed": section.id === active,
          onClick: () => onSelect(section.id)
        },
        section.label
      )
    )
  );
}

// client/src/components/SearchBox.js
var import_react16 = require("react");
function SearchBox(props) {
  const value = typeof props.value === "string" ? props.value : "";
  const placeholder = props.placeholder || "";
  const onChange = props.onChange;
  return (0, import_react16.createElement)(
    "div",
    { className: "of-search" },
    (0, import_react16.createElement)("span", { className: "of-search-icon", "aria-hidden": "true" }, (0, import_react16.createElement)(Icon, { name: "search", size: 14 })),
    (0, import_react16.createElement)("input", {
      className: "of-search-input",
      type: "search",
      value,
      placeholder,
      "aria-label": placeholder,
      autoComplete: "off",
      autoCapitalize: "off",
      autoCorrect: "off",
      spellCheck: false,
      onChange: (event) => onChange(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Escape" && value) {
          event.preventDefault();
          onChange("");
        }
      }
    })
  );
}

// client/src/views/Academy.js
var ALL = "all";
var LOADING_CARDS = [0, 1, 2, 3, 4, 5];
function searchText(article) {
  const parts = [article.title, article.dek, article.tag, article.sectionLabel, article.id];
  if (Array.isArray(article.tags)) parts.push(article.tags.join(" "));
  return parts.filter(Boolean).join(" ").toLowerCase();
}
function Academy(props) {
  const t = props.t;
  const onOpenArticle = props.onOpenArticle;
  const { loading, data, error, reload } = useResource((signal) => getAcademy(signal), []);
  const [query, setQuery] = (0, import_react17.useState)("");
  const [section, setSection] = (0, import_react17.useState)(ALL);
  const rootRef = (0, import_react17.useRef)(null);
  const articles = data && Array.isArray(data.articles) ? data.articles : [];
  const sections = data && Array.isArray(data.sections) ? data.sections : [];
  const activeSection = sections.some((item) => item.id === section) ? section : ALL;
  (0, import_react17.useEffect)(() => {
    const node = rootRef.current;
    const page = node && typeof node.closest === "function" ? node.closest(".of-page") : null;
    if (page) page.scrollTop = 0;
  }, []);
  const filtered = (0, import_react17.useMemo)(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (activeSection !== ALL && article.section !== activeSection) return false;
      return needle ? searchText(article).includes(needle) : true;
    });
  }, [articles, activeSection, query]);
  const isFiltered = query.trim() !== "" || activeSection !== ALL;
  return (0, import_react17.createElement)(
    "div",
    { className: "of-academy of-fade-in", ref: rootRef },
    (0, import_react17.createElement)(
      "div",
      { className: "of-toolbar" },
      (0, import_react17.createElement)(SearchBox, { value: query, onChange: setQuery, placeholder: t("academy.search") })
    ),
    sections.length > 0 ? (0, import_react17.createElement)(FilterChips, {
      sections,
      active: activeSection,
      onSelect: setSection,
      label: t("academy.title")
    }) : null,
    loading ? (0, import_react17.createElement)(
      "div",
      { className: "of-cards", "aria-busy": "true", "aria-label": t("a11y.loading") },
      LOADING_CARDS.map((index) => (0, import_react17.createElement)(Skeleton, { key: index, height: 118, radius: 14 }))
    ) : error ? (0, import_react17.createElement)(ErrorState, {
      title: t("error.title"),
      body: error,
      retryLabel: t("retry"),
      onRetry: reload
    }) : filtered.length === 0 ? (0, import_react17.createElement)(EmptyState, {
      title: isFiltered ? t("academy.searchEmpty") : t("academy.empty"),
      icon: (0, import_react17.createElement)(Icon, { name: "search", size: 20 })
    }) : (0, import_react17.createElement)(
      "div",
      { className: "of-cards" },
      filtered.map(
        (article, index) => (0, import_react17.createElement)(AcademyCard, {
          key: article.id,
          t,
          article,
          index,
          onOpen: onOpenArticle
        })
      )
    )
  );
}

// client/src/views/ArticleView.js
var import_react21 = require("react");

// client/src/components/ArticleBody.js
var import_react19 = require("react");

// client/src/md.js
var import_react18 = require("react");
var HEADING_RE = /^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/;
var UNORDERED_RE = /^([ \t]*)[-*+][ \t]+(.*)$/;
var ORDERED_RE = /^([ \t]*)(\d{1,3})[.)][ \t]+(.*)$/;
var QUOTE_RE = /^[ \t]*>[ \t]?(.*)$/;
var TABLE_ROW_RE = /^[ \t]*\|/;
var HR_RE = /^[ \t]*-(?:[ \t]*-){2,}[ \t]*$/;
var SEPARATOR_CELL_RE = /^:?-{2,}:?$/;
var SEPARATOR_CHARS_RE = /^[|\s:-]+$/;
var EXTERNAL_HREF_RE = /^(https?:|mailto:)/i;
function pushText(nodes, value) {
  const text = String(value);
  if (!text) return;
  const last = nodes[nodes.length - 1];
  if (last && last.type === "text") last.value += text;
  else nodes.push({ type: "text", value: text });
}
function parseInline(text, depth = 0) {
  const source = String(text == null ? "" : text);
  if (!source) return [];
  if (depth > 4) return [{ type: "text", value: source }];
  const re = /!\[(?<imageAlt>[^\]]*)\]\((?<imageSrc>[^)\s]*)\)|\*\*(?<strong>[\s\S]+?)\*\*|\*(?<em>[^\s*\n](?:[^*\n]*[^\s*])?)\*|`(?<code>[^`\n]+)`|\[\[(?<termId>[^\]|\n]+)\|(?<termText>[^\]\n]+)\]\]|\[(?<linkText>[^\]\n]+)\]\((?<href>[^)\s]+)\)/g;
  const nodes = [];
  let last = 0;
  let match;
  while (match = re.exec(source)) {
    const groups = match.groups || {};
    if (match.index > last) pushText(nodes, source.slice(last, match.index));
    last = re.lastIndex;
    if (groups.imageAlt !== void 0) {
      pushText(nodes, groups.imageAlt);
    } else if (groups.strong !== void 0) {
      const children = parseInline(groups.strong, depth + 1);
      if (children.length) nodes.push({ type: "strong", children });
      else pushText(nodes, match[0]);
    } else if (groups.em !== void 0) {
      const previous = match.index > 0 ? source[match.index - 1] : "";
      if (/[0-9A-Za-z]/.test(previous)) {
        pushText(nodes, match[0]);
        continue;
      }
      const children = parseInline(groups.em, depth + 1);
      if (children.length) nodes.push({ type: "em", children });
      else pushText(nodes, match[0]);
    } else if (groups.code !== void 0) {
      nodes.push({ type: "code", value: groups.code });
    } else if (groups.termId !== void 0) {
      nodes.push({ type: "term", id: groups.termId.trim(), text: groups.termText });
    } else if (groups.linkText !== void 0) {
      const href = groups.href;
      if (EXTERNAL_HREF_RE.test(href)) {
        const children = parseInline(groups.linkText, depth + 1);
        if (children.length) nodes.push({ type: "link", href, children });
      } else {
        pushText(nodes, groups.linkText);
      }
    }
  }
  if (last < source.length) pushText(nodes, source.slice(last));
  return nodes;
}
function splitTableRow(line) {
  let text = String(line).trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|")) text = text.slice(0, -1);
  const cells = [];
  let current = "";
  let inTerm = false;
  let inCode = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\\" && text[i + 1] === "|") {
      current += "|";
      i++;
      continue;
    }
    if (!inCode && ch === "`") {
      inCode = !inCode;
      current += ch;
      continue;
    }
    if (!inCode && ch === "[" && text[i + 1] === "[") {
      inTerm = true;
      current += "[[";
      i++;
      continue;
    }
    if (inTerm && ch === "]" && text[i + 1] === "]") {
      inTerm = false;
      current += "]]";
      i++;
      continue;
    }
    if (ch === "|" && !inTerm && !inCode) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}
function isTableSeparator(line) {
  const text = String(line).trim();
  if (!text.includes("|") || !text.includes("-")) return false;
  if (!SEPARATOR_CHARS_RE.test(text)) return false;
  const cells = splitTableRow(text);
  return cells.length > 0 && cells.every((cell) => SEPARATOR_CELL_RE.test(cell));
}
function isTableStart(lines, index) {
  return TABLE_ROW_RE.test(lines[index]) && index + 1 < lines.length && isTableSeparator(lines[index + 1]);
}
function startsBlock(lines, index) {
  const line = lines[index];
  if (!line || !line.trim()) return false;
  const trimmed = line.trim();
  if (HEADING_RE.test(trimmed)) return true;
  if (QUOTE_RE.test(line)) return true;
  if (UNORDERED_RE.test(line) || ORDERED_RE.test(line)) return true;
  if (HR_RE.test(line)) return true;
  if (isTableStart(lines, index)) return true;
  return false;
}
function parseTable(lines, index) {
  const header = splitTableRow(lines[index]);
  const rows = [];
  let i = index + 2;
  while (i < lines.length && TABLE_ROW_RE.test(lines[i]) && lines[i].trim() && !isTableSeparator(lines[i])) {
    rows.push(splitTableRow(lines[i]));
    i++;
  }
  const width = header.length;
  const fit = (cells) => {
    const out = cells.slice(0, width);
    while (out.length < width) out.push("");
    return out;
  };
  return {
    block: {
      type: "table",
      header: header.map((cell) => parseInline(cell)),
      rows: rows.map((row) => fit(row).map((cell) => parseInline(cell)))
    },
    next: i
  };
}
function parseList(lines, index) {
  const first = UNORDERED_RE.exec(lines[index]) || ORDERED_RE.exec(lines[index]);
  const ordered = !UNORDERED_RE.test(lines[index]);
  const baseIndent = first[1].length;
  const items = [];
  let i = index;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) break;
    const unordered = UNORDERED_RE.exec(line);
    const orderedMatch = ORDERED_RE.exec(line);
    if (unordered && !ordered && unordered[1].length <= baseIndent) {
      items.push(unordered[2].trim());
      i++;
      continue;
    }
    if (orderedMatch && ordered && orderedMatch[1].length <= baseIndent) {
      items.push(orderedMatch[3].trim());
      i++;
      continue;
    }
    if (unordered || orderedMatch) break;
    if (items.length && !startsBlock(lines, i)) {
      items[items.length - 1] = `${items[items.length - 1]} ${line.trim()}`;
      i++;
      continue;
    }
    break;
  }
  return { block: { type: "list", ordered, items: items.map((item) => parseInline(item)) }, next: i };
}
function parseBlockquote(lines, index) {
  const paragraphs = [];
  let current = [];
  let i = index;
  while (i < lines.length) {
    const quoted = QUOTE_RE.exec(lines[i]);
    if (quoted) {
      const content = quoted[1].trim();
      if (content) current.push(content);
      else if (current.length) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      i++;
      continue;
    }
    if (lines[i].trim() && current.length && !startsBlock(lines, i)) {
      current.push(lines[i].trim());
      i++;
      continue;
    }
    break;
  }
  if (current.length) paragraphs.push(current.join(" "));
  return {
    block: { type: "blockquote", paragraphs: paragraphs.map((paragraph) => parseInline(paragraph)) },
    next: i
  };
}
function parseMarkdown(body) {
  const source = String(body == null ? "" : body).replace(/\r\n?/g, "\n");
  const lines = source.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = HEADING_RE.exec(line.trim());
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, children: parseInline(heading[2].trim()) });
      i++;
      continue;
    }
    if (isTableStart(lines, i)) {
      const { block, next } = parseTable(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    if (QUOTE_RE.test(line)) {
      const { block, next } = parseBlockquote(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (UNORDERED_RE.test(line) || ORDERED_RE.test(line)) {
      const { block, next } = parseList(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !startsBlock(lines, i)) {
      paragraph.push(lines[i].trim());
      i++;
    }
    if (!paragraph.length) {
      paragraph.push(line.trim());
      i++;
    }
    blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
  }
  return blocks;
}
function renderInline(nodes, onTerm, keyPrefix) {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case "strong":
        return (0, import_react18.createElement)("strong", { key }, ...renderInline(node.children, onTerm, key));
      case "em":
        return (0, import_react18.createElement)("em", { key, className: "of-md-em" }, ...renderInline(node.children, onTerm, key));
      case "code":
        return (0, import_react18.createElement)("code", { key, className: "of-md-code" }, node.value);
      case "term":
        return (0, import_react18.createElement)(
          "button",
          {
            key,
            className: "of-term-ref",
            type: "button",
            "data-term": node.id,
            onClick: () => onTerm && onTerm(node.id)
          },
          node.text
        );
      case "link":
        return (0, import_react18.createElement)(
          "a",
          { key, className: "of-md-link", href: node.href, target: "_blank", rel: "noreferrer" },
          ...renderInline(node.children, onTerm, key)
        );
      case "text":
      default:
        return node.value != null ? String(node.value) : "";
    }
  });
}
function renderBlocks(blocks, { onTerm } = {}) {
  return blocks.map((block, index) => {
    const key = `md-${index}`;
    switch (block.type) {
      case "heading": {
        const level = block.level === 3 ? 3 : 2;
        return (0, import_react18.createElement)(
          level === 3 ? "h3" : "h2",
          { key, className: level === 3 ? "of-md-h3" : "of-md-h2" },
          ...renderInline(block.children, onTerm, key)
        );
      }
      case "paragraph":
        return (0, import_react18.createElement)("p", { key, className: "of-md-p" }, ...renderInline(block.children, onTerm, key));
      case "hr":
        return (0, import_react18.createElement)("hr", { key, className: "of-md-hr" });
      case "list": {
        const ordered = !!block.ordered;
        return (0, import_react18.createElement)(
          ordered ? "ol" : "ul",
          { key, className: ordered ? "of-md-ol" : "of-md-ul" },
          ...block.items.map((item, itemIndex) => {
            const itemKey = `${key}-${itemIndex}`;
            return (0, import_react18.createElement)("li", { key: itemKey, className: "of-md-li" }, ...renderInline(item, onTerm, itemKey));
          })
        );
      }
      case "blockquote":
        return (0, import_react18.createElement)(
          "blockquote",
          { key, className: "of-md-quote" },
          ...block.paragraphs.map((paragraph, paragraphIndex) => {
            const paragraphKey = `${key}-${paragraphIndex}`;
            return (0, import_react18.createElement)("p", { key: paragraphKey, className: "of-md-p" }, ...renderInline(paragraph, onTerm, paragraphKey));
          })
        );
      case "table":
        return (0, import_react18.createElement)(
          "div",
          { key, className: "of-md-table-wrap" },
          (0, import_react18.createElement)(
            "table",
            { className: "of-md-table" },
            (0, import_react18.createElement)(
              "thead",
              null,
              (0, import_react18.createElement)(
                "tr",
                null,
                ...block.header.map((cell, cellIndex) => {
                  const cellKey = `${key}-h${cellIndex}`;
                  return (0, import_react18.createElement)(
                    "th",
                    { key: cellKey, className: "of-md-th", scope: "col" },
                    ...renderInline(cell, onTerm, cellKey)
                  );
                })
              )
            ),
            (0, import_react18.createElement)(
              "tbody",
              null,
              ...block.rows.map(
                (row, rowIndex) => (0, import_react18.createElement)(
                  "tr",
                  { key: `${key}-r${rowIndex}` },
                  ...row.map((cell, cellIndex) => {
                    const cellKey = `${key}-r${rowIndex}c${cellIndex}`;
                    return (0, import_react18.createElement)("td", { key: cellKey, className: "of-md-td" }, ...renderInline(cell, onTerm, cellKey));
                  })
                )
              )
            )
          )
        );
      default:
        return (0, import_react18.createElement)("p", { key, className: "of-md-p" }, String(block && block.text != null ? block.text : ""));
    }
  });
}
function renderMarkdown(body, { onTerm } = {}) {
  return renderBlocks(parseMarkdown(body), { onTerm });
}

// client/src/components/ArticleBody.js
function ArticleBody(props) {
  const body = props.body;
  const onTerm = props.onTerm;
  const nodes = (0, import_react19.useMemo)(() => {
    if (typeof body !== "string" || body.trim() === "") return null;
    try {
      const rendered = renderMarkdown(body, { onTerm });
      return Array.isArray(rendered) && rendered.length > 0 ? rendered : null;
    } catch (error) {
      return [(0, import_react19.createElement)("p", { key: "of-md-fallback", className: "of-md-p" }, body)];
    }
  }, [body, onTerm]);
  if (!nodes) return null;
  return (0, import_react19.createElement)("div", { className: "of-article-body" }, nodes);
}

// client/src/components/GlossaryCard.js
var import_react20 = require("react");
function Field(props) {
  if (!props.text) return null;
  return (0, import_react20.createElement)(
    "div",
    null,
    (0, import_react20.createElement)("div", { className: "of-gcard-label" }, props.label),
    (0, import_react20.createElement)("div", { className: "of-gcard-text" }, props.text)
  );
}
function GlossaryRecord(props) {
  const t = props.t;
  const term = props.term || {};
  return (0, import_react20.createElement)(
    "div",
    null,
    (0, import_react20.createElement)("div", { className: "of-daily-term" }, term.term || term.id),
    term.alias ? (0, import_react20.createElement)("div", { className: "of-gcard-alias" }, term.alias) : null,
    term.one ? (0, import_react20.createElement)("p", { className: "of-daily-one" }, term.one) : null,
    (0, import_react20.createElement)(Field, { label: t("glossary.metaphor"), text: term.metaphor }),
    (0, import_react20.createElement)(Field, { label: t("glossary.number"), text: term.number }),
    (0, import_react20.createElement)(Field, { label: t("glossary.pit"), text: term.pit })
  );
}
function GlossaryCard(props) {
  const t = props.t;
  const term = props.term || {};
  const open = Boolean(props.open);
  const index = typeof props.index === "number" ? props.index : 0;
  const detailId = "of-gloss-" + String(term.id || index);
  const toggle = () => props.onToggle();
  return (0, import_react20.createElement)(
    "div",
    {
      className: "of-gcard of-stagger",
      style: { "--i": String(index) },
      "data-open": open ? "true" : "false",
      role: "button",
      tabIndex: 0,
      "aria-expanded": open,
      "aria-controls": detailId,
      onClick: toggle,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }
    },
    (0, import_react20.createElement)(
      "div",
      { className: "of-gcard-term" },
      (0, import_react20.createElement)("span", null, term.term || term.id),
      term.alias ? (0, import_react20.createElement)("span", { className: "of-gcard-alias" }, term.alias) : null
    ),
    term.one ? (0, import_react20.createElement)("div", { className: "of-gcard-one" }, term.one) : null,
    (0, import_react20.createElement)(
      "div",
      { className: "of-gcard-detail" },
      (0, import_react20.createElement)(
        "div",
        { className: "of-gcard-detail-inner", id: detailId, "aria-hidden": open ? "false" : "true" },
        (0, import_react20.createElement)(Field, { label: t("glossary.metaphor"), text: term.metaphor }),
        (0, import_react20.createElement)(Field, { label: t("glossary.number"), text: term.number }),
        (0, import_react20.createElement)(Field, { label: t("glossary.pit"), text: term.pit })
      )
    )
  );
}

// client/src/views/ArticleView.js
function ArticleSkeleton(props) {
  return (0, import_react21.createElement)(
    "div",
    { "aria-busy": "true", "aria-label": props.t("a11y.loading") },
    (0, import_react21.createElement)(Skeleton, { height: 26, width: "72%", radius: 8 }),
    (0, import_react21.createElement)(Skeleton, { height: 13, width: "92%", style: { marginTop: 16 } }),
    (0, import_react21.createElement)(Skeleton, { height: 13, width: "64%", style: { marginTop: 8 } }),
    (0, import_react21.createElement)("div", { className: "of-section" }, (0, import_react21.createElement)(SkeletonLines, { lines: 7, gap: 11 }))
  );
}
function TermPeek(props) {
  const t = props.t;
  const termId = props.termId;
  const { loading, data, error, reload } = useResource((signal) => getGlossary(signal), []);
  const nodeRef = (0, import_react21.useRef)(null);
  (0, import_react21.useEffect)(() => {
    const node = nodeRef.current;
    if (!node || typeof node.scrollIntoView !== "function") return;
    const reduce = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [termId]);
  const terms = data && Array.isArray(data.terms) ? data.terms : [];
  const term = terms.find((item) => item.id === termId) || null;
  return (0, import_react21.createElement)(
    "div",
    { className: "of-section", ref: nodeRef, "aria-live": "polite" },
    (0, import_react21.createElement)("div", { className: "of-section-head" }, (0, import_react21.createElement)("h2", { className: "of-section-title" }, t("glossary.title"))),
    loading ? (0, import_react21.createElement)("div", { className: "of-gloss-cards" }, (0, import_react21.createElement)(Skeleton, { height: 92, radius: 12 })) : error ? (0, import_react21.createElement)(ErrorState, { title: t("error.title"), body: error, retryLabel: t("retry"), onRetry: reload }) : term ? (0, import_react21.createElement)("div", { className: "of-daily" }, (0, import_react21.createElement)(GlossaryRecord, { t, term })) : (0, import_react21.createElement)(EmptyState, { title: t("glossary.empty") })
  );
}
function ArticleView(props) {
  const t = props.t;
  const id = props.id;
  const onBack = props.onBack;
  const onOpenArticle = props.onOpenArticle;
  const { data, error, reload } = useResource((signal) => getArticle(id, signal), [id]);
  const [termId, setTermId] = (0, import_react21.useState)(null);
  const rootRef = (0, import_react21.useRef)(null);
  const article = data && data.id === id ? data : null;
  const onTerm = (0, import_react21.useCallback)((nextId) => {
    setTermId((current) => current === nextId ? null : nextId);
  }, []);
  (0, import_react21.useEffect)(() => {
    const node = rootRef.current;
    const page = node && typeof node.closest === "function" ? node.closest(".of-page") : null;
    if (page) page.scrollTop = 0;
  }, [id]);
  (0, import_react21.useEffect)(() => {
    setTermId(null);
  }, [id]);
  const phase = article ? "ready" : error ? "error" : "loading";
  const readMinutes = article ? Number(article.readMinutes) : 0;
  const difficulty = article ? Number(article.difficulty) : 0;
  const asOf = article ? article.dataAsOfActual || article.dataAsOf : null;
  const points = article && Array.isArray(article.points) ? article.points : [];
  const related = article && Array.isArray(article.related) ? article.related : [];
  return (0, import_react21.createElement)(
    "div",
    { className: "of-article", ref: rootRef },
    (0, import_react21.createElement)(
      "button",
      { type: "button", className: "of-article-back", onClick: onBack },
      (0, import_react21.createElement)(Icon, { name: "back", size: 13 }),
      (0, import_react21.createElement)("span", null, t("academy.back"))
    ),
    (0, import_react21.createElement)(
      "div",
      { key: id + ":" + phase, className: "of-fade-in" },
      article ? (0, import_react21.createElement)(
        "div",
        null,
        (0, import_react21.createElement)("h1", { className: "of-article-title" }, article.title || id),
        article.dek ? (0, import_react21.createElement)("p", { className: "of-article-dek" }, article.dek) : null,
        (0, import_react21.createElement)(
          "div",
          { className: "of-article-meta" },
          article.tag ? (0, import_react21.createElement)(Tag, null, article.tag) : null,
          readMinutes > 0 ? (0, import_react21.createElement)("span", { className: "of-meta" }, t("academy.readMinutes", { n: readMinutes })) : null,
          difficulty > 0 ? (0, import_react21.createElement)(DifficultyDots, { value: difficulty, label: t("academy.difficulty", { n: difficulty }) }) : null,
          asOf ? (0, import_react21.createElement)("span", { className: "of-meta" }, t("academy.dataAsOf", { date: asOf })) : null
        ),
        points.length > 0 ? (0, import_react21.createElement)(
          "div",
          { className: "of-section" },
          (0, import_react21.createElement)(
            "div",
            { className: "of-section-head" },
            (0, import_react21.createElement)("h2", { className: "of-section-title" }, t("academy.points"))
          ),
          (0, import_react21.createElement)(
            "div",
            { className: "of-points" },
            points.map((point, index) => (0, import_react21.createElement)("div", { key: index, className: "of-point" }, point))
          )
        ) : null,
        (0, import_react21.createElement)(ArticleBody, { body: article.body, onTerm }),
        termId ? (0, import_react21.createElement)(TermPeek, { key: "term-peek", t, termId }) : null,
        related.length > 0 ? (0, import_react21.createElement)(
          "div",
          { className: "of-related" },
          (0, import_react21.createElement)(
            "div",
            { className: "of-section-head" },
            (0, import_react21.createElement)("h2", { className: "of-section-title" }, t("academy.related"))
          ),
          related.map((entry, index) => {
            const item = typeof entry === "string" ? { id: entry, title: entry } : entry || {};
            const isTerm = item.kind === "term";
            return (0, import_react21.createElement)(
              "button",
              {
                key: item.id || index,
                type: "button",
                className: "of-related-link",
                onClick: () => {
                  if (isTerm) setTermId((current) => current === item.id ? null : item.id);
                  else onOpenArticle(item.id);
                }
              },
              item.title || item.id
            );
          })
        ) : null
      ) : error ? (0, import_react21.createElement)(ErrorState, { title: t("error.title"), body: error, retryLabel: t("retry"), onRetry: reload }) : (0, import_react21.createElement)(ArticleSkeleton, { t })
    )
  );
}

// client/src/views/Glossary.js
var import_react22 = require("react");
var LOADING_TERMS = [0, 1, 2, 3, 4, 5, 6, 7];
function categoryLabel(categories, id) {
  const match = categories.find((category) => category.id === id);
  return match ? match.label : "";
}
function DailyWord(props) {
  const t = props.t;
  const daily = props.daily;
  const category = categoryLabel(props.categories, daily.cat);
  return (0, import_react22.createElement)(
    "section",
    { className: "of-daily of-fade-in", "aria-label": t("glossary.daily") },
    (0, import_react22.createElement)("div", { style: { flex: "1 1 auto", minWidth: 0 } }, (0, import_react22.createElement)(GlossaryRecord, { t, term: daily })),
    (0, import_react22.createElement)(
      "div",
      { className: "of-filters" },
      (0, import_react22.createElement)(Chip, { tone: "brand" }, t("glossary.daily")),
      category ? (0, import_react22.createElement)(Chip, null, category) : null
    )
  );
}
function Glossary(props) {
  const t = props.t;
  const { loading, data, error, reload } = useResource((signal) => getGlossary(signal), []);
  const [query, setQuery] = (0, import_react22.useState)("");
  const [openId, setOpenId] = (0, import_react22.useState)(null);
  const rootRef = (0, import_react22.useRef)(null);
  const terms = data && Array.isArray(data.terms) ? data.terms : [];
  const categories = data && Array.isArray(data.categories) ? data.categories : [];
  const daily = data && data.daily ? data.daily : null;
  const needle = query.trim().toLowerCase();
  (0, import_react22.useEffect)(() => {
    const node = rootRef.current;
    const page = node && typeof node.closest === "function" ? node.closest(".of-page") : null;
    if (page) page.scrollTop = 0;
  }, []);
  const filtered = (0, import_react22.useMemo)(() => {
    if (!needle) return terms;
    return terms.filter((term) => {
      const parts = [term.term, term.alias, term.one, term.cat, categoryLabel(categories, term.cat)];
      return parts.filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [terms, categories, needle]);
  const shown = (0, import_react22.useMemo)(() => {
    if (needle || !daily) return filtered;
    return filtered.filter((term) => term.id !== daily.id);
  }, [filtered, daily, needle]);
  const body = [];
  if (loading) {
    body.push((0, import_react22.createElement)(Skeleton, { key: "daily-skeleton", height: 122, radius: 14 }));
    body.push(
      (0, import_react22.createElement)(
        "div",
        { key: "term-skeleton", className: "of-gloss-cards", "aria-busy": "true", "aria-label": t("a11y.loading") },
        LOADING_TERMS.map((index) => (0, import_react22.createElement)(Skeleton, { key: index, height: 76, radius: 12 }))
      )
    );
  } else if (error) {
    body.push(
      (0, import_react22.createElement)(ErrorState, {
        key: "error",
        title: t("error.title"),
        body: error,
        retryLabel: t("retry"),
        onRetry: reload
      })
    );
  } else {
    if (!needle && daily) body.push((0, import_react22.createElement)(DailyWord, { key: "daily", t, daily, categories }));
    if (shown.length > 0) {
      body.push(
        (0, import_react22.createElement)(
          "div",
          { key: "terms" },
          (0, import_react22.createElement)(
            "div",
            { className: "of-section-head" },
            (0, import_react22.createElement)("h2", { className: "of-section-title" }, t("glossary.terms"))
          ),
          (0, import_react22.createElement)(
            "div",
            { className: "of-gloss-cards" },
            shown.map(
              (term, index) => (0, import_react22.createElement)(GlossaryCard, {
                key: term.id,
                t,
                term,
                index,
                open: openId === term.id,
                onToggle: () => setOpenId((current) => current === term.id ? null : term.id)
              })
            )
          )
        )
      );
    } else {
      body.push(
        (0, import_react22.createElement)(EmptyState, {
          key: "empty",
          title: needle ? t("glossary.empty") : t("empty"),
          icon: (0, import_react22.createElement)(Icon, { name: "search", size: 20 })
        })
      );
    }
  }
  return (0, import_react22.createElement)(
    "div",
    { className: "of-gloss of-fade-in", ref: rootRef },
    (0, import_react22.createElement)(
      "div",
      { className: "of-toolbar" },
      (0, import_react22.createElement)(SearchBox, { value: query, onChange: setQuery, placeholder: t("glossary.search") })
    ),
    ...body
  );
}

// client/src/main.js
var name = "dsh-openfin";
var inject = ["slots", "locale"];
var NS = "dsh-openfin";
var PANEL_ID = "dsh-openfin";
var TAB_KEY = "dsh-openfin:tab";
function readTab() {
  try {
    const saved = window.localStorage.getItem(TAB_KEY);
    if (saved === "market" || saved === "academy" || saved === "glossary") return saved;
  } catch {
  }
  return "market";
}
function writeTab(tab) {
  try {
    window.localStorage.setItem(TAB_KEY, tab);
  } catch {
  }
}
function useSnapshotFeed() {
  const [state, setState] = (0, import_react23.useState)({ snapshot: null, loading: true, error: null });
  const [generation, setGeneration] = (0, import_react23.useState)(0);
  const refresh = (0, import_react23.useCallback)(() => setGeneration((value) => value + 1), []);
  (0, import_react23.useEffect)(() => {
    const controller = new AbortController();
    let alive = true;
    let timer = 0;
    const schedule = (delay) => {
      clearTimeout(timer);
      timer = setTimeout(run, Math.max(1e4, Number(delay) || 3e4));
    };
    const run = async () => {
      if (typeof document !== "undefined" && document.hidden) {
        schedule(8e3);
        return;
      }
      try {
        const snapshot = await getSnapshot(controller.signal);
        if (!alive) return;
        setState({ snapshot, loading: false, error: null });
        schedule(snapshot && snapshot.refreshMs);
      } catch (error) {
        if (!alive || error && error.name === "AbortError") return;
        setState((previous) => ({
          snapshot: previous.snapshot,
          loading: false,
          error: error && error.message || String(error)
        }));
        schedule(3e4);
      }
    };
    setState((previous) => ({ snapshot: previous.snapshot, loading: true, error: null }));
    run();
    return () => {
      alive = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [generation]);
  return { ...state, refresh };
}
function matchesAccelerator(event, accelerator) {
  if (typeof accelerator !== "string" || accelerator === "") return false;
  const parts = accelerator.split("+").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return false;
  const key = parts[parts.length - 1].toLowerCase();
  const modifiers = new Set(parts.slice(0, -1).map((part) => part.toLowerCase()));
  const wantsCtrl = modifiers.has("commandorcontrol") || modifiers.has("control") || modifiers.has("ctrl") || modifiers.has("command") || modifiers.has("cmd");
  const wantsShift = modifiers.has("shift");
  const wantsAlt = modifiers.has("alt") || modifiers.has("option");
  if (event.ctrlKey !== wantsCtrl && !(modifiers.has("commandorcontrol") && event.metaKey)) return false;
  if (event.shiftKey !== wantsShift) return false;
  if (event.altKey !== wantsAlt) return false;
  if (key === "space") return event.code === "Space" || event.key === " ";
  return event.key.toLowerCase() === key;
}
function HudLayer({ t, onOpenDashboard }) {
  const [config, setConfig] = (0, import_react23.useState)(loadHudConfig);
  const [settingsOpen, setSettingsOpen] = (0, import_react23.useState)(false);
  const [status, setStatus] = (0, import_react23.useState)(null);
  const [hidden, setHidden] = (0, import_react23.useState)(false);
  const hiddenRef = (0, import_react23.useRef)(false);
  const setPanic = (0, import_react23.useCallback)((next) => {
    hiddenRef.current = next;
    setHidden(next);
    postHud({ action: "panic", hidden: next }).catch(() => {
    });
  }, []);
  (0, import_react23.useEffect)(() => subscribeHudConfig(setConfig), []);
  (0, import_react23.useEffect)(() => onOpenHudSettings(() => setSettingsOpen(true)), []);
  (0, import_react23.useEffect)(() => {
    if (!config.panicEnabled) return void 0;
    const onKeyDown = (event) => {
      if (!matchesAccelerator(event, config.panicShortcut)) return;
      event.preventDefault();
      event.stopPropagation();
      setPanic(!hiddenRef.current);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [config.panicEnabled, config.panicShortcut, setPanic]);
  (0, import_react23.useEffect)(() => {
    if (!config.inline && hidden) setPanic(false);
  }, [config.inline, hidden, setPanic]);
  const update = (0, import_react23.useCallback)((partial) => {
    const next = saveHudConfig(partial);
    setConfig(next);
    if (partial && partial.desktop !== void 0) pushDesktop(partial.desktop);
    else syncHudConfig(next);
  }, []);
  const refreshStatus = (0, import_react23.useCallback)(() => {
    getHud().then(setStatus, () => setStatus(null));
  }, []);
  (0, import_react23.useEffect)(() => {
    if (!config.desktop && !settingsOpen) return void 0;
    refreshStatus();
    const timer = setInterval(() => {
      if (config.desktop) refreshStatus();
    }, 15e3);
    return () => clearInterval(timer);
  }, [config.desktop, settingsOpen, refreshStatus]);
  if (!config.inline && !settingsOpen) return null;
  return (0, import_react23.createElement)(
    "div",
    { className: "of-hud-layer" },
    config.inline ? (0, import_react23.createElement)(FloatingHud, {
      t,
      config,
      onChange: update,
      onConfigure: () => setSettingsOpen(true),
      onOpenDashboard,
      hidden,
      onPanic: () => setPanic(true)
    }) : null,
    settingsOpen ? (0, import_react23.createElement)(HudSettings, {
      t,
      config,
      status,
      onChange: update,
      onRefreshStatus: refreshStatus,
      onClose: () => setSettingsOpen(false),
      onPanicNow: () => {
        setPanic(true);
        setSettingsOpen(false);
      }
    }) : null
  );
}
function OpenFinPage({ t }) {
  const [tab, setTab] = (0, import_react23.useState)(readTab);
  const [articleId, setArticleId] = (0, import_react23.useState)(null);
  const feed = useSnapshotFeed();
  const direction = t("meta.direction") === "intl" ? "intl" : "cn";
  const changeTab = (0, import_react23.useCallback)((next) => {
    setArticleId(null);
    setTab(next);
    writeTab(next);
  }, []);
  const openArticle = (0, import_react23.useCallback)((id) => {
    setArticleId(id);
    setTab("academy");
  }, []);
  const updated = feed.snapshot && feed.snapshot.updatedAt;
  return (0, import_react23.createElement)(
    "div",
    { className: "of-page", "data-direction": direction },
    (0, import_react23.createElement)(
      "div",
      { className: "of-inner" },
      (0, import_react23.createElement)(
        "header",
        { className: "of-head" },
        (0, import_react23.createElement)("div", { className: "of-mark" }, (0, import_react23.createElement)(Mark, { size: 23 })),
        (0, import_react23.createElement)(
          "div",
          { className: "of-titles" },
          (0, import_react23.createElement)("h1", { className: "of-title" }, t("title")),
          (0, import_react23.createElement)("div", { className: "of-sub" }, t("subtitle"))
        ),
        (0, import_react23.createElement)(
          "div",
          { className: "of-head-actions" },
          (0, import_react23.createElement)(Tabs, {
            items: [
              { id: "market", label: t("tab.market") },
              { id: "academy", label: t("tab.academy") },
              { id: "glossary", label: t("tab.glossary") }
            ],
            value: tab,
            onChange: changeTab,
            ariaLabel: t("title")
          }),
          (0, import_react23.createElement)(
            "button",
            {
              type: "button",
              className: "of-icon-btn",
              title: t("hud.settings"),
              "aria-label": t("hud.settings"),
              onClick: () => openHudSettings()
            },
            (0, import_react23.createElement)(Icon, { name: "float", size: 15 })
          ),
          tab === "market" ? (0, import_react23.createElement)(RefreshButton, {
            label: t("refresh"),
            busy: feed.loading,
            onClick: feed.refresh
          }) : null
        )
      ),
      (0, import_react23.createElement)(
        "main",
        { id: "of-panel-" + tab, role: "tabpanel" },
        tab === "market" ? (0, import_react23.createElement)(Dashboard, {
          t,
          snapshot: feed.snapshot,
          loading: feed.loading,
          error: feed.error,
          onRetry: feed.refresh
        }) : tab === "academy" ? articleId ? (0, import_react23.createElement)(ArticleView, {
          t,
          id: articleId,
          onBack: () => setArticleId(null),
          onOpenArticle: openArticle
        }) : (0, import_react23.createElement)(Academy, { t, onOpenArticle: openArticle }) : (0, import_react23.createElement)(Glossary, { t })
      ),
      (0, import_react23.createElement)(
        "footer",
        { className: "of-foot" },
        (0, import_react23.createElement)("span", { className: "of-live-dot", "data-stale": feed.snapshot && feed.snapshot.stale ? "true" : "false" }),
        (0, import_react23.createElement)(
          "span",
          { className: "of-foot-meta" },
          t("market.updated") + " " + (updated ? new Date(updated).toLocaleTimeString() : "\u2014")
        ),
        feed.snapshot && feed.snapshot.stale ? (0, import_react23.createElement)("span", { className: "of-badge" }, t("stale")) : null,
        (0, import_react23.createElement)("span", { style: { flex: 1 } }),
        (0, import_react23.createElement)(
          "a",
          { href: "https://github.com/5777-wq/openfinlens", target: "_blank", rel: "noreferrer noopener" },
          "OpenFinLens"
        ),
        (0, import_react23.createElement)("span", null, "\xB7"),
        (0, import_react23.createElement)(
          "a",
          { href: "https://github.com/5777-wq/openfin-academy", target: "_blank", rel: "noreferrer noopener" },
          "OpenFin Academy"
        ),
        (0, import_react23.createElement)("span", null, "\xB7"),
        (0, import_react23.createElement)("span", null, t("market.disclaimer"))
      )
    )
  );
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-openfin: dictionaries");
  const raw = ctx.locale.bind(NS);
  const t = (key, vars) => {
    let text = raw(key);
    if (typeof text !== "string") return key;
    if (vars === void 0) return text;
    return text.replace(
      /\{(\w+)\}/g,
      (match, name2) => vars[name2] === void 0 || vars[name2] === null ? match : String(vars[name2])
    );
  };
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.setAttribute("data-dsh-openfin", "");
    tag.textContent = CSS + HUD_CSS;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, "dsh-openfin: stylesheet");
  ctx.slots.inject(
    "sidebar.panellist",
    () => ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: 2,
        label: () => t("nav"),
        locale: NS,
        inject: () => ({ t })
      },
      (owner) => (0, import_react23.createElement)(Mark, { size: owner && owner.size || 16 })
    )
  );
  ctx.slots.inject(
    "main",
    () => ctx.slots.register(
      {
        name: "main",
        key: PANEL_ID,
        locale: NS,
        inject: () => ({ t })
      },
      (ownerProps) => (0, import_react23.createElement)(OpenFinPage, { t: ownerProps && ownerProps.t || t })
    )
  );
  const layout = ctx.get ? ctx.get("layout") : void 0;
  ctx.slots.inject(
    "shell.overlay",
    () => ctx.slots.register(
      {
        name: "shell.overlay",
        id: "dsh-openfin-hud",
        order: 60,
        label: () => t("hud.title"),
        locale: NS,
        inject: () => ({ t })
      },
      (ownerProps) => (0, import_react23.createElement)(HudLayer, {
        t: ownerProps && ownerProps.t || t,
        onOpenDashboard: () => {
          if (layout && typeof layout.selectPanel === "function") layout.selectPanel(PANEL_ID);
        }
      })
    )
  );
}
    return module.exports;
  },
});
