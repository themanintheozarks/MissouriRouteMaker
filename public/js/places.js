/*
==========================================================
Missouri Route Maker

places.js

Module 4
Place Editor Foundation

==========================================================
*/

import { getMap } from "./map/map.js";

import {

    savePlace,
    loadPlaces

} from "./database.js";

/*
==========================================================
Initialize
==========================================================
*/

export async function initializePlaces() {

    const map = getMap();

    if (!map) return;

    map.on("click", openPlaceEditor);

    await restorePlaces();

}

/*
==========================================================
Restore Saved Places
==========================================================
*/

async function restorePlaces() {

    const places = await loadPlaces();

    places.forEach(drawPlace);

}

/*
==========================================================
Open Place Editor

(Temporary)

The browser prompt will be replaced by
the permanent Bottom Sheet editor in
the next build.

==========================================================
*/

async function openPlaceEditor(event) {

    const name = prompt("Place Name");

    if (!name) {

        return;

    }

    const place = {

        name,

        latitude: event.lngLat.lat,

        longitude: event.lngLat.lng,

        categories: [],

        notes: "",

        rating: 0,

        status: "green"

    };

    await savePlace(place);

    drawPlace(place);

}

/*
==========================================================
Draw Marker
==========================================================
*/

function drawPlace(place) {

    const marker = new maplibregl.Marker({

        color: "#16a34a"

    })

        .setLngLat([

            place.longitude,

            place.latitude

        ])

        .setPopup(

            new maplibregl.Popup({

                closeButton: true

            })

                .setHTML(

                    `
                    <strong>${place.name}</strong>
                    <br><br>

                    <button
                        id="edit-place">

                        Edit

                    </button>

                    <button
                        id="delete-place">

                        Delete

                    </button>
                    `
                )

        )

        .addTo(getMap());

    /*
    ==============================================
    Future:

    Edit

    Delete

    Route

    Navigate

    ==============================================
    */

    return marker;

}
