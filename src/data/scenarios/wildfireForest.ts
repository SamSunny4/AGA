import { ScenarioPreset } from '../../types/simulation';

export const wildfireForestScenario: ScenarioPreset = {
  id: 'wildfire_forest',
  name: 'Canyon Interface — Fast-Moving Wildfire with Wind Gusts',
  disasterType: 'wildfire',
  description: 'Severe Santa Ana winds (55 km/h) are propelling rapid crown fire spread toward suburban communities. Smoke visibility is near zero.',
  centerLat: 34.0522,
  centerLng: -118.2437,
  zoom: 13,
  weather: {
    temperatureC: 38,
    rainfallMmH: 0,
    windSpeedKmH: 55,
    windDirectionDeg: 60,
    visibilityKm: 1.2,
    humidityPct: 12
  },
  initialHazards: [
    {
      id: 'fire_front_canyon',
      type: 'wildfire',
      centerLat: 34.0900,
      centerLng: -118.2900,
      radiusKm: 2.8,
      intensity: 0.96,
      expansionRateKmH: 1.4,
      windAngleDeg: 60,
      windSpeedKmH: 55
    }
  ],
  nodes: [
    { id: 'w1', name: 'Pinecrest Ridge Estates', lat: 34.100, lng: -118.300, type: 'residential', elevation: 420, population: 8500, hazardRisk: 0.98, isDistressActive: true, distressPriority: 'P1' },
    { id: 'w2', name: 'Canyon Pass Junction', lat: 34.085, lng: -118.275, type: 'intersection', elevation: 310, population: 4200, hazardRisk: 0.86, isDistressActive: true, distressPriority: 'P2' },
    { id: 'w3', name: 'Oak Valley Community', lat: 34.065, lng: -118.290, type: 'residential', elevation: 220, population: 16000, hazardRisk: 0.65 },
    { id: 'w4', name: 'Metropolitan Stadium Shelter', lat: 34.015, lng: -118.285, type: 'shelter', elevation: 70, population: 1500, capacity: 40000, currentOccupancy: 6500, hazardRisk: 0.02 },
    { id: 'w5', name: 'Valley Regional Medical Center', lat: 34.040, lng: -118.250, type: 'hospital', elevation: 110, population: 3800, capacity: 6000, currentOccupancy: 4100, hazardRisk: 0.18 },
    { id: 'w6', name: 'East Foothill Safe Haven', lat: 34.030, lng: -118.180, type: 'shelter', elevation: 95, population: 1000, capacity: 25000, currentOccupancy: 3200, hazardRisk: 0.04 }
  ],
  edges: [
    { id: 'we1', source: 'w1', target: 'w2', distance: 2.9, baseSpeed: 40, capacity: 2200, currentFlow: 0, roadType: 'mountain_pass', lanes: 2, elevationSlope: 7, hazardRisk: 0.92, predictedRisk: 0.99, isBlocked: false, trafficDensity: 0.95 },
    { id: 'we2', source: 'w2', target: 'w3', distance: 2.6, baseSpeed: 50, capacity: 3400, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 4, hazardRisk: 0.70, predictedRisk: 0.85, isBlocked: false, trafficDensity: 0.80 },
    { id: 'we3', source: 'w3', target: 'w4', distance: 5.8, baseSpeed: 65, capacity: 6000, currentFlow: 0, roadType: 'highway', lanes: 6, elevationSlope: 2, hazardRisk: 0.15, predictedRisk: 0.20, isBlocked: false, trafficDensity: 0.45 },
    { id: 'we4', source: 'w3', target: 'w5', distance: 4.5, baseSpeed: 55, capacity: 4500, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 2, hazardRisk: 0.25, predictedRisk: 0.35, isBlocked: false, trafficDensity: 0.50 },
    { id: 'we5', source: 'w5', target: 'w6', distance: 6.8, baseSpeed: 70, capacity: 5500, currentFlow: 0, roadType: 'highway', lanes: 4, elevationSlope: 1, hazardRisk: 0.05, predictedRisk: 0.08, isBlocked: false, trafficDensity: 0.20 }
  ],
  narrativeAlerts: [
    { timeStepHours: 0, title: 'Wildfire Outbreak', message: 'Extreme fire behavior with spot fires jumping 1.2km downwind.', severity: 'critical' },
    { timeStepHours: 1, title: 'Wind Shift Threat', message: 'Wind gusts shifting 20° Southward; Oak Valley pre-evacuation wave initiated.', severity: 'warning' }
  ]
};
