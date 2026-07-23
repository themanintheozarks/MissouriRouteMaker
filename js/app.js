/*
==========================================================
Missouri Route Maker

app.js

Application Entry Point

==========================================================
*/

import { initializeMap } from "./map/map.js";
import { initializeGPS } from "./gps.js";
import { initializePlaces } from "./places.js";

/*
==========================================================
Initialize Application
==========================================================
*/

function initializeApplication() {

    console.log("Missouri Route Maker Starting...");

    initializeMap();

    /*
    ======================================================
    Wait until the map has finished loading before
    attaching GPS and Places.
    ======================================================
    */

    const map = window.map || null;

    if (map) {

        map.on("load", () => {

            initializeGPS();

            initializePlaces();

            console.log("Modules Initialized");

        });

    }

}

/*
==========================================================
Start
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
