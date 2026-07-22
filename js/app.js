/*
==========================================================
Missouri Route Maker

app.js

Application Entry Point

==========================================================
*/

import { initializeMap } from "./map/map.js";
import { initializeGPS } from "./gps.js";
import { initializePlaces } from "./places.js";

/*
==========================================================
Initialize Application
==========================================================
*/

function initializeApplication() {

    console.log("Missouri Route Maker Starting...");

    initializeMap();

    /*
    ==========================================
    Wait until the map is fully loaded before
    initializing modules that depend on it.
    ==========================================
    */

    window.map.on("load", () => {

        initializeGPS();

        initializePlaces();

    });

    registerServiceWorker();

}

/*
==========================================================
Service Worker
==========================================================
*/

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {
        return;
    }

    navigator.serviceWorker.register(
        "./service-worker.js"
    );

}

/*
==========================================================
Start
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
