/*
==========================================================
Missouri Route Maker

map.js

Map Module
==========================================================
*/

let map = null;

const MAP_STYLE =
    "https://tiles.openfreemap.org/styles/liberty";

const MISSOURI_CENTER = [
    -92.603760,
    38.573936
];

const DEFAULT_ZOOM = 6;

export function initializeMap() {

    if (map) {
        return map;
    }

    map = new maplibregl.Map({

        container: "map",

        style: MAP_STYLE,

        center: MISSOURI_CENTER,

        zoom: DEFAULT_ZOOM,

        attributionControl: true

    });

    // Keep only the scale bar.
    map.addControl(
        new maplibregl.ScaleControl({
            unit: "imperial"
        }),
        "bottom-right"
    );

    map.on("load", () => {

        console.log("Map Loaded");

        const gpsStatus =
            document.getElementById("gps-status");

        if (gpsStatus) {
            gpsStatus.textContent = "Map Loaded";
        }

    });

    return map;

}

export function getMap() {
    return map;
}
