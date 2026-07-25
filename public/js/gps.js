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
 * Initializes GPS module setup and event listeners matching index.html
 */
export function initializeGPS() {
    console.log("GPS Module Initializing...");

    const gpsBtn = document.getElementById("btn-gps");
    const statusEl = document.getElementById("gps-status");

    if (!gpsBtn) {
        console.warn("GPS button element (#btn-gps) not found in DOM.");
        return;
    }

    const toggleGPS = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (watchId === null) {
            startGpsTracking(statusEl, gpsBtn);
        } else {
            stopGpsTracking(statusEl, gpsBtn);
        }
    };

    gpsBtn.addEventListener("click", toggleGPS);
    gpsBtn.addEventListener("touchend", toggleGPS);

    console.log("GPS button event listeners attached.");
}

/**
 * Starts live GPS tracking and updates map position
 */
export function startGpsTracking(statusEl, gpsBtn) {
    if (!navigator.geolocation) {
        if (statusEl) statusEl.textContent = "GPS Unavail";
        alert("Geolocation is not supported by your browser.");
        return;
    }

    if (statusEl) statusEl.textContent = "Connecting...";

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`GPS Position: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`);

            if (statusEl) statusEl.textContent = `GPS On (${Math.round(accuracy)}m)`;
            if (gpsBtn) gpsBtn.classList.add("active");

            const map = getMapInstance();
            if (map) {
                updateUserMarker(map, longitude, latitude);
            }
        },
        (error) => {
            console.error("GPS Error:", error);
            if (statusEl) statusEl.textContent = "GPS Off";
            if (gpsBtn) gpsBtn.classList.remove("active");

            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission was denied. Please enable Location in your site settings.");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                alert("Location unavailable. Make sure location/GPS is toggled ON on your device.");
            } else {
                alert("GPS Error: " + error.message);
            }
            
            stopGpsTracking(statusEl, gpsBtn);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

/**
 * Stops live GPS tracking
 */
export function stopGpsTracking(statusEl, gpsBtn) {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (userMarker) {
        userMarker.remove();
        userMarker = null;
    }

    if (statusEl) statusEl.textContent = "GPS Off";
    if (gpsBtn) gpsBtn.classList.remove("active");
}

/**
 * Updates or creates the user's current location marker on the map
 */
function updateUserMarker(map, lng, lat) {
    if (!userMarker) {
        const el = document.createElement("div");
        el.className = "user-location-marker";

        userMarker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);

        map.flyTo({ center: [lng, lat], zoom: 14 });
    } else {
        userMarker.setLngLat([lng, lat]);
    }
}
