/*
==========================================================
Missouri Route Maker

js/places/places.js

Module 4: Saved Places Engine & State Management
==========================================================
*/

import { loadPlaces, savePlace, deletePlace } from "../database.js";
import { getMapInstance } from "../map/map.js";
import { renderPlaceMarkers, refreshPlaceMarkers } from "./markers.js";
import { openPlaceEditor, closePlaceEditor } from "./editor.js";

let placesCache = [];

/**
 * Initializes the places module, loads stored entries, and mounts markers
 */
export async function initializePlaces() {
    console.log("Initializing Places Engine...");
    
    try {
        placesCache = await loadPlaces();
        const map = getMapInstance();
        
        if (map) {
            renderPlaceMarkers(map, placesCache);
        }
        
        console.log(`Loaded ${placesCache.length} saved places.`);
    } catch (err) {
        console.error("Failed to initialize places:", err);
    }
}

/**
 * Gets local cache of saved places
 */
export function getCachedPlaces() {
    return placesCache;
}

/**
 * Adds or updates a place entry
 */
export async function handleSavePlace(placeData) {
    await savePlace(placeData);
    placesCache = await loadPlaces();
    
    const map = getMapInstance();
    if (map) {
        refreshPlaceMarkers(map, placesCache);
    }
    
    closePlaceEditor();
}

/**
 * Removes a place entry by ID
 */
export async function handleDeletePlace(placeId) {
    await deletePlace(placeId);
    placesCache = await loadPlaces();
    
    const map = getMapInstance();
    if (map) {
        refreshPlaceMarkers(map, placesCache);
    }
    
    closePlaceEditor();
}
