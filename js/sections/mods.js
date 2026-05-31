/* ── Mod Wiki Section ────────────────────────────────────────────── */

let modSearchTerm = '';
let modCatFilter  = 'All';
let expandedModId = null;

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

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1200px;">
  <div style="margin-bottom:1.25rem;">
    <div class="section-header">📦 Mod Reference Wiki</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <!-- Import Panel -->
  <div class="card" style="margin-bottom:1.25rem;">
    <div class="card-title">📋 Bulk Import from MO2</div>
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
        <span style="font-size:0.75rem;color:#555;font-style:italic;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;" title="${esc(mod.notes)}">${mod.notes ? '📝 '+mod.notes.slice(0,30)+(mod.notes.length>30?'…':'') : ''}</span>
        <button class="btn btn-sm" style="padding:0.2rem 0.4rem;font-size:0.75rem;" onclick="toggleModExpand('${mod.id}')">${expandedModId===mod.id?'▴':'▸'}</button>
      </div>
      ${expandedModId===mod.id ? `
      <div class="mod-notes-expand">
        <label class="field-label">Custom Notes / Rules / Changelog</label>
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

function importMO2List() {
  const raw = document.getElementById('mo2-import-text')?.value || '';
  if (!raw.trim()) return;

  const lines = raw.split('\n').map(l=>l.trim()).filter(Boolean);
  let added = 0, skipped = 0;
  const existingNames = new Set(window.appState.mods.map(m=>m.name.toLowerCase()));

  for (const line of lines) {
    // Strip MO2 prefix (+/-/*), strip version tags like [5.4.0] or (v3)
    let name = line
      .replace(/^[+\-\*]\s*/, '')
      .replace(/\s*[\[(][^\])]*[\])]$/g, '')
      .trim();
    if (!name) continue;

    if (existingNames.has(name.toLowerCase())) { skipped++; continue; }

    const enabled = !line.startsWith('-');
    const category = autoCategory(name);
    window.appState.mods.push({ id: generateId(), name, category, enabled, notes: '' });
    existingNames.add(name.toLowerCase());
    added++;
  }

  saveState();
  document.getElementById('mo2-import-text').value = '';
  renderMods();
  showToast(`Imported ${added} mods. ${skipped > 0 ? skipped+' duplicates skipped.' : ''}`);
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
