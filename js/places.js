/*
==========================================================
Missouri Route Maker

places.js

Temporary Places Module

==========================================================
*/

import { getMap } from "./map/map.js";

const places = [];

export function initializePlaces() {

    const map = getMap();

    map.on("click", onMapClick);

}

function onMapClick(event) {

    const name = prompt("Place name:");

    if (!name) {

        return;

    }

    const marker = new maplibregl.Marker({

        color: "#16a34a"

    })

    .setLngLat(event.lngLat)

    .setPopup(

        new maplibregl.Popup()

        .setText(name)

    )

    .addTo(getMap());

    places.push({

        name,

        marker,

        lng: event.lngLat.lng,

        lat: event.lngLat.lat

    });

    console.log("Places:", places);

}
