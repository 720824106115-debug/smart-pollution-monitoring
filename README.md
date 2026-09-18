# Smart Pollution Monitoring using AI and ML

> A next-generation smart city environmental monitoring and predictive intelligence platform designed in a **Strict Light Theme**.

---

## 🌟 Overview

**SmartPollution AI** integrates edge IoT sensor streams, real-time spatial atmospheric mapping, and ensemble machine learning models (**Bi-directional LSTM + XGBoost**) to deliver accurate hyper-local air quality forecasting and automated smart city mitigation actions.

---

## 🎨 Design Philosophy (Strict Light Theme)

* **Main Background:** `#FFFFFF` (Pure White)
* **Secondary Sections:** `#F7F9FC` (Soft Gray)
* **Dashboard Background:** `#F5F7FA` (Light SaaS Slate)
* **Cards & Panels:** `#FFFFFF` with multi-layer soft shadows
* **Typography:** Dark Navy (`#0F172A`), Slate Gray (`#64748B`), and Dark Gray (`#334155`)
* **Color Accents:** Vibrant Blue (`#2563EB`), Emerald Green (`#10B981`), Purple (`#8B5CF6`)
* **Alerts:** High-contrast light tints (Light Yellow `#FEF9C3`, Light Orange `#FFEDD5`, Light Red `#FEE2E2`, Light Green `#ECFDF5`)
* **Zero Dark Modes, Zero Dark Cards, Zero Dark Backgrounds.**

---

## 🚀 Key Features

* **Real-time Live Telemetry Feed:** Rolling 3-second live sensor stream across 6 city stations with simulated IoT calibration.
* **Animated Radial AQI Gauge:** Smoothly animating SVG circular gauge calibrated against US-EPA and WHO safety standards.
* **AI Prediction & Scenario Engine:** Ensemble neural network forecasting with interactive parameter sliders (Temp, Humidity, Wind, Traffic, Industrial output) and **SHAP feature importance** breakdowns.
* **"What-If" Smart City Policy Simulator:** Test interventions like *30% Traffic Reduction / EV Zone*, *40% Industrial Curtailment*, and *Precipitation Washout* with instant AQI response.
* **Geospatial Dispersion Map:** Leaflet.js map with **CartoDB Positron Light Tiles**, custom station markers, and toggleable pollutant plume overlays (AQI, PM2.5, NO₂, CO₂).
* **Analytics & Historical Intelligence:** 24-hour diurnal curves, 7-day multi-pollutant comparison bar charts, and unsupervised *Isolation Forest* ML anomaly detection log.
* **Smart Alert Notification Hub:** Strictly light-themed alert cards for Critical, High, Warning, and Safe environmental events.

---

## 🛠️ Tech Stack

* **Frontend:** Semantic HTML5, Vanilla CSS Design System (Custom tokens, SaaS shadows)
* **Charts & Visualizations:** Chart.js 4.4 (Customized light themes & gridlines)
* **Mapping:** Leaflet.js 1.9 + CartoDB Positron Light Tiles
* **AI / Simulation Engine:** Custom JavaScript Bi-LSTM tensor regression and XGBoost feature weight engine
* **Icons & Fonts:** FontAwesome 6, Google Fonts (*Plus Jakarta Sans* & *Inter*)

---

## 💻 Quick Start & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/720824106115-debug/smart-pollution-monitoring.git
   cd smart-pollution-monitoring
   ```

2. Start a local development server:
   ```bash
   # Using Python:
   python -m http.server 8080

   # Or using Node:
   npx serve .
   ```

3. Open your browser and navigate to:
   [http://localhost:8080](http://localhost:8080)

---

## 📄 License
MIT License.
