import { GraphData, GraphNode, GraphEdge } from '../types/graph';
import { ScenarioPreset, DistressCall, RescueTeam } from '../types/simulation';
import { coastalFloodScenario } from './scenarios/coastalFlood';
import { seismicMetroScenario } from './scenarios/seismicMetro';
import { wildfireForestScenario } from './scenarios/wildfireForest';
import { mountainLandslideScenario } from './scenarios/mountainLandslide';

export const SCENARIO_PRESETS: Record<string, ScenarioPreset> = {
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
        id: `sos_${idx}`,
        nodeId: node.id,
        reportedTimeHours: 0.2 * idx,
        peopleCount: Math.round(node.population * 0.15) || 50,
        priority: node.distressPriority || 'P2',
        description: `Emergency evacuation needed: ${node.name}. Rising water/hazard cutoff.`,
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
      id: 'team_alpha',
      name: 'Alpha Rapid Medical Unit',
      type: 'medical_ambulance',
      capacity: 12,
      currentNodeId: base1,
      speedKmH: 60,
      status: 'idle'
    },
    {
      id: 'team_bravo',
      name: 'Bravo Water & Amphibious Rescue',
      type: 'boat_amphibious',
      capacity: 30,
      currentNodeId: base1,
      speedKmH: 40,
      status: 'idle'
    },
    {
      id: 'team_charlie',
      name: 'Charlie Heavy Fire & Debris Unit',
      type: 'fire_rescue',
      capacity: 20,
      currentNodeId: base2,
      speedKmH: 50,
      status: 'idle'
    },
    {
      id: 'team_delta',
      name: 'Delta Airborne Recon & Air-Drop',
      type: 'air_helicopter',
      capacity: 8,
      currentNodeId: base2,
      speedKmH: 150,
      status: 'idle'
    }
  ];
}
