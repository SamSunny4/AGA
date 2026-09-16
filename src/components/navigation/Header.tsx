import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Navigation, Play, Pause, RefreshCw, Layers, CloudRain, PhoneCall, Zap, Server } from 'lucide-react';
import { SCENARIO_PRESETS } from '../../data/defaultGraph';
import { ScenarioPreset } from '../../types/simulation';
import { fetchLiveKeralaWeather, KeralaWeatherData, KERALA_EMERGENCY_HOTLINES } from '../../ai/keralaLiveApi';
import { checkBackendHealth } from '../../api/backendClient';

interface HeaderProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenarioId: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  timeHours: number;
  onReset: () => void;
  onOpenRoutePlanner: () => void;
  activeHazardsCount: number;
  backendOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  isPlaying,
  onTogglePlay,
  timeHours,
  onReset,
  onOpenRoutePlanner,
  activeHazardsCount,
  backendOnline
}) => {
  const [liveWeather, setLiveWeather] = useState<KeralaWeatherData | null>(null);
  const [showHotlines, setShowHotlines] = useState<boolean>(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(backendOnline ?? false);

  useEffect(() => {
    let isMounted = true;
    const updateBackendStatus = () => {
      checkBackendHealth().then(res => {
        if (isMounted) setIsBackendOnline(res.isOnline);
      });
    };
    updateBackendStatus();
    const interval = setInterval(updateBackendStatus, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchLiveKeralaWeather(currentScenario.centerLat, currentScenario.centerLng, currentScenario.name.split(':')[0])
      .then(data => {
        if (isMounted) setLiveWeather(data);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetchLiveKeralaWeather(currentScenario.centerLat, currentScenario.centerLng, currentScenario.name.split(':')[0])
        .then(data => {
          if (isMounted) setLiveWeather(data);
        })
        .catch(() => {});
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentScenario.centerLat, currentScenario.centerLng, currentScenario.name]);

  const formatTime = (hours: number) => {
    const totalMin = Math.floor(hours * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `T+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <header className="w-full px-4 py-2.5 glass-panel flex flex-wrap items-center justify-between gap-3 z-30 sticky top-0 border-b border-slate-800/80">
      {/* Brand & Kerala Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
          <ShieldAlert className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300 bg-clip-text text-transparent">
              PlanEsc Kerala
            </h1>
            <span className="badge badge-emerald text-[0.65rem] tracking-wider">KSDMA AI Engine</span>
          </div>
          <p className="text-[0.72rem] text-slate-400 font-medium flex items-center gap-1.5">
            <span className="text-emerald-400/90 font-semibold">Disaster Response AI</span>
            <span>•</span>
            <span>Real-Time Graph Evacuation & Telemetry</span>
          </p>
        </div>
      </div>

      {/* Live Kerala Scenario Selector */}
      <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
        <Layers className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-slate-400 font-medium">Scenario:</span>
        <select
          value={currentScenario.id}
          onChange={(e) => onSelectScenario(e.target.value)}
          className="bg-transparent text-xs text-slate-100 font-semibold focus:outline-none cursor-pointer pr-2 max-w-[240px] truncate"
        >
          {Object.values(SCENARIO_PRESETS).map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Live Kerala Weather & Telemetry Feed */}
      <div className="flex items-center gap-2.5">
        {liveWeather && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <CloudRain className="w-4 h-4 text-sky-400 animate-pulse" />
            <div className="text-[0.7rem] leading-tight">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <span>{liveWeather.temperature.toFixed(1)}°C</span>
                <span className="text-sky-300">({liveWeather.precipitationMm.toFixed(1)} mm rain)</span>
              </div>
              <div className="text-[0.65rem] text-amber-400 font-semibold truncate max-w-[170px]">
                {liveWeather.alertMessage.split(':')[0]}
              </div>
            </div>
          </div>
        )}

        {/* Live Clock */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-xs text-slate-400">Clock:</span>
          <span className="font-mono text-xs font-bold text-sky-300">{formatTime(timeHours)}</span>
        </div>

        {/* Active Hazards */}
        <span className="badge badge-danger text-[0.68rem] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          {activeHazardsCount} Hazards Active
        </span>

        {/* Python Backend Engine Status */}
        {isBackendOnline ? (
          <span className="badge badge-emerald text-[0.68rem] flex items-center gap-1.5 border-emerald-400/50 bg-emerald-950/40 text-emerald-300 shadow-sm" title="FastAPI Python 3.13 backend connected">
            <Zap className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
            <span>Python Backend: Online</span>
          </span>
        ) : (
          <span className="badge badge-warning text-[0.68rem] flex items-center gap-1.5 border-amber-500/40 bg-amber-950/40 text-amber-300" title="Running in high-speed local engine fallback">
            <Server className="w-3 h-3 text-amber-400" />
            <span>Backend: Local Engine</span>
          </span>
        )}
      </div>

      {/* Action Controls & Emergency Quick Dial */}
      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => setShowHotlines(!showHotlines)}
          className="btn-secondary text-xs py-1.5 px-2.5 text-amber-300 hover:text-amber-200 border-amber-500/30"
          title="Kerala Emergency Helpline Numbers"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">1077 / 112</span>
        </button>

        {/* Hotlines Dropdown */}
        {showHotlines && (
          <div className="absolute top-12 right-0 w-72 glass-panel p-3 border border-amber-500/40 shadow-2xl z-[1000] text-xs space-y-2 animate-in fade-in">
            <div className="font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Kerala Emergency Hotlines</span>
              <span className="text-[0.65rem] text-slate-400">24x7 Control</span>
            </div>
            {KERALA_EMERGENCY_HOTLINES.map(h => (
              <div key={h.number} className="flex items-center justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <div>
                  <div className="font-semibold text-slate-200">{h.name}</div>
                  <div className="text-[0.65rem] text-slate-400">{h.description}</div>
                </div>
                <a
                  href={`tel:${h.number}`}
                  className="px-2 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold rounded border border-amber-500/40 hover:bg-amber-500/30"
                >
                  {h.number}
                </a>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onTogglePlay}
          className={isPlaying ? "btn-danger text-xs py-1.5 px-3" : "btn-primary text-xs py-1.5 px-3"}
          title={isPlaying ? "Pause Simulation" : "Start Live Disaster Simulation"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? 'Pause' : 'Live Sim'}
        </button>

        <button
          onClick={onReset}
          className="btn-secondary text-xs py-1.5 px-2.5"
          title="Reset Simulation Clock & Hazards"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenRoutePlanner}
          className="btn-primary text-xs py-1.5 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 border-emerald-400/40 text-white font-bold"
        >
          <Navigation className="w-3.5 h-3.5" />
          Safe Escape Route
        </button>
      </div>
    </header>
  );
};
