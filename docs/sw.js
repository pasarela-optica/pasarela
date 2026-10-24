// Caja O5: el service worker del sitio óptico (plantilla: el build pone la versión y la lista de ficheros).
// Al instalarse guarda la página entera; después la sirve desde ahí, también sin red. Solo atiende lo que está bajo su
// alcance (la ruta del sitio); lo demás (otra ruta, otro origen, un POST) va a la red tal cual.
const VERSION = "eac2a5de332b461e";
const LISTA = ["./","./LICENCIAS.txt","./assets/comun-CLhJjx6Z.css","./assets/comun-Dy3AGC8z.js","./assets/enviar-BgiSJ_vy.js","./assets/index-5Yfh96mr.js","./assets/lt-BEAqVR_F.js","./assets/medir-DvTO3mUh.js","./assets/receptor-CMpIxN_F.js","./assets/receptor.worker-BeZOh4oi.js","./assets/recibir-DvcL-39Y.js","./assets/zxing_reader-_HcWiliU.wasm","./enviar.html","./index.html","./medir.html","./recibir.html"];
const PREFIJO = "pasarela-optico-";
const CACHE = PREFIJO + VERSION;

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll(LISTA.map((ruta) => new URL(ruta, self.registration.scope).href)))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(caches.keys()
    .then((nombres) => Promise.all(nombres.filter((n) => n.startsWith(PREFIJO) && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET" || !peticion.url.startsWith(self.registration.scope)) return;
  // Lo guardado va por su dirección: sin mirar la consulta ni `Vary` (los scripts de módulo llevan `Origin` y lo
  // guardado al instalar, no; con `Vary: Origin`, nada casaría y sin red no cargaría ningún script).
  evento.respondWith(caches.open(CACHE)
    .then((cache) => cache.match(peticion, { ignoreSearch: true, ignoreVary: true }))
    .then((guardada) => guardada || fetch(peticion)));
});
