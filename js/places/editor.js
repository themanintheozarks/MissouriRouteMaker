/**
 * editor.js
 * MissouriRouteMaker
 *
 * Handles creation, editing, and deletion of places on the map.
 */

import { savePlace, deletePlace } from "../database.js";
import { drawPlaceMarker, renderAllMarkers } from "./markers.js";

export class PlaceEditor {
  constructor(map, onSaveCallback = null, onDeleteCallback = null) {
    this.map = map;
    this.onSaveCallback = onSaveCallback;
    this.onDeleteCallback = onDeleteCallback;
    this.currentPlace = null;
    this.isEnabled = false;

    this.initUI();
  }

  /**
   * Initializes the modal / bottom sheet DOM elements for editing.
   */
  initUI() {
    if (document.getElementById("place-editor-modal")) return;

    const modalHTML = `
      <div id="place-editor-modal" class="editor-modal hidden" style="position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top-left-radius: 16px; border-top-right-radius: 16px; padding: 20px; box-shadow: 0 -4px 20px rgba(0,0,0,0.2); z-index: 2000; max-height: 85vh; overflow-y: auto;">
        <div class="editor-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 id="editor-title" style="margin: 0; font-size: 1.2rem;">Edit Place</h3>
          <button type="button" id="editor-close-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>

        <form id="place-editor-form">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: bold; margin-bottom: 4px;">Name</label>
            <input type="text" id="editor-name" required placeholder="Location Name" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 6px;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: bold; margin-bottom: 4px;">Status</label>
            <select id="editor-status" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 6px;">
              <option value="green">🟢 Green (Unvisited)</option>
              <option value="blue">🔵 Blue (Visited)</option>
              <option value="orange">🟠 Orange (Off Main Route)</option>
              <option value="red">🔴 Red (Not Accessible)</option>
            </select>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: bold; margin-bottom: 4px;">Rating (1–5 Stars)</label>
            <div id="editor-rating-stars" style="font-size: 1.5rem; cursor: pointer; color: #d1d5db;">
              <span data-star="1">★</span>
              <span data-star="2">★</span>
              <span data-star="3">★</span>
              <span data-star="4">★</span>
              <span data-star="5">★</span>
            </div>
            <input type="hidden" id="editor-rating" value="0">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: bold; margin-bottom: 4px;">Categories (Comma separated)</label>
            <input type="text" id="editor-categories" placeholder="Parks, Scenic, Gas" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 6px;">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold; margin-bottom: 4px;">Notes</label>
            <textarea id="editor-notes" rows="3" placeholder="Add notes..." style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 6px;"></textarea>
          </div>

          <div style="display: flex; gap: 10px; justify-content: space-between;">
            <button type="button" id="editor-delete-btn" style="background: #ef4444; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Delete</button>
            <div style="display: flex; gap: 10px;">
              <button type="button" id="editor-cancel-btn" style="background: #e5e7eb; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Cancel</button>
              <button type="submit" style="background: #2563eb; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">Save</button>
            </div>
          </div>
        </form>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.bindUIEvents();
  }

  /**
   * Binds UI interactions for star rating, form buttons, and modals.
   */
  bindUIEvents() {
    const modal = document.getElementById("place-editor-modal");
    const form = document.getElementById("place-editor-form");
    const closeBtn = document.getElementById("editor-close-btn");
    const cancelBtn = document.getElementById("editor-cancel-btn");
    const deleteBtn = document.getElementById("editor-delete-btn");
    const starsContainer = document.getElementById("editor-rating-stars");

    // Close / Cancel
    const closeModal = () => modal.classList.add("hidden");
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    // Star Rating selection
    starsContainer.addEventListener("click", (e) => {
      const star = e.target.getAttribute("data-star");
      if (star) {
        this.setStarRating(parseInt(star, 10));
      }
    });

    // Save Form
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.saveFromForm();
      closeModal();
    });

    // Delete Action
    deleteBtn.addEventListener("click", async () => {
      if (this.currentPlace) {
        await this.delete(this.currentPlace);
        closeModal();
      }
    });
  }

  /**
   * Sets visually highlighted gold stars.
   */
  setStarRating(rating) {
    document.getElementById("editor-rating").value = rating;
    const stars = document.querySelectorAll("#editor-rating-stars span");
    stars.forEach((star, index) => {
      star.style.color = index < rating ? "#facc15" : "#d1d5db";
    });
  }

  enable() {
    this.isEnabled = true;
    console.log("Place editor enabled");
  }

  disable() {
    this.isEnabled = false;
    console.log("Place editor disabled");
  }

  /**
   * Opens the place editor sheet/modal with details prefilled.
   */
  edit(place) {
    console.log("Editing place:", place);
    this.currentPlace = place;

    document.getElementById("editor-title").textContent = place.id ? "Edit Place" : "New Place";
    document.getElementById("editor-name").value = place.name || "";
    document.getElementById("editor-status").value = place.status || "green";
    document.getElementById("editor-notes").value = place.notes || "";
    document.getElementById("editor-categories").value = Array.isArray(place.categories) ? place.categories.join(", ") : "";

    this.setStarRating(place.rating || 0);

    // Show or hide delete button if new or existing place
    document.getElementById("editor-delete-btn").style.display = place.id ? "block" : "none";

    document.getElementById("place-editor-modal").classList.remove("hidden");
  }

  /**
   * Collects values from form inputs and saves immediately.
   */
  async saveFromForm() {
    const rawCategories = document.getElementById("editor-categories").value;
    const parsedCategories = rawCategories
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const updatedPlace = {
      ...this.currentPlace,
      id: this.currentPlace?.id || crypto.randomUUID(),
      name: document.getElementById("editor-name").value.trim(),
      status: document.getElementById("editor-status").value,
      rating: parseInt(document.getElementById("editor-rating").value, 10) || 0,
      categories: parsedCategories,
      notes: document.getElementById("editor-notes").value.trim(),
      dateAdded: this.currentPlace?.dateAdded || new Date().toISOString()
    };

    await this.save(updatedPlace);
  }

  /**
   * Saves a place directly to IndexedDB and refreshes map markers.
   */
  async save(place) {
    console.log("Saving place immediately to IndexedDB:", place);
    try {
      const savedRecord = await savePlace(place);
      drawPlaceMarker(savedRecord);

      if (this.onSaveCallback) {
        this.onSaveCallback(savedRecord);
      }
    } catch (err) {
      console.error("Failed to save place:", err);
    }
  }

  /**
   * Destructive Action: Deletes place with required user confirmation.
   */
  async delete(place) {
    if (!place || !place.id) return;

    // Rule: Every destructive action requires confirmation
    const confirmed = confirm(`Are you sure you want to delete "${place.name}"?`);
    if (!confirmed) return;

    console.log("Deleting place:", place);
    try {
      await deletePlace(place.id);

      if (this.onDeleteCallback) {
        this.onDeleteCallback(place.id);
      }
    } catch (err) {
      console.error("Failed to delete place:", err);
    }
  }
}
