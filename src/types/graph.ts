export type NodeType = 'intersection' | 'shelter' | 'hospital' | 'depot' | 'residential' | 'commercial';

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: NodeType;
  elevation: number; // in meters
  population: number; // current population at node
  evacuatedCount?: number;
  capacity?: number; // for shelters/hospitals
  currentOccupancy?: number;
  hazardRisk: number; // 0 (safe) to 1 (lethal)
  zoneId?: string; // for phased evacuation
  color?: string; // for vertex coloring
  isDominatingHub?: boolean; // for dominating set
  isDistressActive?: boolean;
  distressPriority?: 'P1' | 'P2' | 'P3';
}

export type RoadType = 'highway' | 'arterial' | 'local' | 'bridge' | 'tunnel' | 'mountain_pass';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  distance: number; // in km
  baseSpeed: number; // in km/h
  capacity: number; // vehicle/person flow capacity per hour
  currentFlow: number; // for max-flow calculations
  roadType: RoadType;
  lanes: number;
  elevationSlope: number; // gradient percentage
  hazardRisk: number; // 0.0 to 1.0
  predictedRisk: number; // AI predicted risk in next dt
  isBlocked: boolean;
  blockageReason?: string;
  isBridge?: boolean; // detected by Tarjan's algorithm
  isMstEdge?: boolean; // part of MST
  isMinCut?: boolean; // bottleneck edge in max-flow
  inActivePath?: boolean; // part of computed escape path
  trafficDensity: number; // 0.0 (empty) to 1.0 (gridlock)
}

export interface GraphData {
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
  adjacencyList: Record<string, string[]>; // node -> edge IDs
}

export type DisasterType = 'flood' | 'earthquake' | 'wildfire' | 'landslide' | 'cyclone';

export interface HazardZone {
  id: string;
  type: DisasterType;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  intensity: number; // 0 to 1
  expansionRateKmH: number; // growth per hour
  directionDeg?: number; // propagation heading degrees
  windAngleDeg?: number; // for wildfire / cyclone (0 = East, 90 = North)
  windSpeedKmH?: number;
  waterLevelMeters?: number; // for floods
  epicenterDepthKm?: number; // for earthquakes
}

export interface RouteResult {
  pathNodeIds: string[];
  pathEdgeIds: string[];
  totalDistanceKm: number;
  estimatedTimeMin: number;
  safetyScore: number; // 0 to 100
  hazardExposureRisk: number; // aggregate risk
  isPassable: boolean;
  bottlenecks: string[];
  steps: {
    instruction: string;
    distanceKm: number;
    roadName: string;
    hazardWarning?: string;
  }[];
}

export interface AlgorithmStep {
  stepIndex: number;
  description: string;
  highlightedNodeIds: string[];
  highlightedEdgeIds: string[];
  visitedNodeIds?: string[];
  currentDistanceMap?: Record<string, number>;
  metrics?: Record<string, string | number>;
}

export interface AlgorithmExecutionResult {
  algorithmName: string;
  executionTimeMs: number;
  summary: string;
  steps: AlgorithmStep[];
  nodeAttributes?: Record<string, Partial<GraphNode>>;
  edgeAttributes?: Record<string, Partial<GraphEdge>>;
  customMetrics?: Record<string, string | number>;
  additionalPaths?: { id: string; label: string; edgeIds: string[]; color: string }[];
}
