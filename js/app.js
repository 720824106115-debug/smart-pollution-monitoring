/**
 * SMART POLLUTION MONITORING - MAIN APPLICATION ORCHESTRATOR
 * Coordinates telemetry data, AI predictor, Leaflet map, Chart.js, and strict light theme UI.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStationDropdowns();
  initDashboard();
  initAiPredictor();
  initAnalytics();
  initMapSection();
  initAlertsSection();
  initModalsAndToasts();
});

/* --------------------------------------------------------------------------
   1. NAVBAR & NAVIGATION
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navbarNav = document.querySelector('.navbar-nav');

  if (mobileToggle && navbarNav) {
    mobileToggle.addEventListener('click', () => {
      navbarNav.classList.toggle('open');
    });
  }

  // Smooth scroll and active state sync on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (navbarNav) navbarNav.classList.remove('open');
    });
  });
}

/* --------------------------------------------------------------------------
   2. STATION SELECTORS & SYNCHRONIZATION
   -------------------------------------------------------------------------- */
function initStationDropdowns() {
  const stationSelect = document.getElementById('dashboard-station-select');
  const predStationSelect = document.getElementById('pred-station-select');
  if (!window.dataSimulator) return;

  const stations = window.dataSimulator.stations;

  const populateSelect = (selectEl) => {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    stations.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `${st.name} (${st.category})`;
      selectEl.appendChild(opt);
    });
  };

  populateSelect(stationSelect);
  populateSelect(predStationSelect);

  if (stationSelect) {
    stationSelect.addEventListener('change', (e) => {
      window.dataSimulator.setStation(e.target.value);
      if (predStationSelect) predStationSelect.value = e.target.value;
      if (window.chartsModule) {
        window.chartsModule.updateHistoryChart(e.target.value);
      }
      showToast(`Switched monitoring feed to ${window.dataSimulator.getCurrentStation().name}`, 'info');
    });
  }

  if (predStationSelect) {
    predStationSelect.addEventListener('change', (e) => {
      if (stationSelect) stationSelect.value = e.target.value;
      window.dataSimulator.setStation(e.target.value);
      triggerAIPrediction();
    });
  }
}

/* --------------------------------------------------------------------------
   3. DASHBOARD & TELEMETRY SUBSCRIBER
   -------------------------------------------------------------------------- */
function initDashboard() {
  if (!window.dataSimulator || !window.chartsModule) return;

  // Initialize live chart and 24h history chart
  window.chartsModule.initLiveChart('liveTelemetryChart');
  window.chartsModule.initHistoryChart('history24hChart', window.dataSimulator.currentStationId);

  // Subscribe to simulator telemetry ticks
  window.dataSimulator.startPolling((currentStation, allStations) => {
    updateDashboardUI(currentStation);
    window.chartsModule.updateLiveChart(currentStation);
    if (window.mapModule) window.mapModule.updateMarkers();
  });

  // Initial update
  updateDashboardUI(window.dataSimulator.getCurrentStation());

  // Live stream pause/play button
  const toggleLiveBtn = document.getElementById('btn-toggle-live');
  if (toggleLiveBtn) {
    toggleLiveBtn.addEventListener('click', () => {
      const isLive = window.dataSimulator.toggleLive();
      toggleLiveBtn.innerHTML = isLive
        ? '<i class="fas fa-pause"></i> Pause Stream'
        : '<i class="fas fa-play"></i> Resume Stream';
      showToast(isLive ? 'Live telemetry stream resumed.' : 'Live telemetry stream paused.', 'info');
    });
  }

  // Quick simulate spike button
  const simulateSpikeBtn = document.getElementById('btn-simulate-spike');
  if (simulateSpikeBtn) {
    simulateSpikeBtn.addEventListener('click', () => {
      const sp = window.dataSimulator.triggerSimulatedSpike();
      if (sp) {
        showToast(`Simulated rapid pollutant spike triggered at ${sp.name}!`, 'warning');
        if (window.alertsModule) {
          window.alertsModule.addAlert({
            severity: 'critical',
            title: `Rapid Atmospheric Spike (${sp.baseAqi} AQI)`,
            station: sp.name,
            stationId: sp.id,
            desc: `Real-time sensor detected surge in PM2.5 (${sp.pm25} µg/m³) and PM10 (${sp.pm10} µg/m³). AI anomaly filter alerted municipal environmental team.`
          });
        }
      }
    });
  }
}

