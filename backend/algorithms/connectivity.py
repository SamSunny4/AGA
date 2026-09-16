import time
from collections import deque
from typing import Dict, List, Set, Any
from ..models.graph import GraphData
from ..models.algorithm_results import AlgorithmExecutionResult, AlgorithmStep

def run_bfs_reachability(
    graph: GraphData,
    start_node_id: str,
    risk_threshold: float = 0.85
) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    visited: Set[str] = set()
    queue = deque([start_node_id])
    steps: List[AlgorithmStep] = []
    reachable_node_ids: List[str] = []

    if start_node_id in graph.nodes:
        visited.add(start_node_id)
        steps.append(AlgorithmStep(
            stepIndex=0,
            description=f"Initiated BFS reachability search from starting point '{graph.nodes[start_node_id].name}'.",
            highlightedNodeIds=[start_node_id],
            highlightedEdgeIds=[],
            visitedNodeIds=[start_node_id]
        ))

    while queue:
        current = queue.popleft()
        reachable_node_ids.append(current)

        for edge_id in graph.adjacencyList.get(current, []):
            edge = graph.edges.get(edge_id)
            if not edge or edge.isBlocked or edge.hazardRisk > risk_threshold:
                continue

            neighbor = edge.target if edge.source == current else edge.source
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

                if len(steps) < 50:
                    steps.append(AlgorithmStep(
                        stepIndex=len(steps),
                        description=f"Traversed safe corridor to discover accessible vertex '{graph.nodes[neighbor].name}'.",
                        highlightedNodeIds=[neighbor],
                        highlightedEdgeIds=[edge_id],
                        visitedNodeIds=list(visited)
                    ))

    unreachable_node_ids = [nid for nid in graph.nodes if nid not in visited]
    elapsed = (time.perf_counter() - start_time) * 1000

    total_nodes = len(graph.nodes)
    reachability_pct = int((len(reachable_node_ids) / max(total_nodes, 1)) * 100)

    return AlgorithmExecutionResult(
        algorithmName='BFS Accessible Reachability Analysis (Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"BFS identified {len(reachable_node_ids)} accessible nodes. {len(unreachable_node_ids)} communities are currently cut off by disaster hazards.",
        steps=steps,
        customMetrics={
            'Accessible Safe Nodes': len(reachable_node_ids),
            'Isolated Cutoff Nodes': len(unreachable_node_ids),
            'Total Network Nodes': total_nodes,
            'Network Reachability': f"{reachability_pct}%",
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )

def find_connected_components(
    graph: GraphData,
    risk_threshold: float = 0.85
) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    visited: Set[str] = set()
    components: List[List[str]] = []
    node_colors: Dict[str, Dict[str, Any]] = {}
    steps: List[AlgorithmStep] = []

    palette = ['#38bdf8', '#34d399', '#f43f5e', '#fbbf24', '#a855f7', '#ec4899', '#06b6d4', '#84cc16']

    for node_id in graph.nodes:
        if node_id not in visited:
            current_component: List[str] = []
            stack = [node_id]
            visited.add(node_id)
            comp_color = palette[len(components) % len(palette)]

            while stack:
                u = stack.pop()
                current_component.append(u)
                node_colors[u] = {'color': comp_color}

                for edge_id in graph.adjacencyList.get(u, []):
                    edge = graph.edges.get(edge_id)
                    if not edge or edge.isBlocked or edge.hazardRisk > risk_threshold:
                        continue
                    v = edge.target if edge.source == u else edge.source
                    if v not in visited:
                        visited.add(v)
                        stack.append(v)

            components.append(current_component)
            steps.append(AlgorithmStep(
                stepIndex=len(steps),
                description=f"Identified Island Component #{len(components)} with {len(current_component)} interconnected nodes.",
                highlightedNodeIds=current_component,
                highlightedEdgeIds=[],
                visitedNodeIds=list(visited)
            ))

    elapsed = (time.perf_counter() - start_time) * 1000

    return AlgorithmExecutionResult(
        algorithmName='DFS Connected Component Decomposition (Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"Transportation network partitioned into {len(components)} isolated clusters due to hazard severed corridors.",
        steps=steps,
        nodeAttributes=node_colors,
        customMetrics={
            'Connected Components': len(components),
            'Largest Cluster Size': max((len(c) for c in components), default=0),
            'Isolated Zones (<3 nodes)': sum(1 for c in components if len(c) < 3),
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )

def run_tarjan_resilience_analysis(graph: GraphData) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    disc: Dict[str, int] = {nid: -1 for nid in graph.nodes}
    low: Dict[str, int] = {nid: -1 for nid in graph.nodes}
    parent: Dict[str, Any] = {nid: None for nid in graph.nodes}
    articulation_points: Set[str] = set()
    bridge_edges: Set[str] = set()
    steps: List[AlgorithmStep] = []
    timer = 0

    def dfs(u: str):
        nonlocal timer
        timer += 1
        disc[u] = low[u] = timer
        children = 0

        for edge_id in graph.adjacencyList.get(u, []):
            edge = graph.edges.get(edge_id)
            if not edge or edge.isBlocked:
                continue
            v = edge.target if edge.source == u else edge.source

            if disc[v] == -1:
                children += 1
                parent[v] = u

                if len(steps) < 40:
                    steps.append(AlgorithmStep(
                        stepIndex=len(steps),
                        description=f"DFS explored forward road ({graph.nodes[u].name} -> {graph.nodes[v].name}). Discovery: {disc[u]}.",
                        highlightedNodeIds=[u, v],
                        highlightedEdgeIds=[edge_id]
                    ))

                dfs(v)
                low[u] = min(low[u], low[v])

                # Articulation condition 1: root node with >= 2 children
                if parent[u] is None and children > 1:
                    articulation_points.add(u)

                # Articulation condition 2: non-root with low[v] >= disc[u]
                if parent[u] is not None and low[v] >= disc[u]:
                    articulation_points.add(u)

                # Bridge condition: low[v] > disc[u]
                if low[v] > disc[u]:
                    bridge_edges.add(edge_id)
                    if len(steps) < 50:
                        steps.append(AlgorithmStep(
                            stepIndex=len(steps),
                            description=f"CRITICAL INFRASTRUCTURE CUT-EDGE: Road '{graph.nodes[u].name} - {graph.nodes[v].name}' is a single point of failure!",
                            highlightedNodeIds=[u, v],
                            highlightedEdgeIds=[edge_id]
                        ))
            elif v != parent[u]:
                low[u] = min(low[u], disc[v])

    for node_id in graph.nodes:
        if disc[node_id] == -1:
            dfs(node_id)

    edge_attrs: Dict[str, Dict[str, Any]] = {eid: {'isBridge': True} for eid in bridge_edges}
    elapsed = (time.perf_counter() - start_time) * 1000

    crit_bridges = len(bridge_edges)
    art_count = len(articulation_points)
    total_edges = len(graph.edges)
    resilience_score = max(10, int(100 - (crit_bridges / max(total_edges, 1)) * 120 - art_count * 4))

    return AlgorithmExecutionResult(
        algorithmName="Tarjan's Network Resilience & Critical Bridge Analysis (Python)",
        executionTimeMs=round(elapsed, 2),
        summary=f"Discovered {crit_bridges} single-point-of-failure bridges and {art_count} bottleneck junctions. Resilience Score: {resilience_score}/100.",
        steps=steps,
        edgeAttributes=edge_attrs,
        customMetrics={
            'Critical Cut Bridges': crit_bridges,
            'Articulation Junctions': art_count,
            'Network Resilience Score': f"{resilience_score} / 100",
            'Vulnerability Rating': 'HIGH RISK' if crit_bridges > 3 else 'MODERATE',
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )
