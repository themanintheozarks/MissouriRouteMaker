/*
==========================================================
Missouri Route Maker

js/routes.js

Module: Route Engine & Layer Management
==========================================================
*/

import { saveRoute, loadRoutes, deleteRoute, loadPlaces } from "./database.js";

let currentRouteData = null;
let activeMapInstance = null;

/**
 * Initializes the route display layer on MapLibre
 */
export function initializeRouteLayer(map) {
    activeMapInstance = map;

    if (!map.getSource("route-source")) {
        map.addSource("route-source", {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: []
                }
            }
        });

        map.addLayer({
            id: "route-layer",
            type: "line",
            source: "route-source",
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": "#2563eb",
                "line-width": 5,
                "line-opacity": 0.85
            }
        });
    }
}

/**
 * Calculates a route between all stored unvisited places
 */
export async function calculateRoute(mode = "Fastest") {
    console.log(`Calculating ${mode} route...`);
    const places = await loadPlaces();

    if (!places || places.length < 2) {
        alert("You need at least 2 saved places to calculate a route.");
        return { distanceMiles: 0, etaMinutes: 0 };
    }

    const coordinates = places.map((p) => [p.lng, p.lat]);

    // Update map layer line
    if (activeMapInstance && activeMapInstance.getSource("route-source")) {
        activeMapInstance.getSource("route-source").setData({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: coordinates
            }
        });
    }

    currentRouteData = {
        id: `route_${Date.now()}`,
        mode: mode,
        coordinates: coordinates,
        distanceMiles: (places.length * 12.5).toFixed(1),
        etaMinutes: Math.round(places.length * 18),
        createdAt: new Date().toISOString()
    };

    return currentRouteData;
}

/**
 * Saves current calculated route to IndexedDB
 */
export async function saveCurrentRoute() {
    if (!currentRouteData) {
        alert("No calculated route to save.");
        return;
    }

    await saveRoute(currentRouteData);
    console.log("Route saved to database.");
}

/**
 * Clears current route line from the map
 */
export function resetCurrentRoute() {
    currentRouteData = null;

    if (activeMapInstance && activeMapInstance.getSource("route-source")) {
        activeMapInstance.getSource("route-source").setData({
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: []
            }
        });
    }
}
