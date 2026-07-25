/*
==========================================================
Missouri Route Maker

js/import.js

Module: Import Data Parsing & Processing
==========================================================
*/

import { bulkImportPlaces } from "./database.js";

/**
 * Processes uploaded CSV or JSON file containing place data
 */
export async function processImportFile(file, importOption = "add_new", onProgress) {
    if (!file) throw new Error("No file selected.");

    const text = await file.text();
    let placesToImport = [];

    if (file.name.endsWith(".json")) {
        const data = JSON.parse(text);
        placesToImport = Array.isArray(data) ? data : data.places || [];
    } else if (file.name.endsWith(".csv")) {
        placesToImport = parseCSV(text);
    } else {
        throw new Error("Unsupported file format. Please upload JSON or CSV.");
    }

    if (onProgress) onProgress(50, "Saving places to IndexedDB...");

    const importedCount = await bulkImportPlaces(placesToImport, importOption);

    if (onProgress) onProgress(100, "Import Complete!");

    return {
        totalParsed: placesToImport.length,
        importedCount: importedCount
    };
}

/**
 * Basic CSV Parser helper
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const places = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx];
        });

        places.push({
            id: row.id || `imported_${Date.now()}_${i}`,
            name: row.name || `Place ${i}`,
            lng: parseFloat(row.lng || row.longitude || 0),
            lat: parseFloat(row.lat || row.latitude || 0),
            status: row.status || "green",
            notes: row.notes || ""
        });
    }

    return places;
}
