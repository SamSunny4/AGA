import React from 'react';
import {
  Compass,
  GitBranch,
  Network,
  Share2,
  Cpu,
  Layers,
  Users,
  MapPin,
  Truck,
  Activity,
  CheckCircle2
} from 'lucide-react';

export interface AlgorithmOption {
  id: string;
  name: string;
  category: 'Routing' | 'Resilience' | 'Flow & Allocation' | 'Planning & Logistics';
  description: string;
  icon: React.ReactNode;
  complexity: string;
}

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  {
    id: 'dijkstra_safe',
    name: 'Dynamic Safe Dijkstra',
    category: 'Routing',
    description: 'Computes lowest-risk evacuation route avoiding expanding disaster perimeters.',
    icon: <Compass className="w-4 h-4 text-sky-400" />,
    complexity: 'O((V + E) log V)'
  },
  {
    id: 'astar_safe',
    name: 'A* Heuristic Safe Path',
    category: 'Routing',
    description: 'Fast goal-directed heuristic safe path with Euclidean distance bounds.',
    icon: <Compass className="w-4 h-4 text-emerald-400" />,
    complexity: 'O(E)'
  },
  {
    id: 'bfs_reachability',
    name: 'BFS Accessible Reachability',
    category: 'Resilience',
    description: 'Traverses accessible safe zones and isolates cut-off residential communities.',
    icon: <GitBranch className="w-4 h-4 text-cyan-400" />,
    complexity: 'O(V + E)'
  },
  {
    id: 'dfs_components',
    name: 'DFS Connected Components',
    category: 'Resilience',
    description: 'Identifies isolated island clusters created by severe road collapses.',
    icon: <GitBranch className="w-4 h-4 text-amber-400" />,
    complexity: 'O(V + E)'
  },
  {
    id: 'tarjan_bridges',
    name: "Tarjan's Critical Bridges",
    category: 'Resilience',
    description: 'Identifies single points of failure (cut-edges and articulation junctions).',
    icon: <Network className="w-4 h-4 text-rose-400" />,
    complexity: 'O(V + E)'
  },
  {
    id: 'kruskal_mst',
    name: "Kruskal's Emergency Backbone (MST)",
    category: 'Resilience',
    description: 'Creates minimal-risk connected communications and supply corridor.',
    icon: <Share2 className="w-4 h-4 text-purple-400" />,
    complexity: 'O(E log E)'
  },
  {
    id: 'prim_mst',
    name: "Prim's Frontier Spanning Tree (MST)",
    category: 'Resilience',
    description: 'Expands connected logistics tree from relief depot along lowest hazard edges.',
    icon: <Share2 className="w-4 h-4 text-violet-400" />,
    complexity: 'O((V + E) log V)'
  },
  {
    id: 'floyd_warshall',
    name: 'Floyd-Warshall All-Pairs Matrix',
    category: 'Routing',
    description: 'Computes complete dynamic safe distance matrix between all shelters and hubs.',
    icon: <Activity className="w-4 h-4 text-sky-400" />,
    complexity: 'O(V³)'
  },
  {
    id: 'dinic_maxflow',
    name: "Dinic's Max-Flow & Min-Cut",
    category: 'Flow & Allocation',
    description: 'Calculates max evacuees/hour and isolates saturated bottleneck arteries.',
    icon: <Cpu className="w-4 h-4 text-teal-400" />,
    complexity: 'O(V² E)'
  },
  {
    id: 'bipartite_matching',
    name: 'Priority Bipartite Rescue Match',
    category: 'Flow & Allocation',
    description: 'Dispatches specialized emergency teams to critical P1/P2/P3 distress calls.',
    icon: <Users className="w-4 h-4 text-orange-400" />,
    complexity: 'O(V · E)'
  },
  {
    id: 'shelter_allocation',
    name: 'Capacity-Constrained Shelter Match',
    category: 'Flow & Allocation',
    description: 'Assigns endangered populations to shelters without exceeding maximum capacities.',
    icon: <Users className="w-4 h-4 text-blue-400" />,
    complexity: 'O(V²)'
  },
  {
    id: 'vertex_coloring',
    name: 'Welsh-Powell Phased Waves',
    category: 'Planning & Logistics',
    description: 'Colors conflict graph to stagger evacuation time slots, preventing gridlock.',
    icon: <Layers className="w-4 h-4 text-pink-400" />,
    complexity: 'O(V²)'
  },
  {
    id: 'dominating_set',
    name: 'Minimum Dominating Set (Hubs)',
    category: 'Planning & Logistics',
    description: 'Positions minimum relief hubs / siren towers covering 100% of population.',
    icon: <MapPin className="w-4 h-4 text-yellow-400" />,
    complexity: 'O(V²)'
  },
  {
    id: 'tsp_rescue',
    name: 'TSP 2-Opt Multi-Stop Tour',
    category: 'Planning & Logistics',
    description: 'Optimizes multi-stop ambulance and supply delivery routes through distress sites.',
    icon: <Truck className="w-4 h-4 text-green-400" />,
    complexity: 'O(N²)'
  },
  {
    id: 'cvrp_rescue',
    name: 'Capacitated VRP Fleet Dispatch',
    category: 'Planning & Logistics',
    description: 'Optimizes multi-vehicle convoy fleet routes with capacity constraints for evacuees.',
    icon: <Truck className="w-4 h-4 text-teal-400" />,
    complexity: 'O(K · N²)'
  },
  {
    id: 'bellman_ford',
    name: 'Bellman-Ford Stability Check',
    category: 'Routing',
    description: 'Validates edge relaxation convergence and verifies absence of hazard cycles.',
    icon: <Activity className="w-4 h-4 text-indigo-400" />,
    complexity: 'O(V · E)'
  }
];

interface AlgorithmSelectorProps {
  selectedAlgorithmId: string | null;
  onSelectAlgorithm: (id: string) => void;
  isRunning?: boolean;
}

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithmId,
  onSelectAlgorithm,
  isRunning
}) => {
  const categories: AlgorithmOption['category'][] = [
    'Routing',
    'Resilience',
    'Flow & Allocation',
    'Planning & Logistics'
  ];

  return (
    <div className="glass-panel p-4 flex flex-col gap-3.5 border border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            Advanced Graph Algorithms Suite
          </h2>
          <p className="text-xs text-slate-400">
            Select an algorithm to execute on the dynamic disaster transportation graph.
          </p>
        </div>
        <span className="badge badge-primary text-[0.65rem]">{ALGORITHM_OPTIONS.length} Algorithms</span>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat} className="space-y-1.5">
            <div className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-400 px-1">
              {cat}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ALGORITHM_OPTIONS.filter((a) => a.category === cat).map((algo) => {
                const isSelected = selectedAlgorithmId === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => onSelectAlgorithm(algo.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {algo.icon}
                        <span className={`text-xs font-bold ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                          {algo.name}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                    </div>

                    <p className="text-[0.7rem] text-slate-400 line-clamp-2 leading-relaxed">
                      {algo.description}
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-800/80 text-[0.65rem] font-mono text-slate-400">
                      <span className="shrink-0 text-slate-500">Complexity:</span>
                      <span className="text-sky-400 font-semibold whitespace-nowrap">{algo.complexity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
