import React from 'react';
import { ShieldAlert, Activity, Navigation, Radio, Play, Pause, RefreshCw, Layers } from 'lucide-react';
import { SCENARIO_PRESETS } from '../../data/defaultGraph';
import { ScenarioPreset } from '../../types/simulation';

interface HeaderProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenarioId: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeHours: number;
  onReset: () => void;
  onOpenRoutePlanner: () => void;
  activeHazardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  isPlaying,
  onTogglePlay,
  timeHours,
  onReset,
  onOpenRoutePlanner,
  activeHazardsCount
}) => {
  const formatTime = (hours: number) => {
    const totalMin = Math.floor(hours * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `T+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <header className="w-full px-5 py-3 glass-panel flex flex-wrap items-center justify-between gap-4 z-30 sticky top-0 border-b border-slate-800/80">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <ShieldAlert className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              PlanEsc
            </h1>
            <span className="badge badge-primary text-[0.65rem] tracking-wider">AI Graph Engine</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            AI-Driven Dynamic Disaster Evacuation & Graph Analytics
          </p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
        <Layers className="w-4 h-4 text-sky-400" />
        <span className="text-xs text-slate-400 font-medium">Scenario:</span>
        <select
          value={currentScenario.id}
          onChange={(e) => onSelectScenario(e.target.value)}
          className="bg-transparent text-xs text-slate-100 font-semibold focus:outline-none cursor-pointer pr-2"
        >
          {Object.values(SCENARIO_PRESETS).map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Live Disaster Clock & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="text-xs text-slate-400">Simulation Clock:</span>
          <span className="font-mono text-sm font-bold text-sky-300">{formatTime(timeHours)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-danger flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {activeHazardsCount} Active Hazard Zones
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={isPlaying ? "btn-danger text-xs py-1.5 px-3" : "btn-primary text-xs py-1.5 px-3"}
          title={isPlaying ? "Pause Simulation" : "Start Simulation"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Live Sim'}
        </button>

        <button
          onClick={onReset}
          className="btn-secondary text-xs py-1.5 px-2.5"
          title="Reset Simulation Clock & Hazards"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenRoutePlanner}
          className="btn-primary text-xs py-1.5 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400/40"
        >
          <Navigation className="w-4 h-4" />
          Safe Escape Route
        </button>
      </div>
    </header>
  );
};
