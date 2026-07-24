/*
==========================================================
Missouri Route Maker

places.js

Place Orchestration & Pin Interactions
==========================================================
*/

import { getMap } from "./map/map.js";
import { loadPlaces, savePlace, deletePlace } from "./database.js";
import { 
    initializeMarkers, 
    renderAllMarkers, 
    highlightMarker 
} from "./markers.js";
import { PlaceEditor } from "./editor.js";

let editorInstance = null;
let activePopup = null;
let loadedPlaces = [];

/*
==========================================================
Initialize
==========================================================
*/

export async function initializePlaces() {
    const map = getMap();
    if (!map) return;

    // Initialize WebGL marker layer on the map
    initializeMarkers(map);

    // Initialize Place Editor UI (Bottom Sheet)
    editorInstance = new PlaceEditor(
        map, 
        handlePlaceSaved, 
        handlePlaceDeleted
    );

    // Map Click: Manual place creation
    map.on("click", handleMapClick);

    // Pin Click: Interactive small popup
    map.on("click", "places-circle-layer", handlePinClick);

    // Change cursor on pin hover
    map.on("mouseenter", "places-circle-layer", () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "places-circle-layer", () => {
        map.getCanvas().style.cursor = "";
    });

    // Load saved places from IndexedDB
    await restorePlaces();
}

/*
==========================================================
Restore Saved Places
==========================================================
*/

export async function restorePlaces() {
    const map = getMap();
    loadedPlaces = await loadPlaces();
    renderAllMarkers(map, loadedPlaces);
}

/*
==========================================================
Map Tap Handler (Manual Place Creation)
==========================================================
*/

function handleMapClick(event) {
    // If clicking directly on a pin, ignore map background tap
    const map = getMap();
    const features = map.queryRenderedFeatures(event.point, {
        layers: ["places-circle-layer"]
    });

    if (features.length > 0) return;

    // Close existing popups
    if (activePopup) {
        activePopup.remove();
        activePopup = null;
    }

    const newPlace = {
        id: crypto.randomUUID(),
        name: "New Place",
        lat: event.lngLat.lat,
        lng: event.lngLat.lng,
        status: "green",
        rating: 0,
        categories: [],
        notes: "",
        dateAdded: new Date().toISOString()
    };

    // Open Bottom Sheet Editor directly
    editorInstance.edit(newPlace);
}

/*
==========================================================
Pin Tap Handler (Small Interactive Popup)
==========================================================
*/

function handlePinClick(event) {
    event.originalEvent.stopPropagation();

    const feature = event.features[0];
    const placeId = feature.properties.id;
    const place = loadedPlaces.find(p => String(p.id) === String(placeId));

    if (!place) return;

    highlightMarker(placeId);

    // Close any previous popup
    if (activePopup) {
        activePopup.remove();
    }

    const map = getMap();

    // Popup HTML (Navigate, Add/Remove Route, Edit, More)
    const popupContent = document.createElement("div");
    popupContent.className = "place-popup-card";
    popupContent.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 6px; font-size: 1rem;">${place.name}</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
            <button id="popup-nav-btn" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">🧭 Navigate</button>
            <button id="popup-route-btn" style="background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 4px; cursor: pointer;">📍 Add to Route</button>
            <div style="display: flex; gap: 6px;">
                <button id="popup-edit-btn" style="flex: 1; background: #e5e7eb; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">Edit</button>
                <button id="popup-more-btn" style="flex: 1; background: #e5e7eb; border: none; padding: 6px; border-radius: 4px; cursor: pointer;">More</button>
            </div>
        </div>
    `;

    activePopup = new maplibregl.Popup({ closeButton: true, offset: 10 })
        .setLngLat([place.lng, place.lat])
        .setDOMContent(popupContent)
        .addTo(map);

    // Event Listeners for Popup Actions
    popupContent.querySelector("#popup-nav-btn").addEventListener("click", () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, "_blank");
    });

    popupContent.querySelector("#popup-route-btn").addEventListener("click", () => {
        console.log("Adding to current route:", place);
        // Will hook directly into Route Builder module
    });

    popupContent.querySelector("#popup-edit-btn").addEventListener("click", () => {
        if (activePopup) activePopup.remove();
        editorInstance.edit(place);
    });

    popupContent.querySelector("#popup-more-btn").addEventListener("click", () => {
        if (activePopup) activePopup.remove();
        editorInstance.edit(place); // Opens full Bottom Sheet
    });

    activePopup.on("close", () => {
        highlightMarker(null);
    });
}

/*
==========================================================
Callbacks from Editor
==========================================================
*/

async function handlePlaceSaved(savedPlace) {
    const existingIndex = loadedPlaces.findIndex(p => p.id === savedPlace.id);
    if (existingIndex >= 0) {
        loadedPlaces[existingIndex] = savedPlace;
    } else {
        loadedPlaces.push(savedPlace);
    }

    const map = getMap();
    renderAllMarkers(map, loadedPlaces);
}

async function handlePlaceDeleted(placeId) {
    loadedPlaces = loadedPlaces.filter(p => p.id !== placeId);
    
    const map = getMap();
    renderAllMarkers(map, loadedPlaces);

    if (activePopup) {
        activePopup.remove();
        activePopup = null;
    }
}
