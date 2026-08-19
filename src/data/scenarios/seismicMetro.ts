import { ScenarioPreset } from '../../types/simulation';

export const seismicMetroScenario: ScenarioPreset = {
  id: 'seismic_metro',
  name: 'Metropolitan Basin — 7.2 Magnitude Earthquake & Overpass Rupture',
  disasterType: 'earthquake',
  description: 'A major seismic event has struck along the downtown fault line. Multiple elevated highway overpasses are fractured, causing urban isolation.',
  centerLat: 37.7749,
  centerLng: -122.4194,
  zoom: 13,
  weather: {
    temperatureC: 18,
    rainfallMmH: 0,
    windSpeedKmH: 22,
    windDirectionDeg: 270,
    visibilityKm: 10,
    humidityPct: 60
  },
  initialHazards: [
    {
      id: 'eq_epicenter',
      type: 'earthquake',
      centerLat: 37.7800,
      centerLng: -122.4200,
      radiusKm: 4.5,
      intensity: 0.95,
      expansionRateKmH: 0.2,
      epicenterDepthKm: 8.0
    }
  ],
  nodes: [
    { id: 's1', name: 'Financial District Downtown', lat: 37.794, lng: -122.399, type: 'commercial', elevation: 12, population: 35000, hazardRisk: 0.90, isDistressActive: true, distressPriority: 'P1' },
    { id: 's2', name: 'Civic Center Plaza', lat: 37.779, lng: -122.417, type: 'intersection', elevation: 18, population: 22000, hazardRisk: 0.85, isDistressActive: true, distressPriority: 'P2' },
    { id: 's3', name: 'Mission District Heights', lat: 37.759, lng: -122.419, type: 'residential', elevation: 32, population: 28000, hazardRisk: 0.60 },
    { id: 's4', name: 'General Trauma Hospital', lat: 37.755, lng: -122.405, type: 'hospital', elevation: 25, population: 4500, capacity: 5000, currentOccupancy: 3800, hazardRisk: 0.35 },
    { id: 's5', name: 'Potrero Ridge Safe Shelter', lat: 37.760, lng: -122.395, type: 'shelter', elevation: 65, population: 1500, capacity: 20000, currentOccupancy: 4200, hazardRisk: 0.10 },
    { id: 's6', name: 'Sunset Safe Zone Apex', lat: 37.755, lng: -122.480, type: 'shelter', elevation: 85, population: 1200, capacity: 35000, currentOccupancy: 5100, hazardRisk: 0.02 },
    { id: 's7', name: 'Twin Peaks Relief Depot', lat: 37.754, lng: -122.447, type: 'depot', elevation: 280, population: 800, capacity: 15000, currentOccupancy: 2200, hazardRisk: 0.05 },
    { id: 's8', name: 'Marina Overpass Junction', lat: 37.802, lng: -122.435, type: 'intersection', elevation: 8, population: 14000, hazardRisk: 0.82 },
    { id: 's9', name: 'Presidio North Camp', lat: 37.798, lng: -122.465, type: 'shelter', elevation: 45, population: 900, capacity: 22000, currentOccupancy: 1800, hazardRisk: 0.08 }
  ],
  edges: [
    { id: 'se1', source: 's1', target: 's2', distance: 2.1, baseSpeed: 45, capacity: 4000, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 1, hazardRisk: 0.85, predictedRisk: 0.90, isBlocked: true, blockageReason: 'High-Rise Debris Collapse', trafficDensity: 1.0 },
    { id: 'se2', source: 's1', target: 's8', distance: 3.5, baseSpeed: 50, capacity: 3500, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 1, hazardRisk: 0.70, predictedRisk: 0.80, isBlocked: false, trafficDensity: 0.85 },
    { id: 'se3', source: 's2', target: 's3', distance: 2.3, baseSpeed: 40, capacity: 3800, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 2, hazardRisk: 0.65, predictedRisk: 0.75, isBlocked: false, trafficDensity: 0.70 },
    { id: 'se4', source: 's3', target: 's4', distance: 1.5, baseSpeed: 40, capacity: 3000, currentFlow: 0, roadType: 'local', lanes: 2, elevationSlope: 1, hazardRisk: 0.40, predictedRisk: 0.45, isBlocked: false, trafficDensity: 0.60 },
    { id: 'se5', source: 's4', target: 's5', distance: 1.8, baseSpeed: 45, capacity: 3500, currentFlow: 0, roadType: 'local', lanes: 2, elevationSlope: 4, hazardRisk: 0.15, predictedRisk: 0.18, isBlocked: false, trafficDensity: 0.30 },
    { id: 'se6', source: 's3', target: 's7', distance: 3.0, baseSpeed: 50, capacity: 4000, currentFlow: 0, roadType: 'mountain_pass', lanes: 2, elevationSlope: 8, hazardRisk: 0.25, predictedRisk: 0.30, isBlocked: false, trafficDensity: 0.40 },
    { id: 'se7', source: 's7', target: 's6', distance: 3.2, baseSpeed: 55, capacity: 5000, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 3, hazardRisk: 0.05, predictedRisk: 0.08, isBlocked: false, trafficDensity: 0.25 },
    { id: 'se8', source: 's8', target: 's9', distance: 2.8, baseSpeed: 55, capacity: 4500, currentFlow: 0, roadType: 'highway', lanes: 4, elevationSlope: 2, hazardRisk: 0.20, predictedRisk: 0.25, isBlocked: false, trafficDensity: 0.35 }
  ],
  narrativeAlerts: [
    { timeStepHours: 0, title: 'Seismic Shockwave', message: 'Fault line slip triggers violent shaking; Downtown corridor blocked by debris.', severity: 'critical' },
    { timeStepHours: 1, title: 'Aftershock Warning', message: 'Magnitude 5.8 aftershock expected in 30 minutes; elevated overpasses unstable.', severity: 'warning' }
  ]
};
