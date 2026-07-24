/*
==========================================================
Missouri Route Maker

map.js
==========================================================
*/

import { getSetting, saveSetting } from "../database.js";

let map = null;
let currentStyle = "street"; // 'street' | 'satellite'
let currentTheme = "auto";   // 'day' | 'night' | 'auto'

// Vector / Raster Tile Styles
const STYLES = {
    street: "https://tiles.openfreemap.org/styles/liberty",
    satellite: {
        version: 8,
        sources: {
            "satellite-tiles": {
                type: "raster",
                tiles: [
                    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                attribution: "Esri, Maxar, Earthstar Geographics"
            }
        },
        layers: [
            {
                id: "satellite-tiles-layer",
                type: "raster",
                source: "satellite-tiles",
                minzoom: 0,
                maxzoom: 19
            }
        ]
    }
};

export async function initializeMap() {
    // Restore persisted settings from IndexedDB
    currentStyle = await getSetting("mapStyle", "street");
    currentTheme = await getSetting("themeMode", "auto");

    map = new maplibregl.Map({
        container: "map",
        style: STYLES[currentStyle] || STYLES.street,
        center: [-92.603760, 38.573936],
        zoom: 6,
        attributionControl: false
    });

    // Make the map available globally
    window.map = map;

    return new Promise((resolve) => {
        map.on("load", () => {
            console.log("Map Loaded");

            const statusEl = document.getElementById("gps-status");
            if (statusEl) statusEl.textContent = "Map Ready";

            const zoomInBtn = document.getElementById("zoom-in");
            if (zoomInBtn) zoomInBtn.onclick = () => map.zoomIn();

            const zoomOutBtn = document.getElementById("zoom-out");
            if (zoomOutBtn) zoomOutBtn.onclick = () => map.zoomOut();

            const routeBtn = document.getElementById("route-button");
            if (routeBtn) {
                routeBtn.onclick = () => alert("Route Planner coming in a future module.");
            }

            applyThemeMode(currentTheme);
            resolve(map);
        });
    });
}

export function getMap() {
    return map;
}

/*
==========================================================
Map Style Switcher (Street / Satellite)
==========================================================
*/

export async function setMapStyle(styleName) {
    if (!map || !STYLES[styleName]) return;

    currentStyle = styleName;
    await saveSetting("mapStyle", styleName);

    map.setStyle(STYLES[styleName]);
}

export function getCurrentStyle() {
    return currentStyle;
}

/*
==========================================================
Theme Engine (Day / Night / Auto)
==========================================================
*/

export async function applyThemeMode(theme) {
    currentTheme = theme;
    await saveSetting("themeMode", theme);

    let isNight = false;

    if (theme === "night") {
        isNight = true;
    } else if (theme === "day") {
        isNight = false;
    } else if (theme === "auto") {
        const hour = new Date().getHours();
        isNight = hour < 6 || hour >= 19; // Auto night between 7 PM and 6 AM
    }

    const mapContainer = map ? map.getContainer() : null;

    if (mapContainer) {
        if (isNight) {
            mapContainer.classList.add("night-mode");
            mapContainer.style.filter = "brightness(0.7) contrast(1.2) invert(0.1)";
        } else {
            mapContainer.classList.remove("night-mode");
            mapContainer.style.filter = "none";
        }
    }
}
