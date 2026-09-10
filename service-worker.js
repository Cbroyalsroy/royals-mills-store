self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('ggc-mills-v1').then(function(cache) {
      return cache.addAll([
        './royals_mills_app.html',
        './royals_mills_app-5.html'
      ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    })
  );
});
