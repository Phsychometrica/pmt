const CACHE_NAME = 'psychometrica-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/styles.css',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Allow network fetches for Blogspot scripts via Cloudflare proxy
    if (requestUrl.href.includes('cors-proxy.yourusername.workers.dev')) {
        event.respondWith(fetch(event.request));
    } else {
        // Cache-first strategy for local resources
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
