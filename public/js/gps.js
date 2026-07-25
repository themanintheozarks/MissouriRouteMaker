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
 * Initializes GPS module setup and event listeners for both Mouse & Touch
 */
export function initializeGPS() {
    console.log("GPS Module Initialized.");

    // Select either the button or the wrapper header container
    const gpsBtn = document.getElementById("btn-gps-toggle") || document.querySelector(".gps-container");

    if (gpsBtn) {
        const handleGpsTrigger = (e) => {
            if (e) e.preventDefault();

            if (watchId === null) {
                startGpsTracking();
            } else {
                stopGpsTracking();
            }
        };

        // Listen for both desktop clicks and mobile touch taps
        gpsBtn.addEventListener("click", handleGpsTrigger);
        gpsBtn.addEventListener("touchstart", handleGpsTrigger, { passive: false });
    }
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

    // Request high-accuracy user location directly
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
            if (statusEl) statusEl.textContent = "GPS Access Denied";

            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission was denied. Please allow Location access in your mobile browser site settings.");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                alert("Location unavailable. Make sure your phone's GPS / Location toggle is enabled.");
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

        // Center map on user location first time it connects
        map.flyTo({ center: [lng, lat], zoom: 14 });
    } else {
        userMarker.setLngLat([lng, lat]);
    }
}
