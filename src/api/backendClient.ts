import { GraphData, RouteResult, AlgorithmExecutionResult } from '../types/graph';
import { DistressCall, RescueTeam, WeatherCondition } from '../types/simulation';

// Local TypeScript algorithm fallbacks
import { runDijkstraSafePath, runAStarSafePath, runBellmanFordSafetyCheck, runFloydWarshallAllPairs } from '../algorithms/shortestPath';
import { runBfsReachability, findConnectedComponents } from '../algorithms/bfsDfs';
import { runTarjanResilienceAnalysis } from '../algorithms/connectivity';
import { runKruskalEmergencyBackbone, runPrimEmergencyBackbone } from '../algorithms/mst';
import { runDinicMaxEvacuationFlow } from '../algorithms/maxFlow';
import { runRescueTeamMatching, runShelterAllocationMatching, RescueMatch, ShelterAllocationMatch } from '../algorithms/matching';
import { runVertexColoringSchedule } from '../algorithms/vertexColoring';
import { runDominatingSetHubPlacement } from '../algorithms/dominatingSet';
import { runTspRescueTour, runCapacitatedVrpDispatch } from '../algorithms/tspVrp';

const BACKEND_BASE_URL = 'http://127.0.0.1:8000';

export interface BackendHealthResponse {
  isOnline: boolean;
  engine?: string;
  latencyMs?: number;
}

export interface UniversalAlgorithmResponse {
  execution: AlgorithmExecutionResult;
  route: RouteResult | null;
  matches?: RescueMatch[];
  allocations?: ShelterAllocationMatch[];
  source: 'python_fastapi' | 'client_fallback';
}

/**
 * Check if the Python FastAPI backend is online
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const start = performance.now();
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      const data = await res.json();
      return {
        isOnline: true,
        engine: data.engine || 'FastAPI + Python 3.13',
        latencyMs: Math.round(performance.now() - start)
      };
    }
    return { isOnline: false };
  } catch {
    return { isOnline: false };
  }
}

/**
 * Execute an algorithm on the Python backend with automatic local fallback
 */
export async function executeAlgorithmApi(
  algorithmId: string,
  graph: GraphData,
  options: {
    startNodeId?: string;
    targetNodeId?: string;
    useAiSafety?: boolean;
    teams?: RescueTeam[];
    distressCalls?: DistressCall[];
    coverageRadiusKm?: number;
    numVehicles?: number;
  } = {}
): Promise<UniversalAlgorithmResponse> {
  const start = performance.now();

  // 1. Try Python FastAPI backend
  try {
    const payload = {
      algorithm_id: algorithmId,
      graph,
      start_node_id: options.startNodeId,
      target_node_id: options.targetNodeId,
      use_ai_safety: options.useAiSafety ?? true,
      teams: options.teams || [],
      distress_calls: options.distressCalls || [],
      coverage_radius_km: options.coverageRadiusKm ?? 3.5,
      num_vehicles: options.numVehicles ?? 3
    };

    const res = await fetch(`${BACKEND_BASE_URL}/api/algorithms/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        execution: data.execution,
        route: data.route || null,
        matches: data.matches || undefined,
        allocations: data.allocations || undefined,
        source: 'python_fastapi'
      };
    }
  } catch {
    // Backend offline or timeout -> smoothly fall back to local TypeScript execution
  }

  // 2. Local Fallback Execution
  const nodeIds = Object.keys(graph.nodes);
  const shelters = Object.values(graph.nodes).filter(n => n.type === 'shelter' || n.type === 'hospital');
  const startNode = options.startNodeId || nodeIds[0];
  const targetShelter = options.targetNodeId || (shelters[0]?.id || nodeIds[nodeIds.length - 1]);

  let execution: AlgorithmExecutionResult | null = null;
  let route: RouteResult | null = null;
  let matches: RescueMatch[] | undefined = undefined;
  let allocations: ShelterAllocationMatch[] | undefined = undefined;

  switch (algorithmId) {
    case 'dijkstra_safe': {
      const dRes = runDijkstraSafePath(graph, startNode, targetShelter, options.useAiSafety ?? true);
      execution = dRes.execution;
      route = dRes.route;
      break;
    }
    case 'astar_safe': {
      const aRes = runAStarSafePath(graph, startNode, targetShelter);
      execution = aRes.execution;
      route = aRes.route;
      break;
    }
    case 'bellman_ford': {
      execution = runBellmanFordSafetyCheck(graph, startNode);
      break;
    }
    case 'floyd_warshall': {
      execution = runFloydWarshallAllPairs(graph);
      break;
    }
    case 'bfs_reachability': {
      execution = runBfsReachability(graph, startNode);
      break;
    }
    case 'dfs_components': {
      execution = findConnectedComponents(graph);
      break;
    }
    case 'tarjan_bridges': {
      execution = runTarjanResilienceAnalysis(graph);
      break;
    }
    case 'kruskal_mst': {
      execution = runKruskalEmergencyBackbone(graph);
      break;
    }
    case 'prim_mst': {
      execution = runPrimEmergencyBackbone(graph, startNode);
      break;
    }
    case 'dinic_maxflow': {
      execution = runDinicMaxEvacuationFlow(graph);
      break;
    }
    case 'bipartite_matching': {
      const mRes = runRescueTeamMatching(graph, options.teams || [], options.distressCalls || []);
      execution = mRes.execution;
      matches = mRes.matches;
      break;
    }
    case 'shelter_allocation': {
      const sRes = runShelterAllocationMatching(graph);
      execution = sRes.execution;
      allocations = sRes.allocations;
      break;
    }
    case 'vertex_coloring': {
      execution = runVertexColoringSchedule(graph);
      break;
    }
    case 'dominating_set': {
      execution = runDominatingSetHubPlacement(graph, options.coverageRadiusKm ?? 3.5);
      break;
    }
    case 'tsp_rescue': {
      execution = runTspRescueTour(graph, shelters[0]?.id);
      break;
    }
    case 'cvrp_rescue': {
      execution = runCapacitatedVrpDispatch(graph, options.numVehicles ?? 3, 150);
      break;
    }
    default: {
      const dRes = runDijkstraSafePath(graph, startNode, targetShelter, true);
      execution = dRes.execution;
      route = dRes.route;
    }
  }

  return {
    execution: execution!,
    route,
    matches,
    allocations,
    source: 'client_fallback'
  };
}
