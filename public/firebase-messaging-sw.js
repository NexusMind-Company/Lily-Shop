importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBp2ji3oEXR1nzCP0_1Vu3OShnxtxY4_oU",
  authDomain: "lily-shops.firebaseapp.com",
  projectId: "lily-shops",
  storageBucket: "lily-shops.firebasestorage.app",
  messagingSenderId: "571901199347",
  appId: "1:571901199347:web:4f8654f22628c2386c8886",
  measurementId: "G-K6982NE8EB"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // If the backend sent a top-level notification object, FCM automatically displays it.
  // We only show a manual notification if it was a data-only payload.
  if (!payload.notification) {
    const notificationTitle = payload.data?.title || 'LilyShop Notification';
    const notificationOptions = {
      body: payload.data?.body || '',
      icon: '/logo.png',
      data: payload.data || {},
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  if (data.type === 'instant_order' && data.order_id) {
    targetUrl = `/live-kitchen`; 
  } else if (data.url) {
    targetUrl = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

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
