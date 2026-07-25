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
    console.log("GPS Module Initializing...");

    // Catch clicks anywhere on the document if the target mentions 'gps'
    document.addEventListener("click", (e) => {
        const target = e.target.closest("#btn-gps-toggle, #btn-gps, .gps-container, [data-action='gps']");
        if (target) {
            e.preventDefault();
            console.log("GPS Button Clicked!");
            
            if (watchId === null) {
                startGpsTracking();
            } else {
                stopGpsTracking();
            }
        }
    });

    console.log("Global GPS click listener successfully attached.");
}

/**
 * Starts live GPS tracking and updates map position
 */
export function startGpsTracking() {
    const statusEl = document.getElementById("gps-status");

    if (!navigator.geolocation) {
        if (statusEl) statusEl.textContent = "GPS Not Supported";
        alert("Geolocation is not supported by your browser.");
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
            console.error("GPS Error:", error);
            if (statusEl) statusEl.textContent = "GPS Denied";

            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission was denied. Enable location in site permissions.");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                alert("Location unavailable. Make sure GPS is ON.");
            } else {
                alert("GPS Error: " + error.message);
            }
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
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.backgroundColor = "#007aff";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid #ffffff";
        el.style.boxShadow = "0 0 10px rgba(0,122,255,0.6)";

        userMarker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);

        map.flyTo({ center: [lng, lat], zoom: 14 });
    } else {
        userMarker.setLngLat([lng, lat]);
    }
}
