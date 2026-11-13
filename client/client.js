/* dsh-openfin 0.5.0 — built by scripts/build-client.mjs. Do not edit. */
window.__ModuleLoader__.load({
  id: "dsh-openfin",
  factory(require) {
    const module = { exports: {} };
    const exports = module.exports;
var Dt=Object.defineProperty;var za=Object.getOwnPropertyDescriptor;var Ma=Object.getOwnPropertyNames;var Ta=Object.prototype.hasOwnProperty;var Oa=(e,t)=>{for(var o in t)Dt(e,o,{get:t[o],enumerable:!0})},La=(e,t,o,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Ma(t))!Ta.call(e,a)&&a!==o&&Dt(e,a,{get:()=>t[a],enumerable:!(r=za(t,a))||r.enumerable});return e};var Ha=e=>La(Dt({},"__esModule",{value:!0}),e);var Ur={};Oa(Ur,{apply:()=>qr,inject:()=>Dr,name:()=>Rr});module.exports=Ha(Ur);var y=require("react");var Ee=require("react"),ro="/dsh-openfin/api";async function Fe(e,t={}){let o=await fetch(ro+e,{signal:t.signal,cache:t.cache??"no-store",headers:{accept:"application/json"}}),r;try{r=await o.json()}catch{r=void 0}if(!o.ok){let a=r&&typeof r.error=="string"?r.error:`HTTP ${o.status}`;throw new Error(a)}if(r===void 0)throw new Error("响应不是 JSON");return r}var no=e=>Fe("/snapshot",{signal:e}),Pt=new Map;function Ft(e){let t=Pt.get(e);if(t!==void 0)return t;let o=Fe(e,{cache:"default"}).catch(r=>{throw Pt.delete(e),r});return Pt.set(e,o),o}var io=(e,t)=>Fe("/sector?code="+encodeURIComponent(e),{signal:t}),so=()=>Ft("/academy"),lo=e=>Ft("/academy/article?id="+encodeURIComponent(e)),dt=()=>Ft("/glossary");async function Ia(e,t,o={}){let r=await fetch(ro+e,{method:"POST",signal:o.signal,headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(t)}),a;try{a=await r.json()}catch{a=void 0}if(!r.ok){let n=a&&typeof a.error=="string"?a.error:`HTTP ${r.status}`;throw new Error(n)}return a}var ft=e=>Fe("/hud",{signal:e}),ze=(e,t)=>Ia("/hud",e,{signal:t});async function co(e,t){let o=String(e??"").trim();return o===""?{query:"",results:[]}:Fe("/hud/search?q="+encodeURIComponent(o)+"&limit=8",{signal:t})}async function fo(e,t){let o=Array.isArray(e)?e.join(","):String(e??"");return Fe("/hud/quotes?ids="+encodeURIComponent(o),{signal:t})}function Me(e,t=[]){let[o,r]=(0,Ee.useState)({loading:!0,data:null,error:null}),[a,n]=(0,Ee.useState)(0),s=(0,Ee.useRef)(e);return s.current=e,(0,Ee.useEffect)(()=>{let i=new AbortController,f=!0;return r(d=>({loading:!0,data:d.data,error:null})),s.current(i.signal).then(d=>{f&&r({loading:!1,data:d,error:null})},d=>{!f||d&&d.name==="AbortError"||r(x=>({loading:!1,data:x.data,error:d&&d.message||String(d)}))}),()=>{f=!1,i.abort()}},[...t,a]),{...o,reload:()=>n(i=>i+1)}}var po=String.raw`
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
`;var uo={"meta.title":"OpenFin market and academy","meta.description":"OpenFin inside DeepSeek Harness: the complete OpenFinLens terminal (multi-market heatmaps, event map, prediction markets, K-lines, funds, portfolio, macro, industry chains and every other upstream feature), plus a native market page, a plain-language finance academy and glossary, and a floating HUD with custom instruments and a boss key.","meta.direction":"intl",nav:"OpenFin",title:"OpenFin",subtitle:"Markets and plain-language finance, one page.","tab.market":"Markets","tab.academy":"Academy","tab.glossary":"Glossary",refresh:"Refresh quotes",loading:"Loading…",retry:"Retry","error.title":"Market data is unavailable","error.body":"The upstream feed did not answer; this retries automatically.",empty:"Nothing here yet",partial:"Partial data",stale:"Cached data","market.indices":"Global markets","market.indicesHint":"A-shares · Hong Kong · US · Commodities · Crypto","market.partialBody":"The upstream feed did not answer; retrying automatically.","market.heatmap":"A-share industry heatmap","market.heatmapHint":"Area = market cap · Color = change","market.breadth":"Sectors up / down","market.movers":"Movers","market.gainers":"Gainers","market.losers":"Losers","market.active":"Turnover","market.news":"Market news","market.newsHint":"Eastmoney","market.tooltipChange":"Change","market.tooltipPrice":"Level","market.tooltipCap":"Market cap","market.sector":"Constituents","market.sectorHint":"Constituents are sorted by turnover; informational only.","market.sectorEmpty":"No constituent data for this sector yet","market.closeSector":"Close sector","market.updated":"Updated","market.disclaimer":"For information only, not investment advice","academy.title":"Plain-language finance academy","academy.search":"Search articles, topics or keywords","academy.searchEmpty":"No matching articles","academy.empty":"The academy content is being prepared","academy.readMinutes":"{n} min read","academy.difficulty":"Level {n}","academy.dataAsOf":"Data as of {date}","academy.back":"Back to academy","academy.related":"Related reading","academy.points":"Key points","academy.all":"All","glossary.title":"Finance glossary","glossary.search":"Search terms","glossary.empty":"No matching terms","glossary.one":"In one line","glossary.metaphor":"Metaphor","glossary.number":"One number","glossary.pit":"Common pitfall","glossary.daily":"Term of the day","glossary.terms":"All terms","glossary.expand":"Expand","glossary.collapse":"Collapse","a11y.loading":"Loading","a11y.refresh":"Refresh","hud.title":"Floating quotes","hud.inline":"Show the in-page HUD","hud.inlineHint":"A small draggable quote card that floats inside DeepSeek Harness.","hud.desktop":"Desktop HUD","hud.desktopHint":"An always-on-top window outside the app. Needs an Electron runtime on this machine.","hud.desktopOn":"Running","hud.desktopOff":"Stopped","hud.desktopUnavailable":"Electron runtime not found","hud.recenter":"Recenter","hud.symbols":"Instruments","hud.symbolsHint":"Choose 1–6 instruments for the card.","hud.opacity":"Opacity","hud.idleOpacity":"Idle opacity","hud.idleAfter":"Fade out after","hud.idleOff":"Never","hud.hoverFull":"Full opacity on hover","hud.size":"Size","hud.sizeS":"S","hud.sizeM":"M","hud.sizeL":"L","hud.spark":"Mini sparklines","hud.titleLabel":"Card title","hud.resetPosition":"Reset position","hud.positionHint":"Drag the card to move it; the default is the bottom-right corner.","hud.collapsedHint":"Expand the quote card","hud.expand":"Expand","hud.collapse":"Collapse","hud.settings":"Floating HUD settings","hud.close":"Close","hud.openDashboard":"Open the OpenFin page","hud.updated":"Updated","hud.disclaimer":"Informational only","hud.waiting":"Waiting for quotes","hud.error":"Quote feed unavailable","hud.saved":"Changes save automatically","hud.searchPlaceholder":"Search stocks / codes","hud.searchHint":"Server-side search; pick a stock to pin it to the card.","hud.searchEmpty":"No matching instruments","hud.searching":"Searching…","hud.custom":"Custom","hud.remove":"Remove","hud.add":"Add","hud.selectedCount":"Selected","hud.market":"Market","hud.customLimit":"Up to 6 instruments in total.","hud.panic":"Boss key","hud.panicHint":"Press it once to hide the floating card instantly; the same combo brings it back.","hud.panicNow":"Hide now","hud.panicShortcut":"Shortcut","hud.panicOff":"Off","tab.terminal":"Terminal","terminal.title":"OpenFinLens terminal","terminal.hint":"The full app: multi-market treemap, event map, prediction markets, K-lines, funds and portfolio…","terminal.reload":"Reload the terminal","terminal.openExternal":"Open in a new tab","terminal.loading":"Loading the full terminal…","terminal.slow":"Still loading — the terminal bundle is large. You can retry with “reload”.","terminal.frameTitle":"OpenFinLens terminal"},mo={"meta.title":"OpenFin 金融看板","meta.description":"DSH 里的 OpenFin：完整 OpenFinLens 终端（多市场热力图、事件地图、预测市场、K线、基金、持仓、宏观、产业链等原版全部功能），加上原生行情页、白话金融学院与词典、可自选标的的悬浮窗与防老板快捷键。","meta.direction":"cn",nav:"OpenFin",title:"OpenFin",subtitle:"行情与白话金融，一页读完。","tab.market":"行情","tab.academy":"学院","tab.glossary":"词典",refresh:"刷新行情",loading:"正在加载…",retry:"重试","error.title":"数据暂时取不到了","error.body":"上游接口没有返回数据，稍后会自动重试。",empty:"暂无数据",partial:"部分数据延迟",stale:"缓存数据","market.indices":"全球行情","market.indicesHint":"A股 · 港股 · 美股 · 商品 · 加密","market.partialBody":"上游接口没有返回行情，稍后自动重试。","market.heatmap":"A股行业热力图","market.heatmapHint":"面积=总市值 · 颜色=涨跌幅","market.breadth":"板块涨跌家数","market.movers":"异动榜","market.gainers":"涨幅","market.losers":"跌幅","market.active":"成交额","market.news":"财经快讯","market.newsHint":"东方财富","market.tooltipChange":"涨跌","market.tooltipPrice":"点位","market.tooltipCap":"总市值","market.sector":"板块成分股","market.sectorHint":"成分股按成交额排序，仅供观察。","market.sectorEmpty":"这个板块暂时没有成分股数据","market.closeSector":"关闭板块","market.updated":"更新于","market.disclaimer":"数据仅供参考，不构成投资建议","academy.title":"白话金融学院","academy.search":"搜索文章、主题或关键词","academy.searchEmpty":"没有匹配的文章","academy.empty":"学院内容还在准备中","academy.readMinutes":"{n} 分钟","academy.difficulty":"难度 {n}","academy.dataAsOf":"数据截至 {date}","academy.back":"返回学院","academy.related":"相关阅读","academy.points":"记住这几点","academy.all":"全部","glossary.title":"金融词典","glossary.search":"搜索词条","glossary.empty":"没有匹配的词条","glossary.one":"一句话","glossary.metaphor":"打个比方","glossary.number":"一个数字","glossary.pit":"容易踩的坑","glossary.daily":"今日一词","glossary.terms":"全部词条","glossary.expand":"展开","glossary.collapse":"收起","a11y.loading":"正在加载","a11y.refresh":"刷新","hud.title":"悬浮行情","hud.inline":"页面内悬浮卡","hud.inlineHint":"在 DeepSeek Harness 窗口上层显示一张可拖动的行情小卡。","hud.desktop":"桌面悬浮窗","hud.desktopHint":"在应用之外置顶显示，需要本机有 Electron 运行时。","hud.desktopOn":"运行中","hud.desktopOff":"未运行","hud.desktopUnavailable":"未找到 Electron 运行时","hud.recenter":"回到默认位置","hud.symbols":"显示的品种","hud.symbolsHint":"选 1–6 个品种放进小卡里。","hud.opacity":"不透明度","hud.idleOpacity":"闲置不透明度","hud.idleAfter":"闲置淡出","hud.idleOff":"不淡出","hud.hoverFull":"悬停时恢复全不透明","hud.size":"尺寸","hud.sizeS":"小","hud.sizeM":"中","hud.sizeL":"大","hud.spark":"迷你走势线","hud.titleLabel":"卡片标题","hud.resetPosition":"重置位置","hud.positionHint":"拖动卡片即可摆放，默认在右下角。","hud.collapsedHint":"展开行情小卡","hud.expand":"展开","hud.collapse":"收起","hud.settings":"悬浮行情设置","hud.close":"关闭","hud.openDashboard":"打开 OpenFin 页面","hud.updated":"更新于","hud.disclaimer":"仅供参考","hud.waiting":"等待行情数据","hud.error":"行情暂时取不到","hud.saved":"设置会自动保存","hud.searchPlaceholder":"搜索股票 / 代码","hud.searchHint":"服务端搜索，选中后把该标的固定到小卡上。","hud.searchEmpty":"没有匹配的标的","hud.searching":"搜索中…","hud.custom":"自定义","hud.remove":"移除","hud.add":"添加","hud.selectedCount":"已选","hud.market":"市场","hud.customLimit":"最多同时显示 6 个标的。","hud.panic":"老板键","hud.panicHint":"按一次立即隐藏悬浮卡，再按一次恢复显示。","hud.panicNow":"立即隐藏","hud.panicShortcut":"快捷键","hud.panicOff":"关闭","tab.terminal":"终端","terminal.title":"OpenFinLens 完整终端","terminal.hint":"原版全部功能：多市场热力图、事件地图、预测市场、个股 K 线、基金与持仓…","terminal.reload":"重新加载终端","terminal.openExternal":"在新标签打开","terminal.loading":"正在加载完整终端…","terminal.slow":"加载较慢：终端资源较大，仍不出现可点「重新加载」。","terminal.frameTitle":"OpenFinLens 完整终端"};var L=require("react"),Ra={refresh:e=>(0,L.createElement)("g",null,(0,L.createElement)("path",{d:"M20.4 12a8.4 8.4 0 1 1-2.6-6.05",strokeWidth:e}),(0,L.createElement)("path",{d:"M20.4 3.6v4.8h-4.8",strokeWidth:e})),search:e=>(0,L.createElement)("g",null,(0,L.createElement)("circle",{cx:10.8,cy:10.8,r:6.4,strokeWidth:e}),(0,L.createElement)("path",{d:"m15.6 15.6 4.2 4.2",strokeWidth:e})),close:e=>(0,L.createElement)("path",{d:"M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6",strokeWidth:e}),back:e=>(0,L.createElement)("path",{d:"M14.6 5.4 8 12l6.6 6.6",strokeWidth:e}),external:e=>(0,L.createElement)("g",null,(0,L.createElement)("path",{d:"M13.5 5.5h5v5",strokeWidth:e}),(0,L.createElement)("path",{d:"M18.5 5.5 10.8 13.2",strokeWidth:e}),(0,L.createElement)("path",{d:"M18.5 13v4.4a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 17.4V7.1a1.6 1.6 0 0 1 1.6-1.6h4.2",strokeWidth:e})),float:e=>(0,L.createElement)("g",null,(0,L.createElement)("rect",{x:3.5,y:4.5,width:17,height:14,rx:2.6,strokeWidth:e}),(0,L.createElement)("rect",{x:11,y:10.5,width:7,height:5.4,rx:1.2,fill:"currentColor",stroke:"none",opacity:.9})),chevron:e=>(0,L.createElement)("path",{d:"m8.5 5.5 6.5 6.5-6.5 6.5",strokeWidth:e}),info:e=>(0,L.createElement)("g",null,(0,L.createElement)("circle",{cx:12,cy:12,r:8.4,strokeWidth:e}),(0,L.createElement)("path",{d:"M12 11v5.2",strokeWidth:e}),(0,L.createElement)("path",{d:"M12 7.8h.01",strokeWidth:e+.6}))};function $({name:e,size:t=16,strokeWidth:o=1.7,className:r,style:a}){let n=Ra[e];return n?(0,L.createElement)("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,focusable:!1,className:r,style:{display:"block",flex:"none",...a}},n(o)):null}function ye({size:e=22,radius:t=6}){return(0,L.createElement)("svg",{viewBox:"0 0 64 64",width:e,height:e,"aria-hidden":!0,focusable:!1,style:{display:"block"}},(0,L.createElement)("rect",{width:64,height:64,rx:15,fill:"transparent"}),(0,L.createElement)("circle",{cx:32,cy:33,r:18.5,fill:"none",stroke:"currentColor",strokeWidth:3.2,opacity:.9}),(0,L.createElement)("path",{d:"M14.5 39.5 24 29.5l7 6.8 9.5-11.2 8 8.4",fill:"none",stroke:"currentColor",strokeWidth:3.2,strokeLinecap:"round",strokeLinejoin:"round"}),(0,L.createElement)("circle",{cx:48.5,cy:33,r:3.1,fill:"var(--of-gold, #c79a3a)"}))}var ho=String.raw`
/* ------------------------------------------------------------- layer */
.of-hud-layer {
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
  color: #f7f1e3;
  background:
    radial-gradient(120% 120% at 32% 22%, rgba(214, 168, 90, 0.42) 0%, transparent 62%),
    linear-gradient(152deg, #3b4d52 0%, #26363c 56%, #1a272c 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 14px 30px -18px rgba(16, 12, 4, 0.9),
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
  color: #f7f1e3;
  background: linear-gradient(152deg, #b98c3e 0%, #7d5a22 100%);
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
`;var qt="dsh-openfin:hud",jt="dsh-openfin:hud-settings",Da=400,Pa=6,Fa=12,_a=24,go=20,bo=100,ja=5e3,Ba=6e5,qa=18,Ua=new Set(["s","m","l"]),$a=/^\d{1,3}\.[A-Za-z0-9_]+$/,xo="em:",wo="CommandOrControl+Shift+H",mt=Object.freeze([{id:"CommandOrControl+Shift+H",accelerator:"CommandOrControl+Shift+H",label:"Ctrl/⌘ + Shift + H"},{id:"Alt+X",accelerator:"Alt+X",label:"Alt + X"},{id:"CommandOrControl+Alt+H",accelerator:"CommandOrControl+Alt+H",label:"Ctrl/⌘ + Alt + H"},{id:"CommandOrControl+Shift+Space",accelerator:"CommandOrControl+Shift+Space",label:"Ctrl/⌘ + Shift + Space"}].map(e=>Object.freeze(e))),Ga=new Set(mt.map(e=>e.accelerator)),ht=Object.freeze([{id:"sh000001",name:"上证指数",kind:"index"},{id:"sz399001",name:"深证成指",kind:"index"},{id:"sz399006",name:"创业板指",kind:"index"},{id:"hkHSI",name:"恒生指数",kind:"index"},{id:"usIXIC",name:"纳斯达克",kind:"index"},{id:"usSPX",name:"标普500",kind:"index"},{id:"usDJIA",name:"道琼斯",kind:"index"},{id:"hfGC",name:"COMEX黄金",kind:"commodity"},{id:"fxUDI",name:"美元指数",kind:"fx"},{id:"btc",name:"BTC",kind:"crypto"},{id:"eth",name:"ETH",kind:"crypto"}].map(e=>Object.freeze(e))),Ka=new Set(ht.map(e=>e.id)),Xa=new Map(ht.map(e=>[e.id,e])),gt=Object.freeze({version:1,inline:!1,desktop:!1,collapsed:!1,symbols:Object.freeze(["sh000001","sz399001","hkHSI","usIXIC","btc"]),catalog:Object.freeze({}),opacity:85,idleOpacity:35,idleAfterMs:3e4,hoverFull:!0,size:"m",title:"OpenFin",showSpark:!0,position:Object.freeze({x:0,y:0}),panicEnabled:!0,panicShortcut:wo}),X=null,Bt=new Set,pt=0,yo=!1,vo=!1,de=0,Je=null;function ko(){if(typeof window>"u")return null;try{let e=window.localStorage.getItem(qt);if(!e)return null;let t=JSON.parse(e);return t!==null&&typeof t=="object"&&!Array.isArray(t)?t:null}catch{return null}}function No(e){if(!(typeof window>"u"))try{window.localStorage.setItem(qt,JSON.stringify(e))}catch{}}function _e(e,t){return typeof e=="boolean"?e:t}function _t(e,t,o,r){let a=typeof e=="number"?e:Number(e);return Number.isFinite(a)?Math.min(o,Math.max(t,Math.round(a))):r}function Ya(e,t){if(typeof e!="string")return t;let o=e.replace(/\s+/g," ").trim().slice(0,qa);return o.length>0?o:t}function Ut(e){if(typeof e!="string"||!e.startsWith(xo))return null;let t=e.slice(xo.length);return $a.test(t)?t:null}function $t(e){return Ut(e)!==null}function bt(e,t){let o=typeof e=="string"?e:"",r=t&&typeof t=="object"?t.catalog:null,a=r&&typeof r=="object"?r[o]:null;if(a&&typeof a.name=="string"&&a.name!=="")return a.name;let n=Xa.get(o);return n?n.name:o}function So(e){let t=mt.find(o=>o.accelerator===e||o.id===e);return t?t.label:""}function Qa(e,t){if(!Array.isArray(e))return t.slice();let o=new Set,r=[];for(let a of e)if(!(typeof a!="string"||o.has(a))&&!(!Ka.has(a)&&Ut(a)===null)&&(o.add(a),r.push(a),r.length>=Pa))break;return r.length>0?r:t.slice()}function Va(e,t){let o=e!==null&&typeof e=="object"&&!Array.isArray(e)?e:{},r={},a=0;for(let n of t){if(a>=Fa)break;let s=Ut(n);if(s===null)continue;let i=o[n];if(!i||typeof i!="object"||Array.isArray(i))continue;let f=typeof i.name=="string"?i.name.trim().slice(0,_a):"";f!==""&&(r[n]={name:f,secid:s,code:typeof i.code=="string"?i.code.slice(0,12):"",market:typeof i.market=="string"?i.market.slice(0,12):"",kind:i.kind==="index"?"index":"stock"},a+=1)}return r}function Ja(e,t){if(!_e(e.panicEnabled,t.panicEnabled!==!1))return{panicEnabled:!1,panicShortcut:""};let r=typeof e.panicShortcut=="string"?e.panicShortcut:typeof t.panicShortcut=="string"?t.panicShortcut:"";return{panicEnabled:!0,panicShortcut:Ga.has(r)?r:wo}}function Wa(e,t){if(e===null||typeof e!="object")return{x:t.x,y:t.y};let o=Number(e.x),r=Number(e.y);return!Number.isFinite(o)||!Number.isFinite(r)?{x:t.x,y:t.y}:{x:Math.round(o),y:Math.round(r)}}function We(e,t){let o=t!==null&&typeof t=="object"?t:{},r=o.symbols===void 0?e.symbols.slice():Qa(o.symbols,e.symbols),a=Va(o.catalog===void 0?e.catalog:o.catalog,r),n=Ja(o,e);return{version:1,inline:_e(o.inline,e.inline),desktop:_e(o.desktop,e.desktop),collapsed:_e(o.collapsed,e.collapsed),symbols:r,catalog:a,opacity:o.opacity===void 0?e.opacity:_t(o.opacity,go,bo,e.opacity),idleOpacity:o.idleOpacity===void 0?e.idleOpacity:_t(o.idleOpacity,go,bo,e.idleOpacity),idleAfterMs:o.idleAfterMs===void 0?e.idleAfterMs:o.idleAfterMs===0?0:_t(o.idleAfterMs,ja,Ba,e.idleAfterMs),hoverFull:_e(o.hoverFull,e.hoverFull),size:typeof o.size=="string"&&Ua.has(o.size)?o.size:e.size,title:o.title===void 0?e.title:Ya(o.title,e.title),showSpark:_e(o.showSpark,e.showSpark),position:o.position===void 0?{x:e.position.x,y:e.position.y}:Wa(o.position,e.position),panicEnabled:n.panicEnabled,panicShortcut:n.panicShortcut}}function Za(e){let t={};if(e!==null&&typeof e=="object")for(let[o,r]of Object.entries(e))t[o]={...r};return t}function ut(e){return{...e,symbols:Array.isArray(e.symbols)?e.symbols.slice():[],catalog:Za(e.catalog),position:{x:e.position.x,y:e.position.y}}}function Ao(e,t){return JSON.stringify(ut(e))===JSON.stringify(ut(t))}function Ze(){return X===null&&(X=We(gt,ko()||{})),ut(X)}function Gt(){let e=Ze();for(let t of Array.from(Bt))try{t(e)}catch{}}function Co(e){return X===null&&(X=We(gt,ko()||{})),X=We(X,e&&typeof e=="object"?e:{}),pt+=1,No(X),Gt(),ut(X)}function Eo(e){return typeof e!="function"?()=>{}:(Bt.add(e),vo||(vo=!0,er()),yo||(yo=!0,tr()),()=>{Bt.delete(e)})}function zo(e){let t=e&&typeof e=="object"?e:Ze(),{desktop:o,...r}=t;Je=r,de&&clearTimeout(de),de=setTimeout(Mo,Da)}function Mo(){de&&(clearTimeout(de),de=0);let e=Je;Je=null,e&&ze({config:e}).catch(()=>{})}function To(e){let t=e===!0;de&&(clearTimeout(de),de=0);let o=Je;return Je=null,ze(o?{config:o,desktop:t}:{desktop:t}).then(a=>a,()=>null)}function Oo(){if(!(typeof window>"u"))try{window.dispatchEvent(new CustomEvent(jt))}catch{}}function Lo(e){if(typeof window>"u"||typeof e!="function")return()=>{};let t=()=>e();return window.addEventListener(jt,t),()=>{window.removeEventListener(jt,t)}}function er(){typeof window>"u"||(window.addEventListener("storage",e=>{if(!e||e.key!==qt||typeof e.newValue!="string")return;let t;try{t=JSON.parse(e.newValue)}catch{return}let o=We(gt,t!==null&&typeof t=="object"?t:{});X!==null&&Ao(X,o)||(X=o,pt+=1,Gt())}),window.addEventListener("pagehide",Mo))}function tr(){if(typeof window>"u")return;let e=()=>{let t=pt;ft().then(o=>{let r=o&&o.config;if(!r||typeof r!="object"||pt!==t)return;let a=We(gt,r),n=Ze();Ao(n,a)||(X=a,No(X),Gt())},()=>{})};typeof queueMicrotask=="function"?queueMicrotask(e):setTimeout(e,0)}var m=require("react");var Ho=new Map;function or(e){let t=Ho.get(e);return t===void 0&&(t=new Intl.NumberFormat("en-US",{minimumFractionDigits:e,maximumFractionDigits:e}),Ho.set(e,t)),t}function je(e,t=2){return typeof e!="number"||!Number.isFinite(e)?"—":or(t).format(e)}function J(e,t=2){return typeof e!="number"||!Number.isFinite(e)?"—":(e>0?"+":"")+e.toFixed(t)+"%"}function Io(e,t=2){return typeof e!="number"||!Number.isFinite(e)?"—":(e>0?"+":"")+e.toFixed(t)}function yt(e){if(typeof e!="number"||!Number.isFinite(e))return"—";let t=Math.abs(e);return t>=1e12?xt(e/1e12)+"万亿":t>=1e8?xt(e/1e8)+"亿":t>=1e4?xt(e/1e4)+"万":xt(e)}function xt(e){let t=Math.abs(e),o=t>=100?0:t>=10?1:2;return e.toFixed(o)}function Ro(e){if(typeof e!="number"||!Number.isFinite(e))return"—";let t=new Date(e),o=r=>String(r).padStart(2,"0");return`${o(t.getHours())}:${o(t.getMinutes())}:${o(t.getSeconds())}`}function oe(e){return typeof e!="number"||!Number.isFinite(e)||Math.abs(e)<1e-9?"flat":e>0?"up":"down"}var fe=require("react");function vt(e,t=420){let[o,r]=(0,fe.useState)(e),a=(0,fe.useRef)(e),n=(0,fe.useRef)(e);return(0,fe.useEffect)(()=>{if(typeof e!="number"||!Number.isFinite(e)){a.current=e,n.current=e,r(e);return}let s=typeof a.current=="number"&&Number.isFinite(a.current)?a.current:e;if(s===e){n.current!==e&&(n.current=e,r(e));return}if(typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){a.current=e,r(e);return}let f=performance.now(),d=0,x=u=>{let k=Math.min(1,(u-f)/t),h=1-Math.pow(1-k,3),p=s+(e-s)*h;a.current=p,n.current=p,r(p),k<1?d=requestAnimationFrame(x):(a.current=e,n.current=e,r(e))};return d=requestAnimationFrame(x),()=>cancelAnimationFrame(d)},[e,t]),o}function Do(e){let[t,o]=(0,fe.useState)(()=>typeof window<"u"&&window.matchMedia?window.matchMedia(e).matches:!1);return(0,fe.useEffect)(()=>{if(typeof window>"u"||!window.matchMedia)return;let r=window.matchMedia(e),a=()=>o(r.matches);return o(r.matches),r.addEventListener("change",a),()=>r.removeEventListener("change",a)},[e]),t}var wt=require("react");function kt({values:e,up:t}){if(!Array.isArray(e)||e.length<3)return null;let o=1/0,r=-1/0;for(let d of e)d<o&&(o=d),d>r&&(r=d);let a=r-o||1,s=e.map((d,x)=>{let u=x/(e.length-1)*100,k=100-(d-o)/a*96-2;return[u,k]}).map(([d,x],u)=>(u===0?"M":"L")+d.toFixed(2)+" "+x.toFixed(2)).join(" "),i=s+" L100 100 L0 100 Z",f=t?"var(--of-up)":"var(--of-down)";return(0,wt.createElement)("svg",{className:"of-quote-spark",viewBox:"0 0 100 100",preserveAspectRatio:"none","aria-hidden":!0,focusable:!1},(0,wt.createElement)("path",{d:i,fill:f,opacity:.1}),(0,wt.createElement)("path",{d:s,fill:"none",stroke:f,strokeWidth:1.4,strokeLinejoin:"round",strokeLinecap:"round",opacity:.9}))}var ar=3e4,Uo=44,rr=62,nr=6,Be=rr+nr+Uo,Te=Uo,ve=8,Po=24,ir=16,Fo=18,_o=Object.freeze({s:300,m:330,l:368}),jo=Object.freeze({hkHSI:"100.HSI",usIXIC:"100.NDX",usSPX:"100.SPX",usDJIA:"100.DJIA",hfGC:"101.GC00Y",fxUDI:"100.UDI",btc:"BTC",eth:"ETH"});function sr(e){return 84+Math.max(1,e)*31}function Bo(){return typeof window>"u"?{w:1280,h:800}:{w:window.innerWidth||1280,h:window.innerHeight||800}}function lr(){let[e,t]=(0,m.useState)(Bo);return(0,m.useEffect)(()=>{let o=()=>t(Bo());return window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),e}function qe(e,t,o){return t>o?t:Math.min(o,Math.max(t,e))}function cr(e){return!e||typeof e!="object"?!0:Math.round(Number(e.x)||0)===0&&Math.round(Number(e.y)||0)===0}function qo(e,t,o,r,a){let n=cr(e)?{x:t.w-Be-Po,y:t.h-Te-Po}:{x:Number(e.x)||0,y:Number(e.y)||0},s=qe(n.x,ve,t.w-Be-ve),i=qe(n.y,ve,t.h-Te-ve);if(!o){let f=qe(s+Be-r,ve,t.w-r-ve),d=qe(i+Te-a,ve,t.h-a-ve);s=f+r-Be,i=d+a-Te}return{x:Math.round(s),y:Math.round(i)}}var dr={gear:e=>(0,m.createElement)("g",null,(0,m.createElement)("circle",{cx:12,cy:12,r:3.3,strokeWidth:e}),(0,m.createElement)("path",{d:"M12 3.4v2.3M12 18.3v2.3M3.4 12h2.3M18.3 12h2.3M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M5.9 18.1l1.6-1.6M16.5 7.5l1.6-1.6",strokeWidth:e})),collapse:e=>(0,m.createElement)("path",{d:"M6.5 12h11",strokeWidth:e}),eye:e=>(0,m.createElement)("g",null,(0,m.createElement)("path",{d:"M2.8 12S6.4 5.6 12 5.6 21.2 12 21.2 12 17.6 18.4 12 18.4 2.8 12 2.8 12Z",strokeWidth:e}),(0,m.createElement)("circle",{cx:12,cy:12,r:2.7,strokeWidth:e}))};function Kt({name:e,size:t=13,strokeWidth:o=1.6}){let r=dr[e];return r?(0,m.createElement)("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,focusable:!1,style:{display:"block",flex:"none"}},r(o)):null}function fr({fallbackName:e,quote:t,showSpark:o,onOpen:r}){let a=vt(t&&typeof t.price=="number"?t.price:null,420),n=t&&typeof t.pct=="number"?t.pct:null,s=t?oe(n):"flat",i=t&&t.name||e||"",f=t&&typeof t.digits=="number"?t.digits:2,d=t?je(a,f):"—",x=t?J(n):"—";return(0,m.createElement)("div",{className:"of-hud-row",role:"button",tabIndex:0,"data-hud-action":"open","aria-label":i+" "+d+" "+x,title:i,onKeyDown:u=>{(u.key==="Enter"||u.key===" ")&&(u.preventDefault(),r?.())}},(0,m.createElement)("span",{className:"of-hud-row-name"},i),(0,m.createElement)("span",{className:"of-hud-row-price"},d),(0,m.createElement)("span",{className:"of-hud-row-pct","data-tone":s},x),o?(0,m.createElement)("span",{className:"of-hud-spark","data-tone":s,"aria-hidden":!0},t&&Array.isArray(t.spark)?(0,m.createElement)(kt,{values:t.spark,up:n>=0}):null):null)}function $o({t:e,config:t,onChange:o,onConfigure:r,onOpenDashboard:a,hidden:n,onPanic:s}){let i=lr(),f=Do("(prefers-reduced-motion: reduce)"),[d,x]=(0,m.useState)(null),[u,k]=(0,m.useState)(!0),[h,p]=(0,m.useState)(null),[S,A]=(0,m.useState)(!1),[N,b]=(0,m.useState)(!1),[z,I]=(0,m.useState)(!1),[Y,ke]=(0,m.useState)(null),[W,$e]=(0,m.useState)(!1),[st,Le]=(0,m.useState)(t.title||"OpenFin"),[Tt,q]=(0,m.useState)(0),Q=(0,m.useRef)(null),Ge=(0,m.useRef)(null),Ke=(0,m.useRef)(null),Z=(0,m.useRef)(null),ae=(0,m.useRef)(null),te=(0,m.useRef)(0),K=(0,m.useRef)(0),ge=(0,m.useRef)(!1),He=(0,m.useRef)(null),Ot=e("meta.direction")==="intl"?"intl":"cn",R=t.collapsed===!0,Xe=_o[t.size]?t.size:"m",be=_o[Xe],ne=(0,m.useMemo)(()=>(Array.isArray(t.symbols)?t.symbols:[]).map(M=>({id:M,fallbackName:bt(M,t)})),[t.symbols,t.catalog]),Ne=Array.isArray(t.symbols)?t.symbols.join("|"):"",Ie=(0,m.useMemo)(()=>{let g=new Map,M=d&&Array.isArray(d.quotes)?d.quotes:[];for(let D of M)D&&typeof D.id=="string"&&g.set(D.id,D);for(let D of Object.keys(jo)){let B=g.get(jo[D]);B&&!g.has(D)&&g.set(D,B)}return g},[d]),ie=R?Te:Tt||sr(ne.length),lt=qo(t.position,i,R,be,ie),se=Y||lt,Ye=R?se.x:se.x+Be-be,Re=R?se.y:se.y+Te-ie;(0,m.useEffect)(()=>{if(n)return;let g=!0,M=new AbortController,D=Array.isArray(t.symbols)?t.symbols.slice():[],B=0,ce=async()=>{if(!(typeof document<"u"&&document.hidden))try{let Ce=await fo(D,M.signal);if(!g)return;x(Ce),p(null)}catch(Ce){if(!g||Ce&&Ce.name==="AbortError")return;p(Ce&&Ce.message||String(Ce))}finally{g&&k(!1)}};He.current=ce,k(!0);let Ae=()=>{clearTimeout(B),B=setTimeout(async()=>{typeof document<"u"&&document.hidden||(await ce(),g&&Ae())},ar)},ao=()=>{if(typeof document<"u"&&document.hidden){clearTimeout(B),B=0;return}ce(),Ae()};return ce(),Ae(),document.addEventListener("visibilitychange",ao),()=>{g=!1,M.abort(),clearTimeout(B),He.current=null,document.removeEventListener("visibilitychange",ao)}},[Ne,n]),(0,m.useEffect)(()=>{W||Le(t.title||"")},[t.title,W]),(0,m.useEffect)(()=>{if(!W)return;let g=Ke.current;if(g)try{g.focus(),g.select()}catch{}},[W]),(0,m.useLayoutEffect)(()=>{if(R){q(0);return}let g=Ge.current;if(!g)return;let M=()=>{let B=g.offsetHeight;B>0&&q(B)};M();let D=null;return typeof ResizeObserver=="function"&&(D=new ResizeObserver(M),D.observe(g)),()=>{D&&D.disconnect()}},[R,Xe,Ne,t.showSpark]),(0,m.useEffect)(()=>{let g=Number(t.idleAfterMs)||0;if(K.current&&clearTimeout(K.current),K.current=0,ge.current=!1,b(!1),!(g<=0))return K.current=setTimeout(()=>{ge.current=!0,b(!0)},g),()=>{K.current&&(clearTimeout(K.current),K.current=0)}},[t.idleAfterMs]);let De=(0,m.useCallback)(()=>{let g=Number(t.idleAfterMs)||0;K.current&&(clearTimeout(K.current),K.current=0),ge.current&&(ge.current=!1,b(!1)),g>0&&(K.current=setTimeout(()=>{ge.current=!0,b(!0)},g))},[t.idleAfterMs]),Lt=qe(Number(t.opacity)||100,20,100)/100,Qe=qe(Number(t.idleOpacity)||20,20,100)/100,It=(S||z)&&t.hoverFull!==!1?1:N?Qe:Lt,ct=()=>{Le(t.title||""),$e(!0)},c=()=>{$e(!1);let g=st.replace(/\s+/g," ").trim().slice(0,Fo);g&&g!==t.title&&o?.({title:g})},C=()=>{$e(!1),Le(t.title||"")},P=g=>{if(g.button!==0||g.isPrimary===!1)return;let M=g.target;if(!(M&&typeof M.closest=="function"&&M.closest('[data-hud-no-drag="true"]'))&&!Z.current){Z.current={pointerId:g.pointerId,x:g.clientX,y:g.clientY,origin:se,moved:!1,target:g.target};try{Q.current&&Q.current.setPointerCapture(g.pointerId)}catch{}De()}},U=g=>{De();let M=Z.current;if(!M||M.pointerId!==g.pointerId)return;let D=g.clientX-M.x,B=g.clientY-M.y;if(!M.moved){if(D*D+B*B<ir)return;M.moved=!0,I(!0)}let ce=qo({x:M.origin.x+D,y:M.origin.y+B},i,R,be,ie);ae.current=ce,!te.current&&(te.current=requestAnimationFrame(()=>{te.current=0,ae.current&&ke(ae.current)}))},Se=()=>{Z.current=null,ae.current=null,ke(null),I(!1),te.current&&(cancelAnimationFrame(te.current),te.current=0)},V=g=>{let M=Z.current;if(!M||g&&M.pointerId!==g.pointerId)return;Z.current=null,I(!1),te.current&&(cancelAnimationFrame(te.current),te.current=0);let D=M.moved?ae.current||M.origin:null;ae.current=null,ke(null);try{Q.current&&Q.current.hasPointerCapture&&Q.current.hasPointerCapture(M.pointerId)&&Q.current.releasePointerCapture(M.pointerId)}catch{}if(M.moved){D&&o?.({position:{x:D.x,y:D.y}});return}let B=M.target,ce=B&&typeof B.closest=="function"?B.closest("[data-hud-action]"):null,Ae=ce?ce.getAttribute("data-hud-action"):"";Ae==="expand"?o?.({collapsed:!1}):Ae==="title"?ct():Ae==="open"&&a?.()};if(n)return null;let le=ne.length>0?ne[0]:null,xe=le&&Ie.get(le.id)||null,Ve=xe&&typeof xe.pct=="number"?xe.pct:null,Pe=xe?oe(Ve):"flat",Rt=xe?J(Ve):u&&!h?"…":"—",va=d&&typeof d.updatedAt=="number"?Ro(d.updatedAt):u?e("hud.waiting"):"—",wa=R?(0,m.createElement)("div",{key:"chip",className:"of-hud-chip-row",role:"button",tabIndex:0,"data-hud-action":"expand","aria-label":e("hud.collapsedHint"),title:e("hud.expand"),onKeyDown:g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),o?.({collapsed:!1}))}},(0,m.createElement)("span",{className:"of-hud-pill","data-tone":Pe,title:le?le.fallbackName+" "+Rt:e("hud.waiting")},Rt),(0,m.createElement)("span",{className:"of-hud-mascot"},(0,m.createElement)(ye,{size:22}))):null,ka=W?(0,m.createElement)("input",{key:"title-input",className:"of-hud-title-input",ref:Ke,value:st,maxLength:Fo,"data-hud-no-drag":"true","aria-label":e("hud.titleLabel"),onChange:g=>Le(g.target.value),onBlur:c,onKeyDown:g=>{g.key==="Enter"?(g.preventDefault(),c()):g.key==="Escape"&&(g.preventDefault(),g.stopPropagation(),C())}}):(0,m.createElement)("div",{key:"title",className:"of-hud-title","data-hud-action":"title",role:"button",tabIndex:0,title:e("hud.titleLabel"),onKeyDown:g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),ct())}},t.title||e("hud.title")),Na=(0,m.createElement)("div",{className:"of-hud-head"},(0,m.createElement)("span",{className:"of-hud-face"},(0,m.createElement)(ye,{size:15})),ka,(0,m.createElement)("div",{className:"of-hud-actions"},typeof s=="function"?(0,m.createElement)("button",{type:"button",className:"of-hud-ibtn of-hud-panic-btn","data-hud-no-drag":"true",title:e("hud.panicNow"),"aria-label":e("hud.panicNow"),onClick:()=>s()},(0,m.createElement)(Kt,{name:"eye"})):null,(0,m.createElement)("button",{type:"button",className:"of-hud-ibtn","data-hud-no-drag":"true",title:e("hud.collapse"),"aria-label":e("hud.collapse"),onClick:()=>o?.({collapsed:!0})},(0,m.createElement)(Kt,{name:"collapse"})),(0,m.createElement)("button",{type:"button",className:"of-hud-ibtn","data-hud-no-drag":"true",title:e("hud.settings"),"aria-label":e("hud.settings"),onClick:()=>r?.()},(0,m.createElement)(Kt,{name:"gear"})),(0,m.createElement)("button",{type:"button",className:"of-hud-ibtn","data-hud-no-drag":"true","data-danger":"true",title:e("hud.close"),"aria-label":e("hud.close"),onClick:()=>o?.({inline:!1})},(0,m.createElement)($,{name:"close",size:13})))),Sa=(0,m.createElement)("div",{className:"of-hud-rows"},ne.length===0?(0,m.createElement)("div",{className:"of-hud-row",style:{cursor:"default"}},(0,m.createElement)("span",{className:"of-hud-row-name"},e("empty"))):ne.map(g=>(0,m.createElement)(fr,{key:g.id,fallbackName:g.fallbackName,quote:Ie.get(g.id)||null,showSpark:t.showSpark!==!1,onOpen:a}))),Aa=h?(0,m.createElement)("button",{type:"button",className:"of-hud-foot-note","data-error":"true","data-hud-no-drag":"true",title:h,onClick:()=>{He.current&&He.current()}},e("hud.error")):(0,m.createElement)("span",{className:"of-hud-foot-note",title:e("hud.disclaimer")},e("hud.disclaimer")),Ca=(0,m.createElement)("div",{className:"of-hud-foot"},(0,m.createElement)("span",{className:"of-hud-foot-time",title:e("hud.updated")},va),(0,m.createElement)("span",{className:"of-hud-foot-sep","aria-hidden":!0},"·"),Aa,(0,m.createElement)("button",{type:"button",className:"of-hud-ibtn of-hud-foot-btn","data-hud-no-drag":"true",title:e("hud.openDashboard"),"aria-label":e("hud.openDashboard"),onClick:()=>a?.()},(0,m.createElement)($,{name:"external",size:12}))),Ea=R?null:(0,m.createElement)("div",{key:"card",className:"of-hud-card",ref:Ge,role:"region","aria-label":t.title||e("hud.title")},Na,Sa,Ca);return(0,m.createElement)("div",{ref:Q,className:"of-hud",role:"group","aria-label":R?e("hud.collapsedHint"):t.title||e("hud.title"),"data-collapsed":R?"true":"false","data-direction":Ot,"data-reduced":f?"true":"false","data-idle":N?"true":"false","data-dragging":z?"true":"false","data-size":Xe,"data-spark":t.showSpark!==!1?"true":"false",style:{left:Ye+"px",top:Re+"px",width:(R?Be:be)+"px",height:(R?Te:ie)+"px",opacity:It,"--of-hud-w":be+"px"},onPointerDown:P,onPointerMove:U,onPointerUp:V,onPointerCancel:Se,onLostPointerCapture:Se,onPointerEnter:()=>{A(!0),De()},onPointerLeave:()=>A(!1)},wa,Ea)}var l=require("react");var Xt=18,Yt=[0,1e4,3e4,6e4],pr=[["s","hud.sizeS"],["m","hud.sizeM"],["l","hud.sizeL"]];function et({checked:e,label:t,disabled:o,onChange:r,autoFocus:a}){return(0,l.createElement)("button",{type:"button",className:"of-hset-switch",role:"switch","aria-checked":e?"true":"false","aria-label":t,title:t,disabled:!!o,"data-autofocus":a?"true":void 0,onClick:()=>r(!e)})}function Go({t:e,config:t,onChange:o,status:r,onRefreshStatus:a,onClose:n,onPanicNow:s}){let[i,f]=(0,l.useState)(!1),[d,x]=(0,l.useState)(!1),[u,k]=(0,l.useState)(t.title||""),[h,p]=(0,l.useState)(""),[S,A]=(0,l.useState)([]),[N,b]=(0,l.useState)(!1),z=(0,l.useRef)(null),I=(0,l.useRef)(!1),Y=(0,l.useRef)(!1),ke=e("meta.direction")==="intl"?"intl":"cn",W=(0,l.useCallback)(()=>{typeof a=="function"&&a()},[a]);(0,l.useEffect)(()=>{if(!d)return;let c=setTimeout(W,700),C=setTimeout(W,2200),P=setTimeout(()=>x(!1),2600);return()=>{clearTimeout(c),clearTimeout(C),clearTimeout(P)}},[d,W]),(0,l.useEffect)(()=>{I.current||k(typeof t.title=="string"?t.title:"")},[t.title]),(0,l.useEffect)(()=>{let c=h.trim();if(c===""){A([]),b(!1);return}let C=new AbortController;b(!0);let P=setTimeout(()=>{co(c,C.signal).then(U=>{C.signal.aborted||(A(Array.isArray(U&&U.results)?U.results.slice(0,8):[]),b(!1))},U=>{C.signal.aborted||U&&U.name==="AbortError"||(A([]),b(!1))})},250);return()=>{clearTimeout(P),C.abort()}},[h]),(0,l.useEffect)(()=>{let c=z.current,C=typeof document<"u"?document.activeElement:null,P=()=>c?Array.from(c.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(V=>V.offsetParent!==null):[],U=c?c.querySelector('[data-autofocus="true"]')||P()[0]:null;if(U&&typeof U.focus=="function")try{U.focus()}catch{}let Se=V=>{if(V.key==="Escape"){let Pe=V.target;if(Pe&&Pe.tagName==="INPUT"&&(Pe.type==="text"||Pe.type==="search"))return;V.preventDefault(),V.stopPropagation(),n?.();return}if(V.key!=="Tab"||!c)return;let le=P();if(le.length===0)return;let xe=le[0],Ve=le[le.length-1];V.shiftKey&&document.activeElement===xe?(V.preventDefault(),Ve.focus()):!V.shiftKey&&document.activeElement===Ve&&(V.preventDefault(),xe.focus())};return document.addEventListener("keydown",Se,!0),()=>{if(document.removeEventListener("keydown",Se,!0),C&&typeof C.focus=="function")try{C.focus()}catch{}}},[n]);let $e=()=>{if(I.current=!1,Y.current){Y.current=!1,k(t.title||"");return}let c=u.replace(/\s+/g," ").trim().slice(0,Xt);c&&c!==t.title?o?.({title:c}):k(t.title||"")},st=c=>{c.key==="Enter"?(c.preventDefault(),c.currentTarget.blur()):c.key==="Escape"&&(c.preventDefault(),c.stopPropagation(),Y.current=!0,c.currentTarget.blur())},Le=c=>{o?.({desktop:c}),x(!0)},Tt=()=>{i||(f(!0),ze({action:"recenter"}).then(()=>{f(!1),W()},()=>f(!1)))},q=Array.isArray(t.symbols)?t.symbols:[],Q=t.catalog!==null&&typeof t.catalog=="object"?t.catalog:{},Ge=q.filter(c=>$t(c)),Ke=q.length>=6,Z=t.panicEnabled!==!1,ae=typeof t.panicShortcut=="string"?t.panicShortcut:"",te=So(ae),K=c=>{if(q.includes(c)){if(q.length<=1)return;let C=q.filter(U=>U!==c);if(!$t(c)){o?.({symbols:C});return}let P={...Q};delete P[c],o?.({symbols:C,catalog:P});return}q.length>=6||o?.({symbols:[...q,c]})},ge=c=>{if(c&&typeof c.id=="string"&&c.id.startsWith("em:"))return c.id;let C=c&&typeof c.secid=="string"?c.secid:"";return C?"em:"+C:""},He=c=>{let C=ge(c);if(!C||q.includes(C)||q.length>=6)return;let P=C.slice(3),U=((c&&typeof c.name=="string"?c.name:"")||P).trim().slice(0,24),Se={...Q,[C]:{name:U,secid:P,code:c&&typeof c.code=="string"&&c.code!==""?c.code:P.slice(P.indexOf(".")+1),market:c&&typeof c.market=="string"?c.market:"",kind:c&&typeof c.kind=="string"&&c.kind!==""?c.kind:"stock"}};o?.({symbols:[...q,C],catalog:Se})},Ot=c=>{q.length<=1||K(c)},R=r??null,Xe=R?R.available!==!1:null,be=R?R.running===!0:!1,ne=R&&R.reason?String(R.reason):"",Ne=e("hud.waiting"),Ie="muted";R&&(R.available===!1?(Ne=e("hud.desktopUnavailable"),Ie="warn"):R.running===!0?(Ne=e("hud.desktopOn"),Ie="ok"):Ne=e("hud.desktopOff"));let ie=typeof t.idleAfterMs=="number"?t.idleAfterMs:0,lt=Yt.includes(ie)?Yt.slice():[...Yt,ie];lt.sort((c,C)=>c-C);let se=typeof t.opacity=="number"?t.opacity:85,Ye=typeof t.idleOpacity=="number"?t.idleOpacity:35,[Re,De]=(0,l.useState)(()=>({opacity:se,idleOpacity:Ye}));(0,l.useEffect)(()=>{De({opacity:se,idleOpacity:Ye})},[se,Ye]);let Lt=c=>C=>De(P=>({...P,[c]:Number(C.target.value)})),Qe=c=>C=>o?.({[c]:Number(C.target.value)}),Ht=c=>({onChange:Lt(c),onPointerUp:Qe(c),onKeyUp:Qe(c),onBlur:Qe(c)}),It=t.size==="s"||t.size==="l"?t.size:"m",ct=t.showSpark!==!1;return(0,l.createElement)("div",{className:"of-hset-backdrop","data-direction":ke,onPointerDown:c=>{c.target===c.currentTarget&&n?.()}},(0,l.createElement)("section",{className:"of-hset",ref:z,role:"dialog","aria-modal":"true","aria-labelledby":"of-hset-title",tabIndex:-1},(0,l.createElement)("header",{className:"of-hset-head"},(0,l.createElement)("span",{className:"of-hset-mark"},(0,l.createElement)(ye,{size:18})),(0,l.createElement)("div",{className:"of-hset-titles"},(0,l.createElement)("h2",{className:"of-hset-title",id:"of-hset-title"},e("hud.title")),(0,l.createElement)("div",{className:"of-hset-sub"},e("hud.saved"))),(0,l.createElement)("button",{type:"button",className:"of-icon-btn of-hset-close",title:e("hud.close"),"aria-label":e("hud.close"),onClick:()=>n?.()},(0,l.createElement)($,{name:"close",size:14}))),(0,l.createElement)("div",{className:"of-hset-body"},(0,l.createElement)("section",{className:"of-hset-section"},(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.inline")),(0,l.createElement)(et,{checked:t.inline===!0,label:e("hud.inline"),autoFocus:!0,onChange:c=>o?.({inline:c})})),(0,l.createElement)("div",{className:"of-hset-hint"},e("hud.inlineHint"))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.desktop")),(0,l.createElement)(et,{checked:t.desktop===!0,label:e("hud.desktop"),disabled:Xe===!1,onChange:Le})),(0,l.createElement)("div",{className:"of-hset-hint"},e("hud.desktopHint")),(0,l.createElement)("div",{className:"of-hset-status","data-tone":Ie},(0,l.createElement)("span",{className:"of-hset-dot","aria-hidden":!0}),(0,l.createElement)("span",{className:"of-hset-status-text"},Ne),ne&&!be?(0,l.createElement)("span",{className:"of-hset-status-reason",title:ne},ne):null,(0,l.createElement)("button",{type:"button",className:"of-btn",style:{flex:"none",marginLeft:"auto",padding:"4px 9px",fontSize:10.5},title:e("hud.recenter"),disabled:!be||i,onClick:Tt},e("hud.recenter"))))),(0,l.createElement)("section",{className:"of-hset-section"},(0,l.createElement)("div",{className:"of-hset-section-head"},(0,l.createElement)("span",{className:"of-hset-section-label"},e("hud.symbols")),(0,l.createElement)("span",{className:"of-hset-section-meta",title:e("hud.selectedCount")},q.length+"/6")),(0,l.createElement)("div",{className:"of-hset-symbols",role:"group","aria-label":e("hud.symbols")},ht.map(c=>{let C=q.includes(c.id);return(0,l.createElement)("button",{key:c.id,type:"button",className:"of-hset-symbol","aria-pressed":C?"true":"false",title:c.name,onClick:()=>K(c.id)},(0,l.createElement)("span",{className:"of-hset-check","aria-hidden":!0},C?"✓":""),(0,l.createElement)("span",{className:"of-hset-symbol-name"},c.name))})),(0,l.createElement)("div",{className:"of-hset-hint"},e("hud.symbolsHint")),(0,l.createElement)("div",{className:"of-hset-search"},(0,l.createElement)("input",{type:"search",className:"of-hset-input of-hset-search-input",value:h,placeholder:e("hud.searchPlaceholder"),"aria-label":e("hud.searchPlaceholder"),onChange:c=>p(c.target.value),onKeyDown:c=>{c.key==="Escape"&&(c.preventDefault(),c.stopPropagation(),p(""))}}),h.trim()===""?null:(0,l.createElement)("div",{className:"of-hset-results",role:"list"},N?(0,l.createElement)("div",{className:"of-hset-result-empty"},e("hud.searching")):S.length===0?(0,l.createElement)("div",{className:"of-hset-result-empty"},e("hud.searchEmpty")):S.map(c=>{let C=ge(c),P=q.includes(C),U=P||Ke;return(0,l.createElement)("div",{key:C||c.code||c.name,className:"of-hset-result","data-selected":P?"true":"false",role:"listitem"},(0,l.createElement)("div",{className:"of-hset-result-main"},(0,l.createElement)("span",{className:"of-hset-result-name"},c.name||C),(0,l.createElement)("div",{className:"of-hset-result-meta"},c.code?(0,l.createElement)("span",{className:"of-hset-result-code"},String(c.code)):null,c.market?(0,l.createElement)("span",{className:"of-hset-result-market",title:e("hud.market")},String(c.market)):null)),(0,l.createElement)("button",{type:"button",className:"of-btn of-hset-result-add",disabled:U,onClick:()=>He(c)},e(P?"hud.selectedCount":"hud.add")))})),(0,l.createElement)("div",{className:"of-hset-hint"},e("hud.searchHint"))),Ke?(0,l.createElement)("div",{className:"of-hset-hint of-hset-warn"},e("hud.customLimit")):null,Ge.length>0?(0,l.createElement)("div",{className:"of-hset-chips"},(0,l.createElement)("span",{className:"of-hset-chips-head"},e("hud.custom")),Ge.map(c=>(0,l.createElement)("span",{key:c,className:"of-hset-chip",title:Q[c]&&Q[c].code?String(Q[c].code):c},(0,l.createElement)("span",{className:"of-hset-chip-name"},bt(c,t)),(0,l.createElement)("button",{type:"button",className:"of-hset-chip-remove",title:e("hud.remove"),"aria-label":e("hud.remove"),disabled:q.length<=1,onClick:()=>Ot(c)},(0,l.createElement)($,{name:"close",size:10}))))):null),(0,l.createElement)("section",{className:"of-hset-section"},(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.titleLabel")),(0,l.createElement)("span",{className:"of-hset-count"},u.length+"/"+Xt)),(0,l.createElement)("input",{type:"text",className:"of-hset-input",value:u,maxLength:Xt,placeholder:e("hud.titleLabel"),"aria-label":e("hud.titleLabel"),onFocus:()=>{I.current=!0},onBlur:$e,onChange:c=>k(c.target.value),onKeyDown:st})),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.opacity")),(0,l.createElement)("input",{type:"range",className:"of-hset-range",min:20,max:100,step:1,value:Re.opacity,"aria-label":e("hud.opacity"),...Ht("opacity")}),(0,l.createElement)("span",{className:"of-hset-value"},Re.opacity+"%"))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.idleOpacity")),(0,l.createElement)("input",{type:"range",className:"of-hset-range",min:20,max:100,step:1,value:Re.idleOpacity,disabled:ie===0,"aria-label":e("hud.idleOpacity"),...Ht("idleOpacity")}),(0,l.createElement)("span",{className:"of-hset-value"},Re.idleOpacity+"%"))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.idleAfter")),(0,l.createElement)("select",{className:"of-hset-select",value:String(ie),"aria-label":e("hud.idleAfter"),onChange:c=>o?.({idleAfterMs:Number(c.target.value)})},lt.map(c=>(0,l.createElement)("option",{key:c,value:String(c)},c===0?e("hud.idleOff"):Math.round(c/1e3)+"s"))))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.hoverFull")),(0,l.createElement)(et,{checked:t.hoverFull!==!1,label:e("hud.hoverFull"),onChange:c=>o?.({hoverFull:c})}))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.size")),(0,l.createElement)("div",{className:"of-hset-seg",role:"group","aria-label":e("hud.size")},pr.map(([c,C])=>(0,l.createElement)("button",{key:c,type:"button",className:"of-hset-seg-btn","aria-pressed":It===c?"true":"false",onClick:()=>o?.({size:c})},e(C)))))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.spark")),(0,l.createElement)(et,{checked:ct,label:e("hud.spark"),onChange:c=>o?.({showSpark:c})})))),(0,l.createElement)("section",{className:"of-hset-section of-hset-panic"},(0,l.createElement)("div",{className:"of-hset-section-head"},(0,l.createElement)("span",{className:"of-hset-section-label"},e("hud.panic"))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.panic")),(0,l.createElement)(et,{checked:Z,label:e("hud.panic"),onChange:c=>o?.({panicEnabled:c})})),(0,l.createElement)("div",{className:"of-hset-hint"},e("hud.panicHint"))),(0,l.createElement)("div",{className:"of-hset-field"},(0,l.createElement)("div",{className:"of-hset-line"},(0,l.createElement)("span",{className:"of-hset-label"},e("hud.panicShortcut")),(0,l.createElement)("select",{className:"of-hset-select",value:Z?ae:"",disabled:!Z,"aria-label":e("hud.panicShortcut"),onChange:c=>{let C=c.target.value;o?.(C===""?{panicEnabled:!1}:{panicEnabled:!0,panicShortcut:C})}},(0,l.createElement)("option",{value:""},e("hud.panicOff")),mt.map(c=>(0,l.createElement)("option",{key:c.id,value:c.accelerator},c.label)))),(0,l.createElement)("div",{className:"of-hset-combo","data-off":Z?"false":"true"},Z?te||ae:e("hud.panicOff")),(0,l.createElement)("div",{className:"of-hset-actions"},(0,l.createElement)("button",{type:"button",className:"of-btn",disabled:typeof s!="function",onClick:()=>{typeof s=="function"&&s()}},e("hud.panicNow"))))),(0,l.createElement)("section",{className:"of-hset-section"},(0,l.createElement)("div",{className:"of-hset-actions"},(0,l.createElement)("button",{type:"button",className:"of-btn",onClick:()=>o?.({position:{x:0,y:0}})},e("hud.resetPosition")),(0,l.createElement)("span",{className:"of-hset-hint"},e("hud.positionHint")))))))}var tt=require("react");function Ko({items:e,value:t,onChange:o,ariaLabel:r}){return(0,tt.createElement)("div",{className:"of-tabs",role:"tablist","aria-label":r},e.map(a=>(0,tt.createElement)("button",{key:a.id,type:"button",role:"tab",className:"of-tab","aria-selected":a.id===t,"aria-controls":"of-panel-"+a.id,onClick:()=>o(a.id)},a.label)))}function Xo({label:e,busy:t,onClick:o}){return(0,tt.createElement)("button",{type:"button",className:"of-icon-btn","data-busy":t?"true":"false",title:e,"aria-label":e,onClick:o},(0,tt.createElement)($,{name:"refresh",size:15}))}var v=require("react");var ee=require("react");function G({height:e=12,width:t="100%",radius:o,style:r,className:a}){return(0,ee.createElement)("div",{className:a?"of-skeleton "+a:"of-skeleton",style:{height:e,width:t,borderRadius:o,...r},"aria-hidden":!0})}function Nt({lines:e=3,gap:t=8}){return(0,ee.createElement)("div",{style:{display:"flex",flexDirection:"column",gap:t},"aria-hidden":!0},Array.from({length:e},(o,r)=>(0,ee.createElement)(G,{key:r,height:10,width:r===e-1?"62%":"100%",radius:5})))}function pe({title:e,body:t,icon:o}){return(0,ee.createElement)("div",{className:"of-empty"},o?(0,ee.createElement)("div",{className:"of-empty-icon"},o):null,e?(0,ee.createElement)("div",{className:"of-error-title"},e):null,t?(0,ee.createElement)("div",null,t):null)}function ue({title:e,body:t,retryLabel:o,onRetry:r}){return(0,ee.createElement)("div",{className:"of-error",role:"alert"},(0,ee.createElement)("div",{className:"of-error-title"},e),t?(0,ee.createElement)("div",null,t):null,r&&o?(0,ee.createElement)("button",{type:"button",className:"of-btn",onClick:r,style:{marginTop:4}},o):null)}var re=require("react");function Yo({quote:e,index:t=0}){let o=oe(e.pct),r=vt(e.price,460),a=Number.isFinite(e.digits)?e.digits:2;return(0,re.createElement)("div",{className:"of-quote of-stagger",style:{"--i":t}},(0,re.createElement)("div",{className:"of-quote-name"},(0,re.createElement)("span",{style:{overflow:"hidden",textOverflow:"ellipsis"}},e.name),(0,re.createElement)("span",{className:"of-quote-dot "+(o==="up"?"of-up":o==="down"?"of-down":"of-flat"),style:{background:"currentColor"}})),(0,re.createElement)("div",{className:"of-quote-price"},je(r,a)),(0,re.createElement)("div",{className:"of-quote-change of-"+o},(0,re.createElement)("span",null,J(e.pct)),Number.isFinite(e.change)?(0,re.createElement)("span",{style:{opacity:.62}},Io(e.change,a)):null),(0,re.createElement)(kt,{values:e.spark,up:o==="up"}))}var H=require("react");function Qo(e,t){let o=[];if(!Array.isArray(e)||e.length===0)return o;let r=Math.max(0,t.width),a=Math.max(0,t.height);if(!r||!a)return o;let n=e.filter(h=>h&&Number.isFinite(h.weight)&&h.weight>0).slice().sort((h,p)=>p.weight-h.weight).map(h=>({item:h,area:h.weight})),s=n.reduce((h,p)=>h+p.area,0);if(!s)return o;let i=r*a/s;for(let h of n)h.area*=i;let f=t.x,d=t.y,x=r,u=a,k=0;for(;k<n.length;){let h=Math.min(x,u);if(h<=0)break;let p=[],S=1/0;for(;k<n.length;){let b=p.concat(n[k]),z=ur(b,h);if(z>S&&p.length>0)break;S=z,p.push(n[k]),k+=1}if(p.length===0)break;let A=p.reduce((b,z)=>b+z.area,0),N=h>0?A/h:0;if(x>=u){let b=d;for(let z of p){let I=A>0?z.area/A*u:0;o.push({item:z.item,x:f,y:b,w:N,h:I}),b+=I}f+=N,x-=N}else{let b=f;for(let z of p){let I=A>0?z.area/A*x:0;o.push({item:z.item,x:b,y:d,w:I,h:N}),b+=I}d+=N,u-=N}}return o}function ur(e,t){if(t<=0)return 1/0;let o=0,r=0,a=1/0;for(let i of e)o+=i.area,i.area>r&&(r=i.area),i.area<a&&(a=i.area);if(o<=0||a===1/0||a<=0)return 1/0;let n=t*t,s=o*o;return Math.max(n*r/s,s/(n*a))}var Vo=6;function mr(e,t){let o=Math.max(56,Math.min(t.width-56,e.x)),r=e.y<62;return{left:o,top:r?e.y+(e.height||0)+6:Math.max(58,e.y-2),transform:r?"translate(-50%, 0)":"translate(-50%, -108%)"}}function hr(e){let t=e>=0?"var(--of-up)":"var(--of-down)",o=Math.min(Math.abs(e),Vo)/Vo,r=Math.round(9+o*61);return`color-mix(in srgb, ${t} ${r}%, var(--of-surface-2))`}function Jo({boards:e,activeCode:t,onSelect:o,t:r}){let a=(0,H.useRef)(null),[n,s]=(0,H.useState)({width:0,height:0}),[i,f]=(0,H.useState)(null);(0,H.useEffect)(()=>{let x=a.current;if(!x||typeof ResizeObserver>"u")return;let u=new ResizeObserver(k=>{let h=k[0]&&k[0].contentRect;h&&s({width:h.width,height:h.height})});return u.observe(x),s({width:x.clientWidth,height:x.clientHeight}),()=>u.disconnect()},[]);let d=(0,H.useMemo)(()=>{if(!Array.isArray(e)||n.width<20||n.height<20)return[];let x=e.map(u=>({board:u,weight:Number.isFinite(u.marketCap)&&u.marketCap>0?u.marketCap:1}));return Qo(x,{x:0,y:0,width:n.width,height:n.height})},[e,n.width,n.height]);return(0,H.createElement)("div",{className:"of-heat",ref:a,role:"group","aria-label":r("market.heatmap"),onMouseLeave:()=>f(null)},d.map(({item:x,x:u,y:k,w:h,h:p})=>{let S=x.board,A=oe(S.pct),N=Math.abs(S.pct)<1.2,b=p>=32&&h>=42,z=h>=30&&p>=16;return(0,H.createElement)("button",{key:S.code,type:"button",className:"of-heat-cell","data-pale":N?"true":"false","data-active":S.code===t?"true":"false",style:{left:u+.75,top:k+.75,width:Math.max(0,h-1.5),height:Math.max(0,p-1.5),background:hr(S.pct)},title:S.name+" "+J(S.pct),onMouseEnter:()=>f({board:S,x:u+h/2,y:k,height:p}),onFocus:()=>f({board:S,x:u+h/2,y:k,height:p}),onBlur:()=>f(null),onClick:()=>o&&o(S)},z?(0,H.createElement)("div",{className:"of-heat-label"},S.name):null,b?(0,H.createElement)("div",{className:"of-heat-pct of-"+A},J(S.pct)):null)}),i?(0,H.createElement)("div",{className:"of-heat-tip",style:mr(i,n)},(0,H.createElement)("div",{className:"of-heat-tip-name"},i.board.name),(0,H.createElement)("div",{className:"of-heat-tip-row"},(0,H.createElement)("span",null,r("market.tooltipChange")),(0,H.createElement)("b",{className:"of-"+oe(i.board.pct)},J(i.board.pct))),(0,H.createElement)("div",{className:"of-heat-tip-row"},(0,H.createElement)("span",null,r("market.tooltipPrice")),(0,H.createElement)("span",null,je(i.board.price,2))),(0,H.createElement)("div",{className:"of-heat-tip-row"},(0,H.createElement)("span",null,r("market.tooltipCap")),(0,H.createElement)("span",null,yt(i.board.marketCap)))):null)}var E=require("react");function Wo({movers:e,t}){let[o,r]=(0,E.useState)("up"),a=Array.isArray(e&&e[o])?e[o]:[],n=[{id:"up",label:t("market.gainers")},{id:"down",label:t("market.losers")},{id:"active",label:t("market.active")}];return(0,E.createElement)("div",null,(0,E.createElement)("div",{className:"of-section-head",style:{padding:"12px 14px 0"}},(0,E.createElement)("h3",{className:"of-section-title"},t("market.movers"))),(0,E.createElement)("div",{className:"of-movers-tabs",role:"tablist"},n.map(s=>(0,E.createElement)("button",{key:s.id,type:"button",role:"tab",className:"of-movers-tab","aria-selected":s.id===o,onClick:()=>r(s.id)},s.label))),a.length===0?(0,E.createElement)("div",{className:"of-empty",style:{padding:"14px 18px"}},t("empty")):(0,E.createElement)("div",{className:"of-movers",role:"tabpanel"},a.map((s,i)=>(0,E.createElement)("div",{key:s.code||i,className:"of-mover"},(0,E.createElement)("span",{className:"of-mover-rank"},i+1),(0,E.createElement)("span",{className:"of-mover-name"},s.name,(0,E.createElement)("span",{className:"of-mover-code"},s.code)),(0,E.createElement)("span",{className:"of-mover-pct of-"+oe(s.pct)},o==="active"&&Number.isFinite(s.amount)?yt(s.amount):J(s.pct))))))}function Zo({news:e,t,limit:o=8}){let r=Array.isArray(e)?e.slice(0,o):[];return(0,E.createElement)("div",null,(0,E.createElement)("div",{className:"of-section-head",style:{padding:"12px 14px 0"}},(0,E.createElement)("h3",{className:"of-section-title"},t("market.news")),(0,E.createElement)("span",{className:"of-section-hint"},t("market.newsHint"))),r.length===0?(0,E.createElement)("div",{className:"of-empty",style:{padding:"14px 18px"}},t("empty")):(0,E.createElement)("div",{className:"of-news"},r.map(a=>(0,E.createElement)("a",{key:a.id,className:"of-news-item",href:a.url,target:"_blank",rel:"noreferrer noopener"},(0,E.createElement)("div",{className:"of-news-time"},a.time||""),(0,E.createElement)("div",{className:"of-news-title"},a.title)))))}function gr({stock:e}){return(0,E.createElement)("div",{className:"of-stock"},(0,E.createElement)("span",{className:"of-stock-name"},e.name),(0,E.createElement)("span",{className:"of-stock-code"},e.code),(0,E.createElement)("span",{className:"of-stock-pct of-"+oe(e.pct)},J(e.pct)))}function ea({sector:e,loading:t,onClose:o,t:r}){let a=!!e,n=e&&Array.isArray(e.stocks)?e.stocks:[];return(0,E.createElement)("div",{className:"of-sector","data-open":a?"true":"false"},(0,E.createElement)("div",{className:"of-sector-inner"},(0,E.createElement)("div",{className:"of-sector-pad"},(0,E.createElement)("div",{className:"of-sector-head"},(0,E.createElement)("span",{className:"of-sector-name"},e?e.name:""),e?(0,E.createElement)("span",{className:"of-chip","data-tone":"brand"},J(e.pct)):null,(0,E.createElement)("span",{style:{flex:1}}),(0,E.createElement)("button",{type:"button",className:"of-icon-btn",style:{width:26,height:26},onClick:o,"aria-label":r("market.closeSector")},(0,E.createElement)("span",{style:{fontSize:14,lineHeight:1}},"×"))),t?(0,E.createElement)("div",{className:"of-skeleton",style:{height:54}}):n.length===0?(0,E.createElement)("div",{className:"of-empty",style:{padding:"10px 0"}},r("market.sectorEmpty")):(0,E.createElement)("div",{className:"of-sector-stocks"},n.map(s=>(0,E.createElement)(gr,{key:s.code,stock:s}))),e?(0,E.createElement)("div",{className:"of-meta",style:{marginTop:8}},r("market.sectorHint")):null)))}function ta({t:e,snapshot:t,loading:o,error:r,onRetry:a}){let[n,s]=(0,v.useState)(null),[i,f]=(0,v.useState)(!1),d=(0,v.useRef)(null),x=(0,v.useCallback)(()=>{d.current&&d.current.abort(),d.current=null,s(null),f(!1)},[]),u=(0,v.useCallback)(A=>{if(!A)return;d.current&&d.current.abort();let N=new AbortController;d.current=N,s({code:A.code,name:A.name,pct:A.pct,stocks:[]}),f(!0),io(A.code,N.signal).then(b=>{N.signal.aborted||(s({code:A.code,name:b.name||A.name,pct:typeof b.pct=="number"?b.pct:A.pct,stocks:Array.isArray(b.stocks)?b.stocks:[]}),f(!1))},b=>{N.signal.aborted||(s({code:A.code,name:A.name,pct:A.pct,stocks:[]}),f(!1))})},[]);if((0,v.useEffect)(()=>()=>{d.current&&d.current.abort()},[]),!t&&o)return(0,v.createElement)(br,{t:e});if(!t&&r)return(0,v.createElement)(ue,{title:e("error.title"),body:r,retryLabel:e("retry"),onRetry:a});if(!t)return(0,v.createElement)(pe,{title:e("empty")});let k=Array.isArray(t.quotes)?t.quotes:[],h=Array.isArray(t.boards)?t.boards:[],p=t.boardBreadth||null,S=Array.isArray(t.parts)?t.parts.filter(A=>!A.ok):[];return(0,v.createElement)("div",{className:"of-dashboard"},S.length>0||t.stale?(0,v.createElement)("div",{className:"of-foot",style:{margin:"0 0 12px",paddingTop:0,borderTop:0}},(0,v.createElement)("span",{className:"of-badge"},e("partial")),(0,v.createElement)("span",null,S.map(A=>A.id).join(" · ")+(t.stale?" · cached":""))):null,(0,v.createElement)("section",{className:"of-section"},(0,v.createElement)("div",{className:"of-section-head"},(0,v.createElement)("h3",{className:"of-section-title"},e("market.indices")),(0,v.createElement)("span",{className:"of-section-hint"},e("market.indicesHint"))),k.length===0?(0,v.createElement)(pe,{title:e("empty"),body:e("market.partialBody")}):(0,v.createElement)("div",{className:"of-grid of-grid-quotes"},k.map((A,N)=>(0,v.createElement)(Yo,{key:A.id,quote:A,index:N})))),(0,v.createElement)("section",{className:"of-section"},(0,v.createElement)("div",{className:"of-grid of-grid-main"},(0,v.createElement)("div",{className:"of-card of-heat-card of-fade-in"},(0,v.createElement)("div",{className:"of-heat-top"},(0,v.createElement)("h3",{className:"of-section-title"},e("market.heatmap")),p?(0,v.createElement)("div",{className:"of-heat-breadth",title:e("market.breadth")},(0,v.createElement)("span",{className:"of-up"},String(p.up||0)),(0,v.createElement)("span",{className:"of-breadth-bar","aria-hidden":!0},(0,v.createElement)("span",{className:"of-breadth-up",style:{width:Qt(p.up,p.total)+"%"}}),(0,v.createElement)("span",{className:"of-breadth-flat",style:{width:Qt(p.flat,p.total)+"%"}}),(0,v.createElement)("span",{className:"of-breadth-down",style:{width:Qt(p.down,p.total)+"%"}})),(0,v.createElement)("span",{className:"of-down"},String(p.down||0))):null),(0,v.createElement)(Jo,{boards:h,activeCode:n?n.code:null,onSelect:u,t:e}),(0,v.createElement)("div",{className:"of-heat-legend"},(0,v.createElement)("span",null,"-5%"),(0,v.createElement)("span",{className:"of-legend-ramp"}),(0,v.createElement)("span",null,"+5%"),(0,v.createElement)("span",{style:{flex:1}}),(0,v.createElement)("span",null,e("market.heatmapHint"))),(0,v.createElement)(ea,{sector:n,loading:i,onClose:x,t:e})),(0,v.createElement)("div",{className:"of-rail"},(0,v.createElement)("div",{className:"of-card of-fade-in"},(0,v.createElement)(Wo,{movers:t.movers,t:e})),(0,v.createElement)("div",{className:"of-card of-fade-in"},(0,v.createElement)(Zo,{news:t.news,t:e}))))))}function Qt(e,t){let o=Number(e)||0,r=Number(t)||0;return r?Math.round(o/r*100):0}function br({t:e}){return(0,v.createElement)("div",{"aria-label":e("loading"),"aria-busy":!0},(0,v.createElement)("div",{className:"of-grid of-grid-quotes"},Array.from({length:11},(t,o)=>(0,v.createElement)("div",{key:o,className:"of-quote"},(0,v.createElement)(G,{height:10,width:"56%"}),(0,v.createElement)(G,{height:20,width:"76%",style:{marginTop:10}}),(0,v.createElement)(G,{height:10,width:"44%",style:{marginTop:8}})))),(0,v.createElement)("div",{className:"of-grid of-grid-main",style:{marginTop:14}},(0,v.createElement)("div",{className:"of-card of-pad"},(0,v.createElement)(G,{height:400,radius:12})),(0,v.createElement)("div",{className:"of-card of-pad"},(0,v.createElement)(Nt,{lines:8}))))}var O=require("react"),xr="/dsh-openfin/lens/index.html",yr=12e3;function vr(e){let t=String(e).trim();if(t.startsWith("#")){let a=t.slice(1),n=a.length===3?a.split("").map(i=>i+i).join(""):a.slice(0,6),s=Number.parseInt(n,16);return!Number.isFinite(s)||n.length!==6?null:[s>>16&255,s>>8&255,s&255]}let o=/^rgba?\(([^)]+)\)$/i.exec(t);if(!o)return null;let r=o[1].split(/[, /]+/).filter(Boolean).slice(0,3).map(Number);return r.length!==3||r.some(a=>!Number.isFinite(a))?null:r}function Vt(){try{let e=getComputedStyle(document.documentElement),t=vr(e.getPropertyValue("--dsw-alias-bg-base"));if(t!==null){let[r,a,n]=t.map(i=>i/255);return .2126*r+.7152*a+.0722*n<.42?"nexus":"daylight"}let o=String(document.documentElement.getAttribute("data-theme")??"");if(/dark/i.test(o))return"nexus"}catch{}try{if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)return"nexus"}catch{}return"daylight"}function oa(e){return`${xr}?embed=1&theme=${e}`}function aa({t:e,active:t=!0}){let[o,r]=(0,O.useState)(()=>oa(Vt())),[a,n]=(0,O.useState)(!1),[s,i]=(0,O.useState)(!1),f=(0,O.useRef)(null),d=(0,O.useRef)(0),x=(0,O.useCallback)(()=>{clearTimeout(d.current),i(!1),d.current=setTimeout(()=>i(!0),yr)},[]),u=(0,O.useCallback)(()=>{n(!1),r(oa(Vt())),x()},[x]);(0,O.useEffect)(()=>(x(),()=>clearTimeout(d.current)),[x]),(0,O.useEffect)(()=>{let h=p=>{let S=f.current;if(!S||p.source!==S.contentWindow)return;let A=p.data;!A||A.type!=="dsh-lens-ready"||(n(!0),i(!1),clearTimeout(d.current))};return window.addEventListener("message",h),()=>window.removeEventListener("message",h)},[]),(0,O.useEffect)(()=>{if(!t)return;let h=document.documentElement,p=document.body,S=()=>{let b=f.current;if(!(!b||!b.contentWindow))try{b.contentWindow.postMessage({type:"dsh-theme",theme:Vt()},"*")}catch{}},A=new MutationObserver(S);A.observe(h,{attributes:!0,attributeFilter:["style","class","data-theme"]}),p&&A.observe(p,{attributes:!0,attributeFilter:["style","class","data-theme"]});let N=null;try{N=window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)"):null,N?.addEventListener?.("change",S)}catch{N=null}return S(),()=>{A.disconnect(),N?.removeEventListener?.("change",S)}},[t]);let k=(0,O.useCallback)(h=>{h.preventDefault();let p=f.current&&f.current.getAttribute("src")||o;window.open(p,"_blank","noopener,noreferrer")},[o]);return(0,O.createElement)("div",{className:"of-terminal"},(0,O.createElement)("div",{className:"of-terminal-bar"},(0,O.createElement)("span",{className:"of-terminal-title"},e("terminal.title")),(0,O.createElement)("span",{className:"of-terminal-hint"},e("terminal.hint")),(0,O.createElement)("span",{style:{flex:"1 1 auto"}}),(0,O.createElement)("button",{type:"button",className:"of-icon-btn",title:e("terminal.reload"),"aria-label":e("terminal.reload"),onClick:u},(0,O.createElement)("span",{style:{fontSize:13,lineHeight:1}},"⟳")),(0,O.createElement)("button",{type:"button",className:"of-icon-btn",title:e("terminal.openExternal"),"aria-label":e("terminal.openExternal"),onClick:k},(0,O.createElement)("span",{style:{fontSize:12,lineHeight:1}},"↗"))),(0,O.createElement)("iframe",{ref:f,className:"of-terminal-frame",src:o,title:e("terminal.frameTitle"),allow:"clipboard-write; fullscreen"}),a?null:(0,O.createElement)("div",{className:"of-terminal-veil","aria-live":"polite"},(0,O.createElement)("div",{className:"of-terminal-veil-card"},(0,O.createElement)("div",{className:"of-terminal-veil-title"},e("terminal.loading")),s?(0,O.createElement)("div",{className:"of-terminal-veil-hint"},e("terminal.slow")):(0,O.createElement)("div",{className:"of-terminal-veil-hint"},e("terminal.hint")))))}var _=require("react");var we=require("react");var ot=require("react");function Jt({children:e,tone:t}){return(0,ot.createElement)("span",{className:"of-chip","data-tone":t},e)}function St({children:e}){return(0,ot.createElement)("span",{className:"of-tag"},e)}function At({value:e,label:t}){let o=Math.max(1,Math.min(4,Number(e)||1));return(0,ot.createElement)("span",{className:"of-dots",title:t,"aria-label":t},[0,1,2,3].map(r=>(0,ot.createElement)("span",{key:r,className:"of-dot"+(r<o?" of-dot-on":"")})))}function ra(e){let t=e.t,o=e.article||{},r=typeof e.index=="number"?e.index:0,a=Number(o.readMinutes),n=Number(o.difficulty);return(0,we.createElement)("button",{type:"button",className:"of-acard of-stagger",style:{"--i":String(Math.min(r,6))},onClick:()=>e.onOpen(o.id)},(0,we.createElement)("span",{className:"of-acard-title"},o.title||o.id),o.dek?(0,we.createElement)("span",{className:"of-acard-dek"},o.dek):null,(0,we.createElement)("span",{className:"of-acard-meta"},o.tag?(0,we.createElement)(St,null,o.tag):null,a>0?(0,we.createElement)("span",{className:"of-meta"},t("academy.readMinutes",{n:a})):null,n>0?(0,we.createElement)(At,{value:n,label:t("academy.difficulty",{n})}):null))}var Wt=require("react");function na(e){let t=Array.isArray(e.sections)?e.sections:[],o=e.active,r=e.onSelect;return t.length===0?null:(0,Wt.createElement)("div",{className:"of-filters",role:"group","aria-label":e.label||void 0},t.map(a=>(0,Wt.createElement)("button",{key:a.id,type:"button",className:a.id===o?"of-filter of-filter-active":"of-filter","aria-pressed":a.id===o,onClick:()=>r(a.id)},a.label)))}var at=require("react");function Ct(e){let t=typeof e.value=="string"?e.value:"",o=e.placeholder||"",r=e.onChange;return(0,at.createElement)("div",{className:"of-search"},(0,at.createElement)("span",{className:"of-search-icon","aria-hidden":"true"},(0,at.createElement)($,{name:"search",size:14})),(0,at.createElement)("input",{className:"of-search-input",type:"search",value:t,placeholder:o,"aria-label":o,autoComplete:"off",autoCapitalize:"off",autoCorrect:"off",spellCheck:!1,onChange:a=>r(a.target.value),onKeyDown:a=>{a.key==="Escape"&&t&&(a.preventDefault(),r(""))}}))}var Et="all",wr=[0,1,2,3,4,5];function kr(e){let t=[e.title,e.dek,e.tag,e.sectionLabel,e.id];return Array.isArray(e.tags)&&t.push(e.tags.join(" ")),t.filter(Boolean).join(" ").toLowerCase()}function ia(e){let t=e.t,o=e.onOpenArticle,{loading:r,data:a,error:n,reload:s}=Me(N=>so(N),[]),[i,f]=(0,_.useState)(""),[d,x]=(0,_.useState)(Et),u=(0,_.useRef)(null),k=a&&Array.isArray(a.articles)?a.articles:[],h=a&&Array.isArray(a.sections)?a.sections:[],p=h.some(N=>N.id===d)?d:Et;(0,_.useEffect)(()=>{let N=u.current,b=N&&typeof N.closest=="function"?N.closest(".of-page"):null;b&&(b.scrollTop=0)},[]);let S=(0,_.useMemo)(()=>{let N=i.trim().toLowerCase();return k.filter(b=>p!==Et&&b.section!==p?!1:N?kr(b).includes(N):!0)},[k,p,i]),A=i.trim()!==""||p!==Et;return(0,_.createElement)("div",{className:"of-academy of-fade-in",ref:u},(0,_.createElement)("div",{className:"of-toolbar"},(0,_.createElement)(Ct,{value:i,onChange:f,placeholder:t("academy.search")})),h.length>0?(0,_.createElement)(na,{sections:h,active:p,onSelect:x,label:t("academy.title")}):null,r?(0,_.createElement)("div",{className:"of-cards","aria-busy":"true","aria-label":t("a11y.loading")},wr.map(N=>(0,_.createElement)(G,{key:N,height:118,radius:14}))):n?(0,_.createElement)(ue,{title:t("error.title"),body:n,retryLabel:t("retry"),onRetry:s}):S.length===0?(0,_.createElement)(pe,{title:t(A?"academy.searchEmpty":"academy.empty"),icon:(0,_.createElement)($,{name:"search",size:20})}):(0,_.createElement)("div",{className:"of-cards"},S.map((N,b)=>(0,_.createElement)(ra,{key:N.id,t,article:N,index:b,onOpen:o}))))}var w=require("react");var nt=require("react");var F=require("react"),sa=/^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/,rt=/^([ \t]*)[-*+][ \t]+(.*)$/,zt=/^([ \t]*)(\d{1,3})[.)][ \t]+(.*)$/,eo=/^[ \t]*>[ \t]?(.*)$/,la=/^[ \t]*\|/,ca=/^[ \t]*-(?:[ \t]*-){2,}[ \t]*$/,Nr=/^:?-{2,}:?$/,Sr=/^[|\s:-]+$/,Ar=/^(https?:|mailto:)/i;function Oe(e,t){let o=String(t);if(!o)return;let r=e[e.length-1];r&&r.type==="text"?r.value+=o:e.push({type:"text",value:o})}function he(e,t=0){let o=String(e??"");if(!o)return[];if(t>4)return[{type:"text",value:o}];let r=/!\[(?<imageAlt>[^\]]*)\]\((?<imageSrc>[^)\s]*)\)|\*\*(?<strong>[\s\S]+?)\*\*|\*(?<em>[^\s*\n](?:[^*\n]*[^\s*])?)\*|`(?<code>[^`\n]+)`|\[\[(?<termId>[^\]|\n]+)\|(?<termText>[^\]\n]+)\]\]|\[(?<linkText>[^\]\n]+)\]\((?<href>[^)\s]+)\)/g,a=[],n=0,s;for(;s=r.exec(o);){let i=s.groups||{};if(s.index>n&&Oe(a,o.slice(n,s.index)),n=r.lastIndex,i.imageAlt!==void 0)Oe(a,i.imageAlt);else if(i.strong!==void 0){let f=he(i.strong,t+1);f.length?a.push({type:"strong",children:f}):Oe(a,s[0])}else if(i.em!==void 0){let f=s.index>0?o[s.index-1]:"";if(/[0-9A-Za-z]/.test(f)){Oe(a,s[0]);continue}let d=he(i.em,t+1);d.length?a.push({type:"em",children:d}):Oe(a,s[0])}else if(i.code!==void 0)a.push({type:"code",value:i.code});else if(i.termId!==void 0)a.push({type:"term",id:i.termId.trim(),text:i.termText});else if(i.linkText!==void 0){let f=i.href;if(Ar.test(f)){let d=he(i.linkText,t+1);d.length&&a.push({type:"link",href:f,children:d})}else Oe(a,i.linkText)}}return n<o.length&&Oe(a,o.slice(n)),a}function Zt(e){let t=String(e).trim();t.startsWith("|")&&(t=t.slice(1)),t.endsWith("|")&&(t=t.slice(0,-1));let o=[],r="",a=!1,n=!1;for(let s=0;s<t.length;s++){let i=t[s];if(i==="\\"&&t[s+1]==="|"){r+="|",s++;continue}if(!n&&i==="`"){n=!n,r+=i;continue}if(!n&&i==="["&&t[s+1]==="["){a=!0,r+="[[",s++;continue}if(a&&i==="]"&&t[s+1]==="]"){a=!1,r+="]]",s++;continue}if(i==="|"&&!a&&!n){o.push(r.trim()),r="";continue}r+=i}return o.push(r.trim()),o}function da(e){let t=String(e).trim();if(!t.includes("|")||!t.includes("-")||!Sr.test(t))return!1;let o=Zt(t);return o.length>0&&o.every(r=>Nr.test(r))}function fa(e,t){return la.test(e[t])&&t+1<e.length&&da(e[t+1])}function to(e,t){let o=e[t];if(!o||!o.trim())return!1;let r=o.trim();return!!(sa.test(r)||eo.test(o)||rt.test(o)||zt.test(o)||ca.test(o)||fa(e,t))}function Cr(e,t){let o=Zt(e[t]),r=[],a=t+2;for(;a<e.length&&la.test(e[a])&&e[a].trim()&&!da(e[a]);)r.push(Zt(e[a])),a++;let n=o.length,s=i=>{let f=i.slice(0,n);for(;f.length<n;)f.push("");return f};return{block:{type:"table",header:o.map(i=>he(i)),rows:r.map(i=>s(i).map(f=>he(f)))},next:a}}function Er(e,t){let o=rt.exec(e[t])||zt.exec(e[t]),r=!rt.test(e[t]),a=o[1].length,n=[],s=t;for(;s<e.length;){let i=e[s];if(!i.trim())break;let f=rt.exec(i),d=zt.exec(i);if(f&&!r&&f[1].length<=a){n.push(f[2].trim()),s++;continue}if(d&&r&&d[1].length<=a){n.push(d[3].trim()),s++;continue}if(f||d)break;if(n.length&&!to(e,s)){n[n.length-1]=`${n[n.length-1]} ${i.trim()}`,s++;continue}break}return{block:{type:"list",ordered:r,items:n.map(i=>he(i))},next:s}}function zr(e,t){let o=[],r=[],a=t;for(;a<e.length;){let n=eo.exec(e[a]);if(n){let s=n[1].trim();s?r.push(s):r.length&&(o.push(r.join(" ")),r=[]),a++;continue}if(e[a].trim()&&r.length&&!to(e,a)){r.push(e[a].trim()),a++;continue}break}return r.length&&o.push(r.join(" ")),{block:{type:"blockquote",paragraphs:o.map(n=>he(n))},next:a}}function Mr(e){let o=String(e??"").replace(/\r\n?/g,`
`).split(`
`),r=[],a=0;for(;a<o.length;){let n=o[a];if(!n.trim()){a++;continue}let s=sa.exec(n.trim());if(s){r.push({type:"heading",level:s[1].length,children:he(s[2].trim())}),a++;continue}if(fa(o,a)){let{block:f,next:d}=Cr(o,a);r.push(f),a=d;continue}if(eo.test(n)){let{block:f,next:d}=zr(o,a);r.push(f),a=d;continue}if(ca.test(n)){r.push({type:"hr"}),a++;continue}if(rt.test(n)||zt.test(n)){let{block:f,next:d}=Er(o,a);r.push(f),a=d;continue}let i=[];for(;a<o.length&&o[a].trim()&&!to(o,a);)i.push(o[a].trim()),a++;i.length||(i.push(n.trim()),a++),r.push({type:"paragraph",children:he(i.join(" "))})}return r}function me(e,t,o){return e.map((r,a)=>{let n=`${o}-${a}`;switch(r.type){case"strong":return(0,F.createElement)("strong",{key:n},...me(r.children,t,n));case"em":return(0,F.createElement)("em",{key:n,className:"of-md-em"},...me(r.children,t,n));case"code":return(0,F.createElement)("code",{key:n,className:"of-md-code"},r.value);case"term":return(0,F.createElement)("button",{key:n,className:"of-term-ref",type:"button","data-term":r.id,onClick:()=>t&&t(r.id)},r.text);case"link":return(0,F.createElement)("a",{key:n,className:"of-md-link",href:r.href,target:"_blank",rel:"noreferrer"},...me(r.children,t,n));default:return r.value!=null?String(r.value):""}})}function Tr(e,{onTerm:t}={}){return e.map((o,r)=>{let a=`md-${r}`;switch(o.type){case"heading":{let n=o.level===3?3:2;return(0,F.createElement)(n===3?"h3":"h2",{key:a,className:n===3?"of-md-h3":"of-md-h2"},...me(o.children,t,a))}case"paragraph":return(0,F.createElement)("p",{key:a,className:"of-md-p"},...me(o.children,t,a));case"hr":return(0,F.createElement)("hr",{key:a,className:"of-md-hr"});case"list":{let n=!!o.ordered;return(0,F.createElement)(n?"ol":"ul",{key:a,className:n?"of-md-ol":"of-md-ul"},...o.items.map((s,i)=>{let f=`${a}-${i}`;return(0,F.createElement)("li",{key:f,className:"of-md-li"},...me(s,t,f))}))}case"blockquote":return(0,F.createElement)("blockquote",{key:a,className:"of-md-quote"},...o.paragraphs.map((n,s)=>{let i=`${a}-${s}`;return(0,F.createElement)("p",{key:i,className:"of-md-p"},...me(n,t,i))}));case"table":return(0,F.createElement)("div",{key:a,className:"of-md-table-wrap"},(0,F.createElement)("table",{className:"of-md-table"},(0,F.createElement)("thead",null,(0,F.createElement)("tr",null,...o.header.map((n,s)=>{let i=`${a}-h${s}`;return(0,F.createElement)("th",{key:i,className:"of-md-th",scope:"col"},...me(n,t,i))}))),(0,F.createElement)("tbody",null,...o.rows.map((n,s)=>(0,F.createElement)("tr",{key:`${a}-r${s}`},...n.map((i,f)=>{let d=`${a}-r${s}c${f}`;return(0,F.createElement)("td",{key:d,className:"of-md-td"},...me(i,t,d))}))))));default:return(0,F.createElement)("p",{key:a,className:"of-md-p"},String(o&&o.text!=null?o.text:""))}})}function pa(e,{onTerm:t}={}){return Tr(Mr(e),{onTerm:t})}function ua(e){let t=e.body,o=e.onTerm,r=(0,nt.useMemo)(()=>{if(typeof t!="string"||t.trim()==="")return null;try{let a=pa(t,{onTerm:o});return Array.isArray(a)&&a.length>0?a:null}catch{return[(0,nt.createElement)("p",{key:"of-md-fallback",className:"of-md-p"},t)]}},[t,o]);return r?(0,nt.createElement)("div",{className:"of-article-body"},r):null}var j=require("react");function Ue(e){return e.text?(0,j.createElement)("div",null,(0,j.createElement)("div",{className:"of-gcard-label"},e.label),(0,j.createElement)("div",{className:"of-gcard-text"},e.text)):null}function Mt(e){let t=e.t,o=e.term||{};return(0,j.createElement)("div",null,(0,j.createElement)("div",{className:"of-daily-term"},o.term||o.id),o.alias?(0,j.createElement)("div",{className:"of-gcard-alias"},o.alias):null,o.one?(0,j.createElement)("p",{className:"of-daily-one"},o.one):null,(0,j.createElement)(Ue,{label:t("glossary.metaphor"),text:o.metaphor}),(0,j.createElement)(Ue,{label:t("glossary.number"),text:o.number}),(0,j.createElement)(Ue,{label:t("glossary.pit"),text:o.pit}))}function ma(e){let t=e.t,o=e.term||{},r=!!e.open,a=typeof e.index=="number"?e.index:0,n="of-gloss-"+String(o.id||a),s=()=>e.onToggle();return(0,j.createElement)("div",{className:"of-gcard of-stagger",style:{"--i":String(Math.min(a,10))},"data-open":r?"true":"false",role:"button",tabIndex:0,"aria-expanded":r,"aria-controls":n,onClick:s,onKeyDown:i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),s())}},(0,j.createElement)("div",{className:"of-gcard-term"},(0,j.createElement)("span",null,o.term||o.id),o.alias?(0,j.createElement)("span",{className:"of-gcard-alias"},o.alias):null),o.one?(0,j.createElement)("div",{className:"of-gcard-one"},o.one):null,(0,j.createElement)("div",{className:"of-gcard-detail"},(0,j.createElement)("div",{className:"of-gcard-detail-inner",id:n,"aria-hidden":r?"false":"true"},(0,j.createElement)(Ue,{label:t("glossary.metaphor"),text:o.metaphor}),(0,j.createElement)(Ue,{label:t("glossary.number"),text:o.number}),(0,j.createElement)(Ue,{label:t("glossary.pit"),text:o.pit}))))}function Or(e){return(0,w.createElement)("div",{"aria-busy":"true","aria-label":e.t("a11y.loading")},(0,w.createElement)(G,{height:26,width:"72%",radius:8}),(0,w.createElement)(G,{height:13,width:"92%",style:{marginTop:16}}),(0,w.createElement)(G,{height:13,width:"64%",style:{marginTop:8}}),(0,w.createElement)("div",{className:"of-section"},(0,w.createElement)(Nt,{lines:7,gap:11})))}function Lr(e){let t=e.t,o=e.termId,{loading:r,data:a,error:n,reload:s}=Me(x=>dt(x),[]),i=(0,w.useRef)(null);(0,w.useEffect)(()=>{let x=i.current;if(!x||typeof x.scrollIntoView!="function")return;let u=typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;x.scrollIntoView({block:"nearest",behavior:u?"auto":"smooth"})},[o]);let d=(a&&Array.isArray(a.terms)?a.terms:[]).find(x=>x.id===o)||null;return(0,w.createElement)("div",{className:"of-section",ref:i,"aria-live":"polite"},(0,w.createElement)("div",{className:"of-section-head"},(0,w.createElement)("h2",{className:"of-section-title"},t("glossary.title"))),r?(0,w.createElement)("div",{className:"of-gloss-cards"},(0,w.createElement)(G,{height:92,radius:12})):n?(0,w.createElement)(ue,{title:t("error.title"),body:n,retryLabel:t("retry"),onRetry:s}):d?(0,w.createElement)("div",{className:"of-daily"},(0,w.createElement)(Mt,{t,term:d})):(0,w.createElement)(pe,{title:t("glossary.empty")}))}function ha(e){let t=e.t,o=e.id,r=e.onBack,a=e.onOpenArticle,{data:n,error:s,reload:i}=Me(z=>lo(o,z),[o]),[f,d]=(0,w.useState)(null),x=(0,w.useRef)(null),u=n&&n.id===o?n:null,k=(0,w.useCallback)(z=>{d(I=>I===z?null:z)},[]);(0,w.useEffect)(()=>{let z=x.current,I=z&&typeof z.closest=="function"?z.closest(".of-page"):null;I&&(I.scrollTop=0)},[o]),(0,w.useEffect)(()=>{d(null)},[o]);let h=u?"ready":s?"error":"loading",p=u?Number(u.readMinutes):0,S=u?Number(u.difficulty):0,A=u?u.dataAsOfActual||u.dataAsOf:null,N=u&&Array.isArray(u.points)?u.points:[],b=u&&Array.isArray(u.related)?u.related:[];return(0,w.createElement)("div",{className:"of-article",ref:x},(0,w.createElement)("button",{type:"button",className:"of-article-back",onClick:r},(0,w.createElement)($,{name:"back",size:13}),(0,w.createElement)("span",null,t("academy.back"))),(0,w.createElement)("div",{key:o+":"+h,className:"of-fade-in"},u?(0,w.createElement)("div",null,(0,w.createElement)("h1",{className:"of-article-title"},u.title||o),u.dek?(0,w.createElement)("p",{className:"of-article-dek"},u.dek):null,(0,w.createElement)("div",{className:"of-article-meta"},u.tag?(0,w.createElement)(St,null,u.tag):null,p>0?(0,w.createElement)("span",{className:"of-meta"},t("academy.readMinutes",{n:p})):null,S>0?(0,w.createElement)(At,{value:S,label:t("academy.difficulty",{n:S})}):null,A?(0,w.createElement)("span",{className:"of-meta"},t("academy.dataAsOf",{date:A})):null),N.length>0?(0,w.createElement)("div",{className:"of-section"},(0,w.createElement)("div",{className:"of-section-head"},(0,w.createElement)("h2",{className:"of-section-title"},t("academy.points"))),(0,w.createElement)("div",{className:"of-points"},N.map((z,I)=>(0,w.createElement)("div",{key:I,className:"of-point"},z)))):null,(0,w.createElement)(ua,{body:u.body,onTerm:k}),f?(0,w.createElement)(Lr,{key:"term-peek",t,termId:f}):null,b.length>0?(0,w.createElement)("div",{className:"of-related"},(0,w.createElement)("div",{className:"of-section-head"},(0,w.createElement)("h2",{className:"of-section-title"},t("academy.related"))),b.map((z,I)=>{let Y=typeof z=="string"?{id:z,title:z}:z||{},ke=Y.kind==="term";return(0,w.createElement)("button",{key:Y.id||I,type:"button",className:"of-related-link",onClick:()=>{ke?d(W=>W===Y.id?null:Y.id):a(Y.id)}},Y.title||Y.id)})):null):s?(0,w.createElement)(ue,{title:t("error.title"),body:s,retryLabel:t("retry"),onRetry:i}):(0,w.createElement)(Or,{t})))}var T=require("react");var Hr=[0,1,2,3,4,5,6,7];function ga(e,t){let o=e.find(r=>r.id===t);return o?o.label:""}function Ir(e){let t=e.t,o=e.daily,r=ga(e.categories,o.cat);return(0,T.createElement)("section",{className:"of-daily of-fade-in","aria-label":t("glossary.daily")},(0,T.createElement)("div",{style:{flex:"1 1 auto",minWidth:0}},(0,T.createElement)(Mt,{t,term:o})),(0,T.createElement)("div",{className:"of-filters"},(0,T.createElement)(Jt,{tone:"brand"},t("glossary.daily")),r?(0,T.createElement)(Jt,null,r):null))}function ba(e){let t=e.t,{loading:o,data:r,error:a,reload:n}=Me(b=>dt(b),[]),[s,i]=(0,T.useState)(""),[f,d]=(0,T.useState)(null),x=(0,T.useRef)(null),u=r&&Array.isArray(r.terms)?r.terms:[],k=r&&Array.isArray(r.categories)?r.categories:[],h=r&&r.daily?r.daily:null,p=s.trim().toLowerCase();(0,T.useEffect)(()=>{let b=x.current,z=b&&typeof b.closest=="function"?b.closest(".of-page"):null;z&&(z.scrollTop=0)},[]);let S=(0,T.useMemo)(()=>p?u.filter(b=>[b.term,b.alias,b.one,b.cat,ga(k,b.cat)].filter(Boolean).join(" ").toLowerCase().includes(p)):u,[u,k,p]),A=(0,T.useMemo)(()=>p||!h?S:S.filter(b=>b.id!==h.id),[S,h,p]),N=[];return o?(N.push((0,T.createElement)(G,{key:"daily-skeleton",height:122,radius:14})),N.push((0,T.createElement)("div",{key:"term-skeleton",className:"of-gloss-cards","aria-busy":"true","aria-label":t("a11y.loading")},Hr.map(b=>(0,T.createElement)(G,{key:b,height:76,radius:12}))))):a?N.push((0,T.createElement)(ue,{key:"error",title:t("error.title"),body:a,retryLabel:t("retry"),onRetry:n})):(!p&&h&&N.push((0,T.createElement)(Ir,{key:"daily",t,daily:h,categories:k})),A.length>0?N.push((0,T.createElement)("div",{key:"terms"},(0,T.createElement)("div",{className:"of-section-head"},(0,T.createElement)("h2",{className:"of-section-title"},t("glossary.terms"))),(0,T.createElement)("div",{className:"of-gloss-cards"},A.map((b,z)=>(0,T.createElement)(ma,{key:b.id,t,term:b,index:z,open:f===b.id,onToggle:()=>d(I=>I===b.id?null:b.id)}))))):N.push((0,T.createElement)(pe,{key:"empty",title:t(p?"glossary.empty":"empty"),icon:(0,T.createElement)($,{name:"search",size:20})}))),(0,T.createElement)("div",{className:"of-gloss of-fade-in",ref:x},(0,T.createElement)("div",{className:"of-toolbar"},(0,T.createElement)(Ct,{value:s,onChange:i,placeholder:t("glossary.search")})),...N)}var Rr="dsh-openfin",Dr=["slots","locale"],it="dsh-openfin",oo="dsh-openfin",ya="dsh-openfin:tab";function xa(){try{let e=window.localStorage.getItem(ya);if(e==="terminal"||e==="market"||e==="academy"||e==="glossary")return e}catch{}return"terminal"}function Pr(e){try{window.localStorage.setItem(ya,e)}catch{}}function Fr(e){let[t,o]=(0,y.useState)({snapshot:null,loading:!0,error:null}),[r,a]=(0,y.useState)(0),n=(0,y.useCallback)(()=>a(s=>s+1),[]);return(0,y.useEffect)(()=>{if(!e)return;let s=typeof document>"u"?null:document,i=new AbortController,f=!0,d=0,x=0,u=p=>{clearTimeout(d),d=setTimeout(k,Math.max(1e4,Number(p)||3e4))},k=async()=>{if(clearTimeout(d),d=0,!(s!==null&&s.hidden))try{let p=await no(i.signal);if(!f)return;x=0,o({snapshot:p,loading:!1,error:null}),u(p&&p.refreshMs)}catch(p){if(!f||p&&p.name==="AbortError")return;x+=1,o(S=>({snapshot:S.snapshot,loading:!1,error:p&&p.message||String(p)})),u(Math.min(3e4*2**(x-1),5*6e4))}},h=()=>{if(s!==null){if(s.hidden){clearTimeout(d),d=0;return}d===0&&k()}};return s?.addEventListener("visibilitychange",h),o(p=>({snapshot:p.snapshot,loading:!0,error:null})),(s===null||!s.hidden)&&k(),()=>{f=!1,i.abort(),clearTimeout(d),s?.removeEventListener("visibilitychange",h)}},[e,r]),{...t,refresh:n}}function _r(e,t){if(typeof t!="string"||t==="")return!1;let o=t.split("+").map(f=>f.trim()).filter(Boolean);if(o.length===0)return!1;let r=o[o.length-1].toLowerCase(),a=new Set(o.slice(0,-1).map(f=>f.toLowerCase())),n=a.has("commandorcontrol")||a.has("control")||a.has("ctrl")||a.has("command")||a.has("cmd"),s=a.has("shift"),i=a.has("alt")||a.has("option");return e.ctrlKey!==n&&!(a.has("commandorcontrol")&&e.metaKey)||e.shiftKey!==s||e.altKey!==i?!1:r==="space"?e.code==="Space"||e.key===" ":e.key.toLowerCase()===r}function jr({t:e,onOpenDashboard:t}){let[o,r]=(0,y.useState)(Ze),[a,n]=(0,y.useState)(!1),[s,i]=(0,y.useState)(null),[f,d]=(0,y.useState)(!1),x=(0,y.useRef)(!1),u=(0,y.useCallback)(p=>{x.current=p,d(p),ze({action:"panic",hidden:p}).catch(()=>{})},[]);(0,y.useEffect)(()=>Eo(r),[]),(0,y.useEffect)(()=>Lo(()=>n(!0)),[]),(0,y.useEffect)(()=>{if(!o.panicEnabled)return;let p=S=>{_r(S,o.panicShortcut)&&(S.preventDefault(),S.stopPropagation(),u(!x.current))};return window.addEventListener("keydown",p,!0),()=>window.removeEventListener("keydown",p,!0)},[o.panicEnabled,o.panicShortcut,u]),(0,y.useEffect)(()=>{!o.inline&&f&&u(!1)},[o.inline,f,u]);let k=(0,y.useCallback)(p=>{let S=Co(p);r(S),p&&p.desktop!==void 0?To(p.desktop):zo(S)},[]),h=(0,y.useCallback)(()=>{ft().then(i,()=>i(null))},[]);return(0,y.useEffect)(()=>{if(!o.desktop&&!a)return;h();let p=setInterval(()=>{typeof document<"u"&&document.hidden||o.desktop&&h()},15e3);return()=>clearInterval(p)},[o.desktop,a,h]),!o.inline&&!a?null:(0,y.createElement)("div",{className:"of-hud-layer"},o.inline?(0,y.createElement)($o,{t:e,config:o,onChange:k,onConfigure:()=>n(!0),onOpenDashboard:t,hidden:f,onPanic:()=>u(!0)}):null,a?(0,y.createElement)(Go,{t:e,config:o,status:s,onChange:k,onRefreshStatus:h,onClose:()=>n(!1),onPanicNow:()=>{u(!0),n(!1)}}):null)}function Br({t:e}){let[t,o]=(0,y.useState)(xa),[r,a]=(0,y.useState)(null),[n,s]=(0,y.useState)(()=>xa()==="terminal"),i=Fr(t!=="terminal"),f=e("meta.direction")==="intl"?"intl":"cn",d=(0,y.useCallback)(k=>{a(null),o(k),Pr(k),k==="terminal"&&s(!0)},[]),x=(0,y.useCallback)(k=>{a(k),o("academy")},[]),u=i.snapshot&&i.snapshot.updatedAt;return(0,y.createElement)("div",{className:"of-page","data-direction":f,"data-view":t},(0,y.createElement)("div",{className:"of-inner"},(0,y.createElement)("header",{className:"of-head"},(0,y.createElement)("div",{className:"of-mark"},(0,y.createElement)(ye,{size:23})),(0,y.createElement)("div",{className:"of-titles"},(0,y.createElement)("h1",{className:"of-title"},e("title")),(0,y.createElement)("div",{className:"of-sub"},e("subtitle"))),(0,y.createElement)("div",{className:"of-head-actions"},(0,y.createElement)(Ko,{items:[{id:"terminal",label:e("tab.terminal")},{id:"market",label:e("tab.market")},{id:"academy",label:e("tab.academy")},{id:"glossary",label:e("tab.glossary")}],value:t,onChange:d,ariaLabel:e("title")}),(0,y.createElement)("button",{type:"button",className:"of-icon-btn",title:e("hud.settings"),"aria-label":e("hud.settings"),onClick:()=>Oo()},(0,y.createElement)($,{name:"float",size:15})),t==="market"?(0,y.createElement)(Xo,{label:e("refresh"),busy:i.loading,onClick:i.refresh}):null)),(0,y.createElement)("main",{id:"of-panel-"+t,role:"tabpanel"},n?(0,y.createElement)("div",{className:"of-terminal-holder","data-active":t==="terminal"?"true":"false"},(0,y.createElement)(aa,{t:e,active:t==="terminal"})):null,t==="terminal"?null:t==="market"?(0,y.createElement)(ta,{t:e,snapshot:i.snapshot,loading:i.loading,error:i.error,onRetry:i.refresh}):t==="academy"?r?(0,y.createElement)(ha,{t:e,id:r,onBack:()=>a(null),onOpenArticle:x}):(0,y.createElement)(ia,{t:e,onOpenArticle:x}):(0,y.createElement)(ba,{t:e})),t==="terminal"?null:(0,y.createElement)("footer",{className:"of-foot"},(0,y.createElement)("span",{className:"of-live-dot","data-stale":i.snapshot&&i.snapshot.stale?"true":"false"}),(0,y.createElement)("span",{className:"of-foot-meta"},e("market.updated")+" "+(u?new Date(u).toLocaleTimeString():"—")),i.snapshot&&i.snapshot.stale?(0,y.createElement)("span",{className:"of-badge"},e("stale")):null,(0,y.createElement)("span",{style:{flex:1}}),(0,y.createElement)("a",{href:"https://github.com/5777-wq/openfinlens",target:"_blank",rel:"noreferrer noopener"},"OpenFinLens"),(0,y.createElement)("span",null,"·"),(0,y.createElement)("a",{href:"https://github.com/5777-wq/openfin-academy",target:"_blank",rel:"noreferrer noopener"},"OpenFin Academy"),(0,y.createElement)("span",null,"·"),(0,y.createElement)("span",null,e("market.disclaimer")))))}function qr(e){e.effect(()=>e.locale.register(it,{zh:mo,en:uo}),"dsh-openfin: dictionaries");let t=e.locale.bind(it),o=(a,n)=>{let s=t(a);return typeof s!="string"?a:n===void 0?s:s.replace(/\{(\w+)\}/g,(i,f)=>n[f]===void 0||n[f]===null?i:String(n[f]))};e.effect(()=>{let a=document.createElement("style");return a.setAttribute("data-dsh-openfin",""),a.textContent=po+ho,document.head.appendChild(a),()=>{a.remove()}},"dsh-openfin: stylesheet"),e.slots.inject("sidebar.panellist",()=>e.slots.register({name:"sidebar.panellist",id:oo,order:2,label:()=>o("nav"),locale:it,inject:()=>({t:o})},a=>(0,y.createElement)(ye,{size:a&&a.size||16}))),e.slots.inject("main",()=>e.slots.register({name:"main",key:oo,locale:it,inject:()=>({t:o})},a=>(0,y.createElement)(Br,{t:a&&a.t||o})));let r=e.get?e.get("layout"):void 0;e.slots.inject("shell.overlay",()=>e.slots.register({name:"shell.overlay",id:"dsh-openfin-hud",order:60,label:()=>o("hud.title"),locale:it,inject:()=>({t:o})},a=>(0,y.createElement)(jr,{t:a&&a.t||o,onOpenDashboard:()=>{r&&typeof r.selectPanel=="function"&&r.selectPanel(oo)}})))}
    return module.exports;
  },
});
