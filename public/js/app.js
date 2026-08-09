import { initDB } from './db.js';
import { initMap, addMarkerToMap, clearMarkers, setMapTheme, toggleLayer } from './map.js';
import { initGPS, startTracking, stopTracking } from './gps.js';
import { renderPlacesList, renderCategories, openEditorModal } from './editor.js';
import { initArrivalDetector } from './arrival.js';
import { handleTakeoutImport, handleGPXImport } from './import.js';
import { exportToGPX, exportToJSON } from './export.js';

let places = [];
let routes = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await initMap('map-container');
        await initGPS();
        initArrivalDetector();
        
        await reloadData();
        setupEventListeners();
        console.log("App initialized successfully.");
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

async function reloadData() {
    // Refresh UI lists and map pins from DB state
    await renderPlacesList();
    await renderCategories();
}

function setupEventListeners() {
    // Add Place Button
    const addPlaceBtn = document.getElementById('btn-add-place');
    if (addPlaceBtn) {
        addPlaceBtn.addEventListener('click', () => openEditorModal());
    }

    // Toggle GPS Tracking
    const gpsToggleBtn = document.getElementById('btn-toggle-gps');
    if (gpsToggleBtn) {
        let tracking = false;
        gpsToggleBtn.addEventListener('click', () => {
            tracking = !tracking;
            if (tracking) {
                startTracking();
                gpsToggleBtn.classList.add('active');
            } else {
                stopTracking();
                gpsToggleBtn.classList.remove('active');
            }
        });
    }

    // Import Handler
    const importInput = document.getElementById('file-import-input');
    if (importInput) {
        importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.name.endsWith('.json')) {
                await handleTakeoutImport(file);
            } else if (file.name.endsWith('.gpx')) {
                await handleGPXImport(file);
            }
            await reloadData();
        });
    }

    // Export Handlers
    const exportGpxBtn = document.getElementById('btn-export-gpx');
    if (exportGpxBtn) {
        exportGpxBtn.addEventListener('click', () => exportToGPX());
    }

    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => exportToJSON());
    }

    // Theme Switcher
    const themeSelect = document.getElementById('select-theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            setMapTheme(e.target.value);
        });
    }
}
