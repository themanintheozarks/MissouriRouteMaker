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
