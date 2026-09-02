import { ScenarioPreset } from '../../types/simulation';
import { GraphNode, GraphEdge, HazardZone } from '../../types/graph';

// Scenario 2: Wayanad Landslides & Western Ghats Flash Floods (മുണ്ടക്കൈ - ചൂരൽമല ഉരുൾപൊട്ടൽ)
// Real Kerala geographic coordinates (Lat 11.50 to 11.85, Lng 75.90 to 76.28)
const nodes: GraphNode[] = [
  // Medical & High-Ground Safe Relief Hubs
  {
    id: 'kerala_meppadi_hss_camp',
    name: 'St. Joseph HSS Relief Camp (Meppadi)',
    lat: 11.5510,
    lng: 76.1260,
    type: 'shelter',
    elevation: 850,
    population: 320,
    capacity: 2200,
    currentOccupancy: 860,
    hazardRisk: 0.15,
    zoneId: 'ZONE-WAYANAD-A'
  },
  {
    id: 'kerala_wims_med_college',
    name: 'DM WIMS Medical College Hospital (Naseera Nagar, Meppadi)',
    lat: 11.5640,
    lng: 76.1420,
    type: 'hospital',
    elevation: 870,
    population: 480,
    capacity: 1500,
    currentOccupancy: 980,
    hazardRisk: 0.10,
    zoneId: 'ZONE-WAYANAD-A'
  },
  {
    id: 'kerala_kalpetta_gen_hosp',
    name: 'Kalpetta District General Hospital',
    lat: 11.6080,
    lng: 76.0820,
    type: 'hospital',
    elevation: 780,
    population: 620,
    capacity: 1200,
    currentOccupancy: 610,
    hazardRisk: 0.05,
    zoneId: 'ZONE-WAYANAD-B'
  },
  {
    id: 'kerala_mananthavady_hosp',
    name: 'Mananthavady District Medical Centre',
    lat: 11.8020,
    lng: 76.0040,
    type: 'shelter',
    elevation: 760,
    population: 350,
    capacity: 1800,
    currentOccupancy: 390,
    hazardRisk: 0.02,
    zoneId: 'ZONE-WAYANAD-C'
  },
  {
    id: 'kerala_sulthan_bathery_hub',
    name: 'Sulthan Bathery Emergency Logistics Base',
    lat: 11.6620,
    lng: 76.2570,
    type: 'depot',
    elevation: 930,
    population: 200,
    capacity: 900,
    currentOccupancy: 150,
    hazardRisk: 0.04,
    zoneId: 'ZONE-WAYANAD-D'
  },

  // High-Risk Landslide Origin & Stranded Points (SOS Distress)
  {
    id: 'kerala_mundakkai_estate',
    name: 'Mundakkai Tea Plantation Village (Epicenter)',
    lat: 11.5420,
    lng: 76.1720,
    type: 'residential',
    elevation: 980,
    population: 2400,
    hazardRisk: 0.96,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-WAYANAD-HAZARD'
  },
  {
    id: 'kerala_chooralmala_town',
    name: 'Chooralmala Town & River Crossing',
    lat: 11.5380,
    lng: 76.1480,
    type: 'residential',
    elevation: 890,
    population: 3100,
    hazardRisk: 0.92,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-WAYANAD-HAZARD'
  },
  {
    id: 'kerala_vellarmala_school',
    name: 'Vellarmala GVHSS Hilltop Refuge',
    lat: 11.5310,
    lng: 76.1550,
    type: 'residential',
    elevation: 920,
    population: 1100,
    hazardRisk: 0.88,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-WAYANAD-HAZARD'
  },
  {
    id: 'kerala_vythiri_valley',
    name: 'Vythiri Rain Shadow Pass',
    lat: 11.5520,
    lng: 76.0420,
    type: 'intersection',
    elevation: 700,
    population: 1800,
    hazardRisk: 0.40,
    zoneId: 'ZONE-WAYANAD-B'
  },
  {
    id: 'kerala_thamarassery_churam',
    name: 'Thamarassery Churam Ghat Road (Hairpin 4)',
    lat: 11.4980,
    lng: 75.9860,
    type: 'intersection',
    elevation: 520,
    population: 500,
    hazardRisk: 0.70,
    zoneId: 'ZONE-WAYANAD-GHAT'
  },
  {
    id: 'kerala_lakkidi_viewpoint',
    name: 'Lakkidi Gateway to Wayanad',
    lat: 11.5160,
    lng: 76.0380,
    type: 'intersection',
    elevation: 710,
    population: 950,
    hazardRisk: 0.35,
    zoneId: 'ZONE-WAYANAD-B'
  }
];

