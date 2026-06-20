const CACHE = 'french-app-v2';
const CORE = [
  '/french-app/',
  '/french-app/index.html',
  '/french-app/manifest.json',
  '/french-app/icon-192.png'
];

// התקנה — שמור קבצי בסיס
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(()=>{})));
});

// הפעלה — מחק cache ישן מיד
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: תמיד מנסה רשת קודם, מצליח = מעדכן cache
// נכשל (אופליין) = מחזיר מה שיש ב-cache
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.status === 200){
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
