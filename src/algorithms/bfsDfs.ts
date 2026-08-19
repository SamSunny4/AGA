import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';

export function runBfsReachability(
  graph: GraphData,
  startNodeId: string,
  riskThreshold: number = 0.85
): AlgorithmExecutionResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  const steps: AlgorithmStep[] = [];
  const reachableNodeIds: string[] = [];
  const unreachableNodeIds: string[] = [];

  visited.add(startNodeId);
  steps.push({
    stepIndex: 0,
    description: `Initiated BFS reachability search from starting point "${graph.nodes[startNodeId]?.name || startNodeId}".`,
    highlightedNodeIds: [startNodeId],
    highlightedEdgeIds: [],
    visitedNodeIds: Array.from(visited)
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    reachableNodeIds.push(current);

    const edgeIds = graph.adjacencyList[current] || [];
    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (!edge || edge.isBlocked || edge.hazardRisk > riskThreshold) continue;

      const neighbor = edge.source === current ? edge.target : edge.source;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        if (steps.length < 50) {
          steps.push({
            stepIndex: steps.length,
            description: `Traversed edge to discover accessible vertex "${graph.nodes[neighbor]?.name || neighbor}".`,
            highlightedNodeIds: [neighbor],
            highlightedEdgeIds: [edgeId],
            visitedNodeIds: Array.from(visited)
          });
        }
      }
    }
  }

  // Find disconnected nodes
  for (const nodeId of Object.keys(graph.nodes)) {
    if (!visited.has(nodeId)) {
      unreachableNodeIds.push(nodeId);
    }
  }

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: 'BFS Accessible Reachability Analysis',
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `BFS discovered ${reachableNodeIds.length} accessible nodes. ${unreachableNodeIds.length} nodes are currently cut off by disaster hazards.`,
    steps,
    customMetrics: {
      'Accessible Safe Nodes': reachableNodeIds.length,
      'Isolated Cutoff Nodes': unreachableNodeIds.length,
      'Total Network Nodes': Object.keys(graph.nodes).length,
      'Network Connectivity %': `${Math.round((reachableNodeIds.length / Object.keys(graph.nodes).length) * 100)}%`
    }
  };
}

export function findConnectedComponents(
  graph: GraphData,
  riskThreshold: number = 0.85
): AlgorithmExecutionResult {
  const startTime = performance.now();
  const visited = new Set<string>();
  const components: string[][] = [];
  const nodeColors: Record<string, Partial<{ color: string }>> = {};
  const steps: AlgorithmStep[] = [];

  const palette = ['#38bdf8', '#34d399', '#f43f5e', '#fbbf24', '#a855f7', '#ec4899', '#06b6d4', '#84cc16'];

  for (const nodeId of Object.keys(graph.nodes)) {
    if (!visited.has(nodeId)) {
      const currentComponent: string[] = [];
      const stack: string[] = [nodeId];
      visited.add(nodeId);

      const compColor = palette[components.length % palette.length];

      while (stack.length > 0) {
        const u = stack.pop()!;
        currentComponent.push(u);
        nodeColors[u] = { color: compColor };

        for (const edgeId of graph.adjacencyList[u] || []) {
          const edge = graph.edges[edgeId];
          if (!edge || edge.isBlocked || edge.hazardRisk > riskThreshold) continue;
          const v = edge.source === u ? edge.target : edge.source;
          if (!visited.has(v)) {
            visited.add(v);
            stack.push(v);
          }
        }
      }

      components.push(currentComponent);
      steps.push({
        stepIndex: steps.length,
        description: `Identified Component #${components.length} with ${currentComponent.length} interconnected nodes.`,
        highlightedNodeIds: currentComponent,
        highlightedEdgeIds: [],
        visitedNodeIds: Array.from(visited)
      });
    }
  }

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: 'DFS Connected Component Decomposition',
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Network partitioned into ${components.length} separate island components due to road severing.`,
    steps,
    nodeAttributes: nodeColors,
    customMetrics: {
      'Connected Components': components.length,
      'Largest Cluster Size': Math.max(...components.map(c => c.length)),
      'Isolated Clusters (<3 nodes)': components.filter(c => c.length < 3).length
    }
  };
}
