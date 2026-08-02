/**
 * THESIS: One evidence-led production loop from conversational intent to an approved Postiz draft.
 * OWN-WORLD: Reel Pipeline's near-black studio surfaces, restrained evidence green, sharp type, and staged workbench.
 * STORY: Describe the video, correct the normalized brief, create or continue, review, then hand an approved draft to Postiz.
 * FIRST VIEWPORT: The shared mast frames a compact conversational intake beside the active production brief.
 * FORM: Operate-mode production console aligned with Forge and Review; dense, staged, and explicit.
 */
import brandConfig from '../../config/brand-channels.json' with { type: 'json' };
import arsenalConfig from '../../config/studio-arsenal.json' with { type: 'json' };

const TOOLS = arsenalConfig.tools.filter((entry) => entry.ui !== false).map((entry) => structuredClone(entry));

const BRANDS = Object.entries(brandConfig.brands ?? {}).map(([slug, brand]) => ({
  slug,
  name: brand.name,
}));

export function studioPageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Video Maker — Reel Pipeline</title>
<style>
  :root {
    color-scheme: dark;
    --bg:#07090d;
    --surface:#11151c;
    --raised:#171d26;
    --line:#29313d;
    --text:#f3f5f7;
    --muted:#aab2bc;
    --dim:#7f8995;
    --evidence:#d9e6ef;
    --verified:#82d9a7;
    --risk:#ff6b76;
    --warning:#f3c980;
    --focus:#b9dcff;
    --radius:14px;
  }
  * { box-sizing: border-box; }
  html { background:var(--bg); }
  body {
    margin:0;
    min-width:320px;
    background:var(--bg);
    color:var(--text);
    font:14px/1.5 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    text-rendering:optimizeLegibility;
  }
  button, input, textarea, select { font:inherit; }
  button, a, input, textarea, select { outline:none; }
  :focus-visible { box-shadow:0 0 0 3px rgba(185,220,255,.34); }
  a { color:var(--evidence); }
  .skip-link { position:absolute; left:12px; top:-50px; z-index:20; background:var(--text); color:var(--bg); padding:8px 12px; }
  .skip-link:focus { top:12px; }
  .product-bar {
    min-height:72px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:24px;
    padding:12px clamp(16px,3vw,40px);
    border-bottom:1px solid var(--line);
    background:#090c11;
  }
  .brand-lockup { display:flex; align-items:center; gap:13px; min-width:0; }
  .brand-mark {
    width:34px;
    height:34px;
    border:1px solid #43505f;
    border-radius:50%;
    background:#0c1016;
    position:relative;
    flex:0 0 auto;
  }
  .brand-mark::after {
    content:"";
    position:absolute;
    left:7px;
    right:7px;
    top:16px;
    height:2px;
    background:var(--verified);
    box-shadow:8px 0 12px rgba(130,217,167,.38);
  }
  .brand-lockup h1 { margin:0; font-size:1.04rem; letter-spacing:-.02em; }
  .brand-lockup p { margin:3px 0 0; color:var(--muted); font-size:.78rem; }
  .utility-links { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  .utility-links a { min-height:44px; display:inline-flex; align-items:center; color:var(--muted); font-size:13px; text-decoration:none; }
  .utility-links a:hover { color:var(--text); }
  .utility-links a[aria-current="page"] { color:var(--text); border:1px solid var(--line); border-radius:9px; padding-inline:13px; background:var(--raised); }
  .primary-nav {
    display:flex;
    gap:4px;
    padding:10px clamp(16px,3vw,40px);
    border-bottom:1px solid var(--line);
    background:#0b0e13;
    overflow-x:auto;
  }
  .primary-nav [role="tablist"] { display:flex; gap:4px; }
  .primary-nav button {
    min-height:44px;
    border:1px solid transparent;
    background:transparent;
    color:var(--muted);
    padding:8px 14px;
    border-radius:8px;
    cursor:pointer;
    white-space:nowrap;
  }
  .primary-nav button:hover { color:var(--text); background:var(--surface); }
  .primary-nav button[aria-selected="true"] { color:var(--text); border-color:var(--line); background:var(--raised); }
  .shell { width:min(1440px,100%); margin:0 auto; padding:clamp(20px,3vw,42px); }
  .view[hidden] { display:none; }
  .view-head { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:24px; }
  .view-head h2 { margin:0; font-size:24px; letter-spacing:-.025em; }
  .view-head p { margin:5px 0 0; color:var(--muted); max-width:68ch; }
  .count-note { color:var(--dim); font-size:12px; white-space:nowrap; }
  .create-grid { display:grid; grid-template-columns:minmax(320px,390px) minmax(0,1fr); gap:24px; align-items:start; }
  .stage { border:1px solid var(--line); background:var(--surface); border-radius:var(--radius); overflow:hidden; }
  .stage + .stage { margin-top:16px; }
  .stage-head { padding:16px 18px 12px; border-bottom:1px solid var(--line); }
  .stage-head h3 { margin:0; font-size:15px; letter-spacing:-.01em; }
  .stage-head p { margin:4px 0 0; color:var(--muted); font-size:13px; }
  .stage-body { padding:18px; }
  .conversation { min-height:220px; display:grid; align-content:start; gap:10px; margin-bottom:14px; }
  .message { max-width:86%; padding:10px 12px; border:1px solid var(--line); border-radius:10px; white-space:pre-wrap; }
  .message.operator { justify-self:end; background:var(--raised); }
  .message.assistant { justify-self:start; background:#0d1117; color:var(--evidence); }
  .message.empty { max-width:100%; color:var(--muted); background:transparent; border-style:dashed; }
  .composer { display:grid; gap:10px; }
  .composer textarea { min-height:112px; }
  .prompt-studio { max-width:920px; margin:clamp(24px,5vw,64px) auto 28px; border:1px solid var(--line); border-radius:16px; background:var(--surface); box-shadow:0 24px 70px rgba(0,0,0,.22); overflow:hidden; }
  .prompt-studio .composer { gap:0; }
  .prompt-studio label[for="request"] { padding:22px 22px 0; color:var(--text); font-size:15px; font-weight:700; }
  .prompt-studio textarea { min-height:170px; padding:14px 22px 20px; border:0; border-radius:0; background:transparent; font-size:18px; line-height:1.5; }
  .prompt-studio textarea:focus { outline:0; box-shadow:none; }
  .quick-settings { border-top:1px solid var(--line); background:#0b0f14; }
  .quick-settings > summary { min-height:52px; display:flex; align-items:center; justify-content:space-between; padding:0 22px; color:var(--muted); cursor:pointer; font-weight:650; }
  .quick-settings > summary span { color:var(--dim); font-size:12px; font-weight:400; }
  .quick-settings[open] > summary { color:var(--text); }
  .quick-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; padding:0 22px 18px; }
  .quick-options label { min-width:0; }
  .quick-options select { min-height:44px; }
  .prompt-actions { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:16px 22px 18px; border-top:1px solid var(--line); }
  .prompt-actions .button-row { justify-content:flex-end; }
  .auto-note { color:var(--dim); font-size:12px; }
  .prompt-feedback { margin:0; padding:0 22px 16px; min-height:0; }
  .capability-picker { max-width:920px; margin:0 auto 28px; }
  .capability-picker-head { display:flex; justify-content:space-between; gap:16px; align-items:end; margin-bottom:10px; }
  .capability-picker-head h3 { margin:0; font-size:14px; }
  .capability-picker-head p { margin:3px 0 0; color:var(--dim); font-size:12px; }
  .capability-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; }
  .capability-choice { min-height:104px; display:grid; align-content:space-between; gap:12px; padding:14px; border:1px solid var(--line); border-radius:11px; background:#0d1117; color:var(--text); text-align:left; cursor:pointer; }
  .capability-choice:hover { border-color:#536273; background:#111721; }
  .capability-choice[aria-pressed="true"] { border-color:var(--verified); background:#101b18; }
  .capability-choice strong { display:block; font-size:13px; }
  .capability-choice span { display:block; margin-top:4px; color:var(--muted); font-size:11px; line-height:1.4; }
  .capability-choice small { color:var(--evidence); font-size:10px; letter-spacing:.04em; text-transform:uppercase; }
  .button-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .button {
    min-height:44px;
    border:1px solid var(--line);
    border-radius:10px;
    background:#0d1117;
    color:var(--text);
    padding:8px 13px;
    font-weight:650;
    text-decoration:none;
    cursor:pointer;
  }
  .button:hover { border-color:#5d6b7b; background:#111721; }
  .button.primary { background:var(--verified); border-color:var(--verified); color:#07130c; }
  .button.primary:hover { background:#9ce8b8; }
  .button.danger { color:#ffd3d7; border-color:#6c3940; }
  .button[disabled] { opacity:.48; cursor:not-allowed; }
  .field-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
  .field-grid > label { align-self:start; }
  .brief-group { border-top:1px solid var(--line); padding:12px 0; }
  .brief-group:last-of-type { border-bottom:1px solid var(--line); }
  .brief-group summary { color:var(--text); font-weight:600; cursor:pointer; }
  .brief-group[open] summary { margin-bottom:10px; }
  label { display:grid; gap:5px; color:var(--muted); font-size:12px; }
  label.wide { grid-column:1/-1; }
  input, textarea, select {
    width:100%;
    min-height:42px;
    background:#0d1117;
    border:1px solid #303946;
    color:var(--text);
    border-radius:10px;
    padding:10px 11px;
  }
  input:hover, textarea:hover, select:hover { border-color:#465363; }
  input:focus, textarea:focus, select:focus { border-color:var(--focus); }
  textarea { min-height:86px; resize:vertical; }
  .checkline { display:flex; min-height:44px; grid-column:1/-1; align-items:center; gap:9px; color:var(--muted); font-size:13px; }
  .checkline input { width:auto; margin-top:3px; }
  .brief-actions { display:flex; justify-content:space-between; gap:12px; align-items:center; margin-top:16px; padding-top:14px; border-top:1px solid var(--line); }
  .brief-state { color:var(--muted); font-size:12px; }
  .workflow-list { display:grid; }
  .workflow {
    display:grid;
    min-height:56px;
    grid-template-columns:minmax(0,1fr) auto;
    gap:12px;
    align-items:center;
    width:100%;
    text-align:left;
    padding:13px 16px;
    border:0;
    border-bottom:1px solid var(--line);
    background:transparent;
    color:var(--text);
    cursor:pointer;
  }
  .workflow:last-child { border-bottom:0; }
  .workflow:hover { background:var(--raised); }
  .workflow.active { background:#111a19; }
  .workflow strong { display:block; font-size:13px; }
  .workflow span { display:block; color:var(--muted); font-size:12px; margin-top:2px; }
  .planner { margin-bottom:22px; }
  .planner-head { display:flex; justify-content:space-between; align-items:center; gap:16px; }
  .planner-body { display:grid; grid-template-columns:minmax(260px,.7fr) minmax(380px,1.3fr); }
  .planner-step { min-width:0; padding:20px; border-bottom:1px solid var(--line); }
  .planner-step:nth-child(odd) { border-right:1px solid var(--line); }
  #planner-step-recipe,#planner-step-options { grid-column:1/-1; border-right:0; }
  .planner-step.is-locked { opacity:.54; }
  .planner-step.is-locked > :not(.step-heading) { pointer-events:none; }
  .step-heading { display:flex; align-items:flex-start; gap:11px; margin-bottom:15px; }
  .step-heading h3 { margin:0; font-size:14px; }
  .step-heading p { margin:3px 0 0; color:var(--muted); font-size:12px; }
  .step-number { display:grid; place-items:center; width:26px; height:26px; flex:0 0 auto; border:1px solid #465363; border-radius:50%; color:var(--evidence); font-size:12px; font-weight:800; }
  .choice-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; }
  .choice-card { min-height:86px; display:grid; align-content:start; gap:4px; width:100%; padding:12px; border:1px solid var(--line); border-radius:10px; background:#0d1117; color:var(--text); text-align:left; cursor:pointer; }
  .choice-card:hover { border-color:#536273; background:#111721; }
  .choice-card[aria-pressed="true"] { border-color:var(--verified); background:#101b18; box-shadow:inset 0 0 0 1px rgba(130,217,167,.2); }
  .choice-card strong { font-size:13px; }
  .choice-card span { color:var(--muted); font-size:11px; }
  .choice-card .mini-state { color:var(--dim); }
  .inline-create { margin-top:12px; border-top:1px solid var(--line); }
  .inline-create summary,.evidence-options summary { min-height:44px; display:flex; align-items:center; color:var(--evidence); cursor:pointer; font-size:12px; font-weight:650; }
  .inline-create form { padding-top:8px; }
  .recipe-group + .recipe-group { margin-top:18px; }
  .recipe-group h4 { margin:0 0 8px; color:var(--dim); font-size:11px; letter-spacing:.07em; text-transform:uppercase; }
  .recipe-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:9px; }
  .recipe-card { min-height:170px; display:flex; flex-direction:column; gap:8px; width:100%; padding:14px; border:1px solid var(--line); border-radius:11px; background:#0d1117; color:var(--text); text-align:left; cursor:pointer; }
  .recipe-card:hover { border-color:#536273; background:#111721; }
  .recipe-card[aria-pressed="true"] { border-color:var(--verified); background:#101b18; box-shadow:inset 0 0 0 1px rgba(130,217,167,.2); }
  .recipe-card-head { display:flex; justify-content:space-between; gap:9px; align-items:flex-start; }
  .recipe-card strong { font-size:13px; }
  .recipe-card p { margin:0; color:var(--muted); font-size:12px; }
  .recipe-meta { display:flex; gap:5px; flex-wrap:wrap; margin-top:auto; }
  .recipe-meta span { padding:2px 6px; border:1px solid var(--line); border-radius:999px; color:var(--dim); font-size:10px; }
  .recipe-blocker { color:var(--warning)!important; }
  .recommended-recipes > h4,.all-recipes > summary { margin:0 0 8px; color:var(--dim); font-size:11px; letter-spacing:.07em; text-transform:uppercase; }
  .all-recipes { margin-top:14px; border-top:1px solid var(--line); }
  .all-recipes > summary { min-height:44px; display:flex; align-items:center; margin:0; color:var(--evidence); cursor:pointer; font-weight:700; }
  .all-recipes[open] > summary { margin-bottom:10px; }
  .recipe-option-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
  .evidence-options { border-top:1px solid var(--line); }
  .evidence-options .field-grid { padding-top:8px; }
  .planner-terminal { display:grid; grid-template-columns:minmax(220px,1fr) auto; gap:12px 20px; align-items:center; padding:16px 20px; background:#0b0f14; }
  .planner-terminal strong { font-size:13px; }
  .planner-terminal p { margin:3px 0 0; color:var(--muted); font-size:12px; }
  .planner-terminal .feedback { grid-column:1/-1; margin:0; min-height:0; }
  .planner-terminal .button[hidden] { display:none; }
  .advanced-studio { margin-top:16px; }
  .advanced-studio > summary { min-height:52px; display:flex; align-items:center; color:var(--evidence); border:1px solid var(--line); border-radius:var(--radius); padding:0 16px; cursor:pointer; font-weight:700; }
  .advanced-studio[open] > summary { border-radius:var(--radius) var(--radius) 0 0; background:var(--surface); }
  .advanced-studio > p { margin:0; padding:12px 16px; border-inline:1px solid var(--line); color:var(--muted); }
  .advanced-studio .create-grid { padding-top:16px; }
  .manual-planner { max-width:920px; margin:0 auto; }
  .manual-planner > summary { color:var(--muted); border-color:transparent; justify-content:center; font-size:12px; font-weight:600; }
  .manual-planner[open] > summary { border-color:var(--line); }
  .manual-planner .planner { margin:16px 0 0; }
  .state {
    display:inline-flex;
    align-items:center;
    gap:6px;
    border:1px solid var(--line);
    border-radius:999px;
    padding:3px 8px;
    color:var(--muted);
    font-size:11px;
    white-space:nowrap;
  }
  .state::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--dim); }
  .state.ready::before, .state.scheduled::before, .state.distributed::before { background:var(--verified); }
  .state.blocked::before, .state.failed::before { background:var(--risk); }
  .state.needs-input::before, .state.needs-review::before { background:var(--warning); }
  .feedback { min-height:20px; margin-top:10px; color:var(--muted); font-size:13px; }
  .feedback.error { color:var(--risk); }
  .feedback.success { color:var(--verified); }
  .lane-console { margin-bottom:24px; border-block:1px solid var(--line); background:#0b0e13; }
  .lane-console-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:16px 0 14px; }
  .lane-console-head h3 { margin:0; font-size:15px; }
  .lane-console-head p { margin:4px 0 0; color:var(--muted); font-size:12px; }
  .lane-switcher { display:flex; gap:5px; flex-wrap:wrap; }
  .lane-switcher button { min-width:44px; min-height:44px; border:1px solid transparent; border-radius:8px; padding:7px 10px; background:transparent; color:var(--muted); cursor:pointer; }
  .lane-switcher button:hover { color:var(--text); background:var(--surface); }
  .lane-switcher button[aria-pressed="true"] { color:var(--text); border-color:var(--line); background:var(--raised); }
  .lane-ledger { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-top:1px solid var(--line); }
  .lane-ledger > div { min-width:0; padding:14px 16px 16px 0; }
  .lane-ledger > div + div { padding-left:16px; border-left:1px solid var(--line); }
  .lane-ledger strong { display:flex; align-items:baseline; justify-content:space-between; gap:10px; font-size:13px; }
  .lane-ledger strong span { color:var(--evidence); font-size:18px; font-variant-numeric:tabular-nums; }
  .lane-ledger p { margin:4px 0 0; color:var(--dim); font-size:11px; }
  .automation-note { padding:12px 0; border-top:1px solid var(--line); color:var(--muted); font-size:12px; }
  .automation-note summary { min-height:40px; display:flex; align-items:center; color:var(--warning); cursor:pointer; font-weight:650; }
  .automation-note ul { margin:4px 0 8px; padding-left:20px; }
  .automation-note li + li { margin-top:7px; }
  .production-list { border-top:1px solid var(--line); }
  .production {
    display:grid;
    grid-template-columns:minmax(0,1.35fr) minmax(220px,.65fr);
    gap:22px;
    padding:20px 0;
    border-bottom:1px solid var(--line);
  }
  .production h3 { margin:0 0 5px; font-size:16px; }
  .production p { margin:4px 0; color:var(--muted); }
  .production-meta { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
  .production-evidence {
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:8px 14px;
    margin:14px 0 0;
    padding:12px;
    border:1px solid var(--line);
    border-radius:10px;
    background:#0d1117;
  }
  .production-evidence div { min-width:0; }
  .production-evidence dt { color:var(--dim); font-size:10px; letter-spacing:.06em; text-transform:uppercase; }
  .production-evidence dd { margin:3px 0 0; color:var(--muted); overflow-wrap:anywhere; }
  .automation-evidence { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .automation-evidence .recovery { grid-column:1/-1; padding-top:8px; border-top:1px solid var(--line); }
  .automation-evidence .recovery dd { color:var(--evidence); }
  .production video { width:100%; max-height:360px; background:#000; border-radius:10px; }
  .production iframe,.production > img { width:100%; min-height:360px; max-height:520px; border:0; border-radius:10px; background:#090c11; object-fit:contain; }
  .production.platform-audio-production { grid-template-columns:minmax(280px,.7fr) minmax(0,1.3fr); }
  .platform-audio-production > div:first-child { align-self:start; }
  .platform-audio-setup { margin-top:14px; padding-top:12px; border-top:1px solid var(--line); }
  .platform-audio-setup summary { min-height:44px; display:flex; align-items:center; color:var(--evidence); cursor:pointer; font-weight:600; }
  .platform-audio-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; padding:8px 0 4px; }
  .platform-audio-form label { color:var(--muted); font-size:12px; }
  .platform-audio-form .wide { grid-column:1/-1; }
  .platform-audio-review { display:grid; gap:12px; }
  .sync-stage { display:grid; grid-template-columns:minmax(220px,.7fr) minmax(320px,1.3fr); grid-template-areas:"visual controls" "visual guidance" "visual source" "visual proof" "visual handoff"; column-gap:18px; row-gap:12px; align-items:start; }
  .sync-visual { grid-area:visual; }
  .sync-controls { grid-area:controls; }
  .sync-guidance { grid-area:guidance; }
  .sync-source { grid-area:source; }
  .silent-proof { grid-area:proof; }
  .platform-handoff { grid-area:handoff; }
  .sync-source,.sync-visual { min-width:0; }
  .sync-source span,.sync-visual span { display:block; margin-bottom:6px; color:var(--dim); font-size:11px; letter-spacing:.05em; text-transform:uppercase; }
  .youtube-player { width:100%; aspect-ratio:16/9; background:#07090d; border-radius:10px; overflow:hidden; }
  .youtube-player iframe { width:100%; height:100%; border:0; }
  .spotify-player iframe { display:block; width:100%; border:0; border-radius:10px; }
  .sync-visual video { display:block; width:100%; max-height:480px; aspect-ratio:9/16; object-fit:contain; border-radius:10px; }
  .sync-controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .sync-status { flex:1 1 220px; min-height:20px; color:var(--muted); font-size:13px; }
  .sync-guidance { margin:-4px 0 0; color:var(--dim); font-size:12px; }
  .silent-proof { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; padding:10px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .silent-proof span { color:var(--dim); font-size:11px; letter-spacing:.04em; text-transform:uppercase; }
  .silent-proof strong { display:block; margin-top:3px; color:var(--muted); font-size:13px; font-weight:600; overflow-wrap:anywhere; }
  .silent-proof a { color:var(--evidence); text-underline-offset:3px; }
  .platform-handoff { margin:0; color:var(--muted); font-size:13px; line-height:1.5; }
  .legacy-productions { margin-top:18px; border-top:1px solid var(--line); }
  .legacy-productions > summary { display:flex; align-items:center; min-height:52px; color:var(--muted); cursor:pointer; font-weight:600; }
  .legacy-productions[open] > summary { border-bottom:1px solid var(--line); }
  .legacy-productions .production:last-child { border-bottom:0; }
  .empty-state { border:1px dashed #374352; border-radius:var(--radius); padding:28px; color:var(--muted); }
  .distribution-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(300px,.72fr); gap:20px; }
  .evidence-list { list-style:none; padding:0; margin:0; }
  .evidence-list li { display:flex; align-items:flex-start; gap:9px; padding:9px 0; border-bottom:1px solid var(--line); }
  .evidence-list li:last-child { border-bottom:0; }
  .evidence-list .mark { color:var(--risk); width:18px; }
  .evidence-list li.pass .mark { color:var(--verified); }
  .evidence-list > .evidence-group { display:block; padding:0; border:0; }
  .evidence-group + .evidence-group { margin-top:14px; }
  .evidence-group h4 { margin:0; color:var(--dim); font-size:11px; letter-spacing:.06em; text-transform:uppercase; }
  .evidence-group > .evidence-list { margin-top:5px; }
  .evidence-fix { margin-left:auto; white-space:nowrap; }
  .boundary { border:1px solid #514927; background:#18170f; color:#e7dca9; padding:12px 14px; border-radius:10px; margin-top:14px; }
  .schedule-form { display:grid; gap:12px; }
  .schedule-status { min-height:20px; color:var(--evidence); font-size:13px; }
  .tools-layout { display:grid; grid-template-columns:240px minmax(0,1fr); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; min-height:620px; }
  .tool-nav { border-right:1px solid var(--line); background:#0b0e13; padding:10px; }
  .tool-nav button { display:block; min-height:44px; width:100%; text-align:left; border:0; background:transparent; color:var(--muted); padding:8px 10px; border-radius:7px; cursor:pointer; }
  .tool-nav button:hover { color:var(--text); background:var(--surface); }
  .tool-nav button.active { color:var(--text); background:#111a19; }
  .tool-panel { display:none; padding:22px; }
  .tool-panel.active { display:block; }
  .tool-panel h3 { margin:0; font-size:17px; }
  .hint { color:var(--muted); margin:4px 0 16px; }
  .tool-panel form { display:grid; gap:11px; max-width:680px; }
  .result { margin-top:16px; }
  .result pre { background:#090c11; border:1px solid var(--line); border-radius:10px; padding:12px; overflow:auto; white-space:pre-wrap; word-break:break-word; }
  .result .meta { display:flex; gap:10px; align-items:center; margin-bottom:6px; font-size:12px; color:var(--dim); }
  .copy { min-height:44px; border:1px solid var(--line); background:transparent; color:var(--muted); border-radius:7px; padding:7px 10px; cursor:pointer; }
  .copy:hover { color:var(--text); border-color:#46515e; }
  table { border-collapse:collapse; width:100%; margin-top:10px; font-size:13px; }
  th, td { text-align:left; border-bottom:1px solid var(--line); padding:8px; vertical-align:top; }
  th { color:var(--muted); font-weight:600; }
  .loading-line { height:48px; border-bottom:1px solid var(--line); background:linear-gradient(90deg,var(--surface),var(--raised),var(--surface)); background-size:220% 100%; animation:loading 1.2s linear infinite; }
  @keyframes loading { to { background-position:-220% 0; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; } }
  @media (max-width:900px) {
    .quick-options { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .capability-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .create-grid,.distribution-grid { grid-template-columns:1fr; }
    .production { grid-template-columns:1fr; }
    .production.platform-audio-production { grid-template-columns:1fr; }
    .tools-layout { grid-template-columns:1fr; grid-template-rows:auto minmax(0,1fr); }
    .tool-nav { display:flex; align-items:center; gap:4px; overflow-x:auto; border-right:0; border-bottom:1px solid var(--line); }
    .tool-nav button { flex:0 0 auto; width:auto; white-space:nowrap; }
    .planner-body { grid-template-columns:1fr; }
    .planner-step,#planner-step-recipe,#planner-step-options { grid-column:auto; border-right:0; }
    .recipe-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .planner-terminal { grid-template-columns:1fr; }
    .lane-console-head { align-items:stretch; flex-direction:column; }
    .automation-evidence { grid-template-columns:repeat(2,minmax(0,1fr)); }
  }
  @media (max-width:600px) {
    .product-bar { align-items:flex-start; padding:12px 16px; }
    .brand-lockup p { display:none; }
    .utility-links { gap:10px; justify-content:flex-end; }
    .utility-links a { font-size:12px; }
    .primary-nav { padding:8px 10px; }
    .primary-nav button { padding:8px 9px; }
    .shell { padding:18px 14px 28px; }
    .view-head { align-items:flex-start; flex-direction:column; gap:6px; }
    .view-head h2 { font-size:21px; }
    .prompt-studio { margin:20px 0; }
    .prompt-studio textarea { min-height:150px; font-size:16px; }
    .quick-options { grid-template-columns:1fr; }
    .capability-grid { grid-template-columns:1fr; }
    .prompt-actions { align-items:stretch; flex-direction:column; }
    .prompt-actions .button-row { justify-content:stretch; }
    .field-grid { grid-template-columns:1fr; }
    label.wide,.checkline { grid-column:auto; }
    .brief-actions { align-items:flex-start; flex-direction:column; }
    .button-row { width:100%; }
    .button-row .button { flex:1; text-align:center; }
    .workflow { grid-template-columns:1fr; }
    .platform-audio-form,.sync-stage,.silent-proof { grid-template-columns:1fr; }
    .sync-stage { grid-template-areas:none; }
    .sync-controls,.sync-guidance,.sync-source,.sync-visual,.silent-proof,.platform-handoff { grid-area:auto; }
    .state { justify-self:start; }
    .stage-body,.tool-panel { padding:15px; }
    .message { max-width:94%; }
    .planner-head { align-items:flex-start; }
    .planner-body { display:block; }
    .planner-step { padding:16px 14px; }
    .choice-grid,.recipe-grid,.recipe-option-fields { grid-template-columns:1fr; }
    .recipe-card { min-height:0; }
    .planner-terminal { padding:14px; }
    .lane-ledger { grid-template-columns:1fr; }
    .lane-ledger > div { padding:12px 0; }
    .lane-ledger > div + div { padding-left:0; border-left:0; border-top:1px solid var(--line); }
    .lane-switcher { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
    .lane-switcher button { width:100%; }
    .automation-evidence { grid-template-columns:1fr; }
    table { display:block; overflow-x:auto; }
  }

</style>
</head>
<body>
<a class="skip-link" href="#workspace">Skip to workspace</a>
<header class="product-bar">
  <div class="brand-lockup">
    <span class="brand-mark" aria-hidden="true"></span>
    <div>
      <h1>Video Maker</h1>
      <p>Describe it. We’ll make it.</p>
    </div>
  </div>
  <nav class="utility-links" aria-label="Products">
    <a href="/studio" aria-current="page">Video Maker</a>
  </nav>
</header>
<nav class="primary-nav" id="content-nav" aria-label="Video Maker">
  <div role="tablist" aria-label="Video Maker views">
    <button id="tab-create" type="button" role="tab" aria-selected="true" aria-controls="view-create" data-view="create">Create</button>
    <button id="tab-productions" type="button" role="tab" aria-selected="false" aria-controls="view-productions" data-view="productions" tabindex="-1">Videos</button>
    <button id="tab-distribute" type="button" role="tab" aria-selected="false" aria-controls="view-distribute" data-view="distribute" tabindex="-1" hidden>Distribute</button>
    <button id="tab-tools" type="button" role="tab" aria-selected="false" aria-controls="view-tools" data-view="tools" tabindex="-1" hidden>Tools</button>
  </div>
</nav>
<main class="shell" id="workspace" tabindex="-1">
  <section class="view" id="view-create" role="tabpanel" aria-labelledby="tab-create">
    <div class="view-head">
      <div>
        <h2>Describe the video.</h2>
        <p>Say what happens, how it should feel, and what the viewer should understand.</p>
      </div>
      <span class="count-note" id="brief-count" hidden>Loading briefs…</span>
    </div>
    <section class="prompt-studio" aria-labelledby="prompt-title">
      <form class="composer" id="composer">
        <label for="request" id="prompt-title">What should we make?</label>
        <textarea id="request" required placeholder="A 30-second cinematic video about a lonely astronaut finding a garden on Mars."></textarea>
        <details class="quick-settings">
          <summary>Settings <span>Optional</span></summary>
        <div class="quick-options" aria-label="Optional video settings">
          <label>Video type
            <select id="quick-kind">
              <option value="">Auto</option>
              <option value="faceless">Faceless lesson</option>
              <option value="brand-reel">Brand reel</option>
              <option value="guided-app-demo">Guided app demo</option>
              <option value="coherent-film">Coherent film</option>
              <option value="lyric-video">Lyric video</option>
            </select>
          </label>
          <label>Duration
            <select id="quick-duration"><option value="">Auto</option><option value="15">15 seconds</option><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option></select>
          </label>
        </div>
        </details>
        <div class="prompt-actions">
          <span class="auto-note">Everything else is chosen automatically.</span>
          <div class="button-row">
            <button class="button" type="button" id="new-brief-button">Clear</button>
            <button class="button primary" type="submit" id="compose-button">Make video</button>
          </div>
        </div>
        <div class="feedback prompt-feedback" id="compose-feedback" aria-live="polite"></div>
      </form>
    </section>
    <details class="advanced-studio manual-planner" id="manual-planner" hidden>
      <summary>Choose the production path manually</summary>
    <section class="planner stage" id="production-planner" aria-labelledby="planner-title">
      <div class="stage-head planner-head">
        <div>
          <h3 id="planner-title">Production planner</h3>
          <p>Project → idea → video recipe → options. Changing an earlier choice clears incompatible later choices.</p>
        </div>
        <span class="state" id="planner-state">Select a project</span>
      </div>
      <div class="planner-body">
        <section class="planner-step" id="planner-step-project" aria-labelledby="planner-project-title">
          <div class="step-heading"><span class="step-number">1</span><div><h3 id="planner-project-title" tabindex="-1">Project</h3><p>Choose the Fleet product this video serves.</p></div></div>
          <div class="choice-grid project-choices" id="planner-projects"><div class="loading-line"></div></div>
        </section>
        <section class="planner-step is-locked" id="planner-step-idea" aria-labelledby="planner-idea-title" aria-disabled="true">
          <div class="step-heading"><span class="step-number">2</span><div><h3 id="planner-idea-title" tabindex="-1">Idea</h3><p>Select saved intent or add a project-specific idea.</p></div></div>
          <div class="choice-grid idea-choices" id="planner-ideas"><div class="empty-state">Choose a project first.</div></div>
          <details class="inline-create">
            <summary>Add an idea</summary>
            <form id="planner-idea-form" class="field-grid">
              <label>Idea title<input id="planner-idea-name" required placeholder="What is the video about?"></label>
              <label>Opening hook<input id="planner-idea-hook" placeholder="Optional opening promise"></label>
              <label class="wide">Angle or notes<textarea id="planner-idea-angle" placeholder="Optional point of view or evidence to include"></textarea></label>
              <div class="button-row wide"><button class="button" type="submit" id="planner-add-idea">Save idea</button></div>
            </form>
          </details>
        </section>
        <section class="planner-step is-locked" id="planner-step-recipe" aria-labelledby="planner-recipe-title" aria-disabled="true">
          <div class="step-heading"><span class="step-number">3</span><div><h3 id="planner-recipe-title" tabindex="-1">Video recipe</h3><p>Compare the actual engine, owner, spend posture, and blockers.</p></div></div>
          <div id="planner-recipes"><div class="empty-state">Choose an idea first.</div></div>
        </section>
        <section class="planner-step is-locked" id="planner-step-options" aria-labelledby="planner-options-title" aria-disabled="true">
          <div class="step-heading"><span class="step-number">4</span><div><h3 id="planner-options-title" tabindex="-1">Options</h3><p>Set bounded production choices; execution still requires a separate action.</p></div></div>
          <form id="planner-options" class="field-grid">
            <label>Channel<select id="planner-channel"><option value="youtube_shorts">YouTube Shorts</option><option value="instagram_reels">Instagram Reels</option></select></label>
            <label>Duration (seconds)<input id="planner-duration" type="number" min="5" max="90" value="30"></label>
            <label>Quality tier<select id="planner-quality"><option value="draft">Draft</option><option value="standard">Standard</option><option value="high">High</option></select></label>
            <label>Variants<input id="planner-variants" type="number" min="1" max="6" value="1"></label>
            <div class="recipe-option-fields wide" id="planner-recipe-options"></div>
            <details class="evidence-options wide">
              <summary>Source and rights inputs</summary>
              <div class="field-grid">
                <label>Canonical source URL<input id="planner-source-url" type="url" placeholder="https://…"></label>
                <label>Destination URL<input id="planner-destination-url" type="url" placeholder="https://…"></label>
                <label class="wide">Source-backed claim<textarea id="planner-claim" placeholder="Exact claim the video may make"></textarea></label>
                <label>Source rights<select id="planner-rights"><option value="unknown">Not reviewed</option><option value="approved">Approved / owned</option><option value="rejected">Rejected</option></select></label>
              </div>
            </details>
          </form>
        </section>
      </div>
      <div class="planner-terminal">
        <div><strong id="planner-summary">Select a project to begin.</strong><p id="planner-blocker">Nothing renders when a selection is saved.</p></div>
        <div class="button-row">
          <button class="button primary" type="button" id="planner-save" disabled>Save production plan</button>
          <button class="button" type="button" id="planner-edit" disabled>Edit</button>
          <button class="button" type="button" id="planner-build" disabled>Build preview</button>
          <button class="button" type="button" id="planner-preview" disabled>Preview</button>
          <button class="button" type="button" id="planner-post" disabled>Prepare in Postiz</button>
        </div>
        <div class="feedback" id="planner-feedback" aria-live="polite"></div>
      </div>
    </section>
    </details>
    <details class="advanced-studio" id="advanced-brief" hidden>
      <summary>Advanced production details</summary>
      <p>Review the generated brief or refine evidence, rights, lyric timing, and distribution fields.</p>
    <div class="create-grid">
      <div>
        <section class="stage" aria-labelledby="conversation-title">
          <div class="stage-head">
            <h3 id="conversation-title">Conversation</h3>
            <p>Ask for a lesson, product reel, app demo, coherent film, podcast short, or lyric video.</p>
          </div>
          <div class="stage-body">
            <div class="conversation" id="conversation" role="list" aria-label="Brief conversation" aria-live="polite">
              <div class="message empty" role="listitem">Your production conversation will appear here.</div>
            </div>
          </div>
        </section>
        <section class="stage" aria-labelledby="workflow-title">
          <div class="stage-head">
            <h3 id="workflow-title">Video workflows</h3>
            <p>Every path names its real runtime and prerequisites.</p>
          </div>
          <div class="workflow-list" id="workflow-list">
            <div class="loading-line"></div><div class="loading-line"></div><div class="loading-line"></div>
          </div>
        </section>
      </div>
      <section class="stage" aria-labelledby="brief-title">
        <div class="stage-head">
          <h3 id="brief-title">Production brief</h3>
          <p id="brief-subtitle">Create or select a brief to edit its normalized production state.</p>
        </div>
        <div class="stage-body">
          <form id="brief-form">
            <details class="brief-group" open>
              <summary>Basics</summary>
              <div class="field-grid">
                <label>Video kind
                  <select id="brief-kind">
                    <option value="faceless">Faceless lesson</option>
                    <option value="brand-reel">Brand reel</option>
                    <option value="guided-app-demo">Guided app demo</option>
                    <option value="coherent-film">Coherent film</option>
                    <option value="podcast-short">Podcast short</option>
                    <option value="lyric-video">Literal lyric video</option>
                  </select>
                </label>
                <label>Fleet brand
                  <select id="brief-project"><option value="">Choose a brand</option></select>
                </label>
                <label>Channel
                  <select id="brief-channel">
                    <option value="youtube_shorts">YouTube Shorts</option>
                    <option value="instagram_reels">Instagram Reels</option>
                  </select>
                </label>
                <label>Duration
                  <input id="brief-duration" type="number" min="5" max="1200" value="60">
                </label>
                <label>Render engine
                  <select id="brief-engine">
                    <option value="mock">Mock proof</option>
                    <option value="kokoro">Kokoro local</option>
                    <option value="lyric-canvas">Lyric canvas</option>
                    <option value="blender">Blender literal scenes</option>
                    <option value="html-composition">HTML / Canvas composition</option>
                    <option value="ascii">ASCII animation</option>
                    <option value="grok-video">Approved Grok asset</option>
                    <option value="brand-reel">Brand Reel handoff</option>
                    <option value="forge">Forge</option>
                    <option value="ltx">Forge local model</option>
                    <option value="editorial">Editorial</option>
                    <option value="threejs">Three.js Visual Lab</option>
                  </select>
                </label>
                <label>Title
                  <input id="brief-name" placeholder="Video title">
                </label>
              </div>
            </details>
            <details class="brief-group" id="lyric-fields" hidden>
              <summary>Music and lyrics</summary>
              <div class="field-grid">
                <label>Approved local audio path
                  <input id="lyric-audio-path" placeholder="./artifacts/song-original.wav">
                </label>
                <label>Timed lyrics
                  <textarea id="lyric-timed-text" rows="7" placeholder="[00:00.00]First exact lyric line&#10;[00:03.00]Second exact lyric line"></textarea>
                </label>
                <label>Timed lyric format
                  <select id="lyric-format">
                    <option value="lrc">LRC</option>
                    <option value="srt">SRT</option>
                  </select>
                </label>
                <label>Composition and lyric rights
                  <select id="lyric-composition-rights">
                    <option value="unknown">Not established</option>
                    <option value="owned">Owned</option>
                    <option value="licensed">Licensed</option>
                    <option value="public-domain">Public domain</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <label>Master-recording rights
                  <select id="lyric-master-rights">
                    <option value="unknown">Not established</option>
                    <option value="owned">Owned</option>
                    <option value="licensed">Licensed</option>
                    <option value="original-recording">Original recording</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <label>Rights evidence
                  <textarea id="lyric-rights-evidence" placeholder="Licence record, ownership note, or public-domain basis. Attribution alone is not permission."></textarea>
                </label>
                <label>Rights evidence URL
                  <input id="lyric-rights-url" type="url" placeholder="https://…">
                </label>
                <label>Attribution
                  <textarea id="lyric-attribution" placeholder="Songwriters, composition, performer or recording source, and required licence credit"></textarea>
                </label>
                <label>Literal art direction
                  <select id="lyric-visual-style">
                    <option value="literal-cinematic">Literal cinematic</option>
                    <option value="kinetic-type">Kinetic type</option>
                  </select>
                </label>
                <label class="checkline"><input id="lyric-reduced-motion" type="checkbox"> Use reduced motion</label>
              </div>
              <div class="boundary" id="blender-readiness">Checking Blender 5.2 readiness…</div>
              <p class="hint">Studio never fetches lyrics. Supply exact timed text and separately cleared composition and recording rights.</p>
            </details>
            <details class="brief-group">
              <summary>Story and creative direction</summary>
              <div class="field-grid">
                <label>Hook
                  <textarea id="brief-hook" placeholder="The opening promise or tension"></textarea>
                </label>
                <label>Summary / script intent
                  <textarea id="brief-summary" placeholder="What the video must communicate"></textarea>
                </label>
                <label>Creative direction
                  <textarea id="brief-direction" placeholder="Visual rhythm, evidence, presenter, atmosphere"></textarea>
                </label>
                <label>Call to action
                  <input id="brief-cta" placeholder="What should the viewer do?">
                </label>
              </div>
            </details>
            <details class="brief-group">
              <summary>Evidence and distribution</summary>
              <div class="field-grid">
                <label>Source rights
                  <select id="brief-rights">
                    <option value="unknown">Not reviewed</option>
                    <option value="approved">Approved / owned</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <label>Canonical source URL
                  <input id="brief-source-url" type="url" placeholder="https://…">
                </label>
                <label>Source-backed claim
                  <textarea id="brief-claim" placeholder="The exact claim this video is allowed to make"></textarea>
                </label>
                <label>Destination URL
                  <input id="brief-destination" type="url" placeholder="https://…">
                </label>
                <label>Stable public video URL
                  <input id="brief-public-url" type="url" placeholder="Required only for Postiz draft handoff">
                </label>
                <label class="checkline"><input id="brief-creative-approved" type="checkbox"> Creative is explicitly approved for distribution</label>
                <label class="checkline"><input id="brief-quality-accepted" type="checkbox"> Accept current quality evidence for distribution</label>
              </div>
            </details>
            <div class="brief-actions">
              <span class="brief-state" id="brief-state">No brief selected</span>
              <div class="button-row">
                <button class="button" type="submit" id="save-brief-button" disabled>Save brief</button>
                <button class="button primary" type="button" id="execute-button" disabled>Create video</button>
              </div>
            </div>
            <div class="feedback" id="brief-feedback" aria-live="polite"></div>
          </form>
        </div>
      </section>
    </div>
    </details>
  </section>

  <section class="view" id="view-productions" role="tabpanel" aria-labelledby="tab-productions" hidden>
    <div class="view-head">
      <div>
        <h2>Productions</h2>
        <p>Saved intent, render evidence, quality state, and the authoritative next decision.</p>
      </div>
      <button class="button" type="button" id="refresh-productions">Refresh</button>
    </div>
    <section class="lane-console" aria-labelledby="lane-console-title">
      <div class="lane-console-head">
        <div><h3 id="lane-console-title">Content lanes</h3><p>One production queue, separated by who initiated the work. Automation status is read-only here.</p></div>
        <div class="lane-switcher" role="group" aria-label="Filter productions by content lane">
          <button type="button" data-production-lane="all" aria-pressed="true">All</button>
          <button type="button" data-production-lane="project-automation" aria-pressed="false">Project Autopilot</button>
          <button type="button" data-production-lane="operator-request" aria-pressed="false">Ask Me</button>
          <button type="button" data-production-lane="personal-automation" aria-pressed="false">Personal Automations</button>
        </div>
      </div>
      <div class="lane-ledger" id="lane-ledger" aria-live="polite"><div><strong>Loading lane status…</strong></div></div>
      <div id="automation-note"></div>
    </section>
    <div id="production-list"><div class="loading-line"></div><div class="loading-line"></div></div>
  </section>

  <section class="view" id="view-distribute" role="tabpanel" aria-labelledby="tab-distribute" hidden>
    <div class="view-head">
      <div>
        <h2>Prepare and schedule</h2>
        <p>Create an unscheduled draft or choose a future publish time. Postiz remains the credential, publication-state, calendar, and analytics owner.</p>
      </div>
      <span class="state" id="postiz-state">Checking Postiz</span>
    </div>
    <div class="distribution-grid">
      <section class="stage">
        <div class="stage-head">
          <h3>Distribution evidence</h3>
          <p>Every item must be explicit before a network request is possible.</p>
        </div>
        <div class="stage-body">
          <label>Production
            <select id="distribution-brief"><option value="">Choose a production</option></select>
          </label>
          <p class="hint" id="evidence-progress">Choose a production to inspect its handoff evidence.</p>
          <ul class="evidence-list" id="evidence-list"></ul>
          <div class="button-row" style="margin-top:16px">
            <button class="button" type="button" id="prepare-button" disabled>Prepare handoff</button>
            <button class="button" type="button" id="draft-button" disabled>Create Postiz draft</button>
          </div>
          <div class="feedback" id="distribution-feedback" aria-live="polite"></div>
        </div>
      </section>
      <section class="stage">
        <div class="stage-head">
          <h3>Schedule in Postiz</h3>
          <p>Choose device-local time; Studio sends Postiz the exact UTC timestamp.</p>
        </div>
        <div class="stage-body">
          <div class="schedule-form">
            <label for="schedule-time">Publish date and time
              <input id="schedule-time" type="datetime-local">
            </label>
            <p id="schedule-timezone" class="hint"></p>
            <p id="schedule-status" class="schedule-status" aria-live="polite"></p>
            <p id="postiz-boundary" class="hint">Loading the configured distribution boundary…</p>
            <div class="boundary">Scheduling creates a Postiz queue item. It does not mean YouTube or Instagram has published the video yet.</div>
          </div>
          <div class="button-row" style="margin-top:16px">
            <button class="button primary" id="schedule-button" type="button" disabled>Schedule in Postiz</button>
            <a class="button" id="open-postiz" href="#" target="_blank" rel="noreferrer" aria-disabled="true">Open Postiz</a>
          </div>
        </div>
      </section>
    </div>
  </section>

  <section class="view" id="view-tools" role="tabpanel" aria-labelledby="tab-tools" hidden>
    <div class="view-head">
      <div>
        <h2>Advanced tools</h2>
        <p>The original Studio workbench remains available for individual ideation, metadata, scripting, factory, and artifact operations.</p>
      </div>
    </div>
    <div class="tools-layout">
      <nav class="tool-nav" id="tool-nav" aria-label="Studio tools"></nav>
      <div id="tool-panels"></div>
    </div>
  </section>
</main>
<script>
const TOOLS = ${JSON.stringify(TOOLS)};
const BRANDS = ${JSON.stringify(BRANDS)};
let briefs = [];
let activeBrief = null;
let capabilities = [];
let blenderReadiness = null;
let postizReadiness = null;
let showAllWorkflows = false;
let briefDirty = false;
let plannerData = { projects:[], ideas:[], recipes:[] };
let plannerSelection = { projectSlug:null, ideaId:null, recipeId:null };
let plannerReady = false;
let plannerOptionsDirty = false;
let productionData = { briefs:[], legacyRenders:[] };
let autopilotStatus = null;
let automationPolicies = [];
let activeProductionLane = 'all';
const platformPreviewPlayers = new Map();
let youtubeApiPromise = null;
let spotifyApiPromise = null;

const viewButtons = Array.from(document.querySelectorAll('[data-view]:not([hidden])'));
const toolShortcutButtons = Array.from(document.querySelectorAll('[data-tool-shortcut]'));
for (const button of viewButtons) {
  button.addEventListener('click', () => {
    activateView(button.dataset.view);
  });
  button.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = viewButtons.indexOf(button);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? viewButtons.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + viewButtons.length) % viewButtons.length;
    activateView(viewButtons[nextIndex].dataset.view);
    viewButtons[nextIndex].focus();
  });
}
for (const button of toolShortcutButtons) {
  button.addEventListener('click', () => {
    activateView('tools');
    activateTool(button.dataset.toolShortcut);
  });
}

document.getElementById('open-postiz').addEventListener('click', (event) => {
  if (event.currentTarget.getAttribute('aria-disabled') === 'true') event.preventDefault();
});
for (const button of document.querySelectorAll('[data-production-lane]')) {
  button.addEventListener('click', () => {
    activeProductionLane = button.dataset.productionLane;
    for (const option of document.querySelectorAll('[data-production-lane]')) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    renderLaneConsole();
    renderProductionList();
  });
}

function activateView(id) {
  for (const button of viewButtons) {
    const selected = button.dataset.view === id;
    button.setAttribute('aria-selected', selected ? 'true' : 'false');
    button.tabIndex = selected ? 0 : -1;
  }
  if (id !== 'tools') {
    for (const button of toolShortcutButtons) button.classList.remove('active');
  }
  for (const view of document.querySelectorAll('.view')) view.hidden = view.id !== 'view-' + id;
  if (id === 'productions') loadProductions();
  if (id === 'distribute') renderDistribution();
}

for (const brand of BRANDS) {
  const option = document.createElement('option');
  option.value = brand.slug;
  option.textContent = brand.name;
  document.getElementById('brief-project').appendChild(option);
}

document.getElementById('quick-kind').addEventListener('change', renderQuickKindSelection);

function renderQuickKindSelection() {
  const selected = value('quick-kind');
  for (const choice of document.querySelectorAll('[data-quick-kind]')) {
    choice.setAttribute('aria-pressed', String(choice.dataset.quickKind === selected));
  }
}

async function loadProductionPlanner(projectSlug) {
  const suffix = projectSlug ? '?projectSlug=' + encodeURIComponent(projectSlug) : '';
  plannerData = await api('/studio/production-planner' + suffix);
  plannerReady = true;
  renderPlanner();
  return plannerData;
}

function renderPlanner() {
  renderPlannerProjects();
  renderPlannerIdeas();
  renderPlannerRecipes();
  setPlannerStep('idea', Boolean(plannerSelection.projectSlug));
  setPlannerStep('recipe', Boolean(plannerSelection.ideaId));
  setPlannerStep('options', Boolean(plannerSelection.recipeId));
  renderPlannerTerminal();
}

function setPlannerStep(id, enabled) {
  const step = document.getElementById('planner-step-' + id);
  step.classList.toggle('is-locked', !enabled);
  step.setAttribute('aria-disabled', enabled ? 'false' : 'true');
  step.inert = !enabled;
}

function focusPlannerStep(id) {
  window.setTimeout(() => document.getElementById('planner-' + id + '-title')?.focus(), 0);
}

function renderPlannerProjects() {
  const box = document.getElementById('planner-projects');
  if (!plannerData.projects.length) {
    box.innerHTML = '<div class="empty-state">No Fleet projects are configured.</div>';
    return;
  }
  box.innerHTML = '<label>Fleet project<select id="planner-project-select"><option value="">Choose a project</option>' + plannerData.projects.map((project) =>
    '<option value="' + escapeText(project.slug) + '"' + (plannerSelection.projectSlug === project.slug ? ' selected' : '') + '>' + escapeText(project.name) + ' · ' + escapeText(project.domain) + '</option>').join('') + '</select></label>';
  document.getElementById('planner-project-select').addEventListener('change', (event) => {
    if (event.target.value) choosePlannerProject(event.target.value);
  });
}

async function choosePlannerProject(projectSlug) {
  if (plannerSelection.projectSlug === projectSlug) return;
  plannerSelection = { projectSlug, ideaId:null, recipeId:null };
  plannerOptionsDirty = true;
  setFeedback('planner-feedback', 'Loading ideas for the selected project…');
  try {
    await loadProductionPlanner(projectSlug);
    setFeedback('planner-feedback', 'Project selected. Choose or add an idea.', 'success');
    focusPlannerStep('idea');
  } catch (error) {
    setFeedback('planner-feedback', error.message, 'error');
  }
}

function renderPlannerIdeas() {
  const box = document.getElementById('planner-ideas');
  if (!plannerSelection.projectSlug) {
    box.innerHTML = '<div class="empty-state">Choose a project first.</div>';
    return;
  }
  if (!plannerData.ideas.length) {
    box.innerHTML = '<div class="empty-state">No ideas for this project yet. Add the first one below.</div>';
    return;
  }
  const selected = plannerData.ideas.find((idea) => idea.id === plannerSelection.ideaId);
  const visible = [selected, ...plannerData.ideas].filter((idea, index, list) => idea && list.findIndex((entry) => entry.id === idea.id) === index).slice(0, 4);
  const remaining = plannerData.ideas.filter((idea) => !visible.some((entry) => entry.id === idea.id));
  box.innerHTML = visible.map(renderPlannerIdeaCard).join('') + (remaining.length
    ? '<details class="all-recipes" style="grid-column:1/-1"><summary>All saved ideas · ' + escapeText(String(plannerData.ideas.length)) + '</summary><div class="choice-grid">' + remaining.map(renderPlannerIdeaCard).join('') + '</div></details>'
    : '');
  for (const button of box.querySelectorAll('[data-planner-idea]')) button.addEventListener('click', () => {
    plannerSelection.ideaId = button.dataset.plannerIdea;
    plannerSelection.recipeId = null;
    plannerOptionsDirty = true;
    renderPlanner();
    setFeedback('planner-feedback', 'Idea selected. Compare the available video recipes.', 'success');
    focusPlannerStep('recipe');
  });
}

function renderPlannerIdeaCard(idea) {
  return '<button class="choice-card" type="button" data-planner-idea="' + escapeText(idea.id) + '" aria-pressed="' +
    (plannerSelection.ideaId === idea.id ? 'true' : 'false') + '">' +
    '<strong>' + escapeText(idea.title) + '</strong><span>' + escapeText(idea.hook || idea.angle || 'No hook yet') + '</span>' +
    '<span class="mini-state">' + escapeText(idea.status || 'new') + '</span></button>';
}

function renderPlannerRecipes() {
  const box = document.getElementById('planner-recipes');
  if (!plannerSelection.ideaId) {
    box.innerHTML = '<div class="empty-state">Choose an idea first.</div>';
    return;
  }
  const priority = ['image-slideshow', 'web-motion', 'ascii-story', 'product-proof'];
  const selected = selectedPlannerRecipe();
  const recommended = [selected, ...priority.map((id) => plannerData.recipes.find((recipe) => recipe.id === id))]
    .filter((recipe, index, list) => recipe && list.findIndex((entry) => entry.id === recipe.id) === index)
    .slice(0, 4);
  const remaining = plannerData.recipes.filter((recipe) => !recommended.some((entry) => entry.id === recipe.id));
  box.innerHTML = '<section class="recommended-recipes"><h4>Common starting points</h4><div class="recipe-grid">' + recommended.map(renderPlannerRecipeCard).join('') + '</div></section>' +
    '<details class="all-recipes"><summary>All video recipes · ' + escapeText(String(plannerData.recipes.length)) + '</summary>' + renderPlannerRecipeGroups(remaining) + '</details>';
  for (const button of box.querySelectorAll('[data-planner-recipe]')) button.addEventListener('click', () => choosePlannerRecipe(button.dataset.plannerRecipe));
}

function renderPlannerRecipeGroups(recipes) {
  const groups = new Map();
  for (const recipe of recipes) {
    if (!groups.has(recipe.group)) groups.set(recipe.group, []);
    groups.get(recipe.group).push(recipe);
  }
  return Array.from(groups.entries()).map(([group, entries]) =>
    '<section class="recipe-group"><h4>' + escapeText(group) + '</h4><div class="recipe-grid">' + entries.map(renderPlannerRecipeCard).join('') + '</div></section>').join('');
}

function renderPlannerRecipeCard(recipe) {
  const readiness = recipe.readiness.state.replaceAll('-', ' ');
  return '<button class="recipe-card" type="button" data-planner-recipe="' + escapeText(recipe.id) + '" aria-pressed="' +
    (plannerSelection.recipeId === recipe.id ? 'true' : 'false') + '">' +
    '<span class="recipe-card-head"><strong>' + escapeText(recipe.name) + '</strong><span class="state ' + escapeText(recipe.readiness.state) + '">' + escapeText(readiness) + '</span></span>' +
    '<p>' + escapeText(recipe.description) + '</p>' +
    (recipe.readiness.blocker ? '<p class="recipe-blocker">' + escapeText(recipe.readiness.blocker) + '</p>' : '') +
    '<span class="recipe-meta"><span>' + escapeText(recipe.outputStyle) + '</span><span>' + escapeText(recipe.spend.label) + '</span><span>' + escapeText(recipe.owner) + '</span><span>' + escapeText(recipe.runtime) + '</span></span></button>';
}

function choosePlannerRecipe(recipeId) {
  plannerSelection.recipeId = recipeId;
  plannerOptionsDirty = true;
  const recipe = selectedPlannerRecipe();
  setValue('planner-channel', recipe.defaults.channel);
  setValue('planner-duration', recipe.defaults.durationSeconds);
  setValue('planner-quality', recipe.defaults.qualityTier);
  setValue('planner-variants', recipe.defaults.variantCount);
  renderRecipeOptionFields(recipe, Object.fromEntries(recipe.options.map((option) => [option.id, option.default])));
  renderPlanner();
  setFeedback('planner-feedback', recipe.readiness.blocker || 'Recipe selected. Review the bounded options, then save the plan.', recipe.readiness.ready ? 'success' : '');
  focusPlannerStep('options');
}

function renderRecipeOptionFields(recipe, values) {
  const box = document.getElementById('planner-recipe-options');
  if (!recipe) { box.innerHTML = ''; return; }
  box.innerHTML = recipe.options.map((option) => {
    const selected = values?.[option.id] ?? option.default;
    if (option.type === 'select') {
      return '<label>' + escapeText(option.label) + '<select data-recipe-option="' + escapeText(option.id) + '">' + option.choices.map((choice) =>
        '<option value="' + escapeText(choice) + '"' + (choice === selected ? ' selected' : '') + '>' + escapeText(choice.replaceAll('-', ' ')) + '</option>').join('') + '</select></label>';
    }
    if (option.type === 'boolean') {
      return '<label class="checkline"><input data-recipe-option="' + escapeText(option.id) + '" type="checkbox"' + (selected ? ' checked' : '') + '> ' + escapeText(option.label) + '</label>';
    }
    return '<label>' + escapeText(option.label) + '<input data-recipe-option="' + escapeText(option.id) + '" value="' + escapeText(selected || '') + '" placeholder="' + escapeText(option.placeholder || '') + '"></label>';
  }).join('');
}

function selectedPlannerRecipe() {
  return plannerData.recipes.find((recipe) => recipe.id === plannerSelection.recipeId) ?? null;
}

function collectPlannerOptions() {
  const values = {};
  for (const input of document.querySelectorAll('[data-recipe-option]')) {
    values[input.dataset.recipeOption] = input.type === 'checkbox' ? input.checked : input.value;
  }
  return {
    channel:value('planner-channel'),
    durationSeconds:Number(value('planner-duration')),
    qualityTier:value('planner-quality'),
    variantCount:Number(value('planner-variants')),
    values,
  };
}

function plannerBrief() {
  if (plannerOptionsDirty) return null;
  if (!activeBrief?.recipeId) return null;
  if (activeBrief.projectSlug !== plannerSelection.projectSlug) return null;
  if (activeBrief.ideaId !== plannerSelection.ideaId) return null;
  if (activeBrief.recipeId !== plannerSelection.recipeId) return null;
  return activeBrief;
}

function renderPlannerTerminal() {
  const state = document.getElementById('planner-state');
  const summary = document.getElementById('planner-summary');
  const blocker = document.getElementById('planner-blocker');
  const save = document.getElementById('planner-save');
  const edit = document.getElementById('planner-edit');
  const build = document.getElementById('planner-build');
  const preview = document.getElementById('planner-preview');
  const post = document.getElementById('planner-post');
  const brief = plannerBrief();
  const recipe = selectedPlannerRecipe();
  for (const button of [save, edit, build, preview, post]) button.classList.remove('primary');
  save.disabled = !recipe;
  save.hidden = Boolean(brief);
  edit.hidden = !brief;
  build.hidden = !brief;
  preview.hidden = !brief;
  post.hidden = !brief;
  edit.disabled = false;
  setPlannerActionState(build, brief?.actions?.build);
  setPlannerActionState(preview, brief?.actions?.preview);
  setPlannerActionState(post, brief?.actions?.post);
  build.textContent = brief?.actions?.build?.label || 'Build preview';
  if (!brief) save.classList.add('primary');
  else if (brief.actions.post.enabled) post.classList.add('primary');
  else if (brief.actions.preview.enabled) preview.classList.add('primary');
  else if (brief.actions.build.enabled) build.classList.add('primary');
  if (!plannerSelection.projectSlug) {
    state.textContent = 'Select a project'; summary.textContent = 'Select a project to begin.'; blocker.textContent = 'Nothing renders when a selection is saved.';
  } else if (!plannerSelection.ideaId) {
    state.textContent = 'Select an idea'; summary.textContent = 'Project selected.'; blocker.textContent = 'Choose or add an idea for this project.';
  } else if (!recipe) {
    state.textContent = 'Select a recipe'; summary.textContent = 'Project and idea selected.'; blocker.textContent = 'Compare output, spend, runtime, and readiness before choosing.';
  } else if (!brief) {
    state.textContent = 'Ready to save'; summary.textContent = recipe.name + ' · ' + recipe.spend.label + ' · ' + recipe.owner;
    blocker.textContent = recipe.readiness.blocker || 'Saving creates a planned brief; it does not run the recipe.';
  } else {
    state.textContent = brief.lifecycle.replaceAll('-', ' '); summary.textContent = recipe.name + ' saved as revision ' + brief.revision + '.';
    blocker.textContent = brief.actions.build.blocker || brief.actions.preview.blocker || brief.actions.post.blocker || 'All terminal actions are ready.';
  }
  state.className = 'state' + (brief ? ' ' + brief.lifecycle : recipe ? ' ' + recipe.readiness.state : '');
}

function setPlannerActionState(button, action) {
  button.disabled = !action?.enabled;
  button.title = action?.enabled ? '' : action?.blocker || 'This action is not available yet.';
  const label = action?.label || button.textContent;
  button.setAttribute('aria-label', action?.enabled ? label : label + ': ' + (action?.blocker || 'not available yet'));
}

async function savePlannerPlan() {
  const recipe = selectedPlannerRecipe();
  if (!recipe) return;
  setBusy('planner-save', true, 'Saving plan…');
  setFeedback('planner-feedback', 'Saving normalized selections. No renderer will run.');
  try {
    activeBrief = await api('/studio/production-plans', {
      method:'POST',
      body:JSON.stringify({
        ...plannerSelection,
        options:collectPlannerOptions(),
        evidence:{
          canonicalUrl:value('planner-source-url') || null,
          destinationUrl:value('planner-destination-url') || null,
          claim:value('planner-claim') || null,
          rightsStatus:value('planner-rights'),
        },
      }),
    });
    plannerOptionsDirty = false;
    await loadBriefs(activeBrief.id);
    renderPlannerTerminal();
    setFeedback('planner-feedback', 'Production plan saved. Choose Edit, build or continuation, Preview, or Prepare in Postiz as evidence permits.', 'success');
  } catch (error) {
    setFeedback('planner-feedback', error.message, 'error');
  } finally {
    setBusy('planner-save', false, 'Save production plan');
    renderPlannerTerminal();
  }
}

async function restorePlannerFromBrief(brief) {
  if (!plannerReady || !brief?.recipeId) return;
  plannerSelection = { projectSlug:brief.projectSlug, ideaId:brief.ideaId, recipeId:brief.recipeId };
  if (!plannerData.ideas.some((idea) => idea.id === brief.ideaId)) await loadProductionPlanner(brief.projectSlug);
  setValue('planner-channel', brief.recipeOptions?.channel || brief.channel);
  setValue('planner-duration', brief.recipeOptions?.durationSeconds || brief.durationSeconds);
  setValue('planner-quality', brief.recipeOptions?.qualityTier || 'standard');
  setValue('planner-variants', brief.recipeOptions?.variantCount || 1);
  setValue('planner-source-url', brief.sourceEvidence?.canonicalUrl || '');
  setValue('planner-destination-url', brief.sourceEvidence?.destinationUrl || '');
  setValue('planner-claim', brief.sourceEvidence?.claim || '');
  setValue('planner-rights', brief.sourceEvidence?.rightsStatus || 'unknown');
  renderRecipeOptionFields(selectedPlannerRecipe(), brief.recipeOptions?.values || {});
  plannerOptionsDirty = false;
  renderPlanner();
}

document.getElementById('planner-idea-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!plannerSelection.projectSlug) return;
  setBusy('planner-add-idea', true, 'Saving…');
  try {
    const idea = await api('/studio/project-ideas', {
      method:'POST',
      body:JSON.stringify({ projectSlug:plannerSelection.projectSlug, title:value('planner-idea-name'), hook:value('planner-idea-hook'), angle:value('planner-idea-angle') }),
    });
    plannerSelection.ideaId = idea.id;
    plannerSelection.recipeId = null;
    plannerOptionsDirty = true;
    await loadProductionPlanner(plannerSelection.projectSlug);
    event.currentTarget.reset();
    event.currentTarget.closest('details').open = false;
    setFeedback('planner-feedback', 'Idea saved and selected. Choose a video recipe.', 'success');
    focusPlannerStep('recipe');
  } catch (error) {
    setFeedback('planner-feedback', error.message, 'error');
  } finally {
    setBusy('planner-add-idea', false, 'Save idea');
  }
});

document.getElementById('planner-save').addEventListener('click', savePlannerPlan);
document.getElementById('planner-options').addEventListener('input', () => { plannerOptionsDirty = true; renderPlannerTerminal(); });
document.getElementById('planner-options').addEventListener('change', () => { plannerOptionsDirty = true; renderPlannerTerminal(); });
document.getElementById('planner-edit').addEventListener('click', () => {
  const details = document.getElementById('advanced-brief');
  details.open = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  details.scrollIntoView({ behavior:reducedMotion ? 'auto' : 'smooth', block:'start' });
});
document.getElementById('planner-build').addEventListener('click', async () => {
  const brief = plannerBrief();
  const action = brief?.actions?.build;
  if (!action?.enabled) return;
  if (action.kind === 'continue') { window.location.href = action.href; return; }
  setBusy('planner-build', true, 'Building…');
  setFeedback('planner-feedback', 'Building the explicit preview. No distribution action will run.');
  try {
    const result = await api(action.endpoint, { method:'POST', body:JSON.stringify({ confirm:true }) });
    activeBrief = result.brief;
    await loadBriefs(activeBrief.id);
    await restorePlannerFromBrief(activeBrief);
    setFeedback('planner-feedback', 'Preview built. Open Productions to review the real artifact.', 'success');
  } catch (error) {
    setFeedback('planner-feedback', error.message, 'error');
  } finally {
    renderPlannerTerminal();
  }
});
document.getElementById('planner-preview').addEventListener('click', () => { activateView('productions'); });
document.getElementById('planner-post').addEventListener('click', () => {
  const brief = plannerBrief();
  if (!brief) return;
  activateView('distribute');
  document.getElementById('distribution-brief').value = brief.id;
  renderDistribution();
});

document.getElementById('composer').addEventListener('submit', async (event) => {
  event.preventDefault();
  const requestInput = document.getElementById('request');
  const request = requestInput.value.trim();
  if (!request) return;
  const refining = Boolean(activeBrief);
  setBusy('compose-button', true, refining ? 'Refining brief…' : 'Creating brief…');
  setFeedback(
    'compose-feedback',
    refining
      ? 'Applying that follow-up to safe, editable production fields…'
      : 'Turning your request into editable production state…',
  );
  try {
    const fields = quickCreateFields();
    if (refining) {
      if (briefDirty) await saveBrief({ silent:true });
      activeBrief = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id) + '/refine', {
        method:'POST',
        body:JSON.stringify({ instruction:request }),
      });
      if (Object.keys(fields).length) {
        activeBrief = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id), {
          method:'PATCH',
          body:JSON.stringify(fields),
        });
      }
    } else {
      activeBrief = await api('/studio/briefs', {
        method:'POST',
        body:JSON.stringify({ request, fields }),
      });
    }
    await loadBriefs(activeBrief.id);
    let rendered = false;
    if (
      activeBrief?.capability?.state === 'ready'
      && activeBrief?.continuation?.method === 'POST'
      && activeBrief?.continuation?.endpoint
    ) {
      setBusy('compose-button', true, 'Creating video…');
      const result = await api(activeBrief.continuation.endpoint, {
        method:'POST',
        body:JSON.stringify({ confirm:true }),
      });
      activeBrief = result.brief;
      await loadBriefs(activeBrief.id);
      rendered = result.executed === true;
    }
    requestInput.value = '';
    const blocker = activeBrief?.capability?.blocker || activeBrief?.continuation?.blocker;
    setFeedback(
      'compose-feedback',
      rendered
        ? 'Video created. Open Videos to watch it.'
        : refining
          ? blocker ? 'Video updated. ' + blocker : 'Video updated.'
          : blocker ? 'Video saved. ' + blocker : 'Video saved.',
      'success',
    );
  } catch (error) {
    setFeedback('compose-feedback', error.message, 'error');
  } finally {
    setBusy('compose-button', false, activeBrief ? 'Update video' : 'Make video');
  }
});

function quickCreateFields() {
  const fields = {};
  const kind = value('quick-kind');
  const duration = value('quick-duration');
  if (kind) {
    fields.kind = kind;
    if (kind === 'lyric-video') fields.engine = 'lyric-canvas';
  }
  if (duration) fields.durationSeconds = Number(duration);
  return fields;
}

document.getElementById('new-brief-button').addEventListener('click', () => {
  if (briefDirty && !window.confirm('Discard unsaved changes to this brief?')) return;
  activeBrief = null;
  showAllWorkflows = false;
  document.getElementById('request').value = '';
  for (const id of ['quick-kind','quick-duration']) setValue(id, '');
  renderQuickKindSelection();
  document.getElementById('conversation').innerHTML = '<div class="message empty" role="listitem">Describe the next video. Nothing renders until you confirm its brief.</div>';
  setFeedback('compose-feedback', '');
  setFeedback('brief-feedback', '');
  clearBriefForm();
  renderWorkflowList();
});

const briefForm = document.getElementById('brief-form');
briefForm.addEventListener('input', () => markBriefDirty());
briefForm.addEventListener('change', () => markBriefDirty());
document.getElementById('brief-kind').addEventListener('change', (event) => {
  if (!activeBrief) return;
  activeBrief = { ...activeBrief, kind:event.target.value };
  toggleLyricFields(event.target.value);
  if (event.target.value === 'lyric-video' && !['lyric-canvas','blender'].includes(value('brief-engine'))) {
    setValue('brief-engine', 'lyric-canvas');
  }
  showAllWorkflows = false;
  renderWorkflowList();
});
briefForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await saveBrief();
});
document.getElementById('execute-button').addEventListener('click', executeActiveBrief);
document.getElementById('refresh-productions').addEventListener('click', loadProductions);
document.getElementById('distribution-brief').addEventListener('change', (event) => {
  activeBrief = briefs.find((brief) => brief.id === event.target.value) ?? null;
  if (activeBrief) populateBrief(activeBrief);
  renderDistribution();
});
document.getElementById('prepare-button').addEventListener('click', prepareDistribution);
document.getElementById('draft-button').addEventListener('click', createPostizDraft);
document.getElementById('schedule-button').addEventListener('click', schedulePostiz);
document.getElementById('schedule-time').addEventListener('input', updateScheduleButton);
const studioTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'device local time';
document.getElementById('schedule-timezone').textContent = 'Timezone: ' + studioTimeZone + '. Postiz receives UTC.';

async function loadBriefs(selectedId) {
  briefs = await api('/studio/briefs');
  activeBrief = selectedId === '__new__'
    ? null
    : briefs.find((brief) => brief.id === selectedId)
      ?? briefs.find((brief) => brief.id === activeBrief?.id)
      ?? briefs[0]
      ?? null;
  document.getElementById('brief-count').textContent = briefs.length + (briefs.length === 1 ? ' saved brief' : ' saved briefs');
  if (activeBrief) {
    populateBrief(activeBrief);
    await loadCapabilities();
  } else {
    clearBriefForm();
  }
  populateDistributionSelect();
}

async function loadCapabilities() {
  const suffix = activeBrief ? '?briefId=' + encodeURIComponent(activeBrief.id) : '';
  capabilities = await api('/studio/capabilities' + suffix);
  renderWorkflowList();
}

function populateBrief(brief) {
  activeBrief = brief;
  setComposerMode(true);
  setValue('quick-kind', brief.kind || '');
  setValue('quick-duration', [15,30,45,60].includes(brief.durationSeconds) ? brief.durationSeconds : '');
  renderQuickKindSelection();
  setValue('brief-kind', brief.kind);
  setValue('brief-project', brief.projectSlug || '');
  setValue('brief-channel', brief.channel);
  setValue('brief-duration', brief.durationSeconds);
  setValue('brief-engine', brief.engine);
  document.getElementById('brief-kind').disabled = Boolean(brief.recipeId);
  document.getElementById('brief-engine').disabled = Boolean(brief.recipeId);
  document.getElementById('brief-project').disabled = Boolean(brief.recipeId);
  setValue('brief-rights', brief.sourceEvidence?.rightsStatus || 'unknown');
  setValue('brief-name', brief.title);
  setValue('brief-hook', brief.hook);
  setValue('brief-summary', brief.summary);
  setValue('brief-direction', brief.creativeDirection || '');
  setValue('brief-cta', brief.cta || '');
  setValue('brief-source-url', brief.sourceEvidence?.canonicalUrl || '');
  setValue('brief-claim', brief.sourceEvidence?.claim || '');
  setValue('brief-destination', brief.sourceEvidence?.destinationUrl || '');
  setValue('brief-public-url', brief.media?.publicUrl || '');
  setValue('lyric-audio-path', brief.lyric?.audioPath || '');
  setValue('lyric-timed-text', typeof brief.lyric?.timedLyrics === 'string' ? brief.lyric.timedLyrics : '');
  setValue('lyric-format', brief.lyric?.timedLyricsFormat || 'lrc');
  setValue('lyric-composition-rights', brief.lyric?.rights?.composition || 'unknown');
  setValue('lyric-master-rights', brief.lyric?.rights?.master || 'unknown');
  setValue('lyric-rights-evidence', brief.lyric?.rights?.evidence || '');
  setValue('lyric-rights-url', brief.lyric?.rights?.evidenceUrl || '');
  setValue('lyric-attribution', brief.lyric?.attribution || '');
  setValue('lyric-visual-style', brief.lyric?.visualStyle === 'kinetic-type' ? 'kinetic-type' : 'literal-cinematic');
  document.getElementById('lyric-reduced-motion').checked = brief.lyric?.reducedMotion === true;
  toggleLyricFields(brief.kind);
  document.getElementById('brief-creative-approved').checked = brief.approval?.creativeStatus === 'approved';
  document.getElementById('brief-quality-accepted').checked = brief.approval?.qualityAccepted === true;
  briefDirty = false;
  document.getElementById('save-brief-button').disabled = true;
  renderConversation(brief);
  renderBriefAction(brief);
  renderWorkflowList();
  if (plannerReady) {
    if (brief.recipeId) restorePlannerFromBrief(brief).catch((error) => setFeedback('planner-feedback', error.message, 'error'));
    else renderPlannerTerminal();
  }
}

function clearBriefForm() {
  briefDirty = false;
  setComposerMode(false);
  for (const id of ['brief-project','brief-name','brief-hook','brief-summary','brief-direction','brief-cta','brief-source-url','brief-claim','brief-destination','brief-public-url','lyric-audio-path','lyric-timed-text','lyric-rights-evidence','lyric-rights-url','lyric-attribution']) setValue(id, '');
  setValue('brief-kind', 'faceless');
  setValue('brief-channel', 'youtube_shorts');
  setValue('brief-duration', 60);
  setValue('brief-engine', 'mock');
  setValue('brief-rights', 'unknown');
  document.getElementById('brief-kind').disabled = false;
  document.getElementById('brief-engine').disabled = false;
  document.getElementById('brief-project').disabled = false;
  setValue('lyric-format', 'lrc');
  setValue('lyric-composition-rights', 'unknown');
  setValue('lyric-master-rights', 'unknown');
  setValue('lyric-visual-style', 'literal-cinematic');
  document.getElementById('lyric-reduced-motion').checked = false;
  toggleLyricFields('faceless');
  document.getElementById('brief-creative-approved').checked = false;
  document.getElementById('brief-quality-accepted').checked = false;
  document.getElementById('save-brief-button').disabled = true;
  document.getElementById('execute-button').disabled = true;
  document.getElementById('brief-state').textContent = 'No brief selected';
}

function setComposerMode(refining) {
  document.querySelector('label[for="request"]').textContent = refining ? 'What should we change?' : 'What should we make?';
  document.getElementById('request').placeholder = refining
    ? 'For example: make it calmer, use more animation, or shorten the ending.'
    : 'A 30-second cinematic video about a lonely astronaut finding a garden on Mars.';
  document.getElementById('compose-button').textContent = refining ? 'Update video' : 'Make video';
  document.getElementById('new-brief-button').textContent = refining ? 'New video' : 'Clear';
}

function renderConversation(brief) {
  const box = document.getElementById('conversation');
  if (!brief.messages?.length) {
    box.innerHTML = '<div class="message empty" role="listitem">This brief has no conversation history.</div>';
    return;
  }
  box.innerHTML = brief.messages.map((message) =>
    '<div class="message ' + (message.role === 'assistant' ? 'assistant' : 'operator') + '" role="listitem" aria-label="' +
    (message.role === 'assistant' ? 'Studio response' : 'Operator message') + '">' +
    escapeText(message.content) + '</div>').join('');
}

function renderWorkflowList() {
  const box = document.getElementById('workflow-list');
  if (!capabilities.length) return;
  const visibleCapabilities = activeBrief && !showAllWorkflows
    ? capabilities.filter((capability) => capability.id === activeBrief.kind)
    : capabilities;
  box.innerHTML = visibleCapabilities.map((capability) =>
    '<button type="button" class="workflow' + (activeBrief?.kind === capability.id ? ' active' : '') + '" data-kind="' + capability.id + '">' +
      '<span><strong>' + escapeText(capability.name) + '</strong><span>' + escapeText(capability.description) + ' · ' + escapeText(capability.owner) + '</span></span>' +
      '<span class="state ' + escapeText(capability.state) + '">' + escapeText(capability.state.replaceAll('-', ' ')) + '</span>' +
    '</button>').join('') +
    (activeBrief && !showAllWorkflows ? '<button class="copy" type="button" data-change-workflow>Change video type</button>' : '');
  box.querySelector('[data-change-workflow]')?.addEventListener('click', () => {
    showAllWorkflows = true;
    renderWorkflowList();
  });
  for (const button of box.querySelectorAll('[data-kind]')) {
    button.addEventListener('click', async () => {
      if (!activeBrief) {
        setValue('brief-kind', button.dataset.kind);
        document.getElementById('request').focus();
        return;
      }
      activeBrief = { ...activeBrief, kind:button.dataset.kind };
      setValue('brief-kind', button.dataset.kind);
      toggleLyricFields(button.dataset.kind);
      if (button.dataset.kind === 'lyric-video' && !['lyric-canvas','blender'].includes(value('brief-engine'))) {
        setValue('brief-engine', 'lyric-canvas');
      }
      showAllWorkflows = false;
      markBriefDirty();
      renderWorkflowList();
    });
  }
}

function collectBriefPatch() {
  const kind = value('brief-kind');
  return {
    kind,
    projectSlug:value('brief-project') || null,
    channel:value('brief-channel'),
    durationSeconds:Number(value('brief-duration')),
    recipeOptions:activeBrief?.recipeId ? {
      ...(activeBrief.recipeOptions || {}),
      channel:value('brief-channel'),
      durationSeconds:Number(value('brief-duration')),
    } : undefined,
    engine:value('brief-engine'),
    title:value('brief-name'),
    hook:value('brief-hook'),
    summary:value('brief-summary'),
    creativeDirection:value('brief-direction') || null,
    cta:value('brief-cta') || null,
    sourceEvidence:{
      canonicalUrl:value('brief-source-url') || null,
      claim:value('brief-claim') || null,
      destinationUrl:value('brief-destination') || null,
      rightsStatus:value('brief-rights'),
    },
    approval:{
      creativeStatus:document.getElementById('brief-creative-approved').checked ? 'approved' : 'proposed',
      qualityAccepted:document.getElementById('brief-quality-accepted').checked,
    },
    media:activeBrief?.media ? {
      publicUrl:value('brief-public-url') || null,
    } : null,
    lyric:kind === 'lyric-video' ? {
      audioPath:value('lyric-audio-path') || null,
      timedLyrics:value('lyric-timed-text') || null,
      timedLyricsFormat:value('lyric-format'),
      attribution:value('lyric-attribution') || null,
      rights:{
        composition:value('lyric-composition-rights'),
        master:value('lyric-master-rights'),
        evidence:value('lyric-rights-evidence') || null,
        evidenceUrl:value('lyric-rights-url') || null,
      },
      visualStyle:value('lyric-visual-style'),
      useBlender:value('brief-engine') === 'blender',
      reducedMotion:document.getElementById('lyric-reduced-motion').checked,
    } : null,
  };
}

async function saveBrief(options) {
  if (!activeBrief) return null;
  setBusy('save-brief-button', true, 'Saving…');
  try {
    activeBrief = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id), {
      method:'PATCH',
      body:JSON.stringify(collectBriefPatch()),
    });
    briefDirty = false;
    await loadBriefs(activeBrief.id);
    if (!options?.silent) setFeedback('brief-feedback', 'Brief saved as revision ' + activeBrief.revision + '.', 'success');
    return activeBrief;
  } catch (error) {
    setFeedback('brief-feedback', error.message, 'error');
    throw error;
  } finally {
    setBusy('save-brief-button', false, 'Save brief');
    document.getElementById('save-brief-button').disabled = !briefDirty;
  }
}

function markBriefDirty() {
  if (!activeBrief) return;
  briefDirty = true;
  document.getElementById('save-brief-button').disabled = false;
  const state = document.getElementById('brief-state');
  if (!state.textContent.includes('unsaved changes')) state.append(' · unsaved changes');
}

function renderBriefAction(brief) {
  const action = document.getElementById('execute-button');
  const continuation = brief.continuation;
  action.textContent = continuation?.label || 'Continue';
  action.disabled = !continuation || ['needs-input','blocked'].includes(continuation.state) || brief.lifecycle === 'producing';
  document.getElementById('brief-state').innerHTML =
    '<span class="state ' + escapeText(brief.lifecycle) + '">' + escapeText(brief.lifecycle.replaceAll('-', ' ')) + '</span>' +
    ' · revision ' + brief.revision + (continuation?.blocker ? ' · ' + escapeText(continuation.blocker) : '');
  document.getElementById('brief-subtitle').textContent = brief.generation?.source === 'llm'
    ? 'LLM-shaped brief. Every field remains operator-editable.'
    : 'Template-shaped brief. Every field remains operator-editable.';
}

async function executeActiveBrief() {
  if (!activeBrief) return;
  try {
    await saveBrief({ silent:true });
    if (!['faceless','lyric-video'].includes(activeBrief.kind)) {
      const destination = activeBrief.continuation?.href;
      if (!destination) throw new Error(activeBrief.continuation?.blocker || 'Continuation is not ready');
      window.location.href = destination;
      return;
    }
    setBusy('execute-button', true, activeBrief.kind === 'lyric-video' ? 'Rendering lyrics…' : 'Creating video…');
    setFeedback('brief-feedback', activeBrief.kind === 'lyric-video'
      ? 'Rendering exact timed lyrics and literal scenes. No distribution action will run.'
      : 'Rendering the confirmed brief. No distribution action will run.');
    const result = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id) + '/execute', {
      method:'POST',
      body:JSON.stringify({ confirm:true }),
    });
    activeBrief = result.brief;
    await loadBriefs(activeBrief.id);
    setFeedback('brief-feedback', 'Video created. Review it in Productions before distribution.', 'success');
  } catch (error) {
    setFeedback('brief-feedback', error.message, 'error');
  } finally {
    renderBriefAction(activeBrief);
  }
}

async function loadProductions() {
  const box = document.getElementById('production-list');
  resetPlatformPreviewPlayers();
  box.innerHTML = '<div class="loading-line"></div><div class="loading-line"></div>';
  try {
    const [data, status, policies] = await Promise.all([
      api('/studio/productions'),
      api('/studio/autopilot/status'),
      api('/studio/autopilot/policies'),
    ]);
    productionData = data;
    briefs = data.briefs;
    autopilotStatus = status;
    automationPolicies = policies.policies || [];
    renderLaneConsole();
    renderProductionList();
    initializePlatformPreviews();
  } catch (error) {
    box.innerHTML = '<div class="empty-state">Could not read productions: ' + escapeText(error.message) + '</div>';
    document.getElementById('lane-ledger').innerHTML = '<div><strong>Lane status unavailable</strong><p>' + escapeText(error.message) + '</p></div>';
  }
}

function renderProductionList() {
  const box = document.getElementById('production-list');
  resetPlatformPreviewPlayers();
  const filtered = productionData.briefs.filter((brief) => activeProductionLane === 'all' || contentLane(brief) === activeProductionLane);
  const showLegacy = activeProductionLane === 'all' || activeProductionLane === 'operator-request';
  if (!filtered.length && (!showLegacy || !productionData.legacyRenders.length)) {
    box.innerHTML = '<div class="empty-state"><strong>No ' + escapeText(laneLabel(activeProductionLane).toLowerCase()) + ' productions yet.</strong><br>' +
      (activeProductionLane === 'project-automation'
        ? 'Run an enabled project policy from the factory CLI or local automation endpoint; progress will appear here.'
        : activeProductionLane === 'personal-automation'
          ? 'Personal automation policies can use this lane when they are configured.'
          : 'Start in Create or choose another content lane.') + '</div>';
    return;
  }
  const current = filtered.map(renderProduction).join('');
  const legacyItems = showLegacy ? productionData.legacyRenders.map((render) =>
      '<article class="production"><div><h3>' + escapeText(render.title) + '</h3><p>Legacy Studio render · ' + escapeText(render.provider || 'unknown engine') + '</p></div>' +
      (render.video ? '<video controls preload="metadata" src="/studio/render-file?path=' + encodeURIComponent(render.video) + '"></video>' : '<div class="empty-state">No playable artifact</div>') +
      '</article>').join('') : '';
  const legacy = legacyItems
    ? '<details class="legacy-productions"><summary>Previous local renders · ' + escapeText(String(productionData.legacyRenders.length)) + '</summary>' + legacyItems + '</details>'
    : '';
  box.innerHTML = '<div class="production-list">' + current + legacy + '</div>';
  initializePlatformPreviews();
}

function renderLaneConsole() {
  const counts = { 'project-automation':0, 'operator-request':0, 'personal-automation':0 };
  for (const brief of productionData.briefs) counts[contentLane(brief)] += 1;
  const rows = [
    ['project-automation', 'Project Autopilot', 'Scheduled and event-driven work governed by project policies.'],
    ['operator-request', 'Ask Me', 'Productions created from an operator request or planning session.'],
    ['personal-automation', 'Personal Automations', 'Automated non-project content under a personal policy.'],
  ];
  document.getElementById('lane-ledger').innerHTML = rows.map(([id, label, description]) =>
    '<div><strong>' + escapeText(label) + '<span>' + escapeText(String(counts[id] || 0)) + '</span></strong><p>' + escapeText(description) + '</p></div>'
  ).join('');
  const exceptions = autopilotStatus?.exceptions || [];
  const policies = automationPolicies.filter((policy) => policy.enabled);
  const note = document.getElementById('automation-note');
  const policySummary = policies.map((policy) => policy.label + ' r' + policy.revision + ' · ' + policy.trigger.cadence + ' · Postiz ' + policy.distribution.mode).join(' / ');
  if (!exceptions.length) {
    note.innerHTML = '<p class="automation-note">' + escapeText(policySummary || 'No automation policies are enabled.') + '</p>';
    return;
  }
  note.innerHTML = '<details class="automation-note"><summary>' + escapeText(String(exceptions.length)) + ' automation ' + (exceptions.length === 1 ? 'item needs' : 'items need') + ' attention</summary><ul>' +
    exceptions.map((exception) => '<li><strong>' + escapeText(exception.title) + '</strong> · ' + escapeText(exception.nextAction || exception.error || 'Review the automation state.') + '</li>').join('') +
    '</ul><p>' + escapeText(policySummary) + '</p></details>';
}

function renderProduction(brief) {
  const quality = brief.media?.quality;
  const platformAudio = brief.media?.platformAudio;
  const media = platformAudio
    ? renderPlatformAudioReview(brief, platformAudio)
    : brief.media?.videoPath
    ? '<video controls preload="metadata" src="/studio/render-file?path=' + encodeURIComponent(brief.media.videoPath) + '"></video>'
    : brief.media?.previewType === 'html' && brief.media?.previewPath
    ? '<iframe title="' + escapeText(brief.title) + ' composition preview" src="/studio/render-file?path=' + encodeURIComponent(brief.media.previewPath) + '"></iframe>'
    : brief.media?.previewType === 'image' && brief.media?.previewPath
    ? '<img alt="' + escapeText(brief.title) + ' generated preview" src="/studio/render-file?path=' + encodeURIComponent(brief.media.previewPath) + '">'
    : '<div class="empty-state">' + escapeText(brief.continuation?.blocker || 'No render artifact yet.') + '</div>';
  const lyricEvidence = brief.kind === 'lyric-video'
    ? '<dl class="production-evidence" aria-label="Lyric production evidence">' +
      '<div><dt>Composition</dt><dd>' + escapeText(brief.lyric?.rights?.composition || 'not established') + '</dd></div>' +
      '<div><dt>Recording</dt><dd>' + escapeText(brief.lyric?.rights?.master || 'not established') + '</dd></div>' +
      '<div><dt>Evidence</dt><dd>' + escapeText(brief.lyric?.rights?.evidence || brief.lyric?.rights?.evidenceUrl || 'missing') + '</dd></div>' +
      '<div><dt>Timed text</dt><dd>' + escapeText((brief.lyric?.timedLyricsFormat || 'unknown').toUpperCase()) + '</dd></div>' +
      '<div style="grid-column:1/-1"><dt>Attribution</dt><dd>' + escapeText(brief.lyric?.attribution || 'missing') + '</dd></div>' +
      '</dl>'
    : '';
  const platformSetup = brief.media?.videoPath && !platformAudio ? renderPlatformAudioSetup(brief) : '';
  const channelLabel = brief.channel === 'youtube_shorts'
    ? 'YouTube Shorts'
    : brief.channel === 'instagram_reels'
      ? 'Instagram Reels'
      : brief.channel.replaceAll('_', ' ');
  const summary = platformAudio
    ? escapeText(String(platformAudio.reference?.durationSeconds || brief.durationSeconds)) + 's AI animation · silent export · official sound review'
    : escapeText(brief.summary);
  const continuationLabel = platformAudio && brief.continuation?.owner === 'Forge'
    ? 'Review and approve in Forge'
    : brief.continuation?.label;
  const lane = contentLane(brief);
  const automationEvidence = lane === 'operator-request' ? '' : renderAutomationEvidence(brief);
  return '<article class="production' + (platformAudio ? ' platform-audio-production' : '') + '">' +
    '<div><h3>' + escapeText(brief.title) + '</h3>' +
    '<p>' + (platformAudio
      ? 'AI animation · ' + escapeText(channelLabel)
      : escapeText(brief.recipe?.name || brief.kind.replaceAll('-', ' ')) + ' · ' + escapeText(brief.projectSlug || 'brand not selected') + ' · ' + escapeText(brief.channel.replaceAll('_', ' '))) + '</p>' +
    '<p>' + summary + '</p>' +
    '<div class="production-meta"><span class="state ' + escapeText(brief.lifecycle) + '">' + escapeText(brief.lifecycle.replaceAll('-', ' ')) + '</span>' +
    '<span class="state">' + escapeText(laneLabel(lane)) + '</span>' +
    (!platformAudio ? '<span class="state">' + escapeText(brief.recipe?.owner || brief.continuation?.owner || 'Studio') + ' owns next step</span>' : '') +
    (brief.recipe ? '<span class="state">' + escapeText(brief.recipe.spend.label) + '</span><span class="state">' + escapeText(brief.recipe.runtime) + '</span>' : '') +
    (quality ? '<span class="state ' + (quality.verdict === 'pass' ? 'ready' : 'needs-review') + '">quality ' + escapeText(quality.verdict) + (quality.overall ? ' · ' + quality.overall : '') + '</span>' : '') +
    (platformAudio ? '<span class="state ready">verified silent · ' + escapeText(String(platformAudio.reference?.durationSeconds || brief.durationSeconds)) + 's</span>' : '') +
    (brief.kind === 'lyric-video' ? '<span class="state">' + escapeText(String(brief.lyric?.cues?.length || 0)) + ' exact cues</span><span class="state">' + (brief.media?.blender ? 'Blender ' + escapeText(brief.media.blender.version || 'ready') : 'native lyric plates') + '</span>' : '') +
    '</div>' + automationEvidence + lyricEvidence + '<div class="button-row" style="margin-top:14px"><button class="button" type="button" data-edit-brief="' + escapeText(brief.id) + '">Edit brief</button>' +
    (brief.kind === 'lyric-video' && brief.media?.videoPath ? '<button class="button primary" type="button" data-review-brief="' + escapeText(brief.id) + '">Review lyric video</button>' : '') +
    (brief.continuation?.href ? '<a class="button" href="' + escapeText(brief.continuation.href) + '">' + escapeText(continuationLabel) + '</a>' : '') +
    '</div>' + platformSetup + '</div>' + media + '</article>';
}

function renderAutomationEvidence(brief) {
  const trigger = brief.origin?.trigger || {};
  const source = brief.origin?.source || {};
  const automation = brief.automation || {};
  const spend = brief.recipe?.spend?.label || automation.selectedRecipe?.spend?.label || 'not selected';
  const quality = brief.media?.quality?.verdict || 'not checked';
  const distribution = automation.distributionState || (brief.distribution?.receipt ? 'submitted' : 'not prepared');
  return '<dl class="production-evidence automation-evidence" aria-label="Automation evidence">' +
    '<div><dt>Policy</dt><dd>' + escapeText((trigger.automationPolicyId || 'unknown') + ' · r' + (trigger.automationPolicyRevision || '?')) + '</dd></div>' +
    '<div><dt>Source</dt><dd>' + escapeText((source.adapter || 'unknown') + ' · ' + (source.sourceId || 'unknown') + ' · r' + (source.revision || 1)) + '</dd></div>' +
    '<div><dt>Recipe and spend</dt><dd>' + escapeText((brief.recipe?.name || automation.selectedRecipe?.name || 'not selected') + ' · ' + spend) + '</dd></div>' +
    '<div><dt>Quality</dt><dd>' + escapeText(quality) + '</dd></div>' +
    '<div><dt>Distribution</dt><dd>' + escapeText(distribution.replaceAll('-', ' ')) + '</dd></div>' +
    '<div><dt>Attempts</dt><dd>' + escapeText(String(automation.attempts?.length || 0)) + ' / policy limit</dd></div>' +
    '<div class="recovery"><dt>Next recovery action</dt><dd>' + escapeText(automation.nextAction || 'No recovery action is required.') + '</dd></div>' +
    '</dl>';
}

function contentLane(brief) {
  return brief?.origin?.lane || 'operator-request';
}

function laneLabel(lane) {
  return {
    all:'All',
    'project-automation':'Project Autopilot',
    'operator-request':'Ask Me',
    'personal-automation':'Personal Automations',
  }[lane] || 'Ask Me';
}

function renderPlatformAudioSetup(brief) {
  return '<details class="platform-audio-setup"><summary>Preview with an official platform sound</summary>' +
    '<form class="platform-audio-form" data-platform-audio-form data-brief-id="' + escapeText(brief.id) + '">' +
    '<label>Artist<input name="artist" required placeholder="Shakira"></label>' +
    '<label>Track title<input name="title" required placeholder="Whenever, Wherever"></label>' +
    '<label>YouTube video ID<input name="videoId" required minlength="11" maxlength="11" placeholder="weRHyjj34ZE"></label>' +
    '<label>Spotify track ID <span class="optional">(recommended for local playback)</span><input name="spotifyTrackId" minlength="22" maxlength="22" placeholder="2N7vjHuOfnyF5eUzv5brZ0"></label>' +
    '<label>Excerpt start (seconds)<input name="startSeconds" required type="number" min="0" max="21600" step=".1" value="0"></label>' +
    '<label>Preview duration<input name="durationSeconds" required type="number" min="5" max="60" step="1" value="30"></label>' +
    '<label>Attach sound in<select name="targetPlatform"><option value="youtube_shorts"' + (brief.channel === 'youtube_shorts' ? ' selected' : '') + '>YouTube Shorts</option><option value="instagram_reels"' + (brief.channel === 'instagram_reels' ? ' selected' : '') + '>Instagram Reels</option><option value="tiktok">TikTok</option></select></label>' +
    '<p class="hint wide">The song streams through an official Spotify embed when supplied, with YouTube retained as the final sound reference. The generated upload master contains no audio stream.</p>' +
    '<div class="button-row wide"><button class="button primary" type="submit">Build synchronized preview</button></div>' +
    '<div class="feedback wide" aria-live="polite"></div></form></details>';
}

function renderPlatformAudioReview(brief, preview) {
  const reference = preview.reference || {};
  const receipt = preview.receiptPath ? 'verified receipt' : 'missing receipt';
  const silentMasterPath = preview.silentMasterPath || brief.media?.videoPath;
  const reviewProvider = reference.reviewProvider || (reference.spotifyTrackId ? 'spotify' : 'youtube');
  const previewId = 'platform-' + brief.id.replace(/[^A-Za-z0-9_-]/g, '-');
  return '<section class="platform-audio-review" data-platform-preview data-preview-id="' + escapeText(previewId) + '" data-review-provider="' + escapeText(reviewProvider) + '" data-video-id="' + escapeText(reference.videoId || '') + '" data-spotify-track-id="' + escapeText(reference.spotifyTrackId || '') + '" data-start-seconds="' + escapeText(String(reference.startSeconds || 0)) + '" data-duration-seconds="' + escapeText(String(reference.durationSeconds || brief.durationSeconds)) + '">' +
    '<div class="sync-stage">' +
    '<div class="sync-controls"><button class="button primary" type="button" data-platform-play aria-pressed="false">Play synchronized preview</button><button class="button" type="button" data-platform-restart>Restart</button><span class="sync-status" data-sync-status aria-live="polite">Loading the official player…</span></div>' +
    '<p class="sync-guidance">Spotify previews the feel. YouTube Shorts sets final timing.</p>' +
    '<div class="sync-source"><span>Official sound source</span><div class="' + (reviewProvider === 'spotify' ? 'spotify-player' : 'youtube-player') + '" ' + (reviewProvider === 'spotify' ? 'data-spotify-player' : 'data-youtube-player') + ' id="' + escapeText(previewId) + '-' + escapeText(reviewProvider) + '"></div></div>' +
    '<div class="sync-visual"><span>Silent upload master</span><video muted playsinline preload="metadata" src="/studio/render-file?path=' + encodeURIComponent(silentMasterPath) + '"></video></div>' +
    '<div class="silent-proof"><div><span>Export</span><strong>No audio stream</strong></div><div><span>Evidence</span><strong>' + (preview.receiptPath ? '<a href="/studio/render-file?path=' + encodeURIComponent(preview.receiptPath) + '" target="_blank" rel="noreferrer">' + escapeText(receipt) + ' →</a>' : escapeText(receipt)) + '</strong></div><div><span>Preview start</span><strong>' + formatSeconds(reference.startSeconds || 0) + ' · ' + escapeText(String(reference.durationSeconds || brief.durationSeconds)) + 's</strong></div></div>' +
    '<p class="platform-handoff"><strong>YouTube Shorts handoff:</strong> start near ' + formatSeconds(reference.startSeconds || 0) + ' for ' + escapeText(String(reference.durationSeconds || brief.durationSeconds)) + 's, then confirm the exact sound and timing in-platform. Spotify is review-only.</p></div></section>';
}

function formatSeconds(value) {
  const seconds = Math.max(0, Number(value) || 0);
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

function ensureYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      youtubeApiPromise = null;
      for (const status of document.querySelectorAll('[data-sync-status]')) status.textContent = 'Official player could not load. The silent master remains available.';
    };
    document.head.append(script);
  });
  return youtubeApiPromise;
}

function ensureSpotifyApi() {
  if (window.SpotifyIframeApi) return Promise.resolve(window.SpotifyIframeApi);
  if (spotifyApiPromise) return spotifyApiPromise;
  spotifyApiPromise = new Promise((resolve) => {
    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      window.SpotifyIframeApi = api;
      if (typeof previous === 'function') previous(api);
      resolve(api);
    };
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    script.onerror = () => {
      spotifyApiPromise = null;
      for (const status of document.querySelectorAll('[data-sync-status]')) status.textContent = 'The official Spotify player could not load. The silent master remains available.';
    };
    document.head.append(script);
  });
  return spotifyApiPromise;
}

function initializePlatformPreviews() {
  const roots = Array.from(document.querySelectorAll('[data-platform-preview]'));
  if (!roots.length) return;
  const spotifyRoots = roots.filter((root) => root.dataset.reviewProvider === 'spotify');
  const youtubeRoots = roots.filter((root) => root.dataset.reviewProvider !== 'spotify');
  if (spotifyRoots.length) ensureSpotifyApi().then((api) => {
    for (const root of spotifyRoots) initializeSpotifyPreview(root, api);
  });
  if (youtubeRoots.length) ensureYouTubeApi().then(() => {
    for (const root of youtubeRoots) initializeYouTubePreview(root);
  });
}

function initializeYouTubePreview(root) {
  const id = root.dataset.previewId;
  if (platformPreviewPlayers.has(id)) return;
  const visual = root.querySelector('video');
  const status = root.querySelector('[data-sync-status]');
  const startSeconds = Number(root.dataset.startSeconds || 0);
  const durationSeconds = Number(root.dataset.durationSeconds || 30);
  const state = { root, visual, status, startSeconds, durationSeconds, interval:null, ready:false, isPlaying:false, player:null, provider:'youtube' };
  state.player = new YT.Player(root.querySelector('[data-youtube-player]'), {
    host:'https://www.youtube-nocookie.com',
    videoId:root.dataset.videoId,
    playerVars:{ controls:1, playsinline:1, rel:0, start:Math.floor(startSeconds), origin:window.location.origin, widget_referrer:window.location.href },
    events:{
      onReady:() => {
        state.ready = true;
        status.textContent = 'Ready · sound streams from YouTube; export stays silent.';
      },
      onStateChange:(event) => synchronizePlatformState(state, event.data),
      onError:(event) => {
        const blocked = [101, 150].includes(Number(event.data));
        status.textContent = blocked
          ? 'This official upload blocks embedding. Choose another official upload or attach the sound in-platform.'
          : 'The official player could not start here. The silent master remains ready for in-platform sound.';
      },
    },
  });
  platformPreviewPlayers.set(id, state);
}

function initializeSpotifyPreview(root, api) {
  const id = root.dataset.previewId;
  if (platformPreviewPlayers.has(id)) return;
  const visual = root.querySelector('video');
  const status = root.querySelector('[data-sync-status]');
  const startSeconds = Number(root.dataset.startSeconds || 0);
  const durationSeconds = Number(root.dataset.durationSeconds || 30);
  const state = { root, visual, status, startSeconds, durationSeconds, ready:false, isPlaying:false, player:null, provider:'spotify' };
  api.createController(root.querySelector('[data-spotify-player]'), {
    uri:'spotify:track:' + root.dataset.spotifyTrackId,
    width:'100%',
    height:152,
  }, (controller) => {
    state.player = controller;
    controller.addListener('ready', () => {
      state.ready = true;
      controller.loadEntity('spotify:track:' + root.dataset.spotifyTrackId, false, startSeconds);
      status.textContent = 'Ready · sound streams from Spotify; export stays silent.';
    });
    controller.addListener('playback_started', () => {
      setPlatformPlaying(state, true);
      visual.play().catch(() => {});
      status.textContent = 'Synchronized preview playing · upload master has no audio.';
    });
    controller.addListener('playback_update', (event) => synchronizeSpotifyState(state, event.data));
  });
  platformPreviewPlayers.set(id, state);
}

function synchronizeSpotifyState(state, playback = {}) {
  const positionSeconds = Number(playback.position || 0) / 1000;
  const expected = Math.max(0, positionSeconds - state.startSeconds);
  setPlatformPlaying(state, !playback.isPaused && !playback.isBuffering);
  if (playback.isPaused || playback.isBuffering) state.visual.pause();
  else state.visual.play().catch(() => {});
  if (playback.isBuffering) state.status.textContent = 'Official stream buffering · silent visual paused.';
  if (expected >= state.durationSeconds) {
    state.player.pause();
    setPlatformPlaying(state, false);
    state.visual.pause();
    state.status.textContent = 'Excerpt complete · ready to review again.';
    return;
  }
  if (Math.abs(state.visual.currentTime - expected) > .35) state.visual.currentTime = expected;
}

function synchronizePlatformState(state, playerState) {
  if (playerState === YT.PlayerState.PLAYING) {
    setPlatformPlaying(state, true);
    const expected = Math.max(0, state.player.getCurrentTime() - state.startSeconds);
    state.visual.currentTime = Math.min(expected, state.durationSeconds);
    state.visual.play().catch(() => {});
    state.status.textContent = 'Synchronized preview playing · upload master has no audio.';
    clearInterval(state.interval);
    state.interval = setInterval(() => correctPlatformDrift(state), 400);
    return;
  }
  if ([YT.PlayerState.PAUSED, YT.PlayerState.BUFFERING, YT.PlayerState.ENDED].includes(playerState)) {
    setPlatformPlaying(state, false);
    state.visual.pause();
    clearInterval(state.interval);
    state.interval = null;
    if (playerState === YT.PlayerState.BUFFERING) state.status.textContent = 'Official stream buffering · silent visual paused.';
  }
}

function correctPlatformDrift(state) {
  const expected = state.player.getCurrentTime() - state.startSeconds;
  if (expected < 0) return;
  if (expected >= state.durationSeconds) {
    state.player.pauseVideo();
    setPlatformPlaying(state, false);
    state.visual.pause();
    state.status.textContent = 'Excerpt complete · ready to review again.';
    return;
  }
  if (Math.abs(state.visual.currentTime - expected) > .35) state.visual.currentTime = expected;
}

function playPlatformPreview(root, restart) {
  const state = platformPreviewPlayers.get(root.dataset.previewId);
  if (!state?.ready) {
    root.querySelector('[data-sync-status]').textContent = 'Official player is still loading.';
    return;
  }
  if (state.provider === 'spotify') {
    if (state.isPlaying && !restart) {
      state.player.pause();
      state.visual.pause();
      setPlatformPlaying(state, false);
      state.status.textContent = 'Preview paused.';
      return;
    }
    if (restart) {
      state.player.seek(state.startSeconds);
      state.visual.currentTime = 0;
    }
    state.player.play();
    return;
  }
  if (state.isPlaying && !restart) {
    state.player.pauseVideo();
    state.visual.pause();
    setPlatformPlaying(state, false);
    state.status.textContent = 'Preview paused.';
    return;
  }
  if (restart || state.player.getCurrentTime() < state.startSeconds || state.player.getCurrentTime() > state.startSeconds + state.durationSeconds) {
    state.player.seekTo(state.startSeconds, true);
    state.visual.currentTime = 0;
  }
  state.player.playVideo();
}

function setPlatformPlaying(state, isPlaying) {
  state.isPlaying = Boolean(isPlaying);
  const button = state.root.querySelector('[data-platform-play]');
  if (!button) return;
  button.textContent = state.isPlaying ? 'Pause preview' : 'Play synchronized preview';
  button.setAttribute('aria-pressed', String(state.isPlaying));
}

function resetPlatformPreviewPlayers() {
  for (const state of platformPreviewPlayers.values()) {
    clearInterval(state.interval);
    state.player?.destroy?.();
  }
  platformPreviewPlayers.clear();
}

document.getElementById('production-list').addEventListener('click', (event) => {
  const previewRoot = event.target.closest('[data-platform-preview]');
  if (previewRoot && event.target.closest('[data-platform-play],[data-platform-restart]')) {
    playPlatformPreview(previewRoot, Boolean(event.target.closest('[data-platform-restart]')));
    return;
  }
  const button = event.target.closest('[data-edit-brief],[data-review-brief]');
  if (!button) return;
  const briefId = button.dataset.editBrief || button.dataset.reviewBrief;
  activeBrief = briefs.find((brief) => brief.id === briefId) ?? null;
  if (activeBrief) {
    populateBrief(activeBrief);
    activateView('create');
    if (button.dataset.reviewBrief) {
      const acceptance = document.getElementById('brief-quality-accepted');
      acceptance.closest('details')?.setAttribute('open', '');
      acceptance.focus();
      acceptance.scrollIntoView({ block:'center' });
      setFeedback('brief-feedback', 'Review the playable artifact and retained rights evidence, then explicitly accept quality or revise the brief.');
    }
  }
});

document.getElementById('production-list').addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-platform-audio-form]');
  if (!form) return;
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const feedback = form.querySelector('.feedback');
  const fields = new FormData(form);
  button.disabled = true;
  button.textContent = 'Building silent master…';
  feedback.textContent = 'Removing every audio stream and preparing the official-player review.';
  try {
    const result = await api('/studio/platform-audio-preview', {
      method:'POST',
      body:JSON.stringify({
        briefId:form.dataset.briefId,
        confirm:true,
        reference:{
          provider:'youtube',
          videoId:String(fields.get('videoId') || '').trim(),
          spotifyTrackId:String(fields.get('spotifyTrackId') || '').trim() || null,
          artist:String(fields.get('artist') || '').trim(),
          title:String(fields.get('title') || '').trim(),
          startSeconds:Number(fields.get('startSeconds')),
          durationSeconds:Number(fields.get('durationSeconds')),
          targetPlatform:String(fields.get('targetPlatform') || 'youtube_shorts'),
        },
      }),
    });
    feedback.textContent = result.boundary;
    await loadProductions();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error wide';
  } finally {
    button.disabled = false;
    button.textContent = 'Build synchronized preview';
  }
});

function populateDistributionSelect() {
  const select = document.getElementById('distribution-brief');
  const selected = activeBrief?.id || select.value;
  select.innerHTML = '<option value="">Choose a production</option>' + briefs.map((brief) =>
    '<option value="' + escapeText(brief.id) + '"' + (brief.id === selected ? ' selected' : '') + '>' +
    escapeText(brief.title) + ' · ' + escapeText(brief.lifecycle) + '</option>').join('');
}

async function renderDistribution() {
  if (!postizReadiness) {
    try { postizReadiness = await api('/studio/postiz-readiness'); } catch {}
  }
  const state = document.getElementById('postiz-state');
  const postizReady = postizReadiness?.state === 'ready-for-submission';
  state.textContent = postizReady ? 'Postiz ready' : 'Postiz unavailable';
  state.className = 'state ' + (postizReady ? 'ready' : 'blocked');
  document.getElementById('postiz-boundary').textContent = postizReadiness?.boundary || 'Postiz configuration is unavailable.';
  const open = document.getElementById('open-postiz');
  if (postizReadiness?.appUrl) {
    open.href = postizReadiness.appUrl;
    open.removeAttribute('aria-disabled');
  } else {
    open.href = '#';
    open.setAttribute('aria-disabled','true');
  }
  populateDistributionSelect();
  const brief = activeBrief;
  const scheduleInput = document.getElementById('schedule-time');
  if (scheduleInput.dataset.briefId !== (brief?.id ?? '')) {
    scheduleInput.dataset.briefId = brief?.id ?? '';
    scheduleInput.value = brief?.distribution?.request?.scheduledFor
      ? localDateTimeValue(brief.distribution.request.scheduledFor)
      : '';
  }
  scheduleInput.min = localDateTimeValue(new Date(Date.now() + 60_000));
  const storedSchedule = brief?.distribution?.request?.scheduledFor;
  const receiptStatus = brief?.distribution?.receipt?.status;
  document.getElementById('schedule-status').textContent = storedSchedule
    ? (receiptStatus === 'scheduled' ? 'Scheduled' : 'Prepared') + ' for ' + formatScheduledTime(storedSchedule) + '.'
    : receiptStatus === 'draft' ? 'Postiz draft created; no publish time is set.' : '';
  const checks = distributionChecks(brief);
  const passing = checks.filter((check) => check.pass).length;
  document.getElementById('evidence-progress').textContent = brief
    ? passing + ' of ' + checks.length + ' requirements ready'
    : 'Choose a production to inspect its handoff evidence.';
  const groups = ['Source','Approval','Delivery'];
  const evidenceList = document.getElementById('evidence-list');
  evidenceList.innerHTML = groups.map((group) =>
    '<li class="evidence-group"><h4>' + group + '</h4><ul class="evidence-list">' +
    checks.filter((check) => check.group === group).map((check) =>
      '<li class="' + (check.pass ? 'pass' : '') + '"><span class="mark">' + (check.pass ? '✓' : '×') + '</span><span><strong>' + escapeText(check.label) + '</strong><br><span class="hint">' + escapeText(check.detail) + '</span></span>' +
      (!check.pass ? '<button class="copy evidence-fix" type="button" data-fix-view="' + escapeText(check.fixView) + '"' + (check.fieldId ? ' data-fix-field="' + escapeText(check.fieldId) + '"' : '') + '>' + escapeText(check.fixLabel) + '</button>' : '') +
      '</li>').join('') + '</ul></li>').join('');
  for (const button of evidenceList.querySelectorAll('[data-fix-view]')) {
    button.addEventListener('click', () => {
      activateView(button.dataset.fixView);
      const field = button.dataset.fixField && document.getElementById(button.dataset.fixField);
      if (field) {
        field.closest('details')?.setAttribute('open', '');
        field.focus();
        field.scrollIntoView({ block:'center' });
      }
    });
  }
  const complete = Boolean(brief) && checks.every((check) => check.pass);
  const alreadySubmitted = Boolean(brief?.distribution?.receipt?.externalId);
  document.getElementById('prepare-button').disabled = !complete;
  document.getElementById('draft-button').disabled =
    !complete || alreadySubmitted || postizReadiness?.state !== 'ready-for-submission';
  updateScheduleButton();
}

function distributionChecks(brief) {
  const qualityPass = brief?.media?.quality?.verdict === 'pass' || brief?.approval?.qualityAccepted === true;
  const publicMedia = isStableHttps(brief?.media?.publicUrl);
  const checks = [
    { group:'Source', label:'Fleet brand and channel', pass:Boolean(brief?.projectSlug && brief?.channel), detail:brief?.projectSlug ? brief.projectSlug + ' → ' + brief.channel.replaceAll('_',' ') : 'Choose a configured Fleet brand.', fixView:'create', fieldId:brief?.projectSlug ? 'brief-channel' : 'brief-project', fixLabel:'Fix in brief' },
    { group:'Source', label:'Canonical source and claim', pass:Boolean(brief?.sourceEvidence?.canonicalUrl && brief?.sourceEvidence?.claim), detail:'Attach the allowed claim to its source URL.', fixView:'create', fieldId:brief?.sourceEvidence?.canonicalUrl ? 'brief-claim' : 'brief-source-url', fixLabel:'Fix in brief' },
    { group:'Source', label:'Source rights', pass:brief?.sourceEvidence?.rightsStatus === 'approved', detail:'Owned or licensed source must be explicitly approved.', fixView:'create', fieldId:'brief-rights', fixLabel:'Fix in brief' },
    { group:'Approval', label:'Destination and CTA', pass:Boolean(brief?.sourceEvidence?.destinationUrl && brief?.cta), detail:'Give the post one truthful next action.', fixView:'create', fieldId:brief?.sourceEvidence?.destinationUrl ? 'brief-cta' : 'brief-destination', fixLabel:'Fix in brief' },
    { group:'Approval', label:'Creative approval', pass:brief?.approval?.creativeStatus === 'approved', detail:'Conversation and rendering never imply approval.', fixView:'create', fieldId:'brief-creative-approved', fixLabel:'Fix in brief' },
    { group:'Approval', label:'Quality evidence', pass:qualityPass, detail:'Requires a passing verdict or explicit owner acceptance.', fixView:'create', fieldId:'brief-quality-accepted', fixLabel:'Fix in brief' },
    { group:'Delivery', label:'Rendered artifact', pass:Boolean(brief?.media?.videoPath), detail:'A real render must exist before handoff.', fixView:'productions', fieldId:null, fixLabel:'Review production' },
    { group:'Delivery', label:'Stable public media', pass:publicMedia, detail:'Postiz needs a public HTTPS URL; local paths are rejected.', fixView:'create', fieldId:'brief-public-url', fixLabel:'Fix in brief' },
  ];
  if (brief?.kind === 'lyric-video') {
    checks.splice(3, 0,
      { group:'Source', label:'Composition and lyric rights', pass:['owned','licensed','public-domain'].includes(brief?.lyric?.rights?.composition), detail:'Record the asserted basis for the words and composition.', fixView:'create', fieldId:'lyric-composition-rights', fixLabel:'Fix music rights' },
      { group:'Source', label:'Master-recording rights', pass:['owned','licensed','original-recording'].includes(brief?.lyric?.rights?.master), detail:'A cleared composition does not clear a recording.', fixView:'create', fieldId:'lyric-master-rights', fixLabel:'Fix recording rights' },
      { group:'Source', label:'Music evidence and attribution', pass:Boolean(brief?.lyric?.attribution && (brief?.lyric?.rights?.evidence || brief?.lyric?.rights?.evidenceUrl)), detail:'Attribution is recorded, but it never substitutes for permission.', fixView:'create', fieldId:brief?.lyric?.attribution ? 'lyric-rights-evidence' : 'lyric-attribution', fixLabel:'Fix evidence' },
      { group:'Approval', label:'Exact cue and literal-scene evidence', pass:Boolean(brief?.media?.rightsPath && brief?.media?.scenePlanPath), detail:'The production must retain the rights manifest and one literal scene per exact cue.', fixView:'productions', fieldId:null, fixLabel:'Review production' },
    );
  }
  return checks;
}

function toggleLyricFields(kind) {
  const fields = document.getElementById('lyric-fields');
  fields.hidden = kind !== 'lyric-video';
  if (kind === 'lyric-video' && blenderReadiness) renderBlenderReadiness();
}

async function loadBlenderReadiness() {
  try {
    blenderReadiness = await api('/studio/blender-readiness');
  } catch (error) {
    blenderReadiness = { ready:false, blocker:error.message };
  }
  renderBlenderReadiness();
}

function renderBlenderReadiness() {
  const box = document.getElementById('blender-readiness');
  if (!box || !blenderReadiness) return;
  box.textContent = blenderReadiness.ready
    ? 'Blender ' + blenderReadiness.version + ' is ready for literal scene generation.'
    : (blenderReadiness.blocker || 'Blender 5.2 is unavailable.');
}

async function prepareDistribution() {
  if (!activeBrief) return;
  setBusy('prepare-button', true, 'Preparing…');
  try {
    await saveBrief({ silent:true });
    const result = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id) + '/prepare-distribution', { method:'POST', body:'{}' });
    activeBrief = result.brief;
    await loadBriefs(activeBrief.id);
    setFeedback('distribution-feedback', result.boundary, 'success');
  } catch (error) {
    setFeedback('distribution-feedback', error.message, 'error');
  } finally {
    setBusy('prepare-button', false, 'Prepare handoff');
    await renderDistribution();
  }
}

async function createPostizDraft() {
  if (!activeBrief) return;
  setBusy('draft-button', true, 'Creating draft…');
  try {
    await saveBrief({ silent:true });
    const result = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id) + '/create-postiz-draft', {
      method:'POST',
      body:JSON.stringify({ approvedBy:'owner' }),
    });
    activeBrief = result.brief;
    await loadBriefs(activeBrief.id);
    setFeedback('distribution-feedback', result.boundary, 'success');
  } catch (error) {
    setFeedback('distribution-feedback', error.message, 'error');
  } finally {
    setBusy('draft-button', false, 'Create Postiz draft');
    await renderDistribution();
  }
}

async function schedulePostiz() {
  if (!activeBrief) return;
  let scheduledFor;
  try {
    scheduledFor = scheduledForFromInput();
  } catch (error) {
    setFeedback('distribution-feedback', error.message, 'error');
    return;
  }
  setBusy('schedule-button', true, 'Scheduling…');
  try {
    await saveBrief({ silent:true });
    const result = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id) + '/schedule-postiz', {
      method:'POST',
      body:JSON.stringify({ approvedBy:'owner', scheduledFor }),
    });
    activeBrief = result.brief;
    await loadBriefs(activeBrief.id);
    setFeedback('distribution-feedback', result.boundary, 'success');
  } catch (error) {
    setFeedback('distribution-feedback', error.message, 'error');
  } finally {
    setBusy('schedule-button', false, 'Schedule in Postiz');
    await renderDistribution();
  }
}

