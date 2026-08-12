export const gpsService = {
    watchId: null,
    userMarker: null,
    followMe: false,
    map: null,

    init(mapInstance) {
        this.map = mapInstance;
        console.log("GPS Service initialized successfully.");
    },

    startTracking() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (this.map) {
                    if (!this.userMarker) {
                        const el = document.createElement('div');
                        el.className = 'user-location-marker';
                        this.userMarker = new maplibregl.Marker(el)
                            .setLngLat([longitude, latitude])
                            .addTo(this.map);
                    } else {
                        this.userMarker.setLngLat([longitude, latitude]);
                    }

                    if (this.followMe) {
                        this.map.flyTo({ center: [longitude, latitude], zoom: 14 });
                    }
                }
            },
            (err) => {
                console.warn(`GPS Error (${err.code}): ${err.message}`);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
            }
        );
    },

    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        if (this.userMarker) {
            this.userMarker.remove();
            this.userMarker = null;
        }
    },

    setFollowMe(flag) {
        this.followMe = flag;
    }
};
