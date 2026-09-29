// Royals Mills App — Service Worker
// इससे ऐप पेज, Firebase library, और fonts ऑफलाइन इस्तेमाल के लिए cache हो जाते हैं
const CACHE_NAME = 'rms-cache-v2';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// रणनीति: पहले network से लाने की कोशिश करो और cache अपडेट करो।
// अगर network fail हो (यानी offline हो), तो जो पहले से cache में है वही दिखाओ।
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return fetch(req).then(function (networkRes) {
        if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      }).catch(function () {
        return cache.match(req, { ignoreSearch: true }).then(function (cached) {
          if (cached) return cached;
          if (req.mode === 'navigate') {
            return cache.match(self.registration.scope).then(function (fallback) {
              return fallback || Promise.reject('offline-no-cache');
            });
          }
          return Promise.reject('offline-no-cache');
        });
      });
    })
  );
});