function updateScheduleButton() {
  const input = document.getElementById('schedule-time');
  const selected = input.value ? new Date(input.value) : null;
  const future = Boolean(selected && Number.isFinite(selected.getTime()) && selected.getTime() > Date.now());
  const evidenceReady = Boolean(activeBrief) && distributionChecks(activeBrief).every((check) => check.pass);
  const alreadySubmitted = Boolean(activeBrief?.distribution?.receipt?.externalId);
  const button = document.getElementById('schedule-button');
  button.textContent = activeBrief?.distribution?.receipt?.status === 'scheduled'
    ? 'Scheduled in Postiz'
    : 'Schedule in Postiz';
  button.disabled =
    alreadySubmitted || !future || !evidenceReady || postizReadiness?.state !== 'ready-for-submission';
}

function scheduledForFromInput() {
  const raw = document.getElementById('schedule-time').value;
  if (!raw) throw new Error('Choose a future publish date and time.');
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) throw new Error('Choose a valid publish date and time.');
  if (date.getTime() <= Date.now()) throw new Error('Publish date and time must be in the future.');
  return date.toISOString();
}

function localDateTimeValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatScheduledTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    day:'numeric',
    month:'long',
    year:'numeric',
    hour:'numeric',
    minute:'2-digit',
    timeZoneName:'short',
  }).format(new Date(value));
}

