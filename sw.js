var CACHE_NAME = "pizzafier-v" + Date.now();
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  // Force new version to activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  // Always fetch fresh from network first for HTML/JSON
  if (event.request.url.includes(".html") || event.request.url.includes(".json")) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
  } else {
    // For other assets, use cache if available
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        return cached || fetch(event.request);
      })
    );
  }
});
