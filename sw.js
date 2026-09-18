const CACHE = 'taskflow-v4';
const ASSETS = ['./', './lib.js', './manifest.json', './icon.svg',
    './fonts/schibsted-grotesk-latin.woff2', './fonts/schibsted-grotesk-latin-ext.woff2'];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }));
    self.clients.claim();
});

// Network first, cache as fallback. Cache-first served stale builds until someone
// remembered to bump CACHE by hand; this way a deploy lands immediately and
// offline still works off the last response we saw.
self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request).then(function(res) {
            const copy = res.clone();
            caches.open(CACHE).then(function(c) { c.put(e.request, copy); }).catch(function() {});
            return res;
        }).catch(function() {
            return caches.match(e.request).then(function(hit) {
                return hit || caches.match('./');
            });
        })
    );
});