const toolNav = document.getElementById('tool-nav');
const toolPanels = document.getElementById('tool-panels');
for (const tool of TOOLS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = tool.label;
  button.dataset.tool = tool.id;
  button.addEventListener('click', () => activateTool(tool.id));
  toolNav.appendChild(button);
  const panel = document.createElement('section');
  panel.className = 'tool-panel';
  panel.id = 'tool-panel-' + tool.id;
  panel.innerHTML = '<h3>' + escapeText(tool.label) + '</h3><p class="hint">' + escapeText(tool.hint) + '</p>';
  panel.appendChild(buildToolForm(tool));
  const result = document.createElement('div');
  result.className = 'result';
  result.id = 'result-' + tool.id;
  panel.appendChild(result);
  toolPanels.appendChild(panel);
}
addToolPanel('manager','Ideas manager','Saved ideas and their pipeline status.','ideas-table',loadIdeas);
addToolPanel('renders','Renders','Legacy Studio renders with quality verdicts and playback.','legacy-renders',loadRenders);

function addToolPanel(id,label,hint,containerId,loader) {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = label; button.dataset.tool = id;
  button.addEventListener('click', () => { activateTool(id); loader(); });
  toolNav.appendChild(button);
  const panel = document.createElement('section');
  panel.className = 'tool-panel'; panel.id = 'tool-panel-' + id;
  panel.innerHTML = '<h3>' + label + '</h3><p class="hint">' + hint + '</p><div id="' + containerId + '"></div>';
  toolPanels.appendChild(panel);
}

