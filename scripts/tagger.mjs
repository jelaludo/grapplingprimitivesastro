/**
 * tagger.mjs — Local GIF tagging tool
 *
 * Usage:  node scripts/tagger.mjs
 * Then:   open http://localhost:3456 in your browser
 *
 * - Streams GIFs directly from the local folder (no copying needed)
 * - Each tag click auto-saves to public/gifs-manifest.json immediately
 * - Keyboard: ← → navigate,  Backspace = skip,  numbers = quick-select
 */

import http  from 'http';
import fs    from 'fs';
import path  from 'path';
import url   from 'url';

const GIF_FOLDER  = 'L:/Gifs_BJJ_4_GrapplingPrimitives_936gifs_2GB';
const MANIFEST    = './public/gifs-manifest.json';
const PORT        = 3456;

// ── Helpers ───────────────────────────────────────────────────────────────────

function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf-8'));
}
function writeManifest(m) {
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}
function mime(file) {
  if (file.endsWith('.gif'))  return 'image/gif';
  if (file.endsWith('.json')) return 'application/json';
  if (file.endsWith('.html')) return 'text/html';
  return 'text/plain';
}

// ── HTML UI ───────────────────────────────────────────────────────────────────

const HTML = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GIF Tagger</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #21262d;
    --text: #c9d1d9; --dim: #6b7280; --accent: #00d4ff;
    --green: #00ff88; --red: #ff6b6b; --amber: #ffaa00;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Courier New', monospace;
         font-size: 13px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* ── Toolbar ── */
  #toolbar {
    display: flex; align-items: center; gap: 12px; padding: 0 14px;
    height: 42px; border-bottom: 1px solid var(--border); flex-shrink: 0;
    background: var(--surface);
  }
  #toolbar h1 { font-size: 11px; letter-spacing: 0.2em; color: var(--dim); text-transform: uppercase; }
  #toolbar .sep { color: var(--border); }
  #progress { font-size: 11px; color: var(--accent); letter-spacing: 0.05em; }
  #filter-wrap { display: flex; gap: 6px; margin-left: auto; }
  .filter-btn {
    padding: 3px 10px; font-family: inherit; font-size: 10px; letter-spacing: 0.1em;
    text-transform: uppercase; border: 1px solid var(--border); background: transparent;
    color: var(--dim); border-radius: 3px; cursor: pointer; transition: all 0.12s;
  }
  .filter-btn.active { border-color: var(--accent); color: var(--accent); }

  /* ── Main layout ── */
  #main { display: flex; flex: 1; overflow: hidden; }

  /* ── GIF panel ── */
  #gif-panel {
    flex: 0 0 auto; width: 45%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 16px;
    border-right: 1px solid var(--border); background: #080b10; gap: 10px;
  }
  #gif-wrap {
    width: 100%; flex: 1; display: flex; align-items: center; justify-content: center;
    overflow: hidden; min-height: 0;
  }
  #gif-img {
    max-width: 100%; max-height: 100%; object-fit: contain;
    border-radius: 4px; display: block;
  }
  #gif-filename {
    font-size: 10px; color: var(--dim); text-align: center; word-break: break-all;
    line-height: 1.4; padding: 0 8px;
  }
  #gif-size { font-size: 10px; color: var(--dim); }
  #nav-row { display: flex; gap: 8px; align-items: center; }
  .nav-btn {
    padding: 5px 14px; font-family: inherit; font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; border: 1px solid var(--border); background: transparent;
    color: var(--dim); border-radius: 3px; cursor: pointer; transition: all 0.12s;
  }
  .nav-btn:hover { border-color: var(--accent); color: var(--accent); }
  #index-display { font-size: 12px; color: var(--text); min-width: 80px; text-align: center; }

  /* ── Tag panel ── */
  #tag-panel {
    flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 16px; gap: 16px;
  }
  .section-label {
    font-size: 9px; letter-spacing: 0.25em; color: var(--dim); text-transform: uppercase;
    margin-bottom: 6px; border-bottom: 1px solid var(--border); padding-bottom: 4px;
  }
  .pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill {
    padding: 4px 12px; font-family: inherit; font-size: 11px; letter-spacing: 0.05em;
    border: 1px solid var(--border); background: transparent; color: var(--dim);
    border-radius: 20px; cursor: pointer; transition: all 0.12s; user-select: none;
  }
  .pill:hover { border-color: #555; color: var(--text); }
  .pill.active { border-color: var(--accent); color: var(--accent); background: rgba(0,212,255,0.08); }
  .pill.active.instructor { border-color: var(--amber); color: var(--amber); background: rgba(255,170,0,0.08); }
  .pill.active.tag-pill    { border-color: var(--green); color: var(--green); background: rgba(0,255,136,0.08); }

  /* ── Status bar ── */
  #status {
    height: 28px; border-top: 1px solid var(--border); display: flex; align-items: center;
    padding: 0 14px; gap: 16px; flex-shrink: 0; background: var(--surface);
  }
  #status-text { font-size: 10px; color: var(--dim); }
  #saved-indicator {
    font-size: 10px; color: var(--green); opacity: 0; transition: opacity 0.3s;
    letter-spacing: 0.1em;
  }
  #saved-indicator.show { opacity: 1; }

  /* ── Keyboard hint ── */
  #kb-hint { font-size: 9px; color: var(--border); margin-left: auto; letter-spacing: 0.05em; }
