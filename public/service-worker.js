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
    icon: data.icon || data.data?.icon || `${self.location.origin}/logo.png`,
    badge: data.badge || data.data?.badge || `${self.location.origin}/icons/shop-active.svg`,
    image: data.image || data.data?.image || `${self.location.origin}/lily-logo-512.png`,
    data: data.data || {},
    actions: data.data?.actions || data.actions || [],
    requireInteraction: true,
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
  
  let urlToOpen = event.notification.data?.url || '/';

  // Override urlToOpen if a specific action was clicked
  if (event.action && event.action !== 'dismiss') {
    if (event.notification.data?.actionUrls && event.notification.data.actionUrls[event.action]) {
       urlToOpen = event.notification.data.actionUrls[event.action];
    }
  }
  
  if (event.action === 'dismiss') {
     return; // Just close it, do nothing else.
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientPath = new URL(client.url).pathname;
        const targetPath = urlToOpen.startsWith('http') ? new URL(urlToOpen).pathname : urlToOpen;
        if (clientPath.includes(targetPath) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
