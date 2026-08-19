import { DisasterType, HazardZone, GraphNode, GraphEdge } from './graph';

export interface WeatherCondition {
  temperatureC: number;
  rainfallMmH: number;
  windSpeedKmH: number;
  windDirectionDeg: number; // 0 = East, 90 = North, 180 = West, 270 = South
  visibilityKm: number;
  humidityPct: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  disasterType: DisasterType;
  description: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
  initialHazards: HazardZone[];
  weather: WeatherCondition;
  nodes: GraphNode[];
  edges: GraphEdge[];
  narrativeAlerts: {
    timeStepHours: number;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
  }[];
}

export interface SimulationState {
  currentScenarioId: string;
  timeHours: number; // 0.0 to 24.0
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 5x, 10x
  disasterIntensityMultiplier: number; // 0.5 to 2.0
  activeHazards: HazardZone[];
  weather: WeatherCondition;
  totalEvacuated: number;
  totalAtRisk: number;
  totalStranded: number;
  networkResilienceScore: number; // 0 to 100
  selectedAlgorithm: string | null;
  selectedSourceNodeId: string | null;
  selectedTargetNodeId: string | null;
  selectedEdgeId: string | null;
  selectedNodeId: string | null;
  inspectedAlgorithmStep: number;
}

export interface DistressCall {
  id: string;
  nodeId: string;
  reportedTimeHours: number;
  peopleCount: number;
  priority: 'P1' | 'P2' | 'P3';
  description: string;
  assignedTeamId?: string;
  status: 'pending' | 'dispatched' | 'rescued';
}

export interface RescueTeam {
  id: string;
  name: string;
  type: 'medical_ambulance' | 'fire_rescue' | 'boat_amphibious' | 'air_helicopter';
  capacity: number;
  currentNodeId: string;
  speedKmH: number;
  status: 'idle' | 'en_route' | 'rescuing';
  assignedDistressId?: string;
}
