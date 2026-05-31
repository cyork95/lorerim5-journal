# LoreRim 5 Journal — CLAUDE.md (Continuity File)

## Project Overview
Single-page static web app for tracking a LoreRim 5 (Skyrim modpack) playthrough.
Deploys to GitHub Pages. All data in localStorage. No build step.

## File Structure
```
Lorerim5Journal/
├── index.html              ← Shell: layout, CDN links, sidebar, script tags (~110 lines)
├── css/styles.css          ← All custom styles, fonts, components (~340 lines)
├── js/
│   ├── state.js            ← State schema, loadState(), saveState(), defaults (~200 lines)
│   ├── app.js              ← navigate(), init, all window.* global exports (~120 lines)
│   ├── pdf.js              ← exportCharacterPDF(), exportJournalPDF() (~230 lines)
│   └── sections/
│       ├── dashboard.js    ← Dashboard render, portrait upload, saveDashboard() (~130 lines)
│       ├── journal.js      ← Journal list/editor, tags, save/delete, showToast() (~130 lines)
│       ├── character.js    ← Quests (accordion), Magic (accordion), Equipment grid (~210 lines)
│       ├── build.js        ← OOC Build Workshop: identity, stat plan, perks, gear, combos (~290 lines)
│       ├── mods.js         ← Bulk import, MO2 parser, searchable table, notes (~180 lines)
│       ├── mechanics.js    ← Derived stats calc, Wintersun deity, build params (~190 lines)
│       ├── utilities.js    ← Stance, Economy, Quest Safety, Artifacts, Keybinds, Followers (~350 lines)
│       └── backup.js       ← Download/import JSON backup, reset all data (~80 lines)
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
| js/sections/utilities.js | ✅ Complete | All 6 utility panels |
| js/sections/backup.js | ✅ Complete | JSON backup download/import, reset |
| js/pdf.js | ✅ Complete | Parchment character sheet PDF, journal PDF |
| js/app.js | ✅ Complete | Navigation, all window.* exports |

## Key Architecture Notes
- **State**: `window.appState` loaded from localStorage on page load. Call `saveState()` after mutations.
- **Navigation**: `navigate('section')` swaps `#main-content` innerHTML. All sections self-render.
- **Global functions**: All event handlers declared globally in their section files, then re-exported via `window.* = ...` in `app.js`.
- **esc() helper**: Defined in `dashboard.js`, exposed as `window.esc`. Used for XSS-safe HTML interpolation.
- **generateId()**: Defined in `state.js`. Used everywhere for unique IDs.
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
