/*
==========================================================
Missouri Route Maker

js/app.js

Main Application Entry Point
==========================================================
*/

import { initializeMap } from "./map/map.js";
import { initializeGPS } from "./gps.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing Missouri Route Maker...");

    try {
        // Initialize MapLibre GL instance
        await initializeMap();

        // Initialize GPS module & event bindings
        initializeGPS();

        console.log("Missouri Route Maker initialized successfully.");
    } catch (error) {
        console.error("Initialization Error:", error);
    }
});
