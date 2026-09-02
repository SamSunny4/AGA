import { ScenarioPreset } from '../../types/simulation';
import { GraphNode, GraphEdge, HazardZone } from '../../types/graph';

// Scenario 3: South Kerala Coastal Storm Surge & Cyclone Alert (തിരുവനന്തപുരം - കൊല്ലം തീരദേശ ചുഴലിക്കാറ്റ്)
// Real Kerala geographic coordinates (Lat 8.35 to 8.95, Lng 76.55 to 77.05)
const nodes: GraphNode[] = [
  // High Ground Shelters & Medical Campuses
  {
    id: 'kerala_tvm_med_college',
    name: 'Govt. Medical College Hospital (Thiruvananthapuram)',
    lat: 8.5240,
    lng: 76.9280,
    type: 'hospital',
    elevation: 35,
    population: 850,
    capacity: 2500,
    currentOccupancy: 1200,
    hazardRisk: 0.05,
    zoneId: 'ZONE-TVM-SAFE'
  },
  {
    id: 'kerala_technopark_centre',
    name: 'Technopark High-Capacity Evacuation Hub (Kazhakkoottam)',
    lat: 8.5580,
    lng: 76.8810,
    type: 'shelter',
    elevation: 25,
    population: 450,
    capacity: 3500,
    currentOccupancy: 620,
    hazardRisk: 0.08,
    zoneId: 'ZONE-TVM-SAFE'
  },
  {
    id: 'kerala_fatima_college_kollam',
    name: 'Fatima Mata National College Shelter (Kollam)',
    lat: 8.8870,
    lng: 76.5980,
    type: 'shelter',
    elevation: 18,
    population: 380,
    capacity: 2000,
    currentOccupancy: 740,
    hazardRisk: 0.15,
    zoneId: 'ZONE-KOLLAM'
  },
  {
    id: 'kerala_tvm_central_hub',
    name: 'Thampanoor Central Transportation & Rescue Base',
    lat: 8.4880,
    lng: 76.9530,
    type: 'depot',
    elevation: 16,
    population: 320,
    capacity: 1000,
    currentOccupancy: 210,
    hazardRisk: 0.20,
    zoneId: 'ZONE-TVM-CITY'
  },

  // High-Risk Coastal Surge Frontlines (SOS Distress)
  {
    id: 'kerala_vizhinjam_port',
    name: 'Vizhinjam International Port Coastal Belt',
    lat: 8.3760,
    lng: 76.9920,
    type: 'residential',
    elevation: 3,
    population: 4200,
    hazardRisk: 0.92,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-COASTAL-RED'
  },
  {
    id: 'kerala_shanghumugham_beach',
    name: 'Shanghumugham Coastal Fishermen Colony',
    lat: 8.4780,
    lng: 76.9080,
    type: 'residential',
    elevation: 2,
    population: 3600,
    hazardRisk: 0.96,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-COASTAL-RED'
  },
  {
    id: 'kerala_kovalam_ridge',
    name: 'Kovalam Coastal Headland',
    lat: 8.3980,
    lng: 76.9780,
    type: 'commercial',
    elevation: 22,
    population: 1400,
    hazardRisk: 0.65,
    zoneId: 'ZONE-COASTAL-RED'
  },
  {
    id: 'kerala_varkala_cliff',
    name: 'Varkala Helipad & Cliff Transit Node',
    lat: 8.7360,
    lng: 76.7030,
    type: 'intersection',
    elevation: 26,
    population: 1900,
    hazardRisk: 0.40,
    zoneId: 'ZONE-VARKALA'
  },
  {
    id: 'kerala_attingal_junction',
    name: 'Attingal NH-66 Bypass Hub',
    lat: 8.6940,
    lng: 76.8140,
    type: 'intersection',
    elevation: 20,
    population: 2200,
    hazardRisk: 0.12,
    zoneId: 'ZONE-TVM-SAFE'
  },
  {
    id: 'kerala_neendakara_port',
    name: 'Neendakara Fishing Harbour & Estuary',
    lat: 8.9380,
    lng: 76.5400,
    type: 'residential',
    elevation: 2,
    population: 2900,
    hazardRisk: 0.85,
    isDistressActive: true,
    distressPriority: 'P2',
    zoneId: 'ZONE-KOLLAM'
  }
];

