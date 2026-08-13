let currentMarkers = [];

export function clearPlaceMarkers() {
    currentMarkers.forEach(m => m.remove());
    currentMarkers = [];
}

export function renderPlaceMarkers(map, places = []) {
    clearPlaceMarkers();
}

export function refreshPlaceMarkers(map, places) {
    clearPlaceMarkers();
}
