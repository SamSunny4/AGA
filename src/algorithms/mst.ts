import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';

// Disjoint Set Union (DSU) for Kruskal's
class DSU {
  parent: Record<string, string> = {};
  rank: Record<string, number> = {};

  constructor(nodeIds: string[]) {
    for (const id of nodeIds) {
      this.parent[id] = id;
      this.rank[id] = 0;
    }
  }

  find(x: string): string {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

export function runKruskalEmergencyBackbone(graph: GraphData): AlgorithmExecutionResult {
  const startTime = performance.now();
  const nodeIds = Object.keys(graph.nodes);
  const dsu = new DSU(nodeIds);
  const steps: AlgorithmStep[] = [];
  const mstEdgeIds: string[] = [];

  // Compute edge weights combining distance and hazard safety
  const sortedEdges = Object.values(graph.edges)
    .filter(e => !e.isBlocked && e.hazardRisk < 0.9)
    .map(e => ({
      edge: e,
      // MST cost penalizes distance and hazard risk
      cost: e.distance * (1 + e.hazardRisk * 4.0)
    }))
    .sort((a, b) => a.cost - b.cost);

  steps.push({
    stepIndex: 0,
    description: `Kruskal's algorithm initialized. Sorted ${sortedEdges.length} viable road segments by combined risk-weighted cost.`,
    highlightedNodeIds: [],
    highlightedEdgeIds: []
  });

  let totalCost = 0;
  let totalDistanceKm = 0;

  for (const { edge, cost } of sortedEdges) {
    if (dsu.union(edge.source, edge.target)) {
      mstEdgeIds.push(edge.id);
      totalCost += cost;
      totalDistanceKm += edge.distance;

      if (steps.length < 40) {
        steps.push({
          stepIndex: steps.length,
          description: `Added secure link (${graph.nodes[edge.source]?.name} <-> ${graph.nodes[edge.target]?.name}) to Emergency Backbone. Distance: ${edge.distance}km, Risk: ${(edge.hazardRisk * 100).toFixed(0)}%.`,
          highlightedNodeIds: [edge.source, edge.target],
          highlightedEdgeIds: [...mstEdgeIds]
        });
      }

      if (mstEdgeIds.length === nodeIds.length - 1) break;
    }
  }

  const edgeAttrs: Record<string, { isMstEdge: boolean }> = {};
  for (const eId of mstEdgeIds) {
    edgeAttrs[eId] = { isMstEdge: true };
  }

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: "Kruskal's Emergency Communication & Logistics MST",
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Constructed resilient communication & supply backbone spanning ${mstEdgeIds.length + 1} vertices across ${totalDistanceKm.toFixed(1)} km total road length.`,
    steps,
    edgeAttributes: edgeAttrs,
    customMetrics: {
      'Backbone Road Segments': mstEdgeIds.length,
      'Total Backbone Length': `${totalDistanceKm.toFixed(1)} km`,
      'Spanning Completeness': `${Math.round((mstEdgeIds.length / Math.max(nodeIds.length - 1, 1)) * 100)}%`,
      'Avg Segment Risk': `${(mstEdgeIds.reduce((acc, id) => acc + graph.edges[id].hazardRisk, 0) / Math.max(mstEdgeIds.length, 1) * 100).toFixed(1)}%`
    }
  };
}

export function runPrimEmergencyBackbone(graph: GraphData, startNodeId?: string): AlgorithmExecutionResult {
  const startTime = performance.now();
  const nodeIds = Object.keys(graph.nodes);
  const root = startNodeId || nodeIds[0];
  const inMst = new Set<string>([root]);
  const mstEdgeIds: string[] = [];
  const steps: AlgorithmStep[] = [];

  let totalDistanceKm = 0;

  while (inMst.size < nodeIds.length) {
    let bestEdge: any = null;
    let minCost = Infinity;

    for (const u of inMst) {
      for (const edgeId of graph.adjacencyList[u] || []) {
        const edge = graph.edges[edgeId];
        if (!edge || edge.isBlocked || edge.hazardRisk >= 0.9) continue;
        const v = edge.source === u ? edge.target : edge.source;
        if (!inMst.has(v)) {
          const cost = edge.distance * (1 + edge.hazardRisk * 4.0);
          if (cost < minCost) {
            minCost = cost;
            bestEdge = { edge, nextNode: v };
          }
        }
      }
    }

    if (!bestEdge) break; // Graph disconnected

    inMst.add(bestEdge.nextNode);
    mstEdgeIds.push(bestEdge.edge.id);
    totalDistanceKm += bestEdge.edge.distance;

    if (steps.length < 35) {
      steps.push({
        stepIndex: steps.length,
        description: `Prim's expanded frontier to include "${graph.nodes[bestEdge.nextNode]?.name}" via least-risk candidate edge.`,
        highlightedNodeIds: [bestEdge.nextNode],
        highlightedEdgeIds: [...mstEdgeIds]
      });
    }
  }

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: "Prim's Minimum Spanning Tree Backbone",
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Prim's algorithm established connected backbone connecting ${inMst.size} vertices.`,
    steps,
    customMetrics: {
      'Connected Nodes': inMst.size,
      'Total Backbone Distance': `${totalDistanceKm.toFixed(1)} km`,
      'Execution Speed': `${Math.round(elapsed * 100) / 100} ms`
    }
  };
}
