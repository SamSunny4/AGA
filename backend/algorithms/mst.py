import time
from typing import Dict, List, Set, Any, Optional
from ..models.graph import GraphData
from ..models.algorithm_results import AlgorithmExecutionResult, AlgorithmStep

class DSU:
    def __init__(self, node_ids: List[str]):
        self.parent = {nid: nid for nid in node_ids}
        self.rank = {nid: 0 for nid in node_ids}

    def find(self, x: str) -> str:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: str, y: str) -> bool:
        rx = self.find(x)
        ry = self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            self.parent[rx] = ry
        elif self.rank[rx] > self.rank[ry]:
            self.parent[ry] = rx
        else:
            self.parent[ry] = rx
            self.rank[rx] += 1
        return True

def run_kruskal_emergency_backbone(graph: GraphData) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    node_ids = list(graph.nodes.keys())
    dsu = DSU(node_ids)
    steps: List[AlgorithmStep] = []
    mst_edge_ids: List[str] = []

    viable_edges = [
        (e.distance * (1.0 + e.hazardRisk * 4.0), e)
        for e in graph.edges.values()
        if not e.isBlocked and e.hazardRisk < 0.9
    ]
    viable_edges.sort(key=lambda x: x[0])

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Kruskal's algorithm sorted {len(viable_edges)} viable road segments by risk-weighted logistics cost.",
        highlightedNodeIds=[],
        highlightedEdgeIds=[]
    ))

    total_dist = 0.0
    for cost, edge in viable_edges:
        if dsu.union(edge.source, edge.target):
            mst_edge_ids.append(edge.id)
            total_dist += edge.distance

            if len(steps) < 40:
                steps.append(AlgorithmStep(
                    stepIndex=len(steps),
                    description=f"Added secure backbone link ({graph.nodes[edge.source].name} <-> {graph.nodes[edge.target].name}) [Dist: {edge.distance}km, Risk: {int(edge.hazardRisk * 100)}%].",
                    highlightedNodeIds=[edge.source, edge.target],
                    highlightedEdgeIds=list(mst_edge_ids)
                ))

            if len(mst_edge_ids) == len(node_ids) - 1:
                break

    edge_attrs: Dict[str, Dict[str, Any]] = {eid: {'isMstEdge': True} for eid in mst_edge_ids}
    elapsed = (time.perf_counter() - start_time) * 1000

    spanning_pct = int((len(mst_edge_ids) / max(len(node_ids) - 1, 1)) * 100)

    return AlgorithmExecutionResult(
        algorithmName="Kruskal's Emergency Communication & Logistics MST (Python)",
        executionTimeMs=round(elapsed, 2),
        summary=f"Constructed emergency logistics backbone spanning {len(mst_edge_ids) + 1} vertices across {total_dist:.1f} km.",
        steps=steps,
        edgeAttributes=edge_attrs,
        customMetrics={
            'Backbone Road Segments': len(mst_edge_ids),
            'Total Backbone Length': f"{total_dist:.1f} km",
            'Spanning Completeness': f"{spanning_pct}%",
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )

def run_prim_emergency_backbone(graph: GraphData, start_node_id: Optional[str] = None) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    node_ids = list(graph.nodes.keys())
    root = start_node_id if start_node_id and start_node_id in graph.nodes else (node_ids[0] if node_ids else '')
    in_mst: Set[str] = {root} if root else set()
    mst_edge_ids: List[str] = []
    steps: List[AlgorithmStep] = []
    total_dist = 0.0

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Prim's algorithm initialized from root vertex '{graph.nodes[root].name if root else 'N/A'}'.",
        highlightedNodeIds=[root] if root else [],
        highlightedEdgeIds=[]
    ))

    while len(in_mst) < len(node_ids):
        best_edge = None
        best_cand = None
        min_cost = float('inf')

        for u in in_mst:
            for edge_id in graph.adjacencyList.get(u, []):
                edge = graph.edges.get(edge_id)
                if not edge or edge.isBlocked or edge.hazardRisk >= 0.9:
                    continue
                v = edge.target if edge.source == u else edge.source
                if v not in in_mst:
                    cost = edge.distance * (1.0 + edge.hazardRisk * 4.0)
                    if cost < min_cost:
                        min_cost = cost
                        best_edge = edge
                        best_cand = v

        if not best_edge or not best_cand:
            break

        in_mst.add(best_cand)
        mst_edge_ids.append(best_edge.id)
        total_dist += best_edge.distance

        if len(steps) < 40:
            steps.append(AlgorithmStep(
                stepIndex=len(steps),
                description=f"Prim's expanded frontier to connect '{graph.nodes[best_cand].name}' via minimal-risk corridor.",
                highlightedNodeIds=[best_cand],
                highlightedEdgeIds=list(mst_edge_ids)
            ))

    edge_attrs: Dict[str, Dict[str, Any]] = {eid: {'isMstEdge': True} for eid in mst_edge_ids}
    elapsed = (time.perf_counter() - start_time) * 1000

    return AlgorithmExecutionResult(
        algorithmName="Prim's Minimum Spanning Tree Backbone (Python)",
        executionTimeMs=round(elapsed, 2),
        summary=f"Prim's algorithm established connected logistics backbone connecting {len(in_mst)} vertices ({total_dist:.1f} km).",
        steps=steps,
        edgeAttributes=edge_attrs,
        customMetrics={
            'Connected Vertices': len(in_mst),
            'Backbone Road Length': f"{total_dist:.1f} km",
            'Total Spanning Links': len(mst_edge_ids),
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )
