/* ── LoreRim Utilities Section ──────────────────────────────────── */

const WEAPONS = ['1H Sword','1H Axe','1H Mace','2H Greatsword','2H Battleaxe','2H Warhammer','Bow','Crossbow','Dual Wield','Magic / Staff','Unarmed'];
const STANCES  = ['High','Mid','Low'];
const ROLES    = ['Tank / Shield','Dual Wield DPS','Archer / Ranged','Mage / Caster','Support / Healer','Assassin / Stealth'];
const ECON_BUFFS = ['Fortify Barter Enchantment','Haggling Perks (Speech)','Khajiit Trade Passive','Merchant Friend (Perk)','Frenzy Potion Active','Fence Relationship'];
const KB_CATEGORIES = ['UI','Combat','Magic','Survival','Dodging','Custom'];

let openUtilPanels = { stance:true, economy:false, safety:false, artifacts:false, keybinds:false, followers:false };

function renderUtilities() {
  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1100px;">
  <div style="margin-bottom:1.5rem;">
    <div class="section-header">🗺️ LoreRim Utilities</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>
  <div id="util-panels">
    ${renderStancePanel()}
    ${renderEconomyPanel()}
    ${renderSafetyPanel()}
    ${renderArtifactsPanel()}
    ${renderKeybindsPanel()}
    ${renderFollowersPanel()}
  </div>
</div>`;
}

// ── PANEL TOGGLE ─────────────────────────────────────────────────────
function toggleUtil(key) {
  openUtilPanels[key] = !openUtilPanels[key];
  document.getElementById(`util-body-${key}`).style.display = openUtilPanels[key] ? 'block' : 'none';
  document.getElementById(`util-arrow-${key}`).textContent  = openUtilPanels[key] ? '▾' : '▸';
}

function utilPanel(key, icon, title, content) {
  const open = openUtilPanels[key];
  return `<div class="util-panel">
    <div class="util-panel-header" onclick="toggleUtil('${key}')">
      <span>${icon} ${title}</span>
      <span id="util-arrow-${key}">${open?'▾':'▸'}</span>
    </div>
    <div class="util-panel-body" id="util-body-${key}" style="display:${open?'block':'none'};">
      ${content}
    </div>
  </div>`;
}

// ── A. STANCE & MODIFIER ─────────────────────────────────────────────
function renderStancePanel() {
  const s = window.appState.stance;
  const stanceBtns = STANCES.map(st =>
    `<button class="stance-btn ${s.stanceLevel===st?'active':''}" onclick="setStance('${st}')">${st}</button>`
  ).join('');

  return utilPanel('stance', '⚔️', 'Stance & Combat Profile', `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:0.75rem;">
      <div>
        <label class="field-label">Active Weapon</label>
        <select class="select" id="stance-weapon" onchange="saveStance()">
          <option value="">— Select —</option>
          ${WEAPONS.map(w=>`<option value="${w}" ${s.weapon===w?'selected':''}>${w}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="field-label">Combat Stance</label>
        <div style="display:flex;">${stanceBtns}</div>
      </div>
    </div>
    <div style="margin-bottom:0.75rem;">
      <label class="field-label">Keybind Profile / Macro Notes</label>
      <input class="input" id="stance-keybind" value="${esc(s.keybindProfile)}" placeholder="e.g. Profile: Combat-A, slot 1=Bound Sword, slot 2=Healing…" onblur="saveStance()">
    </div>
    <div>
      <label class="field-label">Combat Notes</label>
      <textarea class="textarea" id="stance-notes" rows="3" placeholder="Opening moves, combo strings, priority targets, blocking windows…"
        onblur="saveStance()">${esc(s.notes)}</textarea>
    </div>`);
}

function setStance(st) {
  window.appState.stance.stanceLevel = st;
  saveState();
  document.querySelectorAll('.stance-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === st);
  });
}

function saveStance() {
  const s = window.appState.stance;
  s.weapon        = document.getElementById('stance-weapon')?.value || '';
  s.keybindProfile = document.getElementById('stance-keybind')?.value || '';
  s.notes         = document.getElementById('stance-notes')?.value || '';
  saveState();
}

