/*
==========================================================
Missouri Route Maker

map.js
==========================================================
*/

let map = null;

export function initializeMap() {

    map = new maplibregl.Map({

        container: "map",

        style: "https://tiles.openfreemap.org/styles/liberty",

        center: [-92.603760, 38.573936],

        zoom: 6

    });

    // Make the map available globally
    window.map = map;

    map.on("load", () => {

        console.log("Map Loaded");

        document.getElementById("gps-status").textContent = "Map Ready";

        document.getElementById("zoom-in").onclick = () => {

            map.zoomIn();

        };

        document.getElementById("zoom-out").onclick = () => {

            map.zoomOut();

        };

        document.getElementById("route-button").onclick = () => {

            alert("Route Planner coming in a future module.");

        };

    });

}

export function getMap() {

    return map;

}
