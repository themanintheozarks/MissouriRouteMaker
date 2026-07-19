/*
==========================================================
Missouri Route Maker

Application Entry
==========================================================
*/

import { initializeMap, getMap } from "./map/map.js";

function initializeApplication() {

    initializeMap();

    setupZoomButtons();

    registerServiceWorker();

}

function setupZoomButtons() {

    const zoomIn =
        document.getElementById("zoom-in");

    const zoomOut =
        document.getElementById("zoom-out");

    zoomIn.addEventListener("click", () => {

        const map = getMap();

        if (map) {
            map.zoomIn();
        }

    });

    zoomOut.addEventListener("click", () => {

        const map = getMap();

        if (map) {
            map.zoomOut();
        }

    });

}

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {
        return;
    }

    navigator.serviceWorker.register(
        "./service-worker.js"
    );

}

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
