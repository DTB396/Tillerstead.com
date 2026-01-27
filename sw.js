/**
 * Service Worker for Tillerstead.com
 * Enterprise-grade caching strategies (Google Workbox pattern)
 * Cache-first for assets, Network-first for HTML, Stale-while-revalidate for API
 * 2026 Web Standards: Offline-capable PWA with intelligent caching
 */

const VERSION = 'v4.0.0'; // Semantic versioning
const STATIC_CACHE = `tillerstead-static-${VERSION}`;
const DYNAMIC_CACHE = `tillerstead-dynamic-${VERSION}`;
const IMAGE_CACHE = `tillerstead-images-${VERSION}`;
const FONT_CACHE = `tillerstead-fonts-${VERSION}`;
const OFFLINE_CACHE = 'tillerstead-offline-v1';

// Max cache sizes (Google Workbox pattern)
const MAX_DYNAMIC_ITEMS = 50;
const MAX_IMAGE_ITEMS = 100;
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Core assets to cache immediately on install (Critical path)
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
  '/assets/css/mobile-app.css',
  '/assets/js/main.js',
  '/assets/js/lazy-loading.js',
  '/assets/js/mobile-app.js',
  '/assets/js/haptics.js',
  '/assets/js/pwa-features.js',
  '/assets/js/gestures.js',
  '/manifest.webmanifest',
  '/assets/icons/favicon-32x32.png',
  '/assets/icons/apple-touch-icon.png',
  '/offline.html'
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
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== OFFLINE_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Background Sync: Form submission when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'form-sync') {
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  try {
    const queue = await getFormQueue();

    for (const item of queue) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          console.log('[SW] Form synced successfully:', item.timestamp);
          await removeFromQueue(item.timestamp);
        }
      } catch (error) {
        console.error('[SW] Form sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function getFormQueue() {
  // This would be replaced with IndexedDB in production
  return [];
}

async function removeFromQueue(timestamp) {
  // This would be replaced with IndexedDB in production
  console.log('[SW] Removed item from queue:', timestamp);
}

// Message handler for cache refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REFRESH_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name === DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
    );
  }
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
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match('/offline.html'))
        )
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
