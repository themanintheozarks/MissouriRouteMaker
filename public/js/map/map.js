// public/js/map/map.js
export const mapManager = {
    map: null,

    async init(containerId) {
        if (this.map) return;

        this.map = new maplibregl.Map({
            container: containerId,
            style: 'https://demotiles.maplibre.org/style.json', // Reliable open tile style
            center: [-92.26, 37.13], // Missouri center coordinates
            zoom: 7
        });

        // Step 3: Force map engine to recalculate size on load
        this.map.on('load', () => {
            this.map.resize();
            console.log("Map tiles loaded and rendered successfully.");
        });
    }
};