</style>
</head>
<body>

<div id="toolbar">
  <h1>GIF Tagger</h1>
  <span class="sep">|</span>
  <span id="progress">Loading…</span>
  <div id="filter-wrap">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="untagged-inst">No instructor</button>
    <button class="filter-btn" data-filter="untagged-tech">No technique</button>
    <button class="filter-btn" data-filter="other">Other instructor</button>
  </div>
</div>

<div id="main">
  <div id="gif-panel">
    <div id="gif-wrap">
      <img id="gif-img" src="" alt="">
    </div>
    <div id="gif-filename"></div>
    <div id="gif-size"></div>
    <div id="nav-row">
      <button class="nav-btn" id="btn-prev">← Prev</button>
      <span id="index-display"></span>
      <button class="nav-btn" id="btn-next">Next →</button>
    </div>
  </div>

  <div id="tag-panel">
    <div>
      <div class="section-label">Instructor</div>
      <div class="pills" id="pills-instructors"></div>
    </div>
    <div>
      <div class="section-label">Techniques</div>
      <div class="pills" id="pills-techniques"></div>
    </div>
    <div>
      <div class="section-label">Tags</div>
      <div class="pills" id="pills-tags"></div>
    </div>
  </div>
</div>

<div id="status">
  <span id="status-text">Use ← → arrow keys to navigate. Click pills to toggle. Auto-saves on every change.</span>
  <span id="saved-indicator">✓ saved</span>
  <span id="kb-hint">← → navigate &nbsp;|&nbsp; click = toggle tag &nbsp;|&nbsp; Esc = clear techniques</span>
</div>

<script>
let manifest = null;
let filtered = [];   // array of manifest indices currently in view
let pos = 0;         // position within filtered[]
let activeFilter = 'all';
let saveTimer = null;

// ── Load ─────────────────────────────────────────────────────────────────────
async function load() {
  const r = await fetch('/api/manifest');
  manifest = await r.json();
  applyFilter(activeFilter);
  render();
}

// ── Filter ───────────────────────────────────────────────────────────────────
function applyFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === f);
  });
  filtered = manifest.gifs
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => {
      if (f === 'all')           return true;
      if (f === 'untagged-inst') return g.instructors[0] === 'other' || !g.instructors.length;
      if (f === 'untagged-tech') return !g.techniques.length;
      if (f === 'other')         return g.instructors[0] === 'other';
      return true;
    })
    .map(({ i }) => i);
  pos = 0;
  updateProgress();
}

