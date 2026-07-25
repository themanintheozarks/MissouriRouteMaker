/*
==========================================================
Missouri Route Maker

js/gps.js

Module: GPS Geolocation & Location Tracking
==========================================================
*/

import { getMapInstance } from "./map/map.js";

let watchId = null;
let userMarker = null;

/**
 * Initializes GPS module setup and event listeners
 */
export function initializeGPS() {
    console.log("GPS Module Initialized.");
    const gpsBtn = document.getElementById("btn-gps-toggle");
    if (gpsBtn) {
        gpsBtn.addEventListener("click", () => {
            if (watchId === null) {
                startGpsTracking();
            } else {
                stopGpsTracking();
            }
        });
    }
}

/**
 * Starts live GPS tracking and updates map position
 */
export function startGpsTracking() {
    const statusEl = document.getElementById("gps-status");

    if (!navigator.geolocation) {
        if (statusEl) statusEl.textContent = "GPS Not Supported";
        console.error("Geolocation is not supported by this browser.");
        return;
    }

    if (statusEl) statusEl.textContent = "Connecting GPS...";

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`GPS Location: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`);

            if (statusEl) statusEl.textContent = `GPS Connected (${Math.round(accuracy)}m)`;

            const map = getMapInstance();
            if (map) {
                updateUserMarker(map, longitude, latitude);
            }
        },
        (error) => {
            console.error("GPS Error:", error.message);
            if (statusEl) statusEl.textContent = "GPS Error";
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Stops live GPS tracking
 */
export function stopGpsTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (userMarker) {
        userMarker.remove();
        userMarker = null;
    }

    const statusEl = document.getElementById("gps-status");
    if (statusEl) statusEl.textContent = "GPS Disconnected";
}

/**
 * Updates or creates the user's current location marker on the map
 */
function updateUserMarker(map, lng, lat) {
    if (!userMarker) {
        const el = document.createElement("div");
        el.className = "user-location-marker";
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.backgroundColor = "#007aff";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid #ffffff";
        el.style.boxShadow = "0 0 10px rgba(0,122,255,0.5)";

        userMarker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
    } else {
        userMarker.setLngLat([lng, lat]);
    }
}
