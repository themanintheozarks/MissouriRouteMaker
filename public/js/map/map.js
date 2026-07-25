/*
==========================================================
Missouri Route Maker

js/map/map.js

Module 1: MapLibre Instance & Tile Style Management
==========================================================
*/

import { getSetting, saveSetting } from "../database.js";

let mapInstance = null;

const MAP_STYLES = {
    street: "https://demotiles.maplibre.org/style.json",
    satellite: "https://demotiles.maplibre.org/style.json"
};

/**
 * Initializes and mounts MapLibre GL JS onto the canvas container
 */
export async function initializeMap() {
    console.log("Initializing Map Canvas...");

    const savedStyleKey = await getSetting("mapStyle", "street");
    const styleUrl = MAP_STYLES[savedStyleKey] || MAP_STYLES.street;

    mapInstance = new maplibregl.Map({
        container: "map",
        style: styleUrl,
        center: [-92.5, 38.5], // Center on Missouri
        zoom: 6.5,
        attributionControl: false
    });

    mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }));

    return new Promise((resolve) => {
        mapInstance.on("load", () => {
            console.log("MapLibre canvas fully loaded.");
            const statusEl = document.getElementById("gps-status");
            if (statusEl) statusEl.textContent = "Map Ready";
            resolve(mapInstance);
        });
    });
}

/**
 * Returns the global map instance
 */
export function getMapInstance() {
    return mapInstance;
}

/**
 * Alias export for getMap compatibility
 */
export function getMap() {
    return mapInstance;
}

/**
 * Switches map tile style between Street and Satellite
 */
export async function setMapStyle(styleKey) {
    if (!mapInstance || !MAP_STYLES[styleKey]) return;
    
    mapInstance.setStyle(MAP_STYLES[styleKey]);
    await saveSetting("mapStyle", styleKey);
}

/**
 * Toggles Day / Night / Auto theme modes
 */
export async function applyThemeMode(themeMode) {
    document.body.setAttribute("data-theme", themeMode);
    await saveSetting("themeMode", themeMode);
}
