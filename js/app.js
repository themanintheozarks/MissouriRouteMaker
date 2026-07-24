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
import { initializeDatabase } from "./database.js";

/*
==========================================================
Initialize Application
==========================================================
*/

async function initializeApplication() {

    console.log("Missouri Route Maker Starting...");

    initializeMap();

    window.map.on("load", async () => {

        await initializeDatabase();

        initializeGPS();

        await initializePlaces();

        console.log("Application Ready");

    });

}

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);
