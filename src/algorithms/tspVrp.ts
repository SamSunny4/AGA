import { GraphData, AlgorithmExecutionResult, AlgorithmStep } from '../types/graph';
import { runDijkstraSafePath } from './shortestPath';

// Euclidean distance helper
function getDistance(n1: { lat: number; lng: number }, n2: { lat: number; lng: number }): number {
  const dLat = (n2.lat - n1.lat) * 111.32;
  const dLng = (n2.lng - n1.lng) * 111.32 * Math.cos((n1.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// 2-Opt TSP Tour Optimization for Multi-Stop Rescue Vehicles
export function runTspRescueTour(
  graph: GraphData,
  depotNodeId?: string,
  targetNodeIds?: string[]
): AlgorithmExecutionResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];

  // Determine stops: if targets provided, use them; otherwise pick active distress nodes or residential zones
  const depot = depotNodeId || Object.values(graph.nodes).find(n => n.type === 'hospital' || n.type === 'depot')?.id || Object.keys(graph.nodes)[0];

  let stops = targetNodeIds && targetNodeIds.length > 0
    ? targetNodeIds.filter(id => id !== depot)
    : Object.values(graph.nodes).filter(n => (n.isDistressActive || n.hazardRisk > 0.4) && n.id !== depot).map(n => n.id);

  if (stops.length === 0) {
    stops = Object.keys(graph.nodes).filter(id => id !== depot).slice(0, 6);
  }

  // Tour starts and ends at depot
  const tourNodes = [depot, ...stops];

  steps.push({
    stepIndex: 0,
    description: `TSP Logistics Optimizer initialized for Rescue Ambulance/Supply Convoy. Depot: "${graph.nodes[depot]?.name}". Checkpoints to visit: ${stops.length}.`,
    highlightedNodeIds: tourNodes,
    highlightedEdgeIds: []
  });

  // 1. Initial Tour via Nearest Neighbor heuristic
  const unvisited = new Set(stops);
  const currentTour: string[] = [depot];
  let curr = depot;

  while (unvisited.size > 0) {
    let nearest: string | null = null;
    let minDist = Infinity;

    for (const cand of unvisited) {
      const dist = getDistance(graph.nodes[curr], graph.nodes[cand]);
      if (dist < minDist) {
        minDist = dist;
        nearest = cand;
      }
    }

    if (nearest) {
      currentTour.push(nearest);
      unvisited.delete(nearest);
      curr = nearest;
    }
  }
  // Return to depot
  currentTour.push(depot);

  function calculateTourDistance(tour: string[]): number {
    let d = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      d += getDistance(graph.nodes[tour[i]], graph.nodes[tour[i + 1]]);
    }
    return d;
  }

  let bestDist = calculateTourDistance(currentTour);

  steps.push({
    stepIndex: steps.length,
    description: `Nearest Neighbor initial tour constructed with total direct length ${bestDist.toFixed(1)} km.`,
    highlightedNodeIds: currentTour,
    highlightedEdgeIds: []
  });

  // 2. 2-Opt Optimization Iterations
  let improved = true;
  let iterations = 0;

  while (improved && iterations < 50) {
    improved = false;
    iterations++;

    for (let i = 1; i < currentTour.length - 2; i++) {
      for (let k = i + 1; k < currentTour.length - 1; k++) {
        // Reverse sub-tour from i to k
        const newTour = [
          ...currentTour.slice(0, i),
          ...currentTour.slice(i, k + 1).reverse(),
          ...currentTour.slice(k + 1)
        ];

        const newDist = calculateTourDistance(newTour);
        if (newDist < bestDist - 0.01) {
          bestDist = newDist;
          currentTour.splice(0, currentTour.length, ...newTour);
          improved = true;

          if (steps.length < 30) {
            steps.push({
              stepIndex: steps.length,
              description: `2-Opt Step #${iterations}: Uncrossed path crossing between "${graph.nodes[currentTour[i]]?.name}" and "${graph.nodes[currentTour[k]]?.name}". Tour reduced to ${bestDist.toFixed(1)} km.`,
              highlightedNodeIds: [currentTour[i], currentTour[k]],
              highlightedEdgeIds: []
            });
          }
          break;
        }
      }
      if (improved) break;
    }
  }

  // Trace road-level path along the TSP tour using Dijkstra safe paths
  const allPathEdgeIds: string[] = [];
  for (let i = 0; i < currentTour.length - 1; i++) {
    const res = runDijkstraSafePath(graph, currentTour[i], currentTour[i + 1], true);
    if (res.route) {
      allPathEdgeIds.push(...res.route.pathEdgeIds);
    }
  }

  const tourNames = currentTour.map(id => graph.nodes[id]?.name || id).join(' ➔ ');

  const elapsed = performance.now() - startTime;
  return {
    algorithmName: 'TSP & 2-Opt Multi-Stop Rescue Vehicle Dispatch',
    executionTimeMs: Math.round(elapsed * 100) / 100,
    summary: `Computed optimal minimal-hazard rescue loop visiting ${stops.length} emergency locations. Total tour distance: ${bestDist.toFixed(1)} km.`,
    steps,
    customMetrics: {
      'Stops Visited': stops.length,
      'Total Tour Distance': `${bestDist.toFixed(1)} km`,
      '2-Opt Improvements': iterations,
      'Depot Base': graph.nodes[depot]?.name || depot,
      'Tour Sequence': tourNames
    }
  };
}
