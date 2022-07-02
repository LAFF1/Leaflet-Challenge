// Multi-layer earthquake map with tectonic plates. v1 06.27.2022

// ------------------------------------------
// geojson url
//--------------------------------------------
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var turl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//--------------------------------------------
// Get layers for selectable backgrounds.
//--------------------------------------------

var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/dark-v10",
  accessToken: API_KEY
});

//--------------------------------------------
// Create Map Obect
//--------------------------------------------
var map = L.map("map", {
  center: [
    40.7, -94.5
  ],
  zoom: 5,
  layers: [graymap, satellitemap, outdoors, dark]
});

//--------------------------------------------
// Layers for earthquakes and tectonicplates.
//--------------------------------------------
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();
var overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
  };

//--------------------------------------------
// Background map and layer control
//--------------------------------------------
var baseMaps = {
  Satellite: satellitemap,
  Outdoors: outdoors,
  Grayscale: graymap,
  Dark: dark};

L.control
 .layers(baseMaps, overlays)
 .addTo(map);

//--------------------------------------------
// Set Map Features 
//--------------------------------------------
function createMap(response) {
 
  //--------------------------------------------
  // Create a GeoJSON layer containing the features 
  //--------------------------------------------
  L.geoJSON(response, {

    // use pointToLayer to create circle markers for each data's coordinates
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: DColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 0.3,
            opacity: 0.5,
            fillOpacity: 1
        });
    },
    onEachFeature: onEachFeature
}).addTo(earthquakes)

//--------------------------------------------
// Binding a pop-up to each layer
//--------------------------------------------
function onEachFeature(feature, layer) {

    // date formatter for popup
    var format = d3.timeFormat("%d-%b-%Y at %H:%M");

    layer.bindPopup(`<strong>Place: </strong> ${feature.properties.place}<br><strong>Time: </strong>${format(new Date(feature.properties.time))}<br><strong>Magnitude: </strong>${feature.properties.mag}<br><strong>Depth: </strong> ${feature.geometry.coordinates[2]} Kilometers<br>`);
};
  //add earthquakes to map
  earthquakes.addTo(map);

//--------------------------------------------
// Set up the legend
//--------------------------------------------
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var magnitudes = [-10, 10, 30, 50, 70, 90];
       var labels = [];
    
    // Label and color the legend
       for (var i = 0; i < magnitudes.length; i++) {
        //    labels.push('<li style="background-color:' + DColor(magnitudes[i] + 1) + '"> ' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '' : '+') + '</li>');
           labels.push('<li style="background-color:' + DColor(magnitudes[i] + 1) + '"><span>' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '' : '+') + '</span></li>');
        }
        // Add Legend HTML
        div.innerHTML = "<h5>Depth</h5>";
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };
  // Add legend to map.
  legend.addTo(map);

//--------------------------------------------
// Define a color function that sets the colour of a marker based on earthquake magnitude
//--------------------------------------------
function DColor(depth) {
    switch (true) {
    case depth > 90:
      return "#a7fb09";
    case depth > 70:
      return "#dcf900";
    case depth > 50:
      return "#f6de1a";
    case depth > 30:
      return "#fbb92e";
    case depth > 10:
      return "#faa35f";
    default:
      return "#ff5967";
    }
  };

//--------------------------------------------
// Define a markerSize for each event by magnitude.
//--------------------------------------------
function markerSize(magnitude) {
    if (magnitude === 0) {
        return 1;
      }
    return magnitude * 5;
}
};

//----------------------------------------
// Get Data and Build Maps 
//----------------------------------------
// Get USGS earthquakes
d3.json(url).then(function(response) {
    // Call createMap with response.features
    createMap(response.features);
});

// Get Tectonic Plate geoJSON data.
d3.json(turl).then(function(platedata) {
  // Style and population techtonic plate layer
  L.geoJson(platedata, {
    color: "orange",
    weight: 2
    }).addTo(tectonicplates);

    // Add tectonicplates layer to the map.
    tectonicplates.addTo(map);
});