/*
==========================================================
Missouri Route Maker

markers.js

Marker Management
==========================================================
*/

const SOURCE_ID = "places-source";
const LAYER_ID = "places-circle-layer";
const HIGHLIGHT_LAYER_ID = "places-highlight-layer";

// Status Pin Colors (Per Project Spec)
const STATUS_COLORS = {
    green: "#22c55e",  // Unvisited
    blue: "#3b82f6",   // Visited
    orange: "#f97316", // Off Main Route
    red: "#ef4444"     // Not Accessible
};

let mapInstance = null;
let allPlaces = [];
let activeFilters = {
    green: true,
    blue: true,
    orange: true,
    red: true
};

/**
 * Initializes the GeoJSON source and circle rendering layers on the MapLibre map.
 * @param {Object} map - MapLibre GL JS map instance
 */
export function initializeMarkers(map) {
    mapInstance = map;

    if (!mapInstance.getSource(SOURCE_ID)) {
        mapInstance.addSource(SOURCE_ID, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: []
            }
        });
    }

    // Circular Pin Layer (WebGL Accelerated)
    if (!mapInstance.getLayer(LAYER_ID)) {
        mapInstance.addLayer({
            id: LAYER_ID,
            type: "circle",
            source: SOURCE_ID,
            paint: {
                "circle-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    5, 3,
                    10, 6,
                    15, 9
                ],
                "circle-color": [
                    "match",
                    ["get", "status"],
                    "green", STATUS_COLORS.green,
                    "blue", STATUS_COLORS.blue,
                    "orange", STATUS_COLORS.orange,
                    "red", STATUS_COLORS.red,
                    "#888888"
                ],
                "circle-stroke-width": 1.5,
                "circle-stroke-color": "#ffffff",
                "circle-opacity": 0.95
            }
        });
    }

    // Selected Pin Highlight Layer
    if (!mapInstance.getLayer(HIGHLIGHT_LAYER_ID)) {
        mapInstance.addLayer({
            id: HIGHLIGHT_LAYER_ID,
            type: "circle",
            source: SOURCE_ID,
            filter: ["==", ["get", "id"], ""],
            paint: {
                "circle-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    5, 6,
                    10, 10,
                    15, 14
                ],
                "circle-color": "transparent",
                "circle-stroke-width": 3,
                "circle-stroke-color": "#facc15" // Gold highlight ring
            }
        });
    }
}

/**
 * Renders all places onto the map.
 * @param {Array} places - List of place objects from IndexedDB
 */
export function renderAllMarkers(places = []) {
    allPlaces = places;

    if (!mapInstance || !mapInstance.getSource(SOURCE_ID)) return;

    const features = allPlaces
        .filter(place => activeFilters[place.status] !== false)
        .map(place => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [Number(place.lng), Number(place.lat)]
            },
            properties: {
                id: place.id,
                name: place.name,
                status: place.status,
                rating: place.rating || 0
            }
        }));

    mapInstance.getSource(SOURCE_ID).setData({
        type: "FeatureCollection",
        features: features
    });
}

/**
 * Draws or updates a single place marker dynamically.
 * @param {Object} place 
 */
export function drawPlaceMarker(place) {
    console.log("Marker Manager Updating:", place.name);

    const existingIndex = allPlaces.findIndex(p => p.id === place.id);
    if (existingIndex >= 0) {
        allPlaces[existingIndex] = place;
    } else {
        allPlaces.push(place);
    }

    renderAllMarkers(allPlaces);
}

/**
 * Updates color filter toggles for progressive pin visibility.
 * @param {Object} filterToggles - e.g., { green: true, blue: false, orange: true, red: true }
 */
export function setPinVisibility(filterToggles) {
    activeFilters = { ...activeFilters, ...filterToggles };
    renderAllMarkers(allPlaces);
}

/**
 * Highlights a pin on the map by ID.
 * @param {string|number} placeId 
 */
export function highlightMarker(placeId) {
    if (!mapInstance || !mapInstance.getLayer(HIGHLIGHT_LAYER_ID)) return;

    mapInstance.setFilter(
        HIGHLIGHT_LAYER_ID,
        ["==", ["get", "id"], placeId || ""]
    );
}
