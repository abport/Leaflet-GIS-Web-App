// Initialize map
var map = L.map("map").setView([0, 0], 2);

// Base layers
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

var googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

var googleStreets = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

var googleTraffic = L.tileLayer(
  "https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

// Layer control
var baseMaps = {
  OpenStreetMap: osm,
  "Google Satellite": googleSat,
  "Google Streets": googleStreets,
};

var overlayMaps = {
  "Google Traffic": googleTraffic,
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

// Custom locate control
L.Control.Locate = L.Control.extend({
  onAdd: function (map) {
    var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    var button = L.DomUtil.create("a", "leaflet-control-locate", container);
    button.innerHTML = "📍";
    button.href = "#";
    button.title = "Locate me";

    L.DomEvent.on(button, "click", function (e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.locate({ setView: true, maxZoom: 16 });
    });

    return container;
  },
});

new L.Control.Locate().addTo(map);

// Geolocation
var currentLocationMarker;
map.on("locationfound", function (e) {
  if (currentLocationMarker) {
    map.removeLayer(currentLocationMarker);
  }
  currentLocationMarker = L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are here!")
    .openPopup();
});

map.on("locationerror", function (e) {
  alert("Location access denied.");
});

// Custom icon for draggable marker
var customIcon = L.icon({
  iconUrl: "./css/images/leaf-green.png",
  shadowUrl: "./css/images/leaf-shadow.png",
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

// Draggable Marker (for point layers) - initially hidden
var draggableMarker = L.marker([0, 0], {
  icon: customIcon,
  draggable: true,
}).addTo(map);
draggableMarker.setOpacity(0);

// UTM Conversion Function
function getUTM(lat, lng) {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const toProjection =
    "+proj=utm +zone=" + zone + " +datum=WGS84 +units=m +no_defs";
  const point = proj4(proj4.defs("EPSG:4326"), toProjection, [lng, lat]);
  const easting = point[0];
  const northing = point[1];
  const utmZone = `${zone}${lat > 0 ? "N" : "S"}`;
  return [easting, northing, utmZone];
}

// Update Marker Position and Popup Content (for draggableMarker)
function updateMarkerPosition(latlng) {
  draggableMarker.setLatLng(latlng);

  let [easting, northing, utmZone] = getUTM(latlng.lat, latlng.lng);
  draggableMarker
    .bindPopup(
      `
        <p>Latitude: ${latlng.lat.toFixed(7)}<br>
        Longitude: ${latlng.lng.toFixed(7)}<br>
        Easting: ${easting}<br>
        Northing: ${northing}<br>
        UTM Zone: ${utmZone}</p>
        <button onclick='addLocationAndMarkerToTable()' class="btn btn-primary btn-sm small-text custom-icon-text">Add Location</button>
    `
    )
    .openPopup();
}

// Set Marker on Map Click (only for point layers)
map.on("click", function (e) {
  if (currentLayer && currentLayer.layerType === "point") {
    updateMarkerPosition(e.latlng);
    draggableMarker.setOpacity(1);
  }
});

// Draggable Marker Dragend Event
draggableMarker.on("dragend", function (e) {
  updateMarkerPosition(e.target.getLatLng());
});

// Initialize projects and layers
let projects = [];
let currentProject = null;
let currentLayer = null;

// Drawn items go to this layer group
let drawnItems = L.featureGroup().addTo(map);

// Initialize draw control
var drawControl;

// Event listeners for project/layer management
document
  .getElementById("newProjectBtn")
  .addEventListener("click", createNewProject);
document
  .getElementById("deleteProjectBtn")
  .addEventListener("click", deleteCurrentProject);
document
  .getElementById("newPointLayerBtn")
  .addEventListener("click", () => createNewLayer("point"));
document
  .getElementById("newLineLayerBtn")
  .addEventListener("click", () => createNewLayer("line"));
document
  .getElementById("newPolygonLayerBtn")
  .addEventListener("click", () => createNewLayer("polygon"));
document
  .getElementById("deleteLayerBtn")
  .addEventListener("click", deleteCurrentLayer);

// Event listeners for data management and export
document
  .getElementById("projectSelect")
  .addEventListener("change", selectProject);
document.getElementById("layerSelect").addEventListener("change", selectLayer);
document
  .getElementById("copyClipboardBtn")
  .addEventListener("click", copyToClipboard);
document.getElementById("exportKMLBtn").addEventListener("click", exportKML);
document.getElementById("exportKMZBtn").addEventListener("click", exportKMZ);
document
  .getElementById("exportGeoJSONBtn")
  .addEventListener("click", exportGeoJSON);
document.getElementById("exportCSVBtn").addEventListener("click", exportCSV);

// Create new project
function createNewProject() {
  let projectName = prompt("Enter project name:");
  if (projectName) {
    let project = {
      name: projectName,
      layers: [],
    };
    projects.push(project);
    updateProjectSelect();
    currentProject = project;
    document.getElementById("projectSelect").value = projectName;
    document.getElementById("newPointLayerBtn").disabled = false;
    document.getElementById("newLineLayerBtn").disabled = false;
    document.getElementById("newPolygonLayerBtn").disabled = false;
    document.getElementById("deleteProjectBtn").disabled = false;
  }
}

// Delete the currently selected project
function deleteCurrentProject() {
  if (currentProject) {
    if (
      confirm(
        `Are you sure you want to delete project "${currentProject.name}"? This action cannot be undone.`
      )
    ) {
      // Remove the project's layers from the map
      currentProject.layers.forEach((layer) => {
        removeLayerFromMap(layer.name);
      });

      let projectIndex = projects.findIndex(
        (p) => p.name === currentProject.name
      );
      if (projectIndex > -1) {
        projects.splice(projectIndex, 1);
      }
      currentProject = null;
      currentLayer = null;
      updateProjectSelect();
      updateLayerSelect();
      updateTable();
      document.getElementById("newPointLayerBtn").disabled = true;
      document.getElementById("newLineLayerBtn").disabled = true;
      document.getElementById("newPolygonLayerBtn").disabled = true;
      document.getElementById("deleteProjectBtn").disabled = true;
      draggableMarker.setOpacity(0);
    }
  }
}

// Create new layer
function createNewLayer(layerType) {
  if (currentProject) {
    let layerName = prompt("Enter layer name:");
    if (layerName) {
      let layer = {
        name: layerName,
        type: "FeatureCollection",
        features: [],
        layerType: layerType,
      };
      currentProject.layers.push(layer);
      updateLayerSelect();
      currentLayer = layer;
      document.getElementById("layerSelect").value = layerName;
      updateDrawControl(layerType);
      document.getElementById("deleteLayerBtn").disabled = false;

      if (layerType === "point") {
        updateMarkerPosition(map.getCenter());
        draggableMarker.setOpacity(1);
      }
    }
  }
}

// Delete currently selected layer
function deleteCurrentLayer() {
  if (currentProject && currentLayer) {
    if (
      confirm(
        `Are you sure you want to delete layer "${currentLayer.name}"? This action cannot be undone.`
      )
    ) {
      // Remove the layer from the map
      removeLayerFromMap(currentLayer.name);

      let layerIndex = currentProject.layers.findIndex(
        (l) => l.name === currentLayer.name
      );
      if (layerIndex > -1) {
        currentProject.layers.splice(layerIndex, 1);
      }
      currentLayer = null;
      updateLayerSelect();
      updateTable();
      document.getElementById("deleteLayerBtn").disabled = true;
      draggableMarker.setOpacity(0);
    }
  }
}

// Helper function to remove a layer from the map
function removeLayerFromMap(layerName) {
  drawnItems.eachLayer((drawnLayer) => {
    if (
      drawnLayer.feature &&
      drawnLayer.feature.properties.layerName === layerName
    ) {
      drawnItems.removeLayer(drawnLayer);
    }
  });
}

// Update draw control based on layer type
function updateDrawControl(layerType) {
  if (drawControl) {
    map.removeControl(drawControl);
  }

  let drawOptions = {
    draw: {
      polyline: false,
      polygon: false,
      circle: false,
      rectangle: false,
      marker: false,
      circlemarker: false,
    },
    edit: {
      featureGroup: drawnItems,
    },
  };

  switch (layerType) {
    case "point":
      drawOptions.draw.marker = true;
      break;
    case "line":
      drawOptions.draw.polyline = true;
      break;
    case "polygon":
      drawOptions.draw.polygon = true;
      break;
  }

  drawControl = new L.Control.Draw(drawOptions);
  map.addControl(drawControl);
}

// Select project
function selectProject() {
  let projectName = this.value;
  currentProject = projects.find((p) => p.name === projectName);
  updateLayerSelect();
  document.getElementById("newPointLayerBtn").disabled = !currentProject;
  document.getElementById("newLineLayerBtn").disabled = !currentProject;
  document.getElementById("newPolygonLayerBtn").disabled = !currentProject;
  document.getElementById("deleteProjectBtn").disabled = !currentProject;
}

// Select layer
function selectLayer() {
  let layerName = this.value;
  currentLayer = currentProject
    ? currentProject.layers.find((l) => l.name === layerName)
    : null;

  drawnItems.clearLayers();

  updateTable();
  if (currentLayer) {
    updateDrawControl(currentLayer.layerType);
    document.getElementById("deleteLayerBtn").disabled = false;

    currentLayer.features.forEach((feature) => {
      let leafletObject = createLeafletObject(feature, feature.properties);
      if (leafletObject) {
        leafletObject.addTo(drawnItems);
      }
    });

    if (currentLayer.layerType === "point") {
      updateMarkerPosition(map.getCenter());
      draggableMarker.setOpacity(1);
    } else {
      draggableMarker.setOpacity(0);
    }
  } else {
    document.getElementById("deleteLayerBtn").disabled = true;
    draggableMarker.setOpacity(0);
  }
}

// Update project select
function updateProjectSelect() {
  let select = document.getElementById("projectSelect");
  select.innerHTML = '<option value="">Select a project</option>';
  projects.forEach((project) => {
    let option = document.createElement("option");
    option.value = project.name;
    option.textContent = project.name;
    select.appendChild(option);
  });
}

// Update layer select
function updateLayerSelect() {
  let select = document.getElementById("layerSelect");
  select.innerHTML = '<option value="">Select a layer</option>';
  if (currentProject) {
    currentProject.layers.forEach((layer) => {
      let option = document.createElement("option");
      option.value = layer.name;
      option.textContent = layer.name;
      select.appendChild(option);
    });
    select.disabled = false;
  } else {
    select.disabled = true;
  }
}

// Add Location AND Marker to Table
function addLocationAndMarkerToTable() {
  if (currentLayer && currentLayer.layerType === "point") {
    let latlng = draggableMarker.getLatLng();
    let feature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [latlng.lng, latlng.lat],
      },
      properties: {
        name: `Point ${currentLayer.features.length + 1}`,
        description: "",
        layerName: currentLayer.name,
      },
    };

    currentLayer.features.push(feature);

    let newMarker = L.marker(latlng, {
      draggable: true,
      icon: customIcon, // Use the custom icon here
    }).addTo(drawnItems);

    newMarker.feature = feature;

    newMarker.on("dragend", function (e) {
      let updatedLatLng = e.target.getLatLng();
      let featureIndex = currentLayer.features.indexOf(feature);
      if (featureIndex > -1) {
        currentLayer.features[featureIndex].geometry.coordinates = [
          updatedLatLng.lng,
          updatedLatLng.lat,
        ];
        updateTable();
      }
    });

    updateTable();
  } else {
    alert("Please select a Point layer first!");
  }
}

// Update Table
function updateTable() {
  let tbody = document.querySelector("#locationTable tbody");
  tbody.innerHTML = "";
  if (currentLayer) {
    let headerRow = document.querySelector("#locationTable thead tr");
    headerRow.innerHTML = `
            <th>Name</th>
            <th>Description</th>
            ${
              currentLayer.layerType === "point"
                ? "<th>Latitude</th><th>Longitude</th>"
                : ""
            }
            <th>Actions</th>
        `;

    currentLayer.features.forEach((feature, index) => {
      let row = tbody.insertRow();
      let nameCell = row.insertCell();
      nameCell.contentEditable = true;
      nameCell.textContent = feature.properties.name;
      nameCell.addEventListener("blur", function () {
        feature.properties.name = this.textContent;
        // Find the corresponding marker and update its popup
        drawnItems.eachLayer(function (layer) {
          if (layer.feature && layer.feature === feature) {
            layer.feature.properties.name = this.textContent;
          }
        }, this);
      });

      let descCell = row.insertCell();
      descCell.contentEditable = true;
      descCell.textContent = feature.properties.description;
      descCell.addEventListener("blur", function () {
        feature.properties.description = this.textContent;
        // Find the corresponding marker and update its popup
        drawnItems.eachLayer(function (layer) {
          if (layer.feature && layer.feature === feature) {
            layer.feature.properties.description = this.textContent;
          }
        }, this);
      });

      if (currentLayer.layerType === "point") {
        let latCell = row.insertCell();
        latCell.textContent = feature.geometry.coordinates[1].toFixed(6);
        let lngCell = row.insertCell();
        lngCell.textContent = feature.geometry.coordinates[0].toFixed(6);
      }

      let actionsCell = row.insertCell();

      // Zoom to Feature Button
      let zoomToBtn = document.createElement("button");
      zoomToBtn.innerHTML = '<i class="bi bi-geo-alt-fill"></i>';
      zoomToBtn.className = "btn btn-primary btn-sm me-2";
      zoomToBtn.addEventListener("click", function () {
        zoomToFeature(feature);
      });
      actionsCell.appendChild(zoomToBtn);

      // Delete Button
      let deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
      deleteBtn.className = "btn btn-danger btn-sm";
      deleteBtn.addEventListener("click", function () {
        // Remove the feature from the map
        drawnItems.eachLayer(function (layerOnMap) {
          if (layerOnMap.feature && layerOnMap.feature === feature) {
            drawnItems.removeLayer(layerOnMap);
          }
        });

        // Remove the feature from the data
        currentLayer.features.splice(index, 1);
        updateTable();
      });
      actionsCell.appendChild(deleteBtn);
    });
  }
}

// Function to convert GeoJSON to KML
function generateKML() {
  let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>${currentLayer.name}</name>
        <description>Exported from Leaflet GIS Web App</description>`;

  currentLayer.features.forEach((feature) => {
    kmlContent += `
        <Placemark>
          <name>${feature.properties.name}</name>
          <description>${feature.properties.description}</description>`;

    if (feature.geometry.type === "Point") {
      kmlContent += `
            <Point>
              <coordinates>${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}</coordinates>
            </Point>`;
    } else if (feature.geometry.type === "LineString") {
      kmlContent += `
            <LineString>
              <coordinates>`;
      feature.geometry.coordinates.forEach((coord) => {
        kmlContent += `${coord[0]},${coord[1]} `;
      });
      kmlContent += `</coordinates>
            </LineString>`;
    } else if (feature.geometry.type === "Polygon") {
      kmlContent += `
            <Polygon>
              <outerBoundaryIs>
                <LinearRing>
                  <coordinates>`;
      feature.geometry.coordinates[0].forEach((coord) => {
        kmlContent += `${coord[0]},${coord[1]} `;
      });
      kmlContent += `</coordinates>
                </LinearRing>
              </outerBoundaryIs>
            </Polygon>`;
    }

    kmlContent += `
        </Placemark>`;
  });

  kmlContent += `
      </Document>
    </kml>`;

  return kmlContent;
}

// Export as KML
function exportKML() {
  if (currentLayer) {
    let kmlContent = generateKML();
    let blob = new Blob([kmlContent], {
      type: "application/vnd.google-earth.kml+xml",
    });
    saveAs(blob, `${currentLayer.name}.kml`);
  } else {
    alert("Please select a layer before exporting.");
  }
}

// Export as KMZ
function exportKMZ() {
  if (currentLayer) {
    let kmlContent = generateKML();
    let zip = new JSZip();
    zip.file("doc.kml", kmlContent);
    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, `${currentLayer.name}.kmz`);
    });
  } else {
    alert("Please select a layer before exporting.");
  }
}

// Export as GeoJSON
function exportGeoJSON() {
  if (currentLayer) {
    let data = JSON.stringify(currentLayer);
    let blob = new Blob([data], { type: "application/json" });
    saveAs(blob, `${currentLayer.name}.geojson`);
  } else {
    alert("Please select a layer before exporting.");
  }
}

// Export as CSV
function exportCSV() {
  if (currentLayer) {
    let csvContent = "\uFEFF";
    csvContent += "Name,Description,Type,Latitude,Longitude,Coordinates\n";
    currentLayer.features.forEach((feature) => {
      let name = feature.properties.name;
      let description = feature.properties.description;
      let type = feature.geometry.type;
      let latitude = type === "Point" ? feature.geometry.coordinates[1] : "";
      let longitude = type === "Point" ? feature.geometry.coordinates[0] : "";
      let coordinates = JSON.stringify(feature.geometry.coordinates);
      csvContent += `"${name}","${description}","${type}","${latitude}","${longitude}","${coordinates}"\n`;
    });
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${currentLayer.name}.csv`);
  } else {
    alert("Please select a layer before exporting.");
  }
}

