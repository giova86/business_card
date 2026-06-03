// Service worker — biglietto da visita PWA
// Bump CACHE_NAME ad ogni rilascio per invalidare la cache.
const CACHE_NAME = 'gbocchi-card-v1';

const ASSETS = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'static/favicon.png',
  'static/icon-192.png',
  'static/icon-512.png',
  'static/icon-maskable-512.png',
  'static/gbocchi.png',
  'static/linkedin.png',
  'static/github.png',
  'static/ig.png',
  'static/facebook.png',
  'static/x.png',
  'static/go.png',
  'static/chess.png'
];

// Precache degli asset locali; ignora i singoli fallimenti per non bloccare l'install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(ASSETS.map((a) => cache.add(a))))
      .then(() => self.skipWaiting())
  );
});

// Rimuove le cache vecchie.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first con fallback alla rete; solo richieste GET same-origin.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
