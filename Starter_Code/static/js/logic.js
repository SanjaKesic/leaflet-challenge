// leaflet function - https://leafletjs.com/examples/choropleth/
function getColor(d) {
    return d > 21  ? '#800026' :
           d > 18  ? '#BD0026' :
           d > 15  ? '#E31A1C' :
           d > 12  ? '#FC4E2A' :
           d > 9   ? '#FD8D3C' :
           d > 6   ? '#FEB24C' :
           d > 3   ? '#FED976' :
                      '#FFEDA0';
}

// Store our API endpoint inside queryUrl

  // define a function to run once for each feature in the features array
  // assign each feature a popup wiht the place and time of the earthquake
  function popUpMsg(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
      + "<p><a href='" + feature.properties.url + "'>LINK</a></p>");
  }

 // define streetmap and darkmap layers
 let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18
  });

  // define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
  };
  
// define the map along with the streetmap and earthquakes layers 
let myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 5,
    layers: [streetmap]     //default selected layer
    });

// add streetmap    
streetmap.addTo(myMap);



// create layer; will attach data later on
let earthquakes = new L.LayerGroup();


// Create overlay object to hold our overlay layer
let overlayMaps = {
  Earthquakes: earthquakes
};

// Create a layer control with baseMaps and overlayMaps

L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
// 
d3.json(queryUrl).then(function(data) {
  console.log('Data: ', data)
  console.log('Depth: ', data.features[0].geometry.coordinates[2])
  console.log('Magnitude: ', data.features[0].properties.mag)

  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  L.geoJSON(data, {
    style: function(feature){
      return{
        color:getColor(feature.geometry.coordinates[2])
      }
    },
    pointToLayer: function(feature,latlng){
      return new L.CircleMarker(latlng,{
        radius:(feature.properties.mag*2)**2,
        fillOpacity: 0.85
      });
    },
    onEachFeature: popUpMsg
  }).addTo(earthquakes);

 

  earthquakes.addTo(myMap);
});


// Used legend 
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 3, 6, 9, 12, 15, 18, 21],
        labels = [];

    // loop through density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

