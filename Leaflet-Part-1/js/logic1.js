// Color gradient function depending on depth
function legendColor(depth) {
  if (depth < 10) return "#00FF00";
  if (depth < 30) return "greenyellow";
  if (depth < 50) return "yellow";
  if (depth < 70) return "orange";
  if (depth < 90) return "orangered";
  return "#FF0000";
}

// Function to create the map
function createMap(earthquakes) {
  const grayscaleLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> ",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style: 'mapbox/light-v11',
    access_token: api_key
  });

  const myMap = L.map("map", {
    center: [37.820217, -97.806737], // Middle of Kansas
    zoom: 4.5,
    layers: [grayscaleLayer, earthquakes]
  });

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    const depthValues = [-10, 10, 30, 50, 70, 90];
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
    for (let i = 0; i < depthValues.length; i++) {
      div.innerHTML += `<i style="background:${legendColor(depthValues[i] + 1)}"></i> ${depthValues[i]}${depthValues[i + 1] ? '&ndash;' + depthValues[i + 1] + '<br>' : '+'}`;
    }
    return div;
  };
  legend.addTo(myMap);
}

// Function to create features
function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    const popupContent = `<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`;
    layer.bindPopup(popupContent);
  }

  const earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      const markerOptions = {
        radius: feature.properties.mag * 20000,
        fillColor: legendColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        color: "black",
        stroke: true,
        weight: 0.5
      };
      return L.circle(latlng, markerOptions);
    }
  });

  createMap(earthquakes);
}

// GET request to the queryURL for earthquake data in the last 7 days
const queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(queryURL).then(createFeatures);
