import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_backend_suite():
    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    print("[OK] Health check OK:", data["service"])

    # Sample Graph
    sample_graph = {
        "nodes": {
            "node_1": {"id": "node_1", "name": "Aluva Junction", "lat": 10.1076, "lng": 76.3516, "type": "residential", "population": 4500, "hazardRisk": 0.3},
            "node_2": {"id": "node_2", "name": "Periyar Bridge North", "lat": 10.1150, "lng": 76.3550, "type": "intersection", "population": 1200, "hazardRisk": 0.5},
            "node_3": {"id": "node_3", "name": "UC College High Ground Relief Shelter", "lat": 10.1280, "lng": 76.3420, "type": "shelter", "population": 800, "capacity": 5000, "hazardRisk": 0.05}
        },
        "edges": {
            "edge_1": {"id": "edge_1", "source": "node_1", "target": "node_2", "distance": 2.1, "baseSpeed": 45, "capacity": 1500, "currentFlow": 0, "roadType": "arterial", "lanes": 2, "elevationSlope": 1, "hazardRisk": 0.35, "predictedRisk": 0.4, "isBlocked": False, "trafficDensity": 0.2},
            "edge_2": {"id": "edge_2", "source": "node_2", "target": "node_3", "distance": 2.8, "baseSpeed": 50, "capacity": 1800, "currentFlow": 0, "roadType": "highway", "lanes": 4, "elevationSlope": 0, "hazardRisk": 0.1, "predictedRisk": 0.1, "isBlocked": False, "trafficDensity": 0.1}
        },
        "adjacencyList": {
            "node_1": ["edge_1"],
            "node_2": ["edge_1", "edge_2"],
            "node_3": ["edge_2"]
        }
    }

    # 2. Dijkstra
    res_dijkstra = client.post("/api/algorithms/execute", json={
        "algorithm_id": "dijkstra_safe",
        "graph": sample_graph,
        "start_node_id": "node_1",
        "target_node_id": "node_3"
    })
    assert res_dijkstra.status_code == 200
    d_data = res_dijkstra.json()
    assert d_data["route"] is not None
    assert len(d_data["route"]["pathNodeIds"]) == 3
    print("[OK] Dijkstra Safe Path OK: Travel time =", d_data["route"]["estimatedTimeMin"], "min, Score =", d_data["route"]["safetyScore"])

    # 3. A*
    res_astar = client.post("/api/algorithms/execute", json={
        "algorithm_id": "astar_safe",
        "graph": sample_graph,
        "start_node_id": "node_1",
        "target_node_id": "node_3"
    })
    assert res_astar.status_code == 200
    a_data = res_astar.json()
    assert a_data["route"] is not None
    print("[OK] A* Safe Path OK: Route length =", a_data["route"]["totalDistanceKm"], "km")

    # 4. Tarjan Resilience
    res_tarjan = client.post("/api/algorithms/execute", json={
        "algorithm_id": "tarjan_bridges",
        "graph": sample_graph
    })
    assert res_tarjan.status_code == 200
    t_data = res_tarjan.json()
    print("[OK] Tarjan Resilience OK:", t_data["execution"]["summary"])

    # 5. Kruskal & Prim MST
    res_kruskal = client.post("/api/algorithms/execute", json={
        "algorithm_id": "kruskal_mst",
        "graph": sample_graph
    })
    assert res_kruskal.status_code == 200
    print("[OK] Kruskal MST OK:", res_kruskal.json()["execution"]["summary"])

    res_prim = client.post("/api/algorithms/execute", json={
        "algorithm_id": "prim_mst",
        "graph": sample_graph
    })
    assert res_prim.status_code == 200
    print("[OK] Prim MST OK:", res_prim.json()["execution"]["summary"])

    # 6. Dinic Max-Flow
    res_flow = client.post("/api/algorithms/execute", json={
        "algorithm_id": "dinic_maxflow",
        "graph": sample_graph
    })
    assert res_flow.status_code == 200
    print("[OK] Dinic Max-Flow OK:", res_flow.json()["execution"]["summary"])

    # 7. CVRP
    res_cvrp = client.post("/api/algorithms/execute", json={
        "algorithm_id": "cvrp_rescue",
        "graph": sample_graph,
        "num_vehicles": 2
    })
    assert res_cvrp.status_code == 200
    print("[OK] Capacitated VRP OK:", res_cvrp.json()["execution"]["summary"])

    print("\nAll Python algorithm backend tests passed with flying colors!")

if __name__ == "__main__":
    test_backend_suite()
