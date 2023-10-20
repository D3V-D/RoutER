var map = L.map('map').setView([30.4380832, -84.2809332], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.scale().addTo(map);

var current_position, current_accuracy;

var initialGeolocation = true;
var currentlyTracking = true;

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

    if (initialGeolocation) {
        initialGeolocation = false;
        map.setZoom(17);
        alert("Location may be inaccurate; if so, please enter start address manually. Please wait a few seconds first.");
        map.setView(latlng);
    }

    current_position = L.marker(latlng).addTo(map);

    current_accuracy = L.circle(latlng, radius).addTo(map);

    if (currentlyTracking) {
        map.setView(latlng);
    }
}

function onLocationError(e) {
    console.error("Location found error");
}

// geolocation

navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
    maximumAge: 200,
    timeout: 5000,
    enableHighAccuracy: true
});
  