const edges: GraphEdge[] = [
  // Mundakkai & Chooralmala critical disaster access
  {
    id: 'e_mundakkai_chooralmala',
    source: 'kerala_mundakkai_estate',
    target: 'kerala_chooralmala_town',
    distance: 2.8,
    baseSpeed: 20,
    capacity: 400,
    currentFlow: 380,
    roadType: 'mountain_pass',
    lanes: 1,
    elevationSlope: 6.5,
    hazardRisk: 0.95,
    predictedRisk: 0.98,
    isBlocked: true,
    blockageReason: 'Massive Mudslide & Debris Torrent Swept Away Road',
    isBridge: true,
    trafficDensity: 0.95
  },
  {
    id: 'e_vellarmala_chooralmala',
    source: 'kerala_vellarmala_school',
    target: 'kerala_chooralmala_town',
    distance: 1.5,
    baseSpeed: 15,
    capacity: 350,
    currentFlow: 320,
    roadType: 'mountain_pass',
    lanes: 1,
    elevationSlope: 4.8,
    hazardRisk: 0.90,
    predictedRisk: 0.95,
    isBlocked: true,
    blockageReason: 'River Course Shifted Over Access Road',
    trafficDensity: 0.90
  },
  {
    id: 'e_chooralmala_meppadi',
    source: 'kerala_chooralmala_town',
    target: 'kerala_meppadi_hss_camp',
    distance: 6.2,
    baseSpeed: 35,
    capacity: 1200,
    currentFlow: 1100,
    roadType: 'bridge',
    lanes: 2,
    elevationSlope: 2.5,
    hazardRisk: 0.60,
    predictedRisk: 0.75,
    isBlocked: false,
    blockageReason: 'Indian Army Bailey Bridge Operational',
    isBridge: true,
    trafficDensity: 0.85
  },
  {
    id: 'e_meppadi_wims',
    source: 'kerala_meppadi_hss_camp',
    target: 'kerala_wims_med_college',
    distance: 2.4,
    baseSpeed: 45,
    capacity: 2000,
    currentFlow: 1400,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 1.0,
    hazardRisk: 0.12,
    predictedRisk: 0.15,
    isBlocked: false,
    trafficDensity: 0.60
  },
  {
    id: 'e_meppadi_kalpetta',
    source: 'kerala_meppadi_hss_camp',
    target: 'kerala_kalpetta_gen_hosp',
    distance: 11.2,
    baseSpeed: 50,
    capacity: 2500,
    currentFlow: 1600,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 1.8,
    hazardRisk: 0.10,
    predictedRisk: 0.12,
    isBlocked: false,
    trafficDensity: 0.55
  },
  {
    id: 'e_kalpetta_vythiri',
    source: 'kerala_kalpetta_gen_hosp',
    target: 'kerala_vythiri_valley',
    distance: 9.8,
    baseSpeed: 55,
    capacity: 2800,
    currentFlow: 1200,
    roadType: 'highway',
    lanes: 2,
    elevationSlope: 1.5,
    hazardRisk: 0.20,
    predictedRisk: 0.25,
    isBlocked: false,
    trafficDensity: 0.45
  },
  {
    id: 'e_vythiri_lakkidi',
    source: 'kerala_vythiri_valley',
    target: 'kerala_lakkidi_viewpoint',
    distance: 4.5,
    baseSpeed: 40,
    capacity: 2200,
    currentFlow: 1500,
    roadType: 'highway',
    lanes: 2,
    elevationSlope: 2.2,
    hazardRisk: 0.35,
    predictedRisk: 0.45,
    isBlocked: false,
    trafficDensity: 0.65
  },
  {
    id: 'e_lakkidi_churam',
    source: 'kerala_lakkidi_viewpoint',
    target: 'kerala_thamarassery_churam',
    distance: 6.8,
    baseSpeed: 25,
    capacity: 1100,
    currentFlow: 900,
    roadType: 'mountain_pass',
    lanes: 2,
    elevationSlope: 7.2,
    hazardRisk: 0.75,
    predictedRisk: 0.88,
    isBlocked: true,
    blockageReason: 'Rockfall and Mud Accumulation on Hairpin Bend 4',
    isBridge: true,
    trafficDensity: 0.90
  },
  {
    id: 'e_kalpetta_bathery',
    source: 'kerala_kalpetta_gen_hosp',
    target: 'kerala_sulthan_bathery_hub',
    distance: 24.5,
    baseSpeed: 60,
    capacity: 3200,
    currentFlow: 1300,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.8,
    hazardRisk: 0.05,
    predictedRisk: 0.08,
    isBlocked: false,
    trafficDensity: 0.40
  },
  {
    id: 'e_kalpetta_mananthavady',
    source: 'kerala_kalpetta_gen_hosp',
    target: 'kerala_mananthavady_hosp',
    distance: 31.0,
    baseSpeed: 55,
    capacity: 2600,
    currentFlow: 1000,
    roadType: 'highway',
    lanes: 2,
    elevationSlope: 1.0,
    hazardRisk: 0.04,
    predictedRisk: 0.06,
    isBlocked: false,
    trafficDensity: 0.35
  }
];

