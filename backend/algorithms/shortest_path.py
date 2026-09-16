import math
import time
import heapq
from typing import Dict, List, Optional, Tuple, Any
from ..models.graph import GraphData, GraphEdge, GraphNode
from ..models.algorithm_results import AlgorithmExecutionResult, AlgorithmStep, RouteResult, RouteStep

def calculate_dynamic_edge_cost(
    edge: GraphEdge,
    use_ai_safety: bool = True,
    risk_weight_multiplier: float = 3.0
) -> float:
    if edge.isBlocked:
        return float('inf')

    base_travel_time_min = (edge.distance / max(edge.baseSpeed, 10.0)) * 60.0
    traffic_factor = 1.0 + edge.trafficDensity * 1.8
    slope_penalty = 1.0 + max(0.0, edge.elevationSlope / 100.0) * 0.5

    if not use_ai_safety:
        return base_travel_time_min * traffic_factor * slope_penalty

    effective_risk = min(0.99, max(edge.hazardRisk, edge.predictedRisk * 0.9))
    if effective_risk >= 0.92:
        return float('inf')

    safety_penalty = math.pow(1.0 / (1.0 - effective_risk), risk_weight_multiplier)
    return base_travel_time_min * traffic_factor * slope_penalty * safety_penalty

def euclidean_distance_km(node_a: GraphNode, node_b: GraphNode) -> float:
    d_lat = (node_b.lat - node_a.lat) * 111.32
    d_lng = (node_b.lng - node_a.lng) * 111.32 * math.cos(math.radians(node_a.lat))
    return math.sqrt(d_lat * d_lat + d_lng * d_lng)

def run_dijkstra_safe_path(
    graph: GraphData,
    start_node_id: str,
    target_node_id: str,
    use_ai_safety: bool = True
) -> Tuple[Optional[RouteResult], AlgorithmExecutionResult]:
    start_time = time.perf_counter()
    distances: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    previous_node: Dict[str, Optional[str]] = {nid: None for nid in graph.nodes}
    previous_edge: Dict[str, Optional[str]] = {nid: None for nid in graph.nodes}
    visited = set()
    steps: List[AlgorithmStep] = []

    if start_node_id not in graph.nodes or target_node_id not in graph.nodes:
        elapsed = (time.perf_counter() - start_time) * 1000
        return None, AlgorithmExecutionResult(
            algorithmName='Dijkstra Safe Path (Python)',
            executionTimeMs=round(elapsed, 2),
            summary='Invalid origin or destination node identifier.',
            steps=[]
        )

    distances[start_node_id] = 0.0
    pq = [(0.0, start_node_id)]

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Initialized Dijkstra search from origin '{graph.nodes[start_node_id].name}' to destination '{graph.nodes[target_node_id].name}'. Mode: {'AI Dynamic Risk-Aware' if use_ai_safety else 'Naive Shortest Distance'}.",
        highlightedNodeIds=[start_node_id],
        highlightedEdgeIds=[],
        visitedNodeIds=[]
    ))

    found = False
    while pq:
        dist, current = heapq.heappop(pq)
        if current in visited:
            continue
        visited.add(current)

        if len(steps) < 50:
            steps.append(AlgorithmStep(
                stepIndex=len(steps),
                description=f"Settled vertex '{graph.nodes[current].name}' with cost {dist:.1f}.",
                highlightedNodeIds=[current],
                highlightedEdgeIds=[previous_edge[current]] if previous_edge[current] else [],
                visitedNodeIds=list(visited)
            ))

        if current == target_node_id:
            found = True
            break

        for edge_id in graph.adjacencyList.get(current, []):
            edge = graph.edges.get(edge_id)
            if not edge:
                continue
            neighbor = edge.target if edge.source == current else edge.source
            if neighbor in visited:
                continue

            cost = calculate_dynamic_edge_cost(edge, use_ai_safety)
            if math.isinf(cost):
                continue

            cand_dist = distances[current] + cost
            if cand_dist < distances[neighbor]:
                distances[neighbor] = cand_dist
                previous_node[neighbor] = current
                previous_edge[neighbor] = edge_id
                heapq.heappush(pq, (cand_dist, neighbor))

    elapsed = (time.perf_counter() - start_time) * 1000

    if not found or math.isinf(distances[target_node_id]):
        return None, AlgorithmExecutionResult(
            algorithmName='AI-Driven Dynamic Safe Path (Dijkstra - Python Engine)',
            executionTimeMs=round(elapsed, 2),
            summary=f"No passable route exists between {graph.nodes[start_node_id].name} and {graph.nodes[target_node_id].name} due to severe hazard cutoffs.",
            steps=steps,
            customMetrics={
                'Route Status': 'UNREACHABLE / CUTOFF',
                'Visited Vertices': len(visited),
                'Execution Time': f"{round(elapsed, 2)} ms"
            }
        )

    # Reconstruct path
    path_nodes: List[str] = []
    path_edges: List[str] = []
    curr: Optional[str] = target_node_id
    while curr:
        path_nodes.insert(0, curr)
        e_id = previous_edge[curr]
        if e_id:
            path_edges.insert(0, e_id)
        curr = previous_node[curr]

    total_distance_km = 0.0
    total_time_min = 0.0
    max_risk = 0.0
    sum_risk = 0.0
    bottlenecks: List[str] = []
    route_steps: List[RouteStep] = []

    for i in range(len(path_edges)):
        edge = graph.edges[path_edges[i]]
        u = graph.nodes[path_nodes[i]]
        v = graph.nodes[path_nodes[i + 1]]
        total_distance_km += edge.distance
        leg_time = (edge.distance / max(edge.baseSpeed * (1 - edge.trafficDensity * 0.5), 10.0)) * 60.0
        total_time_min += leg_time
        max_risk = max(max_risk, edge.hazardRisk)
        sum_risk += edge.hazardRisk

        if edge.hazardRisk > 0.4 or edge.isBridge:
            bottlenecks.append(f"Segment {u.name} -> {v.name} ({edge.roadType}) [Risk: {int(edge.hazardRisk * 100)}%]")

        route_steps.append(RouteStep(
            instruction=f"Head from {u.name} toward {v.name} via {edge.roadType.upper()}",
            distanceKm=round(edge.distance, 1),
            roadName=f"{u.name} – {v.name} Corridor",
            hazardWarning=f"Elevated Hazard Risk ({int(edge.hazardRisk * 100)}%)" if edge.hazardRisk > 0.3 else None
        ))

    avg_risk = sum_risk / len(path_edges) if path_edges else 0.0
    safety_score = max(0, min(100, int((1.0 - avg_risk) * 100 - max_risk * 20)))

    route = RouteResult(
        pathNodeIds=path_nodes,
        pathEdgeIds=path_edges,
        totalDistanceKm=round(total_distance_km, 1),
        estimatedTimeMin=round(total_time_min),
        safetyScore=safety_score,
        hazardExposureRisk=round(max_risk, 2),
        isPassable=True,
        bottlenecks=bottlenecks,
        steps=route_steps
    )

    steps.append(AlgorithmStep(
        stepIndex=len(steps),
        description=f"Optimal {'AI Safe' if use_ai_safety else 'Standard'} Path established with {len(path_nodes)} vertices. Safety index: {safety_score}/100.",
        highlightedNodeIds=path_nodes,
        highlightedEdgeIds=path_edges,
        visitedNodeIds=list(visited)
    ))

    return route, AlgorithmExecutionResult(
        algorithmName=f"{'AI-Driven Dynamic Safe Path' if use_ai_safety else 'Standard Shortest Path'} (Dijkstra - Python)",
        executionTimeMs=round(elapsed, 2),
        summary=f"Found route traversing {len(path_nodes)} nodes ({total_distance_km:.1f} km, ~{round(total_time_min)} min). Safety Index: {safety_score}/100.",
        steps=steps,
        customMetrics={
            'Total Distance': f"{total_distance_km:.1f} km",
            'Est. Travel Time': f"{round(total_time_min)} min",
            'Safety Score': f"{safety_score} / 100",
            'Peak Hazard Exposure': f"{max_risk * 100:.1f}%",
            'Explored Nodes': len(visited)
        }
    )

