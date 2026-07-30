// public/js/editor.js

class PlaceEditor {
    constructor() {
        this.currentPlace = null;
        this.isDirty = false;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('place-editor-form');
        if (form) {
            form.addEventListener('input', () => {
                this.isDirty = true;
            });
        }
    }

    open(placeData = null) {
        this.currentPlace = placeData;
        this.isDirty = false;
        
        const modal = document.getElementById('editor-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populateForm(placeData);
        }
    }

    close() {
        const modal = document.getElementById('editor-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentPlace = null;
        this.isDirty = false;
    }

    populateForm(data) {
        document.getElementById('place-name').value = data?.name || '';
        document.getElementById('place-description').value = data?.description || '';
        document.getElementById('place-category').value = data?.category || 'general';
    }

    getFormData() {
        return {
            name: document.getElementById('place-name').value,
            description: document.getElementById('place-description').value,
            category: document.getElementById('place-category').value
        };
    }
}

export const placeEditor = new PlaceEditor();
