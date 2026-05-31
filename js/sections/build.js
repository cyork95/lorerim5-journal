/* ── Build Workshop Section (OOC Build Reference) ─────────────────── */

const BUILD_STYLES = [
  '','Pure Warrior','Stealth Archer','Battle Mage','Pure Mage','Necromancer',
  'Spellsword','Paladin / Templar','Thief / Rogue','Ranger / Hunter',
  'Vampire Lord','Werewolf','Dual Wield','Unarmed Brawler','Custom Hybrid'
];

const DIFFICULTY_OPTS = ['','Beginner Friendly','Moderate','Challenging','Expert / Hardcore'];

const PERK_SKILLS = [
  'One-Handed','Two-Handed','Archery','Block','Heavy Armor','Light Armor','Smithing',
  'Destruction','Conjuration','Illusion','Alteration','Restoration','Enchanting',
  'Sneak','Lockpicking','Pickpocket','Speech','Alchemy'
];

const PERK_PRIORITY_OPTS = ['Core (Must Have)','Secondary','Optional','Avoid / Skip'];

const GEAR_SLOTS = ['Helmet','Chest','Gauntlets','Boots','Left Hand','Right Hand','Jewelry','Shield'];

function renderBuild() {
  const b = window.appState.build || {};
  const sp = b.statPlan || {};
  const gp = b.gearProgression || { early:{}, mid:{}, late:{} };

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1100px;">

  <div style="margin-bottom:1rem;">
    <div class="section-header">🏗️ Build Workshop</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <!-- OOC Banner -->
  <div style="background:rgba(212,168,67,0.06);border:1px solid rgba(212,168,67,0.2);border-left:3px solid rgba(212,168,67,0.6);border-radius:3px;padding:0.6rem 0.85rem;margin-bottom:1.25rem;display:flex;gap:0.5rem;align-items:center;">
    <span style="font-size:1rem;">📋</span>
    <span style="font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.08em;color:rgba(212,168,67,0.75);">OUT-OF-CHARACTER REFERENCE — These notes are for your eyes only. Mechanical planning, perk priorities, and Discord build guides live here.</span>
  </div>

  <div style="display:flex;flex-direction:column;gap:1rem;">

    <!-- Card 1: Build Identity -->
    <div class="card">
      <div class="card-title">⚔️ Build Identity</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
        <div>
          <label class="field-label">Build Name</label>
          <input class="input" id="build-name" value="${esc(b.name||'')}" placeholder="e.g. Requiem Paladin v2"
            onblur="saveBuild()">
        </div>
        <div>
          <label class="field-label">Build Style</label>
          <select class="select" id="build-style" onchange="saveBuild()">
            ${BUILD_STYLES.map(s=>`<option value="${s}" ${(b.buildStyle||'')=== s ?'selected':''}>${s||'— Select —'}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Difficulty</label>
          <select class="select" id="build-diff" onchange="saveBuild()">
            ${DIFFICULTY_OPTS.map(d=>`<option value="${d}" ${(b.difficulty||'')=== d?'selected':''}>${d||'— Select —'}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Discord / Source URL</label>
          <input class="input" id="build-url" value="${esc(b.sourceUrl||'')}" placeholder="https://discord.com/…"
            onblur="saveBuild()">
        </div>
      </div>
      <div>
        <label class="field-label">Build Summary <span style="color:#555;font-style:italic;font-family:'EB Garamond',serif;">(OOC overview of the playstyle)</span></label>
        <textarea class="textarea" id="build-summary" rows="3" placeholder="Brief description of how this build plays, what makes it strong, key strengths and weaknesses…"
          onblur="saveBuild()">${esc(b.summary||'')}</textarea>
      </div>
    </div>

    <!-- Card 2: Stat Allocation Plan -->
    <div class="card">
      <div class="card-title">📊 Level-Up Stat Allocation</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr) 1fr;gap:0.75rem;margin-bottom:0.75rem;align-items:end;">
        <div>
          <label class="field-label">❤️ Health / Level</label>
          <input class="input" type="number" id="sp-hp" min="0" max="10" value="${sp.hpPerLevel||0}"
            onblur="saveBuild()" style="text-align:center;font-size:1.1rem;font-family:'Cinzel',serif;">
        </div>
        <div>
          <label class="field-label">💙 Magicka / Level</label>
          <input class="input" type="number" id="sp-mag" min="0" max="10" value="${sp.magPerLevel||0}"
            onblur="saveBuild()" style="text-align:center;font-size:1.1rem;font-family:'Cinzel',serif;">
        </div>
        <div>
          <label class="field-label">💚 Stamina / Level</label>
          <input class="input" type="number" id="sp-sta" min="0" max="10" value="${sp.staPerLevel||0}"
            onblur="saveBuild()" style="text-align:center;font-size:1.1rem;font-family:'Cinzel',serif;">
        </div>
        <div style="padding-bottom:0.1rem;">
          <div style="background:#12121a;border:1px solid rgba(212,168,67,0.15);border-radius:3px;padding:0.5rem 0.65rem;text-align:center;">
            <div style="font-family:'Cinzel',serif;font-size:0.55rem;letter-spacing:0.1em;color:rgba(212,168,67,0.4);text-transform:uppercase;margin-bottom:0.2rem;">Total / Level</div>
            <span id="sp-total" style="font-family:'Cinzel',serif;font-size:1.1rem;color:#d4a843;">${calcSpTotal(sp)}</span>
          </div>
        </div>
      </div>
      <!-- Milestone targets table -->
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <label class="field-label" style="margin:0;">Milestone Targets</label>
          <button class="btn btn-sm" onclick="addMilestone()">+ Add</button>
        </div>
        <div id="milestone-table">
          ${renderMilestoneRows(b.milestones || [])}
        </div>
      </div>
      <div style="margin-top:0.75rem;">
        <label class="field-label">Allocation Notes</label>
        <textarea class="textarea" id="sp-notes" rows="2" placeholder="e.g. Dump Magicka to 200 first, then alternate Health/Stamina 3:2…"
          onblur="saveBuild()">${esc(sp.notes||'')}</textarea>
      </div>
    </div>

    <!-- Card 3: Perk Priorities -->
    <div class="card">
      <div class="card-title">🌟 Perk Priorities</div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:0.5rem;">
        <button class="btn btn-sm" onclick="addPerkRow()">+ Add Skill</button>
      </div>
      <div id="perk-table">
        ${renderPerkRows(b.perkPriorities || [])}
      </div>
    </div>

    <!-- Card 4: Gear Progression -->
    <div class="card">
      <div class="card-title">🛡️ Gear Progression</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
        ${['early','mid','late'].map(stage => `
        <div>
          <div style="font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(212,168,67,0.6);margin-bottom:0.5rem;text-align:center;padding-bottom:0.3rem;border-bottom:1px solid rgba(212,168,67,0.1);">
            ${{early:'⚪ Early Game',mid:'🟡 Mid Game',late:'🔴 Late Game'}[stage]}
          </div>
          ${GEAR_SLOTS.map(slot => `
          <div style="margin-bottom:0.3rem;">
            <label class="field-label" style="font-size:0.52rem;">${slot}</label>
            <input class="input" value="${esc((gp[stage]||{})[slot.toLowerCase().replace(/\s/g,'')] || '')}"
              placeholder="—"
              data-gear-stage="${stage}" data-gear-slot="${slot.toLowerCase().replace(/\s/g,'')}"
              onblur="saveGearSlot(this)"
              style="font-size:0.82rem;padding:0.3rem 0.5rem;">
          </div>`).join('')}
          <div style="margin-top:0.5rem;">
            <label class="field-label" style="font-size:0.52rem;">Notes</label>
            <textarea class="textarea" data-gear-stage="${stage}" data-gear-slot="notes"
              rows="2" placeholder="General notes for this stage…"
              onblur="saveGearSlot(this)"
              style="font-size:0.82rem;">${esc((gp[stage]||{}).notes||'')}</textarea>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Card 5: Key Mechanics & Combos -->
    <div class="card">
      <div class="card-title">⚡ Key Mechanics & Combos</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        <div>
          <label class="field-label">Essential Mechanics to Know</label>
          <textarea class="textarea" id="build-mechanics" rows="6"
            placeholder="• Requiem stamina drain on power attacks&#10;• Block timing window for parry&#10;• How this build handles crowds&#10;• Survival mode considerations…"
            onblur="saveBuild()">${esc(b.mechanics||'')}</textarea>
        </div>
        <div>
          <label class="field-label">Combo Strings & Openers</label>
          <textarea class="textarea" id="build-combos" rows="6"
            placeholder="• Opening: cast X → close → power attack&#10;• Crowd control: illusion Y → sneak crits&#10;• Boss pattern: block → riposte → retreat…"
            onblur="saveBuild()">${esc(b.combos||'')}</textarea>
        </div>
      </div>
    </div>

    <!-- Card 6: OOC Notes & Gotchas -->
    <div class="card" style="margin-bottom:0.5rem;">
      <div class="card-title">📝 OOC Notes, Gotchas & Reminders</div>
      <textarea class="textarea" id="build-ooc" rows="6"
        placeholder="Anything worth remembering that doesn't fit elsewhere:&#10;• Known bugs with this build&#10;• Mods that change how certain skills work&#10;• Discord thread link or post summary&#10;• Things that tripped you up on a previous playthrough…"
        onblur="saveBuild()">${esc(b.oocNotes||'')}</textarea>
      <div style="margin-top:0.75rem;">
        <button class="btn btn-primary" onclick="saveBuild()">💾 Save Build Notes</button>
      </div>
    </div>

  </div>
</div>`;

  // Live stat total wiring
  ['sp-hp','sp-mag','sp-sta'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const hp  = parseInt(document.getElementById('sp-hp')?.value) || 0;
      const mag = parseInt(document.getElementById('sp-mag')?.value) || 0;
      const sta = parseInt(document.getElementById('sp-sta')?.value) || 0;
      const el = document.getElementById('sp-total');
      if (el) el.textContent = hp + mag + sta;
    });
  });
}

