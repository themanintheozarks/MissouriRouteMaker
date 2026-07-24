/*
==========================================================
Missouri Route Maker

js/routes.js

Module 6: Route Builder Engine & OSRM Integration
==========================================================
*/

import { getMap } from "./map/map.js";
import { saveRoute, loadRoutes, deleteRoute } from "./database.js";

const ROUTE_SOURCE_ID = "active-route-source";
const ROUTE_LAYER_ID = "active-route-layer";

let currentRoute = {
    id: null,
    name: "New Route",
    stops: [], // Array of Place objects in stop order
    distanceMiles: 0,
    etaMinutes: 0,
    mode: "Fastest", // 'Fastest' | 'Shortest' | 'Scenic' | 'Avoid Highways' | 'Round Trip' | 'One Way'
    notes: ""
};

/**
 * Initializes route geometry layers on MapLibre
 */
export function initializeRouteLayer(map) {
    if (!map) return;

    if (!map.getSource(ROUTE_SOURCE_ID)) {
        map.addSource(ROUTE_SOURCE_ID, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: []
            }
        });
    }

    if (!map.getLayer(ROUTE_LAYER_ID)) {
        map.addLayer({
            id: ROUTE_LAYER_ID,
            type: "line",
            source: ROUTE_SOURCE_ID,
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": "#2563eb",
                "line-width": 5,
                "line-opacity": 0.8
            }
        });
    }
}

/**
 * Adds a place as a stop to the current working route
 * @param {Object} place 
 */
export function addStopToRoute(place) {
    if (!place) return;

    // Avoid duplicate stops in succession
    const lastStop = currentRoute.stops[currentRoute.stops.length - 1];
    if (lastStop && lastStop.id === place.id) return;

    currentRoute.stops.push(place);
    console.log(`Added stop: ${place.name} (Total: ${currentRoute.stops.length})`);
}

/**
 * Removes a stop from the route by index
 * @param {number} index 
 */
export function removeStopFromRoute(index) {
    if (index >= 0 && index < currentRoute.stops.length) {
        currentRoute.stops.splice(index, 1);
    }
}

/**
 * Reorders stops manually
 * @param {number} fromIndex 
 * @param {number} toIndex 
 */
export function reorderStops(fromIndex, toIndex) {
    const [moved] = currentRoute.stops.splice(fromIndex, 1);
    currentRoute.stops.splice(toIndex, 0, moved);
}

/**
 * Calculates route geometric polyline and metadata using OSRM Routing API
 * @param {string} optimizationMode - Mode selected by user
 */
export async function calculateRoute(optimizationMode = "Fastest") {
    if (currentRoute.stops.length < 2) {
        clearRouteLayer();
        return currentRoute;
    }

    currentRoute.mode = optimizationMode;

    // Handle Round Trip
    let calculationStops = [...currentRoute.stops];
    if (optimizationMode === "Round Trip") {
        calculationStops.push(currentRoute.stops[0]);
    }

    // Format coordinates for OSRM (lng,lat;lng,lat)
    const coordinatesString = calculationStops
        .map(stop => `${stop.lng},${stop.lat}`)
        .join(";");

    let osrmProfile = "driving";
    let extraParams = "geometries=geojson&overview=full";

    // OSRM Public Endpoint (Offline fallback geometry can be added via Turf/turf-line-slice)
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordinatesString}?${extraParams}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === "Ok" && data.routes.length > 0) {
            const osrmRoute = data.routes[0];

            // Convert meters to miles, seconds to minutes
            currentRoute.distanceMiles = (osrmRoute.distance * 0.000621371).toFixed(1);
            currentRoute.etaMinutes = Math.round(osrmRoute.duration / 60);

            // Draw line on map
            renderRouteLine(osrmRoute.geometry);
        } else {
            console.warn("OSRM Route calculation returned no valid paths.");
        }
    } catch (error) {
        console.error("Failed to calculate OSRM route:", error);
        // Fallback: Straight line polyline between stops
        renderFallbackLine(calculationStops);
    }

    return currentRoute;
}

/**
 * Draws GeoJSON polyline on the map
 */
function renderRouteLine(geojsonGeometry) {
    const map = getMap();
    if (!map || !map.getSource(ROUTE_SOURCE_ID)) return;

    map.getSource(ROUTE_SOURCE_ID).setData({
        type: "Feature",
        properties: {},
        geometry: geojsonGeometry
    });
}

/**
 * Fallback straight line polyline renderer if offline/no OSRM response
 */
function renderFallbackLine(stops) {
    const map = getMap();
    if (!map || !map.getSource(ROUTE_SOURCE_ID)) return;

    const coordinates = stops.map(s => [s.lng, s.lat]);

    map.getSource(ROUTE_SOURCE_ID).setData({
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: coordinates
        }
    });
}

/**
 * Clears active route line from map
 */
export function clearRouteLayer() {
    const map = getMap();
    if (!map || !map.getSource(ROUTE_SOURCE_ID)) return;

    map.getSource(ROUTE_SOURCE_ID).setData({
        type: "FeatureCollection",
        features: []
    });
}

/**
 * Saves current active route directly to IndexedDB
 */
export async function saveCurrentRoute() {
    if (!currentRoute.id) {
        currentRoute.id = crypto.randomUUID();
    }

    const savedRecord = await saveRoute(currentRoute);
    console.log("Route saved to IndexedDB:", savedRecord);
    return savedRecord;
}

/**
 * Resets active route builder state
 */
export function resetCurrentRoute() {
    currentRoute = {
        id: null,
        name: "New Route",
        stops: [],
        distanceMiles: 0,
        etaMinutes: 0,
        mode: "Fastest",
        notes: ""
    };
    clearRouteLayer();
}
