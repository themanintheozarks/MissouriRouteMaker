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
import { getSetting, loadPlaces } from "./database.js";

/*
==========================================================
Application Lifecycle Entry Point
==========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {
    // Register Service Worker for PWA / Offline capabilities
    if ("serviceWorker" in navigator) {
        try {
            const reg = await navigator.serviceWorker.register("/sw.js");
            console.log("Service Worker registered successfully:", reg.scope);
        } catch (err) {
            console.warn("Service Worker registration failed:", err);
        }
    }

    console.log("Initializing Missouri Route Maker...");

    try {
        // 1. Initialize Core Map Instance
        const map = await initializeMap();
        window.map = map; // Expose map globally for UI location actions

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

    // Places Log Search & Status Filter
    const searchInput = document.getElementById("places-search-input");
    const statusFilter = document.getElementById("places-filter-status");

    if (searchInput) searchInput.addEventListener("input", renderPlacesList);
    if (statusFilter) statusFilter.addEventListener("change", renderPlacesList);

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
                window.location.reload();
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
                panels.forEach(id => {
                    if (id !== panelId) {
                        document.getElementById(id)?.classList.remove("active");
                    }
                });
                panelEl.classList.toggle("active");

                // Render places list dynamically when opening Places Drawer
                if (panelId === "places-panel" && panelEl.classList.contains("active")) {
                    renderPlacesList();
                }
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
 * Renders the filtered/searched list inside the Places drawer
 */
export async function renderPlacesList() {
    const container = document.getElementById("places-list-container");
    const searchVal = document.getElementById("places-search-input")?.value.toLowerCase() || "";
    const filterStatus = document.getElementById("places-filter-status")?.value || "all";

    if (!container) return;

    const places = await loadPlaces();
    const filtered = places.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || (p.notes && p.notes.toLowerCase().includes(searchVal));
        const matchesStatus = filterStatus === "all" || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    container.innerHTML = filtered.map(p => `
        <div style="padding: 12px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
            <div>
                <strong style="color: var(--text-primary); font-size: 0.9rem;">${p.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                    ${p.status === 'blue' ? '🔵 Visited' : '🟢 Unvisited'} • ${'★'.repeat(p.rating || 0)}
                </div>
            </div>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="window.map && window.map.flyTo({center:[${p.lng}, ${p.lat}], zoom:15})">Locate</button>
        </div>
    `).join('') || '<div style="padding: 16px; color: var(--text-muted); text-align: center;">No matching places found.</div>';
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
