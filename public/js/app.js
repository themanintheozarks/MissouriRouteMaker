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

    // 1. Initialize GPS listeners immediately so UI controls always function
    try {
        initializeGPS();
    } catch (gpsErr) {
        console.error("GPS initialization error:", gpsErr);
    }

    // 2. Initialize Map Canvas
    try {
        await initializeMap();
        console.log("Map initialized successfully.");
    } catch (mapErr) {
        console.error("Map initialization error:", mapErr);
    }

    console.log("App startup sequence completed.");
});
