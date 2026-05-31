/* ── Journal Section ─────────────────────────────────────────────── */

let activeJournalId = null;
let journalTagFilter = null;

function renderJournal() {
  const entries = window.appState.journal;
  const allTags = [...new Set(entries.flatMap(e => e.tags))].sort();

  document.getElementById('main-content').innerHTML = `
<div style="padding:1.5rem 1.75rem;max-width:1100px;">

  <div style="margin-bottom:1.25rem;">
    <div class="section-header">📖 The Chronicle</div>
    <div class="ornament">✦ ─────── ✦ ─────── ✦</div>
  </div>

  <div style="display:grid;grid-template-columns:280px 1fr;gap:1.25rem;align-items:start;">

    <!-- Left: Entry List -->
    <div>
      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
        <button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="newJournalEntry()">+ New Entry</button>
        <button class="btn btn-sm" onclick="exportJournalPDF()" title="Export to PDF">📄</button>
      </div>

      <!-- Tag filter -->
      ${allTags.length ? `
      <div style="margin-bottom:0.75rem;display:flex;flex-wrap:wrap;gap:0.3rem;">
        <span class="tag ${!journalTagFilter?'active':''}" onclick="filterJournalTag(null)">All</span>
        ${allTags.map(t => `<span class="tag ${journalTagFilter===t?'active':''}" onclick="filterJournalTag('${esc(t)}')">${esc(t)}</span>`).join('')}
      </div>` : ''}

      <!-- Entry list -->
      <div id="entry-list" style="display:flex;flex-direction:column;gap:0.5rem;max-height:70vh;overflow-y:auto;padding-right:4px;">
        ${renderEntryList(entries)}
      </div>
    </div>

    <!-- Right: Editor -->
    <div id="journal-editor-panel">
      ${activeJournalId ? renderEditor(entries.find(e=>e.id===activeJournalId)) : renderEditorEmpty()}
    </div>
  </div>
</div>`;
}

function renderEntryList(entries) {
  const filtered = journalTagFilter
    ? entries.filter(e => e.tags.includes(journalTagFilter))
    : entries;
  const sorted = [...filtered].sort((a,b) => b.date.localeCompare(a.date));
  if (!sorted.length) return `<div style="color:#555;font-style:italic;font-size:0.85rem;padding:0.5rem;">No entries yet.</div>`;
  return sorted.map(e => `
    <div class="journal-card ${activeJournalId===e.id?'active':''}" onclick="openJournalEntry('${e.id}')">
      <div class="journal-date">${formatDate(e.date)}</div>
      <div class="journal-title">${esc(e.title) || '<em style="color:#555">Untitled</em>'}</div>
      <div style="margin-top:0.3rem;display:flex;flex-wrap:wrap;gap:0.25rem;">
        ${e.tags.map(t=>`<span class="tag" style="font-size:0.5rem;">${esc(t)}</span>`).join('')}
      </div>
    </div>`).join('');
}

function renderEditorEmpty() {
  return `<div class="card" style="display:flex;align-items:center;justify-content:center;min-height:300px;flex-direction:column;gap:0.75rem;color:#555;">
    <div style="font-size:2rem;">📜</div>
    <div style="font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.1em;">Select an entry or create a new one</div>
  </div>`;
}

function renderEditor(entry) {
  if (!entry) return renderEditorEmpty();
  return `
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;gap:0.75rem;">
      <div style="flex:1;">
        <label class="field-label">Entry Title</label>
        <input class="input" id="entry-title" value="${esc(entry.title)}" placeholder="Title…" style="font-family:'Cinzel',serif;font-size:1rem;">
      </div>
      <div style="width:140px;">
        <label class="field-label">Date</label>
        <input class="input" id="entry-date" type="date" value="${entry.date}">
      </div>
    </div>

    <div style="margin-bottom:0.75rem;">
      <label class="field-label">Tags <span style="color:#555;font-style:italic;font-weight:normal;font-family:'EB Garamond',serif;">(comma separated)</span></label>
      <input class="input" id="entry-tags" value="${entry.tags.join(', ')}" placeholder="e.g. Whiterun, Main Quest, Combat">
    </div>

    <div style="margin-bottom:0.75rem;">
      <label class="field-label">✦ Journal Entry</label>
      <textarea class="textarea" id="entry-content" rows="18" placeholder="Write your chronicle here…\n\nLet the quill speak of deeds done, dangers faced, and secrets uncovered in this land of cold winds and ancient stone.">${esc(entry.content)}</textarea>
    </div>

    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="saveJournalEntry()">💾 Save Entry</button>
      <button class="btn btn-danger btn-sm" onclick="deleteJournalEntry('${entry.id}')">🗑 Delete</button>
      <span style="margin-left:auto;font-size:0.75rem;color:#555;font-style:italic;line-height:2.2;">${countWords(entry.content)} words</span>
    </div>
  </div>`;
}

function newJournalEntry() {
  const id = generateId();
  const entry = { id, date: todayISO(), title: '', content: '', tags: [] };
  window.appState.journal.unshift(entry);
  saveState();
  activeJournalId = id;
  renderJournal();
}

function openJournalEntry(id) {
  activeJournalId = id;
  renderJournal();
  document.getElementById('entry-title')?.focus();
}

function saveJournalEntry() {
  const entry = window.appState.journal.find(e => e.id === activeJournalId);
  if (!entry) return;
  entry.title   = document.getElementById('entry-title')?.value || '';
  entry.date    = document.getElementById('entry-date')?.value || todayISO();
  entry.content = document.getElementById('entry-content')?.value || '';
  const rawTags = document.getElementById('entry-tags')?.value || '';
  entry.tags = rawTags.split(',').map(t=>t.trim()).filter(Boolean);
  saveState();
  // Refresh list without closing editor
  document.getElementById('entry-list').innerHTML = renderEntryList(window.appState.journal);
  showToast('Entry saved.');
}

function deleteJournalEntry(id) {
  if (!confirm('Delete this journal entry? This cannot be undone.')) return;
  window.appState.journal = window.appState.journal.filter(e => e.id !== id);
  if (activeJournalId === id) activeJournalId = null;
  saveState();
  renderJournal();
}

function filterJournalTag(tag) {
  journalTagFilter = tag;
  renderJournal();
}

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:1.5rem;right:1.5rem;
      background:#1a1a22;border:1px solid rgba(212,168,67,0.4);
      color:#d4a843;font-family:'Cinzel',serif;font-size:0.68rem;
      letter-spacing:0.08em;padding:0.6rem 1rem;border-radius:3px;
      z-index:9999;transition:opacity 0.3s;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}
window.showToast = showToast;
