/* ── App Init & Navigation ───────────────────────────────────────── */

const SECTIONS = {
  dashboard:  { label: 'Dashboard',         icon: '📜', render: renderDashboard },
  journal:    { label: 'The Chronicle',      icon: '📖', render: renderJournal },
  character:  { label: 'Character State',    icon: '⚔️',  render: renderCharacter },
  build:      { label: 'Build Workshop',     icon: '🏗️',  render: renderBuild },
  mods:       { label: 'Mod Wiki',           icon: '📦', render: renderMods },
  mechanics:  { label: 'Requiem Mechanics',  icon: '🔮', render: renderMechanics },
  utilities:  { label: 'LoreRim Utilities',  icon: '🗺️',  render: renderUtilities },
  backup:     { label: 'Data & Backup',      icon: '💾', render: renderBackup }
};

let currentSection = 'dashboard';

function navigate(section) {
  if (!SECTIONS[section]) return;
  currentSection = section;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });
  try {
    SECTIONS[section].render();
  } catch(e) {
    console.error('Error rendering section:', section, e);
    document.getElementById('main-content').innerHTML = `
      <div style="padding:2rem;color:#c07070;font-family:'Cinzel',serif;">
        <div style="font-size:1rem;margin-bottom:0.5rem;">⚠ Render Error</div>
        <div style="font-size:0.8rem;color:#555;">${e.message}</div>
      </div>`;
  }
  if (window.innerWidth < 1024) {
    document.getElementById('sidebar').classList.add('collapsed');
    document.getElementById('sidebar-overlay').style.display = 'none';
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isCollapsed = sidebar.classList.contains('collapsed');
  sidebar.classList.toggle('collapsed');
  overlay.style.display = isCollapsed ? 'block' : 'none';
}

// ── Session Timer ─────────────────────────────────────────────────────
let _sessionStart = null;
let _sessionInterval = null;

function startSession() {
  if (_sessionStart) return;
  _sessionStart = Date.now();
  _sessionInterval = setInterval(_tickTimer, 1000);
  _tickTimer();
  _updateTimerUI();
  showToast('Session started. Good luck out there.');
}

function endSession() {
  if (!_sessionStart) return;
  const minutes = Math.round((Date.now() - _sessionStart) / 60000);
  clearInterval(_sessionInterval);
  _sessionInterval = null;
  _sessionStart = null;

  if (minutes > 0) {
    const session = { id: generateId(), date: todayISO(), durationMinutes: minutes };
    if (!window.appState.sessions) window.appState.sessions = [];
    window.appState.sessions.push(session);
    saveState();
    showToast(`Session logged — ${formatDuration(minutes)} played.`);
  } else {
    showToast('Session ended (under 1 minute — not logged).');
  }
  _updateTimerUI();
}

