/*
==========================================================
Missouri Route Maker
Module 2

map.js

Initializes the MapLibre map.
==========================================================
*/

let map = null;

const MISSOURI_CENTER = [-92.603760, 38.573936];
const DEFAULT_ZOOM = 6;

export function initializeMap() {

    if (map) {
        return map;
    }

    map = new maplibregl.Map({

        container: "map",

        style: "https://demotiles.maplibre.org/style.json",

        center: MISSOURI_CENTER,

        zoom: DEFAULT_ZOOM,

        attributionControl: true

    });

    map.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
    );

    map.on("load", () => {
        console.log("Map loaded successfully.");
    });

    map.on("error", (e) => {
        console.error("Map error:", e);
    });

    return map;
}

export function getMap() {
    return map;
}
