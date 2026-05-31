/* ── PDF Export Functions ────────────────────────────────────────── */

function exportCharacterPDF() {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Check your internet connection and reload.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 15; // margins
  let y = M;

  const c  = window.appState.character;
  const m  = window.appState.mechanics;
  const eq = window.appState.equipment;

  // ── Parchment background
  doc.setFillColor(245, 239, 224);
  doc.rect(0, 0, W, H, 'F');

  // ── Decorative border
  doc.setDrawColor(161, 122, 60);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, W-16, H-16);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, W-20, H-20);

  // ── Title Block
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(61, 47, 30);
  doc.text('CHARACTER CHRONICLE', W/2, y + 10, { align:'center' });
  y += 14;

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(120, 90, 50);
  doc.text('✦ ─────── LoreRim V ─────── ✦', W/2, y, { align:'center' });
  y += 6;

  doc.setDrawColor(161, 122, 60);
  doc.setLineWidth(0.5);
  doc.line(M, y, W-M, y);
  y += 6;

  // ── Character Name
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(61, 47, 30);
  doc.text(c.name || 'Unnamed Hero', W/2, y, { align:'center' });
  y += 7;

  // ── Stats Row
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 70, 40);
  const statsRow = [
    ['Race', c.race || '—'],
    ['Level', String(c.level || 1)],
    ['Birthsign', c.birthsign || '—'],
    ['Archetype', c.archetype || '—']
  ];
  const colW = (W - M*2) / statsRow.length;
  statsRow.forEach(([label, val], i) => {
    const x = M + i * colW + colW/2;
    doc.setFont('times', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(140, 100, 50);
    doc.text(label.toUpperCase(), x, y, { align:'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(61, 47, 30);
    doc.text(val, x, y+5, { align:'center' });
  });
  y += 12;

  doc.setLineWidth(0.3);
  doc.line(M, y, W-M, y);
  y += 5;

  // ── Build Params
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 65, 20);
  doc.text('BUILD PARAMETERS', M, y);
  y += 5;

  const bp = [
    ['Birthsign', m.birthsign || '—'],
    ['Traits', m.traits.filter(Boolean).join(', ') || '—'],
    ['Major Skills', m.majorSkills.filter(Boolean).join(', ') || '—'],
    ['Minor Skills', m.minorSkills.filter(Boolean).join(', ') || '—'],
  ];
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  bp.forEach(([label, val]) => {
    doc.setTextColor(120, 90, 50);
    doc.text(label + ': ', M, y);
    doc.setTextColor(61, 47, 30);
    const textWidth = doc.getTextWidth(label + ': ');
    const lines = doc.splitTextToSize(val, W - M*2 - textWidth);
    doc.text(lines, M + textWidth, y);
    y += 4.5 * lines.length;
  });
  y += 2;

  doc.line(M, y, W-M, y);
  y += 5;

  // ── Backstory
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 65, 20);
  doc.text('BACKSTORY & LORE', M, y);
  y += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(61, 47, 30);
  if (c.backstory) {
    const bsLines = doc.splitTextToSize(c.backstory, W - M*2);
    for (const line of bsLines) {
      if (y > H - 40) { doc.addPage(); doc.setFillColor(245,239,224); doc.rect(0,0,W,H,'F'); doc.setDrawColor(161,122,60); doc.rect(8,8,W-16,H-16,'S'); y = M+10; }
      doc.text(line, M, y);
      y += 4.5;
    }
  } else {
    doc.text('No backstory recorded.', M, y);
    y += 5;
  }
  y += 3;

  // Check if we need new page for equipment
  if (y > H - 60) { doc.addPage(); doc.setFillColor(245,239,224); doc.rect(0,0,W,H,'F'); doc.setDrawColor(161,122,60); doc.rect(8,8,W-16,H-16,'S'); y = M+10; }

  doc.setLineWidth(0.3);
  doc.line(M, y, W-M, y);
  y += 5;

  // ── Equipment
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 65, 20);
  doc.text('EQUIPPED GEAR', M, y);
  y += 5;

  const eqSlots = [
    ['Head', eq.head], ['Chest', eq.chest], ['Hands', eq.hands], ['Feet', eq.feet],
    ['Left Hand', eq.leftHand], ['Right Hand', eq.rightHand],
    ['Ring', eq.ring1], ['Ring 2', eq.ring2], ['Amulet', eq.amulet]
  ];

  const halfW = (W - M*2 - 5) / 2;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);

  const leftSlots  = eqSlots.slice(0, Math.ceil(eqSlots.length/2));
  const rightSlots = eqSlots.slice(Math.ceil(eqSlots.length/2));
  const maxRows = Math.max(leftSlots.length, rightSlots.length);

  for (let i = 0; i < maxRows; i++) {
    const renderSlot = (slot, xOff) => {
      if (!slot) return;
      const [label, item] = slot;
      doc.setTextColor(140, 100, 50);
      doc.setFont('times', 'bold');
      doc.setFontSize(7);
      doc.text(label.toUpperCase(), M + xOff, y);
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(61, 47, 30);
      doc.text(item?.name || '—', M + xOff, y + 4);
      if (item?.enchantment) {
        doc.setFont('times', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(120, 90, 50);
        doc.text(item.enchantment, M + xOff, y + 8);
      }
    };
    renderSlot(leftSlots[i],  0);
    renderSlot(rightSlots[i], halfW + 5);
    y += 12;
  }

  // ── Faith
  if (y > H - 30) { doc.addPage(); doc.setFillColor(245,239,224); doc.rect(0,0,W,H,'F'); doc.setDrawColor(161,122,60); doc.rect(8,8,W-16,H-16,'S'); y = M+10; }

  y += 3;
  doc.setLineWidth(0.3);
  doc.line(M, y, W-M, y);
  y += 5;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 65, 20);
  doc.text('WINTERSUN FAITH', M, y);
  y += 5;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(61, 47, 30);
  doc.text(`Deity: ${window.appState.mechanics.deity || '—'}   Favor: ${window.appState.mechanics.deityFavor}%`, M, y);
  y += 5;
  if (window.appState.mechanics.deityBlessings) {
    doc.setFont('times', 'italic');
    const blessLines = doc.splitTextToSize('Blessings: ' + window.appState.mechanics.deityBlessings, W-M*2);
    doc.text(blessLines, M, y); y += blessLines.length * 4.5;
  }

  // ── Footer
  doc.setFont('times', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(160, 130, 80);
  doc.text(`Generated by LoreRim V Journal — ${new Date().toLocaleDateString()}`, W/2, H-10, { align:'center' });

  doc.save(`${c.name || 'character'}-sheet-lorerim5.pdf`);
  showToast('Character sheet PDF downloaded.');
}

