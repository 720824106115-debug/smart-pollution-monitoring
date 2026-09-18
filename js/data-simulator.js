/**
 * SMART POLLUTION MONITORING - DATA SIMULATOR ENGINE
 * Generates realistic real-time IoT sensor telemetry, station metadata, and historical series.
 */

const STATIONS = [
  {
    id: 'station-1',
    name: 'City Center (HQ)',
    category: 'Commercial / Urban',
    lat: 40.7128,
    lng: -74.0060,
    baseAqi: 78,
    pm25: 32,
    pm10: 54,
    co2: 412,
    no2: 18,
    o3: 45,
    temp: 26.4,
    humidity: 58,
    windSpeed: 14,
    windDir: 'NE',
    status: 'online',
    uptime: '99.9%',
    battery: '100% (Mains)',
    sensorModel: 'AeroSense Pro V3'
  },
  {
    id: 'station-2',
    name: 'Industrial District 4',
    category: 'Heavy Industrial',
    lat: 40.7306,
    lng: -73.9866,
    baseAqi: 132,
    pm25: 68,
    pm10: 110,
    co2: 540,
    no2: 38,
    o3: 52,
    temp: 28.1,
    humidity: 52,
    windSpeed: 11,
    windDir: 'E',
    status: 'online',
    uptime: '99.4%',
    battery: '94% (Solar)',
    sensorModel: 'AeroSense Ind-X'
  },
  {
    id: 'station-3',
    name: 'Tech Park North',
    category: 'Suburban / Tech',
    lat: 40.7589,
    lng: -73.9851,
    baseAqi: 42,
    pm25: 14,
    pm10: 28,
    co2: 388,
    no2: 12,
    o3: 38,
    temp: 24.8,
    humidity: 62,
    windSpeed: 16,
    windDir: 'N',
    status: 'online',
    uptime: '100%',
    battery: '98% (Solar)',
    sensorModel: 'AeroSense Pro V3'
  },
  {
    id: 'station-4',
    name: 'Riverside Promenade',
    category: 'Ecological / Park',
    lat: 40.7484,
    lng: -74.0100,
    baseAqi: 35,
    pm25: 10,
    pm10: 22,
    co2: 375,
    no2: 8,
    o3: 34,
    temp: 23.9,
    humidity: 65,
    windSpeed: 19,
    windDir: 'NW',
    status: 'online',
    uptime: '99.8%',
    battery: '100% (Mains)',
    sensorModel: 'AeroSense Eco'
  },
  {
    id: 'station-5',
    name: 'Green Valley Suburb',
    category: 'Residential',
    lat: 40.7020,
    lng: -73.9750,
    baseAqi: 52,
    pm25: 19,
    pm10: 36,
    co2: 395,
    no2: 14,
    o3: 40,
    temp: 25.1,
    humidity: 60,
    windSpeed: 13,
    windDir: 'NE',
    status: 'online',
    uptime: '99.7%',
    battery: '91% (Solar)',
    sensorModel: 'AeroSense Pro V3'
  },
  {
    id: 'station-6',
    name: 'Metro Terminal South',
    category: 'Transit Hub',
    lat: 40.6900,
    lng: -73.9920,
    baseAqi: 96,
    pm25: 44,
    pm10: 72,
    co2: 468,
    no2: 29,
    o3: 48,
    temp: 27.2,
    humidity: 55,
    windSpeed: 8,
    windDir: 'SE',
    status: 'online',
    uptime: '99.6%',
    battery: '100% (Mains)',
    sensorModel: 'AeroSense Transit'
  }
];

class DataSimulator {
  constructor() {
    this.stations = JSON.parse(JSON.stringify(STATIONS));
    this.currentStationId = 'station-1';
    this.listeners = [];
    this.pollInterval = null;
    this.isLive = true;
  }

  getCurrentStation() {
    return this.stations.find(s => s.id === this.currentStationId) || this.stations[0];
  }

  setStation(stationId) {
    this.currentStationId = stationId;
    this.notifyListeners();
  }