function _tickTimer() {
  const el = document.getElementById('session-timer-display');
  if (!el || !_sessionStart) return;
  const elapsed = Math.floor((Date.now() - _sessionStart) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  el.textContent = h
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function _updateTimerUI() {
  const timerEl = document.getElementById('session-timer-area');
  if (!timerEl) return;
  if (_sessionStart) {
    timerEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.75rem;background:rgba(212,168,67,0.06);border:1px solid rgba(212,168,67,0.15);border-radius:3px;cursor:default;">
        <span style="color:#c07070;font-size:0.65rem;">⏱</span>
        <span id="session-timer-display" style="font-family:'Cinzel',serif;font-size:0.65rem;color:#d4a843;letter-spacing:0.06em;min-width:42px;">00:00</span>
        <button onclick="endSession()" title="End session" style="background:rgba(192,80,80,0.15);border:1px solid rgba(192,80,80,0.3);color:#c07070;font-size:0.58rem;padding:0.15rem 0.4rem;border-radius:2px;cursor:pointer;margin-left:auto;font-family:'Cinzel',serif;letter-spacing:0.06em;">■ End</button>
      </div>`;
  } else {
    timerEl.innerHTML = `
      <button onclick="startSession()" style="width:100%;display:flex;align-items:center;gap:0.5rem;padding:0.45rem 0.75rem;background:rgba(212,168,67,0.04);border:1px solid rgba(212,168,67,0.1);border-radius:3px;cursor:pointer;color:#8a8070;font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:0.06em;text-align:left;">
        <span>▶</span><span>Start Session</span>
      </button>`;
  }
}

// ── Character Switcher ────────────────────────────────────────────────
function renderCharSwitcher() {
  const chars = getCharsIndex();
  const activeId = getActiveCharId();
  const switcher = document.getElementById('char-switcher');
  if (!switcher) return;

  if (chars.length <= 1 && chars[0]?.name === 'Character 1' && !window.appState.character.name) {
    switcher.innerHTML = '';
    return;
  }

  switcher.innerHTML = `
    <div style="padding:0.5rem 0.75rem 0;border-top:1px solid rgba(212,168,67,0.08);">
      <div style="font-family:'Cinzel',serif;font-size:0.5rem;letter-spacing:0.12em;color:rgba(212,168,67,0.3);text-transform:uppercase;margin-bottom:0.35rem;">Character</div>
      <div style="display:flex;gap:0.35rem;align-items:center;">
        <select id="char-select" onchange="onCharSwitch(this.value)" style="flex:1;font-family:'Cinzel',serif;font-size:0.68rem;background:#111118;border:1px solid rgba(212,168,67,0.2);color:#d4cfc4;padding:0.25rem 0.35rem;border-radius:3px;cursor:pointer;">
          ${chars.map(c => `<option value="${esc(c.id)}" ${c.id===activeId?'selected':''}>${esc(c.name || 'Unnamed')}${c.race?' ('+esc(c.race)+')':''}</option>`).join('')}
        </select>
        <button onclick="promptNewCharacter()" title="New character" style="background:rgba(212,168,67,0.08);border:1px solid rgba(212,168,67,0.2);color:#d4a843;padding:0.25rem 0.5rem;border-radius:3px;cursor:pointer;font-size:0.75rem;">+</button>
      </div>
    </div>`;
}

function onCharSwitch(id) {
  if (id === getActiveCharId()) return;
  if (!confirm('Switch character? Unsaved changes will be lost.')) {
    // Revert select
    const sel = document.getElementById('char-select');
    if (sel) sel.value = getActiveCharId();
    return;
  }
  switchCharacter(id);
  navigate(currentSection);
  updateHeaderName();
  renderCharSwitcher();
  showToast('Character switched.');
}

function promptNewCharacter() {
  const name = prompt('Name for new character:');
  if (!name || !name.trim()) return;
  const id = createCharacter(name.trim());
  switchCharacter(id);
  navigate('dashboard');
  updateHeaderName();
  renderCharSwitcher();
  showToast(`New character "${name.trim()}" created.`);
}

// ── Keyboard shortcuts ────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    if (currentSection === 'dashboard') saveDashboard();
    if (currentSection === 'journal')   saveJournalEntry();
    showToast('Saved.');
  }
  if (e.key === 'Escape') {
    document.getElementById('sidebar')?.classList.add('collapsed');
    document.getElementById('sidebar-overlay').style.display = 'none';
  }
});

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Build nav
  const navEl = document.getElementById('sidebar-nav');
  for (const key of Object.keys(SECTIONS)) {
    const item = SECTIONS[key];
    const el = document.createElement('div');
    el.className = 'nav-item';
    el.dataset.section = key;
    el.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
    el.addEventListener('click', () => navigate(key));
    navEl.appendChild(el);
    if (key === 'backup') {
      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:rgba(212,168,67,0.08);margin:0.5rem 1rem;';
      navEl.appendChild(sep);
    }
  }

  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('collapsed');
    document.getElementById('sidebar-overlay').style.display = 'none';
  });

  if (window.innerWidth < 1024) {
    document.getElementById('sidebar').classList.add('collapsed');
  }

  navigate('dashboard');
  updateHeaderName();
  updateSidebarLinks();
  renderCharSwitcher();
  _updateTimerUI();

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

function updateHeaderName() {
  const nameEl = document.getElementById('header-char-name');
  if (nameEl && window.appState.character.name) {
    nameEl.textContent = window.appState.character.name;
  }
}

function updateSidebarLinks() {
  const url = window.appState.siteConfig?.notebookLmUrl;
  const linkEl = document.getElementById('notebooklm-sidebar-link');
  if (!linkEl) return;
  if (url) {
    linkEl.href = url;
    linkEl.style.display = 'flex';
  } else {
    linkEl.style.display = 'none';
  }
}
window.updateSidebarLinks = updateSidebarLinks;

// ── Global exports ────────────────────────────────────────────────────
window.navigate             = navigate;
window.toggleSidebar        = toggleSidebar;
window.saveDashboard        = saveDashboard;
window.saveJournalEntry     = saveJournalEntry;
window.newJournalEntry      = newJournalEntry;
window.openJournalEntry     = openJournalEntry;
window.deleteJournalEntry   = deleteJournalEntry;
window.filterJournalTag     = filterJournalTag;
window.setJournalSearch     = setJournalSearch;
window.handleEntryImageUpload = handleEntryImageUpload;
window.removeEntryImage     = removeEntryImage;
window.exportCharacterPDF   = exportCharacterPDF;
window.exportJournalPDF     = exportJournalPDF;
window.toggleAccordion      = toggleAccordion;
window.toggleQuest          = toggleQuest;
window.updateQuestName      = updateQuestName;
window.updateQuestDate      = updateQuestDate;
window.addQuest             = addQuest;
window.deleteQuest          = deleteQuest;
window.setCharSubTab        = setCharSubTab;
window.addSpell             = addSpell;
window.updateSpellField     = updateSpellField;
window.deleteSpell          = deleteSpell;
window.openEquipSlot        = openEquipSlot;
window.saveEquipSlot        = saveEquipSlot;
window.clearEquipSlot       = clearEquipSlot;
window.importMO2List        = importMO2List;
window.toggleMod            = toggleMod;
window.updateModCat         = updateModCat;
window.toggleModExpand      = toggleModExpand;
window.saveModNotes         = saveModNotes;
window.clearAllMods         = clearAllMods;
window.updateDerived        = updateDerived;
window.saveMechStats        = saveMechStats;
window.saveDeity            = saveDeity;
window.saveBuildParams      = saveBuildParams;
window.toggleUtil           = toggleUtil;
window.setStance            = setStance;
window.saveStance           = saveStance;
window.updateEconCalc       = updateEconCalc;
window.toggleEconBuff       = toggleEconBuff;
window.addLifecycleRow      = addLifecycleRow;
window.updateLifecycleStatus = updateLifecycleStatus;
window.deleteLifecycleRow   = deleteLifecycleRow;
window.openArtifactDetail   = openArtifactDetail;
window.toggleArtifact       = toggleArtifact;
window.saveArtifact         = saveArtifact;
window.addKb                = addKb;
window.updateKb             = updateKb;
window.deleteKb             = deleteKb;
window.addFollower          = addFollower;
window.updateFollower       = updateFollower;
window.setFollowerBond      = setFollowerBond;
window.deleteFollower       = deleteFollower;
window.addDeathEntry        = addDeathEntry;
window.updateDeath          = updateDeath;
window.deleteDeathEntry     = deleteDeathEntry;
window.startSession         = startSession;
window.endSession           = endSession;
window.onCharSwitch         = onCharSwitch;
window.promptNewCharacter   = promptNewCharacter;
window.exportNotebookLore   = exportNotebookLore;
window.exportNotebookBuild  = exportNotebookBuild;
window.exportNotebookMods   = exportNotebookMods;
window.exportNotebookWorld  = exportNotebookWorld;
window.exportAllNotebook    = exportAllNotebook;
window.exportPublicModGuide = exportPublicModGuide;
window.saveNotebookLmUrl    = saveNotebookLmUrl;
window.renderBuild          = renderBuild;
window.saveBuild            = saveBuild;
window.addMilestone         = addMilestone;
window.updateMilestone      = updateMilestone;
window.deleteMilestone      = deleteMilestone;
window.addPerkRow           = addPerkRow;
window.updatePerk           = updatePerk;
window.deletePerk           = deletePerk;
window.saveGearSlot         = saveGearSlot;
window.downloadBackup       = downloadBackup;
window.importBackup         = importBackup;
window.resetAllData         = resetAllData;
window.handlePortraitUpload = handlePortraitUpload;
