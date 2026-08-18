// worker/index.js

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'New Update from Nilay Naha';
  const options = {
    body: data.body || 'Check out my latest project or blog post!',
    icon: '/icon-192x192.png', // Uses your PWA icon
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  // Open the URL passed in the notification data
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
