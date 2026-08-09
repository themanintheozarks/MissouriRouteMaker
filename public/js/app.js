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
