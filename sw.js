/* Welcome Home ♡ — tiny service worker so the checklist works offline.
   Bump CACHE when you change the app files. */
var CACHE = 'welcome-home-v3';

var SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './icon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  // Navigations: network first, fall back to the cached page.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match('./index.html', { ignoreSearch: true })
          .then(function (r) { return r || caches.match('./'); });
      })
    );
    return;
  }

  // Everything else: serve from cache, refresh in the background.
  e.respondWith(
    caches.match(req, { ignoreSearch: sameOrigin }).then(function (hit) {
      var live = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || live;
    })
  );
});