// ── B. ECONOMY ───────────────────────────────────────────────────────
function renderEconomyPanel() {
  const e = window.appState.economy;
  const speech = e.speechSkill || 0;
  const buffs  = e.activeBuffs  || [];

  const baseMulti = calcPriceMultiplier(speech, buffs);

  return utilPanel('economy', '💰', 'Economy Multiplier Log', `
    <div style="display:grid;grid-template-columns:150px 1fr;gap:1rem;align-items:start;">
      <div>
        <label class="field-label">Speech Skill</label>
        <input class="input" type="number" id="eco-speech" min="0" max="100" value="${speech}"
          oninput="updateEconCalc()" style="text-align:center;font-size:1.2rem;">
        <div style="text-align:center;margin-top:0.35rem;">
          <span class="stat-pill-value" id="eco-multiplier">${baseMulti}</span>
          <div class="stat-pill-label">Price Multiplier</div>
        </div>
      </div>
      <div>
        <label class="field-label">Active Trade Buffs</label>
        <div style="display:flex;flex-direction:column;gap:0.3rem;" id="eco-buffs">
          ${ECON_BUFFS.map(b=>`
          <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;cursor:pointer;">
            <input type="checkbox" class="rune-check" ${buffs.includes(b)?'checked':''} onchange="toggleEconBuff('${b}',this.checked)">
            <span>${b}</span>
          </label>`).join('')}
        </div>
        <div style="margin-top:0.75rem;padding:0.6rem;background:#12121a;border-radius:3px;font-size:0.78rem;color:#555;font-style:italic;">
          Formula: Base × (1 − Speech/200) × buff reductions.<br>
          Lower = better prices. Requiem Speech baseline: 3.0×.
        </div>
      </div>
    </div>`);
}

function calcPriceMultiplier(speech, buffs) {
  let mult = 3.0; // Requiem baseline without Speech investment
  mult -= (speech / 200) * 2.0; // 0→3.0, 100→2.0
  if (buffs.includes('Fortify Barter Enchantment')) mult *= 0.90;
  if (buffs.includes('Haggling Perks (Speech)'))    mult *= 0.85;
  if (buffs.includes('Khajiit Trade Passive'))       mult *= 0.95;
  if (buffs.includes('Merchant Friend (Perk)'))      mult *= 0.90;
  if (buffs.includes('Frenzy Potion Active'))        mult *= 0.80;
  if (buffs.includes('Fence Relationship'))          mult *= 0.85;
  return Math.max(1.0, mult).toFixed(2) + '×';
}

function updateEconCalc() {
  const speech = parseInt(document.getElementById('eco-speech')?.value) || 0;
  window.appState.economy.speechSkill = speech;
  saveState();
  const el = document.getElementById('eco-multiplier');
  if (el) el.textContent = calcPriceMultiplier(speech, window.appState.economy.activeBuffs || []);
}

function toggleEconBuff(buff, checked) {
  const buffs = window.appState.economy.activeBuffs || [];
  if (checked && !buffs.includes(buff)) buffs.push(buff);
  if (!checked) window.appState.economy.activeBuffs = buffs.filter(b=>b!==buff);
  else window.appState.economy.activeBuffs = buffs;
  saveState();
  const speech = parseInt(document.getElementById('eco-speech')?.value) || 0;
  const el = document.getElementById('eco-multiplier');
  if (el) el.textContent = calcPriceMultiplier(speech, window.appState.economy.activeBuffs);
}

// ── C. QUEST SAFETY ──────────────────────────────────────────────────
const STATUS_COLORS = { pending:'#9a9080', safe:'#5a9a5a', caution:'#c4962e', blocked:'#c05050', removed:'#604060', complete:'#4080a0' };

function renderSafetyPanel() {
  const ql = window.appState.questLifecycle;
  return utilPanel('safety', '📋', 'Quest Safety & Version 5 Lifecycle', `
    <div style="margin-bottom:0.5rem;display:flex;justify-content:flex-end;">
      <button class="btn btn-sm" onclick="addLifecycleRow()">+ Add Row</button>
    </div>
    <div id="lifecycle-table" style="display:flex;flex-direction:column;gap:0.35rem;">
      ${ql.map(r => renderLifecycleRow(r)).join('')}
    </div>`);
}

