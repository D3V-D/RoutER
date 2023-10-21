// for future form data reference //
// var formData = new FormData(document.querySelector('form'))
// ----------------------------- //

var map = L.map('map').setView([30.4380832, -84.2809332], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.Routing.control({
    waypoints: [
        L.latLng(30.4380832, -84.2809332),
        L.latLng(30.45, -84.3)
    ],
    // show: false,
    addWaypoints: false,
    routeWhileDragging: false
}).addTo(map);

L.control.scale().addTo(map);

L.Control.Track = L.Control.extend({
    onAdd: function(map) {
        let trackingButton = L.DomUtil.create('a', 'map-button');

        trackingButton.innerHTML = "⮙";
        trackingButton.href = '#';
        trackingButton.role = 'button';
        trackingButton.label = 'Track';
        trackingButton.setAttribute('title', "Track");
        trackingButton.setAttribute('aria-label', 'Track');
        trackingButton.setAttribute('aria-disabled', 'false');

        return trackingButton
    },

    onRemove: function(map) {

    }
})

L.control.track = function(opts) {
    return new L.Control.Track(opts);
}

L.control.track({ position: 'topleft' }).addTo(map);

var current_position, current_accuracy;

var initialGeolocation = true;
var currentlyTracking = false;

function onLocationFound(e) {
    
    // if we have current position, remove old pos.
    if (current_position) {
        map.removeLayer(current_position);
        map.removeLayer(current_accuracy);
    }

    var radius = e.coords.accuracy / 10;

    const latlng = {
        lat: e.coords.latitude,
        lng: e.coords.longitude
    }

    

    current_position = L.marker(latlng).addTo(map);

    current_accuracy = L.circle(latlng, radius).addTo(map);

    if (currentlyTracking) {
        // if in tracking mode.
        map.setView(latlng);
    }

    if (initialGeolocation) {
        initialGeolocation = false;
        map.setZoom(17);
        alert("Location may be inaccurate; if so, please enter start address manually. Please wait a few seconds first.");
        setTimeout(() => {
            map.setView(latlng);
        }, 300);
        console.log(latlng)
    }
}

function onLocationError(e) {
    console.error("Location found error");
}

// geolocation

navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
    maximumAge: 100,
    timeout: 5000,
    enableHighAccuracy: true
});
  
