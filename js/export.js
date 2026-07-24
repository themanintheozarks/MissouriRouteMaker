/*
==========================================================
Missouri Route Maker

export.js

Module 8: Data Export Engine & External Sharing
Exports Places & Routes to JSON, CSV, GPX, KML, and Shares via Web APIs.
==========================================================
*/

import { loadPlaces, loadRoutes } from "./database.js";

/**
 * Exports stored places or routes to the desired format and triggers a browser download.
 * @param {'places' | 'routes'} dataType 
 * @param {'json' | 'csv' | 'gpx' | 'kml'} format 
 */
export async function exportData(dataType = 'places', format = 'json') {
    const data = dataType === 'routes' ? await loadRoutes() : await loadPlaces();

    if (!data || data.length === 0) {
        alert(`No ${dataType} available to export.`);
        return;
    }

    let fileContent = '';
    let mimeType = 'text/plain';
    let extension = format;

    switch (format.toLowerCase()) {
        case 'json':
            fileContent = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            break;
        case 'csv':
            fileContent = dataType === 'routes' ? convertRoutesToCSV(data) : convertPlacesToCSV(data);
            mimeType = 'text/csv';
            break;
        case 'gpx':
            fileContent = convertPlacesToGPX(data);
            mimeType = 'application/gpx+xml';
            break;
        case 'kml':
            fileContent = convertPlacesToKML(data);
            mimeType = 'application/vnd.google-earth.kml+xml';
            break;
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }

    const fileName = `MissouriRouteMaker_${dataType}_${new Date().toISOString().slice(0, 10)}.${extension}`;
    downloadFile(fileContent, fileName, mimeType);
}

/*
==========================================================
Format Converters
==========================================================
*/

function convertPlacesToCSV(places) {
    const headers = ["ID", "Name", "Latitude", "Longitude", "Address", "Status", "Rating", "Categories", "Notes", "DateAdded"];
    const rows = places.map(p => [
        `"${p.id || ''}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        p.lat,
        p.lng,
        `"${(p.address || '').replace(/"/g, '""')}"`,
        `"${p.status || 'green'}"`,
        p.rating || 0,
        `"${(Array.isArray(p.categories) ? p.categories.join(';') : '').replace(/"/g, '""')}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
        `"${p.dateAdded || ''}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function convertRoutesToCSV(routes) {
    const headers = ["ID", "Name", "StopsCount", "DistanceMiles", "ETAMinutes", "Mode", "Notes"];
    const rows = routes.map(r => [
        `"${r.id || ''}"`,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        r.stops ? r.stops.length : 0,
        r.distanceMiles || 0,
        r.etaMinutes || 0,
        `"${r.mode || 'Fastest'}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function convertPlacesToGPX(places) {
    const waypoints = places.map(p => `
    <wpt lat="${p.lat}" lon="${p.lng}">
        <name>${escapeXML(p.name)}</name>
        <desc>${escapeXML(p.notes || '')}</desc>
        <sym>${p.status === 'blue' ? 'Waypoint' : 'Flag'}</sym>
    </wpt>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Missouri Route Maker" xmlns="http://www.topografix.com/GPX/1/1">
    <metadata>
        <name>Missouri Route Maker Places</name>
        <time>${new Date().toISOString()}</time>
    </metadata>
    ${waypoints}
</gpx>`;
}

function convertPlacesToKML(places) {
    const placemarks = places.map(p => `
        <Placemark>
            <name>${escapeXML(p.name)}</name>
            <description>${escapeXML(p.notes || '')}</description>
            <Point>
                <coordinates>${p.lng},${p.lat},0</coordinates>
            </Point>
        </Placemark>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>Missouri Route Maker Places</name>
        ${placemarks}
    </Document>
</kml>`;
}

/*
==========================================================
External App / Platform Sharing
==========================================================
*/

/**
 * Open external map app or platform share URL for a given place or coordinate
 */
export function shareToPlatform(platform, place) {
    if (!place || !place.lat || !place.lng) return;

    const lat = place.lat;
    const lng = place.lng;
    const label = encodeURIComponent(place.name || "Missouri Location");

    let shareUrl = "";

    switch (platform.toLowerCase()) {
        case "google_maps":
            shareUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            break;
        case "google_earth":
            shareUrl = `https://earth.google.com/web/search/${lat},${lng}`;
            break;
        case "openstreetmap":
            shareUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
            break;
        case "x":
            const tweetText = encodeURIComponent(`Exploring ${place.name} on Missouri Route Maker! 📍`);
            shareUrl = `https://x.com/intent/tweet?text=${tweetText}&url=https://www.google.com/maps/search/?api=1%26query=${lat},${lng}`;
            break;
        default:
            return;
    }

    window.open(shareUrl, "_blank");
}

/*
==========================================================
Utility Functions
==========================================================
*/

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeXML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
