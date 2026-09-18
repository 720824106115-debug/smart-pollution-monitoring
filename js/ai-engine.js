/**
 * SMART POLLUTION MONITORING - AI & MACHINE LEARNING PREDICTION ENGINE
 * Simulates Bi-LSTM Neural Forecasting & XGBoost Feature Weights
 */

class AIEngine {
  constructor() {
    this.models = {
      primary: 'Bi-LSTM + XGBoost Ensemble (v4.2)',
      trainingDataset: '4.8M Urban Air Quality Records (2020-2026)',
      r2Score: 0.942,
      mae: 3.18,
      latencyMs: 118
    };

    this.activeHorizon = '24h'; // '1h', '6h', '24h', '48h', '7d'
  }

  /**
   * Run ML Forecast calculation based on dynamic environmental inputs
   */
  predict({
    stationId,
    horizon = '24h',
    temp = 26,
    humidity = 58,
    windSpeed = 14,
    trafficIndex = 70,
    industrialIndex = 50,
    pressure = 1013,
    activePolicies = []
  }) {
    const station = window.dataSimulator ? window.dataSimulator.getCurrentStation() : { baseAqi: 78, pm25: 32 };
    let base = station.baseAqi;

    // 1. Environmental Feature Weights
    // Temperature effect (High temp + sunlight increases photochemical smog / Ozone)
    const tempFactor = (temp - 20) * 0.85;

    // Wind dispersion factor (Higher wind speed disperses pollutants rapidly)
    const windFactor = Math.max(-28, -(windSpeed - 5) * 1.6);

    // Humidity effect (High humidity traps particulate matter)
    const humidityFactor = (humidity - 50) * 0.35;

    // Traffic Index factor (Direct combustion emission source)
    const trafficFactor = (trafficIndex - 50) * 0.72;

    // Industrial Activity factor
    const industrialFactor = (industrialIndex - 40) * 0.65;

    // Horizon factor (Predictive drift)
    let horizonMultiplier = 1.0;
    let confidence = 94.5;
    if (horizon === '1h') { horizonMultiplier = 1.02; confidence = 96.8; }
    else if (horizon === '6h') { horizonMultiplier = 1.08; confidence = 93.4; }
    else if (horizon === '24h') { horizonMultiplier = 1.15; confidence = 91.2; }
    else if (horizon === '48h') { horizonMultiplier = 1.22; confidence = 87.6; }
    else if (horizon === '7d') { horizonMultiplier = 1.30; confidence = 82.1; }

    // 2. Compute Raw Predicted AQI
    let predictedAqi = (base + tempFactor + windFactor + humidityFactor + trafficFactor + industrialFactor) * horizonMultiplier;

    // 3. Apply Active Policy Adjustments (What-If simulation)
    let policyReductions = 0;
    if (activePolicies.includes('traffic_reduction')) {
      policyReductions += 18.5; // -30% traffic cut
    }
    if (activePolicies.includes('industrial_cap')) {
      policyReductions += 22.0; // -40% industrial emissions
    }
    if (activePolicies.includes('rain_washout')) {
      policyReductions += 32.0; // Particulate scavenging
    }
    if (activePolicies.includes('green_canopy')) {
      policyReductions += 9.5;  // Vegetative filtration
    }

    predictedAqi = Math.max(15, Math.min(320, Math.round(predictedAqi - policyReductions)));

    // 4. Calculate Predicted PM2.5 and PM10
    const predictedPm25 = Math.max(5, Math.round((predictedAqi * 0.42) * 10) / 10);
    const predictedPm10 = Math.max(10, Math.round(predictedAqi * 0.72));

    // 5. SHAP Feature Importance Breakdown (Dynamic percentages)
    const totalImpact = Math.abs(trafficFactor) + Math.abs(windFactor) + Math.abs(tempFactor) + Math.abs(industrialFactor) + Math.abs(humidityFactor) + 10;
    const shapWeights = [
      { feature: 'Traffic Density', weight: Math.round((Math.abs(trafficFactor) + 20) / totalImpact * 100), color: '#2563EB' },
      { feature: 'Wind Dispersion', weight: Math.round((Math.abs(windFactor) + 15) / totalImpact * 100), color: '#10B981' },
      { feature: 'Ambient Temp', weight: Math.round((Math.abs(tempFactor) + 10) / totalImpact * 100), color: '#8B5CF6' },
      { feature: 'Industrial Activity', weight: Math.round((Math.abs(industrialFactor) + 10) / totalImpact * 100), color: '#F59E0B' },
      { feature: 'Relative Humidity', weight: Math.round((Math.abs(humidityFactor) + 8) / totalImpact * 100), color: '#64748B' }
    ];

    // Normalize weights to sum to 100%
    const sum = shapWeights.reduce((acc, curr) => acc + curr.weight, 0);
    shapWeights.forEach(item => {
      item.weight = Math.round((item.weight / sum) * 100);
    });

    // 6. Actionable AI Recommendations
    let recommendation = 'Air quality will remain optimal. Standard municipal routines are sufficient.';
    if (predictedAqi > 150) {
      recommendation = 'Critical Warning: Deploy EV-only traffic diversions, trigger industrial particulate misting cannons, and issue sensitive group alerts.';
    } else if (predictedAqi > 100) {
      recommendation = 'Advisory: Restrict heavy diesel freight on arterial roads, increase green corridor air scrubber activation.';
    } else if (predictedAqi > 50) {
      recommendation = 'Moderate conditions: Maintain standard traffic monitoring and continuous sensor polling.';
    }

    const level = window.dataSimulator ? window.dataSimulator.getAqiLevel(predictedAqi) : { label: 'Moderate', class: 'moderate' };

    return {
      predictedAqi,
      predictedPm25,
      predictedPm10,
      confidence: confidence.toFixed(1),
      level,
      shapWeights,
      recommendation,
      policyReductions: Math.round(policyReductions),
      horizon
    };
  }

  // Generate future trajectory curve for the prediction chart
  generateForecastCurve(horizon, baseAqi, targetAqi) {
    let steps = 6;
    let labels = [];
    if (horizon === '1h') {
      labels = ['Now', '+10m', '+20m', '+30m', '+45m', '+60m'];
    } else if (horizon === '6h') {
      labels = ['Now', '+1h', '+2h', '+3h', '+4h', '+6h'];
    } else if (horizon === '24h') {
      labels = ['Now', '+4h', '+8h', '+12h', '+18h', '+24h'];
    } else if (horizon === '48h') {
      labels = ['Now', '+8h', '+16h', '+24h', '+36h', '+48h'];
    } else {
      labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 7'];
    }

    const data = [];
    const delta = (targetAqi - baseAqi) / (labels.length - 1);
    for (let i = 0; i < labels.length; i++) {
      const noise = (i === 0 || i === labels.length - 1) ? 0 : (Math.random() - 0.5) * 4;
      data.push(Math.round(baseAqi + delta * i + noise));
    }

    return { labels, data };
  }
}

window.aiEngine = new AIEngine();
