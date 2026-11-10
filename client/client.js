/* dsh-openfin 0.1.0 — built by scripts/build-client.mjs. Do not edit. */
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
var import_react21 = require("react");

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
  "meta.description": "A-share and global quotes, an industry heatmap, market news, and a plain-language finance academy as one native DeepSeek Harness page.",
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
  "a11y.refresh": "Refresh"
};
var zh = {
  "meta.title": "OpenFin \u91D1\u878D\u770B\u677F",
  "meta.description": "A\u80A1\u4E0E\u5168\u7403\u884C\u60C5\u3001\u884C\u4E1A\u70ED\u529B\u56FE\u3001\u8D22\u7ECF\u5FEB\u8BAF\uFF0C\u52A0\u4E0A\u767D\u8BDD\u91D1\u878D\u5B66\u9662\u4E0E\u8BCD\u5178\uFF0C\u4F5C\u4E3A DeepSeek Harness \u91CC\u7684\u539F\u751F\u9875\u9762\u3002",
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
  "a11y.refresh": "\u5237\u65B0"
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

// client/src/components/Tabs.js
var import_react3 = require("react");
function Tabs({ items, value, onChange, ariaLabel }) {
  return (0, import_react3.createElement)(
    "div",
    { className: "of-tabs", role: "tablist", "aria-label": ariaLabel },
    items.map(
      (item) => (0, import_react3.createElement)(
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
  return (0, import_react3.createElement)(
    "button",
    {
      type: "button",
      className: "of-icon-btn",
      "data-busy": busy ? "true" : "false",
      title: label,
      "aria-label": label,
      onClick
    },
    (0, import_react3.createElement)(Icon, { name: "refresh", size: 15 })
  );
}

// client/src/views/Dashboard.js
var import_react10 = require("react");

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
function signClass(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) < 1e-9) return "flat";
  return value > 0 ? "up" : "down";
}

// client/src/components/Feedback.js
var import_react4 = require("react");
function Skeleton({ height = 12, width = "100%", radius, style, className }) {
  return (0, import_react4.createElement)("div", {
    className: className ? "of-skeleton " + className : "of-skeleton",
    style: { height, width, borderRadius: radius, ...style },
    "aria-hidden": true
  });
}
function SkeletonLines({ lines = 3, gap = 8 }) {
  return (0, import_react4.createElement)(
    "div",
    { style: { display: "flex", flexDirection: "column", gap }, "aria-hidden": true },
    Array.from(
      { length: lines },
      (_, index) => (0, import_react4.createElement)(Skeleton, {
        key: index,
        height: 10,
        width: index === lines - 1 ? "62%" : "100%",
        radius: 5
      })
    )
  );
}
function EmptyState({ title, body, icon }) {
  return (0, import_react4.createElement)(
    "div",
    { className: "of-empty" },
    icon ? (0, import_react4.createElement)("div", { className: "of-empty-icon" }, icon) : null,
    title ? (0, import_react4.createElement)("div", { className: "of-error-title" }, title) : null,
    body ? (0, import_react4.createElement)("div", null, body) : null
  );
}
function ErrorState({ title, body, retryLabel, onRetry }) {
  return (0, import_react4.createElement)(
    "div",
    { className: "of-error", role: "alert" },
    (0, import_react4.createElement)("div", { className: "of-error-title" }, title),
    body ? (0, import_react4.createElement)("div", null, body) : null,
    onRetry && retryLabel ? (0, import_react4.createElement)("button", { type: "button", className: "of-btn", onClick: onRetry, style: { marginTop: 4 } }, retryLabel) : null
  );
}

// client/src/components/QuoteCard.js
var import_react7 = require("react");

// client/src/hooks.js
var import_react5 = require("react");
function useCountUp(value, duration = 420) {
  const [display, setDisplay] = (0, import_react5.useState)(value);
  const current = (0, import_react5.useRef)(value);
  (0, import_react5.useEffect)(() => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      current.current = value;
      setDisplay(value);
      return void 0;
    }
    const from = typeof current.current === "number" && Number.isFinite(current.current) ? current.current : value;
    if (from === value) return void 0;
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
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else {
        current.current = value;
        setDisplay(value);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return display;
}

// client/src/components/Sparkline.js
var import_react6 = require("react");
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
  return (0, import_react6.createElement)(
    "svg",
    {
      className: "of-quote-spark",
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      "aria-hidden": true,
      focusable: false
    },
    (0, import_react6.createElement)("path", { d: area, fill: color, opacity: 0.1 }),
    (0, import_react6.createElement)("path", {
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

// client/src/components/QuoteCard.js
function QuoteCard({ quote, index = 0 }) {
  const direction = signClass(quote.pct);
  const shown = useCountUp(quote.price, 460);
  const digits = Number.isFinite(quote.digits) ? quote.digits : 2;
  return (0, import_react7.createElement)(
    "div",
    { className: "of-quote of-stagger", style: { "--i": index } },
    (0, import_react7.createElement)(
      "div",
      { className: "of-quote-name" },
      (0, import_react7.createElement)("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, quote.name),
      (0, import_react7.createElement)("span", {
        className: "of-quote-dot " + (direction === "up" ? "of-up" : direction === "down" ? "of-down" : "of-flat"),
        style: { background: "currentColor" }
      })
    ),
    (0, import_react7.createElement)("div", { className: "of-quote-price" }, fmtPrice(shown, digits)),
    (0, import_react7.createElement)(
      "div",
      { className: "of-quote-change of-" + direction },
      (0, import_react7.createElement)("span", null, fmtPct(quote.pct)),
      Number.isFinite(quote.change) ? (0, import_react7.createElement)("span", { style: { opacity: 0.62 } }, fmtChange(quote.change, digits)) : null
    ),
    (0, import_react7.createElement)(Sparkline, { values: quote.spark, up: direction === "up" })
  );
}

// client/src/components/Heatmap.js
var import_react8 = require("react");

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
  let h21 = height;
  let index = 0;
  while (index < entries.length) {
    const side = Math.min(w, h21);
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
    if (w >= h21) {
      let cursor = y;
      for (const entry of row) {
        const cellHeight = rowArea > 0 ? entry.area / rowArea * h21 : 0;
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
      h21 -= thickness;
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
  const hostRef = (0, import_react8.useRef)(null);
  const [size, setSize] = (0, import_react8.useState)({ width: 0, height: 0 });
  const [tip, setTip] = (0, import_react8.useState)(null);
  (0, import_react8.useEffect)(() => {
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
  const rects = (0, import_react8.useMemo)(() => {
    if (!Array.isArray(boards) || size.width < 20 || size.height < 20) return [];
    const items = boards.map((board) => ({
      board,
      weight: Number.isFinite(board.marketCap) && board.marketCap > 0 ? board.marketCap : 1
    }));
    return squarify(items, { x: 0, y: 0, width: size.width, height: size.height });
  }, [boards, size.width, size.height]);
  return (0, import_react8.createElement)(
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
      return (0, import_react8.createElement)(
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
        showName ? (0, import_react8.createElement)("div", { className: "of-heat-label" }, board.name) : null,
        showPct ? (0, import_react8.createElement)(
          "div",
          { className: "of-heat-pct of-" + direction },
          fmtPct(board.pct)
        ) : null
      );
    }),
    tip ? (0, import_react8.createElement)(
      "div",
      {
        className: "of-heat-tip",
        style: placeTip(tip, size)
      },
      (0, import_react8.createElement)("div", { className: "of-heat-tip-name" }, tip.board.name),
      (0, import_react8.createElement)(
        "div",
        { className: "of-heat-tip-row" },
        (0, import_react8.createElement)("span", null, t("market.tooltipChange")),
        (0, import_react8.createElement)("b", { className: "of-" + signClass(tip.board.pct) }, fmtPct(tip.board.pct))
      ),
      (0, import_react8.createElement)(
        "div",
        { className: "of-heat-tip-row" },
        (0, import_react8.createElement)("span", null, t("market.tooltipPrice")),
        (0, import_react8.createElement)("span", null, fmtPrice(tip.board.price, 2))
      ),
      (0, import_react8.createElement)(
        "div",
        { className: "of-heat-tip-row" },
        (0, import_react8.createElement)("span", null, t("market.tooltipCap")),
        (0, import_react8.createElement)("span", null, fmtCompact(tip.board.marketCap))
      )
    ) : null
  );
}

// client/src/components/MarketLists.js
var import_react9 = require("react");
function MoversList({ movers, t }) {
  const [tab, setTab] = (0, import_react9.useState)("up");
  const rows = Array.isArray(movers && movers[tab]) ? movers[tab] : [];
  const tabs = [
    { id: "up", label: t("market.gainers") },
    { id: "down", label: t("market.losers") },
    { id: "active", label: t("market.active") }
  ];
  return (0, import_react9.createElement)(
    "div",
    null,
    (0, import_react9.createElement)(
      "div",
      { className: "of-section-head", style: { padding: "12px 14px 0" } },
      (0, import_react9.createElement)("h3", { className: "of-section-title" }, t("market.movers"))
    ),
    (0, import_react9.createElement)(
      "div",
      { className: "of-movers-tabs", role: "tablist" },
      tabs.map(
        (item) => (0, import_react9.createElement)(
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
    rows.length === 0 ? (0, import_react9.createElement)("div", { className: "of-empty", style: { padding: "14px 18px" } }, t("empty")) : (0, import_react9.createElement)(
      "div",
      { className: "of-movers", role: "tabpanel" },
      rows.map(
        (row, index) => (0, import_react9.createElement)(
          "div",
          { key: row.code || index, className: "of-mover" },
          (0, import_react9.createElement)("span", { className: "of-mover-rank" }, index + 1),
          (0, import_react9.createElement)(
            "span",
            { className: "of-mover-name" },
            row.name,
            (0, import_react9.createElement)("span", { className: "of-mover-code" }, row.code)
          ),
          (0, import_react9.createElement)(
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
  return (0, import_react9.createElement)(
    "div",
    null,
    (0, import_react9.createElement)(
      "div",
      { className: "of-section-head", style: { padding: "12px 14px 0" } },
      (0, import_react9.createElement)("h3", { className: "of-section-title" }, t("market.news")),
      (0, import_react9.createElement)("span", { className: "of-section-hint" }, t("market.newsHint"))
    ),
    items.length === 0 ? (0, import_react9.createElement)("div", { className: "of-empty", style: { padding: "14px 18px" } }, t("empty")) : (0, import_react9.createElement)(
      "div",
      { className: "of-news" },
      items.map(
        (item) => (0, import_react9.createElement)(
          "a",
          {
            key: item.id,
            className: "of-news-item",
            href: item.url,
            target: "_blank",
            rel: "noreferrer noopener"
          },
          (0, import_react9.createElement)("div", { className: "of-news-time" }, item.time || ""),
          (0, import_react9.createElement)("div", { className: "of-news-title" }, item.title)
        )
      )
    )
  );
}
function StockRow({ stock }) {
  return (0, import_react9.createElement)(
    "div",
    { className: "of-stock" },
    (0, import_react9.createElement)("span", { className: "of-stock-name" }, stock.name),
    (0, import_react9.createElement)("span", { className: "of-stock-code" }, stock.code),
    (0, import_react9.createElement)("span", { className: "of-stock-pct of-" + signClass(stock.pct) }, fmtPct(stock.pct))
  );
}
function SectorPanel({ sector, loading, onClose, t }) {
  const open = Boolean(sector);
  const stocks = sector && Array.isArray(sector.stocks) ? sector.stocks : [];
  return (0, import_react9.createElement)(
    "div",
    { className: "of-sector", "data-open": open ? "true" : "false" },
    (0, import_react9.createElement)(
      "div",
      { className: "of-sector-inner" },
      (0, import_react9.createElement)(
        "div",
        { className: "of-sector-pad" },
        (0, import_react9.createElement)(
          "div",
          { className: "of-sector-head" },
          (0, import_react9.createElement)("span", { className: "of-sector-name" }, sector ? sector.name : ""),
          sector ? (0, import_react9.createElement)("span", { className: "of-chip", "data-tone": "brand" }, fmtPct(sector.pct)) : null,
          (0, import_react9.createElement)("span", { style: { flex: 1 } }),
          (0, import_react9.createElement)(
            "button",
            {
              type: "button",
              className: "of-icon-btn",
              style: { width: 26, height: 26 },
              onClick: onClose,
              "aria-label": t("market.closeSector")
            },
            (0, import_react9.createElement)("span", { style: { fontSize: 14, lineHeight: 1 } }, "\xD7")
          )
        ),
        loading ? (0, import_react9.createElement)("div", { className: "of-skeleton", style: { height: 54 } }) : stocks.length === 0 ? (0, import_react9.createElement)("div", { className: "of-empty", style: { padding: "10px 0" } }, t("market.sectorEmpty")) : (0, import_react9.createElement)(
          "div",
          { className: "of-sector-stocks" },
          stocks.map((stock) => (0, import_react9.createElement)(StockRow, { key: stock.code, stock }))
        ),
        sector ? (0, import_react9.createElement)(
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
  const [sector, setSector] = (0, import_react10.useState)(null);
  const [sectorLoading, setSectorLoading] = (0, import_react10.useState)(false);
  const sectorRequest = (0, import_react10.useRef)(null);
  const clearSector = (0, import_react10.useCallback)(() => {
    if (sectorRequest.current) sectorRequest.current.abort();
    sectorRequest.current = null;
    setSector(null);
    setSectorLoading(false);
  }, []);
  const selectSector = (0, import_react10.useCallback)(
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
  (0, import_react10.useEffect)(() => () => {
    if (sectorRequest.current) sectorRequest.current.abort();
  }, []);
  if (!snapshot && loading) return (0, import_react10.createElement)(DashboardSkeleton, { t });
  if (!snapshot && error) {
    return (0, import_react10.createElement)(ErrorState, {
      title: t("error.title"),
      body: error,
      retryLabel: t("retry"),
      onRetry
    });
  }
  if (!snapshot) return (0, import_react10.createElement)(EmptyState, { title: t("empty") });
  const quotes = Array.isArray(snapshot.quotes) ? snapshot.quotes : [];
  const boards = Array.isArray(snapshot.boards) ? snapshot.boards : [];
  const breadth = snapshot.boardBreadth || null;
  const failedParts = Array.isArray(snapshot.parts) ? snapshot.parts.filter((part) => !part.ok) : [];
  return (0, import_react10.createElement)(
    "div",
    { className: "of-dashboard" },
    failedParts.length > 0 || snapshot.stale ? (0, import_react10.createElement)(
      "div",
      { className: "of-foot", style: { margin: "0 0 12px", paddingTop: 0, borderTop: 0 } },
      (0, import_react10.createElement)("span", { className: "of-badge" }, t("partial")),
      (0, import_react10.createElement)(
        "span",
        null,
        failedParts.map((part) => part.id).join(" \xB7 ") + (snapshot.stale ? " \xB7 cached" : "")
      )
    ) : null,
    (0, import_react10.createElement)(
      "section",
      { className: "of-section" },
      (0, import_react10.createElement)(
        "div",
        { className: "of-section-head" },
        (0, import_react10.createElement)("h3", { className: "of-section-title" }, t("market.indices")),
        (0, import_react10.createElement)("span", { className: "of-section-hint" }, t("market.indicesHint"))
      ),
      quotes.length === 0 ? (0, import_react10.createElement)(EmptyState, { title: t("empty"), body: t("market.partialBody") }) : (0, import_react10.createElement)(
        "div",
        { className: "of-grid of-grid-quotes" },
        quotes.map((quote, index) => (0, import_react10.createElement)(QuoteCard, { key: quote.id, quote, index }))
      )
    ),
    (0, import_react10.createElement)(
      "section",
      { className: "of-section" },
      (0, import_react10.createElement)(
        "div",
        { className: "of-grid of-grid-main" },
        (0, import_react10.createElement)(
          "div",
          { className: "of-card of-heat-card of-fade-in" },
          (0, import_react10.createElement)(
            "div",
            { className: "of-heat-top" },
            (0, import_react10.createElement)("h3", { className: "of-section-title" }, t("market.heatmap")),
            breadth ? (0, import_react10.createElement)(
              "div",
              { className: "of-heat-breadth", title: t("market.breadth") },
              (0, import_react10.createElement)("span", { className: "of-up" }, String(breadth.up || 0)),
              (0, import_react10.createElement)(
                "span",
                { className: "of-breadth-bar", "aria-hidden": true },
                (0, import_react10.createElement)("span", {
                  className: "of-breadth-up",
                  style: { width: share(breadth.up, breadth.total) + "%" }
                }),
                (0, import_react10.createElement)("span", {
                  className: "of-breadth-flat",
                  style: { width: share(breadth.flat, breadth.total) + "%" }
                }),
                (0, import_react10.createElement)("span", {
                  className: "of-breadth-down",
                  style: { width: share(breadth.down, breadth.total) + "%" }
                })
              ),
              (0, import_react10.createElement)("span", { className: "of-down" }, String(breadth.down || 0))
            ) : null
          ),
          (0, import_react10.createElement)(Heatmap, {
            boards,
            activeCode: sector ? sector.code : null,
            onSelect: selectSector,
            t
          }),
          (0, import_react10.createElement)(
            "div",
            { className: "of-heat-legend" },
            (0, import_react10.createElement)("span", null, "-5%"),
            (0, import_react10.createElement)("span", { className: "of-legend-ramp" }),
            (0, import_react10.createElement)("span", null, "+5%"),
            (0, import_react10.createElement)("span", { style: { flex: 1 } }),
            (0, import_react10.createElement)("span", null, t("market.heatmapHint"))
          ),
          (0, import_react10.createElement)(SectorPanel, {
            sector,
            loading: sectorLoading,
            onClose: clearSector,
            t
          })
        ),
        (0, import_react10.createElement)(
          "div",
          { className: "of-rail" },
          (0, import_react10.createElement)("div", { className: "of-card of-fade-in" }, (0, import_react10.createElement)(MoversList, { movers: snapshot.movers, t })),
          (0, import_react10.createElement)("div", { className: "of-card of-fade-in" }, (0, import_react10.createElement)(NewsList, { news: snapshot.news, t }))
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
  return (0, import_react10.createElement)(
    "div",
    { "aria-label": t("loading"), "aria-busy": true },
    (0, import_react10.createElement)(
      "div",
      { className: "of-grid of-grid-quotes" },
      Array.from(
        { length: 11 },
        (_, index) => (0, import_react10.createElement)(
          "div",
          { key: index, className: "of-quote" },
          (0, import_react10.createElement)(Skeleton, { height: 10, width: "56%" }),
          (0, import_react10.createElement)(Skeleton, { height: 20, width: "76%", style: { marginTop: 10 } }),
          (0, import_react10.createElement)(Skeleton, { height: 10, width: "44%", style: { marginTop: 8 } })
        )
      )
    ),
    (0, import_react10.createElement)(
      "div",
      { className: "of-grid of-grid-main", style: { marginTop: 14 } },
      (0, import_react10.createElement)(
        "div",
        { className: "of-card of-pad" },
        (0, import_react10.createElement)(Skeleton, { height: 400, radius: 12 })
      ),
      (0, import_react10.createElement)(
        "div",
        { className: "of-card of-pad" },
        (0, import_react10.createElement)(SkeletonLines, { lines: 8 })
      )
    )
  );
}

// client/src/views/Academy.js
var import_react15 = require("react");

// client/src/components/AcademyCard.js
var import_react12 = require("react");

// client/src/components/Chip.js
var import_react11 = require("react");
function Chip({ children, tone }) {
  return (0, import_react11.createElement)("span", { className: "of-chip", "data-tone": tone }, children);
}
function Tag({ children }) {
  return (0, import_react11.createElement)("span", { className: "of-tag" }, children);
}
function DifficultyDots({ value, label }) {
  const level = Math.max(1, Math.min(4, Number(value) || 1));
  return (0, import_react11.createElement)(
    "span",
    { className: "of-dots", title: label, "aria-label": label },
    [0, 1, 2, 3].map(
      (index) => (0, import_react11.createElement)("span", { key: index, className: "of-dot" + (index < level ? " of-dot-on" : "") })
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
  return (0, import_react12.createElement)(
    "button",
    {
      type: "button",
      className: "of-acard of-stagger",
      style: { "--i": String(index) },
      onClick: () => props.onOpen(article.id)
    },
    (0, import_react12.createElement)("span", { className: "of-acard-title" }, article.title || article.id),
    article.dek ? (0, import_react12.createElement)("span", { className: "of-acard-dek" }, article.dek) : null,
    (0, import_react12.createElement)(
      "span",
      { className: "of-acard-meta" },
      article.tag ? (0, import_react12.createElement)(Tag, null, article.tag) : null,
      readMinutes > 0 ? (0, import_react12.createElement)("span", { className: "of-meta" }, t("academy.readMinutes", { n: readMinutes })) : null,
      difficulty > 0 ? (0, import_react12.createElement)(DifficultyDots, { value: difficulty, label: t("academy.difficulty", { n: difficulty }) }) : null
    )
  );
}

// client/src/components/FilterChips.js
var import_react13 = require("react");
function FilterChips(props) {
  const sections = Array.isArray(props.sections) ? props.sections : [];
  const active = props.active;
  const onSelect = props.onSelect;
  if (sections.length === 0) return null;
  return (0, import_react13.createElement)(
    "div",
    { className: "of-filters", role: "group", "aria-label": props.label || void 0 },
    sections.map(
      (section) => (0, import_react13.createElement)(
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
var import_react14 = require("react");
function SearchBox(props) {
  const value = typeof props.value === "string" ? props.value : "";
  const placeholder = props.placeholder || "";
  const onChange = props.onChange;
  return (0, import_react14.createElement)(
    "div",
    { className: "of-search" },
    (0, import_react14.createElement)("span", { className: "of-search-icon", "aria-hidden": "true" }, (0, import_react14.createElement)(Icon, { name: "search", size: 14 })),
    (0, import_react14.createElement)("input", {
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
  const [query, setQuery] = (0, import_react15.useState)("");
  const [section, setSection] = (0, import_react15.useState)(ALL);
  const rootRef = (0, import_react15.useRef)(null);
  const articles = data && Array.isArray(data.articles) ? data.articles : [];
  const sections = data && Array.isArray(data.sections) ? data.sections : [];
  const activeSection = sections.some((item) => item.id === section) ? section : ALL;
  (0, import_react15.useEffect)(() => {
    const node = rootRef.current;
    const page = node && typeof node.closest === "function" ? node.closest(".of-page") : null;
    if (page) page.scrollTop = 0;
  }, []);
  const filtered = (0, import_react15.useMemo)(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (activeSection !== ALL && article.section !== activeSection) return false;
      return needle ? searchText(article).includes(needle) : true;
    });
  }, [articles, activeSection, query]);
  const isFiltered = query.trim() !== "" || activeSection !== ALL;
  return (0, import_react15.createElement)(
    "div",
    { className: "of-academy of-fade-in", ref: rootRef },
    (0, import_react15.createElement)(
      "div",
      { className: "of-toolbar" },
      (0, import_react15.createElement)(SearchBox, { value: query, onChange: setQuery, placeholder: t("academy.search") })
    ),
    sections.length > 0 ? (0, import_react15.createElement)(FilterChips, {
      sections,
      active: activeSection,
      onSelect: setSection,
      label: t("academy.title")
    }) : null,
    loading ? (0, import_react15.createElement)(
      "div",
      { className: "of-cards", "aria-busy": "true", "aria-label": t("a11y.loading") },
      LOADING_CARDS.map((index) => (0, import_react15.createElement)(Skeleton, { key: index, height: 118, radius: 14 }))
    ) : error ? (0, import_react15.createElement)(ErrorState, {
      title: t("error.title"),
      body: error,
      retryLabel: t("retry"),
      onRetry: reload
    }) : filtered.length === 0 ? (0, import_react15.createElement)(EmptyState, {
      title: isFiltered ? t("academy.searchEmpty") : t("academy.empty"),
      icon: (0, import_react15.createElement)(Icon, { name: "search", size: 20 })
    }) : (0, import_react15.createElement)(
      "div",
      { className: "of-cards" },
      filtered.map(
        (article, index) => (0, import_react15.createElement)(AcademyCard, {
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
var import_react19 = require("react");

// client/src/components/ArticleBody.js
var import_react17 = require("react");

// client/src/md.js
var import_react16 = require("react");
var HEADING_RE = /^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/;
var UNORDERED_RE = /^([ \t]*)[-*+][ \t]+(.*)$/;
var ORDERED_RE = /^([ \t]*)(\d{1,3})[.)][ \t]+(.*)$/;
var QUOTE_RE = /^[ \t]*>[ \t]?(.*)$/;
var TABLE_ROW_RE = /^[ \t]*\|/;
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
  const re = /!\[([^\]]*)\]\(([^)\s]*)\)|\*\*([\s\S]+?)\*\*|`([^`\n]+)`|\[\[([^\]|\n]+)\|([^\]\n]+)\]\]|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
  const nodes = [];
  let last = 0;
  let match;
  while (match = re.exec(source)) {
    if (match.index > last) pushText(nodes, source.slice(last, match.index));
    last = re.lastIndex;
    if (match[1] !== void 0) {
      pushText(nodes, match[1]);
    } else if (match[3] !== void 0) {
      const children = parseInline(match[3], depth + 1);
      if (children.length) nodes.push({ type: "strong", children });
      else pushText(nodes, match[0]);
    } else if (match[4] !== void 0) {
      nodes.push({ type: "code", value: match[4] });
    } else if (match[5] !== void 0) {
      nodes.push({ type: "term", id: match[5].trim(), text: match[6] });
    } else if (match[7] !== void 0) {
      const href = match[8];
      if (EXTERNAL_HREF_RE.test(href)) {
        const children = parseInline(match[7], depth + 1);
        if (children.length) nodes.push({ type: "link", href, children });
      } else {
        pushText(nodes, match[7]);
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
        return (0, import_react16.createElement)("strong", { key }, ...renderInline(node.children, onTerm, key));
      case "code":
        return (0, import_react16.createElement)("code", { key, className: "of-md-code" }, node.value);
      case "term":
        return (0, import_react16.createElement)(
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
        return (0, import_react16.createElement)(
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
        return (0, import_react16.createElement)(
          level === 3 ? "h3" : "h2",
          { key, className: level === 3 ? "of-md-h3" : "of-md-h2" },
          ...renderInline(block.children, onTerm, key)
        );
      }
      case "paragraph":
        return (0, import_react16.createElement)("p", { key, className: "of-md-p" }, ...renderInline(block.children, onTerm, key));
      case "list": {
        const ordered = !!block.ordered;
        return (0, import_react16.createElement)(
          ordered ? "ol" : "ul",
          { key, className: ordered ? "of-md-ol" : "of-md-ul" },
          ...block.items.map((item, itemIndex) => {
            const itemKey = `${key}-${itemIndex}`;
            return (0, import_react16.createElement)("li", { key: itemKey, className: "of-md-li" }, ...renderInline(item, onTerm, itemKey));
          })
        );
      }
      case "blockquote":
        return (0, import_react16.createElement)(
          "blockquote",
          { key, className: "of-md-quote" },
          ...block.paragraphs.map((paragraph, paragraphIndex) => {
            const paragraphKey = `${key}-${paragraphIndex}`;
            return (0, import_react16.createElement)("p", { key: paragraphKey, className: "of-md-p" }, ...renderInline(paragraph, onTerm, paragraphKey));
          })
        );
      case "table":
        return (0, import_react16.createElement)(
          "div",
          { key, className: "of-md-table-wrap" },
          (0, import_react16.createElement)(
            "table",
            { className: "of-md-table" },
            (0, import_react16.createElement)(
              "thead",
              null,
              (0, import_react16.createElement)(
                "tr",
                null,
                ...block.header.map((cell, cellIndex) => {
                  const cellKey = `${key}-h${cellIndex}`;
                  return (0, import_react16.createElement)(
                    "th",
                    { key: cellKey, className: "of-md-th", scope: "col" },
                    ...renderInline(cell, onTerm, cellKey)
                  );
                })
              )
            ),
            (0, import_react16.createElement)(
              "tbody",
              null,
              ...block.rows.map(
                (row, rowIndex) => (0, import_react16.createElement)(
                  "tr",
                  { key: `${key}-r${rowIndex}` },
                  ...row.map((cell, cellIndex) => {
                    const cellKey = `${key}-r${rowIndex}c${cellIndex}`;
                    return (0, import_react16.createElement)("td", { key: cellKey, className: "of-md-td" }, ...renderInline(cell, onTerm, cellKey));
                  })
                )
              )
            )
          )
        );
      default:
        return (0, import_react16.createElement)("p", { key, className: "of-md-p" }, String(block && block.text != null ? block.text : ""));
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
  const nodes = (0, import_react17.useMemo)(() => {
    if (typeof body !== "string" || body.trim() === "") return null;
    try {
      const rendered = renderMarkdown(body, { onTerm });
      return Array.isArray(rendered) && rendered.length > 0 ? rendered : null;
    } catch (error) {
      return [(0, import_react17.createElement)("p", { key: "of-md-fallback", className: "of-md-p" }, body)];
    }
  }, [body, onTerm]);
  if (!nodes) return null;
  return (0, import_react17.createElement)("div", { className: "of-article-body" }, nodes);
}

// client/src/components/GlossaryCard.js
var import_react18 = require("react");
function Field(props) {
  if (!props.text) return null;
  return (0, import_react18.createElement)(
    "div",
    null,
    (0, import_react18.createElement)("div", { className: "of-gcard-label" }, props.label),
    (0, import_react18.createElement)("div", { className: "of-gcard-text" }, props.text)
  );
}
function GlossaryRecord(props) {
  const t = props.t;
  const term = props.term || {};
  return (0, import_react18.createElement)(
    "div",
    null,
    (0, import_react18.createElement)("div", { className: "of-daily-term" }, term.term || term.id),
    term.alias ? (0, import_react18.createElement)("div", { className: "of-gcard-alias" }, term.alias) : null,
    term.one ? (0, import_react18.createElement)("p", { className: "of-daily-one" }, term.one) : null,
    (0, import_react18.createElement)(Field, { label: t("glossary.metaphor"), text: term.metaphor }),
    (0, import_react18.createElement)(Field, { label: t("glossary.number"), text: term.number }),
    (0, import_react18.createElement)(Field, { label: t("glossary.pit"), text: term.pit })
  );
}
function GlossaryCard(props) {
  const t = props.t;
  const term = props.term || {};
  const open = Boolean(props.open);
  const index = typeof props.index === "number" ? props.index : 0;
  const detailId = "of-gloss-" + String(term.id || index);
  const toggle = () => props.onToggle();
  return (0, import_react18.createElement)(
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
    (0, import_react18.createElement)(
      "div",
      { className: "of-gcard-term" },
      (0, import_react18.createElement)("span", null, term.term || term.id),
      term.alias ? (0, import_react18.createElement)("span", { className: "of-gcard-alias" }, term.alias) : null
    ),
    term.one ? (0, import_react18.createElement)("div", { className: "of-gcard-one" }, term.one) : null,
    (0, import_react18.createElement)(
      "div",
      { className: "of-gcard-detail" },
      (0, import_react18.createElement)(
        "div",
        { className: "of-gcard-detail-inner", id: detailId, "aria-hidden": open ? "false" : "true" },
        (0, import_react18.createElement)(Field, { label: t("glossary.metaphor"), text: term.metaphor }),
        (0, import_react18.createElement)(Field, { label: t("glossary.number"), text: term.number }),
        (0, import_react18.createElement)(Field, { label: t("glossary.pit"), text: term.pit })
      )
    )
  );
}

// client/src/views/ArticleView.js
function ArticleSkeleton(props) {
  return (0, import_react19.createElement)(
    "div",
    { "aria-busy": "true", "aria-label": props.t("a11y.loading") },
    (0, import_react19.createElement)(Skeleton, { height: 26, width: "72%", radius: 8 }),
    (0, import_react19.createElement)(Skeleton, { height: 13, width: "92%", style: { marginTop: 16 } }),
    (0, import_react19.createElement)(Skeleton, { height: 13, width: "64%", style: { marginTop: 8 } }),
    (0, import_react19.createElement)("div", { className: "of-section" }, (0, import_react19.createElement)(SkeletonLines, { lines: 7, gap: 11 }))
  );
}
function TermPeek(props) {
  const t = props.t;
  const termId = props.termId;
  const { loading, data, error, reload } = useResource((signal) => getGlossary(signal), []);
  const nodeRef = (0, import_react19.useRef)(null);
  (0, import_react19.useEffect)(() => {
    const node = nodeRef.current;
    if (!node || typeof node.scrollIntoView !== "function") return;
    const reduce = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [termId]);
  const terms = data && Array.isArray(data.terms) ? data.terms : [];
  const term = terms.find((item) => item.id === termId) || null;
  return (0, import_react19.createElement)(
    "div",
    { className: "of-section", ref: nodeRef, "aria-live": "polite" },
    (0, import_react19.createElement)("div", { className: "of-section-head" }, (0, import_react19.createElement)("h2", { className: "of-section-title" }, t("glossary.title"))),
    loading ? (0, import_react19.createElement)("div", { className: "of-gloss-cards" }, (0, import_react19.createElement)(Skeleton, { height: 92, radius: 12 })) : error ? (0, import_react19.createElement)(ErrorState, { title: t("error.title"), body: error, retryLabel: t("retry"), onRetry: reload }) : term ? (0, import_react19.createElement)("div", { className: "of-daily" }, (0, import_react19.createElement)(GlossaryRecord, { t, term })) : (0, import_react19.createElement)(EmptyState, { title: t("glossary.empty") })
  );
}
function ArticleView(props) {
  const t = props.t;
  const id = props.id;
  const onBack = props.onBack;
  const onOpenArticle = props.onOpenArticle;
  const { data, error, reload } = useResource((signal) => getArticle(id, signal), [id]);
  const [termId, setTermId] = (0, import_react19.useState)(null);
  const rootRef = (0, import_react19.useRef)(null);
  const article = data && data.id === id ? data : null;
  const onTerm = (0, import_react19.useCallback)((nextId) => {
    setTermId((current) => current === nextId ? null : nextId);
  }, []);
  (0, import_react19.useEffect)(() => {
    const node = rootRef.current;
    const page = node && typeof node.closest === "function" ? node.closest(".of-page") : null;
    if (page) page.scrollTop = 0;
  }, [id]);
  (0, import_react19.useEffect)(() => {
    setTermId(null);
  }, [id]);
  const phase = article ? "ready" : error ? "error" : "loading";
  const readMinutes = article ? Number(article.readMinutes) : 0;
  const difficulty = article ? Number(article.difficulty) : 0;
  const asOf = article ? article.dataAsOfActual || article.dataAsOf : null;
  const points = article && Array.isArray(article.points) ? article.points : [];
  const related = article && Array.isArray(article.related) ? article.related : [];
  return (0, import_react19.createElement)(
    "div",
    { className: "of-article", ref: rootRef },
    (0, import_react19.createElement)(
      "button",
      { type: "button", className: "of-article-back", onClick: onBack },
      (0, import_react19.createElement)(Icon, { name: "back", size: 13 }),
      (0, import_react19.createElement)("span", null, t("academy.back"))
    ),
    (0, import_react19.createElement)(
      "div",
      { key: id + ":" + phase, className: "of-fade-in" },
      article ? (0, import_react19.createElement)(
        "div",
        null,
        (0, import_react19.createElement)("h1", { className: "of-article-title" }, article.title || id),
        article.dek ? (0, import_react19.createElement)("p", { className: "of-article-dek" }, article.dek) : null,
        (0, import_react19.createElement)(
          "div",
          { className: "of-article-meta" },
          article.tag ? (0, import_react19.createElement)(Tag, null, article.tag) : null,
          readMinutes > 0 ? (0, import_react19.createElement)("span", { className: "of-meta" }, t("academy.readMinutes", { n: readMinutes })) : null,
          difficulty > 0 ? (0, import_react19.createElement)(DifficultyDots, { value: difficulty, label: t("academy.difficulty", { n: difficulty }) }) : null,
          asOf ? (0, import_react19.createElement)("span", { className: "of-meta" }, t("academy.dataAsOf", { date: asOf })) : null
        ),
        points.length > 0 ? (0, import_react19.createElement)(
          "div",
          { className: "of-section" },
          (0, import_react19.createElement)(
            "div",
            { className: "of-section-head" },
            (0, import_react19.createElement)("h2", { className: "of-section-title" }, t("academy.points"))
          ),
          (0, import_react19.createElement)(
            "div",
            { className: "of-points" },
            points.map((point, index) => (0, import_react19.createElement)("div", { key: index, className: "of-point" }, point))
          )
        ) : null,
        (0, import_react19.createElement)(ArticleBody, { body: article.body, onTerm }),
        termId ? (0, import_react19.createElement)(TermPeek, { key: "term-peek", t, termId }) : null,
        related.length > 0 ? (0, import_react19.createElement)(
          "div",
          { className: "of-related" },
          (0, import_react19.createElement)(
            "div",
            { className: "of-section-head" },
            (0, import_react19.createElement)("h2", { className: "of-section-title" }, t("academy.related"))
          ),
          related.map((entry, index) => {
            const item = typeof entry === "string" ? { id: entry, title: entry } : entry || {};
            const isTerm = item.kind === "term";
            return (0, import_react19.createElement)(
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
      ) : error ? (0, import_react19.createElement)(ErrorState, { title: t("error.title"), body: error, retryLabel: t("retry"), onRetry: reload }) : (0, import_react19.createElement)(ArticleSkeleton, { t })
    )
  );
}

// client/src/views/Glossary.js
var import_react20 = require("react");
var LOADING_TERMS = [0, 1, 2, 3, 4, 5, 6, 7];
function categoryLabel(categories, id) {
  const match = categories.find((category) => category.id === id);
  return match ? match.label : "";
}
function DailyWord(props) {
  const t = props.t;
  const daily = props.daily;
  const category = categoryLabel(props.categories, daily.cat);
  return (0, import_react20.createElement)(
    "section",
    { className: "of-daily of-fade-in", "aria-label": t("glossary.daily") },
    (0, import_react20.createElement)("div", { style: { flex: "1 1 auto", minWidth: 0 } }, (0, import_react20.createElement)(GlossaryRecord, { t, term: daily })),
    (0, import_react20.createElement)(
      "div",
      { className: "of-filters" },
      (0, import_react20.createElement)(Chip, { tone: "brand" }, t("glossary.daily")),
      category ? (0, import_react20.createElement)(Chip, null, category) : null
    )
  );
}
function Glossary(props) {
  const t = props.t;
  const { loading, data, error, reload } = useResource((signal) => getGlossary(signal), []);
  const [query, setQuery] = (0, import_react20.useState)("");
  const [openId, setOpenId] = (0, import_react20.useState)(null);
  const rootRef = (0, import_react20.useRef)(null);
  const terms = data && Array.isArray(data.terms) ? data.terms : [];
  const categories = data && Array.isArray(data.categories) ? data.categories : [];
  const daily = data && data.daily ? data.daily : null;
  const needle = query.trim().toLowerCase();
  (0, import_react20.useEffect)(() => {
    const node = rootRef.current;
    const page = node && typeof node.closest === "function" ? node.closest(".of-page") : null;
    if (page) page.scrollTop = 0;
  }, []);
  const filtered = (0, import_react20.useMemo)(() => {
    if (!needle) return terms;
    return terms.filter((term) => {
      const parts = [term.term, term.alias, term.one, term.cat, categoryLabel(categories, term.cat)];
      return parts.filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [terms, categories, needle]);
  const shown = (0, import_react20.useMemo)(() => {
    if (needle || !daily) return filtered;
    return filtered.filter((term) => term.id !== daily.id);
  }, [filtered, daily, needle]);
  const body = [];
  if (loading) {
    body.push((0, import_react20.createElement)(Skeleton, { key: "daily-skeleton", height: 122, radius: 14 }));
    body.push(
      (0, import_react20.createElement)(
        "div",
        { key: "term-skeleton", className: "of-gloss-cards", "aria-busy": "true", "aria-label": t("a11y.loading") },
        LOADING_TERMS.map((index) => (0, import_react20.createElement)(Skeleton, { key: index, height: 76, radius: 12 }))
      )
    );
  } else if (error) {
    body.push(
      (0, import_react20.createElement)(ErrorState, {
        key: "error",
        title: t("error.title"),
        body: error,
        retryLabel: t("retry"),
        onRetry: reload
      })
    );
  } else {
    if (!needle && daily) body.push((0, import_react20.createElement)(DailyWord, { key: "daily", t, daily, categories }));
    if (shown.length > 0) {
      body.push(
        (0, import_react20.createElement)(
          "div",
          { key: "terms" },
          (0, import_react20.createElement)(
            "div",
            { className: "of-section-head" },
            (0, import_react20.createElement)("h2", { className: "of-section-title" }, t("glossary.terms"))
          ),
          (0, import_react20.createElement)(
            "div",
            { className: "of-gloss-cards" },
            shown.map(
              (term, index) => (0, import_react20.createElement)(GlossaryCard, {
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
        (0, import_react20.createElement)(EmptyState, {
          key: "empty",
          title: needle ? t("glossary.empty") : t("empty"),
          icon: (0, import_react20.createElement)(Icon, { name: "search", size: 20 })
        })
      );
    }
  }
  return (0, import_react20.createElement)(
    "div",
    { className: "of-gloss of-fade-in", ref: rootRef },
    (0, import_react20.createElement)(
      "div",
      { className: "of-toolbar" },
      (0, import_react20.createElement)(SearchBox, { value: query, onChange: setQuery, placeholder: t("glossary.search") })
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
  const [state, setState] = (0, import_react21.useState)({ snapshot: null, loading: true, error: null });
  const [generation, setGeneration] = (0, import_react21.useState)(0);
  const refresh = (0, import_react21.useCallback)(() => setGeneration((value) => value + 1), []);
  (0, import_react21.useEffect)(() => {
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
function OpenFinPage({ t }) {
  const [tab, setTab] = (0, import_react21.useState)(readTab);
  const [articleId, setArticleId] = (0, import_react21.useState)(null);
  const feed = useSnapshotFeed();
  const direction = t("meta.direction") === "intl" ? "intl" : "cn";
  const changeTab = (0, import_react21.useCallback)((next) => {
    setArticleId(null);
    setTab(next);
    writeTab(next);
  }, []);
  const openArticle = (0, import_react21.useCallback)((id) => {
    setArticleId(id);
    setTab("academy");
  }, []);
  const updated = feed.snapshot && feed.snapshot.updatedAt;
  return (0, import_react21.createElement)(
    "div",
    { className: "of-page", "data-direction": direction },
    (0, import_react21.createElement)(
      "div",
      { className: "of-inner" },
      (0, import_react21.createElement)(
        "header",
        { className: "of-head" },
        (0, import_react21.createElement)("div", { className: "of-mark" }, (0, import_react21.createElement)(Mark, { size: 23 })),
        (0, import_react21.createElement)(
          "div",
          { className: "of-titles" },
          (0, import_react21.createElement)("h1", { className: "of-title" }, t("title")),
          (0, import_react21.createElement)("div", { className: "of-sub" }, t("subtitle"))
        ),
        (0, import_react21.createElement)(
          "div",
          { className: "of-head-actions" },
          (0, import_react21.createElement)(Tabs, {
            items: [
              { id: "market", label: t("tab.market") },
              { id: "academy", label: t("tab.academy") },
              { id: "glossary", label: t("tab.glossary") }
            ],
            value: tab,
            onChange: changeTab,
            ariaLabel: t("title")
          }),
          tab === "market" ? (0, import_react21.createElement)(RefreshButton, {
            label: t("refresh"),
            busy: feed.loading,
            onClick: feed.refresh
          }) : null
        )
      ),
      (0, import_react21.createElement)(
        "main",
        { id: "of-panel-" + tab, role: "tabpanel" },
        tab === "market" ? (0, import_react21.createElement)(Dashboard, {
          t,
          snapshot: feed.snapshot,
          loading: feed.loading,
          error: feed.error,
          onRetry: feed.refresh
        }) : tab === "academy" ? articleId ? (0, import_react21.createElement)(ArticleView, {
          t,
          id: articleId,
          onBack: () => setArticleId(null),
          onOpenArticle: openArticle
        }) : (0, import_react21.createElement)(Academy, { t, onOpenArticle: openArticle }) : (0, import_react21.createElement)(Glossary, { t })
      ),
      (0, import_react21.createElement)(
        "footer",
        { className: "of-foot" },
        (0, import_react21.createElement)("span", { className: "of-live-dot", "data-stale": feed.snapshot && feed.snapshot.stale ? "true" : "false" }),
        (0, import_react21.createElement)(
          "span",
          { className: "of-foot-meta" },
          t("market.updated") + " " + (updated ? new Date(updated).toLocaleTimeString() : "\u2014")
        ),
        feed.snapshot && feed.snapshot.stale ? (0, import_react21.createElement)("span", { className: "of-badge" }, t("stale")) : null,
        (0, import_react21.createElement)("span", { style: { flex: 1 } }),
        (0, import_react21.createElement)(
          "a",
          { href: "https://github.com/5777-wq/openfinlens", target: "_blank", rel: "noreferrer noopener" },
          "OpenFinLens"
        ),
        (0, import_react21.createElement)("span", null, "\xB7"),
        (0, import_react21.createElement)(
          "a",
          { href: "https://github.com/5777-wq/openfin-academy", target: "_blank", rel: "noreferrer noopener" },
          "OpenFin Academy"
        ),
        (0, import_react21.createElement)("span", null, "\xB7"),
        (0, import_react21.createElement)("span", null, t("market.disclaimer"))
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
    tag.textContent = CSS;
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
      (owner) => (0, import_react21.createElement)(Mark, { size: owner && owner.size || 16 })
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
      (ownerProps) => (0, import_react21.createElement)(OpenFinPage, { t: ownerProps && ownerProps.t || t })
    )
  );
}
    return module.exports;
  },
});
