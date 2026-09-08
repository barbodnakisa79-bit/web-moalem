const CACHE_NAME = 'amoozgar-v3';
const SCOPE_PATH = self.location.pathname.replace(/\/sw\.js$/, '/');

const STATIC_ASSETS = [
  SCOPE_PATH,
  SCOPE_PATH + 'index.html',
  SCOPE_PATH + 'manifest.json',
  SCOPE_PATH + 'fonts/Vazirmatn-Variable.woff2',
  SCOPE_PATH + 'fonts/Vazirmatn-Regular.woff2',
  SCOPE_PATH + 'fonts/Vazirmatn-Bold.woff2'
];

// 1. Install Event - Cache App Shell & Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets for scope:', SCOPE_PATH);
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Initial caching warning (some assets optional):', err);
      });
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

// 3. Fetch Event - Cache-First for instant offline loading + Background Revalidation
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle HTML navigation requests (SPA support)
  // Priority: Cache-First! Return instant offline shell, revalidate in background.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(SCOPE_PATH + 'index.html').then((cachedIndex) => {
        // Trigger background fetch to update cache silently without blocking the UI
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
                cache.put(SCOPE_PATH + 'index.html', responseToCache.clone());
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Silently ignore network failure when offline or slow
          });

        // Instant launch from phone storage if available!
        if (cachedIndex) {
          return cachedIndex;
        }

        // If not cached yet (first launch), wait for network or fallback
        return networkFetch.then((res) => res || caches.match(SCOPE_PATH) || caches.match('./index.html'));
      })
    );
    return;
  }

  // Handle CSS, JS, Fonts, Images: Cache-First with Background Update
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
        .catch(() => {
          // Network failed (offline/slow/blocked); cachedResponse will serve the request
        });

      // If cached, return immediately for zero-lag instant loading!
      return cachedResponse || fetchPromise;
    })
  );
});

