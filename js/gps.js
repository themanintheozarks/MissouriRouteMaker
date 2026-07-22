/*
==========================================================
Missouri Route Maker

gps.js

Live GPS Module
==========================================================
*/

import { getMap } from "./map/map.js";

let userMarker = null;
let watchId = null;
let following = false;

export function initializeGPS() {

    const gpsButton = document.getElementById("gps-button");

    if (!gpsButton) return;

    gpsButton.onclick = toggleFollowMe;

}

function toggleFollowMe() {

    if (following) {

        stopFollowing();
        return;

    }

    startFollowing();

}

function startFollowing() {

    if (!navigator.geolocation) {

        updateStatus("GPS Unsupported");
        return;

    }

    updateStatus("Connecting...");

    watchId = navigator.geolocation.watchPosition(

        locationSuccess,

        locationError,

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

    following = true;

}

function stopFollowing() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(watchId);

    }

    following = false;

    updateStatus("GPS Stopped");

}

function locationSuccess(position) {

    const map = getMap();

    if (!map) return;

    const lng = position.coords.longitude;
    const lat = position.coords.latitude;

    map.flyTo({

        center: [lng, lat],

        zoom: 16,
        essential: true

    });

    if (!userMarker) {

        userMarker = new maplibregl.Marker({

            color: "#2563eb"

        })

        .setLngLat([lng, lat])

        .addTo(map);

    } else {

        userMarker.setLngLat([lng, lat]);

    }

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
