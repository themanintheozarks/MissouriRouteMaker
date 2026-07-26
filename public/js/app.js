/*
==========================================================
Missouri Route Maker

js/app.js

Main Application Entry Point & Module Orchestrator
==========================================================
*/

import { initializeMap, enableMapClickPinCreation } from "./map/map.js";
import { initializeGPS } from "./gps.js";
import { initDatabase } from "./database.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Starting Missouri Route Maker Startup Sequence...");

    // 1. Initialize Local Storage Engine
    try {
        await initDatabase();
    } catch (dbErr) {
        console.error("Database connection failed:", dbErr);
    }

    // 2. Initialize GPS & Control Handlers
    try {
        initializeGPS();
        attachDrawerListeners();
    } catch (gpsErr) {
        console.error("GPS startup error:", gpsErr);
    }

    // 3. Initialize Map Canvas & Interactive Long-Press Pin Creation
    try {
        const map = await initializeMap();
        if (map) {
            enableMapClickPinCreation(map);
        }
    } catch (mapErr) {
        console.error("Map startup error:", mapErr);
    }
});

/**
 * Handles slide-out modal drawers for main navigation controls
 */
function attachDrawerListeners() {
    const overlay = document.getElementById("modal-overlay");
    const closeBtn = document.getElementById("modal-close-btn");
    const titleEl = document.getElementById("modal-title");
    const bodyEl = document.getElementById("modal-body");

    const openModal = (title, contentHtml) => {
        if (!overlay) return;
        titleEl.textContent = title;
        bodyEl.innerHTML = contentHtml;
        overlay.classList.remove("overlay-hidden");
    };

    const closeModal = () => {
        if (overlay) overlay.classList.add("overlay-hidden");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    // Navigation Triggers
    document.getElementById("btn-route")?.addEventListener("click", () => {
        openModal("Route Builder", "<p>Route optimization module coming in Module 6.</p>");
    });

    document.getElementById("btn-places")?.addEventListener("click", () => {
        openModal("Places Log", "<p>Places list and filter engine coming in Module 5.</p>");
    });

    document.getElementById("btn-import")?.addEventListener("click", () => {
        openModal("Import Data", "<p>Takeout/CSV/GPX/KML import engine coming in Module 4.</p>");
    });

    document.getElementById("btn-settings")?.addEventListener("click", () => {
        openModal("Settings", "<p>Map preferences and configuration coming in Settings.</p>");
    });
}
