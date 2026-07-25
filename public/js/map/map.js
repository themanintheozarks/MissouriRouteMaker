/*
==========================================================
Missouri Route Maker

js/map/map.js

Module: MapLibre Instance & Tile Management
==========================================================
*/

let mapInstance = null;

// OpenStreetMap Standard Raster Tile Configuration
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
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
 * Initializes and mounts MapLibre GL JS onto the map container
 */
export async function initializeMap() {
    console.log("Initializing Map Canvas...");

    return new Promise((resolve, reject) => {
        try {
            mapInstance = new maplibregl.Map({
                container: "map",
                style: OSM_STYLE,
                center: [-92.5, 38.5], // Center on Missouri
                zoom: 6.5,
                attributionControl: false
            });

            mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
            mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

            mapInstance.on("load", () => {
                console.log("MapLibre canvas fully loaded.");
                mapInstance.resize();
                resolve(mapInstance);
            });

            mapInstance.on("error", (e) => {
                console.error("MapLibre Error:", e);
            });
        } catch (err) {
            console.error("Failed to instantiate MapLibre:", err);
            reject(err);
        }
    });
}

/**
 * Returns global map instance
 */
export function getMapInstance() {
    return mapInstance;
}
