import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';

interface FlowEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
  revIndex: number;
  originalEdgeId: string;
}

export function runDinicMaxEvacuationFlow(
  graph: GraphData,
  sourceNodeIds?: string[],
  sinkNodeIds?: string[]
): AlgorithmExecutionResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];

  // If no source/sink provided, auto-detect sources as nodes with highest hazard risk and sinks as shelters/hospitals
  const sources = sourceNodeIds && sourceNodeIds.length > 0
    ? sourceNodeIds
    : Object.values(graph.nodes).filter(n => n.hazardRisk > 0.4 || n.type === 'residential').map(n => n.id);

  const sinks = sinkNodeIds && sinkNodeIds.length > 0
    ? sinkNodeIds
    : Object.values(graph.nodes).filter(n => n.type === 'shelter' || n.type === 'hospital').map(n => n.id);

  const superSource = '__SUPER_SOURCE__';
  const superSink = '__SUPER_SINK__';

  // Build adjacency list for Dinic
  const adj: Record<string, FlowEdge[]> = {};
  const allNodes = [superSource, superSink, ...Object.keys(graph.nodes)];
  for (const id of allNodes) {
    adj[id] = [];
  }

  function addEdge(from: string, to: string, cap: number, edgeId: string) {
    const forward: FlowEdge = { from, to, capacity: cap, flow: 0, revIndex: adj[to].length, originalEdgeId: edgeId };
    const backward: FlowEdge = { from: to, to: from, capacity: 0, flow: 0, revIndex: adj[from].length, originalEdgeId: edgeId };
    adj[from].push(forward);
    adj[to].push(backward);
  }

  // Connect super-source to all disaster sources with their population demands
  for (const sId of sources) {
    const node = graph.nodes[sId];
    const pop = node ? Math.max(node.population, 500) : 1000;
    addEdge(superSource, sId, pop, `src_${sId}`);
  }

  // Connect all sinks to super-sink with their shelter capacities
  for (const tId of sinks) {
    const node = graph.nodes[tId];
    const cap = node?.capacity || 3000;
    addEdge(tId, superSink, cap, `sink_${tId}`);
  }

  // Add graph network edges with capacities scaled by hazard safety (impassable roads = 0 cap)
  for (const edge of Object.values(graph.edges)) {
    if (edge.isBlocked || edge.hazardRisk >= 0.9) continue;
    // Flow capacity reduced as hazard risk increases
    const effectiveCap = Math.round(edge.capacity * (1 - edge.hazardRisk * 0.7));
    addEdge(edge.source, edge.target, effectiveCap, edge.id);
    addEdge(edge.target, edge.source, effectiveCap, edge.id);
  }

  steps.push({
    stepIndex: 0,
    description: `Constructed residual flow network with Super-Source feeding ${sources.length} hazard-affected zones and Super-Sink collecting into ${sinks.length} evacuation shelters.`,
    highlightedNodeIds: [...sources, ...sinks],
    highlightedEdgeIds: []
  });

  // Dinic BFS Level Graph
  const level: Record<string, number> = {};
  const ptr: Record<string, number> = {};

  function bfsLevelGraph(): boolean {
    for (const id of allNodes) level[id] = -1;
    level[superSource] = 0;
    const queue = [superSource];

    while (queue.length > 0) {
      const v = queue.shift()!;
      for (const edge of adj[v]) {
        if (edge.capacity - edge.flow > 0 && level[edge.to] === -1) {
          level[edge.to] = level[v] + 1;
          queue.push(edge.to);
        }
      }
    }
    return level[superSink] !== -1;
  }

  function dfsBlockingFlow(v: string, pushed: number): number {
    if (pushed === 0 || v === superSink) return pushed;
    for (let cid = ptr[v]; cid < adj[v].length; cid++) {
      ptr[v] = cid;
      const edge = adj[v][cid];
      const tr = edge.to;
      if (level[v] + 1 !== level[tr] || edge.capacity - edge.flow === 0) continue;

      const trPushed = dfsBlockingFlow(tr, Math.min(pushed, edge.capacity - edge.flow));
      if (trPushed === 0) continue;

      edge.flow += trPushed;
      adj[tr][edge.revIndex].flow -= trPushed;
      return trPushed;
    }
    return 0;
  }

  let totalMaxFlow = 0;
  let phase = 0;

  while (bfsLevelGraph()) {
    phase++;
    for (const id of allNodes) ptr[id] = 0;
    let pushed = 0;
    while ((pushed = dfsBlockingFlow(superSource, Infinity)) > 0) {
      totalMaxFlow += pushed;
    }

    if (steps.length < 25) {
      steps.push({
        stepIndex: steps.length,
        description: `Dinic Phase #${phase}: Layered graph augmented. Cumulative evacuation flow reached ${totalMaxFlow.toLocaleString()} evacuees/hour.`,
        highlightedNodeIds: sources.slice(0, 5),
        highlightedEdgeIds: []
      });
    }
  }

  // Compute Min-Cut edges (edges in original graph crossing from reachable in residual graph to unreachable)
  const reachableInResidual = new Set<string>();
  const cutQueue = [superSource];
  reachableInResidual.add(superSource);

  while (cutQueue.length > 0) {
    const u = cutQueue.shift()!;
    for (const edge of adj[u]) {
      if (edge.capacity - edge.flow > 0 && !reachableInResidual.has(edge.to)) {
        reachableInResidual.add(edge.to);
        cutQueue.push(edge.to);
      }
    }
  }

  const minCutEdgeIds = new Set<string>();
  const edgeFlowAttrs: Record<string, { currentFlow: number; isMinCut: boolean }> = {};

  for (const edge of Object.values(graph.edges)) {
    const uReachable = reachableInResidual.has(edge.source);
    const vReachable = reachableInResidual.has(edge.target);

    // If one end is reachable from source in residual graph and other is not, it's a critical bottleneck cut edge
    if ((uReachable && !vReachable) || (!uReachable && vReachable)) {
      minCutEdgeIds.add(edge.id);
      edgeFlowAttrs[edge.id] = { currentFlow: edge.capacity, isMinCut: true };
    }
  }

  steps.push({
    stepIndex: steps.length,
    description: `Max-Flow Min-Cut Theorem applied: Identified ${minCutEdgeIds.size} critical bottleneck road segments throttling evacuation capacity.`,
    highlightedNodeIds: [],
    highlightedEdgeIds: Array.from(minCutEdgeIds)
  });

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: "Dinic's Maximum Evacuation Flow & Min-Cut Bottlenecks",
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Maximum evacuation throughput: ${totalMaxFlow.toLocaleString()} evacuees/hour. Identified ${minCutEdgeIds.size} saturated Min-Cut bottleneck arteries.`,
    steps,
    edgeAttributes: edgeFlowAttrs,
    customMetrics: {
      'Max Evacuation Throughput': `${totalMaxFlow.toLocaleString()} people/hr`,
      'Bottleneck Cut Roads': minCutEdgeIds.size,
      'Active Danger Sources': sources.length,
      'Available Shelters': sinks.length
    }
  };
}
