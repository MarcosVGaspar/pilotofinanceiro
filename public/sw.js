const CACHE_NAME = 'pilotofinanceiro-v1'

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // Network first — sempre busca versão mais recente
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            cache.put(event.request, clone)
          }
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
