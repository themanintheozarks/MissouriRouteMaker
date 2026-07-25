/*
==========================================================
Missouri Route Maker

js/map/map.js
==========================================================
*/

let mapInstance = null;

const OSM_STYLE = {
    version: 8,
    sources: {
        "osm-tiles": {
            type: "raster",
            tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
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

export async function initializeMap() {
    console.log("Initializing Map Canvas...");

    return new Promise((resolve) => {
        try {
            if (typeof window.maplibregl === "undefined") {
                console.error("MapLibre GL library not loaded!");
                resolve(null);
                return;
            }

            mapInstance = new window.maplibregl.Map({
                container: "map",
                style: OSM_STYLE,
                center: [-92.5, 38.5], // Missouri center
                zoom: 6.5,
                attributionControl: false
            });

            mapInstance.addControl(new window.maplibregl.AttributionControl({ compact: true }), "bottom-right");

            mapInstance.on("load", () => {
                console.log("Map canvas loaded successfully.");
                mapInstance.resize();
                resolve(mapInstance);
            });

            // Force resize in case container dimensions finish rendering late
            setTimeout(() => {
                if (mapInstance) mapInstance.resize();
            }, 500);

        } catch (err) {
            console.error("Failed to initialize map:", err);
            resolve(null);
        }
    });
}

export function getMapInstance() {
    return mapInstance;
}
