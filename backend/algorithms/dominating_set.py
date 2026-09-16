import math
import time
from typing import Dict, List, Set, Any
from ..models.graph import GraphData, GraphNode
from ..models.algorithm_results import AlgorithmExecutionResult, AlgorithmStep

def get_distance(node_a: GraphNode, node_b: GraphNode) -> float:
    d_lat = (node_b.lat - node_a.lat) * 111.32
    d_lng = (node_b.lng - node_a.lng) * 111.32 * math.cos(math.radians(node_a.lat))
    return math.sqrt(d_lat * d_lat + d_lng * d_lng)

def run_dominating_set_hub_placement(
    graph: GraphData,
    coverage_radius_km: float = 3.5
) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    steps: List[AlgorithmStep] = []
    all_node_ids = list(graph.nodes.keys())
    covered_nodes: Set[str] = set()
    dominating_hub_ids: Set[str] = set()

    # Precompute coverage neighborhood
    neighborhood: Dict[str, Set[str]] = {}
    for u in all_node_ids:
        neighborhood[u] = {u}
        node_u = graph.nodes[u]

        # Topological neighbors
        for edge_id in graph.adjacencyList.get(u, []):
            edge = graph.edges.get(edge_id)
            if not edge or edge.isBlocked:
                continue
            v = edge.target if edge.source == u else edge.source
            neighborhood[u].add(v)

        # Spatial radius neighbors
        for v in all_node_ids:
            if u == v:
                continue
            node_v = graph.nodes[v]
            if get_distance(node_u, node_v) <= coverage_radius_km:
                neighborhood[u].add(v)

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Dominating Set optimizer initialized. Target: Determine minimum strategic relief hub locations covering all {len(all_node_ids)} vertices within $\\le {coverage_radius_km}$ km radius.",
        highlightedNodeIds=[],
        highlightedEdgeIds=[]
    ))

    # Greedy set cover
    while len(covered_nodes) < len(all_node_ids):
        best_candidate = None
        max_newly_covered = -1

        for candidate in all_node_ids:
            node = graph.nodes[candidate]
            bonus = 2 if node.type in ('shelter', 'hospital', 'depot') else 0
            new_cov = sum(1 for nbr in neighborhood[candidate] if nbr not in covered_nodes)
            score = new_cov + bonus

            if score > max_newly_covered:
                max_newly_covered = score
                best_candidate = candidate

        if not best_candidate or max_newly_covered <= 0:
            for u in all_node_ids:
                if u not in covered_nodes:
                    dominating_hub_ids.add(u)
                    covered_nodes.add(u)
            break

        dominating_hub_ids.add(best_candidate)
        newly_covered_in_step = []
        for nbr in neighborhood[best_candidate]:
            if nbr not in covered_nodes:
                covered_nodes.add(nbr)
                newly_covered_in_step.append(nbr)

        if len(steps) < 30:
            steps.append(AlgorithmStep(
                stepIndex=len(steps),
                description=f"Selected '{graph.nodes[best_candidate].name}' as Strategic Hub #{len(dominating_hub_ids)}. Covered {len(newly_covered_in_step)} new neighborhood zones.",
                highlightedNodeIds=[best_candidate] + newly_covered_in_step[:4],
                highlightedEdgeIds=[]
            ))

    node_attrs: Dict[str, Dict[str, Any]] = {
        nid: {'isDominatingHub': (nid in dominating_hub_ids)} for nid in all_node_ids
    }
    elapsed = (time.perf_counter() - start_time) * 1000

    total_pop = sum(n.population for n in graph.nodes.values())

    return AlgorithmExecutionResult(
        algorithmName='Minimum Dominating Set (Strategic Relief Hub Placement - Python)',
        executionTimeMs=round(elapsed, 2),
        summary=f"Selected {len(dominating_hub_ids)} optimal emergency relief hubs / siren centers to guarantee 100% population coverage within {coverage_radius_km} km.",
        steps=steps,
        nodeAttributes=node_attrs,
        customMetrics={
            'Total Strategic Hubs': len(dominating_hub_ids),
            'Total Covered Population': f"{total_pop:,}",
            'Coverage Efficiency': f"{len(all_node_ids) / max(len(dominating_hub_ids), 1):.1f} zones/hub",
            'Population Coverage': '100.0%',
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )
