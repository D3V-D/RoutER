async function geolocate(query) {
    const response = await fetch("https://nominatim.openstreetmap.org/search?q=" + query + "&format=jsonv2", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })
    const locationsFound = await response.json();
    return locationsFound;
}

async function reverseGeolocate(lat, lon) {
    const response = await fetch("https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lon + "&format=jsonv2", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })
    const locationNameFound = await response.json();
    return locationsFound;
}

/**
 *  sourceLatLng => object with lat. and long. data
 *  destinations => array of latlng objects
 * 
 *  returns latLng object of closest destination
 */
async function findClosestLocation(sourceLatLng, destinations) {
    // first build url for api call
    let url = "https://router.project-osrm.org/table/v1/driving/" + sourceLatLng.lon + "," + sourceLatLng.lat + ";"
    
    // loop once to append source/destinations
    for (let index = 0; index < destinations.length; index++) {
        url += destinations[index].lon + "," + destinations[index].lat
        if (index != destinations.length - 1) {
            // do for all but last one
            url += ";"
        }
    }
    
    url += "?sources=0&destinations="
    
    // loop again to append indexes of each destination
    for (let index = 0; index < destinations.length; index++) {
        url += index + 1;
        if (index != destinations.length - 1) {
            // do for all but last one
            url += ";"
        }
    }


    // call api
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })

    const distancesJSON = await response.json();
    const durations = distancesJSON.durations[0]
    
    // remove possible null values
    const filteredDurations = durations.filter((val) => {
        return val !== null;
    })

    const shortestDuration = Math.min(...filteredDurations)
    const indexOfShortest = durations.indexOf(shortestDuration)
    const locationFromIndex = distancesJSON.destinations[indexOfShortest]
    const latLngOfClosest = {
        lat: locationFromIndex.location[1],
        lon: locationFromIndex.location[0]
    }
    return latLngOfClosest;
}