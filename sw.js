// Service worker: el juego funciona sin conexión una vez abierto.
// Sube VERSION al publicar cambios para que los móviles descarguen la versión nueva.
const VERSION='embestida-v4';
const CORE=['./','index.html','app.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png',
  'fonts/fonts.css','fonts/Barlow-400-latin.woff2','fonts/Barlow-500-latin.woff2','fonts/Barlow-600-latin.woff2','fonts/BarlowCondensed-400-latin.woff2','fonts/BarlowCondensed-500-latin.woff2','fonts/BarlowCondensed-600-latin.woff2','fonts/BarlowCondensed-700-latin.woff2','fonts/Ultra-400-latin.woff2'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // páginas: primero la red (para recibir actualizaciones), si no hay conexión, la copia guardada
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(VERSION).then(c=>c.put('index.html',cp));return r}).catch(()=>caches.match('index.html')));
    return;
  }
  // archivos del juego: primero la copia guardada
  if(url.origin===location.origin){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp))}
      return r;
    })));
  }
});
