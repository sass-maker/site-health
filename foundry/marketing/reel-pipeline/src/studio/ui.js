/**
 * THESIS: Extend Content Studio's existing workbench with one conversational path from request to reviewed draft.
 * OWN-WORLD: The incumbent navy work plane, persistent 180px tool rail, muted labels, and teal run action.
 * STORY: Describe the video, correct the normalized brief, create or continue, review, then hand an approved draft to Postiz.
 * FIRST VIEWPORT: The original compact header and left rail frame one quiet, single-column creation work plane.
 * FORM: Preserve-mode operator workbench; the existing header, sidebar, controls, density, and tool navigation remain primary.
 */
import brandConfig from '../../config/brand-channels.json' with { type: 'json' };

const TOOLS = [
  {
    id: 'ideas',
    label: 'Video ideas',
    hint: 'Ideas with title, angle, hook, and format for a niche.',
    fields: [
      { name: 'niche', label: 'Niche', placeholder: 'home espresso', required: true },
      { name: 'count', label: 'Count', type: 'number', value: '10' },
    ],
  },
  {
    id: 'niche',
    label: 'Niche explorer',
    hint: 'Sub-niches with audience and competition estimates.',
    fields: [{ name: 'niche', label: 'Niche', placeholder: 'home espresso', required: true }],
  },
  {
    id: 'channel',
    label: 'Channel names',
    hint: 'Brandable channel name suggestions.',
    fields: [
      { name: 'niche', label: 'Niche', placeholder: 'home espresso', required: true },
      { name: 'count', label: 'Count', type: 'number', value: '8' },
    ],
  },
  {
    id: 'titles',
    label: 'Titles',
    hint: 'Title variants under 100 characters.',
    fields: [
      { name: 'topic', label: 'Topic', placeholder: 'latte art basics', required: true },
      { name: 'count', label: 'Count', type: 'number', value: '5' },
    ],
  },
  {
    id: 'description',
    label: 'Description',
    hint: 'Hook, summary, chapters block, CTA, hashtags.',
    fields: [
      { name: 'topic', label: 'Topic', placeholder: 'latte art basics', required: true },
      { name: 'hook', label: 'Hook (optional)' },
      { name: 'cta', label: 'CTA (optional)' },
    ],
  },
  {
    id: 'tags',
    label: 'Tags',
    hint: 'Deduped tags fit to the 500-char budget.',
    fields: [
      { name: 'topic', label: 'Topic', placeholder: 'latte art basics', required: true },
      { name: 'niche', label: 'Niche (optional)' },
    ],
  },
  {
    id: 'organize',
    label: 'Tag organizer',
    hint: 'Clean and rank an existing comma-separated tag list.',
    fields: [{ name: 'tags', label: 'Tags (comma separated)', type: 'textarea', required: true }],
  },
  {
    id: 'script',
    label: 'Script',
    hint: 'Scene-structured script, 30s to 20min. Paste an article to adapt it.',
    fields: [
      { name: 'topic', label: 'Topic' },
      { name: 'duration', label: 'Duration (seconds)', type: 'number', value: '60' },
      { name: 'niche', label: 'Niche (optional)' },
      { name: 'article', label: 'Article / transcript to adapt (optional)', type: 'textarea' },
    ],
  },
  {
    id: 'voice',
    label: 'Brand voice',
    hint: 'Derive a voice profile from a sample transcript.',
    fields: [{ name: 'samples', label: 'Sample transcript', type: 'textarea', required: true }],
  },
  {
    id: 'keywords',
    label: 'Keywords',
    hint: 'Autocomplete-based keyword research, no API key.',
    fields: [{ name: 'seed', label: 'Seed keyword', placeholder: 'latte art', required: true }],
  },
  {
    id: 'transcript',
    label: 'Transcript',
    hint: 'Fetch public captions for a YouTube URL.',
    fields: [{ name: 'url', label: 'YouTube URL', placeholder: 'https://youtu.be/…', required: true }],
  },
  {
    id: 'thumbnails',
    label: 'Thumbnails',
    hint: 'Thumbnail concepts: composition, overlay, emotion, colors.',
    fields: [
      { name: 'topic', label: 'Topic', placeholder: 'latte art basics', required: true },
      { name: 'count', label: 'Count', type: 'number', value: '3' },
    ],
  },
  {
    id: 'faceless',
    label: 'Faceless run',
    hint: 'Topic → script → brief → render. Mock engine unless MoneyPrinterTurbo API is running. Never posts.',
    fields: [
      { name: 'topic', label: 'Topic', placeholder: 'latte art basics', required: true },
      { name: 'duration', label: 'Duration (seconds)', type: 'number', value: '60' },
      { name: 'niche', label: 'Niche (optional)' },
      {
        name: 'engine',
        label: 'Engine',
        type: 'select',
        options: ['mock', 'kokoro', 'moneyprinterturbo'],
      },
    ],
  },
  {
    id: 'plan',
    label: 'Factory: plan',
    hint: 'Fill the backlog with ideas for a niche (status: new).',
    fields: [
      { name: 'niche', label: 'Niche', placeholder: 'home espresso', required: true },
      { name: 'count', label: 'Count', type: 'number', value: '10' },
    ],
  },
  {
    id: 'produce',
    label: 'Factory: produce',
    hint: 'Render the next N backlog ideas: script → video → quality gate → publish packet.',
    fields: [
      { name: 'count', label: 'How many', type: 'number', value: '1' },
      { name: 'engine', label: 'Engine', type: 'select', options: ['kokoro', 'mock', 'moneyprinterturbo'] },
      { name: 'duration', label: 'Duration (seconds)', type: 'number', value: '60' },
    ],
  },
  {
    id: 'save',
    label: 'Save idea',
    hint: 'Add an idea to the manager (statuses: new → scripted → rendered → posted).',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'niche', label: 'Niche (optional)' },
      { name: 'hook', label: 'Hook (optional)' },
      { name: 'notes', label: 'Notes (optional)' },
    ],
  },
];

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
<title>Content Studio — reel-pipeline</title>
<style>
  :root {
    color-scheme: dark;
    --bg:#0b1020;
    --surface:#0b1020;
    --raised:#141a2f;
    --line:#26304f;
    --text:#e6e9f2;
    --muted:#8b93ad;
    --dim:#8b93ad;
    --evidence:#e6e9f2;
    --verified:#5eead4;
    --risk:#fb7185;
    --warning:#f2c14e;
    --focus:#5eead4;
    --radius:6px;
  }
  * { box-sizing: border-box; }
  html { background:var(--bg); }
  body {
    margin:0;
    min-width:320px;
    background:var(--bg);
    color:var(--text);
    font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    text-rendering:optimizeLegibility;
  }
  button, input, textarea, select { font:inherit; }
  button, a, input, textarea, select { outline:none; }
  :focus-visible { outline:2px solid var(--focus); outline-offset:2px; }
  a { color:var(--evidence); }
  .skip-link { position:absolute; left:12px; top:-50px; z-index:20; background:var(--text); color:var(--bg); padding:8px 12px; }
  .skip-link:focus { top:12px; }
  .product-bar {
    min-height:64px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:24px;
    padding:12px clamp(16px,3vw,40px);
    border-bottom:1px solid var(--line);
    background:#090c11;
  }
  .brand-lockup { display:flex; align-items:center; gap:12px; min-width:0; }
  .brand-mark { width:10px; height:32px; border-radius:3px; background:var(--verified); box-shadow:0 8px 22px rgba(130,217,167,.22); }
  .brand-lockup h1 { margin:0; font-size:17px; letter-spacing:-.02em; }
  .brand-lockup p { margin:1px 0 0; color:var(--muted); font-size:12px; }
  .utility-links { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  .utility-links a { min-height:44px; display:inline-flex; align-items:center; color:var(--muted); font-size:13px; text-decoration:none; }
  .utility-links a:hover { color:var(--text); }
  .primary-nav {
    display:flex;
    gap:4px;
    padding:10px clamp(16px,3vw,40px);
    border-bottom:1px solid var(--line);
    background:#0b0e13;
    overflow-x:auto;
  }
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
  .shell { width:min(1280px,100%); margin:0 auto; padding:clamp(18px,3vw,36px); }
  .view[hidden] { display:none; }
  .view-head { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:24px; }
  .view-head h2 { margin:0; font-size:24px; letter-spacing:-.025em; }
  .view-head p { margin:5px 0 0; color:var(--muted); max-width:68ch; }
  .count-note { color:var(--dim); font-size:12px; white-space:nowrap; }
  .create-grid { display:grid; grid-template-columns:minmax(0,1.06fr) minmax(360px,.94fr); gap:20px; align-items:start; }
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
  .button-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .button {
    min-height:44px;
    border:1px solid var(--line);
    border-radius:8px;
    background:var(--raised);
    color:var(--text);
    padding:8px 13px;
    font-weight:650;
    text-decoration:none;
    cursor:pointer;
  }
  .button:hover { border-color:#485462; background:#1b222c; }
  .button.primary { background:var(--verified); border-color:var(--verified); color:#07130c; }
  .button.primary:hover { background:#9ce8b8; }
  .button.danger { color:#ffd3d7; border-color:#6c3940; }
  .button[disabled] { opacity:.48; cursor:not-allowed; }
  .field-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
  .brief-group { max-width:560px; border-top:1px solid var(--line); padding:10px 0; }
  .brief-group:last-of-type { border-bottom:1px solid var(--line); }
  .brief-group summary { color:var(--text); font-weight:600; cursor:pointer; }
  .brief-group[open] summary { margin-bottom:10px; }
  label { display:grid; gap:5px; color:var(--muted); font-size:12px; }
  label.wide { grid-column:1/-1; }
  input, textarea, select {
    width:100%;
    min-height:44px;
    background:#0b0f15;
    border:1px solid var(--line);
    color:var(--text);
    border-radius:8px;
    padding:9px 10px;
  }
  input:hover, textarea:hover, select:hover { border-color:#46515e; }
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
  .workflow.active { background:#151c21; }
  .workflow strong { display:block; font-size:13px; }
  .workflow span { display:block; color:var(--muted); font-size:12px; margin-top:2px; }
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
  .state.ready::before, .state.distributed::before { background:var(--verified); }
  .state.blocked::before, .state.failed::before { background:var(--risk); }
  .state.needs-input::before, .state.needs-review::before { background:var(--warning); }
  .feedback { min-height:20px; margin-top:10px; color:var(--muted); font-size:13px; }
  .feedback.error { color:var(--risk); }
  .feedback.success { color:var(--verified); }
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
  .production video { width:100%; max-height:360px; background:#000; border-radius:10px; }
  .empty-state { border:1px dashed var(--line); border-radius:var(--radius); padding:28px; color:var(--muted); }
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
  .tools-layout { display:grid; grid-template-columns:220px minmax(0,1fr); border:1px solid var(--line); border-radius:var(--radius); overflow:hidden; min-height:620px; }
  .tool-nav { border-right:1px solid var(--line); background:#0d1117; padding:8px; }
  .tool-nav button { display:block; min-height:44px; width:100%; text-align:left; border:0; background:transparent; color:var(--muted); padding:8px 10px; border-radius:7px; cursor:pointer; }
  .tool-nav button:hover { color:var(--text); background:var(--surface); }
  .tool-nav button.active { color:var(--text); background:var(--raised); }
  .tool-panel { display:none; padding:22px; }
  .tool-panel.active { display:block; }
  .tool-panel h3 { margin:0; font-size:17px; }
  .hint { color:var(--muted); margin:4px 0 16px; }
  .tool-panel form { display:grid; gap:11px; max-width:680px; }
  .result { margin-top:16px; }
  .result pre { background:#090c11; border:1px solid var(--line); border-radius:8px; padding:12px; overflow:auto; white-space:pre-wrap; word-break:break-word; }
  .result .meta { display:flex; gap:10px; align-items:center; margin-bottom:6px; font-size:12px; color:var(--dim); }
  .copy { min-height:36px; border:1px solid var(--line); background:transparent; color:var(--muted); border-radius:7px; padding:5px 9px; cursor:pointer; }
  .copy:hover { color:var(--text); border-color:#46515e; }
  table { border-collapse:collapse; width:100%; margin-top:10px; font-size:13px; }
  th, td { text-align:left; border-bottom:1px solid var(--line); padding:8px; vertical-align:top; }
  th { color:var(--muted); font-weight:600; }
  .loading-line { height:48px; border-bottom:1px solid var(--line); background:linear-gradient(90deg,var(--surface),var(--raised),var(--surface)); background-size:220% 100%; animation:loading 1.2s linear infinite; }
  @keyframes loading { to { background-position:-220% 0; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; } }
  @media (max-width:900px) {
    .create-grid,.distribution-grid { grid-template-columns:1fr; }
    .production { grid-template-columns:1fr; }
    .tools-layout { grid-template-columns:1fr; }
    .tool-nav { display:flex; gap:4px; overflow-x:auto; border-right:0; border-bottom:1px solid var(--line); }
    .tool-nav button { width:auto; white-space:nowrap; }
  }
  @media (max-width:600px) {
    .product-bar { align-items:flex-start; padding:12px 16px; }
    .brand-lockup p { display:none; }
    .utility-links { gap:10px; justify-content:flex-end; }
    .utility-links a { font-size:12px; }
    .primary-nav { display:grid; grid-template-columns:repeat(4,minmax(96px,1fr)); padding:8px; }
    .primary-nav button { padding:8px 9px; }
    .shell { padding:18px 14px 28px; }
    .view-head { align-items:flex-start; flex-direction:column; gap:6px; }
    .view-head h2 { font-size:21px; }
    .field-grid { grid-template-columns:1fr; }
    label.wide,.checkline { grid-column:auto; }
    .brief-actions { align-items:flex-start; flex-direction:column; }
    .button-row { width:100%; }
    .button-row .button { flex:1; text-align:center; }
    .workflow { grid-template-columns:1fr; }
    .state { justify-self:start; }
    .stage-body,.tool-panel { padding:15px; }
    .message { max-width:94%; }
    table { display:block; overflow-x:auto; }
  }

  /* Preserve the incumbent Content Studio shell: compact header, persistent
     left navigation, one quiet work plane, and its original teal action. */
  body {
    display:grid;
    grid-template-columns:180px minmax(0,1fr);
    grid-template-rows:42px minmax(calc(100vh - 42px),auto);
    font:14px/1.45 -apple-system,"Segoe UI",Roboto,sans-serif;
  }
  .product-bar {
    grid-column:1/-1;
    grid-row:1;
    min-height:42px;
    justify-content:flex-start;
    gap:12px;
    padding:10px 16px;
    background:var(--bg);
  }
  .brand-lockup { gap:0; }
  .brand-lockup h1 { font-size:16px; letter-spacing:0; }
  .brand-mark,.brand-lockup p { display:none; }
  .utility-links { gap:12px; }
  .utility-links a {
    min-height:0;
    color:var(--dim);
    font-size:12px;
  }
  .menu-button {
    display:none;
    border:1px solid var(--line);
    border-radius:5px;
    background:var(--raised);
    color:var(--text);
    padding:5px 9px;
    font:inherit;
    cursor:pointer;
  }
  .primary-nav {
    grid-column:1;
    grid-row:2;
    display:block;
    min-width:0;
    padding:8px 0;
    border-right:1px solid var(--line);
    border-bottom:0;
    background:var(--bg);
    overflow-y:auto;
  }
  .primary-nav button {
    display:block;
    width:100%;
    min-height:0;
    padding:7px 14px;
    border:0;
    border-radius:0;
    color:var(--dim);
    text-align:left;
    font-weight:400;
  }
  .primary-nav button:hover { color:var(--text); background:transparent; }
  .primary-nav button[aria-selected="true"],
  .primary-nav button.active {
    color:var(--verified);
    background:var(--raised);
  }
  .nav-divider {
    margin:10px 14px 4px;
    padding-top:9px;
    border-top:1px solid var(--line);
    color:var(--dim);
    font-size:10px;
    font-weight:700;
    letter-spacing:.08em;
    text-transform:uppercase;
  }
  .shell {
    grid-column:2;
    grid-row:2;
    width:100%;
    max-width:none;
    margin:0;
    padding:16px;
    overflow:hidden;
  }
  .view { max-width:960px; }
  .view-head {
    align-items:flex-start;
    margin-bottom:18px;
  }
  .view-head h2 { font-size:22px; letter-spacing:0; }
  .view-head p { margin-top:10px; color:var(--dim); }
  .count-note { color:var(--dim); }
  .create-grid,.distribution-grid {
    display:grid;
    grid-template-columns:minmax(0,1fr);
    gap:26px;
    max-width:760px;
  }
  .stage {
    max-width:760px;
    border:0;
    border-radius:0;
    background:transparent;
    overflow:visible;
  }
  .stage + .stage { margin-top:26px; }
  .stage-head {
    padding:0;
    border:0;
  }
  .stage-head h3 { font-size:16px; letter-spacing:0; }
  .stage-head p { margin:4px 0 14px; color:var(--dim); }
  .stage-body { padding:0; }
  .conversation {
    min-height:0;
    max-width:560px;
    margin-bottom:14px;
  }
  .message {
    max-width:100%;
    border-radius:6px;
    background:var(--raised);
  }
  .message.operator,.message.assistant { justify-self:stretch; }
  .message.assistant { background:transparent; color:var(--text); }
  .composer,#brief-form,.tool-panel form { max-width:560px; }
  .button {
    min-height:0;
    border-radius:6px;
    padding:8px 18px;
    font-weight:600;
  }
  .button.primary {
    color:#04211c;
    background:var(--verified);
    border-color:var(--verified);
  }
  .button.primary:hover { background:#7be8d9; }
  .field-grid { grid-template-columns:minmax(0,1fr); gap:10px; }
  label.wide,.checkline { grid-column:auto; }
  input,textarea,select {
    min-height:0;
    border-radius:6px;
    padding:7px 9px;
    background:var(--raised);
  }
  textarea { min-height:92px; }
  .checkline { min-height:32px; }
  .brief-actions {
    align-items:flex-start;
    flex-direction:column;
    max-width:560px;
  }
  .workflow-list {
    max-width:760px;
    border-top:1px solid var(--line);
  }
  .workflow {
    min-height:0;
    padding:10px 0;
    border-bottom:1px solid var(--line);
  }
  .workflow:hover { background:transparent; }
  .workflow.active {
    padding-left:10px;
    color:var(--verified);
    background:var(--raised);
  }
  .workflow-list > .copy { margin-top:8px; }
  .state { border-radius:5px; }
  .feedback.success { color:var(--verified); }
  .production-list { max-width:760px; }
  .production { grid-template-columns:minmax(0,1fr); }
  .production video { max-width:320px; border-radius:6px; }
  .empty-state {
    border-radius:6px;
    padding:16px;
  }
  .boundary {
    max-width:560px;
    border-color:var(--line);
    border-radius:6px;
    background:var(--raised);
    color:var(--dim);
  }
  .tools-layout {
    display:block;
    min-height:0;
    border:0;
    border-radius:0;
    overflow:visible;
  }
  .tool-nav { display:none; }
  .tool-panel {
    max-width:960px;
    padding:0;
  }
  .tool-panel h3 { font-size:22px; }
  .result pre { background:var(--raised); }
  .copy { border-radius:5px; }
  .loading-line { max-width:760px; background:var(--raised); animation:none; }
  @media (max-width:600px) {
    body {
      grid-template-columns:minmax(0,1fr);
      grid-template-rows:52px minmax(calc(100vh - 52px),auto);
    }
    .product-bar {
      justify-content:flex-start;
      padding:4px 10px;
    }
    .menu-button {
      display:inline-flex;
      align-items:center;
      min-height:44px;
      margin-left:auto;
    }
    .utility-links { justify-content:flex-start; }
    .utility-links a { min-height:44px; }
    .primary-nav {
      position:fixed;
      z-index:12;
      top:52px;
      bottom:0;
      left:0;
      display:block;
      width:180px;
      padding:8px 0;
      box-shadow:14px 0 28px rgba(4,7,18,.38);
      overflow-x:hidden;
      transform:translateX(-100%);
    }
    .primary-nav.open { transform:translateX(0); }
    .primary-nav button {
      min-height:44px;
      padding:11px 14px;
    }
    .shell {
      grid-column:1;
      padding:16px;
    }
    .view-head { gap:6px; }
    .view-head h2 { font-size:22px; }
    .button-row { width:auto; }
    .button-row .button { min-height:44px; flex:0 0 auto; }
    .copy { min-height:44px; }
    input,select { min-height:44px; }
    .checkline { min-height:44px; }
    .brief-group summary { display:flex; min-height:44px; align-items:center; }
    .workflow { grid-template-columns:minmax(0,1fr); }
    .stage-body,.tool-panel { padding:0; }
  }
</style>
</head>
<body>
<a class="skip-link" href="#workspace">Skip to workspace</a>
<header class="product-bar">
  <div class="brand-lockup"><h1>Content Studio</h1></div>
  <button class="menu-button" id="menu-button" type="button" aria-expanded="false" aria-controls="content-nav">Menu</button>
  <nav class="utility-links" aria-label="Related production surfaces">
    <a href="/review">review UI →</a>
  </nav>
</header>
<nav class="primary-nav" id="content-nav" aria-label="Content Studio">
  <div role="tablist" aria-label="Content Studio views">
    <button id="tab-create" type="button" role="tab" aria-selected="true" aria-controls="view-create" data-view="create">Create video</button>
    <button id="tab-productions" type="button" role="tab" aria-selected="false" aria-controls="view-productions" data-view="productions" tabindex="-1">Productions</button>
    <button id="tab-distribute" type="button" role="tab" aria-selected="false" aria-controls="view-distribute" data-view="distribute" tabindex="-1">Distribute</button>
    <button id="tab-tools" type="button" role="tab" aria-selected="false" aria-controls="view-tools" data-view="tools" tabindex="-1">Tools</button>
  </div>
  <div class="nav-divider">Studio tools</div>
  ${TOOLS.map((tool) => `<button type="button" data-tool-shortcut="${tool.id}">${tool.label}</button>`).join('')}
  <button type="button" data-tool-shortcut="manager">Ideas manager</button>
  <button type="button" data-tool-shortcut="renders">Renders</button>
</nav>
<main class="shell" id="workspace" tabindex="-1">
  <section class="view" id="view-create" role="tabpanel" aria-labelledby="tab-create">
    <div class="view-head">
      <div>
        <h2>Describe the video. Shape the production.</h2>
        <p>Talk naturally. The Studio turns your request into an editable brief and keeps execution behind one explicit action.</p>
      </div>
      <span class="count-note" id="brief-count">Loading briefs…</span>
    </div>
    <div class="create-grid">
      <div>
        <section class="stage" aria-labelledby="conversation-title">
          <div class="stage-head">
            <h3 id="conversation-title">Conversation</h3>
            <p>Ask for a lesson, product reel, app demo, coherent film, or podcast short.</p>
          </div>
          <div class="stage-body">
            <div class="conversation" id="conversation" aria-live="polite">
              <div class="message empty">Try: “Create a 45-second High Signal app demo for Instagram with a presenter.”</div>
            </div>
            <form class="composer" id="composer">
              <label for="request">What should we make?</label>
              <textarea id="request" required placeholder="Describe the story, product, audience, channel, duration, and any footage you already have."></textarea>
              <div class="button-row">
                <button class="button primary" type="submit" id="compose-button">Create brief</button>
                <button class="button" type="button" id="new-brief-button">Clear</button>
              </div>
              <div class="feedback" id="compose-feedback" aria-live="polite"></div>
            </form>
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
                    <option value="moneyprinterturbo">MoneyPrinterTurbo</option>
                  </select>
                </label>
                <label>Title
                  <input id="brief-name" placeholder="Video title">
                </label>
              </div>
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
  </section>

  <section class="view" id="view-productions" role="tabpanel" aria-labelledby="tab-productions" hidden>
    <div class="view-head">
      <div>
        <h2>Productions</h2>
        <p>Saved intent, render evidence, quality state, and the authoritative next decision.</p>
      </div>
      <button class="button" type="button" id="refresh-productions">Refresh</button>
    </div>
    <div id="production-list"><div class="loading-line"></div><div class="loading-line"></div></div>
  </section>

  <section class="view" id="view-distribute" role="tabpanel" aria-labelledby="tab-distribute" hidden>
    <div class="view-head">
      <div>
        <h2>Prepare the handoff</h2>
        <p>Reel Pipeline can create an unscheduled Postiz draft. Postiz remains the only calendar, scheduler, publisher, and analytics surface.</p>
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
            <button class="button primary" type="button" id="draft-button" disabled>Create Postiz draft</button>
          </div>
          <div class="feedback" id="distribution-feedback" aria-live="polite"></div>
        </div>
      </section>
      <section class="stage">
        <div class="stage-head">
          <h3>Schedule in Postiz</h3>
          <p>Calendar and provider actions stay with the connected social system.</p>
        </div>
        <div class="stage-body">
          <p id="postiz-boundary" class="hint">Loading the configured distribution boundary…</p>
          <div class="boundary">No schedule picker appears here by design. Creating a draft never schedules or publishes it.</div>
          <div class="button-row" style="margin-top:16px">
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
let postizReadiness = null;
let showAllWorkflows = false;
let briefDirty = false;

const contentNav = document.getElementById('content-nav');
const menuButton = document.getElementById('menu-button');
const mobileNavQuery = window.matchMedia('(max-width:600px)');
function syncMobileNav() {
  const open = contentNav.classList.contains('open');
  contentNav.inert = mobileNavQuery.matches && !open;
}
menuButton.addEventListener('click', () => {
  const open = contentNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  syncMobileNav();
});
function closeMobileNav(options = {}) {
  const wasOpen = contentNav.classList.contains('open');
  contentNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  syncMobileNav();
  if (options.focusView && wasOpen && mobileNavQuery.matches) {
    const heading = document.querySelector('.view:not([hidden]) .view-head h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }
}
mobileNavQuery.addEventListener('change', syncMobileNav);
syncMobileNav();
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileNav();
    menuButton.focus();
  }
});

const viewButtons = Array.from(document.querySelectorAll('[data-view]'));
const toolShortcutButtons = Array.from(document.querySelectorAll('[data-tool-shortcut]'));
for (const button of viewButtons) {
  button.addEventListener('click', () => {
    activateView(button.dataset.view);
    closeMobileNav({ focusView:true });
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
    closeMobileNav({ focusView:true });
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

document.getElementById('open-postiz').addEventListener('click', (event) => {
  if (event.currentTarget.getAttribute('aria-disabled') === 'true') event.preventDefault();
});

for (const brand of BRANDS) {
  const option = document.createElement('option');
  option.value = brand.slug;
  option.textContent = brand.name;
  document.getElementById('brief-project').appendChild(option);
}

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
    if (refining) {
      if (briefDirty) await saveBrief({ silent:true });
      activeBrief = await api('/studio/briefs/' + encodeURIComponent(activeBrief.id) + '/refine', {
        method:'POST',
        body:JSON.stringify({ instruction:request }),
      });
    } else {
      activeBrief = await api('/studio/briefs', {
        method:'POST',
        body:JSON.stringify({ request }),
      });
    }
    await loadBriefs(activeBrief.id);
    requestInput.value = '';
    setFeedback(
      'compose-feedback',
      refining
        ? 'Brief refined. Review the changed fields before choosing the next action.'
        : 'Brief created. Review the fields before choosing the next action.',
      'success',
    );
  } catch (error) {
    setFeedback('compose-feedback', error.message, 'error');
  } finally {
    setBusy('compose-button', false, activeBrief ? 'Refine brief' : 'Create brief');
  }
});

document.getElementById('new-brief-button').addEventListener('click', () => {
  if (briefDirty && !window.confirm('Discard unsaved changes to this brief?')) return;
  activeBrief = null;
  showAllWorkflows = false;
  document.getElementById('request').value = '';
  document.getElementById('conversation').innerHTML = '<div class="message empty">Describe the next video. Nothing renders until you confirm its brief.</div>';
  clearBriefForm();
  renderWorkflowList();
});

const briefForm = document.getElementById('brief-form');
briefForm.addEventListener('input', () => markBriefDirty());
briefForm.addEventListener('change', () => markBriefDirty());
document.getElementById('brief-kind').addEventListener('change', (event) => {
  if (!activeBrief) return;
  activeBrief = { ...activeBrief, kind:event.target.value };
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

async function loadBriefs(selectedId) {
  briefs = await api('/studio/briefs');
  activeBrief = briefs.find((brief) => brief.id === selectedId)
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
  setValue('brief-kind', brief.kind);
  setValue('brief-project', brief.projectSlug || '');
  setValue('brief-channel', brief.channel);
  setValue('brief-duration', brief.durationSeconds);
  setValue('brief-engine', brief.engine);
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
  document.getElementById('brief-creative-approved').checked = brief.approval?.creativeStatus === 'approved';
  document.getElementById('brief-quality-accepted').checked = brief.approval?.qualityAccepted === true;
  briefDirty = false;
  document.getElementById('save-brief-button').disabled = true;
  renderConversation(brief);
  renderBriefAction(brief);
  renderWorkflowList();
}

function clearBriefForm() {
  briefDirty = false;
  setComposerMode(false);
  for (const id of ['brief-project','brief-name','brief-hook','brief-summary','brief-direction','brief-cta','brief-source-url','brief-claim','brief-destination','brief-public-url']) setValue(id, '');
  setValue('brief-kind', 'faceless');
  setValue('brief-channel', 'youtube_shorts');
  setValue('brief-duration', 60);
  setValue('brief-engine', 'mock');
  setValue('brief-rights', 'unknown');
  document.getElementById('brief-creative-approved').checked = false;
  document.getElementById('brief-quality-accepted').checked = false;
  document.getElementById('save-brief-button').disabled = true;
  document.getElementById('execute-button').disabled = true;
  document.getElementById('brief-state').textContent = 'No brief selected';
}

function setComposerMode(refining) {
  document.querySelector('label[for="request"]').textContent = refining ? 'What should we change?' : 'What should we make?';
  document.getElementById('request').placeholder = refining
    ? 'Try “make it 30 seconds,” “switch to Instagram,” or “turn this into an app demo.”'
    : 'Describe the story, product, audience, channel, duration, and any footage you already have.';
  document.getElementById('compose-button').textContent = refining ? 'Refine brief' : 'Create brief';
  document.getElementById('new-brief-button').textContent = refining ? 'New brief' : 'Clear';
}

function renderConversation(brief) {
  const box = document.getElementById('conversation');
  if (!brief.messages?.length) {
    box.innerHTML = '<div class="message empty">This brief has no conversation history.</div>';
    return;
  }
  box.innerHTML = brief.messages.map((message) =>
    '<div class="message ' + (message.role === 'assistant' ? 'assistant' : 'operator') + '">' +
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
      showAllWorkflows = false;
      markBriefDirty();
      renderWorkflowList();
    });
  }
}

function collectBriefPatch() {
  return {
    kind:value('brief-kind'),
    projectSlug:value('brief-project') || null,
    channel:value('brief-channel'),
    durationSeconds:Number(value('brief-duration')),
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
    if (activeBrief.kind !== 'faceless') {
      const destination = activeBrief.continuation?.href;
      if (!destination) throw new Error(activeBrief.continuation?.blocker || 'Continuation is not ready');
      window.location.href = destination;
      return;
    }
    setBusy('execute-button', true, 'Creating video…');
    setFeedback('brief-feedback', 'Rendering the confirmed brief. No distribution action will run.');
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
  box.innerHTML = '<div class="loading-line"></div><div class="loading-line"></div>';
  try {
    const data = await api('/studio/productions');
    briefs = data.briefs;
    if (!data.briefs.length && !data.legacyRenders.length) {
      box.innerHTML = '<div class="empty-state"><strong>No productions yet.</strong><br>Start in Create. A confirmed faceless brief can render locally; every other workflow continues in its named production surface.</div>';
      return;
    }
    const current = data.briefs.map(renderProduction).join('');
    const legacy = data.legacyRenders.map((render) =>
      '<article class="production"><div><h3>' + escapeText(render.title) + '</h3><p>Legacy Studio render · ' + escapeText(render.provider || 'unknown engine') + '</p></div>' +
      (render.video ? '<video controls preload="metadata" src="/studio/render-file?path=' + encodeURIComponent(render.video) + '"></video>' : '<div class="empty-state">No playable artifact</div>') +
      '</article>').join('');
    box.innerHTML = '<div class="production-list">' + current + legacy + '</div>';
  } catch (error) {
    box.innerHTML = '<div class="empty-state">Could not read productions: ' + escapeText(error.message) + '</div>';
  }
}

function renderProduction(brief) {
  const quality = brief.media?.quality;
  const media = brief.media?.videoPath
    ? '<video controls preload="metadata" src="/studio/render-file?path=' + encodeURIComponent(brief.media.videoPath) + '"></video>'
    : '<div class="empty-state">' + escapeText(brief.continuation?.blocker || 'No render artifact yet.') + '</div>';
  return '<article class="production">' +
    '<div><h3>' + escapeText(brief.title) + '</h3>' +
    '<p>' + escapeText(brief.kind.replaceAll('-', ' ')) + ' · ' + escapeText(brief.projectSlug || 'brand not selected') + ' · ' + escapeText(brief.channel.replaceAll('_', ' ')) + '</p>' +
    '<p>' + escapeText(brief.summary) + '</p>' +
    '<div class="production-meta"><span class="state ' + escapeText(brief.lifecycle) + '">' + escapeText(brief.lifecycle.replaceAll('-', ' ')) + '</span>' +
    '<span class="state">' + escapeText(brief.continuation?.owner || 'Studio') + ' owns next step</span>' +
    (quality ? '<span class="state ' + (quality.verdict === 'pass' ? 'ready' : 'needs-review') + '">quality ' + escapeText(quality.verdict) + (quality.overall ? ' · ' + quality.overall : '') + '</span>' : '') +
    '</div><div class="button-row" style="margin-top:14px"><button class="button" type="button" data-edit-brief="' + escapeText(brief.id) + '">Edit brief</button>' +
    (brief.continuation?.href ? '<a class="button" href="' + escapeText(brief.continuation.href) + '">' + escapeText(brief.continuation.label) + '</a>' : '') +
    '</div></div>' + media + '</article>';
}

document.getElementById('production-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-edit-brief]');
  if (!button) return;
  activeBrief = briefs.find((brief) => brief.id === button.dataset.editBrief) ?? null;
  if (activeBrief) {
    populateBrief(activeBrief);
    activateView('create');
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
  state.textContent = postizReadiness?.state?.replaceAll('-', ' ') || 'unavailable';
  state.className = 'state ' + (postizReadiness?.state === 'ready-for-draft' ? 'ready' : 'blocked');
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
  document.getElementById('prepare-button').disabled = !complete;
  document.getElementById('draft-button').disabled = !complete || postizReadiness?.state !== 'ready-for-draft';
}

function distributionChecks(brief) {
  const qualityPass = brief?.media?.quality?.verdict === 'pass' || brief?.approval?.qualityAccepted === true;
  const publicMedia = isStableHttps(brief?.media?.publicUrl);
  return [
    { group:'Source', label:'Fleet brand and channel', pass:Boolean(brief?.projectSlug && brief?.channel), detail:brief?.projectSlug ? brief.projectSlug + ' → ' + brief.channel.replaceAll('_',' ') : 'Choose a configured Fleet brand.', fixView:'create', fieldId:brief?.projectSlug ? 'brief-channel' : 'brief-project', fixLabel:'Fix in brief' },
    { group:'Source', label:'Canonical source and claim', pass:Boolean(brief?.sourceEvidence?.canonicalUrl && brief?.sourceEvidence?.claim), detail:'Attach the allowed claim to its source URL.', fixView:'create', fieldId:brief?.sourceEvidence?.canonicalUrl ? 'brief-claim' : 'brief-source-url', fixLabel:'Fix in brief' },
    { group:'Source', label:'Source rights', pass:brief?.sourceEvidence?.rightsStatus === 'approved', detail:'Owned or licensed source must be explicitly approved.', fixView:'create', fieldId:'brief-rights', fixLabel:'Fix in brief' },
    { group:'Approval', label:'Destination and CTA', pass:Boolean(brief?.sourceEvidence?.destinationUrl && brief?.cta), detail:'Give the post one truthful next action.', fixView:'create', fieldId:brief?.sourceEvidence?.destinationUrl ? 'brief-cta' : 'brief-destination', fixLabel:'Fix in brief' },
    { group:'Approval', label:'Creative approval', pass:brief?.approval?.creativeStatus === 'approved', detail:'Conversation and rendering never imply approval.', fixView:'create', fieldId:'brief-creative-approved', fixLabel:'Fix in brief' },
    { group:'Approval', label:'Quality evidence', pass:qualityPass, detail:'Requires a passing verdict or explicit owner acceptance.', fixView:'create', fieldId:'brief-quality-accepted', fixLabel:'Fix in brief' },
    { group:'Delivery', label:'Rendered artifact', pass:Boolean(brief?.media?.videoPath), detail:'A real render must exist before handoff.', fixView:'productions', fieldId:null, fixLabel:'Review production' },
    { group:'Delivery', label:'Stable public media', pass:publicMedia, detail:'Postiz needs a public HTTPS URL; local paths are rejected.', fixView:'create', fieldId:'brief-public-url', fixLabel:'Fix in brief' },
  ];
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
    await renderDistribution();
  }
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
Promise.all([
  loadBriefs(),
  loadCapabilities(),
  api('/studio/postiz-readiness').then((data) => { postizReadiness = data; }),
]).then(() => renderDistribution()).catch((error) => {
  setFeedback('compose-feedback', 'Workspace could not finish loading: ' + error.message, 'error');
});
</script>
</body>
</html>`;
}
