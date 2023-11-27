# [RoutER ↗](https://emrouter.netlify.app) 🌐

![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![Contributors](https://img.shields.io/badge/Contributors-4-green) ![License](https://img.shields.io/badge/license-MIT-orange)

Leverages API data to provide the quickest routes to nearby disaster relief shelters, hospitals, and other important locations. 🗺️

## Features

- **Route to nearest open _____**
  - Hospital 🏥
  - Evacuation shelter 🌪️
  - Post-disaster shelter 🏚️
  - Potentially more ❓
- **Alternate routes**: Provides various alternate routes for given selection within the county. Gives you location information including name, distance, and address. ⛕
- **Custom routes**: Built-in routing ability to go from any location to any other location; not just limited to emergencies. 📍
- **Route without exact address**: The destination input can also include things such as "hospitals near city" or "restaurants in place", and are not limited to just addresses. 🔍
- **Switch emergency**: You can also switch emergencies while using the app, and it will recaclulate the new routes for you from your current location. 🔀
- **Tracking (beta)**: RoutER also supports tracking the user as they move, thus updating the steps to reach the destination. This feature is still prone to bugs. 🧭

## APIS/TOOLS

- [HIFLD Open Data Databases](https://hifld-geoplatform.opendata.arcgis.com/)
- [Leaflet.js](https://leafletjs.com/)
- [Open Street Maps](https://www.openstreetmap.org/#map=14/30.5201/-84.2390)
- [Project OSRM](https://project-osrm.org/) and [Leaflet-Routing-Machine](https://www.liedman.net/leaflet-routing-machine/)
- [Nominatim](https://nominatim.org/release-docs/latest/)
- [Netlify](https://netlify.com)
