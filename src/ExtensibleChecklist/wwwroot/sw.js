const CACHE_VERSION = 'v2';
const STATIC_CACHE = `checklist-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    '/favicon.svg',
    '/manifest.json',
    '/css/site.css',
    '/_content/MathaUI/css/base.css',
    '/_content/MathaUI/css/user-menu.css',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => Promise.all(
                PRECACHE_URLS.map((url) => cache.add(url).catch(() => {}))
            ))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // Bypass auth, API, and sign-in endpoints — always go to the network.
    if (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/signin') ||
        url.pathname.startsWith('/signout') ||
        url.pathname.startsWith('/logout')
    ) {
        return;
    }

    // Network-first for navigation; fall back to cached navigation if offline.
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
                    return response;
                })
                .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
        );
        return;
    }

    // Cache-first for same-origin static assets.
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((response) => {
                if (response.ok && response.type === 'basic') {
                    const copy = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