  getAqiLevel(aqi) {
    if (aqi <= 50) return { label: 'Good', class: 'good', color: '#10B981', desc: 'Air quality is satisfactory and poses little or no risk.' };
    if (aqi <= 100) return { label: 'Moderate', class: 'moderate', color: '#F59E0B', desc: 'Air quality is acceptable; however, sensitive individuals may experience minor symptoms.' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', class: 'high', color: '#F97316', desc: 'Members of sensitive groups may experience health effects.' };
    if (aqi <= 200) return { label: 'Unhealthy', class: 'critical', color: '#EF4444', desc: 'Everyone may begin to experience health effects.' };
    return { label: 'Hazardous', class: 'critical', color: '#7E22CE', desc: 'Health warnings of emergency conditions. Entire population is affected.' };
  }

  startPolling(callback) {
    if (callback) this.listeners.push(callback);
    if (!this.pollInterval) {
      this.pollInterval = setInterval(() => {
        if (!this.isLive) return;
        this.simulateSensorTick();
        this.notifyListeners();
      }, 3000);
    }
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  toggleLive() {
    this.isLive = !this.isLive;
    return this.isLive;
  }

  simulateSensorTick() {
    this.stations.forEach(station => {
      // Realistic Gaussian-like jitter
      const jitterAqi = (Math.random() - 0.49) * 2.2;
      station.baseAqi = Math.max(10, Math.min(300, Math.round(station.baseAqi + jitterAqi)));

      const jitterPm25 = (Math.random() - 0.49) * 1.5;
      station.pm25 = Math.max(5, Math.min(180, Math.round((station.pm25 + jitterPm25) * 10) / 10));

      const jitterPm10 = (Math.random() - 0.49) * 2.0;
      station.pm10 = Math.max(10, Math.min(250, Math.round(station.pm10 + jitterPm10)));

      const jitterCo2 = (Math.random() - 0.48) * 3;
      station.co2 = Math.max(350, Math.min(800, Math.round(station.co2 + jitterCo2)));

      const jitterNo2 = (Math.random() - 0.49) * 0.8;
      station.no2 = Math.max(2, Math.min(80, Math.round(station.no2 + jitterNo2)));

      const jitterO3 = (Math.random() - 0.49) * 0.9;
      station.o3 = Math.max(5, Math.min(90, Math.round(station.o3 + jitterO3)));
    });
  }

  triggerSimulatedSpike(stationId) {
    const target = this.stations.find(s => s.id === (stationId || this.currentStationId));
    if (target) {
      target.baseAqi = Math.min(265, target.baseAqi + 65);
      target.pm25 = Math.min(145, target.pm25 + 45);
      target.pm10 = Math.min(190, target.pm10 + 60);
      target.no2 = Math.min(58, target.no2 + 22);
      this.notifyListeners();
      return target;
    }
    return null;
  }

  notifyListeners() {
    const current = this.getCurrentStation();
    const all = this.stations;
    this.listeners.forEach(fn => fn(current, all));
  }

  // Generate 24-hour historical series
  generate24HourHistory(stationId) {
    const station = this.stations.find(s => s.id === stationId) || this.getCurrentStation();
    const hours = [];
    const aqiSeries = [];
    const pm25Series = [];
    const pm10Series = [];
    const co2Series = [];
    const no2Series = [];

    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600 * 1000);
      const hourStr = d.getHours().toString().padStart(2, '0') + ':00';
      hours.push(hourStr);

      // Diurnal curve: peaks at 8am-10am and 6pm-8pm (traffic rush hours)
      const hour = d.getHours();
      let rushHourFactor = 1.0;
      if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        rushHourFactor = 1.35;
      } else if (hour >= 1 && hour <= 5) {
        rushHourFactor = 0.72;
      }

      const noise = 1 + (Math.random() - 0.5) * 0.15;
      const calculatedAqi = Math.round(station.baseAqi * rushHourFactor * noise);
      aqiSeries.push(calculatedAqi);
      pm25Series.push(Math.round(station.pm25 * rushHourFactor * noise * 10) / 10);
      pm10Series.push(Math.round(station.pm10 * rushHourFactor * noise));
      co2Series.push(Math.round(station.co2 * (1 + (rushHourFactor - 1) * 0.4) * noise));
      no2Series.push(Math.round(station.no2 * rushHourFactor * noise));
    }

    return { hours, aqiSeries, pm25Series, pm10Series, co2Series, no2Series };
  }

  // Generate 7-day comparison
  generate7DayComparison() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const pm25 = [28, 35, 42, 38, 48, 22, 18];
    const pm10 = [48, 56, 68, 62, 74, 38, 30];
    const aqi = [68, 82, 94, 88, 108, 54, 46];
    return { days, pm25, pm10, aqi };
  }
}

window.dataSimulator = new DataSimulator();
