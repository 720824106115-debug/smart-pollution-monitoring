/**
 * SMART POLLUTION MONITORING - MAP MODULE (LIGHT THEME ONLY)
 * Leaflet.js integration with CartoDB Positron Light Tiles & custom light station markers.
 */

class MapModule {
  constructor() {
    this.map = null;
    this.markers = [];
    this.heatCircles = [];
    this.activeLayer = 'aqi'; // 'aqi', 'pm25', 'no2', 'co2'
  }

  initMap(containerId) {
    const el = document.getElementById(containerId);
    if (!el || typeof L === 'undefined') return;

    // Centered around metropolitan monitoring cluster
    this.map = L.map(containerId, {
      center: [40.7250, -73.9950],
      zoom: 12.5,
      zoomControl: true,
      attributionControl: false
    });

    // CartoDB Positron Light Tile Layer (100% Strict Light Theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    this.renderStations();
    this.renderHeatOverlay();
  }

  renderStations() {
    if (!this.map || !window.dataSimulator) return;

    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const stations = window.dataSimulator.stations;

    stations.forEach(station => {
      const level = window.dataSimulator.getAqiLevel(station.baseAqi);

      // Custom Light HTML Icon
      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div class="custom-station-marker ${level.class}" title="${station.name}: AQI ${station.baseAqi}">${station.baseAqi}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(this.map);

      // Custom Light Popup
      const popupContent = `
        <div class="map-popup-inner">
          <div class="map-popup-header">
            <div>
              <div class="map-popup-title">${station.name}</div>
              <div style="font-size: 0.72rem; color: #64748B;">${station.category}</div>
            </div>
            <span class="badge badge-${level.class}">${level.label}</span>
          </div>
          <div class="map-popup-stats">
            <div class="map-popup-stat">
              <div class="map-popup-stat-label">PM2.5</div>
              <div class="map-popup-stat-val">${station.pm25} <span style="font-size: 0.7rem; font-weight: normal;">µg/m³</span></div>
            </div>
            <div class="map-popup-stat">
              <div class="map-popup-stat-label">PM10</div>
              <div class="map-popup-stat-val">${station.pm10} <span style="font-size: 0.7rem; font-weight: normal;">µg/m³</span></div>
            </div>
            <div class="map-popup-stat">
              <div class="map-popup-stat-label">CO₂</div>
              <div class="map-popup-stat-val">${station.co2} <span style="font-size: 0.7rem; font-weight: normal;">ppm</span></div>
            </div>
            <div class="map-popup-stat">
              <div class="map-popup-stat-label">NO₂</div>
              <div class="map-popup-stat-val">${station.no2} <span style="font-size: 0.7rem; font-weight: normal;">ppb</span></div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm w-100" onclick="window.mapModule.selectStationFromMap('${station.id}')">
              Select Station
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });
      this.markers.push(marker);
    });
  }

  renderHeatOverlay() {
    if (!this.map || !window.dataSimulator) return;

    // Clear existing heat circles
    this.heatCircles.forEach(c => this.map.removeLayer(c));
    this.heatCircles = [];

    const stations = window.dataSimulator.stations;

    stations.forEach(station => {
      let color = '#2563EB';
      let radius = 1200;
      let opacity = 0.18;

      if (this.activeLayer === 'aqi') {
        const level = window.dataSimulator.getAqiLevel(station.baseAqi);
        color = level.color;
        radius = Math.min(1800, station.baseAqi * 14);
      } else if (this.activeLayer === 'pm25') {
        color = station.pm25 > 35 ? '#EF4444' : '#10B981';
        radius = Math.min(1600, station.pm25 * 25);
      } else if (this.activeLayer === 'no2') {
        color = '#8B5CF6';
        radius = Math.min(1500, station.no2 * 35);
      } else if (this.activeLayer === 'co2') {
        color = '#F59E0B';
        radius = Math.min(1500, (station.co2 - 350) * 8);
      }

      const circle = L.circle([station.lat, station.lng], {
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        radius: radius,
        stroke: false
      }).addTo(this.map);

      this.heatCircles.push(circle);
    });
  }

  setLayer(layerName) {
    this.activeLayer = layerName;
    this.renderHeatOverlay();
  }

  selectStationFromMap(stationId) {
    if (window.dataSimulator) {
      window.dataSimulator.setStation(stationId);
    }
    // Scroll smoothly to dashboard if needed
    const dash = document.getElementById('live-monitoring');
    if (dash) {
      dash.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateMarkers() {
    this.renderStations();
    this.renderHeatOverlay();
  }
}

window.mapModule = new MapModule();
