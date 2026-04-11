// TerryBot Service Worker — Offline support
const CACHE_NAME = 'terrybot-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/invoice.html',
  '/invoice-view.html',
  '/jobs.html',
  '/expenses.html',
  '/tax.html',
  '/pricing.html',
  '/settings.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/terry-invoice.png',
  '/images/terry-standing.png',
  '/images/terry-thumbsup.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/manifest.json'
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (fonts, CDNs)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
