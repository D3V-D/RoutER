// for future form data reference //
// var formData = new FormData(document.querySelector('form'))
// ----------------------------- //

var map = L.map('map').setView([30.4380832, -84.2809332], 13);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.scale().addTo(map);

L.Control.Track = L.Control.extend({
    onAdd: function(map) {
        let trackingButton = L.DomUtil.create('a', 'map-button');

        trackingButton.innerHTML = "⮙";
        trackingButton.href = '#';
        trackingButton.style.color = "black"
        trackingButton.role = 'button';
        trackingButton.label = 'Track';
        trackingButton.setAttribute('title', "Track");
        trackingButton.setAttribute('aria-label', 'Track');
        trackingButton.setAttribute('aria-disabled', 'false');

        // button funcitonality
        trackingButton.addEventListener("click", ()=> {
            currentlyTracking = currentlyTracking ? false : true;
            if (currentlyTracking) {
                trackingButton.style.background = "aliceblue"
                trackingButton.style.color = "blue"
                trackingButton.setAttribute('title', "Stop Tracking");
            } else {
                trackingButton.style.background = "white"
                trackingButton.style.color = "black"
                trackingButton.setAttribute('title', "Track");
            }
        })

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
var initialGeolocationError = true;
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


    if (currentlyTracking) {
        // if in tracking mode.
        map.setView(latlng);
        map.setZoom(17);
        routingControl.setWaypoints([
            L.latLng(latlng.lat, latlng.lng),
            L.latLng(30.4380832, -84.2809332)
        ])
    }

    if (initialGeolocation) {
        initialGeolocation = false;
        initialGeolocationError = false;
        map.setZoom(17);
        setTimeout(() => {
            map.setView(latlng);
        }, 1000);
        alert("Location may be inaccurate; if so, please enter start address manually.")
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(latlng.lat, latlng.lng),
                L.latLng(30.4380832, -84.2809332),
            ],
            draggableWaypoints: false,
            addWaypoints: false,
            routeWhileDragging: false,
        }).addTo(map);
        current_accuracy = L.circle(latlng, radius).addTo(map);
    }
}

function onLocationError(e) {
    console.error("Location found error");

    if (initialGeolocationError) {
        initialGeolocationError = false;
        alert("Delay in locating user; please wait a few more seconds or manually enter start location.");
    }
}

// geolocation

navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
    maximumAge: 100,
    timeout: 5000,
    enableHighAccuracy: true
});
  
