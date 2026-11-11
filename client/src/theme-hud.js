/**
 * Floating HUD stylesheet.
 *
 * Two surfaces live here:
 *   - `.of-hud-*` — the in-page widget. It is its own dark artwork surface
 *     (teal/gold brand, `#0e161b` card) so it reads the same over any page.
 *   - `.of-hset-*` — the settings sheet. It follows the DSH host theme through
 *     the `--dsw-alias-*` tokens, exactly like the page chrome.
 *
 * The overlay slot is outside `.of-page`, so the `--of-*` tokens this plugin
 * normally inherits are re-declared on `.of-hud-layer` (same values, same
 * fallbacks). `main.js` injects `CSS + HUD_CSS` once.
 */
export const HUD_CSS = String.raw`
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
`
