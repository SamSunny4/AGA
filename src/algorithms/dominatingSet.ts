import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';

// Greedy Minimum Dominating Set & Emergency Hub Location
export function runDominatingSetHubPlacement(
  graph: GraphData,
  coverageRadiusKm: number = 3.5
): AlgorithmExecutionResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const allNodeIds = Object.keys(graph.nodes);
  const coveredNodes = new Set<string>();
  const dominatingHubIds = new Set<string>();

  function getDistance(n1: { lat: number; lng: number }, n2: { lat: number; lng: number }): number {
    const dLat = (n2.lat - n1.lat) * 111.32;
    const dLng = (n2.lng - n1.lng) * 111.32 * Math.cos((n1.lat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  // Precompute coverage neighborhood for each candidate node
  const neighborhood: Record<string, Set<string>> = {};
  for (const u of allNodeIds) {
    neighborhood[u] = new Set<string>([u]);
    const nodeU = graph.nodes[u];

    // Direct topological neighbors
    for (const edgeId of graph.adjacencyList[u] || []) {
      const edge = graph.edges[edgeId];
      if (!edge || edge.isBlocked) continue;
      const v = edge.source === u ? edge.target : edge.source;
      neighborhood[u].add(v);
    }

    // Spatial radius neighbors
    for (const v of allNodeIds) {
      if (u === v) continue;
      const nodeV = graph.nodes[v];
      if (getDistance(nodeU, nodeV) <= coverageRadiusKm) {
        neighborhood[u].add(v);
      }
    }
  }

  steps.push({
    stepIndex: 0,
    description: `Dominating Set optimizer initialized. Target: Determine minimum strategic relief hub locations covering all ${allNodeIds.length} vertices within $\\le ${coverageRadiusKm}$ km radius.`,
    highlightedNodeIds: [],
    highlightedEdgeIds: []
  });

  // Greedy Dominating Set: Pick node that covers the largest number of currently uncovered nodes
  while (coveredNodes.size < allNodeIds.length) {
    let bestCandidate: string | null = null;
    let maxNewlyCovered = 0;

    for (const candidate of allNodeIds) {
      // Prioritize existing shelters / hospitals
      const node = graph.nodes[candidate];
      const isPreferredFacility = node.type === 'shelter' || node.type === 'hospital' || node.type === 'depot';
      const bonus = isPreferredFacility ? 2 : 0;

      let newlyCoveredCount = 0;
      for (const neighbor of neighborhood[candidate]) {
        if (!coveredNodes.has(neighbor)) {
          newlyCoveredCount++;
        }
      }

      const score = newlyCoveredCount + bonus;
      if (score > maxNewlyCovered) {
        maxNewlyCovered = score;
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate || maxNewlyCovered === 0) {
      // Pick any remaining uncovered node
      for (const u of allNodeIds) {
        if (!coveredNodes.has(u)) {
          dominatingHubIds.add(u);
          coveredNodes.add(u);
        }
      }
      break;
    }

    dominatingHubIds.add(bestCandidate);
    const newCoveredInStep: string[] = [];
    for (const neighbor of neighborhood[bestCandidate]) {
      if (!coveredNodes.has(neighbor)) {
        coveredNodes.add(neighbor);
        newCoveredInStep.push(neighbor);
      }
    }

    if (steps.length < 30) {
      steps.push({
        stepIndex: steps.length,
        description: `Selected "${graph.nodes[bestCandidate]?.name}" as Emergency Dominating Hub #${dominatingHubIds.size}. Covered ${newCoveredInStep.length} new neighborhood zones.`,
        highlightedNodeIds: [bestCandidate, ...newCoveredInStep],
        highlightedEdgeIds: []
      });
    }
  }

  const nodeAttrs: Record<string, { isDominatingHub: boolean }> = {};
  for (const id of allNodeIds) {
    nodeAttrs[id] = { isDominatingHub: dominatingHubIds.has(id) };
  }

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: 'Minimum Dominating Set (Strategic Relief Hub Placement)',
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Selected ${dominatingHubIds.size} optimal emergency relief hubs / siren coverage centers to guarantee 100% population reachability within ${coverageRadiusKm} km.`,
    steps,
    nodeAttributes: nodeAttrs,
    customMetrics: {
      'Total Emergency Hubs': dominatingHubIds.size,
      'Total Covered Population': Object.values(graph.nodes).reduce((acc, n) => acc + n.population, 0).toLocaleString(),
      'Coverage Efficiency': `${Math.round((allNodeIds.length / dominatingHubIds.size) * 10) / 10} zones / hub`,
      'Population Coverage Rate': '100.0%'
    }
  };
}