function buildToolForm(tool) {
  const form = document.createElement('form');
  for (const field of tool.fields) {
    const label = document.createElement('label');
    label.textContent = field.label;
    let input;
    if (field.type === 'textarea') input = document.createElement('textarea');
    else if (field.type === 'select') {
      input = document.createElement('select');
      for (const option of field.options) {
        const el = document.createElement('option');
        el.value = option; el.textContent = option;
        input.appendChild(el);
      }
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
    }
    input.name = field.name;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.value) input.value = field.value;
    if (field.required) input.required = true;
    label.appendChild(input);
    form.appendChild(label);
  }
  const run = document.createElement('button');
  run.className = 'button primary';
  run.type = 'submit';
  run.textContent = 'Run';
  form.appendChild(run);
  form.onsubmit = async (event) => {
    event.preventDefault();
    const body = {};
    for (const field of tool.fields) {
      const raw = form.elements[field.name].value.trim();
      if (!raw) continue;
      body[field.name] = field.type === 'number' ? Number(raw) : raw;
    }
    run.disabled = true;
    const box = document.getElementById('result-' + tool.id);
    box.innerHTML = '<p class="hint">Running…</p>';
    try {
      const res = await fetch('/studio/' + tool.id, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || res.status);
      renderResult(box, payload.data);
      if (tool.id === 'save' || tool.id === 'faceless') { loadIdeas(); loadBriefs(activeBrief?.id); }
    } catch (error) {
      box.innerHTML = '<p class="error">' + escapeText(error.message) + '</p>';
    } finally {
      run.disabled = false;
    }
  };
  return form;
}

