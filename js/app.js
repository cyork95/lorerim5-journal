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

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  // Render section
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

  // Close mobile sidebar
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

// ── Keyboard shortcuts ────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  // Ctrl+S to save (in dashboard)
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    if (currentSection === 'dashboard') saveDashboard();
    if (currentSection === 'journal')   saveJournalEntry();
    showToast('Saved.');
  }
  // Escape to close mobile sidebar
  if (e.key === 'Escape') {
    document.getElementById('sidebar')?.classList.add('collapsed');
    document.getElementById('sidebar-overlay').style.display = 'none';
  }
});

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Build nav
  const navEl = document.getElementById('sidebar-nav');
  const sectionKeys = Object.keys(SECTIONS);

  for (const key of sectionKeys) {
    const item = SECTIONS[key];
    const el = document.createElement('div');
    el.className = 'nav-item';
    el.dataset.section = key;
    el.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
    el.addEventListener('click', () => navigate(key));
    navEl.appendChild(el);

    // Separator before backup
    if (key === 'backup') {
      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:rgba(212,168,67,0.08);margin:0.5rem 1rem;';
      navEl.appendChild(sep);
    }
  }

  // Overlay click to close sidebar
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('collapsed');
    document.getElementById('sidebar-overlay').style.display = 'none';
  });

  // Mobile: start collapsed
  if (window.innerWidth < 1024) {
    document.getElementById('sidebar').classList.add('collapsed');
  }

  // Navigate to dashboard
  navigate('dashboard');

  // Update character name in header if set
  updateHeaderName();
});

function updateHeaderName() {
  const nameEl = document.getElementById('header-char-name');
  if (nameEl && window.appState.character.name) {
    nameEl.textContent = window.appState.character.name;
  }
}

// Expose globals needed by inline HTML event handlers
window.navigate        = navigate;
window.toggleSidebar   = toggleSidebar;
window.saveDashboard   = saveDashboard;
window.saveJournalEntry = saveJournalEntry;
window.newJournalEntry = newJournalEntry;
window.openJournalEntry = openJournalEntry;
window.deleteJournalEntry = deleteJournalEntry;
window.filterJournalTag = filterJournalTag;
window.exportCharacterPDF = exportCharacterPDF;
window.exportJournalPDF   = exportJournalPDF;
window.toggleAccordion    = toggleAccordion;
window.toggleQuest        = toggleQuest;
window.updateQuestName    = updateQuestName;
window.updateQuestDate    = updateQuestDate;
window.addQuest           = addQuest;
window.deleteQuest        = deleteQuest;
window.setCharSubTab      = setCharSubTab;
window.addSpell           = addSpell;
window.updateSpellField   = updateSpellField;
window.deleteSpell        = deleteSpell;
window.openEquipSlot      = openEquipSlot;
window.saveEquipSlot      = saveEquipSlot;
window.clearEquipSlot     = clearEquipSlot;
window.importMO2List      = importMO2List;
window.toggleMod          = toggleMod;
window.updateModCat       = updateModCat;
window.toggleModExpand    = toggleModExpand;
window.saveModNotes       = saveModNotes;
window.clearAllMods       = clearAllMods;
window.updateDerived      = updateDerived;
window.saveMechStats      = saveMechStats;
window.saveDeity          = saveDeity;
window.saveBuildParams    = saveBuildParams;
window.toggleUtil         = toggleUtil;
window.setStance          = setStance;
window.saveStance         = saveStance;
window.updateEconCalc     = updateEconCalc;
window.toggleEconBuff     = toggleEconBuff;
window.addLifecycleRow    = addLifecycleRow;
window.updateLifecycleStatus = updateLifecycleStatus;
window.deleteLifecycleRow = deleteLifecycleRow;
window.openArtifactDetail = openArtifactDetail;
window.toggleArtifact     = toggleArtifact;
window.saveArtifact       = saveArtifact;
window.addKb              = addKb;
window.updateKb           = updateKb;
window.deleteKb           = deleteKb;
window.addFollower        = addFollower;
window.updateFollower     = updateFollower;
window.setFollowerBond    = setFollowerBond;
window.deleteFollower     = deleteFollower;
window.renderBuild        = renderBuild;
window.saveBuild          = saveBuild;
window.addMilestone       = addMilestone;
window.updateMilestone    = updateMilestone;
window.deleteMilestone    = deleteMilestone;
window.addPerkRow         = addPerkRow;
window.updatePerk         = updatePerk;
window.deletePerk         = deletePerk;
window.saveGearSlot       = saveGearSlot;
window.downloadBackup     = downloadBackup;
window.importBackup       = importBackup;
window.resetAllData       = resetAllData;
window.handlePortraitUpload = handlePortraitUpload;
