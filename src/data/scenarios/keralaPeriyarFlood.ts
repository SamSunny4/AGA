import { ScenarioPreset } from '../../types/simulation';
import { GraphNode, GraphEdge, HazardZone } from '../../types/graph';

// Scenario 1: Kerala Monsoon Deluge & Periyar Basin / Kuttanad Flash Flood
// Real Kerala geographic coordinates (Lat 9.92 to 10.20, Lng 76.22 to 76.95)
const nodes: GraphNode[] = [
  // Major High-Ground Shelters & Medical Hubs
  {
    id: 'kerala_cusat_camp',
    name: 'CUSAT Campus Relief Camp (Kalamassery)',
    lat: 10.0465,
    lng: 76.3262,
    type: 'shelter',
    elevation: 28,
    population: 420,
    capacity: 2500,
    currentOccupancy: 380,
    hazardRisk: 0.05,
    zoneId: 'ZONE-A'
  },
  {
    id: 'kerala_aster_medcity',
    name: 'Aster Medcity Emergency Trauma Center (Cheranallur)',
    lat: 10.0520,
    lng: 76.2730,
    type: 'hospital',
    elevation: 12,
    population: 310,
    capacity: 1200,
    currentOccupancy: 890,
    hazardRisk: 0.12,
    zoneId: 'ZONE-A'
  },
  {
    id: 'kerala_ekm_gen_hosp',
    name: 'Ernakulam General Hospital (Marine Drive)',
    lat: 9.9740,
    lng: 76.2790,
    type: 'hospital',
    elevation: 8,
    population: 550,
    capacity: 1000,
    currentOccupancy: 740,
    hazardRisk: 0.25,
    zoneId: 'ZONE-B'
  },
  {
    id: 'kerala_rajagiri_hosp',
    name: 'Rajagiri Hospital & Shelter Hub (Chunangamvely, Aluva)',
    lat: 10.1190,
    lng: 76.3780,
    type: 'shelter',
    elevation: 32,
    population: 260,
    capacity: 1800,
    currentOccupancy: 420,
    hazardRisk: 0.08,
    zoneId: 'ZONE-C'
  },
  {
    id: 'kerala_sd_college_camp',
    name: 'SD College Flood Relief Center (Alappuzha)',
    lat: 9.4720,
    lng: 76.3380,
    type: 'shelter',
    elevation: 6,
    population: 680,
    capacity: 3000,
    currentOccupancy: 1950,
    hazardRisk: 0.35,
    zoneId: 'ZONE-D'
  },

  // Logistics & Rescue Depots
  {
    id: 'kerala_vyttila_hub',
    name: 'Vyttila Mobility Hub Rescue Base',
    lat: 9.9670,
    lng: 76.3190,
    type: 'depot',
    elevation: 10,
    population: 180,
    capacity: 800,
    currentOccupancy: 120,
    hazardRisk: 0.18,
    zoneId: 'ZONE-B'
  },
  {
    id: 'kerala_aluva_metro_depot',
    name: 'Aluva Metro Emergency Logistics Depot',
    lat: 10.1080,
    lng: 76.3530,
    type: 'depot',
    elevation: 18,
    population: 140,
    capacity: 600,
    currentOccupancy: 95,
    hazardRisk: 0.42,
    zoneId: 'ZONE-C'
  },

  // High-Risk Inundated Residential & Transit Nodes (SOS Distress Points)
  {
    id: 'kerala_aluva_manappuram',
    name: 'Aluva Manappuram (Periyar Submerged Basin)',
    lat: 10.1140,
    lng: 76.3460,
    type: 'residential',
    elevation: 5,
    population: 4800,
    hazardRisk: 0.88,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-C'
  },
  {
    id: 'kerala_paravur_basin',
    name: 'North Paravur Low-Lying Island Colony',
    lat: 10.1480,
    lng: 76.2290,
    type: 'residential',
    elevation: 3,
    population: 3900,
    hazardRisk: 0.82,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-C'
  },
  {
    id: 'kerala_kuttanad_polder',
    name: 'Kuttanad Below-Sea-Level Polder Belt (Nedumudi)',
    lat: 9.4350,
    lng: 76.4020,
    type: 'residential',
    elevation: -1,
    population: 6200,
    hazardRisk: 0.94,
    isDistressActive: true,
    distressPriority: 'P1',
    zoneId: 'ZONE-D'
  },
  {
    id: 'kerala_edapally_toll',
    name: 'Edapally Toll Junction & NH-66 Intersect',
    lat: 10.0240,
    lng: 76.3080,
    type: 'intersection',
    elevation: 14,
    population: 1200,
    hazardRisk: 0.22,
    zoneId: 'ZONE-B'
  },
  {
    id: 'kerala_infopark_kakkanad',
    name: 'Kakkanad SmartCity / Infopark Zone',
    lat: 10.0120,
    lng: 76.3630,
    type: 'commercial',
    elevation: 24,
    population: 2800,
    hazardRisk: 0.10,
    zoneId: 'ZONE-B'
  },
  {
    id: 'kerala_chalakudy_town',
    name: 'Chalakudy Riverbank Residential Sector',
    lat: 10.3060,
    lng: 76.3320,
    type: 'residential',
    elevation: 16,
    population: 3400,
    hazardRisk: 0.75,
    isDistressActive: true,
    distressPriority: 'P2',
    zoneId: 'ZONE-E'
  },
  {
    id: 'kerala_cherthala_town',
    name: 'Cherthala Coastal Bypass Intersect',
    lat: 9.6840,
    lng: 76.3320,
    type: 'intersection',
    elevation: 8,
    population: 1600,
    hazardRisk: 0.30,
    zoneId: 'ZONE-D'
  },
  {
    id: 'kerala_thodupuzha_junction',
    name: 'Thodupuzha River Confluence Hub',
    lat: 9.8960,
    lng: 76.7130,
    type: 'intersection',
    elevation: 36,
    population: 2100,
    hazardRisk: 0.45,
    zoneId: 'ZONE-F'
  }
];