function renderResult(box, data) {
  const text = JSON.stringify(data, null, 2);
  box.innerHTML = '';
  const meta = document.createElement('div');
  meta.className = 'meta';
  if (data && data.source) meta.append('source: ' + data.source + ' ');
  const copy = document.createElement('button');
  copy.className = 'copy';
  copy.textContent = 'copy JSON';
  copy.onclick = () => navigator.clipboard.writeText(text);
  meta.appendChild(copy);
  const pre = document.createElement('pre');
  pre.textContent = text;
  box.appendChild(meta);
  box.appendChild(pre);
}

async function loadIdeas() {
  const table = document.getElementById('ideas-table');
  const res = await fetch('/studio/ideas-list');
  const payload = await res.json();
  const ideas = payload.data || [];
  if (!ideas.length) { table.innerHTML = '<div class="empty-state">No saved ideas yet. Use Video ideas or Save idea to begin.</div>'; return; }
  const rows = ideas.map((idea) =>
    '<tr><td>' + escapeText(idea.title) + '</td><td>' + escapeText(idea.niche || '') + '</td><td>' +
    statusSelect(idea) + '</td><td>' + escapeText(idea.updatedAt || '') + '</td></tr>').join('');
  table.innerHTML = '<table><tr><th>Title</th><th>Niche</th><th>Status</th><th>Updated</th></tr>' + rows + '</table>';
  for (const select of table.querySelectorAll('select[data-id]')) {
    select.onchange = async () => {
      await fetch('/studio/status', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: select.dataset.id, to: select.value }),
      });
      loadIdeas();
    };
  }
}

