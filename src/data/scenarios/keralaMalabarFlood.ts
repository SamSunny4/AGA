import { ScenarioPreset } from '../../types/simulation';
import { GraphNode, GraphEdge, HazardZone } from '../../types/graph';

// Scenario 4: Malabar & Chaliyar River Inundation (കോഴിക്കോട് - ചാലിയാർ പ്രളയം)
// Real Kerala geographic coordinates (Lat 11.15 to 11.90, Lng 75.35 to 75.95)
const nodes: GraphNode[] = [
  // High-Capacity Medical & Relief Sanctuaries
  {
    id: 'kerala_calicut_med_college',
    name: 'Govt. Medical College Hospital (Kozhikode)',
    lat: 11.2720,
    lng: 75.8360,
    type: 'hospital',
    elevation: 48,
    population: 620,
    capacity: 3200,
    currentOccupancy: 1100,
    hazardRisk: 0.04,
    zoneId: 'ZONE-MALABAR-A'
  },
  {
    id: 'kerala_farook_college_camp',
    name: 'Farook College Flood Shelter (Feroke)',
    lat: 11.1960,
    lng: 75.8480,
    type: 'shelter',
    elevation: 32,
    population: 410,
    capacity: 2400,
    currentOccupancy: 780,
    hazardRisk: 0.12,
    zoneId: 'ZONE-MALABAR-A'
  },
  {
    id: 'kerala_kannur_dist_hosp',
    name: 'Kannur District HQ Hospital',
    lat: 11.8740,
    lng: 75.3720,
    type: 'hospital',
    elevation: 22,
    population: 390,
    capacity: 1800,
    currentOccupancy: 640,
    hazardRisk: 0.08,
    zoneId: 'ZONE-KANNUR'
  },
  {
    id: 'kerala_calicut_stn_hub',
    name: 'Kozhikode Railway & Central Logistics Depot',
    lat: 11.2460,
    lng: 75.7820,
    type: 'depot',
    elevation: 12,
    population: 260,
    capacity: 1000,
    currentOccupancy: 180,
    hazardRisk: 0.22,
    zoneId: 'ZONE-CALICUT-CITY'
  },

  // High-Risk Submerged Riverbanks & Lowland Zones (SOS Distress)
  {
    id: 'kerala_mavoor_chaliyar',
    name: 'Mavoor Chaliyar Riverbank Industrial Belt',
    lat: 11.2610,
    lng: 75.9450,
    type: 'residential',
    elevation: 8,
    population: 4500,
    hazardRisk: 0.92,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-CHALIYAR-FLOOD'
  },
  {
    id: 'kerala_feroke_bridge_basin',
    name: 'Feroke Old Bridge & Tile Town Basin',
    lat: 11.1780,
    lng: 75.8320,
    type: 'residential',
    elevation: 6,
    population: 3800,
    hazardRisk: 0.88,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-CHALIYAR-FLOOD'
  },
  {
    id: 'kerala_kozhikode_beach_ward',
    name: 'Kozhikode South Beach Heritage Colony',
    lat: 11.2580,
    lng: 75.7680,
    type: 'residential',
    elevation: 4,
    population: 3200,
    hazardRisk: 0.65,
    zoneId: 'ZONE-CALICUT-CITY'
  },
  {
    id: 'kerala_kunnamangalam_hub',
    name: 'Kunnamangalam High Junction (IIM/NIT Corridor)',
    lat: 11.3060,
    lng: 75.8760,
    type: 'intersection',
    elevation: 55,
    population: 2100,
    hazardRisk: 0.05,
    zoneId: 'ZONE-MALABAR-A'
  },
  {
    id: 'kerala_koyilandy_junction',
    name: 'Koyilandy Coastal Highway Intersect',
    lat: 11.4420,
    lng: 75.6960,
    type: 'intersection',
    elevation: 10,
    population: 1700,
    hazardRisk: 0.25,
    zoneId: 'ZONE-MALABAR-NORTH'
  },
  {
    id: 'kerala_thalassery_town',
    name: 'Thalassery Historic Fort Node',
    lat: 11.7520,
    lng: 75.4920,
    type: 'intersection',
    elevation: 14,
    population: 2300,
    hazardRisk: 0.15,
    zoneId: 'ZONE-KANNUR'
  }
];

