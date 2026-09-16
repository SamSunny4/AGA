import time
from collections import deque
from typing import Dict, List, Set, Any, Optional
from ..models.graph import GraphData
from ..models.algorithm_results import AlgorithmExecutionResult, AlgorithmStep

class FlowEdge:
    def __init__(self, u: str, v: str, cap: float, orig_edge_id: str):
        self.u = u
        self.v = v
        self.cap = cap
        self.flow = 0.0
        self.orig_edge_id = orig_edge_id
        self.rev_index = -1

def run_dinic_max_evacuation_flow(
    graph: GraphData,
    source_node_ids: Optional[List[str]] = None,
    sink_node_ids: Optional[List[str]] = None
) -> AlgorithmExecutionResult:
    start_time = time.perf_counter()
    steps: List[AlgorithmStep] = []

    sources = source_node_ids if source_node_ids else [
        nid for nid, n in graph.nodes.items() if n.hazardRisk > 0.4 or n.type == 'residential'
    ]
    sinks = sink_node_ids if sink_node_ids else [
        nid for nid, n in graph.nodes.items() if n.type in ('shelter', 'hospital')
    ]

    super_source = '__SUPER_SOURCE__'
    super_sink = '__SUPER_SINK__'
    all_nodes = [super_source, super_sink] + list(graph.nodes.keys())

    adj: Dict[str, List[FlowEdge]] = {nid: [] for nid in all_nodes}

    def add_edge(u: str, v: str, cap: float, edge_id: str):
        fwd = FlowEdge(u, v, cap, edge_id)
        bwd = FlowEdge(v, u, 0.0, edge_id)
        fwd.rev_index = len(adj[v])
        bwd.rev_index = len(adj[u])
        adj[u].append(fwd)
        adj[v].append(bwd)

    # Super-source to risk nodes
    for s_id in sources:
        node = graph.nodes.get(s_id)
        pop = max(node.population, 500) if node else 1000
        add_edge(super_source, s_id, float(pop), f"src_{s_id}")

    # Sinks to super-sink
    for t_id in sinks:
        node = graph.nodes.get(t_id)
        cap = float(node.capacity) if node and node.capacity else 3000.0
        add_edge(t_id, super_sink, cap, f"sink_{t_id}")

    # Graph network edges
    for edge in graph.edges.values():
        if edge.isBlocked or edge.hazardRisk >= 0.9:
            continue
        eff_cap = round(edge.capacity * (1.0 - edge.hazardRisk * 0.7))
        add_edge(edge.source, edge.target, float(eff_cap), edge.id)
        add_edge(edge.target, edge.source, float(eff_cap), edge.id)

    steps.append(AlgorithmStep(
        stepIndex=0,
        description=f"Residual network constructed with Super-Source feeding {len(sources)} hazard zones and Super-Sink draining to {len(sinks)} evacuation sanctuaries.",
        highlightedNodeIds=sources[:4] + sinks[:4],
        highlightedEdgeIds=[]
    ))

    level: Dict[str, int] = {}
    ptr: Dict[str, int] = {}

    def bfs_level() -> bool:
        for nid in all_nodes:
            level[nid] = -1
        level[super_source] = 0
        q = deque([super_source])
        while q:
            u = q.popleft()
            for edge in adj[u]:
                if edge.cap - edge.flow > 0 and level[edge.v] == -1:
                    level[edge.v] = level[u] + 1
                    q.append(edge.v)
        return level[super_sink] != -1

    def dfs_block(u: str, pushed: float) -> float:
        if pushed == 0 or u == super_sink:
            return pushed
        for cid in range(ptr[u], len(adj[u])):
            ptr[u] = cid
            edge = adj[u][cid]
            tr = edge.v
            if level[u] + 1 != level[tr] or edge.cap - edge.flow == 0:
                continue
            tr_pushed = dfs_block(tr, min(pushed, edge.cap - edge.flow))
            if tr_pushed == 0:
                continue
            edge.flow += tr_pushed
            adj[tr][edge.rev_index].flow -= tr_pushed
            return tr_pushed
        return 0.0

    total_max_flow = 0.0
    phase = 0
    while bfs_level():
        phase += 1
        for nid in all_nodes:
            ptr[nid] = 0
        while True:
            pushed = dfs_block(super_source, float('inf'))
            if pushed <= 0:
                break
            total_max_flow += pushed

        if len(steps) < 25:
            steps.append(AlgorithmStep(
                stepIndex=len(steps),
                description=f"Dinic Phase #{phase}: Level graph augmented. Evacuation throughput reached {int(total_max_flow):,} people/hr.",
                highlightedNodeIds=sources[:4],
                highlightedEdgeIds=[]
            ))

    # Min-Cut detection
    reachable_in_residual = set()
    cut_q = deque([super_source])
    reachable_in_residual.add(super_source)

    while cut_q:
        u = cut_q.popleft()
        for edge in adj[u]:
            if edge.cap - edge.flow > 0 and edge.v not in reachable_in_residual:
                reachable_in_residual.add(edge.v)
                cut_q.append(edge.v)

    min_cut_edges: Set[str] = set()
    edge_flow_attrs: Dict[str, Dict[str, Any]] = {}

    for edge in graph.edges.values():
        u_reach = edge.source in reachable_in_residual
        v_reach = edge.target in reachable_in_residual
        if (u_reach and not v_reach) or (not u_reach and v_reach):
            min_cut_edges.add(edge.id)
            edge_flow_attrs[edge.id] = {'currentFlow': edge.capacity, 'isMinCut': True}

    steps.append(AlgorithmStep(
        stepIndex=len(steps),
        description=f"Max-Flow Min-Cut Theorem applied: Identified {len(min_cut_edges)} saturated bottleneck roads throttling evacuation throughput.",
        highlightedNodeIds=[],
        highlightedEdgeIds=list(min_cut_edges)
    ))

    elapsed = (time.perf_counter() - start_time) * 1000

    return AlgorithmExecutionResult(
        algorithmName="Dinic's Maximum Evacuation Flow & Min-Cut Bottlenecks (Python)",
        executionTimeMs=round(elapsed, 2),
        summary=f"Max Evacuation Throughput: {int(total_max_flow):,} evacuees/hour. Saturated Min-Cut Bottlenecks: {len(min_cut_edges)} arterial segments.",
        steps=steps,
        edgeAttributes=edge_flow_attrs,
        customMetrics={
            'Max Evacuation Throughput': f"{int(total_max_flow):,} people/hr",
            'Bottleneck Cut Roads': len(min_cut_edges),
            'Active Hazard Sources': len(sources),
            'Designated Shelters': len(sinks),
            'Execution Speed': f"{round(elapsed, 2)} ms"
        }
    )
