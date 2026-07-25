/*
==========================================================
Missouri Route Maker

js/app.js
==========================================================
*/

import { initializeMap } from "./map/map.js";
import { initializeGPS } from "./gps.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Starting Missouri Route Maker...");

    // 1. Initialize GPS & UI Listeners first so controls work regardless
    try {
        initializeGPS();
        attachGeneralButtonListeners();
    } catch (gpsErr) {
        console.error("GPS startup error:", gpsErr);
    }

    // 2. Initialize Map Canvas
    try {
        await initializeMap();
    } catch (mapErr) {
        console.error("Map startup error:", mapErr);
    }
});

function attachGeneralButtonListeners() {
    const routeBtn = document.getElementById("btn-route");
    const placesBtn = document.getElementById("btn-places");
    const importBtn = document.getElementById("btn-import");
    const settingsBtn = document.getElementById("btn-settings");

    if (routeBtn) routeBtn.addEventListener("click", () => alert("Route module active"));
    if (placesBtn) placesBtn.addEventListener("click", () => alert("Places module active"));
    if (importBtn) importBtn.addEventListener("click", () => alert("Import module active"));
    if (settingsBtn) settingsBtn.addEventListener("click", () => alert("Settings module active"));
}