const initialHazards: HazardZone[] = [
  {
    id: 'hz_mundakkai_slide',
    type: 'landslide',
    centerLat: 11.5420,
    centerLng: 76.1720,
    radiusKm: 3.8,
    intensity: 0.98,
    expansionRateKmH: 0.80,
    directionDeg: 260 // Downhill towards Chooralmala
  },
  {
    id: 'hz_churam_rockfall',
    type: 'landslide',
    centerLat: 11.4980,
    centerLng: 75.9860,
    radiusKm: 2.2,
    intensity: 0.82,
    expansionRateKmH: 0.30,
    directionDeg: 220
  }
];

export const keralaWayanadLandslideScenario: ScenarioPreset = {
  id: 'kerala_wayanad_landslide',
  name: 'Wayanad Ghats Landslide Catastrophe (വയനാട് ചൂരൽമല ഉരുൾപൊട്ടൽ)',
  disasterType: 'landslide',
  description: 'Catastrophic hill collapses and debris flows triggered by extreme cloudbursts in Mundakkai and Chooralmala. NDRF, Indian Army Bailey Bridge teams, and emergency helicopters deployed.',
  centerLat: 11.5600,
  centerLng: 76.1200,
  zoom: 12,
  weather: {
    temperatureC: 22.0,
    rainfallMmH: 140.0,
    windSpeedKmH: 55.0,
    windDirectionDeg: 270,
    visibilityKm: 1.0,
    humidityPct: 100
  },
  initialHazards,
  nodes,
  edges,
  narrativeAlerts: [
    {
      timeStepHours: 0.0,
      title: 'Massive Debris Flow in Mundakkai',
      message: 'Upper hill slope detached. Bridge to Chooralmala damaged. Rapid evacuation to St. Joseph HSS & WIMS Medical College.',
      severity: 'critical'
    },
    {
      timeStepHours: 1.0,
      title: 'Army Bailey Bridge Construction Initiated',
      message: 'Madras Sappers establishing vital logistical link between Chooralmala and Meppadi for heavy vehicle transit.',
      severity: 'info'
    },
    {
      timeStepHours: 2.5,
      title: 'Thamarassery Churam Ghat Road Closed',
      message: 'Landslide warning on Hairpin 4. All heavy transit diverted via Sulthan Bathery & Mananthavady routes.',
      severity: 'warning'
    }
  ]
};
