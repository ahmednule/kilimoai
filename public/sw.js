const CACHE_NAME = 'kilimo-ai-v2';
const OFFLINE_URL = '/offline.html';

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/;

// Install event - precache core routes and manifest-defined assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Precache core navigation routes
      const coreRoutes = ['/', '/chat', '/dashboard'];
      const requests = coreRoutes.map((url) => new Request(url));

      // Precache offline page
      const offlineRequest = new Request(OFFLINE_URL);

      // Try to load precache manifest generated at build time
      const allRequests = [...requests, offlineRequest];
      try {
        const manifestResponse = await fetch('/precache-manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          for (const url of manifest) {
            allRequests.push(new Request(url));
          }
        }
      } catch (_) {
        // Manifest not available (dev mode or first build)
      }

      // Add all to cache
      await Promise.allSettled(
        allRequests.map((req) =>
          cache.add(req).catch((err) => {
            console.warn('[SW] Failed to precache:', req.url, err.message);
          })
        )
      );

      console.log('[SW] Precache complete:', allRequests.length, 'assets');
    })()
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Network-only: API requests always need fresh data
  if (url.pathname.startsWith('/api/')) return;

  if (STATIC_EXTENSIONS.test(url.pathname)) {
    // Static assets: cache-first (they have hashed filenames in production)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
        );
      })
    );
  } else if (event.request.mode === 'navigate') {
    // Navigation: network-first, fall back to cache, then offline page
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // Other requests: network-first
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});