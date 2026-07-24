/**
 * editor.js
 * MissouriRouteMaker
 *
 * Handles editing of places on the map.
 */

export class PlaceEditor {
  constructor(map) {
    this.map = map;
  }

  enable() {
    console.log("Place editor enabled");
  }

  disable() {
    console.log("Place editor disabled");
  }

  edit(place) {
    console.log("Editing place:", place);
  }

  save(place) {
    console.log("Saving place:", place);
  }

  delete(place) {
    console.log("Deleting place:", place);
  }
}
