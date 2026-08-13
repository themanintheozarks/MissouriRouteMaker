import { openPlaceEditor, closePlaceEditor } from './editor.js';

export const placesManager = {
    places: [],

    init() {
        console.log("Places Manager initialized.");
    },

    openEditor(place = null) {
        if (typeof openPlaceEditor === 'function') {
            openPlaceEditor(place);
        }
    },

    closeEditor() {
        if (typeof closePlaceEditor === 'function') {
            closePlaceEditor();
        }
    }
};
