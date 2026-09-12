const C='fishhunt-v2';const CORE=['./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;if(u.origin!==location.origin){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{if(x.ok&&/fonts|unpkg/.test(u.host)){const cp=x.clone();caches.open(C).then(c=>c.put(e.request,cp))}return x}).catch(()=>r)));return}
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(x=>{const cp=x.clone();caches.open(C).then(c=>c.put(e.request,cp));return x}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
