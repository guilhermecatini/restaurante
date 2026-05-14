const CACHE_VERSION = 'frontend-static-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app/app.js',
    '/app/run.js',
    '/lib/css/main.css',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        return;
    }

    // Nunca cachear API para evitar dados stale e problemas de auth.
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Navegacao HTML: network-first com fallback para index.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const cloned = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', cloned));
                    return response;
                })
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Assets estaticos: stale-while-revalidate.
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    if (response && response.status === 200 && url.origin === self.location.origin) {
                        const cloned = response.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(request, cloned));
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || network;
        })
    );
});
