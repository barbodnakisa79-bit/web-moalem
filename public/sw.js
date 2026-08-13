const CACHE_NAME = 'amoozgar-v2';
const SCOPE_PATH = self.location.pathname.replace(/\/sw\.js$/, '/');

const STATIC_ASSETS = [
  SCOPE_PATH,
  SCOPE_PATH + 'index.html',
  SCOPE_PATH + 'manifest.json'
];

// 1. Install Event - Cache App Shell & Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets for scope:', SCOPE_PATH);
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Stale-while-revalidate & Cache-First strategy with Offline Fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle HTML navigation requests (SPA support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return cached index.html when offline
          return caches.match(SCOPE_PATH + 'index.html') || caches.match(SCOPE_PATH) || caches.match('./index.html');
        })
    );
    return;
  }

  // Handle CSS, JS, Fonts, Images with Stale-While-Revalidate / Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log('[SW] Network fetch failed, returning cached asset if available', err);
        });

      return cachedResponse || fetchPromise;
    })
  );
});
