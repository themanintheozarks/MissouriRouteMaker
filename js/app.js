/*
==========================================================
Missouri Route Maker
Module 2

app.js

Application Entry Point

Responsibilities:

- Start application
- Initialize modules
- Register Service Worker

==========================================================
*/

import { APP_CONFIG } from "./config.js";
import { initializeMap } from "./map/map.js";

/*
==========================================================
Start Application
==========================================================
*/

function initializeApplication() {

    console.log(`${APP_CONFIG.APP_NAME} starting...`);

    initializeMap();

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

    navigator.serviceWorker
        .register("./service-worker.js")
        .then(() => {

            console.log(
                "Service Worker registered."
            );

        })
        .catch(error => {

            console.error(
                "Service Worker registration failed:",
                error
            );

        });

}

/*
==========================================================
DOM Ready
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