function renderLifecycleRow(r) {
  const col = STATUS_COLORS[r.status] || '#9a9080';
  return `<div style="display:grid;grid-template-columns:1fr 5rem 8rem 2rem;gap:0.5rem;align-items:center;padding:0.4rem 0.5rem;background:#12121a;border-radius:3px;border-left:3px solid ${col};" id="qlrow-${r.id}">
    <div>
      <div style="font-size:0.85rem;color:#d4cfc4;">${esc(r.name)}</div>
      ${r.alert ? `<div style="font-size:0.72rem;color:${col};margin-top:0.1rem;">${esc(r.alert)}</div>` : ''}
      ${r.notes ? `<div style="font-size:0.75rem;color:#666;margin-top:0.1rem;font-style:italic;">${esc(r.notes)}</div>` : ''}
    </div>
    ${r.levelRec ? `<div style="text-align:center;font-family:'Cinzel',serif;font-size:0.65rem;color:rgba(212,168,67,0.6);">Lv ${r.levelRec}+</div>` : '<div></div>'}
    <select class="select" style="font-size:0.72rem;padding:0.25rem;" onchange="updateLifecycleStatus('${r.id}',this.value)">
      ${Object.keys(STATUS_COLORS).map(s=>`<option value="${s}" ${r.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
    </select>
    <button class="btn btn-sm btn-danger" style="padding:0.2rem 0.35rem;" onclick="deleteLifecycleRow('${r.id}')">✕</button>
  </div>`;
}

function updateLifecycleStatus(id, status) {
  const r = window.appState.questLifecycle.find(r=>r.id===id);
  if (r) { r.status = status; saveState(); }
  const rowEl = document.getElementById(`qlrow-${r.id}`);
  if (rowEl) rowEl.style.borderLeftColor = STATUS_COLORS[status] || '#9a9080';
}

function addLifecycleRow() {
  const r = { id: generateId(), name: 'New Quest / Note', levelRec: 0, status: 'pending', alert: '', notes: '' };
  window.appState.questLifecycle.push(r);
  saveState();
  const tableEl = document.getElementById('lifecycle-table');
  if (tableEl) {
    const div = document.createElement('div');
    div.innerHTML = renderLifecycleRow(r);
    tableEl.appendChild(div.firstElementChild);
  }
}

function deleteLifecycleRow(id) {
  window.appState.questLifecycle = window.appState.questLifecycle.filter(r=>r.id!==id);
  saveState();
  document.getElementById(`qlrow-${id}`)?.remove();
}

// ── D. ARTIFACTS ─────────────────────────────────────────────────────
let expandedArtifactId = null;

function renderArtifactsPanel() {
  const arts = window.appState.artifacts;
  const collected = arts.filter(a=>a.collected).length;
  return utilPanel('artifacts', '🏆', `Artifact & Vault Matrix (${collected}/${arts.length})`, `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:0.5rem;margin-bottom:0.75rem;" id="artifact-grid">
      ${arts.map(a => renderArtifactCard(a)).join('')}
    </div>
    <div id="artifact-detail-panel"></div>`);
}

function renderArtifactCard(a) {
  return `<div class="artifact-card ${a.collected?'collected':''}" id="acard-${a.id}" onclick="openArtifactDetail('${a.id}')" title="${esc(a.name)}">
    <div class="artifact-icon">${a.icon}</div>
    <div class="artifact-name">${esc(a.name)}</div>
    ${a.collected ? '<div style="font-size:0.6rem;color:rgba(212,168,67,0.5);margin-top:0.15rem;">Collected</div>' : ''}
  </div>`;
}

function openArtifactDetail(id) {
  expandedArtifactId = expandedArtifactId === id ? null : id;
  const panel = document.getElementById('artifact-detail-panel');
  if (!panel) return;
  if (!expandedArtifactId) { panel.innerHTML=''; return; }
  const a = window.appState.artifacts.find(x=>x.id===id);
  if (!a) return;
  panel.innerHTML = `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
      <div class="card-title">${a.icon} ${esc(a.name)} <span style="font-size:0.6rem;color:#555;">[${a.type}]</span></div>
      <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.08em;">
        <input type="checkbox" class="rune-check" ${a.collected?'checked':''} onchange="toggleArtifact('${id}',this.checked)">
        Collected
      </label>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
      <div>
        <label class="field-label">Storage Location</label>
        <input class="input" id="art-loc-${id}" value="${esc(a.storageLocation)}" placeholder="e.g. Breezehome chest"
          onblur="saveArtifact('${id}')">
      </div>
      <div>
        <label class="field-label">Notes</label>
        <input class="input" id="art-notes-${id}" value="${esc(a.notes)}" placeholder="Quest source, conditions…"
          onblur="saveArtifact('${id}')">
      </div>
    </div>
  </div>`;
}

function toggleArtifact(id, checked) {
  const a = window.appState.artifacts.find(x=>x.id===id);
  if (a) { a.collected = checked; saveState(); }
  const card = document.getElementById(`acard-${id}`);
  if (card) { card.classList.toggle('collected', checked); card.innerHTML = renderArtifactCard(a).match(/>(.+)</s)?.[0] || card.innerHTML; card.outerHTML = renderArtifactCard(a); }
  openArtifactDetail(id);
}

function saveArtifact(id) {
  const a = window.appState.artifacts.find(x=>x.id===id);
  if (!a) return;
  a.storageLocation = document.getElementById(`art-loc-${id}`)?.value || '';
  a.notes           = document.getElementById(`art-notes-${id}`)?.value || '';
  saveState();
}

// ── E. KEYBINDS ──────────────────────────────────────────────────────
function renderKeybindsPanel() {
  const kbs = window.appState.keybinds;
  const byCat = {};
  KB_CATEGORIES.forEach(c => { byCat[c] = kbs.filter(k=>k.category===c); });

  let rows = '';
  for (const [cat, items] of Object.entries(byCat)) {
    if (!items.length) continue;
    rows += `<tr><td colspan="5" style="padding:0.4rem 0.5rem;font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;color:rgba(212,168,67,0.5);text-transform:uppercase;background:#111118;">${cat}</td></tr>`;
    rows += items.map(k=>`
      <tr id="kbrow-${k.id}" style="border-bottom:1px solid rgba(255,255,255,0.04);">
        <td style="padding:0.3rem 0.5rem;"><input class="input" value="${esc(k.action)}" placeholder="Action…" onblur="updateKb('${k.id}','action',this.value)" style="font-size:0.82rem;"></td>
        <td style="padding:0.3rem 0.25rem;width:70px;"><input class="input" value="${esc(k.key)}" placeholder="Key" onblur="updateKb('${k.id}','key',this.value)" style="font-size:0.82rem;text-align:center;"></td>
        <td style="padding:0.3rem 0.25rem;width:80px;"><input class="input" value="${esc(k.modifier)}" placeholder="Mod" onblur="updateKb('${k.id}','modifier',this.value)" style="font-size:0.82rem;text-align:center;"></td>
        <td style="padding:0.3rem 0.25rem;"><input class="input" value="${esc(k.notes)}" placeholder="Notes…" onblur="updateKb('${k.id}','notes',this.value)" style="font-size:0.82rem;"></td>
        <td style="padding:0.3rem 0.25rem;"><button class="btn btn-sm btn-danger" style="padding:0.2rem 0.35rem;" onclick="deleteKb('${k.id}')">✕</button></td>
      </tr>`).join('');
  }

  return utilPanel('keybinds', '⌨️', 'Keybind Reference Dashboard', `
    <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
      ${KB_CATEGORIES.map(c=>`<button class="btn btn-sm" onclick="addKb('${c}')">+ ${c}</button>`).join('')}
    </div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;" id="kb-table">
        <thead><tr style="font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;color:rgba(212,168,67,0.5);text-transform:uppercase;">
          <th style="text-align:left;padding:0.3rem 0.5rem;">Action</th>
          <th style="text-align:left;padding:0.3rem 0.25rem;width:70px;">Key</th>
          <th style="text-align:left;padding:0.3rem 0.25rem;width:80px;">Modifier</th>
          <th style="text-align:left;padding:0.3rem 0.25rem;">Notes</th>
          <th style="width:2rem;"></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`);
}

function addKb(cat) {
  const kb = { id: generateId(), action:'', key:'', modifier:'', category: cat, notes:'' };
  window.appState.keybinds.push(kb);
  saveState();
  renderUtilities(); // re-render to show new row
}
function updateKb(id, field, val) {
  const kb = window.appState.keybinds.find(k=>k.id===id);
  if (kb) { kb[field]=val; saveState(); }
}
function deleteKb(id) {
  window.appState.keybinds = window.appState.keybinds.filter(k=>k.id!==id);
  saveState();
  document.getElementById(`kbrow-${id}`)?.remove();
}

// ── F. FOLLOWERS ─────────────────────────────────────────────────────
function renderFollowersPanel() {
  const followers = window.appState.followers;
  return utilPanel('followers', '👥', 'Follower Synergy & Bond Log', `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.75rem;" id="follower-grid">
      ${followers.map(f=>renderFollowerCard(f)).join('')}
    </div>
    <button class="btn btn-sm" style="margin-top:0.75rem;" onclick="addFollower()">+ Add Follower</button>`);
}

function renderFollowerCard(f) {
  return `<div class="card" id="fcard-${f.id}" style="border-top-color:rgba(212,168,67,0.2);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
      <input class="input" value="${esc(f.name)}" placeholder="Follower name…" style="font-family:'Cinzel',serif;font-size:0.85rem;flex:1;"
        onblur="updateFollower('${f.id}','name',this.value)">
      <button class="btn btn-sm btn-danger" style="padding:0.2rem 0.35rem;margin-left:0.5rem;" onclick="deleteFollower('${f.id}')">✕</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
      <div>
        <label class="field-label">Combat Role</label>
        <select class="select" style="font-size:0.78rem;" onchange="updateFollower('${f.id}','role',this.value)">
          <option value="">— Select —</option>
          ${ROLES.map(r=>`<option value="${r}" ${f.role===r?'selected':''}>${r}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="field-label">Bond Level</label>
        <div style="display:flex;gap:0.2rem;align-items:center;padding-top:0.3rem;" id="bond-stars-${f.id}">
          ${[1,2,3,4,5].map(i=>`<span class="bond-star ${(f.bondLevel||0)>=i?'filled':''}" onclick="setFollowerBond('${f.id}',${i})">★</span>`).join('')}
        </div>
      </div>
    </div>

    <div style="margin-bottom:0.5rem;">
      <label class="field-label">Equipment / Loadout</label>
      <input class="input" value="${esc(f.equipment)}" placeholder="Weapon, armor, spells…"
        onblur="updateFollower('${f.id}','equipment',this.value)" style="font-size:0.82rem;">
    </div>
    <div>
      <label class="field-label">Narrative Progress</label>
      <textarea class="textarea" rows="2" placeholder="Bond story, completed tasks, current standing…"
        onblur="updateFollower('${f.id}','narrativeProgress',this.value)" style="font-size:0.82rem;">${esc(f.narrativeProgress)}</textarea>
    </div>
  </div>`;
}

function addFollower() {
  const f = { id: generateId(), name:'', role:'', equipment:'', bondLevel:0, narrativeProgress:'', notes:'' };
  window.appState.followers.push(f);
  saveState();
  renderUtilities();
}
function updateFollower(id, field, val) {
  const f = window.appState.followers.find(x=>x.id===id);
  if (f) { f[field]=val; saveState(); }
}
function setFollowerBond(id, level) {
  const f = window.appState.followers.find(x=>x.id===id);
  if (f) { f.bondLevel=level; saveState(); }
  const stars = document.querySelectorAll(`#bond-stars-${id} .bond-star`);
  stars.forEach((s,i) => s.classList.toggle('filled', i<level));
}
function deleteFollower(id) {
  if (!confirm('Remove this follower?')) return;
  window.appState.followers = window.appState.followers.filter(f=>f.id!==id);
  saveState();
  document.getElementById(`fcard-${id}`)?.remove();
}
