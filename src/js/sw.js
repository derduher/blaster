var CACHE_NAME = 'blaster-1'
const { assets } = global.serviceWorkerOption
let assetsToCache = [...assets, './']
console.log(assetsToCache)
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache))
  )
})

// After the install event.
self.addEventListener('activate', event => {
  console.log('[SW] Activate event')

  // Clean the caches
  event.waitUntil(
    global.caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete the caches that are not the current one.
          if (cacheName.indexOf(CACHE_NAME) === 0) {
            return null
          }

          return global.caches.delete(cacheName)
        })
      )
    })
  )
})

self.addEventListener('fetch', event => {
  const request = event.request

  // Ignore not GET request.
  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  // Ignore difference origin.
  if (requestUrl.origin !== location.origin) {
    return
  }

  const resource = global.caches.match(request).then(response => {
    if (response) {
      return response
    }

    // Load and cache known assets.
    return fetch(request)
      .then(responseNetwork => {
        if (!responseNetwork || !responseNetwork.ok) {
          console.log(
            `[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${
              responseNetwork.status
            } ${responseNetwork.type}`
          )

          return responseNetwork
        }

        console.log(`[SW] URL ${requestUrl.href} fetched`)

        const responseCache = responseNetwork.clone()

        global.caches
          .open(CACHE_NAME)
          .then(cache => {
            return cache.put(request, responseCache)
          })
          .then(() => {
            console.log(`[SW] Cache asset: ${requestUrl.href}`)
          })

        return responseNetwork
      })
      .catch(() => {
        // User is landing on our page.
        if (event.request.mode === 'navigate') {
          return global.caches.match('./')
        }

        return null
      })
  })

  event.respondWith(resource)
})
