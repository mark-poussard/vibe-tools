const CACHE_NAME = 'offline-v4';
const ASSETS_TO_CACHE = [
  '/vibe-tools/japanese-sentence/index.html',
  '/vibe-tools/japanese-sentence/app.css',
  '/vibe-tools/japanese-sentence/main.js',
  '/vibe-tools/japanese-sentence/state.js',
  '/vibe-tools/japanese-sentence/ui.js',
  '/vibe-tools/japanese-sentence/utils.js',
  '/vibe-tools/japanese-sentence/practice.js',
  '/vibe-tools/japanese-sentence/review.js',
  '/vibe-tools/japanese-sentence/sync.js',
  '/vibe-tools/japanese-sentence/sentences-data.js',
  '/vibe-tools/japanese-sentence/manifest.json',
  '/vibe-tools/japanese-sentence/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
