// public/js/arrival.js
import { gpsService } from './gps.js';
import { placesService } from './places/places.js';
import { markerManager } from './places/markers.js';

class ArrivalDetector {
    constructor() {
        this.arrivalRadiusFeet = 200; // Default 200ft specification
        this.activeDestinations = [];
        this.promptActive = false;
        this.snoozedPlaces = new Set();
        this.audioContext = null;
    }

    /**
     * Initialize arrival detection and bind to GPS position updates.
     */
    init() {
        gpsService.onPositionUpdate((pos) => this.checkProximity(pos));
    }

    /**
     * Set configurable arrival radius in feet.
     * @param {number} feet 
     */
    setRadius(feet) {
        this.arrivalRadiusFeet = Number(feet) || 200;
    }

    /**
     * Calculate distance between two lat/lng points in feet using Haversine formula.
     */
    calculateDistanceFeet(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const meters = R * c;
        return meters * 3.28084; // Convert meters to feet
    }

    /**
     * Check current GPS coordinates against unvisited places.
     */
    async checkProximity(position) {
        if (this.promptActive) return;

        const { latitude, longitude } = position;
        const places = await placesService.getAllPlaces();

        // Only check Green (Unvisited) pins
        const unvisitedPlaces = places.filter(p => p.status === 'green' && !this.snoozedPlaces.has(p.id));

        for (const place of unvisitedPlaces) {
            const distanceFeet = this.calculateDistanceFeet(latitude, longitude, place.latitude, place.longitude);

            if (distanceFeet <= this.arrivalRadiusFeet) {
                this.triggerArrivalAlert(place);
                break;
            }
        }
    }

    /**
     * Play chime sound and display arrival confirmation popup.
     */
    triggerArrivalAlert(place) {
        this.promptActive = true;
        this.playChime();

        // Create modal container
        const modalId = 'arrival-modal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            const modalHTML = `
                <div id="${modalId}" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000;">
                    <div style="background:#fff; padding:20px; border-radius:12px; width:90%; max-width:360px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                        <h3 style="margin-top:0;">Arrived at Destination!</h3>
                        <p id="arrival-place-name" style="font-weight:bold; font-size:18px; margin:10px 0;"></p>
                        <p style="font-size:14px; color:#555;">Mark this place as Visited (Blue pin)?</p>
                        <div style="display:flex; gap:10px; margin-top:20px;">
                            <button id="arrival-skip-btn" style="flex:1; padding:12px; border:1px solid #ccc; background:#f8f9fa; border-radius:6px; font-weight:bold; cursor:pointer;">Skip 15 Sec</button>
                            <button id="arrival-yes-btn" style="flex:1; padding:12px; border:none; background:#007bff; color:#fff; border-radius:6px; font-weight:bold; cursor:pointer;">Yes</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById(modalId);
        }

        document.getElementById('arrival-place-name').textContent = place.name;
        modal.style.display = 'flex';

        // Bind button actions
        const yesBtn = document.getElementById('arrival-yes-btn');
        const skipBtn = document.getElementById('arrival-skip-btn');

        const cleanup = () => {
            modal.style.display = 'none';
            this.promptActive = false;
        };

        yesBtn.onclick = async () => {
            // Only pressing Yes changes a Green pin to Blue
            place.status = 'blue';
            await placesService.savePlace(place);
            const allPlaces = await placesService.getAllPlaces();
            markerManager.renderMarkers(allPlaces);
            cleanup();
        };

        skipBtn.onclick = () => {
            // Snooze place for 15 seconds
            this.snoozedPlaces.add(place.id);
            setTimeout(() => {
                this.snoozedPlaces.delete(place.id);
            }, 15000);
            cleanup();
        };
    }

    /**
     * Synthesize a simple arrival chime tone using Web Audio API.
     */
    playChime() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, this.audioContext.currentTime); // D5
            osc.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.15); // A5

            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.6);
        } catch (e) {
            console.warn('Audio chime playback failed:', e);
        }
    }
}

export const arrivalDetector = new ArrivalDetector();
