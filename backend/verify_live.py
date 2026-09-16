import urllib.request
import json

sample_graph = {
    'nodes': {
        'n1': {'id': 'n1', 'name': 'Aluva', 'lat': 10.1, 'lng': 76.3, 'type': 'residential', 'population': 1000, 'hazardRisk': 0.2},
        'n2': {'id': 'n2', 'name': 'UC College', 'lat': 10.12, 'lng': 76.34, 'type': 'shelter', 'population': 500, 'capacity': 4000, 'hazardRisk': 0.05}
    },
    'edges': {
        'e1': {'id': 'e1', 'source': 'n1', 'target': 'n2', 'distance': 3.5, 'baseSpeed': 50, 'capacity': 2000, 'currentFlow': 0, 'roadType': 'highway', 'lanes': 4, 'elevationSlope': 0, 'hazardRisk': 0.1, 'predictedRisk': 0.1, 'isBlocked': False, 'trafficDensity': 0.1}
    },
    'adjacencyList': {'n1': ['e1'], 'n2': ['e1']}
}

algos = [
    'dijkstra_safe', 'astar_safe', 'bellman_ford', 'floyd_warshall',
    'bfs_reachability', 'dfs_components', 'tarjan_bridges',
    'kruskal_mst', 'prim_mst', 'dinic_maxflow',
    'shelter_allocation', 'vertex_coloring', 'dominating_set',
    'tsp_rescue', 'cvrp_rescue'
]

passed = 0
for a in algos:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/algorithms/execute',
        data=json.dumps({'algorithm_id': a, 'graph': sample_graph}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        if res.status == 200:
            data = json.loads(res.read().decode('utf-8'))
            name = data['execution']['algorithmName']
            print(f"[OK] {a:<20} -> {name}")
            passed += 1

print(f"\nResult: {passed}/{len(algos)} algorithms successfully executed on live Python backend!")
