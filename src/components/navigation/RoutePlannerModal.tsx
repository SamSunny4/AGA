import React, { useState } from 'react';
import { X, Navigation, ShieldCheck, AlertTriangle, ArrowRight, Clock, MapPin, Gauge, CheckCircle2 } from 'lucide-react';
import { GraphData, RouteResult } from '../../types/graph';
import { runDijkstraSafePath, runAStarSafePath } from '../../algorithms/shortestPath';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: GraphData;
  onApplyRoute: (route: RouteResult, isAiSafe: boolean) => void;
  defaultOriginId?: string;
  defaultTargetId?: string;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  isOpen,
  onClose,
  graph,
  onApplyRoute,
  defaultOriginId,
  defaultTargetId
}) => {
  const nodes = Object.values(graph.nodes);
  const shelters = nodes.filter(n => n.type === 'shelter' || n.type === 'hospital' || n.type === 'depot');

  const [originId, setOriginId] = useState<string>(defaultOriginId || nodes[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(defaultTargetId || shelters[0]?.id || nodes[1]?.id || '');
  const [routingAlgo, setRoutingAlgo] = useState<'dijkstra' | 'astar'>('dijkstra');

  if (!isOpen) return null;

  // Compute Standard Shortest vs AI Safe
  const standardExecution = originId && targetId ? runDijkstraSafePath(graph, originId, targetId, false) : null;
  const safeExecution = originId && targetId
    ? (routingAlgo === 'astar' ? runAStarSafePath(graph, originId, targetId) : runDijkstraSafePath(graph, originId, targetId, true))
    : null;

  const standardRoute = standardExecution?.route || null;
  const safeRoute = safeExecution?.route || null;

  const originNode = graph.nodes[originId];
  const targetNode = graph.nodes[targetId];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col border border-sky-500/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Kerala Emergency Escape Route Planner
                <span className="badge badge-emerald text-[0.6rem]">AI Graph Guided</span>
              </h2>
              <p className="text-xs text-slate-400">
                Compare Naive Shortest Distance vs PlanEsc AI Hazard-Avoidance Evacuation Path
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setRoutingAlgo('dijkstra')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  routingAlgo === 'dijkstra'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dijkstra
              </button>
              <button
                onClick={() => setRoutingAlgo('astar')}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  routingAlgo === 'astar'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A* Heuristic
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-slate-800/80 bg-slate-900/50">
          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Evacuation Starting Point (Distress Area)
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.type.toUpperCase()}) {n.isDistressActive ? '— 🆘 SOS' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Destination Safe Sanctuary / Hospital
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Cap: {s.capacity ? `${s.currentOccupancy || 0}/${s.capacity}` : 'High'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Comparison Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Naive Route */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              standardRoute?.safetyScore && standardRoute.safetyScore >= 70
                ? 'bg-slate-900/40 border-slate-800'
                : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Naive Shortest Distance</span>
                  <span className="badge badge-warning text-[0.65rem]">Standard Dijkstra</span>
                </div>

                {standardRoute ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" /> Total Distance
                      </span>
                      <span className="font-mono font-bold text-slate-200">{standardRoute.totalDistanceKm.toFixed(1)} km</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Estimated Travel Time
                      </span>
                      <span className="font-mono font-bold text-slate-200">{standardRoute.estimatedTimeMin.toFixed(0)} mins</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Cumulative Hazard Risk
                      </span>
                      <span className={`font-mono font-bold ${
                        standardRoute.hazardExposureRisk > 0.4 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {(standardRoute.hazardExposureRisk * 100).toFixed(0)}%
                      </span>
                    </div>

                    {standardRoute.hazardExposureRisk > 0.4 && (
                      <div className="p-2.5 rounded-lg bg-rose-900/30 border border-rose-500/40 text-[0.72rem] text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <b>DANGER: High Risk Route!</b> This naive path traverses severely flooded or landslide-prone road corridors.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 py-4 text-center">No passable standard route available.</div>
                )}
              </div>

              {standardRoute && (
                <button
                  onClick={() => {
                    onApplyRoute(standardRoute, false);
                    onClose();
                  }}
                  className="mt-4 w-full btn-secondary text-xs py-2"
                >
                  Apply Naive Route to Map
                </button>
              )}
            </div>

            {/* PlanEsc AI Hazard-Aware Route */}
            <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/50 flex flex-col justify-between shadow-lg shadow-emerald-950/30">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    PlanEsc AI Dynamic Safe Route
                  </span>
                  <span className="badge badge-safe text-[0.65rem]">AI Multi-Criteria</span>
                </div>

                {safeRoute ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" /> Total Distance
                      </span>
                      <span className="font-mono font-bold text-slate-200">{safeRoute.totalDistanceKm.toFixed(1)} km</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Estimated Travel Time
                      </span>
                      <span className="font-mono font-bold text-emerald-300">{safeRoute.estimatedTimeMin.toFixed(0)} mins</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Safety Score
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {safeRoute.safetyScore.toFixed(0)} / 100 (Risk: {(safeRoute.hazardExposureRisk * 100).toFixed(0)}%)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-900/30 border border-emerald-500/40 text-[0.72rem] text-emerald-200 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <b>AI VERIFIED ESCAPE PATH:</b> Bypasses submerged bridges and active debris flow zones via reinforced relief corridors.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-400 py-4 text-center">No safe AI escape route found. Air evacuation required.</div>
                )}
              </div>

              {safeRoute && (
                <button
                  onClick={() => {
                    onApplyRoute(safeRoute, true);
                    onClose();
                  }}
                  className="mt-4 w-full btn-primary text-xs py-2 bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400/50 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                  Deploy AI Safe Route to Map <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Node Waypoints Overview */}
          {safeRoute && safeRoute.pathNodeIds.length > 0 && (
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-sky-400 block mb-1">Waypoints Along AI Safe Corridor:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[0.72rem]">
                {safeRoute.pathNodeIds.map((id: string, idx: number) => (
                  <React.Fragment key={id}>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                      {graph.nodes[id]?.name || id}
                    </span>
                    {idx < safeRoute.pathNodeIds.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
