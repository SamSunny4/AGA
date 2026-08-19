import { ScenarioPreset } from '../../types/simulation';

export const coastalFloodScenario: ScenarioPreset = {
  id: 'coastal_flood',
  name: 'Coastal Megacity — Category 4 Storm Surge & Dam Breach',
  disasterType: 'flood',
  description: 'Extreme monsoonal rain and 4.8m storm surge are submerging low-lying coastal and delta districts. Several vital bridges are under threat of structural failure.',
  centerLat: 13.0827,
  centerLng: 80.2707,
  zoom: 13,
  weather: {
    temperatureC: 27,
    rainfallMmH: 65,
    windSpeedKmH: 75,
    windDirectionDeg: 45,
    visibilityKm: 2.5,
    humidityPct: 98
  },
  initialHazards: [
    {
      id: 'flood_main_bay',
      type: 'flood',
      centerLat: 13.0600,
      centerLng: 80.2800,
      radiusKm: 3.2,
      intensity: 0.92,
      expansionRateKmH: 0.8,
      waterLevelMeters: 4.5
    },
    {
      id: 'flood_river_delta',
      type: 'flood',
      centerLat: 13.0950,
      centerLng: 80.2500,
      radiusKm: 2.1,
      intensity: 0.78,
      expansionRateKmH: 0.5,
      waterLevelMeters: 3.2
    }
  ],
  nodes: [
    { id: 'n1', name: 'Marina Beachfront', lat: 13.055, lng: 80.282, type: 'residential', elevation: 2, population: 14500, hazardRisk: 0.95, isDistressActive: true, distressPriority: 'P1' },
    { id: 'n2', name: 'Harbor Terminal', lat: 13.090, lng: 80.295, type: 'commercial', elevation: 3, population: 6800, hazardRisk: 0.88, isDistressActive: true, distressPriority: 'P2' },
    { id: 'n3', name: 'Mylapore Cultural Hub', lat: 13.035, lng: 80.265, type: 'residential', elevation: 6, population: 22000, hazardRisk: 0.72 },
    { id: 'n4', name: 'Central Station Interchange', lat: 13.082, lng: 80.275, type: 'intersection', elevation: 5, population: 18500, hazardRisk: 0.65 },
    { id: 'n5', name: 'Mount Road Commercial Corridor', lat: 13.060, lng: 80.255, type: 'commercial', elevation: 8, population: 12000, hazardRisk: 0.45 },
    { id: 'n6', name: 'River Causeway Bridge', lat: 13.075, lng: 80.245, type: 'intersection', elevation: 4, population: 5000, hazardRisk: 0.82 },
    { id: 'n7', name: 'Guindy National Relief Shelter', lat: 13.008, lng: 80.212, type: 'shelter', elevation: 22, population: 1200, capacity: 25000, currentOccupancy: 3400, hazardRisk: 0.05 },
    { id: 'n8', name: 'St. Thomas Hill Apex Shelter', lat: 12.995, lng: 80.190, type: 'shelter', elevation: 48, population: 800, capacity: 18000, currentOccupancy: 2100, hazardRisk: 0.02 },
    { id: 'n9', name: 'Apollo Emergency Trauma Hospital', lat: 13.065, lng: 80.250, type: 'hospital', elevation: 9, population: 3500, capacity: 4000, currentOccupancy: 2900, hazardRisk: 0.35 },
    { id: 'n10', name: 'Adyar River Overpass', lat: 13.010, lng: 80.250, type: 'intersection', elevation: 7, population: 4200, hazardRisk: 0.76 },
    { id: 'n11', name: 'T-Nagar Commercial Square', lat: 13.040, lng: 80.230, type: 'commercial', elevation: 11, population: 31000, hazardRisk: 0.40 },
    { id: 'n12', name: 'Koyambedu Logistics Depot', lat: 13.070, lng: 80.190, type: 'depot', elevation: 18, population: 4000, capacity: 15000, currentOccupancy: 1200, hazardRisk: 0.08 },
    { id: 'n13', name: 'Anna Nagar High Ground Residential', lat: 13.085, lng: 80.210, type: 'residential', elevation: 16, population: 28000, hazardRisk: 0.15 },
    { id: 'n14', name: 'Outer Ring Expressway North', lat: 13.120, lng: 80.210, type: 'intersection', elevation: 14, population: 2000, hazardRisk: 0.10 },
    { id: 'n15', name: 'Perambur Inland Hub', lat: 13.110, lng: 80.240, type: 'residential', elevation: 10, population: 19000, hazardRisk: 0.30 },
    { id: 'n16', name: 'North Chennai Relief Camp', lat: 13.135, lng: 80.260, type: 'shelter', elevation: 15, population: 1500, capacity: 16000, currentOccupancy: 2800, hazardRisk: 0.12 }
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n4', distance: 3.4, baseSpeed: 50, capacity: 3500, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 1, hazardRisk: 0.85, predictedRisk: 0.95, isBlocked: false, trafficDensity: 0.85 },
    { id: 'e2', source: 'n1', target: 'n3', distance: 2.8, baseSpeed: 45, capacity: 2800, currentFlow: 0, roadType: 'local', lanes: 2, elevationSlope: 2, hazardRisk: 0.80, predictedRisk: 0.90, isBlocked: false, trafficDensity: 0.90 },
    { id: 'e3', source: 'n2', target: 'n4', distance: 2.6, baseSpeed: 55, capacity: 4200, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 1, hazardRisk: 0.75, predictedRisk: 0.85, isBlocked: false, trafficDensity: 0.70 },
    { id: 'e4', source: 'n2', target: 'n15', distance: 4.5, baseSpeed: 60, capacity: 3800, currentFlow: 0, roadType: 'highway', lanes: 4, elevationSlope: 2, hazardRisk: 0.40, predictedRisk: 0.55, isBlocked: false, trafficDensity: 0.50 },
    { id: 'e5', source: 'n4', target: 'n5', distance: 3.1, baseSpeed: 50, capacity: 4500, currentFlow: 0, roadType: 'arterial', lanes: 6, elevationSlope: 1, hazardRisk: 0.55, predictedRisk: 0.70, isBlocked: false, trafficDensity: 0.75 },
    { id: 'e6', source: 'n4', target: 'n6', distance: 3.2, baseSpeed: 45, capacity: 2200, currentFlow: 0, roadType: 'bridge', lanes: 2, elevationSlope: 0, hazardRisk: 0.88, predictedRisk: 0.98, isBlocked: false, isBridge: true, trafficDensity: 0.95 },
    { id: 'e7', source: 'n3', target: 'n5', distance: 2.5, baseSpeed: 40, capacity: 3000, currentFlow: 0, roadType: 'local', lanes: 2, elevationSlope: 1, hazardRisk: 0.50, predictedRisk: 0.65, isBlocked: false, trafficDensity: 0.60 },
    { id: 'e8', source: 'n3', target: 'n10', distance: 3.2, baseSpeed: 45, capacity: 2400, currentFlow: 0, roadType: 'bridge', lanes: 2, elevationSlope: 1, hazardRisk: 0.82, predictedRisk: 0.92, isBlocked: false, isBridge: true, trafficDensity: 0.80 },
    { id: 'e9', source: 'n5', target: 'n9', distance: 1.2, baseSpeed: 40, capacity: 3200, currentFlow: 0, roadType: 'local', lanes: 2, elevationSlope: 1, hazardRisk: 0.40, predictedRisk: 0.50, isBlocked: false, trafficDensity: 0.45 },
    { id: 'e10', source: 'n5', target: 'n11', distance: 3.0, baseSpeed: 55, capacity: 5000, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 2, hazardRisk: 0.35, predictedRisk: 0.45, isBlocked: false, trafficDensity: 0.50 },
    { id: 'e11', source: 'n6', target: 'n13', distance: 3.5, baseSpeed: 50, capacity: 3500, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 3, hazardRisk: 0.25, predictedRisk: 0.35, isBlocked: false, trafficDensity: 0.40 },
    { id: 'e12', source: 'n10', target: 'n7', distance: 4.2, baseSpeed: 60, capacity: 4800, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 4, hazardRisk: 0.30, predictedRisk: 0.40, isBlocked: false, trafficDensity: 0.55 },
    { id: 'e13', source: 'n11', target: 'n7', distance: 3.8, baseSpeed: 60, capacity: 5500, currentFlow: 0, roadType: 'highway', lanes: 6, elevationSlope: 3, hazardRisk: 0.15, predictedRisk: 0.20, isBlocked: false, trafficDensity: 0.35 },
    { id: 'e14', source: 'n7', target: 'n8', distance: 2.8, baseSpeed: 65, capacity: 6000, currentFlow: 0, roadType: 'highway', lanes: 6, elevationSlope: 6, hazardRisk: 0.03, predictedRisk: 0.05, isBlocked: false, trafficDensity: 0.20 },
    { id: 'e15', source: 'n11', target: 'n12', distance: 4.5, baseSpeed: 65, capacity: 5200, currentFlow: 0, roadType: 'highway', lanes: 4, elevationSlope: 2, hazardRisk: 0.10, predictedRisk: 0.15, isBlocked: false, trafficDensity: 0.30 },
    { id: 'e16', source: 'n13', target: 'n12', distance: 2.4, baseSpeed: 50, capacity: 4000, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 1, hazardRisk: 0.08, predictedRisk: 0.12, isBlocked: false, trafficDensity: 0.25 },
    { id: 'e17', source: 'n13', target: 'n14', distance: 4.0, baseSpeed: 70, capacity: 6500, currentFlow: 0, roadType: 'highway', lanes: 6, elevationSlope: 1, hazardRisk: 0.06, predictedRisk: 0.08, isBlocked: false, trafficDensity: 0.15 },
    { id: 'e18', source: 'n15', target: 'n14', distance: 3.2, baseSpeed: 60, capacity: 4500, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 2, hazardRisk: 0.15, predictedRisk: 0.20, isBlocked: false, trafficDensity: 0.25 },
    { id: 'e19', source: 'n15', target: 'n16', distance: 3.5, baseSpeed: 55, capacity: 4000, currentFlow: 0, roadType: 'arterial', lanes: 4, elevationSlope: 1, hazardRisk: 0.12, predictedRisk: 0.18, isBlocked: false, trafficDensity: 0.20 },
    { id: 'e20', source: 'n14', target: 'n16', distance: 3.8, baseSpeed: 65, capacity: 5000, currentFlow: 0, roadType: 'highway', lanes: 4, elevationSlope: 1, hazardRisk: 0.05, predictedRisk: 0.07, isBlocked: false, trafficDensity: 0.10 }
  ],
  narrativeAlerts: [
    { timeStepHours: 0, title: 'Storm Surge Warning', message: 'Category 4 storm surge detected; Marina Beachfront water levels rising at 0.6m/hr.', severity: 'warning' },
    { timeStepHours: 2, title: 'River Causeway Bridge Vulnerability', message: 'Tarjan analysis marks River Causeway Bridge as critical single point of failure.', severity: 'critical' },
    { timeStepHours: 4, title: 'Proactive Road Closure', message: 'AI Predictor predicts Marina-Central link will be submerged within 30 min. Diverting flows to Koyambedu Hub.', severity: 'warning' }
  ]
};
