// Basic Service Worker for PWA
const CACHE_NAME = 'lilyshops-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Just return, it's fine if it fails to cache everything
        return cache.addAll(urlsToCache).catch(() => {});
      })
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET navigation requests or cached shell files
  if (event.request.method !== 'GET') {
    return;
  }

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // Never intercept API requests, backend domains, auth routes, or cross-origin calls
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/foods') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/chat') ||
    url.pathname.startsWith('/shop') ||
    url.pathname.startsWith('/wallet') ||
    url.pathname.startsWith('/notifications') ||
    url.pathname.startsWith('/orders') ||
    url.hostname.includes('api.lilyshops.com') ||
    url.hostname.includes('localhost')
  ) {
    return;
  }

  // Handle navigation requests for offline support
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/index.html');
        return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
  }
});
