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

    // Find any element related to GPS (button, container, or icon)
    const gpsTargets = [
        document.getElementById("btn-gps-toggle"),
        document.getElementById("btn-gps"),
        document.getElementById("gps-status"),
        document.querySelector(".gps-container"),
        document.querySelector("[data-action='gps']")
    ].filter(Boolean); // Keep only elements that actually exist on the page

    if (gpsTargets.length === 0) {
        console.warn("GPS button element not found in HTML.");
        return;
    }

    const toggleGPS = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log("GPS Toggle Triggered");
        if (watchId === null) {
            startGpsTracking();
        } else {
            stopGpsTracking();
        }
    };

    // Attach click and touch events to all matched GPS elements
    gpsTargets.forEach((target) => {
        target.style.cursor = "pointer";
        target.addEventListener("click", toggleGPS);
        target.addEventListener("touchend", toggleGPS);
    });

    console.log("GPS event listeners successfully attached.");
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

    // Force browser to prompt for GPS location
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
                alert("Location permission was denied in your browser settings.");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                alert("Location unavailable. Make sure location/GPS is toggled ON in your device settings.");
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

        // Center map on user location
        map.flyTo({ center: [lng, lat], zoom: 14 });
    } else {
        userMarker.setLngLat([lng, lat]);
    }
}
