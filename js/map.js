const directionsForm = document.getElementById('directions-form');
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
fromInput.value = ""
toInput.value = ""

let latlng; // user latlng
var current_position, current_accuracy;

// for routing
let fromLat;
let fromLng;

let toLat;
let toLng;

// for geolocation
var initialGeolocation = true;
var initialGeolocationError = true;
var currentlyTracking = false;
let geolocatorExists = false;

var map = L.map('map').setView([39.8097343, -98.5556199], 3);

// actual map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// routing object
let routingControl = L.Routing.control({
    waypoints: [
        L.latLng(39.8097343, -98.5556199),
        L.latLng(39.8097343, -98.5556199), // default values until necessary
    ],
    draggableWaypoints: false,
    addWaypoints: false,
    routeWhileDragging: false,
})

L.control.scale().addTo(map);

// custom made tracking button
L.Control.Track = L.Control.extend({
    onAdd: function(map) {
        let trackingButton = L.DomUtil.create('a', 'map-button');
        let trackingIcon = L.DomUtil.create('img', 'tracking-icon');
        
        trackingIcon.src = "../public/compass-regular.svg"
        trackingIcon.style.width = "70%"
        trackingIcon.style.position = "absolute"
        trackingIcon.style.top = "13%"
        trackingIcon.style.left = "13%"

        trackingButton.appendChild(trackingIcon)
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
                
                // create a position tracker
                if (navigator.geolocation && !geolocatorExists) {
                    initialGeolocation = true;
                    initialGeolocationError = true;
                    positionTracker = navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
                        maximumAge: 0,
                        timeout: 5000,
                        enableHighAccuracy: true
                    });     
                } else if (!geolocatorExists) {
                    alert("Geolocation is not supported for this OS/Browser. Please input start manually.")
                }
            
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

// locate closest solution according to chosen emergency
async function findClosestEmergencySolution(userLoc) {
    let emergency = window.sessionStorage.getItem("emergency");
    switch(emergency) {
        case "hospital":
            let closestHospital = await findClosestHospital(userLoc);
            toLat = closestHospital.lat;
            toLng = closestHospital.lon;

            routingControl.setWaypoints([
                L.latLng(latlng.lat, latlng.lon),
                L.latLng(toLat, toLng)
            ]).addTo(map);

            toInput.value = closestHospital.name
        default:
            // if called w/out emergency, simply remake existing path
            routingControl.setWaypoints([
                L.latLng(latlng.lat, latlng.lon),
                L.latLng(toLat, toLng)
            ]).addTo(map);
            break;
    }

}

function onLocationFound(e) {
    // if we have current position, remove old pos.
    if (current_position) {
        map.removeLayer(current_position);
        map.removeLayer(current_accuracy);
    }

    var radius = e.coords.accuracy / 10;

    latlng = {
        lat: e.coords.latitude,
        lon: e.coords.longitude
    }

    // only runs on first SUCCESSFUL geolocation
    if (initialGeolocation) {
        // toggle variables
        initialGeolocation = false;
        initialGeolocationError = false;
        geolocatorExists = true;

        //set zoom & view & create route.
        map.setZoom(17);
        alert("Location may be inaccurate; if so, please enter start address manually.")
        routingControl.addTo(map);
        setTimeout(() => {
            map.setView(latlng);
            fromInput.value = "Your Location"
            findClosestEmergencySolution(latlng)
        }, 600);
        current_accuracy = L.circle(latlng, radius).addTo(map);
    }


    if (currentlyTracking) {
        // if in tracking mode.
        // first disable usage
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();
        document.getElementById('map').style.cursor='default'; 
    

        map.setView(latlng);
        map.setZoom(17);
        routingControl.setWaypoints([
            L.latLng(latlng.lat, latlng.lon),
            L.latLng(toLat, toLng)
        ])
        fromInput.value = "Your Location"
        
        // once view set, re-enable
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();
        document.getElementById('map').style.cursor='grab';
    }
}

// geolocation errors (frequent)
function onLocationError(e) {
    console.error("Location found error");

    if (initialGeolocationError) {
        initialGeolocationError = false;
        alert("Delay in locating user; please wait a few more seconds or manually enter start location.");
    }
}

// geolocation
let positionTracker;
if (navigator.geolocation && !geolocatorExists) {
    initialGeolocation = true;
    initialGeolocationError = true;
    positionTracker = navigator.geolocation.watchPosition(onLocationFound, onLocationError, {
        maximumAge: 0,
        timeout: 5000,
        enableHighAccuracy: true
    });     
} else if (!geolocatorExists) {
    alert("Geolocation is not supported for this OS/Browser. Please input start manually.")
}


// check directions form data
// then call route function
async function routeFromInput(e) {
    e.preventDefault()

    if(current_accuracy) {
        map.removeLayer(current_accuracy)
    }

    let eitherInputFailed = false;

    // check for valid inputs
    if (fromInput.value.trim().length === 0) {
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

    if (fromInput.value == "Your Location") {
        // if user location available, route with user's location
        // else, fail
        if (latlng) {
            route(true);
            return;
        }
        eitherInputFailed = true;
        fromInput.style.border = "solid 2px red";
    }

    // if either input failed, then return no value and end function
    if (eitherInputFailed) {
        return;
    }

    route(false);
} 


// actually use api to route with the verified data
/**
 *  fromUserLocation => boolean value
 */
async function route(fromUserLocation) {
    let fromLocation;
    let toLocation;
    try {
        // if inputs pass, first cancel user geolocation so it
        // doesn't attempt to interfere
        if (navigator.geolocation && geolocatorExists) {
            navigator.geolocation.clearWatch(positionTracker);
            geolocatorExists = false;
        }

        // also temp. disable input fields
        fromInput.disabled = true;
        toInput.disabled = true;

        // now locate input locations, then route
        async function findLocations() {
            if (fromUserLocation) {
                fromLocation = await geolocate(latlng.lat + " " + latlng.lon);
            } else {
                fromLocation = await geolocate(fromInput.value);
            }            
            toLocation = await geolocate(toInput.value);        
        }

        await findLocations();

        fromLat = fromLocation[0].lat
        fromLng = fromLocation[0].lon

        toLat = toLocation[0].lat
        toLng = toLocation[0].lon

        routingControl.setWaypoints([
            L.latLng(fromLat, fromLng),
            L.latLng(toLat, toLng)
        ]).addTo(map);

        // MOVE THIS, HAVE EACH SET
        // INDIVIDUALLY, NOT JUST WITH SUBMISSION
        if (!fromUserLocation) {
            fromInput.value = fromLocation[0].display_name
        }    
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

findClosestHospital({
    lat: 30.547631808910165,
    lon: -84.23383071896907
})