// ── Journal PDF ───────────────────────────────────────────────────────
function exportJournalPDF() {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Check your internet connection and reload.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18;
  const c = window.appState.character;
  const entries = [...window.appState.journal].sort((a,b) => a.date.localeCompare(b.date));

  if (!entries.length) {
    alert('No journal entries to export.');
    return;
  }

  // ── Title Page
  doc.setFillColor(248, 246, 242);
  doc.rect(0, 0, W, H, 'F');
  doc.setDrawColor(180, 160, 120);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, W-20, H-20);

  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(61, 47, 30);
  doc.text('THE CHRONICLE OF', W/2, 100, { align:'center' });
  doc.setFontSize(32);
  doc.text(c.name || 'The Hero', W/2, 116, { align:'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(120, 90, 50);
  if (c.race || c.archetype) {
    doc.text([c.race, c.archetype].filter(Boolean).join(' — '), W/2, 128, { align:'center' });
  }

  doc.setFontSize(10);
  doc.text(`${entries.length} Entries  ·  ${formatDate(entries[0].date)} — ${formatDate(entries[entries.length-1].date)}`, W/2, 140, { align:'center' });

  doc.setFontSize(9);
  doc.setTextColor(160, 130, 80);
  doc.text('✦ ─────── LoreRim V Journal ─────── ✦', W/2, 155, { align:'center' });

  // ── Entries
  for (const entry of entries) {
    doc.addPage();
    doc.setFillColor(255, 253, 250);
    doc.rect(0, 0, W, H, 'F');

    let y = M;

    // Date header
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 120, 70);
    doc.text(formatDate(entry.date).toUpperCase(), M, y);
    y += 6;

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(61, 47, 30);
    doc.text(entry.title || 'Untitled Entry', M, y);
    y += 5;

    // Tags
    if (entry.tags.length) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 110, 60);
      doc.text('Tags: ' + entry.tags.join(', '), M, y);
      y += 5;
    }

    // Divider
    doc.setDrawColor(180, 150, 100);
    doc.setLineWidth(0.4);
    doc.line(M, y, W-M, y);
    y += 6;

    // Content
    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(40, 30, 18);
    const contentLines = doc.splitTextToSize(entry.content || '', W - M*2);
    for (const line of contentLines) {
      if (y > H - M) {
        doc.addPage();
        doc.setFillColor(255, 253, 250);
        doc.rect(0,0,W,H,'F');
        y = M;
        // Continuation header
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(150, 120, 70);
        doc.text(`${entry.title || 'Entry'} (cont.)`, M, y);
        y += 8;
      }
      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(40, 30, 18);
      doc.text(line, M, y);
      y += 5.5;
    }

    // Page footer
    doc.setFont('times', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(180, 160, 120);
    doc.text(formatDate(entry.date), W/2, H-8, { align:'center' });
  }

  doc.save(`${c.name || 'character'}-journal-lorerim5.pdf`);
  showToast('Journal PDF downloaded.');
}
