/*
==========================================================
Missouri Route Maker

js/places/markers.js

Module 5: Maplibre Pin Markers & Interactivity
==========================================================
*/

import { openPlaceEditor } from "./editor.js";

let currentMarkers = [];

/**
 * Renders all place markers onto the MapLibre map instance
 */
export function renderPlaceMarkers(map, places) {
    clearPlaceMarkers();

    if (!map || !places) return;

    places.forEach((place) => {
        if (!place.lng || !place.lat) return;

        // Create HTML Marker Element
        const el = document.createElement("div");
        el.className = `custom-marker status-${place.status || "green"}`;
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.border = "2px solid #ffffff";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        el.style.backgroundColor = place.status === "blue" ? "#2563eb" : "#16a34a";

        // Create MapLibre GL Marker
        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .addTo(map);

        // Click Handler: Open Editor Bottom Sheet
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            openPlaceEditor(place);
        });

        currentMarkers.push(marker);
    });
}

/**
 * Clears existing markers and re-renders given list
 */
export function refreshPlaceMarkers(map, places) {
    clearPlaceMarkers();
    renderPlaceMarkers(map, places);
}

/**
 * Clears all active pin markers from the map canvas
 */
export function clearPlaceMarkers() {
    currentMarkers.forEach((marker) => marker.remove());
    currentMarkers = [];
}
