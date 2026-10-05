self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'LilyShop Notification';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || '/lily-logo-192.png',
    badge: data.badge || '/lily-logo-192.png',
    data: data.data || {},
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    requireInteraction: true
  };

  if (options.data && options.data.type === "INSTANT_ORDER") {
    // Attempt to play sound or set custom sound if supported by browser
    // But vibrate is our best cross-platform "loud ringtone" proxy in Web Push
    options.vibrate = [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500];
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
