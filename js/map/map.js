/*
==========================================================
Missouri Route Maker
Module 2
map.js

Initializes the MapLibre map.

Responsibilities:

- Create the map
- Load OpenStreetMap
- Export map instance

==========================================================
*/

let map = null;

/*
==========================================================
Map Style

Using OpenFreeMap's Liberty style.

This provides:

- OpenStreetMap
- No API key
- Free usage
- Vector tiles
==========================================================
*/

const MAP_STYLE =
    "https://tiles.openfreemap.org/styles/liberty";

/*
==========================================================
Initial View

Center of Missouri
==========================================================
*/

const MISSOURI_CENTER = {
    lng: -92.603760,
    lat: 38.573936
};

const DEFAULT_ZOOM = 6;

/*
==========================================================
Initialize Map
==========================================================
*/

export function initializeMap() {

    if (map) {
        return map;
    }

    map = new maplibregl.Map({

        container: "map",

        style: MAP_STYLE,

        center: [
            MISSOURI_CENTER.lng,
            MISSOURI_CENTER.lat
        ],

        zoom: DEFAULT_ZOOM,

        attributionControl: true,

        hash: false

    });

    /*
    ==========================================
    Navigation Control

    (Hidden later because we have our own
    buttons.)

    For now this helps testing.
    ==========================================
    */

    map.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
    );

    /*
    ==========================================
    Scale
    ==========================================
    */

    map.addControl(
        new maplibregl.ScaleControl({
            unit: "imperial"
        })
    );

    /*
    ==========================================
    Map Loaded
    ==========================================
    */

    map.on("load", () => {

        console.log(
            "Missouri Route Maker map initialized."
        );

    });

    return map;

}

/*
==========================================================
Getter
==========================================================
*/

export function getMap() {
    return map;
}