function updateDashboardUI(st) {
  const level = window.dataSimulator.getAqiLevel(st.baseAqi);

  // Update Hero elements
  const heroAqiNum = document.getElementById('hero-aqi-num');
  const heroAqiStatus = document.getElementById('hero-aqi-status');
  const heroAqiDesc = document.getElementById('hero-aqi-desc');
  const heroStationName = document.getElementById('hero-preview-station-name');
  const heroPm25 = document.getElementById('hero-pm25-val');
  const heroPm10 = document.getElementById('hero-pm10-val');
  const heroCo2 = document.getElementById('hero-co2-val');

  if (heroAqiNum) heroAqiNum.textContent = st.baseAqi;
  if (heroAqiStatus) {
    heroAqiStatus.textContent = level.label;
    heroAqiStatus.style.color = level.color;
  }
  if (heroAqiDesc) heroAqiDesc.textContent = level.desc;
  if (heroStationName) heroStationName.textContent = st.name;
  if (heroPm25) heroPm25.textContent = `${st.pm25} µg`;
  if (heroPm10) heroPm10.textContent = `${st.pm10} µg`;
  if (heroCo2) heroCo2.textContent = `${st.co2} ppm`;

  // Update Stat Cards Grid
  const elAqi = document.getElementById('stat-aqi-val');
  const elAqiBadge = document.getElementById('stat-aqi-badge');
  const elPm25 = document.getElementById('stat-pm25-val');
  const elPm10 = document.getElementById('stat-pm10-val');
  const elCo2 = document.getElementById('stat-co2-val');
  const elNo2 = document.getElementById('stat-no2-val');
  const elO3 = document.getElementById('stat-o3-val');
  const elTempHum = document.getElementById('stat-temp-val');
  const elWind = document.getElementById('stat-wind-val');

  if (elAqi) elAqi.textContent = st.baseAqi;
  if (elAqiBadge) {
    elAqiBadge.className = `badge badge-${level.class}`;
    elAqiBadge.textContent = level.label;
  }
  if (elPm25) elPm25.textContent = st.pm25;
  if (elPm10) elPm10.textContent = st.pm10;
  if (elCo2) elCo2.textContent = st.co2;
  if (elNo2) elNo2.textContent = st.no2;
  if (elO3) elO3.textContent = st.o3;
  if (elTempHum) elTempHum.textContent = `${st.temp}°C / ${st.humidity}%`;
  if (elWind) elWind.textContent = `${st.windSpeed} km/h ${st.windDir}`;

  // Update Radial Gauge
  const gaugeNum = document.getElementById('gauge-aqi-num');
  const gaugeLabel = document.getElementById('gauge-aqi-label');
  const gaugeArc = document.getElementById('gauge-arc-fill');

  if (gaugeNum) gaugeNum.textContent = st.baseAqi;
  if (gaugeLabel) {
    gaugeLabel.textContent = level.label;
    gaugeLabel.style.color = level.color;
  }
  if (gaugeArc) {
    // Total arc circumference for 180 deg semi-circle is approx 283
    const percentage = Math.min(1, st.baseAqi / 300);
    const strokeOffset = 283 - (percentage * 283);
    gaugeArc.style.strokeDashoffset = strokeOffset;
    gaugeArc.style.stroke = level.color;
  }

  // Update Pollutant Bars Breakdown
  updatePollutantBar('bar-pm25', st.pm25, 75, 'µg/m³');
  updatePollutantBar('bar-pm10', st.pm10, 150, 'µg/m³');
  updatePollutantBar('bar-co2', st.co2 - 300, 500, 'ppm', st.co2);
  updatePollutantBar('bar-no2', st.no2, 50, 'ppb');
  updatePollutantBar('bar-o3', st.o3, 80, 'ppb');

  // Station hardware telemetry info
  const sensorModel = document.getElementById('dash-sensor-model');
  const sensorBattery = document.getElementById('dash-sensor-battery');
  const sensorUptime = document.getElementById('dash-sensor-uptime');
  if (sensorModel) sensorModel.textContent = st.sensorModel;
  if (sensorBattery) sensorBattery.textContent = st.battery;
  if (sensorUptime) sensorUptime.textContent = st.uptime;
}

function updatePollutantBar(barId, val, maxVal, unit, displayVal) {
  const container = document.getElementById(barId);
  if (!container) return;

  const valEl = container.querySelector('.pollutant-val');
  const fillEl = container.querySelector('.pollutant-fill');
  if (valEl) valEl.textContent = `${displayVal !== undefined ? displayVal : val} ${unit}`;

  if (fillEl) {
    const pct = Math.min(100, Math.round((val / maxVal) * 100));
    fillEl.style.width = `${pct}%`;

    fillEl.className = 'pollutant-fill';
    if (pct < 45) fillEl.classList.add('good');
    else if (pct < 75) fillEl.classList.add('moderate');
    else if (pct < 90) fillEl.classList.add('high');
    else fillEl.classList.add('critical');
  }
}

/* --------------------------------------------------------------------------
   4. AI PREDICTOR & WHAT-IF SIMULATOR
   -------------------------------------------------------------------------- */
