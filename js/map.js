const directionsForm = document.getElementById('directions-form');
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");

var map = L.map('map').setView([30.4380832, -84.2809332], 13);

// actual map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.scale().addTo(map);

// custom made tracking button
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


    // only runs on first SUCCESSFUL geolocation
    if (initialGeolocation) {
        // toggle variables
        initialGeolocation = false;
        initialGeolocationError = false;

        //set zoom & view & create route.
        map.setZoom(17);
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
        setTimeout(() => {
            map.setView(latlng);
            fromInput.value = "Your Location"
            // toInput.value = #### 
            // need to get database connected
        }, 400);
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
let positionTracker;
if (navigator.geolocation) {
    positionTracker = navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
        maximumAge: 0,
        timeout: 5000,
        enableHighAccuracy: true
    });     
} else {
    alert("Geolocation is not supported for this OS/Browser. Please input start manually.")
}

// deal with directions form submission
async function routeFromInput(e) {
    e.preventDefault()
    let eitherInputFailed = false;

    // check for valid inputs
    if (fromInput.value.trim().length === 0 || fromInput.value == "Your Location") {
        fromInput.style.border = "solid 2px red";
        eitherInputFailed = true;
    } else {
        fromInput.style.border = "solid 2px black";
    }

    // test for a non-empty string (aka has actual characters & not just whitespaces)
    if (toInput.value.trim().length === 0) {
        toInput.style.border = "solid 2px red";
        eitherInputFailed = true;
    } else {
        toInput.style.border = "solid 2px black";
    }

    // if either input failed, then return no value and end function
    if (eitherInputFailed) {
        return;
    }


    let fromLocation;
    let toLocation;
    try {
        // if inputs pass, first cancel user geolocation so it
        // doesn't attempt to interfere
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(positionTracker);
        }

        // also temp. disable input fields
        fromInput.disabled = true;
        toInput.disabled = true;

        // now locate input locations, then route
        let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

        async function findLocations() {
            fromLocation = await geolocate(fromInput.value);
            wait(1300);
            toLocation = await geolocate(toInput.value);        
        }

        await findLocations();

        let fromLat = fromLocation[0].lat
        let fromLng = fromLocation[0].lon

        let toLat = toLocation[0].lat
        let toLng = toLocation[0].lon

        routingControl.setWaypoints([
            L.latLng(fromLat, fromLng),
            L.latLng(toLat, toLng)
        ])

        // MOVE THIS, HAVE EACH SET
        // INDIVIDUALLY, NOT JUST WITH SUBMISSION
        fromInput.value = fromLocation[0].display_name
        toInput.value = toLocation[0].display_name

        fromInput.disabled = false;
        toInput.disabled = false;
    } catch(e) {
        fromInput.disabled = false;
        toInput.disabled = false;

        //check which one errored, to provide visual feedback
        if (!fromLocation[0]) {
            // if from doesn't exist
            fromInput.style.border = "solid 2px red";
        }

        if (!toLocation[0]) {
            // if to doesn't exist
            toInput.style.border = "solid 2px red";
        }

        console.error(e)
    }
} 