function updateProgress() {
  const total = manifest.gifs.length;
  const tagged = manifest.gifs.filter(g =>
    g.instructors[0] !== 'other' && g.instructors.length > 0 && g.techniques.length > 0
  ).length;
  document.getElementById('progress').textContent =
    \`\${pos + 1}/\${filtered.length} shown · \${tagged}/\${total} fully tagged\`;
}

// ── Render current GIF ───────────────────────────────────────────────────────
function render() {
  if (!filtered.length) {
    document.getElementById('gif-filename').textContent = 'No GIFs match this filter.';
    document.getElementById('gif-img').src = '';
    document.getElementById('index-display').textContent = '—';
    return;
  }
  const idx = filtered[pos];
  const gif = manifest.gifs[idx];

  document.getElementById('gif-img').src = '/gif/' + encodeURIComponent(gif.file);
  document.getElementById('gif-filename').textContent = gif.file;
  document.getElementById('gif-size').textContent = gif.size_kb + ' KB';
  document.getElementById('index-display').textContent =
    \`\${pos + 1} / \${filtered.length}\`;

  renderPills('instructors', gif.instructors, 'instructor');
  renderPills('techniques',  gif.techniques,  'technique');
  renderPills('tags',        gif.tags,        'tag-pill');

  updateProgress();
}

function renderPills(field, active, cssClass) {
  const taxonomy = {
    instructors: manifest.taxonomy.instructors,
    techniques:  manifest.taxonomy.techniques,
    tags:        manifest.taxonomy.tags,
  }[field];

  const container = document.getElementById('pills-' + field);
  container.innerHTML = '';
  for (const item of taxonomy) {
    const btn = document.createElement('button');
    btn.className = 'pill ' + cssClass + (active.includes(item.id) ? ' active' : '');
    btn.textContent = item.label;
    btn.dataset.id = item.id;
    btn.addEventListener('click', () => toggleTag(field, item.id));
    container.appendChild(btn);
  }
}

// ── Toggle + save ─────────────────────────────────────────────────────────────
async function toggleTag(field, id) {
  const idx = filtered[pos];
  const gif = manifest.gifs[idx];
  const arr = gif[field];

  if (field === 'instructors') {
    // Single-select for instructors (replace, don't stack — unless it's 'other')
    if (arr.includes(id)) {
      gif[field] = arr.filter(x => x !== id);
      if (!gif[field].length) gif[field] = ['other'];
    } else {
      gif[field] = arr[0] === 'other' ? [id] : [...arr, id];
    }
  } else {
    // Multi-select for techniques + tags
    if (arr.includes(id)) {
      gif[field] = arr.filter(x => x !== id);
    } else {
      gif[field] = [...arr, id];
    }
  }

  render();
  await save();
}

async function save() {
  await fetch('/api/save', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(manifest),
  });
  const ind = document.getElementById('saved-indicator');
  ind.classList.add('show');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => ind.classList.remove('show'), 1200);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function go(delta) {
  pos = Math.max(0, Math.min(filtered.length - 1, pos + delta));
  render();
}

document.getElementById('btn-prev').addEventListener('click', () => go(-1));
document.getElementById('btn-next').addEventListener('click', () => go(+1));

document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => { applyFilter(b.dataset.filter); render(); });
});

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(+1); }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); go(-1); }
  if (e.key === 'Escape') {
    // Clear all techniques for current GIF
    const idx = filtered[pos];
    manifest.gifs[idx].techniques = [];
    render(); save();
  }
});

load();
</script>
</body>
</html>`;

// ── HTTP server ───────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  const decoded = decodeURIComponent(pathname);

  // ── Serve a GIF from local drive ──
  if (decoded.startsWith('/gif/')) {
    const filename = decoded.slice(5);
    const filepath = path.join(GIF_FOLDER, filename);
    if (!fs.existsSync(filepath)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filepath).pipe(res);
    return;
  }

  // ── GET manifest ──
  if (decoded === '/api/manifest' && req.method === 'GET') {
    const data = fs.readFileSync(MANIFEST, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
    return;
  }

  // ── POST save manifest ──
  if (decoded === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const m = JSON.parse(body);
        writeManifest(m);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400); res.end('Bad JSON');
      }
    });
    return;
  }

  // ── Serve the tagger UI ──
  if (decoded === '/' || decoded === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────────┐
  │  GIF Tagger running                             │
  │  Open: http://localhost:${PORT}                   │
  │                                                 │
  │  GIFs served from:                              │
  │  ${GIF_FOLDER}  │
  │                                                 │
  │  Manifest: ${MANIFEST.padEnd(36)} │
  │                                                 │
  │  Ctrl+C to stop                                 │
  └─────────────────────────────────────────────────┘
  `);
});