// Copy to clipboard
function copyToClipboard() {
  if (currentLayer) {
    let data = JSON.stringify(currentLayer);
    navigator.clipboard.writeText(data).then(
      function () {
        alert("Data copied to clipboard!");
      },
      function (err) {
        console.error("Could not copy text: ", err);
      }
    );
  } else {
    alert("Please select a layer before copying to clipboard.");
  }
}

// Draw created event
map.on("draw:created", function (e) {
  var type = e.layerType,
    layer = e.layer;

  if (currentLayer) {
    let feature = layer.toGeoJSON();
    feature.properties = {
      name: `${type === "marker" ? "Point" : type} ${
        currentLayer.features.length + 1
      }`,
      description: "",
      layerName: currentLayer.name,
    };
    currentLayer.features.push(feature);
    layer.feature = feature;

    // Make markers draggable after they are created
    if (layer instanceof L.Marker) {
      layer.options.draggable = true;
      layer.on("dragend", function (e) {
        let updatedLatLng = e.target.getLatLng();
        let featureIndex = currentLayer.features.indexOf(layer.feature);
        if (featureIndex > -1) {
          currentLayer.features[featureIndex].geometry.coordinates = [
            updatedLatLng.lng,
            updatedLatLng.lat,
          ];
          updateTable();
        }
      });
    }

    // Always add the new layer to drawnItems
    drawnItems.addLayer(layer);

    updateTable();
  } else {
    alert("Please select a layer first!");
  }
});

