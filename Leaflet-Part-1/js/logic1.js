// Create the Earthquake Visualization
// This is only GRAYSCALE

// Get USGS GeoJSON dataset for earthquakes in the past 7 days
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

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

  // Create tile layer - GRAYSCALE
  // Get API key from mapbox.com
  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> ",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style:    'mapbox/light-v11',
    access_token: api_key
  });

  // Create our map, giving it the grayscale map and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.820217, -97.806737 // Middle of Kansas
      // 37.09, -95.71
    ],
    zoom: 4.5,
    layers: [grayscale, earthquakes]
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
        stroke: true,
        weight: 0.5
      }
      return L.circle(latlng,markers);
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

// GET request to the queryURL
d3.json(queryURL).then(function (data) {
    
    console.log(data);
    // Send the data.features object to the createFeatures function.
    createFeatures(data.features);
});







