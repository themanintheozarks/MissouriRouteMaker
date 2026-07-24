/*
==========================================================
Missouri Route Maker

js/app.js

Module 9: Central Application Orchestration & Event Wiring
==========================================================
*/

import { initializeMap, setMapStyle, applyThemeMode } from "./map/map.js";
import { initializeGPS } from "./gps.js";
import { initializePlaces } from "./places/places.js";
import { initializeRouteLayer, calculateRoute, saveCurrentRoute, resetCurrentRoute } from "./routes.js";
import { processImportFile } from "./import.js";
import { exportData } from "./export.js";
import { getSetting, saveSetting } from "./database.js";

/*
==========================================================
Application Lifecycle Entry Point
==========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing Missouri Route Maker...");

    try {
        // 1. Initialize Core Map Instance
        const map = await initializeMap();

        // 2. Initialize Route Layer on Map
        initializeRouteLayer(map);

        // 3. Initialize GPS Tracking & Arrival Engine
        await initializeGPS();

        // 4. Initialize Places Engine, WebGL Pins, & Place Editor
        await initializePlaces();

        // 5. Wire All User Interface Event Listeners
        wireUIEventListeners();

        // 6. Restore UI Controls State
        await restoreUIState();

        console.log("Missouri Route Maker initialized successfully.");
    } catch (error) {
        console.error("Critical error during app initialization:", error);
    }
});

/*
==========================================================
UI Event Listeners & Panel Controls
==========================================================
*/

function wireUIEventListeners() {
    // Map View Controls (Street / Satellite)
    const mapStyleSelect = document.getElementById("map-style-select");
    if (mapStyleSelect) {
        mapStyleSelect.addEventListener("change", async (e) => {
            await setMapStyle(e.target.value);
        });
    }

    // Theme Mode Switcher (Day / Night / Auto)
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
        themeSelect.addEventListener("change", async (e) => {
            await applyThemeMode(e.target.value);
        });
    }

    // Import File Handling Trigger
    const importFileInput = document.getElementById("import-file-input");
    const importConfirmBtn = document.getElementById("import-confirm-btn");
    if (importConfirmBtn && importFileInput) {
        importConfirmBtn.addEventListener("click", async () => {
            const file = importFileInput.files[0];
            const importOption = document.querySelector('input[name="import-option"]:checked')?.value || "add_new";

            if (!file) {
                alert("Please select a file to import.");
                return;
            }

            try {
                const progressEl = document.getElementById("import-progress-status");
                const result = await processImportFile(file, importOption, (percent, text) => {
                    if (progressEl) progressEl.textContent = `[${percent}%] ${text}`;
                });

                alert(`Import Complete! Parsed ${result.totalParsed} places, added ${result.importedCount} new entries.`);
                window.location.reload(); // Refresh to update rendering engine
            } catch (err) {
                alert(`Import Failed: ${err.message}`);
            }
        });
    }

    // Export Triggers
    const exportPlacesBtn = document.getElementById("export-places-btn");
    if (exportPlacesBtn) {
        exportPlacesBtn.addEventListener("click", () => {
            const format = document.getElementById("export-format-select")?.value || "json";
            exportData("places", format);
        });
    }

    const exportRoutesBtn = document.getElementById("export-routes-btn");
    if (exportRoutesBtn) {
        exportRoutesBtn.addEventListener("click", () => {
            const format = document.getElementById("export-format-select")?.value || "json";
            exportData("routes", format);
        });
    }

    // Route Builder Action Buttons
    const calcRouteBtn = document.getElementById("calc-route-btn");
    if (calcRouteBtn) {
        calcRouteBtn.addEventListener("click", async () => {
            const mode = document.getElementById("route-mode-select")?.value || "Fastest";
            const route = await calculateRoute(mode);
            
            const infoEl = document.getElementById("route-info-display");
            if (infoEl) {
                infoEl.textContent = `Distance: ${route.distanceMiles} mi | Est. Time: ${route.etaMinutes} mins`;
            }
        });
    }

    const saveRouteBtn = document.getElementById("save-route-btn");
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener("click", async () => {
            await saveCurrentRoute();
            alert("Route saved successfully!");
        });
    }

    const clearRouteBtn = document.getElementById("clear-route-btn");
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener("click", () => {
            resetCurrentRoute();
            const infoEl = document.getElementById("route-info-display");
            if (infoEl) infoEl.textContent = "Route cleared.";
        });
    }

    // Bottom Sheet / Panel Drawer Toggles
    wireDrawerToggles();
}

/**
 * Handles slide-out drawers and modal visibility
 */
function wireDrawerToggles() {
    const panels = ["settings-panel", "import-panel", "routes-panel", "places-panel"];

    panels.forEach((panelId) => {
        const toggleBtn = document.getElementById(`toggle-${panelId}`);
        const panelEl = document.getElementById(panelId);
        const closeBtn = document.getElementById(`close-${panelId}`);

        if (toggleBtn && panelEl) {
            toggleBtn.addEventListener("click", () => {
                // Close other panels
                panels.forEach(id => {
                    if (id !== panelId) {
                        document.getElementById(id)?.classList.remove("active");
                    }
                });
                panelEl.classList.toggle("active");
            });
        }

        if (closeBtn && panelEl) {
            closeBtn.addEventListener("click", () => {
                panelEl.classList.remove("active");
            });
        }
    });
}

/**
 * Restores saved UI dropdown states from IndexedDB
 */
async function restoreUIState() {
    const savedStyle = await getSetting("mapStyle", "street");
    const savedTheme = await getSetting("themeMode", "auto");

    const styleSelect = document.getElementById("map-style-select");
    if (styleSelect) styleSelect.value = savedStyle;

    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) themeSelect.value = savedTheme;
}