const edges: GraphEdge[] = [
  // Coastal evacuation routes to safety
  {
    id: 'e_vizhinjam_kovalam',
    source: 'kerala_vizhinjam_port',
    target: 'kerala_kovalam_ridge',
    distance: 3.2,
    baseSpeed: 35,
    capacity: 1100,
    currentFlow: 980,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 1.5,
    hazardRisk: 0.80,
    predictedRisk: 0.90,
    isBlocked: false,
    trafficDensity: 0.85
  },
  {
    id: 'e_kovalam_tvm_central',
    source: 'kerala_kovalam_ridge',
    target: 'kerala_tvm_central_hub',
    distance: 13.5,
    baseSpeed: 60,
    capacity: 3200,
    currentFlow: 1900,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.5,
    hazardRisk: 0.25,
    predictedRisk: 0.30,
    isBlocked: false,
    trafficDensity: 0.60
  },
  {
    id: 'e_shanghumugham_airport_road',
    source: 'kerala_shanghumugham_beach',
    target: 'kerala_tvm_central_hub',
    distance: 6.8,
    baseSpeed: 30,
    capacity: 900,
    currentFlow: 850,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 0.3,
    hazardRisk: 0.92,
    predictedRisk: 0.98,
    isBlocked: true,
    blockageReason: 'Sea Erosion and High Tidal Waves Overrun Beach Road',
    isBridge: true,
    trafficDensity: 0.95
  },
  {
    id: 'e_shanghumugham_med_college',
    source: 'kerala_shanghumugham_beach',
    target: 'kerala_tvm_med_college',
    distance: 8.2,
    baseSpeed: 45,
    capacity: 2200,
    currentFlow: 1400,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 0.8,
    hazardRisk: 0.35,
    predictedRisk: 0.45,
    isBlocked: false,
    trafficDensity: 0.70
  },
  {
    id: 'e_tvm_central_med_college',
    source: 'kerala_tvm_central_hub',
    target: 'kerala_tvm_med_college',
    distance: 5.5,
    baseSpeed: 45,
    capacity: 3500,
    currentFlow: 1600,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 0.6,
    hazardRisk: 0.10,
    predictedRisk: 0.12,
    isBlocked: false,
    trafficDensity: 0.50
  },
  {
    id: 'e_med_college_technopark',
    source: 'kerala_tvm_med_college',
    target: 'kerala_technopark_centre',
    distance: 8.4,
    baseSpeed: 65,
    capacity: 4500,
    currentFlow: 2000,
    roadType: 'highway',
    lanes: 6,
    elevationSlope: 0.3,
    hazardRisk: 0.06,
    predictedRisk: 0.08,
    isBlocked: false,
    trafficDensity: 0.45
  },
  {
    id: 'e_technopark_attingal',
    source: 'kerala_technopark_centre',
    target: 'kerala_attingal_junction',
    distance: 18.2,
    baseSpeed: 70,
    capacity: 4200,
    currentFlow: 1700,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.2,
    hazardRisk: 0.08,
    predictedRisk: 0.10,
    isBlocked: false,
    trafficDensity: 0.40
  },
  {
    id: 'e_attingal_varkala',
    source: 'kerala_attingal_junction',
    target: 'kerala_varkala_cliff',
    distance: 14.6,
    baseSpeed: 50,
    capacity: 2400,
    currentFlow: 1100,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 0.4,
    hazardRisk: 0.25,
    predictedRisk: 0.30,
    isBlocked: false,
    trafficDensity: 0.45
  },
  {
    id: 'e_varkala_fatima_college',
    source: 'kerala_varkala_cliff',
    target: 'kerala_fatima_college_kollam',
    distance: 24.0,
    baseSpeed: 60,
    capacity: 3100,
    currentFlow: 1500,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.2,
    hazardRisk: 0.18,
    predictedRisk: 0.22,
    isBlocked: false,
    trafficDensity: 0.50
  },
  {
    id: 'e_fatima_neendakara',
    source: 'kerala_fatima_college_kollam',
    target: 'kerala_neendakara_port',
    distance: 9.5,
    baseSpeed: 45,
    capacity: 2000,
    currentFlow: 1600,
    roadType: 'bridge',
    lanes: 2,
    elevationSlope: 0.1,
    hazardRisk: 0.70,
    predictedRisk: 0.85,
    isBlocked: false,
    isBridge: true,
    trafficDensity: 0.80
  }
];

const initialHazards: HazardZone[] = [
  {
    id: 'hz_arabian_sea_surge',
    type: 'cyclone',
    centerLat: 8.4780,
    centerLng: 76.9080,
    radiusKm: 6.5,
    intensity: 0.94,
    expansionRateKmH: 0.90,
    directionDeg: 65 // Inward surge onto coastline
  },
  {
    id: 'hz_vizhinjam_storm',
    type: 'cyclone',
    centerLat: 8.3760,
    centerLng: 76.9920,
    radiusKm: 4.8,
    intensity: 0.88,
    expansionRateKmH: 0.70,
    directionDeg: 60
  }
];

export const keralaCoastalSurgeScenario: ScenarioPreset = {
  id: 'kerala_coastal_surge',
  name: 'South Kerala Coastal Surge & Cyclone Alert (തിരുവനന്തപുരം - കൊല്ലം തീരദേശ അടിയന്തരാവസ്ഥ)',
  disasterType: 'cyclone',
  description: 'Deep depression in the Arabian Sea bringing severe coastal wave surges, storm tides, and gale-force squalls across Shanghumugham, Vizhinjam, Varkala, and Kollam shorelines.',
  centerLat: 8.5200,
  centerLng: 76.9000,
  zoom: 11,
  weather: {
    temperatureC: 28.0,
    rainfallMmH: 52.0,
    windSpeedKmH: 78.0,
    windDirectionDeg: 230,
    visibilityKm: 3.0,
    humidityPct: 95
  },
  initialHazards,
  nodes,
  edges,
  narrativeAlerts: [
    {
      timeStepHours: 0.0,
      title: 'Severe Coastal Gale & High Tide Alert',
      message: 'Storm tides up to 4.5 meters expected. Fishermen communities in Shanghumugham & Vizhinjam ordered to evacuate immediately.',
      severity: 'critical'
    },
    {
      timeStepHours: 1.5,
      title: 'Shanghumugham Beach Road Breach',
      message: 'Wave overtopping has closed direct airport approach road. Indian Coast Guard conducting boat rescues.',
      severity: 'warning'
    }
  ]
};