const edges: GraphEdge[] = [
  // Chaliyar basin escape corridors
  {
    id: 'e_mavoor_kunnamangalam',
    source: 'kerala_mavoor_chaliyar',
    target: 'kerala_kunnamangalam_hub',
    distance: 8.5,
    baseSpeed: 45,
    capacity: 1800,
    currentFlow: 1400,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 2.2,
    hazardRisk: 0.40,
    predictedRisk: 0.55,
    isBlocked: false,
    trafficDensity: 0.75
  },
  {
    id: 'e_kunnamangalam_med_college',
    source: 'kerala_kunnamangalam_hub',
    target: 'kerala_calicut_med_college',
    distance: 6.2,
    baseSpeed: 55,
    capacity: 3500,
    currentFlow: 1900,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.5,
    hazardRisk: 0.06,
    predictedRisk: 0.08,
    isBlocked: false,
    trafficDensity: 0.50
  },
  {
    id: 'e_feroke_farook_camp',
    source: 'kerala_feroke_bridge_basin',
    target: 'kerala_farook_college_camp',
    distance: 2.5,
    baseSpeed: 30,
    capacity: 1200,
    currentFlow: 1150,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 1.8,
    hazardRisk: 0.50,
    predictedRisk: 0.65,
    isBlocked: false,
    isBridge: true,
    trafficDensity: 0.85
  },
  {
    id: 'e_feroke_calicut_stn',
    source: 'kerala_feroke_bridge_basin',
    target: 'kerala_calicut_stn_hub',
    distance: 10.8,
    baseSpeed: 50,
    capacity: 2800,
    currentFlow: 2200,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.3,
    hazardRisk: 0.82,
    predictedRisk: 0.94,
    isBlocked: true,
    blockageReason: 'Chaliyar River Floodwaters Submerged Feroke Bridge Approach',
    isBridge: true,
    trafficDensity: 0.95
  },
  {
    id: 'e_calicut_beach_stn',
    source: 'kerala_kozhikode_beach_ward',
    target: 'kerala_calicut_stn_hub',
    distance: 2.1,
    baseSpeed: 35,
    capacity: 2200,
    currentFlow: 1300,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 0.2,
    hazardRisk: 0.30,
    predictedRisk: 0.38,
    isBlocked: false,
    trafficDensity: 0.60
  },
  {
    id: 'e_calicut_stn_med_college',
    source: 'kerala_calicut_stn_hub',
    target: 'kerala_calicut_med_college',
    distance: 7.4,
    baseSpeed: 45,
    capacity: 3800,
    currentFlow: 1800,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 1.2,
    hazardRisk: 0.08,
    predictedRisk: 0.10,
    isBlocked: false,
    trafficDensity: 0.50
  },
  {
    id: 'e_med_college_koyilandy',
    source: 'kerala_calicut_med_college',
    target: 'kerala_koyilandy_junction',
    distance: 21.0,
    baseSpeed: 65,
    capacity: 4000,
    currentFlow: 1600,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.3,
    hazardRisk: 0.12,
    predictedRisk: 0.15,
    isBlocked: false,
    trafficDensity: 0.45
  },
  {
    id: 'e_koyilandy_thalassery',
    source: 'kerala_koyilandy_junction',
    target: 'kerala_thalassery_town',
    distance: 36.5,
    baseSpeed: 65,
    capacity: 3600,
    currentFlow: 1400,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.2,
    hazardRisk: 0.10,
    predictedRisk: 0.12,
    isBlocked: false,
    trafficDensity: 0.40
  },
  {
    id: 'e_thalassery_kannur',
    source: 'kerala_thalassery_town',
    target: 'kerala_kannur_dist_hosp',
    distance: 19.5,
    baseSpeed: 60,
    capacity: 3200,
    currentFlow: 1200,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.3,
    hazardRisk: 0.08,
    predictedRisk: 0.10,
    isBlocked: false,
    trafficDensity: 0.40
  }
];

const initialHazards: HazardZone[] = [
  {
    id: 'hz_chaliyar_flood',
    type: 'flood',
    centerLat: 11.2610,
    centerLng: 75.9450,
    radiusKm: 5.2,
    intensity: 0.92,
    expansionRateKmH: 0.70,
    directionDeg: 250 // Chaliyar westward drainage to Beypore
  },
  {
    id: 'hz_feroke_estuary',
    type: 'flood',
    centerLat: 11.1780,
    centerLng: 75.8320,
    radiusKm: 3.8,
    intensity: 0.86,
    expansionRateKmH: 0.50,
    directionDeg: 280
  }
];

export const keralaMalabarFloodScenario: ScenarioPreset = {
  id: 'kerala_malabar_flood',
  name: 'Malabar Chaliyar River Flooding (കോഴിക്കോട് ചാലിയാർ പ്രളയം)',
  disasterType: 'flood',
  description: 'Unprecedented rainfall in Nilambur & Wayanad catchment surges down the Chaliyar river basin, inundating Mavoor, Feroke, and low-lying Kozhikode coastal tracts.',
  centerLat: 11.2600,
  centerLng: 75.8200,
  zoom: 11,
  weather: {
    temperatureC: 25.0,
    rainfallMmH: 62.0,
    windSpeedKmH: 48.0,
    windDirectionDeg: 250,
    visibilityKm: 3.0,
    humidityPct: 96
  },
  initialHazards,
  nodes,
  edges,
  narrativeAlerts: [
    {
      timeStepHours: 0.0,
      title: 'Chaliyar River Level Above Danger Level',
      message: 'Mavoor industrial belt and Feroke town waterlogged. Evacuation in progress towards Calicut Medical College and Farook College.',
      severity: 'critical'
    },
    {
      timeStepHours: 1.5,
      title: 'Feroke Highway Route Impassable',
      message: 'Backwaters have covered the southern arterial road. Use Kunnamangalam bypass for all emergency transit.',
      severity: 'warning'
    }
  ]
};
