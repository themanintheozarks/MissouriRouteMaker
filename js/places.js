/*
==========================================================
Missouri Route Maker

places.js

Places Module
(Milestone 1)

==========================================================
*/

import { getMap } from "./map/map.js";

let places = [];

export function initializePlaces() {

    const map = getMap();

    if (!map) {
        return;
    }

    map.on("click", createPlace);

}

function createPlace(event) {

    const name = prompt("Enter place name:");

    if (!name) {
        return;
    }

    const marker = new maplibregl.Marker({

        color: "#16a34a"

    })

    .setLngLat([

        event.lngLat.lng,
        event.lngLat.lat

    ])

    .setPopup(

        new maplibregl.Popup()

        .setText(name)

    )

    .addTo(getMap());

    places.push({

        name,

        latitude: event.lngLat.lat,

        longitude: event.lngLat.lng,

        marker

    });

    console.log(places);

}