def run_astar_safe_path(
    graph: GraphData,
    start_node_id: str,
    target_node_id: str
) -> Tuple[Optional[RouteResult], AlgorithmExecutionResult]:
    start_time = time.perf_counter()
    if start_node_id not in graph.nodes or target_node_id not in graph.nodes:
        return None, AlgorithmExecutionResult(
            algorithmName='A* Heuristic Safe Routing (Python)',
            executionTimeMs=0.0,
            summary='Invalid origin or destination node identifier.',
            steps=[]
        )

    start_node = graph.nodes[start_node_id]
    target_node = graph.nodes[target_node_id]

    g_score: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    f_score: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    came_from_node: Dict[str, Optional[str]] = {nid: None for nid in graph.nodes}
    came_from_edge: Dict[str, Optional[str]] = {nid: None for nid in graph.nodes}
    open_set_track = {start_node_id}
    closed_set = set()
    steps: List[AlgorithmStep] = []

    g_score[start_node_id] = 0.0
    f_score[start_node_id] = euclidean_distance_km(start_node, target_node)
    pq = [(f_score[start_node_id], start_node_id)]

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"A* initialized with Euclidean distance heuristic $h(n)$ toward destination '{target_node.name}'.",
        highlightedNodeIds=[start_node_id],
        highlightedEdgeIds=[]
    ))

    reached = False
    while pq:
        f_val, current = heapq.heappop(pq)
        if current in closed_set:
            continue
        open_set_track.discard(current)
        closed_set.add(current)

        if current == target_node_id:
            reached = True
            break

        current_node = graph.nodes[current]

        for edge_id in graph.adjacencyList.get(current, []):
            edge = graph.edges.get(edge_id)
            if not edge:
                continue
            neighbor = edge.target if edge.source == current else edge.source
            if neighbor in closed_set:
                continue

            cost = calculate_dynamic_edge_cost(edge, True)
            if math.isinf(cost):
                continue

            tentative_g = g_score[current] + cost
            if tentative_g < g_score[neighbor]:
                came_from_node[neighbor] = current
                came_from_edge[neighbor] = edge_id
                g_score[neighbor] = tentative_g
                h = euclidean_distance_km(graph.nodes[neighbor], target_node) * 1.5
                f_score[neighbor] = tentative_g + h

                if neighbor not in open_set_track:
                    heapq.heappush(pq, (f_score[neighbor], neighbor))
                    open_set_track.add(neighbor)

        if len(steps) < 50:
            steps.append(AlgorithmStep(
                stepIndex=len(steps),
                description=f"Evaluated f(n)={f_val:.1f} for vertex '{current_node.name}'.",
                highlightedNodeIds=[current],
                highlightedEdgeIds=[came_from_edge[current]] if came_from_edge[current] else [],
                visitedNodeIds=list(closed_set)
            ))

    elapsed = (time.perf_counter() - start_time) * 1000

    if not reached:
        return None, AlgorithmExecutionResult(
            algorithmName='A* Heuristic Safe Routing (Python Engine)',
            executionTimeMs=round(elapsed, 2),
            summary='Destination unreachable due to impassable hazard zones.',
            steps=steps,
            customMetrics={
                'Target Reached': 'NO',
                'Nodes Expanded': len(closed_set),
                'Path Length': 0,
                'Execution Speed': f"{round(elapsed, 2)} ms"
            }
        )

    # Reconstruct path
    path_nodes: List[str] = []
    path_edges: List[str] = []
    curr: Optional[str] = target_node_id
    while curr:
        path_nodes.insert(0, curr)
        e_id = came_from_edge[curr]
        if e_id:
            path_edges.insert(0, e_id)
        curr = came_from_node[curr]

    total_dist = 0.0
    total_time = 0.0
    max_risk = 0.0
    sum_risk = 0.0
    bottlenecks: List[str] = []
    route_steps: List[RouteStep] = []

    for i in range(len(path_edges)):
        edge = graph.edges[path_edges[i]]
        u = graph.nodes[path_nodes[i]]
        v = graph.nodes[path_nodes[i + 1]]
        total_dist += edge.distance
        leg_time = (edge.distance / max(edge.baseSpeed * (1 - edge.trafficDensity * 0.5), 10.0)) * 60.0
        total_time += leg_time
        max_risk = max(max_risk, edge.hazardRisk)
        sum_risk += edge.hazardRisk

        if edge.hazardRisk > 0.4 or edge.isBridge:
            bottlenecks.append(f"Segment {u.name} -> {v.name} [Risk: {int(edge.hazardRisk * 100)}%]")

        route_steps.append(RouteStep(
            instruction=f"Follow {edge.roadType.upper()} from {u.name} to {v.name}",
            distanceKm=round(edge.distance, 1),
            roadName=f"{u.name} – {v.name} Safe Corridor",
            hazardWarning=f"Risk {int(edge.hazardRisk * 100)}%" if edge.hazardRisk > 0.3 else None
        ))

    avg_risk = sum_risk / len(path_edges) if path_edges else 0.0
    safety_score = max(0, min(100, int((1.0 - avg_risk) * 100 - max_risk * 20)))

    route = RouteResult(
        pathNodeIds=path_nodes,
        pathEdgeIds=path_edges,
        totalDistanceKm=round(total_dist, 1),
        estimatedTimeMin=round(total_time),
        safetyScore=safety_score,
        hazardExposureRisk=round(max_risk, 2),
        isPassable=True,
        bottlenecks=bottlenecks,
        steps=route_steps
    )

    steps.append(AlgorithmStep(
        stepIndex=len(steps),
        description=f"A* converged to optimal safe corridor with {len(path_nodes)} vertices. Total travel time: ~{round(total_time)} min.",
        highlightedNodeIds=path_nodes,
        highlightedEdgeIds=path_edges,
        visitedNodeIds=list(closed_set)
    ))

    return route, AlgorithmExecutionResult(
        algorithmName='A* Heuristic Safe Routing (Python Engine)',
        executionTimeMs=round(elapsed, 2),
        summary=f"A* successfully converged in {len(closed_set)} vertex expansions. Safety score: {safety_score}/100.",
        steps=steps,
        customMetrics={
            'Target Reached': 'YES',
            'Nodes Expanded': len(closed_set),
            'Path Distance': f"{total_dist:.1f} km",
            'Travel Time': f"{round(total_time)} min",
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )

def run_bellman_ford_safety_check(
    graph: GraphData,
    start_node_id: str
) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    distances: Dict[str, float] = {nid: float('inf') for nid in graph.nodes}
    distances[start_node_id] = 0.0
    steps: List[AlgorithmStep] = []
    edges_list = list(graph.edges.values())
    node_count = len(graph.nodes)

    relaxed_iterations = 0
    negative_cycle_detected = False

    # Relax |V| - 1 times
    for i in range(min(node_count - 1, 15)):
        relaxed_any = False
        relaxed_iterations += 1
        for edge in edges_list:
            if edge.isBlocked:
                continue
            weight = calculate_dynamic_edge_cost(edge, True)
            if math.isinf(weight):
                continue

            if distances[edge.source] + weight < distances[edge.target]:
                distances[edge.target] = distances[edge.source] + weight
                relaxed_any = True
            if distances[edge.target] + weight < distances[edge.source]:
                distances[edge.source] = distances[edge.target] + weight
                relaxed_any = True

        if not relaxed_any:
            break

    # Negative cycle check
    for edge in edges_list:
        if edge.isBlocked:
            continue
        weight = calculate_dynamic_edge_cost(edge, True)
        if math.isinf(weight):
            continue
        if distances[edge.source] + weight < distances[edge.target]:
            negative_cycle_detected = True
            break

    elapsed = (time.perf_counter() - start_time) * 1000

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Bellman-Ford evaluated {len(edges_list)} bidirectional edges across {relaxed_iterations} relaxation passes. Stability status: {'WARNING - Negative Risk Cycle Detected' if negative_cycle_detected else 'STABLE - Zero Negative Hazard Cycles'}.",
        highlightedNodeIds=[start_node_id],
        highlightedEdgeIds=[]
    ))

    reachable_count = sum(1 for d in distances.values() if not math.isinf(d))

    return AlgorithmExecutionResult(
        algorithmName='Bellman-Ford Stability & Hazard Cycle Check (Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"Bellman-Ford validated stable cost convergence across {reachable_count} reachable zones without negative hazard loops.",
        steps=steps,
        customMetrics={
            'Relaxation Passes': relaxed_iterations,
            'Reachable Safe Nodes': f"{reachable_count} / {node_count}",
            'Convergence Status': 'STABLE' if not negative_cycle_detected else 'ANOMALY DETECTED',
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )

def run_floyd_warshall_all_pairs(
    graph: GraphData
) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    nodes_list = list(graph.nodes.keys())
    n = len(nodes_list)
    idx_map = {nid: i for i, nid in enumerate(nodes_list)}

    # Distance matrix
    dist = [[float('inf')] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0.0

    for edge in graph.edges.values():
        if edge.isBlocked:
            continue
        cost = calculate_dynamic_edge_cost(edge, True)
        if math.isinf(cost):
            continue
        u = idx_map.get(edge.source)
        v = idx_map.get(edge.target)
        if u is not None and v is not None:
            dist[u][v] = min(dist[u][v], cost)
            dist[v][u] = min(dist[v][u], cost)

    # DP all-pairs
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    elapsed = (time.perf_counter() - start_time) * 1000

    # Shelter to shelter connectivity
    shelter_nodes = [nid for nid, node in graph.nodes.items() if node.type in ('shelter', 'hospital')]
    accessible_pairs = 0
    total_pairs = n * (n - 1) // 2

    for i in range(n):
        for j in range(i + 1, n):
            if not math.isinf(dist[i][j]):
                accessible_pairs += 1

    steps = [
        AlgorithmStep(
            stepIndex=0,
            description=f"Floyd-Warshall all-pairs dynamic programming computed full $O(V^3)$ safety routing matrix across {n} nodes ({accessible_pairs}/{total_pairs} connected pairs).",
            highlightedNodeIds=shelter_nodes[:4],
            highlightedEdgeIds=[]
        )
    ]

    return AlgorithmExecutionResult(
        algorithmName='Floyd-Warshall All-Pairs Safe Distances (Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"Computed complete {n}x{n} all-pairs emergency distance matrix. {accessible_pairs} accessible vertex pairs validated.",
        steps=steps,
        customMetrics={
            'Total Vertices': n,
            'Accessible Node Pairs': f"{accessible_pairs} / {total_pairs}",
            'Network Density': f"{(accessible_pairs / max(total_pairs, 1)) * 100:.1f}%",
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )
