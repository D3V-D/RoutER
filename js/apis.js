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

