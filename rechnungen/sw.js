/* PrintLine Rechnungen – Service Worker
   Strategie: "network-first" für die App-Dateien.
   -> Beim Öffnen wird IMMER zuerst die neueste Version aus dem Netz geladen
      (automatische Updates ohne Neu-Download). Nur wenn offline, kommt die
      zwischengespeicherte Version zum Einsatz. Nutzerdaten liegen in
      localStorage/IndexedDB und werden vom Cache NICHT berührt. */
const CACHE = "printline-rechnungen-v3";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match("./index.html")))
  );
});