const edges: GraphEdge[] = [
  // Aluva & Periyar Basin Network
  {
    id: 'e_aluva_manappuram_metro',
    source: 'kerala_aluva_manappuram',
    target: 'kerala_aluva_metro_depot',
    distance: 1.8,
    baseSpeed: 30,
    capacity: 900,
    currentFlow: 750,
    roadType: 'bridge',
    lanes: 2,
    elevationSlope: 1.2,
    hazardRisk: 0.85,
    predictedRisk: 0.95,
    isBlocked: true,
    blockageReason: 'Periyar River Spilled over Marthanda Varma Bridge',
    isBridge: true,
    trafficDensity: 0.95
  },
  {
    id: 'e_aluva_metro_rajagiri',
    source: 'kerala_aluva_metro_depot',
    target: 'kerala_rajagiri_hosp',
    distance: 3.4,
    baseSpeed: 50,
    capacity: 2200,
    currentFlow: 1400,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 0.5,
    hazardRisk: 0.20,
    predictedRisk: 0.25,
    isBlocked: false,
    trafficDensity: 0.60
  },
  {
    id: 'e_aluva_metro_cusat',
    source: 'kerala_aluva_metro_depot',
    target: 'kerala_cusat_camp',
    distance: 7.2,
    baseSpeed: 60,
    capacity: 3500,
    currentFlow: 1800,
    roadType: 'highway',
    lanes: 6,
    elevationSlope: 0.4,
    hazardRisk: 0.15,
    predictedRisk: 0.18,
    isBlocked: false,
    trafficDensity: 0.55
  },
  {
    id: 'e_paravur_aster',
    source: 'kerala_paravur_basin',
    target: 'kerala_aster_medcity',
    distance: 11.5,
    baseSpeed: 45,
    capacity: 1400,
    currentFlow: 950,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 0.2,
    hazardRisk: 0.65,
    predictedRisk: 0.80,
    isBlocked: false,
    trafficDensity: 0.70
  },
  {
    id: 'e_paravur_cusat',
    source: 'kerala_paravur_basin',
    target: 'kerala_cusat_camp',
    distance: 13.8,
    baseSpeed: 45,
    capacity: 1800,
    currentFlow: 1100,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 0.6,
    hazardRisk: 0.40,
    predictedRisk: 0.50,
    isBlocked: false,
    trafficDensity: 0.65
  },

  // Kochi City Network
  {
    id: 'e_cusat_edapally',
    source: 'kerala_cusat_camp',
    target: 'kerala_edapally_toll',
    distance: 3.2,
    baseSpeed: 60,
    capacity: 4000,
    currentFlow: 2100,
    roadType: 'highway',
    lanes: 6,
    elevationSlope: 0.2,
    hazardRisk: 0.12,
    predictedRisk: 0.15,
    isBlocked: false,
    trafficDensity: 0.50
  },
  {
    id: 'e_aster_edapally',
    source: 'kerala_aster_medcity',
    target: 'kerala_edapally_toll',
    distance: 4.8,
    baseSpeed: 50,
    capacity: 2500,
    currentFlow: 1200,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 0.1,
    hazardRisk: 0.15,
    predictedRisk: 0.20,
    isBlocked: false,
    trafficDensity: 0.45
  },
  {
    id: 'e_edapally_vyttila',
    source: 'kerala_edapally_toll',
    target: 'kerala_vyttila_hub',
    distance: 6.5,
    baseSpeed: 55,
    capacity: 4500,
    currentFlow: 2900,
    roadType: 'highway',
    lanes: 6,
    elevationSlope: 0.1,
    hazardRisk: 0.18,
    predictedRisk: 0.22,
    isBlocked: false,
    trafficDensity: 0.65
  },
  {
    id: 'e_edapally_infopark',
    source: 'kerala_edapally_toll',
    target: 'kerala_infopark_kakkanad',
    distance: 5.6,
    baseSpeed: 45,
    capacity: 2800,
    currentFlow: 1100,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 0.8,
    hazardRisk: 0.08,
    predictedRisk: 0.10,
    isBlocked: false,
    trafficDensity: 0.40
  },
  {
    id: 'e_vyttila_ekm_hosp',
    source: 'kerala_vyttila_hub',
    target: 'kerala_ekm_gen_hosp',
    distance: 5.2,
    baseSpeed: 40,
    capacity: 2200,
    currentFlow: 1600,
    roadType: 'arterial',
    lanes: 4,
    elevationSlope: 0.1,
    hazardRisk: 0.22,
    predictedRisk: 0.30,
    isBlocked: false,
    trafficDensity: 0.70
  },

  // Southward Corridor towards Alappuzha & Kuttanad
  {
    id: 'e_vyttila_cherthala',
    source: 'kerala_vyttila_hub',
    target: 'kerala_cherthala_town',
    distance: 31.0,
    baseSpeed: 70,
    capacity: 3800,
    currentFlow: 1800,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.1,
    hazardRisk: 0.25,
    predictedRisk: 0.35,
    isBlocked: false,
    trafficDensity: 0.50
  },
  {
    id: 'e_cherthala_sd_college',
    source: 'kerala_cherthala_town',
    target: 'kerala_sd_college_camp',
    distance: 22.5,
    baseSpeed: 60,
    capacity: 2600,
    currentFlow: 1400,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.1,
    hazardRisk: 0.35,
    predictedRisk: 0.45,
    isBlocked: false,
    trafficDensity: 0.55
  },
  {
    id: 'e_kuttanad_sd_college',
    source: 'kerala_kuttanad_polder',
    target: 'kerala_sd_college_camp',
    distance: 8.5,
    baseSpeed: 25,
    capacity: 700,
    currentFlow: 650,
    roadType: 'local',
    lanes: 1,
    elevationSlope: 0.0,
    hazardRisk: 0.90,
    predictedRisk: 0.98,
    isBlocked: false,
    isBridge: true,
    trafficDensity: 0.90
  },

  // Northern & Eastern Links (Chalakudy & Thodupuzha)
  {
    id: 'e_rajagiri_chalakudy',
    source: 'kerala_rajagiri_hosp',
    target: 'kerala_chalakudy_town',
    distance: 21.0,
    baseSpeed: 65,
    capacity: 3200,
    currentFlow: 1900,
    roadType: 'highway',
    lanes: 4,
    elevationSlope: 0.5,
    hazardRisk: 0.55,
    predictedRisk: 0.70,
    isBlocked: false,
    trafficDensity: 0.65
  },
  {
    id: 'e_infopark_thodupuzha',
    source: 'kerala_infopark_kakkanad',
    target: 'kerala_thodupuzha_junction',
    distance: 42.0,
    baseSpeed: 55,
    capacity: 1900,
    currentFlow: 800,
    roadType: 'arterial',
    lanes: 2,
    elevationSlope: 1.5,
    hazardRisk: 0.35,
    predictedRisk: 0.45,
    isBlocked: false,
    trafficDensity: 0.45
  }
];

