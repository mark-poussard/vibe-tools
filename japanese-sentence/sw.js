const CACHE_NAME = 'offline-v1';
// IMPORTANT: Use the full path relative to the domain root
const ASSETS_TO_CACHE = [
  '/vibe-tools/japanese-sentence/index.html',
  '/vibe-tools/japanese-sentence/manifest.json'
];

// 1. Install: Save the files to the cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Clean up old caches if version changes
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. Fetch: Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached file if found, otherwise hit the network
      return response || fetch(event.request);
    })
  );
});