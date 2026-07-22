/*
==========================================================
Missouri Route Maker

app.js

Application Entry Point

==========================================================
*/

import { initializeMap } from "./map/map.js";
import { initializeGPS } from "./gps.js";

/*
==========================================================
Initialize Application
==========================================================
*/

function initializeApplication() {

    console.log("Missouri Route Maker Starting...");

    initializeMap();

    initializeGPS();

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
