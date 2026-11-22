// Service worker del Libro di Ricette — generato, non modificare a mano.
const VERSIONE = '95bceabe70';
const GUSCIO = 'ricette-guscio-' + VERSIONE;
const FOTO = 'ricette-foto';
const BASE_FILES = ['./', 'manifest.json', 'icone/icona-180.png', 'icone/icona-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(GUSCIO).then(c => c.addAll(BASE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('ricette-guscio-') && k !== GUSCIO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/foto/')) {
    // ogni foto ha nell'indirizzo l'impronta del contenuto (?v=...): prima la copia sul
    // dispositivo, poi la rete. Una foto rifatta ha un indirizzo nuovo: si scarica e
    // la copia vecchia viene tolta.
    e.respondWith(caches.open(FOTO).then(c => c.match(e.request).then(r => r ||
      fetch(e.request).then(n => {
        if (n.ok) { const copia = n.clone();
          c.delete(e.request, {ignoreSearch: true}).then(() => c.put(e.request, copia)); }
        return n;
      }))));
    return;
  }
  // pagina e dati: prima la rete (sempre l'ultima versione), copia locale se manca la rete
  e.respondWith(fetch(e.request).then(n => {
    if (n.ok) { const copia = n.clone(); caches.open(GUSCIO).then(c => c.put(e.request, copia)); }
    return n;
  }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./'))));
});