async function loadRenders() {
  const table = document.getElementById('legacy-renders');
  const res = await fetch('/studio/renders-list');
  const payload = await res.json();
  const renders = payload.data || [];
  if (!renders.length) { table.innerHTML = '<div class="empty-state">No legacy renders yet. Run Factory: produce or use the Create view.</div>'; return; }
  const rows = renders.map((render, index) =>
    '<tr><td>' + escapeText(render.title) + '</td>' +
    '<td>' + (render.quality ? render.quality.verdict + ' (' + render.quality.overall + ')' : '—') + '</td>' +
    '<td>' + escapeText(render.provider || '') + '</td>' +
    '<td>' + escapeText(render.status) + '</td>' +
    '<td>' +
      (render.video ? '<button class="copy" data-play="' + index + '">play</button> ' : '') +
      '<button class="copy" data-approve="' + escapeText(render.ideaId) + '">approve</button> ' +
      '<button class="copy" data-reject="' + escapeText(render.ideaId) + '">reject</button>' +
    '</td></tr>').join('');
  table.innerHTML = '<table><tr><th>Title</th><th>Quality</th><th>Engine</th><th>Status</th><th></th></tr>' + rows + '</table>';
  const player = document.createElement('div');
  table.appendChild(player);
  for (const btn of table.querySelectorAll('button[data-play]')) {
    btn.onclick = () => {
      const render = renders[Number(btn.dataset.play)];
      player.innerHTML = '<h3>' + escapeText(render.title) + '</h3>' +
        '<video controls style="max-width:320px;max-height:568px" src="/studio/render-file?path=' + encodeURIComponent(render.video) + '"></video>';
    };
  }
  const setStatus = async (id, to) => {
    await fetch('/studio/status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, to }),
    });
    loadRenders();
  };
  for (const btn of table.querySelectorAll('button[data-approve]')) btn.onclick = () => setStatus(btn.dataset.approve, 'posted');
  for (const btn of table.querySelectorAll('button[data-reject]')) btn.onclick = () => setStatus(btn.dataset.reject, 'new');
}

