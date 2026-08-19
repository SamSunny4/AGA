import React from 'react';
import { Play, Pause, FastForward, Rewind, CloudRain, Wind, Thermometer, Eye } from 'lucide-react';
import { WeatherCondition } from '../../types/simulation';

interface SimulationBarProps {
  timeHours: number;
  maxHours?: number;
  isPlaying: boolean;
  playbackSpeed: number;
  weather: WeatherCondition;
  onTogglePlay: () => void;
  onTimeChange: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onStep: (deltaHours: number) => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  timeHours,
  maxHours = 24,
  isPlaying,
  playbackSpeed,
  weather,
  onTogglePlay,
  onTimeChange,
  onSpeedChange,
  onStep
}) => {
  const speeds = [1, 2, 5, 10];

  const formatHours = (h: number) => {
    const totalMinutes = Math.round(h * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `Hour ${hrs}h ${mins}m`;
  };

  return (
    <div className="w-full glass-panel px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/80 shadow-xl">
      {/* Playback Controls & Speed */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStep(-0.25)}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Step Back 15m"
        >
          <Rewind className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={`p-2 rounded-xl flex items-center justify-center transition-all shadow-md ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
              : 'bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold shadow-sky-500/30'
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => onStep(0.25)}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Step Forward 15m"
        >
          <FastForward className="w-4 h-4" />
        </button>

        {/* Speed Multiplier Buttons */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 ml-2">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                playbackSpeed === s
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1 flex items-center gap-3 w-full max-w-xl">
        <span className="text-xs font-mono font-semibold text-slate-400 min-w-[70px]">
          {formatHours(timeHours)}
        </span>
        <input
          type="range"
          min="0"
          max={maxHours}
          step="0.05"
          value={timeHours}
          onChange={(e) => onTimeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
        <span className="text-xs font-mono text-slate-500 min-w-[36px]">24h</span>
      </div>

      {/* Weather Telemetry Bar */}
      <div className="flex items-center gap-4 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300" title="Ambient Temperature">
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>{weather.temperatureC}°C</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300" title="Precipitation Rate">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <span>{weather.rainfallMmH} mm/h</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300" title="Wind Velocity">
          <Wind className="w-3.5 h-3.5 text-emerald-400" />
          <span>{weather.windSpeedKmH} km/h</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300" title="Visual Visibility">
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>{weather.visibilityKm} km</span>
        </div>
      </div>
    </div>
  );
};
