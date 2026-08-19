import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';

// Tarjan's Bridge and Articulation Point Finding Algorithm
export function runTarjanResilienceAnalysis(graph: GraphData): AlgorithmExecutionResult {
  const startTime = performance.now();
  const disc: Record<string, number> = {};
  const low: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const isArticulationPoint = new Set<string>();
  const bridgeEdgeIds = new Set<string>();
  const steps: AlgorithmStep[] = [];
  let timer = 0;

  for (const nodeId of Object.keys(graph.nodes)) {
    disc[nodeId] = -1;
    low[nodeId] = -1;
    parent[nodeId] = null;
  }

  function dfs(u: string) {
    disc[u] = low[u] = ++timer;
    let children = 0;

    for (const edgeId of graph.adjacencyList[u] || []) {
      const edge = graph.edges[edgeId];
      if (!edge || edge.isBlocked) continue;

      const v = edge.source === u ? edge.target : edge.source;

      if (disc[v] === -1) {
        children++;
        parent[v] = u;

        if (steps.length < 40) {
          steps.push({
            stepIndex: steps.length,
            description: `DFS explored forward edge (${graph.nodes[u].name} -> ${graph.nodes[v].name}). Discovery time: ${disc[u]}.`,
            highlightedNodeIds: [u, v],
            highlightedEdgeIds: [edgeId]
          });
        }

        dfs(v);

        low[u] = Math.min(low[u], low[v]);

        // Condition 1 for articulation point: Root node with 2 or more children
        if (parent[u] === null && children > 1) {
          isArticulationPoint.add(u);
        }

        // Condition 2 for articulation point: Non-root node where low[v] >= disc[u]
        if (parent[u] !== null && low[v] >= disc[u]) {
          isArticulationPoint.add(u);
        }

        // Bridge condition: low[v] > disc[u]
        if (low[v] > disc[u]) {
          bridgeEdgeIds.add(edgeId);
          if (steps.length < 50) {
            steps.push({
              stepIndex: steps.length,
              description: `⚠️ CRITICAL INFRASTRUCTURE BRIDGE DETECTED: Road "${graph.nodes[u].name} - ${graph.nodes[v].name}" has low[${graph.nodes[v].name}]=${low[v]} > disc[${graph.nodes[u].name}]=${disc[u]}. If severed, this isolates downstream zones!`,
              highlightedNodeIds: [u, v],
              highlightedEdgeIds: [edgeId]
            });
          }
        }
      } else if (v !== parent[u]) {
        // Back-edge
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (const nodeId of Object.keys(graph.nodes)) {
    if (disc[nodeId] === -1) {
      dfs(nodeId);
    }
  }

  const edgeAttrs: Record<string, { isBridge: boolean }> = {};
  for (const eId of bridgeEdgeIds) {
    edgeAttrs[eId] = { isBridge: true };
  }

  const elapsed = performance.now() - startTime;
  const criticalBridgesCount = bridgeEdgeIds.size;
  const articulationCount = isArticulationPoint.size;
  const totalEdges = Object.keys(graph.edges).length;
  const resilienceScore = Math.max(10, Math.round(100 - (criticalBridgesCount / Math.max(totalEdges, 1)) * 120 - articulationCount * 4));

  return {
    algorithmName: "Tarjan's Network Resilience & Critical Bridge Analysis",
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Identified ${criticalBridgesCount} single-point-of-failure bridges and ${articulationCount} critical bottleneck junctions. Resilience Index: ${resilienceScore}/100.`,
    steps,
    edgeAttributes: edgeAttrs,
    customMetrics: {
      'Critical Cut Bridges': criticalBridgesCount,
      'Articulation Junctions': articulationCount,
      'Network Resilience Score': `${resilienceScore} / 100`,
      'Vulnerability Rating': criticalBridgesCount > 3 ? 'HIGH HAZARD VULNERABILITY' : 'MODERATE'
    }
  };
}
