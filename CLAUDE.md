# LoreRim 5 Journal — CLAUDE.md (Continuity File)

## Project Overview
Single-page static web app for tracking a LoreRim 5 (Skyrim modpack) playthrough.
Deploys to GitHub Pages. All data in localStorage. No build step.

## File Structure
```
Lorerim5Journal/
├── index.html              ← Shell: layout, CDN links, sidebar (char switcher, timer), script tags
├── manifest.json           ← PWA manifest (standalone display, gold theme)
├── sw.js                   ← Service worker — cache-first shell, offline support
├── icon.svg                ← PWA icon (sword on dark background)
├── css/styles.css          ← All custom styles, fonts, components
├── data/
│   └── mod-descriptions.json ← 284-entry mod DB
├── js/
│   ├── state.js            ← State schema, multi-char storage, loadState/saveState, helpers
│   ├── app.js              ← navigate(), session timer, char switcher, all window.* exports
│   ├── pdf.js              ← exportCharacterPDF(), exportJournalPDF()
│   ├── export-notebook.js  ← 5 NotebookLM .md exports
│   └── sections/
│       ├── dashboard.js    ← Dashboard render, portrait, saveDashboard(), level-up nudge
│       ├── journal.js      ← Journal list/editor, text search, image attachments, showToast()
│       ├── character.js    ← Quests (accordion), Magic (accordion), Equipment grid
│       ├── build.js        ← OOC Build Workshop: identity, stat plan, perks, gear, combos
│       ├── mods.js         ← Bulk import, MO2 parser, searchable table, notes
│       ├── mechanics.js    ← Derived stats calc, Wintersun deity, build params
│       ├── utilities.js    ← Stance, Economy, Quest Safety, Artifacts, Keybinds, Followers, Death Log
│       └── backup.js       ← Download/import JSON backup, reset all data
```

## Implementation Status
| File | Status | Notes |
|------|--------|-------|
| index.html | ✅ Complete | Shell, sidebar, script load order |
| css/styles.css | ✅ Complete | Fantasy dark theme, all component styles |
| js/state.js | ✅ Complete | Full default state, pre-seeded quests/artifacts/keybinds |
| js/sections/dashboard.js | ✅ Complete | Character fields, portrait upload, stat pills |
| js/sections/journal.js | ✅ Complete | Entry list, editor, tag filter, showToast |
| js/sections/character.js | ✅ Complete | Quest accordions, magic schools, equipment slots |
| js/sections/build.js | ✅ Complete | OOC build workshop — identity, stat plan, milestones, perk priorities, gear stages, combos |
| js/sections/mods.js | ✅ Complete | MO2 bulk import parser, search, category filter, notes |
| js/sections/mechanics.js | ✅ Complete | Requiem derived stats, Wintersun, build params |
| js/sections/utilities.js | ✅ Complete | All 7 utility panels (+ Death Log) |
| js/sections/backup.js | ✅ Complete | JSON backup download/import, reset |
| js/pdf.js | ✅ Complete | Parchment character sheet PDF, journal PDF |
| js/app.js | ✅ Complete | Navigation, all window.* exports |

## Key Architecture Notes
- **State**: `window.appState` loaded from localStorage on page load. Call `saveState()` after mutations.
- **Multi-character**: Each character stored at `lorerim5_char_<id>`. Index at `lorerim5_characters`. Active ID at `lorerim5_active_char`. First load auto-migrates legacy `lorerim5_state`. Functions: `createCharacter(name)`, `switchCharacter(id)`, `deleteCharacter(id)`, `getCharsIndex()`, `getActiveCharId()`.
- **Session timer**: In-memory `_sessionStart` timestamp + `setInterval`. `startSession()` / `endSession()` in `app.js`. Completed sessions written to `state.sessions[]` as `{id, date, durationMinutes}`.
- **Death log**: `state.deaths[]` — each entry `{id, date, enemy, location, level, cause, notes}`. Panel G in Utilities.
- **Journal images**: Each entry has `image: null | dataURL`. `handleEntryImageUpload()` / `removeEntryImage()` in `journal.js`.
- **Journal search**: `journalSearch` module var + `setJournalSearch()` — filters title and content.
- **Level-up nudge**: In `saveDashboard()`, compares prev vs new level. If increased, fires `showToast()` with action button that calls `_levelUpJournalEntry()` → navigates to journal with pre-filled entry.
- **PWA**: `manifest.json` + `sw.js` cache-first service worker. Registered in `app.js` DOMContentLoaded.
- **Navigation**: `navigate('section')` swaps `#main-content` innerHTML. All sections self-render.
- **Global functions**: All event handlers declared globally in their section files, then re-exported via `window.* = ...` in `app.js`.
- **esc() helper**: Defined in `dashboard.js`, exposed as `window.esc`. Used for XSS-safe HTML interpolation.
- **generateId()**: Defined in `state.js`. Used everywhere for unique IDs.
- **formatDuration(minutes)**: Defined in `state.js`. Returns e.g. `"2h 15m"`.
- **PDF**: Uses jsPDF text-only API (no html2canvas). Parchment bg (#f5efe0) on character sheet, clean white for journal.

## Known Extension Points
- Portrait stored as base64 dataURL — large portraits may bloat localStorage. Consider a warning at >500KB.
- Mod category auto-detection keywords are in `CAT_KEYWORDS` in `mods.js` — easy to extend.
- Requiem derived stats formulas are approximations — in `mechanics.js` `renderMechanics()`, adjust as needed.
- Pre-seeded quest lists, artifacts, keybinds are in `state.js` DEFAULT_STATE — add/remove as needed for LoreRim 5.

## GitHub Pages Deploy
1. Push entire folder to a GitHub repo (main branch, root)
2. Settings → Pages → Deploy from branch → main / (root)
3. App available at: `https://<username>.github.io/<repo-name>/`

## LoreRim-Specific Notes
- Clockwork and Project AHO are pre-marked as "removed" in Quest Safety tracker
- Dawnguard has a pre-seeded ⚠ alert recommending Lv20+
- Dragonborn DLC has a Lv30+ alert
- Wintersun deity list includes full pantheon (vanilla + expanded)
- MO2 import strips `+/-` prefixes and `[version]` / `(version)` tags
