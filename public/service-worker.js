const CACHE_NAME = 'gymreco-v1.9.1';
const STATIC_ASSETS = [
  './logo192.png',
  './logo512.png',
  './favicon.ico',
  './manifest.json'
];

const isSameOrigin=(url)=>new URL(url).origin===self.location.origin;
const isStaticAsset=(url)=>/\.(png|ico|jpg|svg)$/.test(new URL(url).pathname);
const isHTML=(url)=>{
  const p=new URL(url).pathname;
  return p.endsWith('/')||p.endsWith('.html')||p.endsWith('workout-tracker');
};
const isJS=(url)=>/\.js$/.test(new URL(url).pathname);

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(STATIC_ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(names=>Promise.all(
        names.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  if(!isSameOrigin(event.request.url)) return;

  const url=event.request.url;

  // HTML 和 JS：網路優先，失敗才用快取（確保總是載入最新版）
  if(isHTML(url)||isJS(url)){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          if(response&&response.status===200){
            const clone=response.clone();
            caches.open(CACHE_NAME).then(c=>c.put(event.request,clone));
          }
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  // 靜態資源（圖示等）：快取優先
  if(isStaticAsset(url)){
    event.respondWith(
      caches.match(event.request)
        .then(cached=>cached||fetch(event.request)
          .then(response=>{
            const clone=response.clone();
            caches.open(CACHE_NAME).then(c=>c.put(event.request,clone));
            return response;
          })
        )
    );
    return;
  }
});
