/*
==========================================================
Missouri Route Maker

database.js

IndexedDB Storage Engine
==========================================================
*/

const DB_NAME = "MissouriRouteMaker";
const DB_VERSION = 1;

// Object Stores
const STORES = {
    PLACES: "places",
    ROUTES: "routes",
    CATEGORIES: "categories",
    SETTINGS: "settings"
};

// Default Settings
export const DEFAULT_SETTINGS = {
    mapStyle: "street",
    themeMode: "auto",
    followMe: false,
    arrivalRadiusFeet: 200,
    gpsPollRateMs: 3000,
    arrivalChime: true,
    arrivalPopup: true,
    visiblePins: {
        green: true,
        blue: true,
        orange: true,
        red: true
    }
};

let database = null;

/*
==========================================================
Initialize Database
==========================================================
*/

export function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
            database = request.result;
            console.log("Database Ready");
            resolve();
        };

        request.onupgradeneeded = event => {
            database = event.target.result;

            // Places Store
            if (!database.objectStoreNames.contains(STORES.PLACES)) {
                const placesStore = database.createObjectStore(
                    STORES.PLACES,
                    { keyPath: "id" }
                );

                placesStore.createIndex("name", "name", { unique: false });
                placesStore.createIndex("status", "status", { unique: false });
                placesStore.createIndex("rating", "rating", { unique: false });
                placesStore.createIndex("dateAdded", "dateAdded", { unique: false });
            }

            // Routes Store
            if (!database.objectStoreNames.contains(STORES.ROUTES)) {
                const routesStore = database.createObjectStore(
                    STORES.ROUTES,
                    { keyPath: "id" }
                );

                routesStore.createIndex("name", "name", { unique: false });
            }

            // Categories Store
            if (!database.objectStoreNames.contains(STORES.CATEGORIES)) {
                database.createObjectStore(
                    STORES.CATEGORIES,
                    { keyPath: "id" }
                );
            }

            // Settings Store
            if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
                database.createObjectStore(
                    STORES.SETTINGS,
                    { keyPath: "key" }
                );
            }
        };
    });
}

/*
==========================================================
Places CRUD
==========================================================
*/

export function savePlace(place) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PLACES, "readwrite");
        const store = transaction.objectStore(STORES.PLACES);

        const record = {
            id: place.id || crypto.randomUUID(),
            name: place.name || "Unnamed Place",
            lat: Number(place.lat),
            lng: Number(place.lng),
            address: place.address || "",
            status: place.status || "green",
            notes: place.notes || "",
            rating: Number(place.rating) || 0,
            categories: Array.isArray(place.categories) ? place.categories : [],
            dateAdded: place.dateAdded || new Date().toISOString()
        };

        const request = store.put(record);

        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

export function loadPlaces() {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PLACES, "readonly");
        const store = transaction.objectStore(STORES.PLACES);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function deletePlace(id) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PLACES, "readwrite");
        const store = transaction.objectStore(STORES.PLACES);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

export function clearAllPlaces() {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PLACES, "readwrite");
        const store = transaction.objectStore(STORES.PLACES);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/*
==========================================================
Bulk Import Places (Performance Optimized for 20,000+ Items)
==========================================================
*/

export function bulkImportPlaces(placesArray) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.PLACES, "readwrite");
        const store = transaction.objectStore(STORES.PLACES);

        placesArray.forEach(place => {
            const record = {
                id: place.id || crypto.randomUUID(),
                name: place.name || "Unnamed Place",
                lat: Number(place.lat),
                lng: Number(place.lng),
                address: place.address || "",
                status: place.status || "green",
                notes: place.notes || "",
                rating: Number(place.rating) || 0,
                categories: Array.isArray(place.categories) ? place.categories : [],
                dateAdded: place.dateAdded || new Date().toISOString()
            };
            store.put(record);
        });

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
    });
}

/*
==========================================================
Routes CRUD
==========================================================
*/

export function saveRoute(route) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.ROUTES, "readwrite");
        const store = transaction.objectStore(STORES.ROUTES);

        const record = {
            id: route.id || crypto.randomUUID(),
            name: route.name || "New Route",
            stops: route.stops || [],
            distance: route.distance || 0,
            eta: route.eta || 0,
            mode: route.mode || "Fastest",
            notes: route.notes || ""
        };

        const request = store.put(record);

        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
    });
}

export function loadRoutes() {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.ROUTES, "readonly");
        const store = transaction.objectStore(STORES.ROUTES);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function deleteRoute(id) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.ROUTES, "readwrite");
        const store = transaction.objectStore(STORES.ROUTES);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

export function clearAllRoutes() {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.ROUTES, "readwrite");
        const store = transaction.objectStore(STORES.ROUTES);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/*
==========================================================
Settings
==========================================================
*/

export function getSetting(key, defaultValue = null) {
    return new Promise(resolve => {
        if (!database) return resolve(defaultValue);

        const transaction = database.transaction(STORES.SETTINGS, "readonly");
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result ? request.result.value : defaultValue);
        };
        request.onerror = () => resolve(defaultValue);
    });
}

export function saveSetting(key, value) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORES.SETTINGS, "readwrite");
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.put({ key, value });

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}
            database = request.result;

            console.log("Database Ready");

            resolve();

        };

        request.onupgradeneeded = event => {

            database = event.target.result;

            if (!database.objectStoreNames.contains(STORE)) {

                const store =
                    database.createObjectStore(
                        STORE,
                        {
                            keyPath: "id",
                            autoIncrement: true
                        }
                    );

                store.createIndex(
                    "name",
                    "name"
                );

            }

        };

    });

}

/*
==========================================================
Save Place
==========================================================
*/

export function savePlace(place) {

    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                STORE,
                "readwrite"
            );

        const store =
            transaction.objectStore(STORE);

        const request =
            store.add(place);

        request.onsuccess = () => resolve();

        request.onerror = () => reject(request.error);

    });

}

/*
==========================================================
Load Places
==========================================================
*/

export function loadPlaces() {

    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                STORE,
                "readonly"
            );

        const store =
            transaction.objectStore(STORE);

        const request =
            store.getAll();

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => reject(request.error);

    });

}
