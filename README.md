# LoreRim V — Character Journal

A roleplaying journal, character tracker, and mod documentation app for the **LoreRim 5** Skyrim modpack.

## Features

- **Character Dashboard** — profile, portrait, backstory, stat pills, build summary, PDF character sheet export
- **The Chronicle** — dated journal entries with tag filtering, inline editor, PDF journal export
- **Character State** — quest tracker by faction, spell tracker by school, equipment slot grid
- **Mod Wiki** — MO2 bulk import, searchable/filterable table, per-mod notes
- **Requiem Mechanics** — derived attributes calculator, Wintersun faith tracker, build parameters
- **LoreRim Utilities** — stance/combat profile, economy calculator, quest safety tracker, artifact matrix, keybind reference, follower log
- **Backup & Restore** — JSON backup download/import, full data reset

## Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push this folder to the `main` branch (root)
3. Go to **Settings → Pages → Deploy from branch**
4. Select `main` / `(root)` → Save
5. Your app will be live at `https://<username>.github.io/<repo-name>/`

## Local Use

Open `index.html` directly in any modern browser. No server required.

All data is stored in your browser's `localStorage` — it persists across page refreshes on the same browser/device.

## Backup Your Data

Use **Data & Backup → Download Backup JSON** regularly. This saves everything to a `.json` file you can re-import at any time, including after clearing browser data or switching devices.
