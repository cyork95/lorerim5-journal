/* ── Backup & Data Section ───────────────────────────────────────── */

function renderBackup() {
  const stateSize = (new Blob([JSON.stringify(window.appState)]).size / 1024).toFixed(1);

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:720px;">
  <div style="margin-bottom:1.5rem;">
    <div class="section-header">💾 Data & Backup</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <!-- Storage Info -->
  <div class="card" style="margin-bottom:1rem;">
    <div class="card-title">📊 Storage Status</div>
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-size:0.88rem;">
      <div><span style="color:rgba(212,168,67,0.5);font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;">Data Size</span><br><span style="color:#d4a843;font-family:'Cinzel',serif;font-size:1.1rem;">${stateSize} KB</span></div>
      <div><span style="color:rgba(212,168,67,0.5);font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;">Journal Entries</span><br><span style="color:#d4a843;font-family:'Cinzel',serif;font-size:1.1rem;">${window.appState.journal.length}</span></div>
      <div><span style="color:rgba(212,168,67,0.5);font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;">Mods Tracked</span><br><span style="color:#d4a843;font-family:'Cinzel',serif;font-size:1.1rem;">${window.appState.mods.length}</span></div>
      <div><span style="color:rgba(212,168,67,0.5);font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;">Quests Logged</span><br><span style="color:#d4a843;font-family:'Cinzel',serif;font-size:1.1rem;">${countCompletedQuests()} completed</span></div>
    </div>
  </div>

  <!-- Download Backup -->
  <div class="card" style="margin-bottom:1rem;">
    <div class="card-title">⬇️ Download Backup</div>
    <p style="font-size:0.88rem;color:#9a9080;margin-bottom:0.75rem;">Downloads a complete JSON snapshot of all your data: character, journal entries, quests, mods, keybinds, and settings.</p>
    <button class="btn btn-primary" onclick="downloadBackup()">📦 Download Backup JSON</button>
  </div>

  <!-- Import Backup -->
  <div class="card" style="margin-bottom:1rem;">
    <div class="card-title">⬆️ Import Backup</div>
    <p style="font-size:0.88rem;color:#9a9080;margin-bottom:0.75rem;">Select a previously downloaded backup JSON file to restore your full application state. <strong style="color:#c07070;">This will overwrite all current data.</strong></p>
    <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
      <label class="btn" style="cursor:pointer;">
        📂 Choose Backup File
        <input type="file" accept=".json" id="backup-file-input" style="display:none" onchange="importBackup(this)">
      </label>
      <span id="import-status" style="font-size:0.82rem;color:#555;font-style:italic;"></span>
    </div>
  </div>

  <!-- Reset -->
  <div class="card" style="border-top-color:rgba(180,60,60,0.4);">
    <div class="card-title" style="color:#c07070;">⚠️ Danger Zone</div>
    <p style="font-size:0.88rem;color:#9a9080;margin-bottom:0.75rem;">Permanently reset all data to factory defaults. Download a backup first. This cannot be undone.</p>
    <button class="btn btn-danger" onclick="resetAllData()">🗑 Reset All Data</button>
  </div>
</div>`;
}

function downloadBackup() {
  const filename = `lorerim5-backup-${window.appState.character.name || 'character'}-${todayISO()}.json`;
  const blob = new Blob([JSON.stringify(window.appState, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded.');
}

function importBackup(input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById('import-status');
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON structure');
      if (!confirm(`Import backup from "${file.name}"?\n\nThis will overwrite ALL current data. Make sure you've downloaded a backup of the current state first.`)) return;
      window.appState = data;
      saveState();
      renderBackup();
      showToast('Backup restored successfully.');
    } catch(e) {
      if (statusEl) statusEl.textContent = `Error: ${e.message}`;
      showToast('Import failed — invalid backup file.');
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (!confirm('RESET ALL DATA?\n\nThis permanently erases your character, journal entries, quests, mods, and all settings.\n\nAre you absolutely sure?')) return;
  if (!confirm('Second confirmation: Delete everything and start fresh?')) return;
  localStorage.removeItem('lorerim5_state');
  window.appState = loadState(); // reloads defaults
  renderBackup();
  showToast('All data reset to defaults.');
}
