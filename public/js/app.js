   import { db } from './database.js';
import { mapManager } from './map/map.js';
import { gpsService } from './gps.js';
import { placeEditor } from './places/editor.js';
import { arrivalDetector } from './arrival.js';
import { importService } from './import.js';
import { exportService } from './export.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (mapManager && typeof mapManager.init === 'function') {
            await mapManager.init('map');
        }

        if (gpsService && typeof gpsService.init === 'function') {
            gpsService.init(mapManager?.map);
        }

        if (arrivalDetector && typeof arrivalDetector.init === 'function') {
            arrivalDetector.init();
        }

        setupEventListeners();
        console.log("Missouri Route Maker initialized successfully.");
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

function setupEventListeners() {
    const gpsBtn = document.getElementById('btn-gps');
    const gpsStatus = document.getElementById('gps-status');
    if (gpsBtn) {
        let tracking = false;
        gpsBtn.addEventListener('click', () => {
            tracking = !tracking;
            if (tracking) {
                if (gpsService?.startTracking) gpsService.startTracking();
                if (gpsService?.setFollowMe) gpsService.setFollowMe(true);
                gpsBtn.classList.add('active');
                if (gpsStatus) gpsStatus.textContent = 'GPS On';
            } else {
                if (gpsService?.stopTracking) gpsService.stopTracking();
                if (gpsService?.setFollowMe) gpsService.setFollowMe(false);
                gpsBtn.classList.remove('active');
                if (gpsStatus) gpsStatus.textContent = 'GPS Off';
            }
        });
    }

    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function openModal(title, contentHtml) {
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = contentHtml;
        if (modalOverlay) modalOverlay.classList.remove('overlay-hidden');
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.classList.add('overlay-hidden');
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    const routeBtn = document.getElementById('btn-route');
    if (routeBtn) {
        routeBtn.addEventListener('click', () => {
            openModal('Route Builder', '<p>Route builder controls and stops list.</p>');
        });
    }

    const placesBtn = document.getElementById('btn-places');
    if (placesBtn) {
        placesBtn.addEventListener('click', () => {
            openModal('Places Log', '<p>Saved places and points of interest.</p>');
        });
    }

    const importBtn = document.getElementById('btn-import');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            openModal('Import Data', `
                <div class="import-panel">
                    <label for="file-import-input" style="display:block; margin-bottom:10px;">Select GPX or JSON file:</label>
                    <input type="file" id="file-import-input" accept=".gpx,.json">
                </div>
            `);

            setTimeout(() => {
                const importInput = document.getElementById('file-import-input');
                if (importInput) {
                    importInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                            if (importService?.processImportFile) {
                                await importService.processImportFile(file, 'add_new');
                                if (mapManager?.loadAndRenderPlaces) await mapManager.loadAndRenderPlaces();
                                alert('Import completed successfully!');
                                closeModal();
                            }
                        } catch (err) {
                            alert(`Import failed: ${err.message}`);
                        }
                    });
                }
            }, 100);
        });
    }

    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openModal('Settings', '<p>App preferences, map layer toggles, and data controls.</p>');
        });
    }
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
