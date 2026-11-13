/**
 * dsh-openfin client stylesheet.
 *
 * One string, injected once per plugin run by `main.js`. Chrome colors come
 * from the host's `--dsw-alias-*` tokens so light/dark and community skins keep
 * working; the only literal colors are the OpenFin brand mark and the heatmap's
 * derived tints, which are artwork.
 *
 * Class prefix: `of-`. Components never take literal colors from here — they
 * pick semantic classes (of-up / of-down / of-flat) or set geometry inline.
 */
export const CSS = String.raw`
.of-page {
  --of-brand: #96692b;
  --of-brand-deep: #6a4a15;
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
.of-page[data-view="terminal"] { overflow: hidden; }
.of-page[data-view="terminal"] .of-inner {
  display: flex; flex-direction: column;
  height: 100%;
  max-width: none;
  padding: calc(18px + var(--dsh-frame-top-clearance, 0px)) clamp(10px, 1.4vw, 22px) 12px;
}
.of-page[data-view="terminal"] .of-head { flex: none; margin-bottom: 12px; }
.of-page[data-view="terminal"] main { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
.of-terminal-holder { display: none; flex: 1 1 auto; min-height: 0; flex-direction: column; }
.of-terminal-holder[data-active="true"] { display: flex; }
.of-terminal { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; position: relative; }
.of-terminal-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; min-height: 30px; font-size: 11.5px; color: var(--of-text-2); }
.of-terminal-title { font-size: 12.5px; font-weight: 600; color: var(--of-text); white-space: nowrap; }
.of-terminal-hint { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.of-terminal-frame {
  flex: 1 1 auto; min-height: 0; width: 100%;
  border: 0; border-radius: 12px; background: #fff; color-scheme: normal;
  box-shadow: 0 14px 40px -32px rgba(0, 0, 0, 0.6);
}
.of-terminal-veil {
  position: absolute; inset: 38px 0 0; display: grid; place-items: center;
  background: color-mix(in srgb, var(--dsw-alias-bg-base, #faf9f7) 72%, transparent);
  backdrop-filter: blur(2px); border-radius: 12px; z-index: 2;
}
.of-terminal-veil-card {
  display: flex; flex-direction: column; gap: 6px; align-items: center;
  padding: 16px 22px; border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #fff); border: 0.5px solid var(--of-border);
  box-shadow: 0 18px 44px -30px rgba(0, 0, 0, 0.5); text-align: center;
}
.of-terminal-veil-title { font-size: 12.5px; font-weight: 600; color: var(--of-text); }
.of-terminal-veil-hint { font-size: 11px; color: var(--of-text-2); max-width: 46ch; }

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
  background: linear-gradient(148deg, #35474c 0%, #24343a 58%, #1b282d 100%);
  box-shadow: 0 8px 20px -12px color-mix(in srgb, var(--of-brand-deep) 90%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.22);
  color: #e3c184;
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
  /* 293 cards: off-screen rows skip layout and paint until they are scrolled
     into view. The intrinsic size keeps the scrollbar stable. */
  content-visibility: auto; contain-intrinsic-size: auto 92px;
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
`
