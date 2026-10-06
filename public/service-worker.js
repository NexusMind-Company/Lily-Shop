/* eslint-disable no-undef */
/* global clients */
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const isInstantOrder = data.data && data.data.type === 'instant_order';

  const title = data.title || 'LilyShop Notification';
  const options = {
    body: data.body || 'You have a new notification.',
    // icon: small logo shown in the notification tile (collapsed view)
    icon: data.icon || `${self.location.origin}/logo.png`,
    // badge: tiny monochrome icon in Android status bar (72px ideal)
    badge: data.badge || `${self.location.origin}/icons/shop-active.svg`,
    // image: large banner shown when notification is expanded
    image: data.image || `${self.location.origin}/lily-logo-512.png`,
    data: data.data || {},
    requireInteraction: true,
    // Vibrate only works on Android; desktop has no vibration API.
    // For desktop audio we postMessage to the active page (see below).
    vibrate: isInstantOrder
      ? [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500]
      : [200, 100, 200, 100, 200, 100, 200],
  };

  const notifyClients = clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(allClients) {
    allClients.forEach(function(client) {
      if (isInstantOrder) {
        client.postMessage({ type: 'INSTANT_ORDER_PUSH', payload: data.data || {} });
      } else {
        client.postMessage({ type: 'NORMAL_PUSH', payload: data.data || {} });
      }
    });
  });

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      notifyClients,
    ])
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Focus an already-open tab whose URL *contains* the target path
      // rather than requiring an exact match (which almost never fires
      // when the user is on a nearby route like /vendor/dashboard/orders).
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientPath = new URL(client.url).pathname;
        const targetPath = urlToOpen.startsWith('http') ? new URL(urlToOpen).pathname : urlToOpen;
        if (clientPath.includes(targetPath) && 'focus' in client) {
          return client.focus();
        }
      }
      // No matching tab found — open a new one.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