function calcSpTotal(sp) {
  return (sp.hpPerLevel||0) + (sp.magPerLevel||0) + (sp.staPerLevel||0);
}

// ── Milestones ────────────────────────────────────────────────────────
function renderMilestoneRows(milestones) {
  if (!milestones.length) return `<div style="color:#444;font-size:0.82rem;font-style:italic;padding:0.35rem 0;">No milestones set.</div>`;
  return `<div style="display:flex;flex-direction:column;gap:0.3rem;">
    ${milestones.map(m => `
    <div style="display:grid;grid-template-columns:5rem 1fr 1fr 1fr 2rem;gap:0.4rem;align-items:center;" id="ms-${m.id}">
      <input class="input" value="${esc(m.level||'')}" placeholder="Level"
        onblur="updateMilestone('${m.id}','level',this.value)" style="font-size:0.8rem;text-align:center;">
      <input class="input" value="${esc(m.hp||'')}" placeholder="HP target"
        onblur="updateMilestone('${m.id}','hp',this.value)" style="font-size:0.8rem;">
      <input class="input" value="${esc(m.mag||'')}" placeholder="Mag target"
        onblur="updateMilestone('${m.id}','mag',this.value)" style="font-size:0.8rem;">
      <input class="input" value="${esc(m.sta||'')}" placeholder="Sta target"
        onblur="updateMilestone('${m.id}','sta',this.value)" style="font-size:0.8rem;">
      <button class="btn btn-sm btn-danger" style="padding:0.2rem 0.35rem;" onclick="deleteMilestone('${m.id}')">✕</button>
    </div>`).join('')}
    <div style="display:flex;gap:0.4rem;margin-top:0.25rem;">
      <span style="width:5rem;text-align:center;font-family:'Cinzel',serif;font-size:0.55rem;letter-spacing:0.1em;color:rgba(212,168,67,0.4);text-transform:uppercase;padding-top:0.3rem;">Level</span>
      <span style="flex:1;font-family:'Cinzel',serif;font-size:0.55rem;letter-spacing:0.1em;color:rgba(212,168,67,0.4);text-transform:uppercase;padding-top:0.3rem;">HP Target</span>
      <span style="flex:1;font-family:'Cinzel',serif;font-size:0.55rem;letter-spacing:0.1em;color:rgba(212,168,67,0.4);text-transform:uppercase;padding-top:0.3rem;">Magicka Target</span>
      <span style="flex:1;font-family:'Cinzel',serif;font-size:0.55rem;letter-spacing:0.1em;color:rgba(212,168,67,0.4);text-transform:uppercase;padding-top:0.3rem;">Stamina Target</span>
      <span style="width:2rem;"></span>
    </div>
  </div>`;
}

