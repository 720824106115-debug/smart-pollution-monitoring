/**
 * SMART POLLUTION MONITORING - CHARTS MODULE (LIGHT THEME ONLY)
 * Strict Light Theme Chart.js configurations and real-time visualization handlers.
 */

class ChartsModule {
  constructor() {
    this.liveChart = null;
    this.historyChart = null;
    this.comparisonChart = null;
    this.forecastChart = null;
    this.activePollutant = 'all'; // 'all', 'pm25', 'pm10', 'no2'
  }

  // Common Light Theme Chart Options
  getLightChartDefaults() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      font: {
        family: "'Inter', -apple-system, sans-serif"
      },
      plugins: {
        legend: {
          labels: {
            color: '#334155',
            font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: '#FFFFFF',
          titleColor: '#0F172A',
          bodyColor: '#334155',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 13 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 }
        }
      },
      scales: {
        x: {
          grid: {
            color: '#F1F5F9',
            drawBorder: false
          },
          ticks: {
            color: '#64748B',
            font: { size: 11, weight: '500' }
          }
        },
        y: {
          grid: {
            color: '#F1F5F9',
            drawBorder: false
          },
          ticks: {
            color: '#64748B',
            font: { size: 11, weight: '500' }
          }
        }
      }
    };
  }

  // 1. Live Telemetry Real-Time Chart
  initLiveChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const initialLabels = ['-25s', '-20s', '-15s', '-10s', '-5s', 'Now'];
    const initialAqi = [72, 74, 75, 77, 76, 78];
    const initialPm25 = [28, 29, 30, 31, 31, 32];

    this.liveChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: initialLabels,
        datasets: [
          {
            label: 'AQI Index',
            data: initialAqi,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#2563EB',
            pointBorderWidth: 2
          },
          {
            label: 'PM2.5 (µg/m³)',
            data: initialPm25,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#10B981',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        ...this.getLightChartDefaults(),
        animation: { duration: 600 }
      }
    });
  }

  updateLiveChart(currentStation) {
    if (!this.liveChart) return;
    const now = new Date();
    const timeLabel = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');

    const labels = this.liveChart.data.labels;
    const aqiData = this.liveChart.data.datasets[0].data;
    const pm25Data = this.liveChart.data.datasets[1].data;

    if (labels.length >= 10) {
      labels.shift();
      aqiData.shift();
      pm25Data.shift();
    }

    labels.push(timeLabel);
    aqiData.push(currentStation.baseAqi);
    pm25Data.push(currentStation.pm25);

    this.liveChart.update('quiet');
  }

  // 2. 24-Hour Multi-Pollutant Trend Chart
  initHistoryChart(canvasId, stationId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.dataSimulator) return;

    const data = window.dataSimulator.generate24HourHistory(stationId);

    this.historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.hours,
        datasets: [
          {
            label: 'AQI Index',
            data: data.aqiSeries,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.06)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 2
          },
          {
            label: 'PM2.5 (µg/m³)',
            data: data.pm25Series,
            borderColor: '#10B981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 2
          },
          {
            label: 'PM10 (µg/m³)',
            data: data.pm10Series,
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 2
          },
          {
            label: 'NO₂ (ppb)',
            data: data.no2Series,
            borderColor: '#8B5CF6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 2
          }
        ]
      },
      options: {
        ...this.getLightChartDefaults(),
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
  }

  updateHistoryChart(stationId) {
    if (!this.historyChart || !window.dataSimulator) return;
    const data = window.dataSimulator.generate24HourHistory(stationId);
    this.historyChart.data.labels = data.hours;
    this.historyChart.data.datasets[0].data = data.aqiSeries;
    this.historyChart.data.datasets[1].data = data.pm25Series;
    this.historyChart.data.datasets[2].data = data.pm10Series;
    this.historyChart.data.datasets[3].data = data.no2Series;
    this.historyChart.update();
  }

  // 3. 7-Day Historical Comparison Bar Chart
  initComparisonChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.dataSimulator) return;

    const data = window.dataSimulator.generate7DayComparison();

    this.comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.days,
        datasets: [
          {
            label: 'PM2.5 (µg/m³)',
            data: data.pm25,
            backgroundColor: '#2563EB',
            borderRadius: 6
          },
          {
            label: 'PM10 (µg/m³)',
            data: data.pm10,
            backgroundColor: '#10B981',
            borderRadius: 6
          },
          {
            label: 'Avg AQI',
            data: data.aqi,
            backgroundColor: '#8B5CF6',
            borderRadius: 6
          }
        ]
      },
      options: {
        ...this.getLightChartDefaults(),
        plugins: {
          ...this.getLightChartDefaults().plugins,
          legend: {
            ...this.getLightChartDefaults().plugins.legend,
            position: 'top'
          }
        }
      }
    });
  }

  // 4. Forecast Trajectory Chart
  initForecastChart(canvasId, horizon, baseAqi, targetAqi) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.aiEngine) return;

    const trajectory = window.aiEngine.generateForecastCurve(horizon, baseAqi, targetAqi);

    if (this.forecastChart) {
      this.forecastChart.destroy();
    }

    this.forecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trajectory.labels,
        datasets: [
          {
            label: 'Predicted AQI Trajectory',
            data: trajectory.data,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2.5,
            borderDash: [4, 4],
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#2563EB'
          }
        ]
      },
      options: {
        ...this.getLightChartDefaults(),
        plugins: {
          ...this.getLightChartDefaults().plugins,
          legend: { display: false }
        }
      }
    });
  }
}

window.chartsModule = new ChartsModule();
