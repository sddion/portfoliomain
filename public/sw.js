// increment version on each deploy 
const CACHE_VERSION = 'v20251222-024357';
const CACHE_NAME = `sddionOS-cache-${CACHE_VERSION}`;

// Only cache critical static assets
const ASSETS_TO_CACHE = [
    '/manifest.json',
    '/DedSec_logo.webp',
    '/favicon.ico',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing new version:', CACHE_VERSION);
    // Skip waiting to activate immediately
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new version:', CACHE_VERSION);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch - Cache First for static assets, Network First for others
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API requests and browser extensions
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') ||
        url.protocol === 'chrome-extension:' ||
        url.hostname !== self.location.hostname) {
        return;
    }

    // Checking if it's one of our static assets
    const isStaticAsset = ASSETS_TO_CACHE.some(asset => url.pathname === asset);

    if (isStaticAsset) {
        // Cache First Strategy for static assets
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
        );
    } else {
        // Network First Strategy for everything else (pages, dynamic js)
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    // If successful, cache and return
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/');
                        }
                        return new Response('Offline', { status: 503 });
                    });
                })
        );
    }
});

// Listen for messages to skip waiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
