// wait function -> make sure to avoid rate limiting
let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// nominatim
async function geolocate(query) {
    const response = await fetch("https://nominatim.openstreetmap.org/search?q=" + query + "&format=jsonv2", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })
    const locationsFound = await response.json();
    return locationsFound;
}

async function locateCounty(query) {
    const response = await fetch("https://nominatim.openstreetmap.org/search?q=" + query + "&format=jsonv2", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })
    const places = await response.json();
    const osmIDLetter = places[0].osm_type.substring(0,1).toUpperCase()
    const osmID = osmIDLetter + places[0].osm_id
    const addressLookup = await fetch("https://nominatim.openstreetmap.org/lookup?osm_ids=" + osmID + "&format=jsonv2", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })
    const address = await addressLookup.json();
    const county = address[0].address.county
    return county.substring(0, county.indexOf("County"));
}

async function reverseGeolocate(lat, lon) {
    const response = await fetch("https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lon + "&format=jsonv2", {
        method: "GET",
        mode: "cors",
        cache: "force-cache",
    })
    const locationNameFound = await response.json();
    return locationNameFound;
}

/**
 *  Open-source Routing Machine
 * 
 *  sourceLatLng => object with lat. and long. data
 *  destinations => array of latlng objects
 * 
 *  returns object with 
 *  latlng object and place name
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
    console.log(filteredDurations)
    const shortestDuration = Math.max(...filteredDurations)
    const indexOfShortest = durations.indexOf(shortestDuration)
    const locationFromIndex = distancesJSON.destinations[indexOfShortest]
    const locationName = await reverseGeolocate(locationFromIndex.location[1], locationFromIndex.location[0])
    const closestPlace = {
        lat: locationFromIndex.location[1],
        lon: locationFromIndex.location[0],
        name: locationName.display_name
    }
    return closestPlace;
}

// HIFLD Database
/**
 *  userLocation => user's current lat and long positions as an object
 * 
 *  Used to find current county, and to input into findClosestLocation.
 *  This function currently doesn't function outside of the U.S.
 */
async function findClosestHospital(userLocation) {
    /**
     * Query
     * https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Hospital/FeatureServer/0/query?where=STATUS%20%3D%20'OPEN'%20AND%20SCOUNTY%20%3D%20'county name'&outFields=LATITUDE,LONGITUDE,STATUS,NAME,ADDRESS,COUNTY,STATE&outSR=4326&f=json
     * Returns name, address, lat, long., & telephone
     * Of open hospitals in given county (based on user location)
     * Restricted to county level as too much data for one api call nationally.
     * Long list.
     */
    try {
        let county = await locateCounty(userLocation.lat + " " + userLocation.lon);


        const response = await fetch("https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Hospital/FeatureServer/0/query?where=STATUS%20%3D%20'OPEN'%20AND%20COUNTY%20%3D%20'" + county + "'&outFields=LATITUDE,LONGITUDE,STATUS,NAME,ADDRESS,COUNTY,STATE&outSR=4326&f=json", {
            method: "GET",
            mode: "cors",
            cache: "force-cache"
        })

        const hospitals = await response.json();

        await wait(500);

        //construct input for findCLosestLocation
        let hospitalLatLngs = []

        for (const hospital of hospitals.features) {
            hospitalLatLngs.push({
                lat: hospital.attributes.LATITUDE,
                lon: hospital.attributes.LONGITUDE
            })
        }

        const closestHospital = await findClosestLocation(userLocation, hospitalLatLngs);
        return closestHospital;
    } catch(e) {
        // usually because county is not in U.S
        console.error(e);
    }
}