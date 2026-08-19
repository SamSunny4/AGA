import React, { useState } from 'react';
import { X, Navigation, ShieldCheck, AlertTriangle, ArrowRight, Clock, MapPin, Gauge } from 'lucide-react';
import { GraphData, RouteResult } from '../../types/graph';
import { runDijkstraSafePath } from '../../algorithms/shortestPath';

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

  if (!isOpen) return null;

  // Compute both Standard Shortest and AI Safe routes for comparison
  const standardResult = originId && targetId ? runDijkstraSafePath(graph, originId, targetId, false) : null;
  const safeResult = originId && targetId ? runDijkstraSafePath(graph, originId, targetId, true) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col border border-sky-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Dynamic Emergency Safe Route Planner</h2>
              <p className="text-xs text-slate-400">Compare Naive Standard Shortest Path vs PlanEsc AI Hazard-Aware Route</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-slate-800/80 bg-slate-900/40">
          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Evacuation Starting Point (Danger Zone)
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-400"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.type.toUpperCase()}) — Risk: {(n.hazardRisk * 100).toFixed(0)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Destination Safe Shelter / Hospital
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-400"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.type.toUpperCase()}) — Elev: {n.elevation}m
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Side-by-Side Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
          {/* Card 1: Naive Standard Shortest Route */}
          <div className="glass-card-sm p-3.5 flex flex-col justify-between border-rose-900/40 bg-rose-950/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge badge-danger text-[0.65rem]">Standard Navigation</span>
                <span className="text-[0.65rem] text-slate-400 font-mono">Naive Dijkstra</span>
              </div>
              <h3 className="text-xs font-bold text-rose-300">Shortest Distance (Hazard Blind)</h3>
              <p className="text-[0.72rem] text-slate-400">
                Ignores real-time flood depth, fire perimeter, and predicted road collapses; routes directly through active disaster hazard zones.
              </p>

              {standardResult?.route ? (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-1 text-center font-mono">
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <div className="text-[0.6rem] text-slate-400">DISTANCE</div>
                      <div className="text-xs font-bold text-slate-200">{standardResult.route.totalDistanceKm} km</div>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <div className="text-[0.6rem] text-slate-400">EST. TIME</div>
                      <div className="text-xs font-bold text-slate-200">{standardResult.route.estimatedTimeMin} min</div>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <div className="text-[0.6rem] text-slate-400">SAFETY</div>
                      <div className="text-xs font-bold text-rose-400">{standardResult.route.safetyScore}/100</div>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-[0.7rem] text-rose-200 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>
                      High Risk: Route crosses {standardResult.route.bottlenecks.length} critical hazard sectors. Peak hazard exposure: {Math.round(standardResult.route.hazardExposureRisk * 100)}%.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-rose-400">Route completely blocked by impassable debris.</div>
              )}
            </div>

            {standardResult?.route && (
              <button
                onClick={() => {
                  onApplyRoute(standardResult.route!, false);
                  onClose();
                }}
                className="mt-3 w-full btn-secondary text-xs py-1.5"
              >
                Inspect Standard Route
              </button>
            )}
          </div>

          {/* Card 2: PlanEsc AI Dynamic Safe Route */}
          <div className="glass-panel p-3.5 flex flex-col justify-between border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge badge-safe text-[0.65rem]">PlanEsc AI Dynamic</span>
                <span className="text-[0.65rem] text-emerald-400 font-mono font-bold">RECOMMENDED</span>
              </div>
              <h3 className="text-xs font-bold text-emerald-300">AI Risk-Weighted Safe Corridor</h3>
              <p className="text-[0.72rem] text-slate-300">
                Dynamically routes around expanding hazard perimeters, steep mudslide gradients, and predictive bridge failure choke points.
              </p>

              {safeResult?.route ? (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-1 text-center font-mono">
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <div className="text-[0.6rem] text-slate-400">DISTANCE</div>
                      <div className="text-xs font-bold text-slate-200">{safeResult.route.totalDistanceKm} km</div>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <div className="text-[0.6rem] text-slate-400">EST. TIME</div>
                      <div className="text-xs font-bold text-emerald-300">{safeResult.route.estimatedTimeMin} min</div>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <div className="text-[0.6rem] text-slate-400">SAFETY</div>
                      <div className="text-xs font-bold text-emerald-400">{safeResult.route.safetyScore}/100</div>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-[0.7rem] text-emerald-200 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Guaranteed High Safety: Path avoids lethal flood/fire zones with maximum safety score of {safeResult.route.safetyScore}/100.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-amber-400">
                  All viable escape paths severed. Airborne or amphibious rescue required.
                </div>
              )}
            </div>

            {safeResult?.route && (
              <button
                onClick={() => {
                  onApplyRoute(safeResult.route!, true);
                  onClose();
                }}
                className="mt-3 w-full btn-primary text-xs py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400"
              >
                Apply AI Safe Escape Path
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
