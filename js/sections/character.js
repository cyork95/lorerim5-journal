/* ── Character State Section (Quests / Magic / Equipment) ─────────── */

let charSubTab = 'quests';

function renderCharacter() {
  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1100px;">
  <div style="margin-bottom:1.25rem;">
    <div class="section-header">⚔️ Character State</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>
  <div class="subtab-bar">
    <div class="subtab ${charSubTab==='quests'?'active':''}" onclick="setCharSubTab('quests')">Quests</div>
    <div class="subtab ${charSubTab==='magic'?'active':''}"  onclick="setCharSubTab('magic')">Magic</div>
    <div class="subtab ${charSubTab==='equipment'?'active':''}" onclick="setCharSubTab('equipment')">Equipment</div>
  </div>
  <div id="char-subtab-content"></div>
</div>`;
  renderCharSubTab();
}

function setCharSubTab(tab) {
  charSubTab = tab;
  document.querySelectorAll('.subtab').forEach(el => {
    el.classList.toggle('active', el.textContent.trim().toLowerCase() === tab);
  });
  renderCharSubTab();
}

function renderCharSubTab() {
  const el = document.getElementById('char-subtab-content');
  if (charSubTab === 'quests')    el.innerHTML = renderQuestsHTML();
  if (charSubTab === 'magic')     el.innerHTML = renderMagicHTML();
  if (charSubTab === 'equipment') el.innerHTML = renderEquipmentHTML();
  bindCharEvents();
}

// ── QUESTS ────────────────────────────────────────────────────────────

const QUEST_CATEGORIES = {
  mainQuest:    { label: 'Main Quest',         icon: '🐉' },
  companions:   { label: 'The Companions',     icon: '🐺' },
  college:      { label: 'College of Winterhold', icon: '🔮' },
  thievesGuild: { label: 'Thieves Guild',      icon: '🗝️' },
  dawnguard:    { label: 'Dawnguard',          icon: '🧛' },
  bounty:       { label: 'Bounty Quests',      icon: '💰' },
  misc:         { label: 'Miscellaneous',      icon: '📌' }
};

function renderQuestsHTML() {
  const q = window.appState.quests;
  let html = `<div style="display:flex;flex-direction:column;gap:0.5rem;">`;

  for (const [key, meta] of Object.entries(QUEST_CATEGORIES)) {
    const quests = q[key] || [];
    const done = quests.filter(qi=>qi.completed).length;
    html += `
    <div>
      <div class="accordion-header" onclick="toggleAccordion('acc-${key}')">
        <span>${meta.icon} ${meta.label} <span style="color:rgba(212,168,67,0.4);font-size:0.6rem;margin-left:0.5rem;">${done}/${quests.length}</span></span>
        <span id="acc-${key}-arrow">▾</span>
      </div>
      <div class="accordion-body" id="acc-${key}" style="display:none;">
        <div id="quest-list-${key}">
          ${quests.map(qi => renderQuestRow(key, qi)).join('')}
        </div>
        <button class="btn btn-sm" style="margin-top:0.6rem;" onclick="addQuest('${key}')">+ Add Quest</button>
      </div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

function renderQuestRow(cat, qi) {
  return `<div class="quest-row" id="qrow-${qi.id}">
    <input type="checkbox" class="rune-check" ${qi.completed?'checked':''} onchange="toggleQuest('${cat}','${qi.id}',this.checked)">
    <input class="input" value="${esc(qi.name)}" placeholder="Quest name…" style="flex:1;font-size:0.85rem;"
      onblur="updateQuestName('${cat}','${qi.id}',this.value)">
    <input class="input" type="date" value="${qi.completedDate}" style="width:130px;font-size:0.78rem;"
      onchange="updateQuestDate('${cat}','${qi.id}',this.value)" title="Completion date">
    <button class="btn btn-sm btn-danger" style="padding:0.25rem 0.4rem;" onclick="deleteQuest('${cat}','${qi.id}')" title="Remove">✕</button>
  </div>`;
}

function toggleAccordion(id) {
  const body = document.getElementById(id);
  const arrow = document.getElementById(id+'-arrow');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '▸' : '▾';
}

function toggleQuest(cat, id, checked) {
  const qi = window.appState.quests[cat]?.find(q=>q.id===id);
  if (!qi) return;
  qi.completed = checked;
  if (checked && !qi.completedDate) qi.completedDate = todayISO();
  saveState();
}
function updateQuestName(cat, id, val) {
  const qi = window.appState.quests[cat]?.find(q=>q.id===id);
  if (qi) { qi.name = val; saveState(); }
}
function updateQuestDate(cat, id, val) {
  const qi = window.appState.quests[cat]?.find(q=>q.id===id);
  if (qi) { qi.completedDate = val; saveState(); }
}
function addQuest(cat) {
  const qi = { id: generateId(), name: '', completed: false, completedDate: '', notes: '' };
  window.appState.quests[cat].push(qi);
  saveState();
  const listEl = document.getElementById(`quest-list-${cat}`);
  if (listEl) {
    const div = document.createElement('div');
    div.innerHTML = renderQuestRow(cat, qi);
    listEl.appendChild(div.firstElementChild);
  }
}
function deleteQuest(cat, id) {
  window.appState.quests[cat] = window.appState.quests[cat].filter(q=>q.id!==id);
  saveState();
  document.getElementById(`qrow-${id}`)?.remove();
}

// ── MAGIC ─────────────────────────────────────────────────────────────

const MAGIC_SCHOOLS = {
  destruction: { label: 'Destruction',  icon: '🔥', color: '#c04040' },
  conjuration: { label: 'Conjuration',  icon: '💀', color: '#8040c0' },
  illusion:    { label: 'Illusion',     icon: '🌀', color: '#4070c0' },
  alteration:  { label: 'Alteration',   icon: '⚗️',  color: '#40a070' },
  restoration: { label: 'Restoration',  icon: '✨', color: '#c0a040' }
};

const SPELL_TIERS = ['Novice','Apprentice','Adept','Expert','Master'];

function renderMagicHTML() {
  const m = window.appState.magic;
  let html = `<div style="display:flex;flex-direction:column;gap:0.5rem;">`;

  for (const [key, meta] of Object.entries(MAGIC_SCHOOLS)) {
    const spells = m[key] || [];
    html += `
    <div>
      <div class="accordion-header" onclick="toggleAccordion('macc-${key}')" style="border-left:3px solid ${meta.color};">
        <span>${meta.icon} ${meta.label} <span style="color:rgba(212,168,67,0.4);font-size:0.6rem;margin-left:0.5rem;">${spells.length} spells</span></span>
        <span id="macc-${key}-arrow">▾</span>
      </div>
      <div class="accordion-body" id="macc-${key}" style="display:none;">
        <div id="spell-list-${key}">
          ${spells.map(sp => renderSpellRow(key, sp)).join('')}
        </div>
        <button class="btn btn-sm" style="margin-top:0.6rem;" onclick="addSpell('${key}')">+ Add Spell</button>
      </div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

function renderSpellRow(school, sp) {
  return `<div class="quest-row" id="sprow-${sp.id}" style="display:grid;grid-template-columns:1fr 7rem 1fr 2rem;gap:0.5rem;align-items:center;">
    <input class="input" value="${esc(sp.name)}" placeholder="Spell name…" style="font-size:0.85rem;"
      onblur="updateSpellField('${school}','${sp.id}','name',this.value)">
    <select class="select" style="font-size:0.78rem;" onchange="updateSpellField('${school}','${sp.id}','tier',this.value)">
      ${SPELL_TIERS.map(t=>`<option value="${t}" ${sp.tier===t?'selected':''}>${t}</option>`).join('')}
    </select>
    <input class="input" value="${esc(sp.notes)}" placeholder="Notes / source…" style="font-size:0.8rem;"
      onblur="updateSpellField('${school}','${sp.id}','notes',this.value)">
    <button class="btn btn-sm btn-danger" style="padding:0.25rem 0.4rem;" onclick="deleteSpell('${school}','${sp.id}')">✕</button>
  </div>`;
}

function updateSpellField(school, id, field, val) {
  const sp = window.appState.magic[school]?.find(s=>s.id===id);
  if (sp) { sp[field] = val; saveState(); }
}
function addSpell(school) {
  const sp = { id: generateId(), name: '', tier: 'Novice', notes: '' };
  window.appState.magic[school].push(sp);
  saveState();
  const listEl = document.getElementById(`spell-list-${school}`);
  if (listEl) {
    const div = document.createElement('div');
    div.innerHTML = renderSpellRow(school, sp);
    listEl.appendChild(div.firstElementChild);
  }
}
function deleteSpell(school, id) {
  window.appState.magic[school] = window.appState.magic[school].filter(s=>s.id!==id);
  saveState();
  document.getElementById(`sprow-${id}`)?.remove();
}

// ── EQUIPMENT ─────────────────────────────────────────────────────────

const EQUIP_SLOTS = [
  { key:'head',      label:'Head',       icon:'🪖' },
  { key:'chest',     label:'Chest',      icon:'🛡️'  },
  { key:'hands',     label:'Gloves',     icon:'🧤' },
  { key:'feet',      label:'Boots',      icon:'👢' },
  { key:'leftHand',  label:'Left Hand',  icon:'🗡️'  },
  { key:'rightHand', label:'Right Hand', icon:'⚔️'  },
  { key:'ring1',     label:'Ring',       icon:'💍' },
  { key:'ring2',     label:'Ring 2',     icon:'💍' },
  { key:'amulet',    label:'Amulet',     icon:'📿' }
];

function renderEquipmentHTML() {
  const eq = window.appState.equipment;
  return `
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-bottom:1rem;">
    ${EQUIP_SLOTS.map(slot => {
      const item = eq[slot.key];
      const filled = item?.name;
      return `
      <div class="equip-slot ${filled?'filled':''}" onclick="openEquipSlot('${slot.key}')">
        <div class="equip-slot-label">${slot.icon} ${slot.label}</div>
        ${filled
          ? `<div class="equip-slot-name">${esc(item.name)}</div>
             ${item.enchantment ? `<div class="equip-slot-enchant">${esc(item.enchantment)}</div>` : ''}`
          : `<div style="color:#333;font-style:italic;font-size:0.8rem;">— Empty —</div>`}
      </div>`;
    }).join('')}
  </div>
  <div id="equip-edit-panel"></div>`;
}

let activeEquipSlot = null;
function openEquipSlot(key) {
  activeEquipSlot = key;
  const item = window.appState.equipment[key];
  const slot = EQUIP_SLOTS.find(s=>s.key===key);
  const panel = document.getElementById('equip-edit-panel');
  if (!panel) return;
  panel.innerHTML = `
  <div class="card" style="margin-top:0.5rem;">
    <div class="card-title">${slot.icon} ${slot.label} — Edit</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
      <div>
        <label class="field-label">Item Name</label>
        <input class="input" id="eq-name" value="${esc(item.name)}" placeholder="e.g. Nightingale Armor">
      </div>
      <div>
        <label class="field-label">Enchantment / Effect</label>
        <input class="input" id="eq-enchant" value="${esc(item.enchantment)}" placeholder="e.g. +40 Stamina">
      </div>
    </div>
    <div>
      <label class="field-label">Roleplay Notes</label>
      <textarea class="textarea" id="eq-notes" rows="3" placeholder="Where it was found, its lore significance…">${esc(item.notes)}</textarea>
    </div>
    <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
      <button class="btn btn-primary" onclick="saveEquipSlot()">💾 Save</button>
      <button class="btn btn-danger btn-sm" onclick="clearEquipSlot('${key}')">Clear Slot</button>
    </div>
  </div>`;
}

function saveEquipSlot() {
  if (!activeEquipSlot) return;
  const item = window.appState.equipment[activeEquipSlot];
  item.name        = document.getElementById('eq-name')?.value || '';
  item.enchantment = document.getElementById('eq-enchant')?.value || '';
  item.notes       = document.getElementById('eq-notes')?.value || '';
  saveState();
  renderCharSubTab();
  showToast('Equipment saved.');
}

function clearEquipSlot(key) {
  window.appState.equipment[key] = { name:'', enchantment:'', notes:'' };
  saveState();
  renderCharSubTab();
}

function bindCharEvents() {
  // Open first accordion by default if empty
  document.querySelectorAll('.accordion-body').forEach(el => {
    if (el.id === 'acc-mainQuest' || el.id === 'macc-destruction') {
      el.style.display = 'block';
      const arrow = document.getElementById(el.id + '-arrow');
      if (arrow) arrow.textContent = '▾';
    }
  });
}
