/**
 * Service Worker for Tillerstead.com
 * Implements cache-first strategy for static assets, network-first for HTML
 * 2026 Web Standards: Offline-capable PWA with intelligent caching
 */

const STATIC_CACHE = 'tillerstead-static-v1';
const DYNAMIC_CACHE = 'tillerstead-dynamic-v1';

// Core assets to cache immediately on install
const CORE_ASSETS = [
  '/',
  '/portfolio/',
  '/contact/',
  '/services/',
  '/assets/css/root-vars.css',
  '/assets/css/main.css',
  '/assets/css/tile-patterns.css',
  '/assets/css/tile-integrations.css',
  '/assets/css/retro-enhancements.css',
  '/assets/css/navigation.css',
  '/assets/css/nav-drawer.css',
  '/assets/js/main.js',
  '/assets/js/lazy-loading.js',
  '/manifest.webmanifest',
  '/assets/icons/favicon-32x32.png',
  '/assets/icons/apple-touch-icon.png'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external resources
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // HTML: Network-first with cache fallback (always get fresh content)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets (CSS, JS, images): Cache-first with network fallback
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            return response;
          });
        })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
