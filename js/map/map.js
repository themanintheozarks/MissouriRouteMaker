/*
==========================================================
Missouri Route Maker

map.js

Map Module
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

        const status = document.getElementById("gps-status");

        if (status) {

            status.textContent = "Map Loaded";

        }

    });

    initializeButtons();

}

function initializeButtons() {

    const zoomIn = document.getElementById("zoom-in");

    const zoomOut = document.getElementById("zoom-out");

    if (zoomIn) {

        zoomIn.onclick = () => map.zoomIn();

    }

    if (zoomOut) {

        zoomOut.onclick = () => map.zoomOut();

    }

}

export function getMap() {

    return map;

}
