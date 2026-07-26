/*
==========================================================
Missouri Route Maker

js/database.js

Module 3: Complete Local IndexedDB Engine
==========================================================
*/

const DB_NAME = "MissouriRouteMakerDB";
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initializes and upgrades the IndexedDB instance
 */
export function initDatabase() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // 1. Places Object Store
            if (!db.objectStoreNames.contains("places")) {
                const placesStore = db.createObjectStore("places", { keyPath: "id" });
                placesStore.createIndex("status", "status", { unique: false });
                placesStore.createIndex("rating", "rating", { unique: false });
                placesStore.createIndex("dateAdded", "dateAdded", { unique: false });
            }

            // 2. Routes Object Store
            if (!db.objectStoreNames.contains("routes")) {
                const routesStore = db.createObjectStore("routes", { keyPath: "id" });
                routesStore.createIndex("name", "name", { unique: false });
            }

            // 3. Categories Object Store
            if (!db.objectStoreNames.contains("categories")) {
                db.createObjectStore("categories", { keyPath: "id" });
            }

            // 4. Settings Object Store
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "key" });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            console.log("IndexedDB Module connected successfully.");
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error("IndexedDB initialization error:", event.target.error);
            reject(event.target.error);
        };
    });
}

// ==========================================
// PLACES CRUD OPERATIONS
// ==========================================

export async function getAllPlaces() {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("places", "readonly");
        const store = tx.objectStore("places");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function savePlace(placeData) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("places", "readwrite");
        const store = tx.objectStore("places");
        
        // Ensure place metadata exists
        const record = {
            id: placeData.id || `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: placeData.name || "Unnamed Place",
            latitude: placeData.latitude,
            longitude: placeData.longitude,
            address: placeData.address || "",
            status: placeData.status || "green", // green, blue, orange, red
            notes: placeData.notes || "",
            rating: placeData.rating || 0, // 1 - 5 stars
            categories: placeData.categories || [],
            dateAdded: placeData.dateAdded || new Date().toISOString()
        };

        const request = store.put(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

export async function deletePlace(id) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("places", "readwrite");
        const store = tx.objectStore("places");
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// ROUTES CRUD OPERATIONS
// ==========================================

export async function getAllRoutes() {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("routes", "readonly");
        const store = tx.objectStore("routes");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function saveRoute(routeData) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("routes", "readwrite");
        const store = tx.objectStore("routes");
        
        const record = {
            id: routeData.id || `route_${Date.now()}`,
            name: routeData.name || "New Route",
            stops: routeData.stops || [],
            distance: routeData.distance || 0,
            eta: routeData.eta || 0,
            optimizationMode: routeData.optimizationMode || "Fastest",
            notes: routeData.notes || ""
        };

        const request = store.put(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// SETTINGS OPERATIONS
// ==========================================

export async function getSetting(key, defaultValue = null) {
    const db = await initDatabase();
    return new Promise((resolve) => {
        const tx = db.transaction("settings", "readonly");
        const store = tx.objectStore("settings");
        const request = store.get(key);

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.value);
            } else {
                resolve(defaultValue);
            }
        };
        request.onerror = () => resolve(defaultValue);
    });
}

export async function saveSetting(key, value) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("settings", "readwrite");
        const store = tx.objectStore("settings");
        const request = store.put({ key, value });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

