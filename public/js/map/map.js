/*
==========================================================
Missouri Route Maker

js/map/map.js

Module 1: MapLibre Instance & Tile Style Management
==========================================================
*/

import { getSetting, saveSetting } from "../database.js";

let mapInstance = null;

// OpenStreetMap standard tile style configuration
const OSM_STYLE = {
    version: 8,
    sources: {
        "osm-tiles": {
            type: "raster",
            tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    layers: [
        {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19
        }
    ]
};

/**
 * Initializes and mounts MapLibre GL JS onto the canvas container
 */
export async function initializeMap() {
    console.log("Initializing Map Canvas...");

    mapInstance = new maplibregl.Map({
        container: "map",
        style: OSM_STYLE,
        center: [-92.5, 38.5], // Center on Missouri
        zoom: 6.5,
        attributionControl: false
    });

    mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }));
    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

    return new Promise((resolve) => {
        mapInstance.on("load", () => {
            console.log("MapLibre canvas fully loaded with OpenStreetMap tiles.");
            const statusEl = document.getElementById("gps-status");
            if (statusEl) statusEl.textContent = "Map Ready";
            
            // Trigger resize to make sure canvas fills screen
            mapInstance.resize();
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
 * Switches map tile style
 */
export async function setMapStyle(styleKey) {
    if (!mapInstance) return;
    await saveSetting("mapStyle", styleKey);
}

/**
 * Toggles Day / Night / Auto theme modes
 */
export async function applyThemeMode(themeMode) {
    document.body.setAttribute("data-theme", themeMode);
    await saveSetting("themeMode", themeMode);
}
