const CACHE_NAME = 'gymreco-v1.9.1'; // 這裡的值只在本機開發時有意義，正式 build 時會被 scripts/sync-sw-version.js 自動覆寫成跟 APP_VERSION 一致
const STATIC_ASSETS = [
  './logo192.png',
  './logo512.png',
  './favicon.ico',
  './manifest.json'
];

const NETWORK_TIMEOUT_MS = 3000; // 弱網路容忍時間：超過此時間網路還沒回應，就先用快取墊著；如需調整靈敏度，改這個數字即可

const isSameOrigin=(url)=>new URL(url).origin===self.location.origin;
const isStaticAsset=(url)=>/\.(png|ico|jpg|svg)$/.test(new URL(url).pathname);
const isHTML=(url)=>{
  const p=new URL(url).pathname;
  return p.endsWith('/')||p.endsWith('.html');
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

// network-first + 逾時 fallback：優先用網路拿最新內容，
// 但網路太慢（尚未完全斷線）時不再無限期等待，逾時後先用快取墊著；
// 背景的網路請求仍會繼續進行，若之後成功，照樣把最新內容寫入快取供下次使用
function networkFirstWithTimeout(request) {
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
      }
      return response;
    })
    .catch(() => undefined);

  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(undefined), NETWORK_TIMEOUT_MS));

  return Promise.race([fetchPromise, timeoutPromise]).then(response => {
    if (response) return response;
    // 逾時或網路失敗：改用快取墊著；連快取都沒有的話，才退回等待原本的網路請求結果
    return caches.match(request).then(cached => cached || fetchPromise);
  });
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  if(!isSameOrigin(event.request.url)) return;

  const url=event.request.url;

  // HTML 和 JS：網路優先，但加上逾時保護，避免弱網路時卡住
  if(isHTML(url)||isJS(url)){
    event.respondWith(networkFirstWithTimeout(event.request));
    return;
  }

  // 靜態資源（圖示等）：快取優先，本來就不會有卡住問題，維持原樣
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