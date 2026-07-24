/*
==========================================================
Missouri Route Maker

import.js

Module 4: File Import System
Parses JSON, CSV, GPX, and KML files with progress tracking.
==========================================================
*/

import { bulkImportPlaces, loadPlaces } from "./database.js";

/**
 * Main entry point for processing imported files.
 * @param {File} file - File object selected by user
 * @param {string} importOption - 'add_new' | 'replace_all'
 * @param {Function} onProgress - Callback function(percentage, statusText)
 */
export async function processImportFile(file, importOption = 'add_new', onProgress = null) {
    if (!file) throw new Error("No file provided for import.");

    const fileName = file.name.toLowerCase();
    const fileText = await file.text();

    let parsedPlaces = [];

    if (onProgress) onProgress(10, "Parsing file content...");

    // Format Detection & Parsing
    if (fileName.endsWith('.json')) {
        parsedPlaces = parseGoogleTakeoutJSON(fileText);
    } else if (fileName.endsWith('.csv')) {
        parsedPlaces = parseCSV(fileText);
    } else if (fileName.endsWith('.gpx')) {
        parsedPlaces = parseGPX(fileText);
    } else if (fileName.endsWith('.kml')) {
        parsedPlaces = parseKML(fileText);
    } else {
        throw new Error("Unsupported file format. Please upload JSON, CSV, GPX, or KML.");
    }

    if (!parsedPlaces.length) {
        throw new Error("No valid places found in file.");
    }

    if (onProgress) onProgress(40, `Found ${parsedPlaces.length} entries. Checking duplicates...`);

    // Duplicate Handling
    let finalPlacesToImport = parsedPlaces;

    if (importOption === 'add_new') {
        const existingPlaces = await loadPlaces();
        const existingSet = new Set(
            existingPlaces.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`)
        );

        finalPlacesToImport = parsedPlaces.filter(p => {
            const coordKey = `${Number(p.lat).toFixed(5)},${Number(p.lng).toFixed(5)}`;
            return !existingSet.has(coordKey);
        });
    }

    if (onProgress) onProgress(70, `Saving ${finalPlacesToImport.length} places to database...`);

    // Bulk insertion into IndexedDB
    await bulkImportPlaces(finalPlacesToImport);

    if (onProgress) onProgress(100, "Import complete!");

    return {
        totalParsed: parsedPlaces.length,
        importedCount: finalPlacesToImport.length
    };
}

/*
==========================================================
Parsers
==========================================================
*/

function parseGoogleTakeoutJSON(jsonText) {
    const data = JSON.parse(jsonText);
    const items = data.features || data.savedLocations || (Array.isArray(data) ? data : []);

    return items.map(item => {
        const coords = item.geometry?.coordinates || [item.longitude || item.lng, item.latitude || item.lat];
        const props = item.properties || item;

        return {
            id: crypto.randomUUID(),
            name: props.Title || props.name || props.Title || "Imported Place",
            lat: Number(coords[1] || props.latitude || props.lat),
            lng: Number(coords[0] || props.longitude || props.lng),
            address: props.address || props.Address || "",
            notes: props.Comment || props.notes || "",
            status: "green",
            rating: 0,
            categories: ["Imported"],
            dateAdded: new Date().toISOString()
        };
    }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));
}

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    const latIndex = headers.findIndex(h => h.includes('lat'));
    const lngIndex = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('title'));
    const notesIndex = headers.findIndex(h => h.includes('note') || h.includes('desc'));

    if (latIndex === -1 || lngIndex === -1) {
        throw new Error("CSV missing required 'latitude' or 'longitude' columns.");
    }

    const places = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (row.length <= Math.max(latIndex, lngIndex)) continue;

        const lat = parseFloat(row[latIndex]);
        const lng = parseFloat(row[lngIndex]);

        if (!isNaN(lat) && !isNaN(lng)) {
            places.push({
                id: crypto.randomUUID(),
                name: nameIndex !== -1 && row[nameIndex] ? row[nameIndex] : `Imported Place ${i}`,
                lat: lat,
                lng: lng,
                notes: notesIndex !== -1 && row[notesIndex] ? row[notesIndex] : "",
                status: "green",
                rating: 0,
                categories: ["Imported"],
                dateAdded: new Date().toISOString()
            });
        }
    }

    return places;
}

function parseGPX(gpxText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxText, "text/xml");
    const waypoints = xmlDoc.getElementsByTagName("wpt");
    const places = [];

    for (let wpt of waypoints) {
        const lat = parseFloat(wpt.getAttribute("lat"));
        const lng = parseFloat(wpt.getAttribute("lon"));
        const nameNode = wpt.getElementsByTagName("name")[0];
        const descNode = wpt.getElementsByTagName("desc")[0];

        if (!isNaN(lat) && !isNaN(lng)) {
            places.push({
                id: crypto.randomUUID(),
                name: nameNode ? nameNode.textContent : "Imported Waypoint",
                lat: lat,
                lng: lng,
                notes: descNode ? descNode.textContent : "",
                status: "green",
                rating: 0,
                categories: ["Imported"],
                dateAdded: new Date().toISOString()
            });
        }
    }

    return places;
}

function parseKML(kmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");
    const places = [];

    for (let pm of placemarks) {
        const nameNode = pm.getElementsByTagName("name")[0];
        const descNode = pm.getElementsByTagName("description")[0];
        const coordsNode = pm.getElementsByTagName("coordinates")[0];

        if (coordsNode) {
            const rawCoords = coordsNode.textContent.trim().split(/\s+/)[0];
            const parts = rawCoords.split(',');

            if (parts.length >= 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);

                if (!isNaN(lat) && !isNaN(lng)) {
                    places.push({
                        id: crypto.randomUUID(),
                        name: nameNode ? nameNode.textContent : "Imported Placemark",
                        lat: lat,
                        lng: lng,
                        notes: descNode ? descNode.textContent : "",
                        status: "green",
                        rating: 0,
                        categories: ["Imported"],
                        dateAdded: new Date().toISOString()
                    });
                }
            }
        }
    }

    return places;
}
