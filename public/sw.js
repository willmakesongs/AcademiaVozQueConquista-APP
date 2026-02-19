const CACHE_NAME = 'vqc-cache-v6';
const ASSETS_TO_CACHE = [
    '/manifest.json',
    '/logo192.png',
    '/favicon.ico',
    '/favicon.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clear old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Network First strategy for HTML/root to avoid stale index.html
    if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    // Cache First strategy for known static assets, Network First/Only for others
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

