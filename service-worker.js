const CACHE_NAME = 'quilio-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'css/styles.css',
  'css/leaflet.css',
  'js/app.js',
  'js/db.js',
  'js/ui.js',
  'js/charts.js',
  'js/map.js',
  'js/pdf.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
