/*
==========================================================
Missouri Route Maker

app.js

Application Entry Point

==========================================================
*/

import { initializeMap } from "./map/map.js";
import { initializeGPS } from "./gps.js";

/*
==========================================================
Initialize Application
==========================================================
*/

function initializeApplication() {

    console.log("Missouri Route Maker Starting...");

    initializeMap();

    initializeGPS();

    setupZoomButtons();

    registerServiceWorker();

}

/*
==========================================================
Custom Zoom Buttons
==========================================================
*/

function setupZoomButtons() {

    const zoomIn =
        document.getElementById("zoom-in");

    const zoomOut =
        document.getElementById("zoom-out");

    zoomIn.onclick = () => {

        window.map.zoomIn();

    };

    zoomOut.onclick = () => {

        window.map.zoomOut();

    };

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
