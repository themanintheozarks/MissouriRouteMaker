/*
==========================================================
Missouri Route Maker

gps.js

Live GPS & Arrival Detection Engine
==========================================================
*/

import { getMap } from "./map/map.js";
import { getSetting, savePlace, loadPlaces } from "./database.js";
import { renderAllMarkers } from "./places/markers.js";

let userMarker = null;
let watchId = null;
let following = false;

// Arrival Detection State
let arrivalRadiusFeet = 200; // Default per spec
let arrivalChimeEnabled = true;
let arrivalPopupEnabled = true;
let snoozeMap = new Map(); // Tracks 15-second snoozed places
let activeArrivalPopup = null;

export async function initializeGPS() {
    const gpsButton = document.getElementById("gps-button");
    if (gpsButton) {
        gpsButton.onclick = toggleFollowMe;
    }

    // Load arrival settings from IndexedDB
    arrivalRadiusFeet = await getSetting("arrivalRadiusFeet", 200);
    arrivalChimeEnabled = await getSetting("arrivalChime", true);
    arrivalPopupEnabled = await getSetting("arrivalPopup", true);
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

async function locationSuccess(position) {
    const map = getMap();
    if (!map) return;

    const lng = position.coords.longitude;
    const lat = position.coords.latitude;

    if (following) {
        map.flyTo({
            center: [lng, lat],
            zoom: 16,
            essential: true
        });
    }

    if (!userMarker) {
        // Distinct GPS Location Dot
        const el = document.createElement("div");
        el.className = "user-gps-dot";
        el.style.width = "18px";
        el.style.height = "18px";
        el.style.backgroundColor = "#2563eb";
        el.style.border = "3px solid #ffffff";
        el.style.borderRadius = "50%";
        el.style.boxShadow = "0 0 10px rgba(37, 99, 235, 0.6)";

        userMarker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
    } else {
        userMarker.setLngLat([lng, lat]);
    }

    updateStatus("GPS Connected");

    // Run Arrival Radius Check against saved places
    await checkArrivalProximity(lat, lng);
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

/*
==========================================================
Arrival Detection & Distance Engine
==========================================================
*/

/**
 * Calculates distance in feet between two lat/lng coordinates (Haversine)
 */
function calculateDistanceFeet(lat1, lon1, lat2, lon2) {
    const R = 20902231; // Radius of Earth in feet
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Checks if current GPS coordinates are within arrival radius of any unvisited green pins.
 */
async function checkArrivalProximity(userLat, userLng) {
    const places = await loadPlaces();
    const now = Date.now();

    // Filter to active unvisited green places
    const greenPlaces = places.filter(p => p.status === "green");

    for (const place of greenPlaces) {
        const distanceFeet = calculateDistanceFeet(userLat, userLng, place.lat, place.lng);

        if (distanceFeet <= arrivalRadiusFeet) {
            // Check if 15-second snooze is active
            const snoozedUntil = snoozeMap.get(place.id) || 0;
            if (now < snoozedUntil) continue;

            triggerArrivalEvent(place);
            break; // Handle one place trigger per tick
        }
    }
}

/**
 * Plays Web Audio API synthesised chime and shows decision popup
 */
function triggerArrivalEvent(place) {
    if (arrivalChimeEnabled) {
        playArrivalChime();
    }

    if (arrivalPopupEnabled) {
        showArrivalPopup(place);
    }
}

/**
 * Native audio synthesizer chime sound
 */
function playArrivalChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
        console.warn("Audio Context playback prevented:", e);
    }
}

/**
 * Displays arrival confirmation overlay per project specs
 */
function showArrivalPopup(place) {
    if (activeArrivalPopup) {
        activeArrivalPopup.remove();
    }

    const overlay = document.createElement("div");
    overlay.id = "arrival-popup-card";
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 3000;
        text-align: center;
        width: 85%;
        max-width: 360px;
        border: 2px solid #22c55e;
    `;

    overlay.innerHTML = `
        <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 4px;">Arrived at ${place.name}!</div>
        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 12px;">Mark this location as visited?</div>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="arrival-yes-btn" style="background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; flex: 1;">Yes</button>
            <button id="arrival-skip-btn" style="background: #e5e7eb; color: #374151; border: none; padding: 10px 14px; border-radius: 6px; cursor: pointer; flex: 1;">Skip 15 Secs</button>
        </div>
    `;

    document.body.appendChild(overlay);
    activeArrivalPopup = overlay;

    // Rule: ONLY pressing "Yes" changes Green pin to Blue
    document.getElementById("arrival-yes-btn").onclick = async () => {
        place.status = "blue"; // Green -> Blue
        await savePlace(place);

        const map = getMap();
        const allPlaces = await loadPlaces();
        renderAllMarkers(map, allPlaces);

        overlay.remove();
        activeArrivalPopup = null;
    };

    // Skip 15 Seconds: Snoozes alert for 15,000 ms
    document.getElementById("arrival-skip-btn").onclick = () => {
        snoozeMap.set(place.id, Date.now() + 15000);
        overlay.remove();
        activeArrivalPopup = null;
    };
}
