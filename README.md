# Leaflet GIS Web App

## Overview

The **Leaflet GIS Web App** is an interactive mapping tool built using the Leaflet.js library. This web-based GIS application allows users to create, edit, and export spatial data (points, lines, polygons) directly from their browser. With this app, you can manage multiple projects, layers, and export your work in formats like **KML**, **KMZ**, **GeoJSON**, and **CSV**.

### Key Features
- **Create and manage multiple projects** with different layers (points, lines, polygons).
- **Add draggable markers** for point layers, with live updates of their latitude, longitude, and UTM coordinates.
- **Edit and delete layers** and features in real time.
- **Geolocation support**: Automatically find and mark your current location on the map.
- **Export your data** in KML, KMZ, GeoJSON, or CSV formats.
- **No external storage**: All data is stored in the user's browser — no cloud or external servers involved.
- **Privacy-friendly**: Data is not sent to any third-party servers. Everything is kept local on the user's machine.

> ⚠️ **Important:** Since the app doesn’t store data on external servers, all data will be lost if the page is refreshed. Please make sure to export your work before leaving the app.

## Demo

Check out the 
<a href="https://abport.github.io/Leaflet-GIS-Web-App/"
    ><img
      src="https://img.shields.io/static/v1?label=&message=Live%20Demo%20Here&color=orange"
      height="25"
  /></a>

## Features Breakdown

### 1. Map Initialization
The app uses **OpenStreetMap** as the default base layer with options to switch to **Google Satellite** and **Google Streets**. The map is interactive, allowing you to zoom, pan, and add various layers.

### 2. Project & Layer Management
- Create new projects and layers (points, lines, polygons).
- Layers are editable, allowing you to update or delete features.
- Geolocation support to find and display the user's current location.

### 3. Editable Markers & Features
- Draggable markers for point layers with real-time updates.
- Convert lat/lng coordinates to UTM.
- Click on the map to add features or edit existing ones.

### 4. Data Export
- Export layers and features in KML, KMZ, GeoJSON, or CSV formats.
- Copy data directly to the clipboard for use in other GIS tools.

## Installation

### Requirements
- A modern web browser (Chrome, Firefox, Safari, Edge).
- No server-side dependencies. Just run the app locally!

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/leaflet-gis-web-app.git
   ```
2. Navigate into the project directory:
   ```bash
   cd leaflet-gis-web-app
   ```
3. Open the `index.html` file in your browser.

That's it! You’re ready to explore the app.

## Usage

### 1. Create a New Project
- Click the **New Project** button.
- Add layers like points, lines, or polygons.

### 2. Add Markers and Features
- For point layers, click on the map to place markers.
- Drag and drop markers to adjust their position.

### 3. Export Data
- Use the **Export** buttons to download your data in KML, KMZ, GeoJSON, or CSV formats.

### 4. Important Notes
- **No Data Persistence**: Data will be lost if the page is refreshed. Ensure you export your work before closing the page.

## Screenshots

| ![Projects](screenshot1.png) | ![Markers](screenshot2.png) | ![Export](screenshot3.png) |

## Technologies Used
- **Leaflet.js** - For map rendering and layer control.
- **Bootstrap** - For responsive UI design.
- **FileSaver.js** - For exporting data.
- **JSZip** - For generating KMZ files.

## Contributions
Feel free to contribute! Whether it's bug fixes, new features, or enhancements, all contributions are welcome. Just open a pull request or issue.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
