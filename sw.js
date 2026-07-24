/*
==========================================================
Missouri Route Maker

sw.js - Production Service Worker
Caches app shell, styles, scripts, and map libraries.
==========================================================
*/

const CACHE_NAME = "mo-route-maker-v1";

// Static assets to store in cache
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

// Install Event: Pre-cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Pre-caching core assets...");
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old caches
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
    // Only handle GET requests
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                // Cache external tile or font requests dynamically if successful
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // Fallback response when completely offline and resource isn't cached
            if (event.request.headers.get("accept")?.includes("text/html")) {
                return caches.match("/index.html");
            }
        })
    );
});
