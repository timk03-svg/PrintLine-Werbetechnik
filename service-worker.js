const CACHE_NAME = 'printline-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/cookie-banner.js',
  '/favicon.ico',
  '/favicon.png',
  '/leistungen.html',
  '/portfolio.html',
  '/ueber-uns.html',
  '/kontakt.html',
  '/impressum.html',
  '/datenschutz.html',
  '/agb.html',
  '/beschriftungen.html',
  '/druck.html',
  '/schilder.html',
  '/planen-banner.html',
  '/werbeartikel.html',
  '/folientechnik.html',
  '/textildruck-flex-und-flock.html',
  '/fahnen.html',
  '/aufsteller-pylonen.html',
  '/geruestplanen-werbebanner.html',
  // Bilder (nur Beispiel, ggf. erweitern)
  '/bilder-leistung-hintergrund/beschriftungen.jpg',
  '/bilder-leistung-hintergrund/druck.jpg',
  '/bilder-leistung-hintergrund/schilder.jpg',
  '/bilder-leistung-hintergrund/planen.jpg',
  '/bilder-leistung-hintergrund/werbeartikel.jpg',
  '/bilder-leistung-hintergrund/folientechnik.jpg',
  '/bilder-leistung-hintergrund/fahnen.jpg',
  '/bilder-leistung-hintergrund/geruestplanen-werbebanner.jpg',
  '/bilder-leistung-hintergrund/textildruck.JPG',
  '/bilder-leistung-hintergrund/aufsteller-pylonen.jpg',
  // ggf. weitere Bilder ergänzen
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});
