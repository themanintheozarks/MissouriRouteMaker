/*
==========================================================
Missouri Route Maker

js/database.js

IndexedDB Storage Engine
==========================================================
*/

const DB_NAME = "MissouriRouteMakerDB";
const DB_VERSION = 1;

/**
 * Opens and initializes IndexedDB Object Stores
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("places")) {
                db.createObjectStore("places", { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains("routes")) {
                db.createObjectStore("routes", { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "key" });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/* ==========================================================
 * PLACES STORE OPERATIONS
 * ========================================================== */

export async function loadPlaces() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("places", "readonly");
            const store = tx.objectStore("places");
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error loading places from IndexedDB:", err);
        return [];
    }
}

export async function savePlace(place) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("places", "readwrite");
            const store = tx.objectStore("places");
            const request = store.put(place);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error saving place to IndexedDB:", err);
    }
}

export async function deletePlace(id) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("places", "readwrite");
            const store = tx.objectStore("places");
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error deleting place from IndexedDB:", err);
    }
}

/* ==========================================================
 * ROUTES STORE OPERATIONS
 * ========================================================== */

export async function loadRoutes() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("routes", "readonly");
            const store = tx.objectStore("routes");
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error loading routes from IndexedDB:", err);
        return [];
    }
}

export async function getRoute(id) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("routes", "readonly");
            const store = tx.objectStore("routes");
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error fetching route:", err);
        return null;
    }
}

export async function saveRoute(route) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("routes", "readwrite");
            const store = tx.objectStore("routes");
            const request = store.put(route);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error saving route to IndexedDB:", err);
    }
}

export async function deleteRoute(id) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("routes", "readwrite");
            const store = tx.objectStore("routes");
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error deleting route from IndexedDB:", err);
    }
}

/* ==========================================================
 * SETTINGS STORE OPERATIONS
 * ========================================================== */

export async function getSetting(key, defaultValue = null) {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction("settings", "readonly");
            const store = tx.objectStore("settings");
            const request = store.get(key);

            request.onsuccess = () => {
                if (request.result && request.result.value !== undefined) {
                    resolve(request.result.value);
                } else {
                    resolve(defaultValue);
                }
            };

            request.onerror = () => resolve(defaultValue);
        });
    } catch (err) {
        console.error("Error fetching setting:", err);
        return defaultValue;
    }
}

export async function saveSetting(key, value) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction("settings", "readwrite");
            const store = tx.objectStore("settings");
            const request = store.put({ key, value });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error("Error saving setting:", err);
    }
}
