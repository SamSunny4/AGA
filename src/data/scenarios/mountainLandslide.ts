import { ScenarioPreset } from '../../types/simulation';

export const mountainLandslideScenario: ScenarioPreset = {
  id: 'mountain_landslide',
  name: 'Alpine Valley — Cloudburst & Mountain Landslide Blockage',
  disasterType: 'landslide',
  description: 'Massive mud and debris flows triggered by intense cloudbursts have severed mountain passes, trapping hill townships in narrow valleys.',
  centerLat: 30.1450,
  centerLng: 79.2300,
  zoom: 12,
  weather: {
    temperatureC: 14,
    rainfallMmH: 80,
    windSpeedKmH: 30,
    windDirectionDeg: 120,
    visibilityKm: 1.5,
    humidityPct: 99
  },
  initialHazards: [
    {
      id: 'landslide_gorge',
      type: 'landslide',
      centerLat: 30.1550,
      centerLng: 79.2400,
      radiusKm: 2.5,
      intensity: 0.94,
      expansionRateKmH: 0.4
    }
  ],
  nodes: [
    { id: 'm1', name: 'Upper Valley Township', lat: 30.170, lng: 79.255, type: 'residential', elevation: 1850, population: 6200, hazardRisk: 0.92, isDistressActive: true, distressPriority: 'P1' },
    { id: 'm2', name: 'Riverside Gorge Crossing', lat: 30.150, lng: 79.235, type: 'intersection', elevation: 1420, population: 1500, hazardRisk: 0.95, isDistressActive: true, distressPriority: 'P1' },
    { id: 'm3', name: 'Valley Sub-Divisional Hospital', lat: 30.130, lng: 79.210, type: 'hospital', elevation: 1280, population: 2000, capacity: 1500, currentOccupancy: 1100, hazardRisk: 0.30 },
    { id: 'm4', name: 'Foothill Stadium Major Relief Hub', lat: 30.100, lng: 79.180, type: 'shelter', elevation: 850, population: 500, capacity: 20000, currentOccupancy: 1500, hazardRisk: 0.05 },
    { id: 'm5', name: 'Ridge Road Alternate Helipad', lat: 30.165, lng: 79.200, type: 'depot', elevation: 1950, population: 400, capacity: 8000, currentOccupancy: 600, hazardRisk: 0.15 }
  ],
  edges: [
    { id: 'me1', source: 'm1', target: 'm2', distance: 3.8, baseSpeed: 30, capacity: 1200, currentFlow: 0, roadType: 'mountain_pass', lanes: 2, elevationSlope: 11, hazardRisk: 0.94, predictedRisk: 0.99, isBlocked: true, blockageReason: 'Active Rockfall & Debris', trafficDensity: 1.0 },
    { id: 'me2', source: 'm1', target: 'm5', distance: 4.5, baseSpeed: 35, capacity: 1500, currentFlow: 0, roadType: 'mountain_pass', lanes: 2, elevationSlope: 8, hazardRisk: 0.20, predictedRisk: 0.30, isBlocked: false, trafficDensity: 0.40 },
    { id: 'me3', source: 'm2', target: 'm3', distance: 3.2, baseSpeed: 35, capacity: 1800, currentFlow: 0, roadType: 'bridge', lanes: 2, elevationSlope: 5, hazardRisk: 0.75, predictedRisk: 0.85, isBlocked: false, isBridge: true, trafficDensity: 0.70 },
    { id: 'me4', source: 'm5', target: 'm3', distance: 5.2, baseSpeed: 40, capacity: 2000, currentFlow: 0, roadType: 'local', lanes: 2, elevationSlope: 7, hazardRisk: 0.15, predictedRisk: 0.20, isBlocked: false, trafficDensity: 0.30 },
    { id: 'me5', source: 'm3', target: 'm4', distance: 4.8, baseSpeed: 50, capacity: 3500, currentFlow: 0, roadType: 'highway', lanes: 2, elevationSlope: 4, hazardRisk: 0.05, predictedRisk: 0.08, isBlocked: false, trafficDensity: 0.25 }
  ],
  narrativeAlerts: [
    { timeStepHours: 0, title: 'Cloudburst Alert', message: 'Torrential 80mm/h rainfall triggering mudslides along Highway 108.', severity: 'critical' }
  ]
};
