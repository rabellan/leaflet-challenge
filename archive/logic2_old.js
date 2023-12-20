// Gather and plot more data options

// Function to determine marker color by depth
function legendColor(depth){

  let color;

  switch (true) {
    case depth < 10:
      color = "#00FF00";
      break;
    case depth < 30:
      color = "greenyellow";
      break;
    case depth < 50:
      color = "yellow";
      break;
    case depth < 70:
      color = "orange";
      break;
    case depth < 90:
      color = "orangered";
      break;
    default:
      color = "#FF0000";
  }

  return color;
}

function createMap(earthquakes) {

  // Create tile layers
  // Get API key from mapbox.com
  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> ",
    style:    'mapbox/satellite-v9',
    access_token: api_key
  });
  
  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> ",
    style:    'mapbox/light-v11',
    access_token: api_key
  });

  var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> ",
    style:    'mapbox/outdoors-v12',
    access_token: api_key
  });

  // Create layer for tectonic plates
  tectonicPlates = new L.layerGroup();

    // tectonicURL data from https://github.com/fraxen/tectonicplates
    d3.json(tectonicURL).then(function (plates) {

        // Console log the data retrieved 
        console.log(plates);
        L.geoJSON(plates, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
    });

    // Create a baseMaps object.
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };
    
    // Create our map with all three layers: satellite, earthquakes, tectonicPlates
  var myMap = L.map("map", {
    center: [
      37.820217, -97.806737 // Middle of Kansas
      //37.09, -95.71
    ],
    zoom: 4.5,
    layers: [satellite, earthquakes, tectonicPlates]
  });

  // Add legend div
  var legend = L.control({position: "bottomright"});
  legend.onAdd = function() {

    var div = L.DomUtil.create("div", "info legend"), depth = [-10, 10, 30, 50, 70, 90];
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML += '<i style="background:' + legendColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap)

  // Create a layer control with baseMaps and overlayMaps
  // then add to myMap
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
};

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // Point to layer used to alter markers
    pointToLayer: function(feature, latlng) {

      // Determine the style of markers based on properties
      var markers = {
        radius: feature.properties.mag * 20000,
        fillColor: legendColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        weight: 0.5
      }
      return L.circle(latlng,markers);
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

// Get USGS GeoJSON dataset for earthquakes in the past 7 days
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get tectonic data from https://github.com/fraxen/tectonicplates
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryURL).then(function (data) {
  // Console log the data retrieved 
  console.log(data);
  // Send the data.features object to the createFeatures function.
  createFeatures(data.features);
});