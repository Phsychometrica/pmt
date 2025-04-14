const CACHE_NAME = 'psychometrica-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Noto+Sans+Devanagari&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