function initAiPredictor() {
  const horizonBtns = document.querySelectorAll('.horizon-btn');
  const sliders = [
    { id: 'slider-temp', valId: 'val-temp', suffix: '°C' },
    { id: 'slider-humidity', valId: 'val-humidity', suffix: '%' },
    { id: 'slider-wind', valId: 'val-wind', suffix: ' km/h' },
    { id: 'slider-traffic', valId: 'val-traffic', suffix: '/100' },
    { id: 'slider-industrial', valId: 'val-industrial', suffix: '/100' }
  ];

  let currentHorizon = '24h';

  horizonBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      horizonBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHorizon = btn.dataset.horizon;
      triggerAIPrediction();
    });
  });

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const valEl = document.getElementById(s.valId);
    if (el && valEl) {
      el.addEventListener('input', () => {
        valEl.textContent = `${el.value}${s.suffix}`;
        triggerAIPrediction();
      });
    }
  });

  // What-If policy checkboxes
  const policyCheckboxes = document.querySelectorAll('.policy-check');
  policyCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      triggerAIPrediction();
    });
  });

  const runBtn = document.getElementById('btn-run-prediction');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Neural Inference Computing...';
      runBtn.disabled = true;

      setTimeout(() => {
        triggerAIPrediction();
        runBtn.innerHTML = '<i class="fas fa-microchip"></i> Run AI Forecast Model';
        runBtn.disabled = false;
        showToast('AI Ensemble Forecast recomputed successfully!', 'success');
      }, 400);
    });
  }

  // Initial trigger
  triggerAIPrediction();
}

function triggerAIPrediction() {
  if (!window.aiEngine) return;

  const activeHorizonBtn = document.querySelector('.horizon-btn.active');
  const horizon = activeHorizonBtn ? activeHorizonBtn.dataset.horizon : '24h';

  const temp = parseFloat(document.getElementById('slider-temp')?.value || 26);
  const humidity = parseFloat(document.getElementById('slider-humidity')?.value || 58);
  const windSpeed = parseFloat(document.getElementById('slider-wind')?.value || 14);
  const trafficIndex = parseFloat(document.getElementById('slider-traffic')?.value || 70);
  const industrialIndex = parseFloat(document.getElementById('slider-industrial')?.value || 50);

  const activePolicies = [];
  document.querySelectorAll('.policy-check:checked').forEach(cb => {
    activePolicies.push(cb.value);
  });

  const result = window.aiEngine.predict({
    horizon,
    temp,
    humidity,
    windSpeed,
    trafficIndex,
    industrialIndex,
    activePolicies
  });

  // Update Prediction UI
  const predAqiNum = document.getElementById('pred-aqi-num');
  const predLevelBadge = document.getElementById('pred-level-badge');
  const predConfidenceNum = document.getElementById('pred-confidence-num');
  const predConfidenceBar = document.getElementById('pred-confidence-bar');
  const predPm25 = document.getElementById('pred-pm25-val');
  const predPm10 = document.getElementById('pred-pm10-val');
  const predDeltaBadge = document.getElementById('pred-delta-badge');
  const predRecommendation = document.getElementById('pred-recommendation-text');

  if (predAqiNum) predAqiNum.textContent = result.predictedAqi;
  if (predLevelBadge) {
    predLevelBadge.className = `pred-level-tag badge badge-${result.level.class}`;
    predLevelBadge.textContent = result.level.label;
  }
  if (predConfidenceNum) predConfidenceNum.textContent = `${result.confidence}%`;
  if (predConfidenceBar) predConfidenceBar.style.width = `${result.confidence}%`;
  if (predPm25) predPm25.textContent = `${result.predictedPm25} µg/m³`;
  if (predPm10) predPm10.textContent = `${result.predictedPm10} µg/m³`;
  if (predRecommendation) predRecommendation.textContent = result.recommendation;

  if (predDeltaBadge) {
    if (result.policyReductions > 0) {
      predDeltaBadge.style.display = 'inline-flex';
      predDeltaBadge.className = 'badge badge-good';
      predDeltaBadge.innerHTML = `<i class="fas fa-arrow-down"></i> -${result.policyReductions} AQI via Policy`;
    } else {
      predDeltaBadge.style.display = 'none';
    }
  }

  // Update SHAP Feature weights
  const shapList = document.getElementById('shap-feature-list');
  if (shapList) {
    let shapHtml = '';
    result.shapWeights.forEach(item => {
      shapHtml += `
        <div class="shap-item">
          <span class="shap-label">${item.feature}</span>
          <div class="shap-bar-container">
            <div class="shap-bar" style="width: ${item.weight}%; background-color: ${item.color};"></div>
          </div>
          <span class="shap-val">${item.weight}%</span>
        </div>
      `;
    });
    shapList.innerHTML = shapHtml;
  }

  // Update Forecast Trajectory Chart
  const currentStation = window.dataSimulator ? window.dataSimulator.getCurrentStation() : { baseAqi: 78 };
  if (window.chartsModule) {
    window.chartsModule.initForecastChart('forecastTrajectoryChart', horizon, currentStation.baseAqi, result.predictedAqi);
  }
}

