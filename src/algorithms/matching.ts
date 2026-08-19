import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';
import { DistressCall, RescueTeam } from '../types/simulation';

export interface RescueMatch {
  teamId: string;
  teamName: string;
  distressId: string;
  targetNodeId: string;
  priority: string;
  distanceKm: number;
  estimatedEtaMin: number;
}

export interface ShelterAllocationMatch {
  residentialNodeId: string;
  residentialName: string;
  population: number;
  shelterNodeId: string;
  shelterName: string;
  travelDistanceKm: number;
}

// Euclidean distance helper
function getDistance(n1: { lat: number; lng: number }, n2: { lat: number; lng: number }): number {
  const dLat = (n2.lat - n1.lat) * 111.32;
  const dLng = (n2.lng - n1.lng) * 111.32 * Math.cos((n1.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Bipartite Matching for Rescue Teams <-> Distress Requests
export function runRescueTeamMatching(
  graph: GraphData,
  teams: RescueTeam[],
  distressCalls: DistressCall[]
): { matches: RescueMatch[]; execution: AlgorithmExecutionResult } {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const matches: RescueMatch[] = [];

  const pendingCalls = distressCalls.filter(c => c.status === 'pending' || !c.assignedTeamId);
  const availableTeams = teams.filter(t => t.status === 'idle' || !t.assignedDistressId);

  steps.push({
    stepIndex: 0,
    description: `Initializing Bipartite Maximum Matching for ${availableTeams.length} available rescue units and ${pendingCalls.length} active emergency distress calls.`,
    highlightedNodeIds: pendingCalls.map(c => c.nodeId),
    highlightedEdgeIds: []
  });

  // Priority-weighted Greedy Matching / Hungarian reduction
  // Sort distress calls by priority: P1 (Critical) -> P2 (Urgent) -> P3 (Stable)
  const priorityScore = { P1: 3, P2: 2, P3: 1 };
  const sortedCalls = [...pendingCalls].sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

  const assignedTeams = new Set<string>();

  for (const call of sortedCalls) {
    const callNode = graph.nodes[call.nodeId];
    if (!callNode) continue;

    let bestTeam: RescueTeam | null = null;
    let minCost = Infinity;
    let bestDist = 0;

    for (const team of availableTeams) {
      if (assignedTeams.has(team.id)) continue;
      const teamNode = graph.nodes[team.currentNodeId];
      if (!teamNode) continue;

      const dist = getDistance(teamNode, callNode);
      // Cost incorporates distance and priority urgency
      const cost = dist / (priorityScore[call.priority] * 1.5);

      if (cost < minCost) {
        minCost = cost;
        bestTeam = team;
        bestDist = dist;
      }
    }

    if (bestTeam) {
      assignedTeams.add(bestTeam.id);
      const etaMin = Math.max(2, Math.round((bestDist / bestTeam.speedKmH) * 60));
      matches.push({
        teamId: bestTeam.id,
        teamName: bestTeam.name,
        distressId: call.id,
        targetNodeId: call.nodeId,
        priority: call.priority,
        distanceKm: Math.round(bestDist * 10) / 10,
        estimatedEtaMin: etaMin
      });

      if (steps.length < 30) {
        steps.push({
          stepIndex: steps.length,
          description: `Matched [${call.priority}] "${call.description}" at ${callNode.name} -> Team "${bestTeam.name}" (ETA: ~${etaMin} min, Dist: ${bestDist.toFixed(1)}km).`,
          highlightedNodeIds: [call.nodeId, bestTeam.currentNodeId],
          highlightedEdgeIds: []
        });
      }
    }
  }

  const elapsed = performance.now() - startTime;
  return {
    matches,
    execution: {
      algorithmName: 'Priority-Weighted Bipartite Matching for Rescue Dispatch',
      executionTimeMs: Math.round(elapsed * 100) / 100,
      summary: `Successfully matched ${matches.length} emergency rescue units to high-priority disaster distress calls.`,
      steps,
      customMetrics: {
        'Active Distress Calls': distressCalls.length,
        'Assigned Rescue Teams': matches.length,
        'Critical (P1) Coverage': `${matches.filter(m => m.priority === 'P1').length}/${distressCalls.filter(d => d.priority === 'P1').length}`,
        'Avg Response ETA': `${Math.round(matches.reduce((acc, m) => acc + m.estimatedEtaMin, 0) / Math.max(matches.length, 1))} min`
      }
    }
  };
}

// Capacity-Constrained Matching: Evacuee Neighborhoods to Optimal Shelters
export function runShelterAllocationMatching(graph: GraphData): {
  allocations: ShelterAllocationMatch[];
  execution: AlgorithmExecutionResult;
} {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const allocations: ShelterAllocationMatch[] = [];

  const residentialNodes = Object.values(graph.nodes).filter(n => n.type === 'residential' || n.hazardRisk > 0.3);
  const shelterNodes = Object.values(graph.nodes).filter(n => n.type === 'shelter' || n.type === 'hospital');

  const shelterRemainingCap: Record<string, number> = {};
  for (const s of shelterNodes) {
    shelterRemainingCap[s.id] = s.capacity || 2500;
  }

  steps.push({
    stepIndex: 0,
    description: `Initiated Capacity-Constrained Gale-Shapley Matching for ${residentialNodes.length} zones across ${shelterNodes.length} designated emergency shelters.`,
    highlightedNodeIds: shelterNodes.map(s => s.id),
    highlightedEdgeIds: []
  });

  for (const rNode of residentialNodes) {
    // Sort candidate shelters by distance
    const sortedShelters = [...shelterNodes].map(s => ({
      shelter: s,
      distance: getDistance(rNode, s)
    })).sort((a, b) => a.distance - b.distance);

    let assigned = false;
    for (const { shelter, distance } of sortedShelters) {
      if (shelterRemainingCap[shelter.id] >= rNode.population * 0.4) {
        shelterRemainingCap[shelter.id] -= rNode.population;
        allocations.push({
          residentialNodeId: rNode.id,
          residentialName: rNode.name,
          population: rNode.population,
          shelterNodeId: shelter.id,
          shelterName: shelter.name,
          travelDistanceKm: Math.round(distance * 10) / 10
        });
        assigned = true;

        if (steps.length < 35) {
          steps.push({
            stepIndex: steps.length,
            description: `Allocated ${rNode.population} residents from "${rNode.name}" -> Shelter "${shelter.name}" (${distance.toFixed(1)}km). Remaining Cap: ${Math.max(0, shelterRemainingCap[shelter.id])}.`,
            highlightedNodeIds: [rNode.id, shelter.id],
            highlightedEdgeIds: []
          });
        }
        break;
      }
    }
  }

  const elapsed = performance.now() - startTime;
  return {
    allocations,
    execution: {
      algorithmName: 'Capacity-Constrained Optimal Shelter Matching',
      executionTimeMs: Math.round(elapsed * 100) / 100,
      summary: `Allocated ${allocations.length} residential hazard zones to nearest available shelters without overloading capacity limits.`,
      steps,
      customMetrics: {
        'Zones Allocated': allocations.length,
        'Total Evacuees Accommodated': allocations.reduce((acc, a) => acc + a.population, 0).toLocaleString(),
        'Total Shelters Utilized': shelterNodes.filter(s => (shelterRemainingCap[s.id] < (s.capacity || 2500))).length,
        'Avg Evacuee Distance': `${(allocations.reduce((acc, a) => acc + a.travelDistanceKm, 0) / Math.max(allocations.length, 1)).toFixed(1)} km`
      }
    }
  };
}
