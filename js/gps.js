/*
==========================================================
Missouri Route Maker

gps.js

GPS Module

Responsibilities

- Request GPS permission
- Get current location
- Center map
- Show current location marker

==========================================================
*/

import { getMap } from "./map/map.js";

let userMarker = null;

export function initializeGPS() {

    const gpsButton = document.getElementById("gps-button");

    if (!gpsButton) {
        return;
    }

    gpsButton.onclick = requestLocation;

}

function requestLocation() {

    if (!navigator.geolocation) {

        updateStatus("GPS Unsupported");

        return;

    }

    updateStatus("Locating...");

    navigator.geolocation.getCurrentPosition(

        locationSuccess,

        locationError,

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}

function locationSuccess(position) {

    const map = getMap();

    if (!map) return;

    const lng = position.coords.longitude;

    const lat = position.coords.latitude;

    map.flyTo({

        center: [lng, lat],

        zoom: 15,

        essential: true

    });

    if (userMarker) {

        userMarker.remove();

    }

    userMarker = new maplibregl.Marker({

        color: "#2563eb"

    })

    .setLngLat([lng, lat])

    .addTo(map);

    updateStatus("GPS Connected");

}

function locationError(error) {

    switch (error.code) {

        case error.PERMISSION_DENIED:

            updateStatus("Permission Denied");

            break;

        case error.POSITION_UNAVAILABLE:

            updateStatus("Location Unavailable");

            break;

        case error.TIMEOUT:

            updateStatus("GPS Timeout");

            break;

        default:

            updateStatus("GPS Error");

    }

}

function updateStatus(text) {

    const status = document.getElementById("gps-status");

    if (status) {

        status.textContent = text;

    }

}
