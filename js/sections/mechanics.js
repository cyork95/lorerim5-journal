/* ── Requiem Mechanics Section ───────────────────────────────────── */

const WINTERSUN_DEITIES = [
  '— None / Atheist —',
  'Akatosh','Arkay','Dibella','Julianos','Kynareth','Mara','Stendarr','Talos','Zenithar',
  'Auriel','Jephre','Phynaster','Syrabane','Trinimac','Xarxes',
  'Azura','Boethiah','Clavicus Vile','Hermaeus Mora','Hircine','Malacath',
  'Mehrunes Dagon','Mephala','Meridia','Molag Bal','Namira','Nocturnal',
  'Peryite','Sanguine','Sheogorath','Vaermina',
  'Sithis','Magnus','Lorkhan','Mannimarco'
];

function renderMechanics() {
  const m = window.appState.mechanics;

  // Derived stat calculations (Requiem approximations)
  const hp  = m.baseHealth   || 100;
  const mag = m.baseMagicka  || 100;
  const sta = m.baseStamina  || 100;

  const magResist     = Math.min(80, Math.floor(mag / 10));
  const carryWeight   = 300 + sta * 5;
  const speedMod      = ((sta - 100) * 0.05).toFixed(2);
  const meleeDmgMult  = (1 + (sta - 100) * 0.002).toFixed(3);
  const spellCostMult = Math.max(0.2, (1 - (mag - 100) * 0.004)).toFixed(3);
  const healthRegen   = (hp * 0.001).toFixed(3);

  const favorPct = m.deityFavor || 0;

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1100px;">
  <div style="margin-bottom:1.5rem;">
    <div class="section-header">🔮 Requiem Mechanics</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;align-items:start;">

    <!-- Card 1: Derived Attributes -->
    <div class="card">
      <div class="card-title">📊 Derived Attributes</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin-bottom:1rem;">
        <div>
          <label class="field-label">Base HP</label>
          <input class="input" type="number" id="base-hp" value="${hp}" min="10" max="999"
            oninput="updateDerived()" style="text-align:center;">
        </div>
        <div>
          <label class="field-label">Base Magicka</label>
          <input class="input" type="number" id="base-mag" value="${mag}" min="10" max="999"
            oninput="updateDerived()" style="text-align:center;">
        </div>
        <div>
          <label class="field-label">Base Stamina</label>
          <input class="input" type="number" id="base-sta" value="${sta}" min="10" max="999"
            oninput="updateDerived()" style="text-align:center;">
        </div>
      </div>

      <div class="ornament" style="margin-bottom:0.75rem;text-align:center;">✦ ─── Derived ─── ✦</div>

      <div id="derived-results" style="display:flex;flex-direction:column;gap:0.4rem;">
        ${renderDerivedRows(magResist, carryWeight, speedMod, meleeDmgMult, spellCostMult, healthRegen)}
      </div>

      <div style="margin-top:1rem;">
        <button class="btn btn-primary btn-sm" onclick="saveMechStats()">💾 Save Stats</button>
      </div>
    </div>

    <!-- Card 2: Wintersun Faith -->
    <div class="card">
      <div class="card-title">🕯️ Wintersun Faith</div>

      <div style="margin-bottom:0.75rem;">
        <label class="field-label">Current Deity</label>
        <select class="select" id="deity-select" onchange="saveDeity()">
          ${WINTERSUN_DEITIES.map(d=>`<option value="${d}" ${m.deity===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>

      <div style="margin-bottom:0.75rem;">
        <label class="field-label">Favor: <span id="favor-pct-label" style="color:#d4a843;">${favorPct}%</span></label>
        <input type="range" class="gold-slider" id="deity-favor" min="0" max="100" value="${favorPct}"
          style="--val:${favorPct}%"
          oninput="document.getElementById('favor-pct-label').textContent=this.value+'%';this.style.setProperty('--val',this.value+'%')"
          onchange="saveDeity()">
        <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:#555;margin-top:0.2rem;">
          <span>Neutral</span><span>Favored</span><span>Exalted</span>
        </div>
      </div>

      <div style="margin-bottom:0.75rem;">
        <label class="field-label">Active Blessings</label>
        <textarea class="textarea" id="deity-blessings" rows="3" placeholder="e.g. Shrine bonus active, +10 healing power…"
          onblur="saveDeity()">${esc(m.deityBlessings)}</textarea>
      </div>

      <div>
        <label class="field-label">Religious Taboos</label>
        <textarea class="textarea" id="deity-taboos" rows="3" placeholder="e.g. Cannot use undead, must not steal…"
          onblur="saveDeity()">${esc(m.deityTaboos)}</textarea>
      </div>
    </div>

    <!-- Card 3: Build Parameters -->
    <div class="card">
      <div class="card-title">⚙️ Character Build Parameters</div>
      <div style="font-size:0.78rem;color:#555;font-style:italic;margin-bottom:0.75rem;">Permanent LoreRim creation choices. Set once and reference here.</div>

      <div style="margin-bottom:0.75rem;">
        <label class="field-label">Birthsign (1 permanent)</label>
        <input class="input" id="build-birthsign" value="${esc(m.birthsign)}" placeholder="e.g. The Warrior"
          onblur="saveBuildParams()">
      </div>

      <div style="margin-bottom:0.75rem;">
        <label class="field-label">Character Traits (up to 3)</label>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          ${m.traits.map((t,i)=>`<input class="input" data-trait="${i}" value="${esc(t)}" placeholder="Trait ${i+1}…"
            onblur="saveBuildParams()">`).join('')}
        </div>
      </div>

      <div style="margin-bottom:0.75rem;">
        <label class="field-label">Major Skills (3 — define archetype)</label>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          ${m.majorSkills.map((s,i)=>`<input class="input" data-major="${i}" value="${esc(s)}" placeholder="Major skill ${i+1}…"
            onblur="saveBuildParams()">`).join('')}
        </div>
      </div>

      <div>
        <label class="field-label">Minor Skills (5 — support skills)</label>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          ${m.minorSkills.map((s,i)=>`<input class="input" data-minor="${i}" value="${esc(s)}" placeholder="Minor skill ${i+1}…"
            onblur="saveBuildParams()">`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function renderDerivedRows(magResist, carryWeight, speedMod, meleeDmgMult, spellCostMult, healthRegen) {
  const rows = [
    { label: 'Magic Resistance',    value: magResist+'%',        note: 'Cap: 80% (from Magicka)' },
    { label: 'Carry Weight',        value: carryWeight,          note: 'Base 300 + Sta×5' },
    { label: 'Speed Modifier',      value: (parseFloat(speedMod)>=0?'+':'')+speedMod, note: 'vs base 100 Stamina' },
    { label: 'Melee Dmg Mult',      value: '×'+meleeDmgMult,    note: 'Stamina scaling' },
    { label: 'Spell Cost Mult',     value: '×'+spellCostMult,   note: 'Magicka scaling, floor 0.2' },
    { label: 'Passive HP Regen',    value: healthRegen+'/s',     note: 'At full health' }
  ];
  return rows.map(r=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <span style="font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:0.06em;color:rgba(212,168,67,0.6);">${r.label}</span>
      <span>
        <span style="font-family:'Cinzel',serif;font-size:1rem;color:#d4a843;">${r.value}</span>
        <span style="font-size:0.68rem;color:#555;margin-left:0.4rem;">${r.note}</span>
      </span>
    </div>`).join('');
}

function updateDerived() {
  const hp  = parseInt(document.getElementById('base-hp')?.value)  || 100;
  const mag = parseInt(document.getElementById('base-mag')?.value) || 100;
  const sta = parseInt(document.getElementById('base-sta')?.value) || 100;

  const magResist     = Math.min(80, Math.floor(mag / 10));
  const carryWeight   = 300 + sta * 5;
  const speedMod      = ((sta - 100) * 0.05).toFixed(2);
  const meleeDmgMult  = (1 + (sta - 100) * 0.002).toFixed(3);
  const spellCostMult = Math.max(0.2, (1 - (mag - 100) * 0.004)).toFixed(3);
  const healthRegen   = (hp * 0.001).toFixed(3);

  const el = document.getElementById('derived-results');
  if (el) el.innerHTML = renderDerivedRows(magResist, carryWeight, speedMod, meleeDmgMult, spellCostMult, healthRegen);
}

function saveMechStats() {
  const m = window.appState.mechanics;
  m.baseHealth  = parseInt(document.getElementById('base-hp')?.value)  || 100;
  m.baseMagicka = parseInt(document.getElementById('base-mag')?.value) || 100;
  m.baseStamina = parseInt(document.getElementById('base-sta')?.value) || 100;
  saveState();
  showToast('Stats saved.');
}

function saveDeity() {
  const m = window.appState.mechanics;
  m.deity        = document.getElementById('deity-select')?.value || '';
  m.deityFavor   = parseInt(document.getElementById('deity-favor')?.value) || 0;
  m.deityBlessings = document.getElementById('deity-blessings')?.value || '';
  m.deityTaboos    = document.getElementById('deity-taboos')?.value || '';
  saveState();
}

function saveBuildParams() {
  const m = window.appState.mechanics;
  m.birthsign = document.getElementById('build-birthsign')?.value || '';
  document.querySelectorAll('[data-trait]').forEach(el => {
    m.traits[parseInt(el.dataset.trait)] = el.value;
  });
  document.querySelectorAll('[data-major]').forEach(el => {
    m.majorSkills[parseInt(el.dataset.major)] = el.value;
  });
  document.querySelectorAll('[data-minor]').forEach(el => {
    m.minorSkills[parseInt(el.dataset.minor)] = el.value;
  });
  saveState();
}