// Edit start event
map.on("draw:editstart", function (e) {
  console.log("Edit started", e);
});

// Edit stop event
map.on("draw:editstop", function (e) {
  console.log("Edit stopped", e);

  drawnItems.eachLayer(function (layer) {
    if (layer.editing) {
      let updatedGeoJSON = layer.toGeoJSON();
      let featureIndex = currentLayer.features.findIndex(
        (f) => f.properties.name === layer.feature.properties.name
      );

      if (featureIndex > -1) {
        currentLayer.features[featureIndex] = updatedGeoJSON;
        updateTable();
      }
    }
  });
});

// Delete start event
map.on("draw:deletestart", function (e) {
  console.log("Delete started", e);
});

// Delete stop event
map.on("draw:deletestop", function (e) {
  console.log("Delete stopped", e);
  // You might want to add logic here to also delete the features from your `currentLayer.features` array
  // if you are deleting them permanently from the map
});

// Function to create Leaflet objects from GeoJSON features
function createLeafletObject(feature, properties) {
  let leafletObject;
  switch (feature.geometry.type) {
    case "Point":
      leafletObject = L.marker(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        {
          draggable: true,
          icon: customIcon, // Use the custom icon for all points
        }
      ).on("dragend", function (e) {
        let updatedLatLng = e.target.getLatLng();
        let featureIndex = currentLayer.features.findIndex(
          (f) => f.properties.name === properties.name
        );
        if (featureIndex > -1) {
          currentLayer.features[featureIndex].geometry.coordinates = [
            updatedLatLng.lng,
            updatedLatLng.lat,
          ];
          updateTable();
        }
      });
      break;
    case "LineString":
      leafletObject = L.polyline(
        feature.geometry.coordinates.map((coord) => [coord[1], coord[0]]),
        { draggable: true }
      ).on("edit", function (e) {
        let updatedLatLngs = e.target.getLatLngs();
        let updatedCoordinates = updatedLatLngs.map((latlng) => [
          latlng.lng,
          latlng.lat,
        ]);
        let featureIndex = currentLayer.features.findIndex(
          (f) => f.properties.name === properties.name
        );
        if (featureIndex > -1) {
          currentLayer.features[featureIndex].geometry.coordinates =
            updatedCoordinates;
          updateTable();
        }
      });
      break;
    case "Polygon":
      leafletObject = L.polygon(
        feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]),
        { draggable: true }
      ).on("edit", function (e) {
        let updatedLatLngs = e.target.getLatLngs()[0];
        let updatedCoordinates = updatedLatLngs.map((latlng) => [
          latlng.lng,
          latlng.lat,
        ]);
        let featureIndex = currentLayer.features.findIndex(
          (f) => f.properties.name === properties.name
        );
        if (featureIndex > -1) {
          currentLayer.features[featureIndex].geometry.coordinates[0] =
            updatedCoordinates;
          updateTable();
        }
      });
      break;
    default:
      return null;
  }

  leafletObject.feature = feature;
  return leafletObject;
}

// Function to zoom to a feature
function zoomToFeature(feature) {
  if (feature.geometry.type === "Point") {
    map.setView(
      [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
      15
    );
  } else {
    let bounds = L.geoJSON(feature).getBounds();
    map.fitBounds(bounds);
  }
}
