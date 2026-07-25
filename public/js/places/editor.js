/*
==========================================================
Missouri Route Maker

js/places/editor.js

Module 6: Place Details Editor & Bottom Sheet Interface
==========================================================
*/

import { handleSavePlace, handleDeletePlace } from "./places.js";

/**
 * Opens the Bottom Sheet Editor pre-filled with place details
 */
export function openPlaceEditor(place = {}) {
    const sheetEl = document.getElementById("bottom-sheet");
    const contentEl = document.getElementById("bottom-sheet-content");

    if (!sheetEl || !contentEl) return;

    const isNew = !place.id;
    const placeId = place.id || `place_${Date.now()}`;

    contentEl.innerHTML = `
        <div class="editor-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3>${isNew ? "Add New Place" : "Edit Place"}</h3>
            <button id="close-editor-btn" class="close-btn" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
        </div>
        <form id="place-editor-form">
            <input type="hidden" id="edit-place-id" value="${placeId}">
            <input type="hidden" id="edit-place-lng" value="${place.lng || 0}">
            <input type="hidden" id="edit-place-lat" value="${place.lat || 0}">

            <div class="form-group" style="margin-bottom: 10px;">
                <label for="edit-place-name" style="display:block; font-size:0.85rem; margin-bottom:4px;">Place Name</label>
                <input type="text" id="edit-place-name" value="${place.name || ""}" required class="form-input" style="width:100%; padding:8px; box-sizing:border-box;">
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
                <label for="edit-place-status" style="display:block; font-size:0.85rem; margin-bottom:4px;">Status</label>
                <select id="edit-place-status" class="form-select" style="width:100%; padding:8px;">
                    <option value="green" ${place.status !== "blue" ? "selected" : ""}>Unvisited (Green)</option>
                    <option value="blue" ${place.status === "blue" ? "selected" : ""}>Visited (Blue)</option>
                </select>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
                <label for="edit-place-notes" style="display:block; font-size:0.85rem; margin-bottom:4px;">Notes</label>
                <textarea id="edit-place-notes" rows="3" class="form-input" style="width:100%; padding:8px; box-sizing:border-box;">${place.notes || ""}</textarea>
            </div>

            <div class="action-row" style="display:flex; gap:8px; margin-top:16px;">
                <button type="submit" class="btn btn-primary" style="flex:1; padding:10px;">Save</button>
                ${!isNew ? `<button type="button" id="delete-place-btn" class="btn btn-danger" style="padding:10px;">Delete</button>` : ""}
            </div>
        </form>
    `;

    sheetEl.classList.remove("hidden");

    // Close Button Event
    document.getElementById("close-editor-btn")?.addEventListener("click", closePlaceEditor);

    // Form Submit Event
    document.getElementById("place-editor-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedPlace = {
            id: document.getElementById("edit-place-id").value,
            lng: parseFloat(document.getElementById("edit-place-lng").value),
            lat: parseFloat(document.getElementById("edit-place-lat").value),
            name: document.getElementById("edit-place-name").value,
            status: document.getElementById("edit-place-status").value,
            notes: document.getElementById("edit-place-notes").value,
            updatedAt: new Date().toISOString()
        };
        handleSavePlace(updatedPlace);
    });

    // Delete Button Event
    document.getElementById("delete-place-btn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this place?")) {
            handleDeletePlace(placeId);
        }
    });
}

/**
 * Closes the Bottom Sheet Editor
 */
export function closePlaceEditor() {
    const sheetEl = document.getElementById("bottom-sheet");
    if (sheetEl) {
        sheetEl.classList.add("hidden");
    }
}