/* --------------------------------------------------------------------------
   5. ANALYTICS & ANOMALY LOG
   -------------------------------------------------------------------------- */
function initAnalytics() {
  if (!window.chartsModule) return;
  window.chartsModule.initComparisonChart('comparison7DayChart');

  // Populate Anomaly Detection Log Table
  const anomalyBody = document.getElementById('anomaly-table-body');
  if (anomalyBody) {
    const anomalies = [
      { time: 'Today, 09:14', station: 'Industrial District 4', metric: 'PM10 (118 µg/m³)', score: '98.2% (Isolation Forest)', status: 'Resolved' },
      { time: 'Today, 07:45', station: 'Metro Terminal South', metric: 'NO₂ (39 ppb)', score: '94.6% (Isolation Forest)', status: 'Investigating' },
      { time: 'Yesterday, 18:30', station: 'City Center (HQ)', metric: 'CO₂ (580 ppm)', score: '91.8% (Isolation Forest)', status: 'Resolved' },
      { time: 'Yesterday, 14:10', station: 'Industrial District 4', metric: 'PM2.5 (72 µg/m³)', score: '96.1% (Isolation Forest)', status: 'Resolved' }
    ];

    let html = '';
    anomalies.forEach(a => {
      const isResolved = a.status === 'Resolved';
      html += `
        <tr>
          <td><strong>${a.time}</strong></td>
          <td>${a.station}</td>
          <td><span class="badge badge-high">${a.metric}</span></td>
          <td><span style="font-family: monospace; font-size: 0.8rem; color: #64748B;">${a.score}</span></td>
          <td>
            <span class="badge ${isResolved ? 'badge-good' : 'badge-moderate'}">
              <i class="fas ${isResolved ? 'fa-check-circle' : 'fa-clock'}"></i> ${a.status}
            </span>
          </td>
        </tr>
      `;
    });
    anomalyBody.innerHTML = html;
  }

  // Export CSV Action
  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const station = window.dataSimulator ? window.dataSimulator.getCurrentStation() : { name: 'City Center' };
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Timestamp,Station,AQI,PM2.5,PM10,CO2,NO2,O3,Temp,Humidity\n"
        + `${new Date().toISOString()},${station.name},${station.baseAqi},${station.pm25},${station.pm10},${station.co2},${station.no2},${station.o3},${station.temp},${station.humidity}\n`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `AirQuality_${station.name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV Air Quality Telemetry Report exported successfully.', 'success');
    });
  }
}

/* --------------------------------------------------------------------------
   6. INTERACTIVE MAP SECTION
   -------------------------------------------------------------------------- */
function initMapSection() {
  if (window.mapModule) {
    window.mapModule.initMap('leafletPollutionMap');
  }

  // Map layer toggle buttons
  const mapLayerBtns = document.querySelectorAll('.map-layer-btn');
  mapLayerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mapLayerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const layer = btn.dataset.layer;
      if (window.mapModule) {
        window.mapModule.setLayer(layer);
        showToast(`Map dispersion overlay updated to: ${layer.toUpperCase()}`, 'info');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. ALERTS SECTION
   -------------------------------------------------------------------------- */
function initAlertsSection() {
  if (window.alertsModule) {
    window.alertsModule.renderAlerts('alerts-list-container');
  }

  const alertFilterBtns = document.querySelectorAll('.alert-filter-btn');
  alertFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      alertFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const severity = btn.dataset.severity;
      if (window.alertsModule) {
        window.alertsModule.setFilter(severity);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. MODALS & TOAST NOTIFICATION ENGINE
   -------------------------------------------------------------------------- */
function initModalsAndToasts() {
  // Modal handlers
  const modalOverlay = document.getElementById('report-modal');
  const openModalBtn = document.getElementById('btn-open-report-modal');
  const closeModalBtns = document.querySelectorAll('.btn-close-modal');

  if (openModalBtn && modalOverlay) {
    openModalBtn.addEventListener('click', () => {
      modalOverlay.classList.add('active');
    });
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // Subscribe Newsletter handler
  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsForm.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Subscribed ${input.value} to daily SmartPollution AI briefings!`, 'success');
        input.value = '';
      }
    });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  else if (type === 'warning') icon = 'fa-exclamation-triangle';

  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icon}"></i></div>
    <div class="toast-msg">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

window.showToast = showToast;
