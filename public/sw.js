/*
==========================================================
Missouri Route Maker - Production Service Worker
==========================================================
*/

const CACHE_NAME = "mo-route-maker-v2";

const PRECACHE_ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/styles.css",
    "/css/variables.css",
    "/css/reset.css",
    "/css/layout.css",
    "/css/components.css",
    "/css/app.css",
    "/js/app.js",
    "/js/database.js",
    "/js/gps.js",
    "/js/import.js",
    "/js/export.js",
    "/js/routes.js",
    "/js/map/map.js",
    "/js/places/places.js",
    "/js/places/editor.js",
    "/js/places/markers.js",
    "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css",
    "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"
];

// Install Event: Safe Pre-caching
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Pre-caching core assets...");
            return Promise.allSettled(
                PRECACHE_ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn(`[Service Worker] Failed to precache: ${url}`, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Activate Event: Clear old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("[Service Worker] Clearing old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Cache-First strategy with Network Fallback
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            if (event.request.headers.get("accept")?.includes("text/html")) {
                return caches.match("/index.html");
            }
        })
    );
});