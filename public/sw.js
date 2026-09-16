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
  // Bypass Service Worker for non-GET requests (like POST uploads) and API endpoints
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('api.lilyshops.com') || 
    event.request.url.includes('localhost:8000') || 
    event.request.url.includes('/api/') ||
    event.request.url.includes('/foods/')
  ) {
    return; 
  }

  event.respondWith(
    // Network-first strategy for reliable updates
    fetch(event.request)
      .then(response => {
        // Optionally cache successful responses here if desired
        return response;
      })
      .catch(async error => {
        console.warn('Service worker fetch failed, falling back to cache:', error);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Prevent uncaught promise rejection by returning a fallback response
        return new Response('Network error occurred', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      })
  );
});
