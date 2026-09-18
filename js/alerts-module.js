/**
 * SMART POLLUTION MONITORING - ALERTS MODULE (LIGHT THEME ONLY)
 * Strictly light-colored alert notification management and real-time triggers.
 */

class AlertsModule {
  constructor() {
    this.alerts = [
      {
        id: 'alt-101',
        severity: 'critical', // Light red
        title: 'Critical PM10 Spike Detected',
        station: 'Industrial District 4',
        stationId: 'station-2',
        time: '4 mins ago',
        desc: 'PM10 concentration exceeded 110 µg/m³ threshold. Industrial stack particulate filter anomaly suspected. Automated scrubber triggers dispatched.',
        resolved: false
      },
      {
        id: 'alt-102',
        severity: 'high', // Light orange
        title: 'Elevated NO₂ & CO₂ Levels',
        station: 'Metro Terminal South',
        stationId: 'station-6',
        time: '18 mins ago',
        desc: 'Heavy evening commuter bus idle detected. Recommended smart signal adjustment for rapid traffic dispersal.',
        resolved: false
      },
      {
        id: 'alt-103',
        severity: 'warning', // Light yellow
        title: 'Moderate AQI Warning (Thermal Inversion)',
        station: 'City Center (HQ)',
        stationId: 'station-1',
        time: '42 mins ago',
        desc: 'Low wind speed (8 km/h) combined with rising surface temperatures is causing minor pollutant accumulation.',
        resolved: false
      },
      {
        id: 'alt-104',
        severity: 'safe', // Light green
        title: 'Optimal Air Quality Confirmed',
        station: 'Riverside Promenade',
        stationId: 'station-4',
        time: '1 hour ago',
        desc: 'All criteria pollutants (PM2.5, PM10, O3, NO2) within WHO Tier 1 pristine guidelines. Ideal for outdoor recreational activities.',
        resolved: false
      }
    ];

    this.currentFilter = 'all';
  }

  getFilteredAlerts() {
    if (this.currentFilter === 'all') return this.alerts;
    return this.alerts.filter(a => a.severity === this.currentFilter);
  }

  setFilter(severity) {
    this.currentFilter = severity;
    this.renderAlerts();
  }

  addAlert(alertObj) {
    this.alerts.unshift({
      id: 'alt-' + Date.now(),
      time: 'Just now',
      resolved: false,
      ...alertObj
    });
    this.renderAlerts();
  }

  dismissAlert(alertId) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.renderAlerts();
  }

  renderAlerts(containerId = 'alerts-list-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = this.getFilteredAlerts();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding: 3rem 1.5rem;">
          <div style="font-size: 2.5rem; color: #10B981; margin-bottom: 0.75rem;">
            <i class="fas fa-check-circle"></i>
          </div>
          <h4 style="color: #0F172A; margin-bottom: 0.35rem;">No Active Alerts</h4>
          <p style="color: #64748B; font-size: 0.9rem;">All monitored stations are operating within normal ambient thresholds.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(alert => {
      let iconClass = 'fa-exclamation-triangle';
      if (alert.severity === 'critical') iconClass = 'fa-radiation-alt';
      else if (alert.severity === 'high') iconClass = 'fa-exclamation-circle';
      else if (alert.severity === 'safe') iconClass = 'fa-leaf';

      html += `
        <div class="alert-card ${alert.severity}" id="${alert.id}">
          <div class="alert-icon">
            <i class="fas ${iconClass}"></i>
          </div>
          <div class="alert-content">
            <div class="alert-heading-row">
              <span class="alert-title">${alert.title} — ${alert.station}</span>
              <span class="alert-time">${alert.time}</span>
            </div>
            <p class="alert-desc">${alert.desc}</p>
            <div class="alert-actions-row">
              <button class="alert-action-btn" onclick="window.alertsModule.viewStation('${alert.stationId}')">
                <i class="fas fa-search-location"></i> View Station
              </button>
              <button class="alert-action-btn" onclick="window.alertsModule.dismissAlert('${alert.id}')">
                <i class="fas fa-check"></i> Acknowledge
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  viewStation(stationId) {
    if (window.dataSimulator) {
      window.dataSimulator.setStation(stationId);
    }
    const section = document.getElementById('live-monitoring');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

window.alertsModule = new AlertsModule();
