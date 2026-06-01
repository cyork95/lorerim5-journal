/* ── Mod Wiki Section ────────────────────────────────────────────── */

let modSearchTerm  = '';
let modCatFilter   = 'All';
let expandedModId  = null;
let modDb          = null;   // loaded from data/mod-descriptions.json
let modDbStatus    = 'idle'; // 'idle' | 'loading' | 'loaded' | 'failed'

// ── Mod Description Database ──────────────────────────────────────────
async function loadModDatabase() {
  if (modDb) return modDb;
  if (modDbStatus === 'loading') return null;
  modDbStatus = 'loading';
  try {
    const res = await fetch('./data/mod-descriptions.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    modDb = json.mods || {};
    modDbStatus = 'loaded';
    console.log(`LoreRim Mod DB: loaded ${Object.keys(modDb).length} entries`);
    return modDb;
  } catch(e) {
    modDbStatus = 'failed';
    console.warn('LoreRim Mod DB: could not load', e.message);
    return null;
  }
}

// Normalise a mod name for fuzzy matching
function normaliseName(name) {
  return name
    .toLowerCase()
    .replace(/\s*[-–—]\s*(se|sse|ae|special edition|anniversary edition)$/i, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Look up a mod name in the database (exact → normalised → partial)
function lookupMod(name) {
  if (!modDb) return null;
  // 1. Exact
  if (modDb[name]) return modDb[name];
  // 2. Case-insensitive exact
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(modDb)) {
    if (key.toLowerCase() === lower) return val;
  }
  // 3. Normalised match
  const norm = normaliseName(name);
  for (const [key, val] of Object.entries(modDb)) {
    if (normaliseName(key) === norm) return val;
  }
  // 4. Partial — db key starts with the mod name or vice versa (≥15 chars to avoid false positives)
  if (norm.length >= 15) {
    for (const [key, val] of Object.entries(modDb)) {
      const kn = normaliseName(key);
      if (kn.startsWith(norm) || norm.startsWith(kn)) return val;
    }
  }
  return null;
}

const MOD_CATEGORIES = ['All','Gameplay','Visuals','Audio','Quest','Immersion','UI','Overhaul','Patch','Other'];

const CAT_KEYWORDS = {
  Gameplay:   ['requiem','combat','perk','skill','stamina','magic','spell','weapon','armor','balance','difficulty','economy','loot','crafting','alchemy','smithing','enchanting','survival'],
  Visuals:    ['enb','texture','mesh','lod','grass','water','weather','sky','lighting','shadow','flora','fauna','parallax','hd','4k','2k','graphical'],
  Audio:      ['sound','music','ambient','voice','audio','immersive sound','reverb'],
  Quest:      ['quest','adventure','dungeon','story','narrative','content','dlc','expansion','lands'],
  Immersion:  ['immersive','roleplay','npc','dialogue','realistic','needs','sleep','camping','inn','tavern','religion'],
  UI:         ['ui','hud','interface','menu','map','mcm','widget','font','compass'],
  Overhaul:   ['overhaul','revamp','rework','complete','total','redux','remaster'],
  Patch:      ['patch','fix','compat','compatibility','unofficial','ussep']
};

function autoCategory(name) {
  const lower = name.toLowerCase();
  for (const [cat, kws] of Object.entries(CAT_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) return cat;
  }
  return 'Other';
}

function renderMods() {
  const mods = window.appState.mods;
  const filtered = filterMods(mods);

  // Kick off DB load in background whenever this section opens
  loadModDatabase();

  const dbStatusHtml = {
    idle:    `<span style="color:#555;">⏳ Loading mod database…</span>`,
    loading: `<span style="color:#555;">⏳ Loading mod database…</span>`,
    loaded:  `<span style="color:#5a9a5a;">✦ Mod database loaded — ${Object.keys(modDb||{}).length} entries. Descriptions auto-fill on import.</span>`,
    failed:  `<span style="color:#c07070;">⚠ Mod database unavailable (offline or first load). Descriptions won't auto-fill.</span>`
  }[modDbStatus] || '';

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1200px;">
  <div style="margin-bottom:1.25rem;">
    <div class="section-header">📦 Mod Reference Wiki</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <!-- Import Panel -->
  <div class="card" style="margin-bottom:1.25rem;">
    <div class="card-title">📋 Bulk Import from MO2</div>
    <div style="font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:0.06em;margin-bottom:0.6rem;">${dbStatusHtml}</div>
    <textarea class="textarea" id="mo2-import-text" rows="5"
      placeholder="Paste your MO2 modlist export here (one mod per line).\nLines starting with + or - are auto-parsed. Version tags [version] are stripped.\nExample:\n+Requiem - The Roleplaying Overhaul [5.4.0]\n+SMIM - Static Mesh Improvement Mod\n-Disabled Mod Name"></textarea>
    <div style="display:flex;gap:0.75rem;margin-top:0.6rem;align-items:center;">
      <button class="btn btn-primary" onclick="importMO2List()">⬆ Import Modlist</button>
      <button class="btn btn-sm btn-danger" onclick="clearAllMods()">🗑 Clear All Mods</button>
      <span style="color:#555;font-size:0.8rem;margin-left:auto;">${mods.length} mods loaded</span>
    </div>
  </div>

  <!-- Search + Filter -->
  <div style="display:flex;gap:0.75rem;margin-bottom:0.75rem;flex-wrap:wrap;align-items:center;">
    <input class="input" id="mod-search" value="${esc(modSearchTerm)}" placeholder="🔍  Search mods…"
      oninput="modSearchTerm=this.value;rerenderModTable()" style="max-width:280px;">
    <select class="select" id="mod-cat-filter" style="max-width:160px;" onchange="modCatFilter=this.value;rerenderModTable()">
      ${MOD_CATEGORIES.map(c=>`<option value="${c}" ${modCatFilter===c?'selected':''}>${c}</option>`).join('')}
    </select>
    <span style="color:#555;font-size:0.78rem;">${filtered.length} / ${mods.length} shown</span>
  </div>

  <!-- Table Header -->
  ${mods.length ? `
  <div style="background:#111118;border:1px solid rgba(212,168,67,0.15);border-bottom:none;border-radius:3px 3px 0 0;padding:0.4rem 0.5rem;">
    <div class="mod-row" style="color:rgba(212,168,67,0.5);font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:normal;border:none;padding:0;">
      <span>On</span><span>Mod Name</span><span class="mod-cat">Category</span><span>Notes</span><span>▸</span>
    </div>
  </div>
  <div id="mod-table" style="border:1px solid rgba(212,168,67,0.15);border-radius:0 0 3px 3px;overflow:hidden;">
    ${renderModRows(filtered)}
  </div>` : `<div style="color:#555;font-style:italic;padding:1rem;">No mods imported yet. Paste your MO2 list above.</div>`}
</div>`;
}

function renderModRows(mods) {
  if (!mods.length) return `<div style="padding:0.75rem;color:#555;font-style:italic;">No mods match your filter.</div>`;
  return mods.map(mod => `
    <div>
      <div class="mod-row" id="mrow-${mod.id}">
        <input type="checkbox" class="rune-check" ${mod.enabled?'checked':''} onchange="toggleMod('${mod.id}',this.checked)">
        <span style="font-size:0.88rem;color:${mod.enabled?'#d4cfc4':'#555'};word-break:break-word;">${esc(mod.name)}</span>
        <span class="mod-cat">
          <select class="select" style="font-size:0.72rem;padding:0.2rem 0.4rem;" onchange="updateModCat('${mod.id}',this.value)">
            ${MOD_CATEGORIES.slice(1).map(c=>`<option value="${c}" ${mod.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </span>
        <span style="font-size:0.75rem;color:#555;font-style:italic;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;" title="${esc(mod.notes)}">${mod.fromDb ? '<span style="color:rgba(212,168,67,0.6);margin-right:0.3rem;" title="Auto-described from database">✦</span>' : ''}${mod.notes ? mod.notes.slice(0,35)+(mod.notes.length>35?'…':'') : ''}</span>
        <button class="btn btn-sm" style="padding:0.2rem 0.4rem;font-size:0.75rem;" onclick="toggleModExpand('${mod.id}')">${expandedModId===mod.id?'▴':'▸'}</button>
      </div>
      ${expandedModId===mod.id ? `
      <div class="mod-notes-expand">
        ${mod.nexusUrl ? `<div style="margin-bottom:0.5rem;"><a href="${esc(mod.nexusUrl)}" target="_blank" rel="noopener" style="font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:0.08em;color:#d4a843;text-decoration:none;">📚 View on Nexus Mods ↗</a></div>` : ''}
        ${mod.dbTags?.length ? `<div style="margin-bottom:0.5rem;display:flex;flex-wrap:wrap;gap:0.25rem;">${mod.dbTags.map(t=>`<span class="tag" style="font-size:0.5rem;">${esc(t)}</span>`).join('')}</div>` : ''}
        <label class="field-label">Description / Notes</label>
        <textarea class="textarea" rows="4" placeholder="Keybind reminders, gameplay rules, changelog notes, quest requirements…"
          onblur="saveModNotes('${mod.id}',this.value)">${esc(mod.notes)}</textarea>
      </div>` : ''}
    </div>`).join('');
}

function rerenderModTable() {
  const tableEl = document.getElementById('mod-table');
  if (!tableEl) return;
  const filtered = filterMods(window.appState.mods);
  tableEl.innerHTML = renderModRows(filtered);
  // update count
  const countEl = document.querySelector('#main-content span[style*="0.78rem"]');
  if (countEl) countEl.textContent = `${filtered.length} / ${window.appState.mods.length} shown`;
}

function filterMods(mods) {
  return mods.filter(mod => {
    const matchSearch = !modSearchTerm || mod.name.toLowerCase().includes(modSearchTerm.toLowerCase()) || mod.notes.toLowerCase().includes(modSearchTerm.toLowerCase());
    const matchCat = modCatFilter === 'All' || mod.category === modCatFilter;
    return matchSearch && matchCat;
  });
}

async function importMO2List() {
  const raw = document.getElementById('mo2-import-text')?.value || '';
  if (!raw.trim()) return;

  // Ensure DB is loaded before importing
  if (!modDb) await loadModDatabase();

  const lines = raw.split('\n').map(l=>l.trim()).filter(Boolean);
  let added = 0, skipped = 0, described = 0;
  const existingNames = new Set(window.appState.mods.map(m=>m.name.toLowerCase()));

  for (const line of lines) {
    // Skip comment lines and MO2 separator entries
    if (line.startsWith('#') || /_separator\s*$/i.test(line)) continue;

    let name = line
      .replace(/^[+\-\*]\s*/, '')
      .replace(/\s*[\[(][^\])]*[\])]$/g, '')
      .trim();
    if (!name) continue;
    if (existingNames.has(name.toLowerCase())) { skipped++; continue; }

    const enabled = !line.startsWith('-');
    const dbEntry = lookupMod(name);
    const category = dbEntry?.category || autoCategory(name);
    const notes    = dbEntry?.summary  || '';
    const nexusUrl = dbEntry?.nexusUrl || '';
    const tags     = dbEntry?.tags     || [];

    window.appState.mods.push({
      id: generateId(),
      name,
      category,
      enabled,
      notes,
      nexusUrl,
      dbTags: tags,
      fromDb: !!dbEntry
    });
    existingNames.add(name.toLowerCase());
    added++;
    if (dbEntry) described++;
  }

  saveState();
  document.getElementById('mo2-import-text').value = '';
  renderMods();
  const dbMsg = described > 0 ? ` ${described} auto-described from database.` : '';
  showToast(`Imported ${added} mods.${skipped > 0 ? ' '+skipped+' duplicates skipped.' : ''}${dbMsg}`);
}

function toggleMod(id, checked) {
  const mod = window.appState.mods.find(m=>m.id===id);
  if (mod) { mod.enabled = checked; saveState(); }
}

function updateModCat(id, cat) {
  const mod = window.appState.mods.find(m=>m.id===id);
  if (mod) { mod.category = cat; saveState(); }
}

function toggleModExpand(id) {
  expandedModId = expandedModId === id ? null : id;
  rerenderModTable();
}

function saveModNotes(id, notes) {
  const mod = window.appState.mods.find(m=>m.id===id);
  if (mod) { mod.notes = notes; saveState(); }
}

function clearAllMods() {
  if (!confirm('Remove ALL mods from the wiki? This cannot be undone.')) return;
  window.appState.mods = [];
  saveState();
  renderMods();
}
