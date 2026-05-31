/* ── Dashboard Section ───────────────────────────────────────────── */

function renderDashboard() {
  const s = window.appState;
  const c = s.character;
  const races = ['Nord','Imperial','Breton','Redguard','High Elf','Wood Elf','Dark Elf','Orc','Argonian','Khajiit'];
  const birthsigns = ['The Warrior','The Mage','The Thief','The Apprentice','The Atronach','The Lady','The Lord','The Lover','The Ritual','The Serpent','The Shadow','The Steed','The Tower'];
  const archetypes = ['Pure Warrior','Stealth Archer','Battle Mage','Pure Mage','Thief / Rogue','Necromancer','Paladin / Templar','Ranger / Hunter','Spellsword','Custom'];

  const portraitHtml = c.portraitDataUrl
    ? `<img src="${c.portraitDataUrl}" alt="portrait">`
    : `<div style="text-align:center;color:rgba(212,168,67,0.3);font-size:2rem;">⚔️<br><span style="font-family:'Cinzel',serif;font-size:0.55rem;letter-spacing:0.1em;display:block;margin-top:0.4rem;">PORTRAIT</span></div>`;

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1100px;">

  <!-- Header -->
  <div style="margin-bottom:1.5rem;">
    <div class="section-header">☽ Character Chronicle ☾</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <div style="display:grid;grid-template-columns:auto 1fr;gap:1.5rem;align-items:start;margin-bottom:1.5rem;">

    <!-- Portrait -->
    <div>
      <div class="portrait-area" id="portrait-area" title="Click to upload portrait">
        ${portraitHtml}
      </div>
      <input type="file" id="portrait-file" accept="image/*" style="display:none">
      <button class="btn btn-sm" style="width:120px;margin-top:0.4rem;justify-content:center;" onclick="document.getElementById('portrait-file').click()">📷 Upload</button>
    </div>

    <!-- Core Stats -->
    <div class="card">
      <div class="card-title">⚔️ Character Identity</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
        <div>
          <label class="field-label">Name</label>
          <input class="input" id="char-name" value="${esc(c.name)}" placeholder="e.g. Aetheryn">
        </div>
        <div>
          <label class="field-label">Race</label>
          <select class="select" id="char-race">
            <option value="">— Select Race —</option>
            ${races.map(r => `<option value="${r}" ${c.race===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Level</label>
          <input class="input" id="char-level" type="number" min="1" max="200" value="${c.level}" style="max-width:80px;">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        <div>
          <label class="field-label">Birthsign / Standing Stone</label>
          <select class="select" id="char-birthsign">
            <option value="">— Select Birthsign —</option>
            ${birthsigns.map(b => `<option value="${b}" ${c.birthsign===b?'selected':''}>${b}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Build Archetype</label>
          <select class="select" id="char-archetype">
            <option value="">— Select Archetype —</option>
            ${archetypes.map(a => `<option value="${a}" ${c.archetype===a?'selected':''}>${a}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Stat Pills -->
  <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.25rem;">
    <div class="stat-pill">
      <span class="stat-pill-value">${c.level || 1}</span>
      <span class="stat-pill-label">Level</span>
    </div>
    <div class="stat-pill">
      <span class="stat-pill-value" style="font-size:0.85rem;">${esc(c.race) || '—'}</span>
      <span class="stat-pill-label">Race</span>
    </div>
    <div class="stat-pill">
      <span class="stat-pill-value" style="font-size:0.75rem;">${esc(c.birthsign) || '—'}</span>
      <span class="stat-pill-label">Birthsign</span>
    </div>
    <div class="stat-pill">
      <span class="stat-pill-value" style="font-size:0.75rem;">${esc(c.archetype) || '—'}</span>
      <span class="stat-pill-label">Archetype</span>
    </div>
    <div class="stat-pill">
      <span class="stat-pill-value">${countCompletedQuests()}</span>
      <span class="stat-pill-label">Quests Done</span>
    </div>
    <div class="stat-pill">
      <span class="stat-pill-value">${countTotalSpells()}</span>
      <span class="stat-pill-label">Spells Known</span>
    </div>
    <div class="stat-pill">
      <span class="stat-pill-value">${window.appState.journal.length}</span>
      <span class="stat-pill-label">Journal Entries</span>
    </div>
  </div>

  <!-- Backstory -->
  <div class="card" style="margin-bottom:1.25rem;">
    <div class="card-title">📜 Backstory & Lore</div>
    <textarea class="textarea" id="char-backstory" rows="8" placeholder="Write your character's backstory here…\n\nThis field supports plain text. Consider including: origin, motivations, past trauma, factional allegiances, and why they arrived in Skyrim.">${esc(c.backstory)}</textarea>
  </div>

  <!-- Build Summary (read-only from mechanics) -->
  <div class="card" style="margin-bottom:1.5rem;">
    <div class="card-title">🔮 Build Parameters Summary</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;font-size:0.88rem;">
      <div>
        <div style="font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;color:rgba(212,168,67,0.5);text-transform:uppercase;margin-bottom:0.35rem;">Birthsign</div>
        <div style="color:#d4cfc4;">${esc(window.appState.mechanics.birthsign) || '<em style="color:#555">Not set</em>'}</div>
      </div>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;color:rgba(212,168,67,0.5);text-transform:uppercase;margin-bottom:0.35rem;">Character Traits</div>
        <div style="color:#d4cfc4;">${window.appState.mechanics.traits.filter(Boolean).join(' · ') || '<em style="color:#555">Not set</em>'}</div>
      </div>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;color:rgba(212,168,67,0.5);text-transform:uppercase;margin-bottom:0.35rem;">Major Skills</div>
        <div style="color:#d4cfc4;">${window.appState.mechanics.majorSkills.filter(Boolean).join(' · ') || '<em style="color:#555">Not set</em>'}</div>
      </div>
    </div>
  </div>

  <!-- Export buttons -->
  <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
    <button class="btn btn-primary" onclick="saveDashboard()">💾 Save Changes</button>
    <button class="btn" onclick="exportCharacterPDF()">📄 Export Character Sheet PDF</button>
  </div>
</div>`;

  // Events
  document.getElementById('portrait-area').addEventListener('click', () => {
    document.getElementById('portrait-file').click();
  });
  document.getElementById('portrait-file').addEventListener('change', handlePortraitUpload);

  ['char-name','char-race','char-level','char-birthsign','char-archetype','char-backstory'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', saveDashboard);
  });
}

function saveDashboard() {
  const s = window.appState;
  s.character.name      = document.getElementById('char-name')?.value || '';
  s.character.race      = document.getElementById('char-race')?.value || '';
  s.character.level     = parseInt(document.getElementById('char-level')?.value) || 1;
  s.character.birthsign = document.getElementById('char-birthsign')?.value || '';
  s.character.archetype = document.getElementById('char-archetype')?.value || '';
  s.character.backstory = document.getElementById('char-backstory')?.value || '';
  saveState();
}

function handlePortraitUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    window.appState.character.portraitDataUrl = ev.target.result;
    saveState();
    renderDashboard();
  };
  reader.readAsDataURL(file);
}

function countCompletedQuests() {
  const q = window.appState.quests;
  let count = 0;
  for (const cat of Object.values(q)) {
    count += cat.filter(qi => qi.completed).length;
  }
  return count;
}

function countTotalSpells() {
  const m = window.appState.magic;
  return Object.values(m).reduce((sum, arr) => sum + arr.length, 0);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
window.esc = esc;