function statusSelect(idea) {
  const statuses = ['new', 'scripted', 'rendered', 'posted'];
  return '<select data-id="' + escapeText(idea.id) + '">' + statuses.map((status) =>
    '<option value="' + status + '"' + (idea.status === status ? ' selected' : '') + '>' + status + '</option>').join('') + '</select>';
}

function escapeText(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function activateTool(id) {
  for (const button of toolNav.querySelectorAll('button')) button.classList.toggle('active', button.dataset.tool === id);
  const toolsVisible = !document.getElementById('view-tools').hidden;
  for (const button of toolShortcutButtons) button.classList.toggle('active', toolsVisible && button.dataset.toolShortcut === id);
  for (const panel of toolPanels.querySelectorAll('.tool-panel')) panel.classList.toggle('active', panel.id === 'tool-panel-' + id);
}

async function api(path, init) {
  const response = await fetch(path, {
    headers:{ 'content-type':'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(typeof payload.error === 'string' ? payload.error : payload.error?.message || 'Request failed');
  return payload.data;
}

function value(id) { return document.getElementById(id).value.trim(); }
function setValue(id, next) { document.getElementById(id).value = next ?? ''; }
function setFeedback(id, message, state) {
  const element = document.getElementById(id);
  element.textContent = message || '';
  element.className = 'feedback' + (state ? ' ' + state : '');
}
function setBusy(id, busy, label) {
  const button = document.getElementById(id);
  button.disabled = busy;
  button.textContent = label;
}
function isStableHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !['localhost','127.0.0.1','::1'].includes(url.hostname);
  } catch { return false; }
}

activateTool(TOOLS[0].id);
loadBriefs('__new__').catch((error) => {
  setFeedback('compose-feedback', 'Video Maker could not load: ' + error.message, 'error');
});
</script>
</body>
</html>`;
}