function addMilestone() {
  if (!window.appState.build) window.appState.build = getDefaultBuild();
  if (!window.appState.build.milestones) window.appState.build.milestones = [];
  const m = { id: generateId(), level:'', hp:'', mag:'', sta:'' };
  window.appState.build.milestones.push(m);
  saveState();
  document.getElementById('milestone-table').innerHTML = renderMilestoneRows(window.appState.build.milestones);
}

function updateMilestone(id, field, val) {
  const m = (window.appState.build?.milestones||[]).find(x=>x.id===id);
  if (m) { m[field] = val; saveState(); }
}

function deleteMilestone(id) {
  if (!window.appState.build) return;
  window.appState.build.milestones = (window.appState.build.milestones||[]).filter(x=>x.id!==id);
  saveState();
  document.getElementById(`ms-${id}`)?.remove();
}

// ── Perk Rows ─────────────────────────────────────────────────────────
function renderPerkRows(perks) {
  if (!perks.length) return `<div style="color:#444;font-size:0.82rem;font-style:italic;padding:0.35rem 0;">No perk priorities set. Add skills above.</div>`;
  const grouped = {};
  perks.forEach(p => {
    const pri = p.priority || 'Core (Must Have)';
    if (!grouped[pri]) grouped[pri] = [];
    grouped[pri].push(p);
  });
  const order = ['Core (Must Have)','Secondary','Optional','Avoid / Skip'];
  const colors = { 'Core (Must Have)':'#5a9a5a', 'Secondary':'#c4962e', 'Optional':'#5a7a9a', 'Avoid / Skip':'#7a5a5a' };

  return order.filter(o=>grouped[o]).map(priority => `
    <div style="margin-bottom:0.5rem;">
      <div style="font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:${colors[priority]};padding:0.25rem 0;margin-bottom:0.25rem;border-bottom:1px solid rgba(255,255,255,0.05);">
        ${priority}
      </div>
      ${grouped[priority].map(p => `
      <div style="display:grid;grid-template-columns:9rem 10rem 1fr 2rem;gap:0.5rem;align-items:center;padding:0.25rem 0;border-bottom:1px solid rgba(255,255,255,0.03);" id="pk-${p.id}">
        <select class="select" style="font-size:0.78rem;" onchange="updatePerk('${p.id}','skill',this.value)">
          ${PERK_SKILLS.map(s=>`<option value="${s}" ${p.skill===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <select class="select" style="font-size:0.78rem;" onchange="updatePerk('${p.id}','priority',this.value)">
          ${PERK_PRIORITY_OPTS.map(o=>`<option value="${o}" ${p.priority===o?'selected':''}>${o}</option>`).join('')}
        </select>
        <input class="input" value="${esc(p.notes||'')}" placeholder="Key perks to grab, order, max rank…"
          onblur="updatePerk('${p.id}','notes',this.value)" style="font-size:0.82rem;">
        <button class="btn btn-sm btn-danger" style="padding:0.2rem 0.35rem;" onclick="deletePerk('${p.id}')">✕</button>
      </div>`).join('')}
    </div>`).join('');
}

function addPerkRow() {
  if (!window.appState.build) window.appState.build = getDefaultBuild();
  if (!window.appState.build.perkPriorities) window.appState.build.perkPriorities = [];
  const p = { id: generateId(), skill: PERK_SKILLS[0], priority: 'Core (Must Have)', notes:'' };
  window.appState.build.perkPriorities.push(p);
  saveState();
  document.getElementById('perk-table').innerHTML = renderPerkRows(window.appState.build.perkPriorities);
}

function updatePerk(id, field, val) {
  const p = (window.appState.build?.perkPriorities||[]).find(x=>x.id===id);
  if (p) {
    p[field] = val;
    saveState();
    if (field === 'priority') {
      document.getElementById('perk-table').innerHTML = renderPerkRows(window.appState.build.perkPriorities);
    }
  }
}

function deletePerk(id) {
  if (!window.appState.build) return;
  window.appState.build.perkPriorities = (window.appState.build.perkPriorities||[]).filter(x=>x.id!==id);
  saveState();
  document.getElementById('perk-table').innerHTML = renderPerkRows(window.appState.build.perkPriorities);
}

// ── Gear ──────────────────────────────────────────────────────────────
function saveGearSlot(el) {
  if (!window.appState.build) window.appState.build = getDefaultBuild();
  const gp = window.appState.build.gearProgression;
  const stage = el.dataset.gearStage;
  const slot  = el.dataset.gearSlot;
  if (!gp[stage]) gp[stage] = {};
  gp[stage][slot] = el.value;
  saveState();
}

// ── Main save ─────────────────────────────────────────────────────────
function saveBuild() {
  if (!window.appState.build) window.appState.build = getDefaultBuild();
  const b = window.appState.build;
  b.name       = document.getElementById('build-name')?.value || '';
  b.sourceUrl  = document.getElementById('build-url')?.value  || '';
  b.buildStyle = document.getElementById('build-style')?.value || '';
  b.difficulty = document.getElementById('build-diff')?.value  || '';
  b.summary    = document.getElementById('build-summary')?.value || '';
  b.mechanics  = document.getElementById('build-mechanics')?.value || '';
  b.combos     = document.getElementById('build-combos')?.value || '';
  b.oocNotes   = document.getElementById('build-ooc')?.value || '';

  if (!b.statPlan) b.statPlan = {};
  b.statPlan.hpPerLevel  = parseInt(document.getElementById('sp-hp')?.value)  || 0;
  b.statPlan.magPerLevel = parseInt(document.getElementById('sp-mag')?.value) || 0;
  b.statPlan.staPerLevel = parseInt(document.getElementById('sp-sta')?.value) || 0;
  b.statPlan.notes       = document.getElementById('sp-notes')?.value || '';

  saveState();
  showToast('Build notes saved.');
}

function getDefaultBuild() {
  return {
    name:'', sourceUrl:'', buildStyle:'', difficulty:'', summary:'',
    mechanics:'', combos:'', oocNotes:'',
    statPlan: { hpPerLevel:0, magPerLevel:0, staPerLevel:0, notes:'' },
    perkPriorities: [],
    milestones: [],
    gearProgression: { early:{}, mid:{}, late:{} }
  };
}

// Ensure build exists in state on first load
if (!window.appState.build) {
  window.appState.build = getDefaultBuild();
}
