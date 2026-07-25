/*
==========================================================
Missouri Route Maker

js/database.js

Module: IndexedDB Local Storage Manager
==========================================================
*/

const DB_NAME = "MissouriRouteMakerDB";
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Opens and initializes the local IndexedDB database instance
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

            // Places Store
            if (!db.objectStoreNames.contains("places")) {
                const placesStore = db.createObjectStore("places", { keyPath: "id" });
                placesStore.createIndex("status", "status", { unique: false });
                placesStore.createIndex("rating", "rating", { unique: false });
                placesStore.createIndex("dateAdded", "dateAdded", { unique: false });
            }

            // Routes Store
            if (!db.objectStoreNames.contains("routes")) {
                db.createObjectStore("routes", { keyPath: "id" });
            }

            // Settings Store
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "key" });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            console.log("IndexedDB Database connected successfully.");
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error("IndexedDB initialization error:", event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Retrieves all stored places from IndexedDB
 */
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

/**
 * Saves or updates a place in IndexedDB immediately
 */
export async function savePlace(placeData) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("places", "readwrite");
        const store = tx.objectStore("places");
        const request = store.put(placeData);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Deletes a place by ID
 */
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
