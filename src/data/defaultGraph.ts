import { GraphData, GraphNode, GraphEdge } from '../types/graph';
import { ScenarioPreset, DistressCall, RescueTeam } from '../types/simulation';
import { keralaPeriyarFloodScenario } from './scenarios/keralaPeriyarFlood';
import { keralaWayanadLandslideScenario } from './scenarios/keralaWayanadLandslide';
import { keralaCoastalSurgeScenario } from './scenarios/keralaCoastalSurge';
import { keralaMalabarFloodScenario } from './scenarios/keralaMalabarFlood';

// Fallback legacy presets
import { coastalFloodScenario } from './scenarios/coastalFlood';
import { seismicMetroScenario } from './scenarios/seismicMetro';
import { wildfireForestScenario } from './scenarios/wildfireForest';
import { mountainLandslideScenario } from './scenarios/mountainLandslide';

export const SCENARIO_PRESETS: Record<string, ScenarioPreset> = {
  kerala_periyar_flood: keralaPeriyarFloodScenario,
  kerala_wayanad_landslide: keralaWayanadLandslideScenario,
  kerala_coastal_surge: keralaCoastalSurgeScenario,
  kerala_malabar_flood: keralaMalabarFloodScenario,
  // Standard presets
  coastal_flood: coastalFloodScenario,
  seismic_metro: seismicMetroScenario,
  wildfire_forest: wildfireForestScenario,
  mountain_landslide: mountainLandslideScenario
};

export function buildGraphFromScenario(scenario: ScenarioPreset): GraphData {
  const nodes: Record<string, GraphNode> = {};
  const edges: Record<string, GraphEdge> = {};
  const adjacencyList: Record<string, string[]> = {};

  for (const node of scenario.nodes) {
    nodes[node.id] = { ...node };
    adjacencyList[node.id] = [];
  }

  for (const edge of scenario.edges) {
    edges[edge.id] = { ...edge };
    if (adjacencyList[edge.source]) adjacencyList[edge.source].push(edge.id);
    if (adjacencyList[edge.target]) adjacencyList[edge.target].push(edge.id);
  }

  return { nodes, edges, adjacencyList };
}

export function getDefaultDistressCalls(scenario: ScenarioPreset): DistressCall[] {
  const calls: DistressCall[] = [];
  let idx = 1;

  for (const node of scenario.nodes) {
    if (node.isDistressActive) {
      calls.push({
        id: `sos_kerala_${idx}`,
        nodeId: node.id,
        reportedTimeHours: 0.15 * idx,
        peopleCount: Math.round(node.population * 0.18) || 80,
        priority: node.distressPriority || 'P1',
        description: `Emergency rescue: ${node.name}. Water level/debris rising rapidly. Immediate evacuation required.`,
        status: 'pending'
      });
      idx++;
    }
  }

  return calls;
}

export function getDefaultRescueTeams(scenario: ScenarioPreset): RescueTeam[] {
  const depots = scenario.nodes.filter(n => n.type === 'depot' || n.type === 'hospital' || n.type === 'shelter');
  const base1 = depots[0]?.id || scenario.nodes[0].id;
  const base2 = depots[1]?.id || scenario.nodes[scenario.nodes.length - 1].id;

  return [
    {
      id: 'team_kerala_ndrf',
      name: 'NDRF 04 Battalion & Kerala Fire Force',
      type: 'boat_amphibious',
      capacity: 35,
      currentNodeId: base1,
      speedKmH: 45,
      status: 'idle'
    },
    {
      id: 'team_kerala_army',
      name: 'Indian Army Madras Sappers & Engineering Task Force',
      type: 'fire_rescue',
      capacity: 25,
      currentNodeId: base1,
      speedKmH: 55,
      status: 'idle'
    },
    {
      id: 'team_kerala_medical',
      name: 'Kerala Health Services Rapid Trauma & Ambulance Unit',
      type: 'medical_ambulance',
      capacity: 15,
      currentNodeId: base2,
      speedKmH: 70,
      status: 'idle'
    },
    {
      id: 'team_kerala_air_navy',
      name: 'Indian Navy & Coast Guard Sea King / ALH Heli-Rescue',
      type: 'air_helicopter',
      capacity: 12,
      currentNodeId: base2,
      speedKmH: 180,
      status: 'idle'
    }
  ];
}
