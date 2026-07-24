/*
==========================================================
Missouri Route Maker

places.js

Permanent Places

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

    map.on("click", addPlace);

    await restorePlaces();

}

/*
==========================================================
Restore Saved Places
==========================================================
*/

async function restorePlaces() {

    const places = await loadPlaces();

    places.forEach(place => {

        drawPlace(place);

    });

}

/*
==========================================================
Map Click
==========================================================
*/

async function addPlace(event) {

    const name = prompt("Enter place name");

    if (!name) return;

    const place = {

        name,

        latitude: event.lngLat.lat,

        longitude: event.lngLat.lng,

        status: "green",

        rating: 0,

        notes: "",

        categories: []

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

    new maplibregl.Marker({

        color: "#16a34a"

    })

    .setLngLat([

        place.longitude,

        place.latitude

    ])

    .setPopup(

        new maplibregl.Popup()

        .setText(place.name)

    )

    .addTo(getMap());

}
