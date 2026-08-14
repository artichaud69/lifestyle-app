// Imported into the generated service worker (see vite.config.js). Workbox
// owns caching in that worker; this file only adds push handling.

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    // A push with a non-JSON body still deserves to show something.
    payload = { body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'Habit Tracker'
  const options = {
    body: payload.body || '',
    icon: '/lifestyle-app/icons/icon-192.png',
    badge: '/lifestyle-app/icons/icon-192.png',
    // Same tag means a second reminder replaces the first instead of stacking.
    tag: payload.tag || 'habit-reminder',
    data: { url: payload.url || '/lifestyle-app/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || '/lifestyle-app/'

  // Focus the app if it is already open rather than opening a second copy.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/lifestyle-app/') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(target)
    }),
  )
})
