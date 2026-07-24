/*
==========================================================
Missouri Route Maker

database.js

IndexedDB
==========================================================
*/

const DB_NAME = "MissouriRouteMaker";

const DB_VERSION = 1;

const STORE = "places";

let database = null;

/*
==========================================================
Initialize Database
==========================================================
*/

export function initializeDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {

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
