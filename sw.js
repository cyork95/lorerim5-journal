/* ── LoreRim V — Service Worker (PWA offline cache) ─────────────── */

const CACHE = 'lorerim-journal-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/styles.css',
  './js/state.js',
  './js/app.js',
  './js/pdf.js',
  './js/export-notebook.js',
  './js/sections/dashboard.js',
  './js/sections/journal.js',
  './js/sections/character.js',
  './js/sections/build.js',
  './js/sections/mods.js',
  './js/sections/mechanics.js',
  './js/sections/utilities.js',
  './js/sections/backup.js',
  './data/mod-descriptions.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Clear old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Cache-first for shell assets, network-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache successful GET responses for shell paths
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
