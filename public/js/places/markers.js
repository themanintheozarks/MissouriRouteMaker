import { openPlaceEditor } from './editor.js';

let currentMarkers = [];

export function clearPlaceMarkers() {
    currentMarkers.forEach(marker => marker.remove());
    currentMarkers = [];
}

export function renderPlaceMarkers(map, places = []) {
    clearPlaceMarkers();

    if (!map || !Array.isArray(places)) return;

    places.forEach(place => {
        if (!place.lng || !place.lat) return;

        const el = document.createElement('div');
        el.className = 'place-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = '#ff4757';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .addTo(map);

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof openPlaceEditor === 'function') {
                openPlaceEditor(place);
            }
        });
