const CACHE_NAME = 'kilimo-ai-v3';
const OFFLINE_URL = '/offline.html';

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|webp|avif)$/;

const CORE_ROUTES = [
  '/',
  '/chat',
  '/dashboard',
  '/profile',
  '/loans',
  '/chama',
  '/pest-check',
  '/buyer',
  '/lender',
  '/chatbot',
  '/auth/login',
  '/auth/signup',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const requests = CORE_ROUTES.map((url) => new Request(url));

      try {
        const manifestResponse = await fetch('/precache-manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          for (const url of manifest) {
            requests.push(new Request(url));
          }
        }
      } catch (_) {}

      await Promise.allSettled(
        requests.map((req) =>
          cache.add(req).catch(() => {})
        )
      );
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // API requests: network-only (always fresh)
  if (url.pathname.startsWith('/api/')) return;

  // Static assets with hashed filenames: cache-first
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchAndCache = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
        return cached || fetchAndCache;
      })
    );
    return;
  }

  // _next/static and _next/image: cache-first for performance
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchAndCache = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
        return cached || fetchAndCache;
      })
    );
    return;
  }

  // Navigation requests: network-first, fallback to cache, then offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Other requests: network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
