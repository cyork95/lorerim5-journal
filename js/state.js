/* ── LoreRim V — State Management ────────────────────────────────── */

const STORAGE_KEY = 'lorerim5_state';

const DEFAULT_STATE = {
  character: {
    name: '',
    race: '',
    level: 1,
    birthsign: '',
    archetype: '',
    backstory: '',
    portraitDataUrl: ''
  },
  siteConfig: {
    notebookLmUrl: '',   // Public NotebookLM share link — shown in sidebar when set
  },

  journal: [],
  // each entry: { id, date, title, content, tags: [] }

  quests: {
    mainQuest: [
      { id: 'mq1', name: 'Unbound', completed: false, completedDate: '', notes: '' },
      { id: 'mq2', name: 'Before the Storm', completed: false, completedDate: '', notes: '' },
      { id: 'mq3', name: 'Bleak Falls Barrow', completed: false, completedDate: '', notes: '' },
      { id: 'mq4', name: 'Dragon Rising', completed: false, completedDate: '', notes: '' },
      { id: 'mq5', name: 'The Way of the Voice', completed: false, completedDate: '', notes: '' },
      { id: 'mq6', name: 'The Horn of Jurgen Windcaller', completed: false, completedDate: '', notes: '' },
      { id: 'mq7', name: 'A Blade in the Dark', completed: false, completedDate: '', notes: '' },
      { id: 'mq8', name: 'Diplomatic Immunity', completed: false, completedDate: '', notes: '' },
      { id: 'mq9', name: 'A Cornered Rat', completed: false, completedDate: '', notes: '' },
      { id: 'mq10', name: 'Alduin\'s Wall', completed: false, completedDate: '', notes: '' },
      { id: 'mq11', name: 'The Throat of the World', completed: false, completedDate: '', notes: '' },
      { id: 'mq12', name: 'Elder Knowledge', completed: false, completedDate: '', notes: '' },
      { id: 'mq13', name: 'Alduin\'s Bane', completed: false, completedDate: '', notes: '' },
      { id: 'mq14', name: 'Season Unending', completed: false, completedDate: '', notes: '' },
      { id: 'mq15', name: 'The World-Eater\'s Eyrie', completed: false, completedDate: '', notes: '' },
      { id: 'mq16', name: 'Sovngarde', completed: false, completedDate: '', notes: '' }
    ],
    companions: [
      { id: 'comp1', name: 'Take Up Arms', completed: false, completedDate: '', notes: '' },
      { id: 'comp2', name: 'Proving Honor', completed: false, completedDate: '', notes: '' },
      { id: 'comp3', name: 'The Silver Hand', completed: false, completedDate: '', notes: '' },
      { id: 'comp4', name: 'Blood\'s Honor', completed: false, completedDate: '', notes: '' },
      { id: 'comp5', name: 'Purity of Revenge', completed: false, completedDate: '', notes: '' },
      { id: 'comp6', name: 'Glory of the Dead', completed: false, completedDate: '', notes: '' }
    ],
    college: [
      { id: 'col1', name: 'First Lessons', completed: false, completedDate: '', notes: '' },
      { id: 'col2', name: 'Under Saarthal', completed: false, completedDate: '', notes: '' },
      { id: 'col3', name: 'Hitting the Books', completed: false, completedDate: '', notes: '' },
      { id: 'col4', name: 'Good Intentions', completed: false, completedDate: '', notes: '' },
      { id: 'col5', name: 'Revealing the Unseen', completed: false, completedDate: '', notes: '' },
      { id: 'col6', name: 'Containment', completed: false, completedDate: '', notes: '' },
      { id: 'col7', name: 'The Eye of Magnus', completed: false, completedDate: '', notes: '' }
    ],
    thievesGuild: [
      { id: 'tg1', name: 'A Chance Arrangement', completed: false, completedDate: '', notes: '' },
      { id: 'tg2', name: 'Taking Care of Business', completed: false, completedDate: '', notes: '' },
      { id: 'tg3', name: 'Loud and Clear', completed: false, completedDate: '', notes: '' },
      { id: 'tg4', name: 'Dampened Spirits', completed: false, completedDate: '', notes: '' },
      { id: 'tg5', name: 'Scoundrel\'s Folly', completed: false, completedDate: '', notes: '' },
      { id: 'tg6', name: 'Speaking With Silence', completed: false, completedDate: '', notes: '' },
      { id: 'tg7', name: 'Hard Answers', completed: false, completedDate: '', notes: '' },
      { id: 'tg8', name: 'The Pursuit', completed: false, completedDate: '', notes: '' },
      { id: 'tg9', name: 'Trinity Restored', completed: false, completedDate: '', notes: '' },
      { id: 'tg10', name: 'Blindsighted', completed: false, completedDate: '', notes: '' },
      { id: 'tg11', name: 'Darkness Returns', completed: false, completedDate: '', notes: '' }
    ],
    dawnguard: [
      { id: 'dg1', name: 'Dawnguard', completed: false, completedDate: '', notes: '' },
      { id: 'dg2', name: 'Awakening', completed: false, completedDate: '', notes: '' },
      { id: 'dg3', name: 'Prophet', completed: false, completedDate: '', notes: '' },
      { id: 'dg4', name: 'Chasing Echoes', completed: false, completedDate: '', notes: '' },
      { id: 'dg5', name: 'Beyond Death', completed: false, completedDate: '', notes: '' },
      { id: 'dg6', name: 'Kindred Judgment / Touching the Sky', completed: false, completedDate: '', notes: '' }
    ],
    bounty: [],
    misc: []
  },

  magic: {
    destruction: [],
    conjuration: [],
    illusion: [],
    alteration: [],
    restoration: []
  },
  // each spell: { id, name, tier, notes }

  equipment: {
    head:      { name: '', enchantment: '', notes: '' },
    chest:     { name: '', enchantment: '', notes: '' },
    hands:     { name: '', enchantment: '', notes: '' },
    feet:      { name: '', enchantment: '', notes: '' },
    leftHand:  { name: '', enchantment: '', notes: '' },
    rightHand: { name: '', enchantment: '', notes: '' },
    ring1:     { name: '', enchantment: '', notes: '' },
    ring2:     { name: '', enchantment: '', notes: '' },
    amulet:    { name: '', enchantment: '', notes: '' }
  },

  mods: [],
  // each mod: { id, name, category, enabled, notes }

  mechanics: {
    baseHealth: 100,
    baseMagicka: 100,
    baseStamina: 100,
    deity: '',
    deityFavor: 0,
    deityBlessings: '',
    deityTaboos: '',
    birthsign: '',
    traits: ['', '', ''],
    majorSkills: ['', '', ''],
    minorSkills: ['', '', '', '', '']
  },

  stance: { weapon: '', stanceLevel: 'Mid', notes: '', keybindProfile: '' },

  economy: { speechSkill: 0, activeBuffs: [] },

  questLifecycle: [
    { id: 'ql1', name: 'Companions (recommended start)', levelRec: 10, status: 'pending', alert: '', notes: 'Werewolf transformation is gated behind quest progress.' },
    { id: 'ql2', name: 'College of Winterhold (recommended start)', levelRec: 5, status: 'pending', alert: '', notes: 'Magic-oriented characters should prioritize. Grants access to powerful spell tomes.' },
    { id: 'ql3', name: 'Thieves Guild (recommended start)', levelRec: 8, status: 'pending', alert: '', notes: 'Speech/stealth characters. Requires some Pickpocket skill.' },
    { id: 'ql4', name: 'Dawnguard (recommended start)', levelRec: 20, status: 'pending', alert: '⚠ Do not start before Lv20 in Requiem/LoreRim.', notes: 'Vampires/Volkihar DLC. Very difficult early.' },
    { id: 'ql5', name: 'Dragonborn DLC (recommended start)', levelRec: 30, status: 'pending', alert: '⚠ Solstheim is extremely hostile early game.', notes: 'Start after completing Horn of Jurgen Windcaller.' },
    { id: 'ql6', name: 'Clockwork (REMOVED in LoreRim 5)', levelRec: 0, status: 'removed', alert: '🚫 Removed — do not seek or install.', notes: 'Quest mod removed in LoreRim version 5. Saves from v4 may have orphaned scripts.' },
    { id: 'ql7', name: 'Project AHO (REMOVED in LoreRim 5)', levelRec: 0, status: 'removed', alert: '🚫 Removed — do not seek or install.', notes: 'Quest mod removed in LoreRim version 5 due to structural conflicts.' },
    { id: 'ql8', name: 'Main Quest (Dragon Rising trigger)', levelRec: 5, status: 'pending', alert: '', notes: 'Visit Whiterun and speak with Jarl Balgruuf to trigger Dragon Rising when ready.' },
    { id: 'ql9', name: 'Falskaar (recommended start)', levelRec: 25, status: 'pending', alert: '', notes: 'Large DLC-sized expansion. Bring strong gear.' },
    { id: 'ql10', name: 'Wyrmstooth (recommended start)', levelRec: 25, status: 'pending', alert: '', notes: 'Requires dragons to be active (post Dragon Rising).' }
  ],

  artifacts: [
    { id: 'art1',  name: 'Azura\'s Star',         type: 'Daedric',  icon: '⭐', collected: false, storageLocation: '', notes: '' },
    { id: 'art2',  name: 'Black Star',             type: 'Daedric',  icon: '🌑', collected: false, storageLocation: '', notes: '' },
    { id: 'art3',  name: 'Dawnbreaker',            type: 'Daedric',  icon: '⚔️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art4',  name: 'Ebony Blade',            type: 'Daedric',  icon: '🗡️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art5',  name: 'Ebony Mail',             type: 'Daedric',  icon: '🛡️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art6',  name: 'Mace of Molag Bal',      type: 'Daedric',  icon: '🔨', collected: false, storageLocation: '', notes: '' },
    { id: 'art7',  name: 'Masque of Clavicus Vile',type: 'Daedric',  icon: '🎭', collected: false, storageLocation: '', notes: '' },
    { id: 'art8',  name: 'Mehrunes\' Razor',       type: 'Daedric',  icon: '🔪', collected: false, storageLocation: '', notes: '' },
    { id: 'art9',  name: 'Morokei (Staff)',        type: 'Daedric',  icon: '🪄', collected: false, storageLocation: '', notes: '' },
    { id: 'art10', name: 'Namira\'s Ring',         type: 'Daedric',  icon: '💍', collected: false, storageLocation: '', notes: '' },
    { id: 'art11', name: 'Oghma Infinium',         type: 'Daedric',  icon: '📕', collected: false, storageLocation: '', notes: '' },
    { id: 'art12', name: 'Ring of Hircine',        type: 'Daedric',  icon: '🐺', collected: false, storageLocation: '', notes: '' },
    { id: 'art13', name: 'Sanguine Rose',          type: 'Daedric',  icon: '🌹', collected: false, storageLocation: '', notes: '' },
    { id: 'art14', name: 'Savior\'s Hide',         type: 'Daedric',  icon: '🧥', collected: false, storageLocation: '', notes: '' },
    { id: 'art15', name: 'Skull of Corruption',   type: 'Daedric',  icon: '💀', collected: false, storageLocation: '', notes: '' },
    { id: 'art16', name: 'Spellbreaker',           type: 'Daedric',  icon: '🛡️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art17', name: 'Volendrung',             type: 'Daedric',  icon: '⚒️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art18', name: 'Wabbajack',              type: 'Daedric',  icon: '🎪', collected: false, storageLocation: '', notes: '' },
    { id: 'art19', name: 'Auriel\'s Bow',          type: 'Unique',   icon: '🏹', collected: false, storageLocation: '', notes: '' },
    { id: 'art20', name: 'Auriel\'s Shield',       type: 'Unique',   icon: '🛡️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art21', name: 'Nightingale Bow',        type: 'Unique',   icon: '🏹', collected: false, storageLocation: '', notes: '' },
    { id: 'art22', name: 'Nightingale Blade',      type: 'Unique',   icon: '🗡️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art23', name: 'Nightingale Armor',      type: 'Unique',   icon: '🧥', collected: false, storageLocation: '', notes: '' },
    { id: 'art24', name: 'Konahrik',               type: 'Dragon Priest', icon: '👺', collected: false, storageLocation: '', notes: '' },
    { id: 'art25', name: 'Volsung',                type: 'Dragon Priest', icon: '👺', collected: false, storageLocation: '', notes: '' },
    { id: 'art26', name: 'Zahkriisos',             type: 'Dragon Priest', icon: '👺', collected: false, storageLocation: '', notes: '' },
    { id: 'art27', name: 'Bloodskal Blade',        type: 'Unique',   icon: '⚔️',  collected: false, storageLocation: '', notes: '' },
    { id: 'art28', name: 'Windshear',              type: 'Unique',   icon: '🗡️',  collected: false, storageLocation: '', notes: '' }
  ],

  keybinds: [
    { id: 'kb1',  action: 'Quick Save',            key: 'F5',        modifier: '',      category: 'UI',       notes: '' },
    { id: 'kb2',  action: 'Quick Load',            key: 'F9',        modifier: '',      category: 'UI',       notes: '' },
    { id: 'kb3',  action: 'Dodge Roll',            key: 'Alt',       modifier: '',      category: 'Combat',   notes: 'TK Dodge / TUDM' },
    { id: 'kb4',  action: 'Sprint',                key: 'Shift',     modifier: '',      category: 'Combat',   notes: '' },
    { id: 'kb5',  action: 'Eat / Drink',           key: 'N',         modifier: '',      category: 'Survival', notes: 'Survival Mode / Realistic Needs' },
    { id: 'kb6',  action: 'Sleep / Rest',          key: 'B',         modifier: '',      category: 'Survival', notes: '' },
    { id: 'kb7',  action: 'Rapid Cast Profile 1',  key: '1',         modifier: 'Ctrl',  category: 'Magic',    notes: '' },
    { id: 'kb8',  action: 'Rapid Cast Profile 2',  key: '2',         modifier: 'Ctrl',  category: 'Magic',    notes: '' },
    { id: 'kb9',  action: 'Shout / Power',         key: 'Z',         modifier: '',      category: 'Combat',   notes: '' },
    { id: 'kb10', action: 'Favorites Menu',        key: 'Q',         modifier: '',      category: 'UI',       notes: '' }
  ],

  followers: []
  // each: { id, name, role, equipment, bondLevel: 1-5, narrativeProgress, notes }
};

// ── Deep merge helper ─────────────────────────────────────────────────
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (!(key in target)) {
      result[key] = source[key];
    } else {
      result[key] = target[key];
    }
  }
  return result;
}

// ── Load / Save ───────────────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const saved = JSON.parse(raw);
    // Merge saved into defaults so new default fields appear on updates
    return deepMerge(saved, DEFAULT_STATE);
  } catch(e) {
    console.warn('LoreRim: failed to load state, using defaults', e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.appState));
  } catch(e) {
    console.error('LoreRim: failed to save state', e);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Init global state
window.appState = loadState();
