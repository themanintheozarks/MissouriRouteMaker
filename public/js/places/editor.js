export const placeEditor = {
    init() {
        console.log("Place Editor initialized.");
    },
    open(placeData = null) {
        openPlaceEditor(placeData);
    },
    close() {
        closePlaceEditor();
    }
};

export function openPlaceEditor(placeData = null) {
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');

    if (!modalOverlay || !modalBody) return;

    if (modalTitle) {
        modalTitle.textContent = placeData ? 'Edit Place' : 'Add New Place';
    }

    modalOverlay.classList.remove('overlay-hidden');
}

export function closePlaceEditor() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('overlay-hidden');
    }
}
