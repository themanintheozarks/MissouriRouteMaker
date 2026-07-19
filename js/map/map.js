/*
==========================================================
Missouri Route Maker

map.js
==========================================================
*/

let map;

export function initializeMap() {

    map = new maplibregl.Map({

        container: "map",

        style: "https://tiles.openfreemap.org/styles/liberty",

        center: [-92.603760, 38.573936],

        zoom: 6

    });

    map.on("load", () => {

        console.log("Map Loaded");

        document.getElementById("gps-status").textContent = "Map Loaded";

        // Wire our custom buttons AFTER the map exists

        document.getElementById("zoom-in").onclick = () => {

            map.zoomIn();

        };

        document.getElementById("zoom-out").onclick = () => {

            map.zoomOut();

        };

        document.getElementById("gps-button").onclick = () => {

            alert("GPS button coming next.");

        };

        document.getElementById("route-button").onclick = () => {

            alert("Route Planner coming next.");

        };

    });

}

export function getMap() {

    return map;

}
