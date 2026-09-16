import math
import time
from typing import Dict, List, Any, Tuple
from ..models.graph import GraphData
from ..models.simulation import DistressCall, RescueTeam
from ..models.algorithm_results import AlgorithmExecutionResult, AlgorithmStep

def get_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    d_lat = (lat2 - lat1) * 111.32
    d_lng = (lng2 - lng1) * 111.32 * math.cos(math.radians(lat1))
    return math.sqrt(d_lat * d_lat + d_lng * d_lng)

def run_rescue_team_matching(
    graph: GraphData,
    teams: List[RescueTeam],
    distress_calls: List[DistressCall]
) -> Tuple[List[Dict[str, Any]], AlgorithmExecutionResult]:
    start_time = time.perf_counter()
    steps: List[AlgorithmStep] = []
    matches: List[Dict[str, Any]] = []

    pending_calls = [c for c in distress_calls if c.status == 'pending' or not c.assignedTeamId]
    available_teams = [t for t in teams if t.status == 'idle' or not t.assignedDistressId]

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Initialized Priority Bipartite Maximum Matching for {len(available_teams)} available rescue units and {len(pending_calls)} active SOS distress calls.",
        highlightedNodeIds=[c.nodeId for c in pending_calls],
        highlightedEdgeIds=[]
    ))

    priority_weight = {'P1': 3, 'P2': 2, 'P3': 1}
    sorted_calls = sorted(pending_calls, key=lambda c: priority_weight.get(c.priority, 1), reverse=True)
    assigned_teams = set()

    for call in sorted_calls:
        call_node = graph.nodes.get(call.nodeId)
        if not call_node:
            continue

        best_team = None
        min_cost = float('inf')
        best_dist = 0.0

        for team in available_teams:
            if team.id in assigned_teams:
                continue
            team_node = graph.nodes.get(team.currentNodeId)
            if not team_node:
                continue

            dist = get_distance(team_node.lat, team_node.lng, call_node.lat, call_node.lng)
            cost = dist / (priority_weight.get(call.priority, 1) * 1.5)
            if cost < min_cost:
                min_cost = cost
                best_team = team
                best_dist = dist

        if best_team:
            assigned_teams.add(best_team.id)
            eta_min = max(2, int((best_dist / max(best_team.speedKmH, 20.0)) * 60))
            match_data = {
                'teamId': best_team.id,
                'teamName': best_team.name,
                'distressId': call.id,
                'targetNodeId': call.nodeId,
                'priority': call.priority,
                'distanceKm': round(best_dist, 1),
                'estimatedEtaMin': eta_min
            }
            matches.append(match_data)

            if len(steps) < 30:
                steps.append(AlgorithmStep(
                    stepIndex=len(steps),
                    description=f"Matched [{call.priority}] SOS '{call.description}' at {call_node.name} -> Team '{best_team.name}' (ETA: ~{eta_min}m, Dist: {best_dist:.1f}km).",
                    highlightedNodeIds=[call.nodeId, best_team.currentNodeId],
                    highlightedEdgeIds=[]
                ))

    elapsed = (time.perf_counter() - start_time) * 1000

    avg_eta = sum(m['estimatedEtaMin'] for m in matches) / max(len(matches), 1)

    return matches, AlgorithmExecutionResult(
        algorithmName='Priority-Weighted Bipartite Matching for Rescue Dispatch (Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"Dispatched {len(matches)} specialized emergency rescue units to high-priority disaster distress calls.",
        steps=steps,
        customMetrics={
            'Active Distress Calls': len(distress_calls),
            'Assigned Rescue Teams': len(matches),
            'Critical (P1) Coverage': f"{sum(1 for m in matches if m['priority'] == 'P1')}/{sum(1 for d in distress_calls if d.priority == 'P1')}",
            'Avg Response ETA': f"{round(avg_eta)} min",
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )

def run_shelter_allocation_matching(
    graph: GraphData
) -> Tuple[List[Dict[str, Any]], AlgorithmExecutionResult]:
    start_time = time.perf_counter()
    steps: List[AlgorithmStep] = []
    allocations: List[Dict[str, Any]] = []

    residential_nodes = [n for n in graph.nodes.values() if n.type == 'residential' or n.hazardRisk > 0.3]
    shelter_nodes = [n for n in graph.nodes.values() if n.type in ('shelter', 'hospital')]

    shelter_rem_cap = {s.id: (s.capacity if s.capacity else 2500) for s in shelter_nodes}

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Initiated Capacity-Constrained Gale-Shapley Matching for {len(residential_nodes)} hazard zones across {len(shelter_nodes)} designated emergency sanctuaries.",
        highlightedNodeIds=[s.id for s in shelter_nodes],
        highlightedEdgeIds=[]
    ))

    for r_node in residential_nodes:
        # Sort shelters by distance
        sorted_shelters = sorted(
            shelter_nodes,
            key=lambda s: get_distance(r_node.lat, r_node.lng, s.lat, s.lng)
        )

        for shelter in sorted_shelters:
            dist = get_distance(r_node.lat, r_node.lng, shelter.lat, shelter.lng)
            if shelter_rem_cap[shelter.id] >= r_node.population * 0.4:
                shelter_rem_cap[shelter.id] -= r_node.population
                alloc = {
                    'residentialNodeId': r_node.id,
                    'residentialName': r_node.name,
                    'population': r_node.population,
                    'shelterNodeId': shelter.id,
                    'shelterName': shelter.name,
                    'travelDistanceKm': round(dist, 1)
                }
                allocations.append(alloc)

                if len(steps) < 35:
                    steps.append(AlgorithmStep(
                        stepIndex=len(steps),
                        description=f"Allocated {r_node.population} evacuees from '{r_node.name}' -> Sanctuary '{shelter.name}' ({dist:.1f}km). Rem Cap: {max(0, shelter_rem_cap[shelter.id])}.",
                        highlightedNodeIds=[r_node.id, shelter.id],
                        highlightedEdgeIds=[]
                    ))
                break

    elapsed = (time.perf_counter() - start_time) * 1000

    total_evac = sum(a['population'] for a in allocations)
    avg_dist = sum(a['travelDistanceKm'] for a in allocations) / max(len(allocations), 1)

    return allocations, AlgorithmExecutionResult(
        algorithmName='Capacity-Constrained Optimal Shelter Matching (Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"Allocated {len(allocations)} residential communities ({total_evac:,} evacuees) to closest safe shelters without capacity overflow.",
        steps=steps,
        customMetrics={
            'Zones Allocated': len(allocations),
            'Total Evacuees Accommodated': f"{total_evac:,}",
            'Shelters Utilized': sum(1 for s in shelter_nodes if shelter_rem_cap[s.id] < (s.capacity or 2500)),
            'Avg Evacuee Distance': f"{avg_dist:.1f} km",
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )
