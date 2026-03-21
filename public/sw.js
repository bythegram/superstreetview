/**
 * Service Worker for Super Street View
 *
 * Strategy:
 *  - On install: pre-cache the app shell (index, manifest, icons, game data).
 *  - On activate: remove stale caches from previous versions.
 *  - On fetch:
 *      • Google APIs / CDN resources → network-only (tiles, Street View, etc.)
 *      • Everything else (same-origin) → cache-first, fall back to network and
 *        add the response to the cache for next time.
 *
 * This lets the UI load offline once the user has played at least once, while
 * always fetching live map data from the network.
 */

const CACHE_NAME = 'ssv-v1';

/** Assets to pre-fetch and cache when the service worker installs. */
const PRECACHE_URLS = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/diamond.gif',
  './icons/rocket.gif',
  './icons/coin.gif',
  './collections_en.json',
];

// ---------------------------------------------------------------------------
// Install — pre-cache the app shell
// ---------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate — purge caches from old versions
// ---------------------------------------------------------------------------

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — serve from cache with network fallback for same-origin assets;
//          pass external (Google / CDN) requests straight through.
// ---------------------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Let the browser handle requests to Google APIs and CDN resources
  // directly — these cannot be cached offline in any meaningful way.
  if (
    url.hostname.endsWith('.googleapis.com') ||
    url.hostname.endsWith('.gstatic.com') ||
    url.hostname.endsWith('.google.com') ||
    url.hostname === 'pro.fontawesome.com' ||
    url.hostname.endsWith('.fontawesome.com')
  ) {
    return;
  }

  // Cache-first strategy for same-origin assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Only cache successful same-origin responses.
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
