/*
==========================================================
Missouri Route Maker

js/map/map.js

Module: MapLibre Instance & Tile Management
==========================================================
*/

let mapInstance = null;

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

    return new Promise((resolve) => {
        try {
            const container = document.getElementById("map");
            if (!container) {
                console.error("Map container element #map not found.");
                resolve(null);
                return;
            }

            mapInstance = new maplibregl.Map({
                container: "map",
                style: OSM_STYLE,
                center: [-92.5, 38.5], // Missouri center
                zoom: 6.5,
                attributionControl: false
            });

            mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

            mapInstance.on("load", () => {
                console.log("MapLibre canvas fully loaded.");
                setTimeout(() => mapInstance.resize(), 100);
                resolve(mapInstance);
            });

            // Force initial resize trigger in case container dimensions settle post-load
            setTimeout(() => {
                if (mapInstance) mapInstance.resize();
            }, 300);

        } catch (err) {
            console.error("Failed to instantiate MapLibre:", err);
            resolve(null);
        }
    });
}

/**
 * Returns global map instance
 */
export function getMapInstance() {
    return mapInstance;
}