const initialHazards: HazardZone[] = [
  {
    id: 'hz_periyar_spill',
    type: 'flood',
    centerLat: 10.1140,
    centerLng: 76.3460,
    radiusKm: 4.8,
    intensity: 0.92,
    expansionRateKmH: 0.65,
    directionDeg: 285 // Downstream towards Arabian Sea
  },
  {
    id: 'hz_kuttanad_inundation',
    type: 'flood',
    centerLat: 9.4350,
    centerLng: 76.4020,
    radiusKm: 6.2,
    intensity: 0.95,
    expansionRateKmH: 0.45,
    directionDeg: 310
  },
  {
    id: 'hz_chalakudy_surge',
    type: 'flood',
    centerLat: 10.3060,
    centerLng: 76.3320,
    radiusKm: 3.5,
    intensity: 0.78,
    expansionRateKmH: 0.50,
    directionDeg: 270
  }
];

export const keralaPeriyarFloodScenario: ScenarioPreset = {
  id: 'kerala_periyar_flood',
  name: 'Kerala Monsoon Deluge: Periyar & Kuttanad Floods (Ernakulam - Kuttanad Floods)',
  disasterType: 'flood',
  description: 'Severe monsoon downpour and Idukki/Idamalayar dam shutter discharge cause torrential overflow along the Periyar and Chalakudy river basins and severe submergence across Kuttanad.',
  centerLat: 10.0200,
  centerLng: 76.3300,
  zoom: 11,
  weather: {
    temperatureC: 26.5,
    rainfallMmH: 68.0,
    windSpeedKmH: 42.0,
    windDirectionDeg: 240,
    visibilityKm: 2.5,
    humidityPct: 98
  },
  initialHazards,
  nodes,
  edges,
  narrativeAlerts: [
    {
      timeStepHours: 0.0,
      title: 'KSDMA Red Alert: Periyar Basin Inundation',
      message: 'Idukki Dam shutters raised to 350 cumecs. Aluva Manappuram and low-lying Paravur wards facing extreme flood risk.',
      severity: 'critical'
    },
    {
      timeStepHours: 1.5,
      title: 'Marthanda Varma Bridge Submerged',
      message: 'Periyar water level breached warning mark at Aluva. NH-544 bridge impassable. Divert evacuation to CUSAT Kalamassery & Rajagiri.',
      severity: 'critical'
    },
    {
      timeStepHours: 3.0,
      title: 'Kuttanad Polder Breaches Reported',
      message: 'Water rising in Nedumudi & Kainakary. Indian Navy & Fire Force deploying amphibious rescue units to SD College Alappuzha.',
      severity: 'warning'
    }
  ]
};
