/* PrintLine Werbetechnik — Service Worker v4
   - Network-first für HTML, CSS und JS → Updates erscheinen sofort
   - Cache-first für Bilder/Fonts mit Netzwerk-Fallback (offline-tauglich)
   - Robuste Installation: einzelne fehlende Dateien brechen nicht alles ab
   - Cacht NUR erfolgreiche Antworten (kein 404-Poisoning) → keine „toten" Bilder/Seiten
*/
const CACHE_NAME = 'printline-cache-v39';

// Nur Kern-Assets vorab cachen (die sicher existieren)
const CORE = [
  '/',
  '/index.html',
  '/style.css?v=19',
  '/theme.js?v=17',
  '/assistant.js?v=8',
  '/cookie-banner.js?v=8',
  '/tracking.js',
  '/vendor/motion.js',
  '/favicon.ico?v=3',
  '/favicon.png?v=3',
  '/manifest.json',
];

// Nur echte Erfolgs-Antworten desselben Ursprungs in den Cache legen.
// Verhindert, dass ein 404/500 oder eine undurchsichtige (opaque) Antwort
// den Cache vergiftet und danach dauerhaft ausgeliefert wird.
function istCachebar(res) {
  return res && res.ok && (res.type === 'basic' || res.type === 'cors');
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Jede Datei einzeln cachen → ein 404 bricht nicht den ganzen Install ab
      Promise.all(CORE.map(url =>
        cache.add(url).catch(err => console.warn('SW: konnte nicht cachen:', url))
      ))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // API-Aufrufe nie cachen
  if (url.pathname.startsWith('/api/')) return;

  const isNav = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  const isCode = /\.(css|js|mjs)$/i.test(url.pathname);

  if (isNav || isCode) {
    // Network-first: HTML, CSS und JS immer aktuell (Cache nur als Offline-Fallback).
    // Nur erfolgreiche Antworten cachen; ein 404 wird zurückgegeben, aber NICHT gespeichert.
    event.respondWith(
      fetch(req)
        .then(res => {
          if (istCachebar(res)) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        // Nur wenn das Netzwerk wirklich versagt (offline): exakte Seite aus dem Cache,
        // und erst als letzte Rückfallebene die Startseite bei einer Navigation.
        .catch(() => caches.match(req).then(r => r || (isNav ? caches.match('/index.html') : undefined)))
    );
  } else {
    // Cache-first für Bilder/Fonts (offline-tauglich); ebenfalls nur Erfolge cachen.
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          if (istCachebar(res)) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        }).catch(() => cached)
      )
    );
  }
});
