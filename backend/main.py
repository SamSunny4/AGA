from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models.graph import GraphData, HazardZone
from .models.simulation import DistressCall, RescueTeam, WeatherCondition
from .models.algorithm_results import AlgorithmExecutionResult, RouteResult, AlgorithmResponse

from .algorithms.shortest_path import (
    run_dijkstra_safe_path,
    run_astar_safe_path,
    run_bellman_ford_safety_check,
    run_floyd_warshall_all_pairs
)
from .algorithms.connectivity import (
    run_bfs_reachability,
    find_connected_components,
    run_tarjan_resilience_analysis
)
from .algorithms.mst import (
    run_kruskal_emergency_backbone,
    run_prim_emergency_backbone
)
from .algorithms.max_flow import run_dinic_max_evacuation_flow
from .algorithms.matching import (
    run_rescue_team_matching,
    run_shelter_allocation_matching
)
from .algorithms.vertex_coloring import run_vertex_coloring_schedule
from .algorithms.dominating_set import run_dominating_set_hub_placement
from .algorithms.tsp_vrp import (
    run_tsp_rescue_tour,
    run_capacitated_vrp_dispatch
)
from .ai.hazard_spread import advance_hazards
from .ai.road_risk_predictor import predict_future_road_risks

app = FastAPI(
    title="PlanEsc AGA Backend Engine",
    description="Advanced Graph Algorithms and AI Disaster Evacuation Backend",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class UniversalAlgorithmRequest(BaseModel):
    algorithm_id: str
    graph: GraphData
    start_node_id: Optional[str] = None
    target_node_id: Optional[str] = None
    use_ai_safety: Optional[bool] = True
    coverage_radius_km: Optional[float] = 3.5
    teams: Optional[List[RescueTeam]] = []
    distress_calls: Optional[List[DistressCall]] = []
    num_vehicles: Optional[int] = 3
    vehicle_capacity: Optional[int] = 150

class HazardAdvanceRequest(BaseModel):
    hazards: List[HazardZone]
    dt_hours: float
    weather: WeatherCondition

class RoadPredictRequest(BaseModel):
    nodes: Dict[str, Any]
    edges: Dict[str, Any]
    hazards: List[HazardZone]
    weather: WeatherCondition
    lookahead_hours: float = 1.0

# ----------------- Health & Capabilities -----------------
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "engine": "FastAPI + Python 3.13",
        "service": "PlanEsc Advanced Graph Algorithms Core",
        "capabilities": [
            "dijkstra_safe", "astar_safe", "bellman_ford", "floyd_warshall",
            "bfs_reachability", "dfs_components", "tarjan_bridges",
            "kruskal_mst", "prim_mst",
            "dinic_maxflow",
            "bipartite_matching", "shelter_allocation",
            "vertex_coloring",
            "dominating_set",
            "tsp_rescue", "cvrp_rescue"
        ]
    }

# ----------------- Universal Algorithm Executor -----------------
@app.post("/api/algorithms/execute", response_model=AlgorithmResponse)
def execute_algorithm(req: UniversalAlgorithmRequest):
    algo = req.algorithm_id
    graph = req.graph

    node_ids = list(graph.nodes.keys())
    shelters = [n.id for n in graph.nodes.values() if n.type in ('shelter', 'hospital')]
    start_node = req.start_node_id or (node_ids[0] if node_ids else "")
    target_shelter = req.target_node_id or (shelters[0] if shelters else (node_ids[-1] if node_ids else ""))

    if algo == 'dijkstra_safe':
        route, exec_res = run_dijkstra_safe_path(graph, start_node, target_shelter, req.use_ai_safety if req.use_ai_safety is not None else True)
        return AlgorithmResponse(execution=exec_res, route=route)

    elif algo == 'astar_safe':
        route, exec_res = run_astar_safe_path(graph, start_node, target_shelter)
        return AlgorithmResponse(execution=exec_res, route=route)

    elif algo == 'bellman_ford':
        exec_res = run_bellman_ford_safety_check(graph, start_node)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'floyd_warshall':
        exec_res = run_floyd_warshall_all_pairs(graph)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'bfs_reachability':
        exec_res = run_bfs_reachability(graph, start_node)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'dfs_components':
        exec_res = find_connected_components(graph)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'tarjan_bridges':
        exec_res = run_tarjan_resilience_analysis(graph)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'kruskal_mst':
        exec_res = run_kruskal_emergency_backbone(graph)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'prim_mst':
        exec_res = run_prim_emergency_backbone(graph, start_node)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'dinic_maxflow':
        exec_res = run_dinic_max_evacuation_flow(graph)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'bipartite_matching':
        matches, exec_res = run_rescue_team_matching(graph, req.teams or [], req.distress_calls or [])
        return AlgorithmResponse(execution=exec_res, matches=matches)

    elif algo == 'shelter_allocation':
        allocs, exec_res = run_shelter_allocation_matching(graph)
        return AlgorithmResponse(execution=exec_res, allocations=allocs)

    elif algo == 'vertex_coloring':
        exec_res = run_vertex_coloring_schedule(graph)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'dominating_set':
        exec_res = run_dominating_set_hub_placement(graph, req.coverage_radius_km or 3.5)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'tsp_rescue':
        exec_res = run_tsp_rescue_tour(graph, shelters[0] if shelters else None)
        return AlgorithmResponse(execution=exec_res)

    elif algo == 'cvrp_rescue':
        exec_res = run_capacitated_vrp_dispatch(graph, req.num_vehicles or 3, req.vehicle_capacity or 150)
        return AlgorithmResponse(execution=exec_res)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm ID: {algo}")

# ----------------- AI Simulation Endpoints -----------------
@app.post("/api/ai/predict-hazards")
def advance_hazard_simulation(req: HazardAdvanceRequest):
    updated = advance_hazards(req.hazards, req.dt_hours, req.weather)
    return {"hazards": updated}

@app.post("/api/ai/predict-road-risks")
def road_risk_prediction(req: RoadPredictRequest):
    result = predict_future_road_risks(
        req.nodes,
        req.edges,
        req.hazards,
        req.weather,
        req.lookahead_hours
    )
    return result
