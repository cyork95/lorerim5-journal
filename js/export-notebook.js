/* ── NotebookLM Markdown Export ──────────────────────────────────── */

function downloadMd(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugName() {
  return (window.appState.character.name || 'character').replace(/\s+/g, '-').toLowerCase();
}

function nl(lines) {
  return lines.filter(Boolean).join('\n');
}

// ── 1. Lore & Journal ─────────────────────────────────────────────────
function exportNotebookLore() {
  const c = window.appState.character;
  const m = window.appState.mechanics;
  const entries = [...window.appState.journal].sort((a,b) => a.date.localeCompare(b.date));

  const lines = [
    `# LoreRim 5 — Lore & Journal: ${c.name || 'Unknown Hero'}`,
    `*Generated ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} · LoreRim 5 by Biggie_Boss*`,
    '',
    '---',
    '',
    '## Character Profile',
    '',
    `**Name:** ${c.name || '—'}`,
    `**Race:** ${c.race || '—'}`,
    `**Level:** ${c.level || 1}`,
    `**Birthsign / Standing Stone:** ${c.birthsign || '—'}`,
    `**Build Archetype:** ${c.archetype || '—'}`,
    '',
    '### Permanent Creation Choices',
    `**Birthsign (Permanent):** ${m.birthsign || '—'}`,
    `**Character Traits:** ${m.traits.filter(Boolean).join(', ') || '—'}`,
    `**Major Skills:** ${m.majorSkills.filter(Boolean).join(', ') || '—'}`,
    `**Minor Skills:** ${m.minorSkills.filter(Boolean).join(', ') || '—'}`,
    '',
    '### Faith',
    `**Deity:** ${m.deity || 'None'}`,
    `**Favor:** ${m.deityFavor || 0}%`,
    m.deityBlessings ? `**Active Blessings:** ${m.deityBlessings}` : '',
    m.deityTaboos    ? `**Religious Taboos:** ${m.deityTaboos}`    : '',
    '',
    '---',
    '',
    '## Backstory',
    '',
    c.backstory || '*No backstory recorded.*',
    '',
    '---',
    '',
    `## Journal (${entries.length} ${entries.length === 1 ? 'entry' : 'entries'})`,
    '',
  ];

  if (!entries.length) {
    lines.push('*No journal entries recorded.*');
  } else {
    for (const entry of entries) {
      lines.push(`### ${entry.title || 'Untitled Entry'}`);
      lines.push(`*${formatDate(entry.date)}*`);
      if (entry.tags.length) lines.push(`**Tags:** ${entry.tags.join(', ')}`);
      lines.push('');
      lines.push(entry.content || '*Empty entry.*');
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  downloadMd(`lorerim5-lore-journal-${slugName()}.md`, nl(lines));
  showToast('Lore & Journal exported.');
}

// ── 2. Build Reference ────────────────────────────────────────────────
function exportNotebookBuild() {
  const b  = window.appState.build  || {};
  const m  = window.appState.mechanics;
  const sp = b.statPlan || {};
  const gp = b.gearProgression || {};
  const perks = b.perkPriorities || [];
  const milestones = b.milestones || [];
  const s  = window.appState.stance;
  const kbs = window.appState.keybinds || [];

  const hp  = m.baseHealth  || 100;
  const mag = m.baseMagicka || 100;
  const sta = m.baseStamina || 100;

  const lines = [
    `# LoreRim 5 — Build Reference: ${window.appState.character.name || 'Unknown Hero'}`,
    `*OOC mechanical notes · Generated ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}*`,
    '',
    '> This document contains out-of-character build planning notes for use as a reference during gameplay.',
    '',
    '---',
    '',
    '## Build Identity',
    '',
    b.name      ? `**Build Name:** ${b.name}` : '',
    b.buildStyle ? `**Style:** ${b.buildStyle}` : '',
    b.difficulty ? `**Difficulty:** ${b.difficulty}` : '',
    b.sourceUrl  ? `**Source / Discord:** ${b.sourceUrl}` : '',
    '',
    b.summary ? `### Overview\n\n${b.summary}` : '',
    '',
    '---',
    '',
    '## Character Creation Choices (Permanent)',
    '',
    `**Birthsign:** ${m.birthsign || '—'}`,
    `**Traits:** ${m.traits.filter(Boolean).join(' | ') || '—'}`,
    `**Major Skills:** ${m.majorSkills.filter(Boolean).join(' | ') || '—'}`,
    `**Minor Skills:** ${m.minorSkills.filter(Boolean).join(' | ') || '—'}`,
    '',
    '---',
    '',
    '## Stat Allocation Plan',
    '',
    `| Attribute | Per Level-Up |`,
    `|-----------|-------------|`,
    `| ❤️ Health  | ${sp.hpPerLevel  || 0} |`,
    `| 💙 Magicka | ${sp.magPerLevel || 0} |`,
    `| 💚 Stamina | ${sp.staPerLevel || 0} |`,
    '',
    sp.notes ? `**Notes:** ${sp.notes}` : '',
    '',
  ];

  if (milestones.length) {
    lines.push('### Level Milestones');
    lines.push('');
    lines.push('| Level | HP Target | Magicka Target | Stamina Target |');
    lines.push('|-------|-----------|----------------|----------------|');
    milestones.forEach(ms => {
      lines.push(`| ${ms.level || '—'} | ${ms.hp || '—'} | ${ms.mag || '—'} | ${ms.sta || '—'} |`);
    });
    lines.push('');
  }

  lines.push('---', '', '## Requiem Derived Attributes (Current Base Stats)', '');
  lines.push(`| Attribute | Value | Formula |`);
  lines.push(`|-----------|-------|---------|`);
  lines.push(`| Base Health | ${hp} | — |`);
  lines.push(`| Base Magicka | ${mag} | — |`);
  lines.push(`| Base Stamina | ${sta} | — |`);
  lines.push(`| Magic Resistance | ${Math.min(80, Math.floor(mag/10))}% | Mag÷10, cap 80% |`);
  lines.push(`| Carry Weight | ${300 + sta * 5} | 300 + Sta×5 |`);
  lines.push(`| Speed Modifier | ${((sta-100)*0.05).toFixed(2)} | (Sta−100)×0.05 |`);
  lines.push(`| Melee Dmg Mult | ×${(1+(sta-100)*0.002).toFixed(3)} | Stamina scaling |`);
  lines.push(`| Spell Cost Mult | ×${Math.max(0.2,(1-(mag-100)*0.004)).toFixed(3)} | Magicka scaling |`);
  lines.push('');

  if (perks.length) {
    lines.push('---', '', '## Perk Priorities', '');
    const grouped = {};
    perks.forEach(p => { (grouped[p.priority] = grouped[p.priority]||[]).push(p); });
    for (const [pri, list] of Object.entries(grouped)) {
      lines.push(`### ${pri}`);
      list.forEach(p => {
        lines.push(`- **${p.skill}**${p.notes ? ': '+p.notes : ''}`);
      });
      lines.push('');
    }
  }

  const stageLabels = { early: '⚪ Early Game', mid: '🟡 Mid Game', late: '🔴 Late Game' };
  if (Object.values(gp).some(g => Object.values(g||{}).some(Boolean))) {
    lines.push('---', '', '## Gear Progression', '');
    for (const [stage, label] of Object.entries(stageLabels)) {
      const g = gp[stage] || {};
      if (Object.values(g).some(Boolean)) {
        lines.push(`### ${label}`);
        lines.push('');
        const slotMap = { helmet:'Helmet', chest:'Chest', gauntlets:'Gauntlets', boots:'Boots', lefthand:'Left Hand', righthand:'Right Hand', jewelry:'Jewelry', shield:'Shield', notes:'Notes' };
        for (const [k,label] of Object.entries(slotMap)) {
          if (g[k]) lines.push(`- **${label}:** ${g[k]}`);
        }
        lines.push('');
      }
    }
  }

  if (b.mechanics || b.combos) {
    lines.push('---', '', '## Key Mechanics & Combos', '');
    if (b.mechanics) { lines.push('### Essential Mechanics', '', b.mechanics, ''); }
    if (b.combos)    { lines.push('### Combo Strings & Openers', '', b.combos, ''); }
  }

  if (b.oocNotes) {
    lines.push('---', '', '## OOC Notes & Gotchas', '', b.oocNotes, '');
  }

  // Active combat profile
  lines.push('---', '', '## Active Combat Profile', '');
  lines.push(`**Weapon:** ${s.weapon || '—'}  |  **Stance:** ${s.stanceLevel || 'Mid'}`);
  if (s.keybindProfile) lines.push(`**Keybind Profile:** ${s.keybindProfile}`);
  if (s.notes) lines.push('', s.notes);
  lines.push('');

  if (kbs.length) {
    lines.push('---', '', '## Keybind Reference', '');
    const byCat = {};
    kbs.forEach(k => (byCat[k.category]=byCat[k.category]||[]).push(k));
    for (const [cat, list] of Object.entries(byCat)) {
      lines.push(`### ${cat}`);
      lines.push('');
      lines.push('| Action | Key | Modifier | Notes |');
      lines.push('|--------|-----|----------|-------|');
      list.forEach(k => lines.push(`| ${k.action} | \`${k.key||'—'}\` | ${k.modifier||'—'} | ${k.notes||''} |`));
      lines.push('');
    }
  }

  downloadMd(`lorerim5-build-reference-${slugName()}.md`, nl(lines));
  showToast('Build Reference exported.');
}

// ── 3. Mod Reference ──────────────────────────────────────────────────
function exportNotebookMods() {
  const mods = window.appState.mods;

  const lines = [
    `# LoreRim 5 — Mod Reference`,
    `*${mods.length} mods · Generated ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}*`,
    '',
    '> This document lists every mod in the LoreRim 5 modpack with descriptions and notes.',
    '',
    '---',
    '',
  ];

  if (!mods.length) {
    lines.push('*No mods imported yet.*');
  } else {
    // Group by category
    const grouped = {};
    mods.forEach(mod => {
      const cat = mod.category || 'Other';
      (grouped[cat] = grouped[cat] || []).push(mod);
    });

    const catOrder = ['Framework','Overhaul','Gameplay','Combat','Survival','Quest','Immersion','NPC','Gear','Visuals','Audio','UI','Patch','Other'];
    const allCats = [...new Set([...catOrder, ...Object.keys(grouped)])];

    for (const cat of allCats) {
      const list = grouped[cat];
      if (!list?.length) continue;
      const active = list.filter(m => m.enabled);
      const disabled = list.filter(m => !m.enabled);

      lines.push(`## ${cat} (${list.length})`);
      lines.push('');

      for (const mod of [...active, ...disabled]) {
        const status = mod.enabled ? '' : ' *(disabled)*';
        lines.push(`### ${mod.name}${status}`);
        if (mod.nexusUrl) lines.push(`*[Nexus Mods](${mod.nexusUrl})*`);
        if (mod.dbTags?.length) lines.push(`**Tags:** ${mod.dbTags.join(', ')}`);
        if (mod.notes) lines.push('', mod.notes);
        lines.push('');
      }

      lines.push('---', '');
    }
  }

  downloadMd(`lorerim5-mod-reference.md`, nl(lines));
  showToast('Mod Reference exported.');
}

// ── 4. World State ────────────────────────────────────────────────────
function exportNotebookWorld() {
  const q   = window.appState.quests;
  const eq  = window.appState.equipment;
  const mag = window.appState.magic;
  const arts = window.appState.artifacts;
  const followers = window.appState.followers || [];
  const ql  = window.appState.questLifecycle || [];
  const eco = window.appState.economy || {};
  const c   = window.appState.character;

  const lines = [
    `# LoreRim 5 — World State: ${c.name || 'Unknown Hero'}`,
    `*Snapshot ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}*`,
    '',
    '---',
    '',
    '## Currently Equipped Gear',
    '',
    '| Slot | Item | Enchantment |',
    '|------|------|-------------|',
  ];

  const slots = [
    ['Head', eq.head], ['Chest', eq.chest], ['Hands', eq.hands], ['Feet', eq.feet],
    ['Left Hand', eq.leftHand], ['Right Hand', eq.rightHand],
    ['Ring', eq.ring1], ['Ring 2', eq.ring2], ['Amulet', eq.amulet]
  ];
  slots.forEach(([slot, item]) => {
    if (item?.name) lines.push(`| ${slot} | ${item.name} | ${item.enchantment || '—'} |`);
  });

  lines.push('');

  // Spells
  const schools = { destruction:'Destruction', conjuration:'Conjuration', illusion:'Illusion', alteration:'Alteration', restoration:'Restoration' };
  const allSpells = Object.entries(schools).flatMap(([key, label]) =>
    (mag[key]||[]).map(sp => ({ ...sp, school: label }))
  );
  if (allSpells.length) {
    lines.push('---', '', '## Known Spells', '');
    const bySchool = {};
    allSpells.forEach(sp => (bySchool[sp.school]=bySchool[sp.school]||[]).push(sp));
    for (const [school, spells] of Object.entries(bySchool)) {
      lines.push(`### ${school}`);
      spells.forEach(sp => lines.push(`- **${sp.name}** *(${sp.tier||'Novice'})*${sp.notes ? ' — '+sp.notes : ''}`));
      lines.push('');
    }
  }

  // Quest log
  lines.push('---', '', '## Quest Log', '');
  const factionLabels = {
    mainQuest:'Main Quest', companions:'The Companions', college:'College of Winterhold',
    thievesGuild:"Thieves' Guild", dawnguard:'Dawnguard', bounty:'Bounty Quests', misc:'Miscellaneous'
  };
  for (const [key, label] of Object.entries(factionLabels)) {
    const quests = q[key] || [];
    if (!quests.length) continue;
    const done = quests.filter(qi => qi.completed);
    lines.push(`### ${label} (${done.length}/${quests.length} complete)`);
    quests.forEach(qi => {
      const check = qi.completed ? '✅' : '⬜';
      const date  = qi.completedDate ? ` *(${formatDate(qi.completedDate)})*` : '';
      lines.push(`- ${check} ${qi.name}${date}`);
    });
    lines.push('');
  }

  // Quest Safety alerts
  const removedOrBlocked = ql.filter(r => r.status === 'removed' || r.status === 'blocked' || r.alert);
  if (removedOrBlocked.length) {
    lines.push('---', '', '## Version 5 Alerts & Lifecycle Notes', '');
    removedOrBlocked.forEach(r => {
      lines.push(`### ${r.name}`);
      lines.push(`**Status:** ${r.status}`);
      if (r.alert) lines.push(`**⚠ Alert:** ${r.alert}`);
      if (r.notes) lines.push(r.notes);
      lines.push('');
    });
  }

  // Followers
  if (followers.length) {
    lines.push('---', '', '## Followers & Companions', '');
    followers.forEach(f => {
      lines.push(`### ${f.name || 'Unnamed'}`);
      if (f.role) lines.push(`**Role:** ${f.role}`);
      if (f.equipment) lines.push(`**Equipment:** ${f.equipment}`);
      if (f.bondLevel) lines.push(`**Bond Level:** ${'★'.repeat(f.bondLevel)}${'☆'.repeat(5-f.bondLevel)}`);
      if (f.narrativeProgress) lines.push('', f.narrativeProgress);
      lines.push('');
    });
  }

  // Artifacts
  const collected = arts.filter(a => a.collected);
  if (collected.length) {
    lines.push('---', '', `## Collected Artifacts (${collected.length}/${arts.length})`, '');
    ['Daedric','Unique','Dragon Priest'].forEach(type => {
      const ofType = collected.filter(a => a.type === type);
      if (!ofType.length) return;
      lines.push(`### ${type} Artifacts`);
      ofType.forEach(a => {
        const loc = a.storageLocation ? ` — stored at *${a.storageLocation}*` : '';
        lines.push(`- ${a.icon} **${a.name}**${loc}`);
      });
      lines.push('');
    });
  }

  // Economy
  if (eco.speechSkill || (eco.activeBuffs||[]).length) {
    lines.push('---', '', '## Economy Status', '');
    lines.push(`**Speech Skill:** ${eco.speechSkill || 0}`);
    if ((eco.activeBuffs||[]).length) lines.push(`**Active Buffs:** ${eco.activeBuffs.join(', ')}`);
    lines.push('');
  }

  downloadMd(`lorerim5-world-state-${slugName()}.md`, nl(lines));
  showToast('World State exported.');
}

// ── Export All (sequential downloads) ────────────────────────────────
async function exportAllNotebook() {
  exportNotebookLore();
  await new Promise(r => setTimeout(r, 400));
  exportNotebookBuild();
  await new Promise(r => setTimeout(r, 400));
  exportNotebookMods();
  await new Promise(r => setTimeout(r, 400));
  exportNotebookWorld();
  showToast('All 4 NotebookLM files downloaded.');
}
