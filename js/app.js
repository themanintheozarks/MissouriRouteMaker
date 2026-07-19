import { initializeMap } from "./map/map.js";

document.addEventListener("DOMContentLoaded", () => {

    const gpsStatus = document.getElementById("gps-status");

    gpsStatus.textContent = "JavaScript Started";

    try {

        initializeMap();

        gpsStatus.textContent = "Map Initialized";

    } catch (error) {

        gpsStatus.textContent = "ERROR: " + error.message;

    }

});
